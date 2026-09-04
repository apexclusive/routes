/**
 * Deel-links: een route wordt volledig in de URL-hash gecodeerd, zonder server
 * en zonder account. Twee lagen compressie houden de link hanteerbaar:
 *
 *  1. de geometrie gaat als *encoded polyline* (precisie 5 decimalen ≈ 1 m) —
 *     dat is ~10× compacter dan JSON met losse getallen;
 *  2. wordt de link toch te lang (browsers/chatapps kappen ergens rond de 8 kB),
 *     dan vervalt de geometrie en delen we alleen de routepunten. De ontvanger
 *     berekent de route dan opnieuw — zelfde route, iets meer wachttijd.
 */
import type { Coordinates, GeoJSON, VehicleType } from "@/types";

/** Ruim onder de praktische URL-limiet van browsers en chat-apps. */
export const MAX_HASH_LENGTH = 6000;

export interface SharePayload {
  /** formaatversie, zodat oude links later herkenbaar blijven */
  v: 1;
  /** routenaam */
  n: string;
  /** vervoermiddel */
  m: VehicleType;
  /** waypoints als [lat, lng, naam?] */
  w: [number, number, string?][];
  /** geometrie als encoded polyline (optioneel) */
  g?: string;
  /** was dit een geïmporteerde track? dan zijn de ankers leidend voor Google */
  i?: 1;
}

export interface ShareableRoute {
  name: string;
  vehicle: VehicleType;
  waypoints: { name: string; coordinates: Coordinates }[];
  geometry?: GeoJSON.LineString;
  imported?: boolean;
}

/* ---------- encoded polyline (Google-formaat, precisie 5) ---------- */

export function encodePolyline(coords: GeoJSON.Position[], precision = 5): string {
  const factor = Math.pow(10, precision);
  let out = "";
  let prevLat = 0;
  let prevLng = 0;

  const chunk = (value: number): void => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    while (v >= 0x20) {
      out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    out += String.fromCharCode(v + 63);
  };

  for (const c of coords) {
    const lat = Math.round(c[1] * factor);
    const lng = Math.round(c[0] * factor);
    chunk(lat - prevLat);
    chunk(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return out;
}

export function decodePolyline(str: string, precision = 5): GeoJSON.Position[] {
  const factor = Math.pow(10, precision);
  const coords: GeoJSON.Position[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < str.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = str.charCodeAt(index++) - 63;
      if (Number.isNaN(byte)) return coords;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      if (Number.isNaN(byte)) return coords;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([
      Number((lng / factor).toFixed(precision)),
      Number((lat / factor).toFixed(precision)),
    ] as GeoJSON.Position);
  }
  return coords;
}

/* ---------- base64url zonder afhankelijkheden ---------- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* ---------- coderen / decoderen ---------- */

/**
 * Zet een route om in een hash-fragment. Past de geometrie er niet in, dan
 * vallen we terug op alleen de routepunten (`geometryIncluded: false`).
 */
export function encodeRoute(route: ShareableRoute): {
  hash: string;
  geometryIncluded: boolean;
} {
  const base: SharePayload = {
    v: 1,
    n: route.name.slice(0, 80),
    m: route.vehicle,
    w: route.waypoints.map(
      (w) =>
        [
          Number(w.coordinates.lat.toFixed(5)),
          Number(w.coordinates.lng.toFixed(5)),
          w.name.slice(0, 40),
        ] as [number, number, string?]
    ),
  };
  if (route.imported) base.i = 1;

  if (route.geometry && route.geometry.coordinates.length > 1) {
    const withGeometry: SharePayload = {
      ...base,
      g: encodePolyline(route.geometry.coordinates),
    };
    const hash = toBase64Url(JSON.stringify(withGeometry));
    if (hash.length <= MAX_HASH_LENGTH) {
      return { hash, geometryIncluded: true };
    }
  }

  return { hash: toBase64Url(JSON.stringify(base)), geometryIncluded: false };
}

/** Leest een hash terug. Onbekend of kapot formaat → null (nooit een throw). */
export function decodeRoute(hash: string): ShareableRoute | null {
  const raw = hash.replace(/^#/, "").replace(/^r=/, "");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(raw)) as Partial<SharePayload>;
    if (parsed.v !== 1 || !Array.isArray(parsed.w) || parsed.w.length < 2) return null;

    const waypoints = parsed.w
      .filter(
        (w) =>
          Array.isArray(w) &&
          Number.isFinite(w[0]) &&
          Number.isFinite(w[1]) &&
          Math.abs(w[0]) <= 90 &&
          Math.abs(w[1]) <= 180
      )
      .map((w, i) => ({
        name: typeof w[2] === "string" && w[2] ? w[2] : `Punt ${i + 1}`,
        coordinates: { lat: w[0], lng: w[1] },
      }));
    if (waypoints.length < 2) return null;

    const coords = parsed.g ? decodePolyline(parsed.g) : [];
    return {
      name: typeof parsed.n === "string" && parsed.n ? parsed.n : "Gedeelde route",
      vehicle: (parsed.m ?? "car") as VehicleType,
      waypoints,
      geometry:
        coords.length > 1 ? { type: "LineString", coordinates: coords } : undefined,
      imported: parsed.i === 1,
    };
  } catch {
    return null;
  }
}

/** Volledige deel-URL op basis van de huidige pagina. */
export function buildShareUrl(origin: string, pathname: string, hash: string): string {
  return `${origin}${pathname}#r=${hash}`;
}

/* ---------- social-share links (mond-tot-mond) ---------- */

export type ShareDoelen = {
  x: string;
  whatsapp: string;
  facebook: string;
  mail: string;
};

export function buildShareUrls(titel: string, url: string, tekst?: string): ShareDoelen {
  const t = encodeURIComponent(titel);
  const u = encodeURIComponent(url);
  const te = encodeURIComponent(tekst ?? titel);
  return {
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    whatsapp: `https://wa.me/?text=${te}%20${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    mail: `mailto:?subject=${t}&body=${te}%0A%0A${u}`,
  };
}
