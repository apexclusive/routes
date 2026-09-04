/**
 * POI's langs de route (tankstation, laadpaal, eetgelegenheid) via de
 * Overpass API — open, gratis en zonder key.
 *
 * Aanpak: van de routegeometrie wordt een bbox afgeleid met marge; Overpass
 * geeft alle relevante nodes in die box terug; daarna filtert de client op
 * werkelijke afstand tot de routelijn (<= corridorKm), zodat je alleen
 * POI's ziet die écht onderweg zijn.
 */
import type { GeoJSON } from "@/types";

export type PoiKind = "fuel" | "charging" | "food" | "viewpoint";

export interface RoutePoi {
  id: number;
  kind: PoiKind;
  lat: number;
  lng: number;
  name: string;
  /** afstand tot de routelijn in meters */
  distanceM: number;
}

export const CORRIDOR_KM = 2;
/** Overpass terughoudend houden: maximaal dit aantal resultaten. */
export const MAX_POIS = 150;

export function bboxFromGeometry(
  geometry: GeoJSON.LineString
): { south: number; west: number; north: number; east: number } | null {
  if (geometry.coordinates.length === 0) return null;
  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;
  for (const c of geometry.coordinates) {
    if (c[1] < south) south = c[1];
    if (c[1] > north) north = c[1];
    if (c[0] < west) west = c[0];
    if (c[0] > east) east = c[0];
  }
  return { south, west, north, east };
}

/** Overpass QL voor de gevraagde soorten binnen de bbox. */
export function buildOverpassQuery(
  bbox: { south: number; west: number; north: number; east: number },
  kinds: PoiKind[]
): string {
  const selectors: string[] = [];
  if (kinds.includes("fuel")) selectors.push('node["amenity"="fuel"]');
  if (kinds.includes("charging")) {
    selectors.push('node["amenity"="charging_station"]');
  }
  if (kinds.includes("food")) {
    selectors.push('node["amenity"="cafe"]');
    selectors.push('node["amenity"="restaurant"]');
    selectors.push('node["amenity"="fast_food"]');
  }
  if (kinds.includes("viewpoint")) {
    selectors.push('node["tourism"="viewpoint"]');
    selectors.push('node["tourism"="picnic_site"]');
  }
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const unions = selectors.map((s) => `${s}(${b});`).join("");
  return `[out:json][timeout:20];(${unions});out body ${MAX_POIS};`;
}

/** Hemelsbrede afstand (m) van een punt tot de dichtstbijzijnde routepunt. */
export function distanceToRouteM(
  lat: number,
  lng: number,
  geometry: GeoJSON.LineString
): number {
  const cs = geometry.coordinates;
  // max ~200 samples, maar korte lijnen worden volledig bekeken (geen gaten)
  const step = Math.max(1, Math.ceil(cs.length / 200));
  let best = Infinity;
  for (let i = 0; i < cs.length; i += step) {
    const d = haversineM(lat, lng, cs[i][1], cs[i][0]);
    if (d < best) best = d;
  }
  // altijd het laatste punt meetellen (i += step kan het overslaan)
  const dLast = haversineM(lat, lng, cs[cs.length - 1][1], cs[cs.length - 1][0]);
  return Math.min(best, dLast);
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dφ = p2 - p1;
  const dλ = ((lng2 - lng1) * Math.PI) / 180;
  const h =
    Math.sin(dφ / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

/**
 * Haalt POI's binnen de bbox op via onze server-proxy en filtert ze op
 * afstand tot de routelijn. Geeft [] bij een onbereikbare dienst — POI's zijn
 * een extraatje, nooit een blokkade.
 */
/** Eén poging POST naar de POI-proxy. */
async function postPois(
  bbox: ReturnType<typeof bboxFromGeometry>,
  kinds: PoiKind[]
): Promise<Response | null> {
  try {
    const res = await fetch("/api/pois", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bbox, kinds }),
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

export async function fetchRoutePois(
  geometry: GeoJSON.LineString,
  kinds: PoiKind[],
  /** wachttijd tussen pogingen (ms) — laag in tests */
  retryDelayMs = 1200,
  maxAttempts = 2
): Promise<RoutePoi[]> {
  const bbox = bboxFromGeometry(geometry);
  if (!bbox || kinds.length === 0) return [];

  try {
    let res: Response | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      res = await postPois(bbox, kinds);
      if (res) break;
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }
    if (!res) return [];
    const data = (await res.json()) as { elements?: OverpassResponse["elements"] };
    const elements = Array.isArray(data.elements) ? data.elements : [];

    const pois: RoutePoi[] = [];
    for (const el of elements) {
      if (typeof el.lat !== "number" || typeof el.lon !== "number") continue;
      const tags = el.tags ?? {};
      let kind: PoiKind | null = null;
      if (tags.amenity === "fuel") kind = "fuel";
      else if (tags.amenity === "charging_station") kind = "charging";
      else if (
        tags.amenity === "restaurant" ||
        tags.amenity === "cafe" ||
        tags.amenity === "fast_food"
      )
        kind = "food";
      if (!kind) continue;

      const distanceM = distanceToRouteM(el.lat, el.lon, geometry);
      if (distanceM > CORRIDOR_KM * 1000) continue;

      pois.push({
        id: el.id,
        kind,
        lat: el.lat,
        lng: el.lon,
        name:
          tags.brand ||
          tags.name ||
          (kind === "fuel"
            ? "Tankstation"
            : kind === "charging"
              ? "Laadpaal"
              : "Eetgelegenheid"),
        distanceM: Math.round(distanceM),
      });
    }

    // dichtst bij de route eerst, en per soort plafond
    pois.sort((a, b) => a.distanceM - b.distanceM);
    return pois.slice(0, MAX_POIS);
  } catch {
    return [];
  }
}

/** Gemeenschappelijke SVG-openingstag (lucide-stijl: lijn, geen fill). */
const SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

const POI_SVGS: Record<PoiKind, string> = {
  fuel: `${SVG}<path d="M3 22h12"/><path d="M4 9h10v13H4z"/><path d="M14 8l3-3 3 3v9a2 2 0 0 1-2 2"/><path d="M7 13h4"/></svg>`,
  charging: `${SVG}<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  food: `${SVG}<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  viewpoint: `${SVG}<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
};

/** Lijn-icoon (inline SVG, lucide-stijl) voor op de kaart en in popups. */
export function poiIcon(kind: PoiKind): string {
  return POI_SVGS[kind];
}
