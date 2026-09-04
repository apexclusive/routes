/**
 * Hoogteprofiel: bemonstert de routegeometrie, haalt de hoogtes op via
 * /api/elevation (Open-Meteo, gratis) en rekent klim- en daalmeters uit.
 *
 * Klimmeters zijn gevoelig voor ruis: bij een profiel met 100 punten telt elke
 * kleine hobbel mee en krijg je onrealistisch hoge totalen. We negeren daarom
 * hoogteverschillen onder een drempel (hysterese), zoals fietscomputers dat ook
 * doen.
 */
import type { GeoJSON } from "@/types";

/** Onder deze drempel (meters) telt een stijging of daling niet mee. */
export const NOISE_THRESHOLD_M = 4;
/** Open-Meteo accepteert maximaal 100 coördinaten per aanvraag. */
export const MAX_SAMPLES = 100;
/** Onder deze afstand is een profiel niet interessant. */
export const MIN_DISTANCE_M = 3000;

export interface ElevationPoint {
  /** afstand vanaf de start, in meters */
  distance: number;
  /** hoogte in meters boven zeeniveau */
  elevation: number;
}

export interface ElevationProfile {
  points: ElevationPoint[];
  ascent: number;
  descent: number;
  min: number;
  max: number;
}

function distanceM(a: GeoJSON.Position, b: GeoJSON.Position): number {
  const R = 6371000;
  const φ1 = (a[1] * Math.PI) / 180;
  const φ2 = (b[1] * Math.PI) / 180;
  const dφ = φ2 - φ1;
  const dλ = ((b[0] - a[0]) * Math.PI) / 180;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Kiest maximaal `max` punten op gelijke afstand van elkaar; start en eind gaan
 * altijd mee. Geeft ook de afstand-vanaf-start per gekozen punt terug.
 */
export function sampleAlongGeometry(
  geometry: GeoJSON.LineString,
  max = MAX_SAMPLES
): { positions: GeoJSON.Position[]; distances: number[]; total: number } {
  const cs = geometry.coordinates;
  if (cs.length === 0) return { positions: [], distances: [], total: 0 };
  if (cs.length === 1) return { positions: [cs[0]], distances: [0], total: 0 };

  const cum: number[] = [0];
  for (let i = 1; i < cs.length; i++) {
    cum.push(cum[i - 1] + distanceM(cs[i - 1], cs[i]));
  }
  const total = cum[cum.length - 1];

  if (cs.length <= max) {
    return { positions: [...cs], distances: [...cum], total };
  }

  const positions: GeoJSON.Position[] = [cs[0]];
  const distances: number[] = [0];
  const step = total / (max - 1);
  let idx = 1;
  for (let k = 1; k < max - 1; k++) {
    const target = step * k;
    while (idx < cs.length - 1 && cum[idx] < target) idx++;
    positions.push(cs[idx]);
    distances.push(cum[idx]);
  }
  positions.push(cs[cs.length - 1]);
  distances.push(total);
  return { positions, distances, total };
}

/**
 * Klim- en daalmeters met ruisonderdrukking: een richtingsomslag telt pas mee
 * als het verschil met het laatste omslagpunt groter is dan de drempel.
 */
export function summarizeElevation(
  distances: number[],
  elevations: number[],
  threshold = NOISE_THRESHOLD_M
): ElevationProfile {
  const n = Math.min(distances.length, elevations.length);
  const points: ElevationPoint[] = [];
  for (let i = 0; i < n; i++) {
    if (Number.isFinite(elevations[i])) {
      points.push({ distance: distances[i], elevation: elevations[i] });
    }
  }
  if (points.length === 0) {
    return { points: [], ascent: 0, descent: 0, min: 0, max: 0 };
  }

  let ascent = 0;
  let descent = 0;
  let anchor = points[0].elevation;
  let extreme = points[0].elevation;
  let direction: 0 | 1 | -1 = 0;
  let min = points[0].elevation;
  let max = points[0].elevation;

  for (const p of points) {
    const e = p.elevation;
    if (e < min) min = e;
    if (e > max) max = e;

    if (direction === 0) {
      if (e - anchor > threshold) {
        direction = 1;
        extreme = e;
      } else if (anchor - e > threshold) {
        direction = -1;
        extreme = e;
      } else {
        continue;
      }
    } else if (direction === 1) {
      if (e > extreme) {
        extreme = e;
      } else if (extreme - e > threshold) {
        ascent += extreme - anchor;
        anchor = extreme;
        direction = -1;
        extreme = e;
      }
    } else {
      if (e < extreme) {
        extreme = e;
      } else if (e - extreme > threshold) {
        descent += anchor - extreme;
        anchor = extreme;
        direction = 1;
        extreme = e;
      }
    }
  }

  // laatste openstaande beweging afsluiten
  if (direction === 1 && extreme > anchor) ascent += extreme - anchor;
  if (direction === -1 && anchor > extreme) descent += anchor - extreme;

  return {
    points,
    ascent: Math.round(ascent),
    descent: Math.round(descent),
    min: Math.round(min),
    max: Math.round(max),
  };
}

/**
 * SVG-pad voor het profiel. Geeft zowel de lijn als het gevulde vlak terug,
 * geschaald naar een viewBox van `width` × `height`.
 */
export function buildProfilePath(
  profile: ElevationProfile,
  width: number,
  height: number
): { line: string; area: string } {
  const pts = profile.points;
  if (pts.length < 2) return { line: "", area: "" };

  const totalDistance = pts[pts.length - 1].distance || 1;
  // altijd wat lucht boven en onder, ook bij een vlakke route
  const span = Math.max(profile.max - profile.min, 10);
  const x = (d: number) => (d / totalDistance) * width;
  const y = (e: number) => height - ((e - profile.min) / span) * (height - 2) - 1;

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.distance).toFixed(1)},${y(p.elevation).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

/**
 * Haalt het profiel op voor een geometrie. Geeft null bij korte routes of een
 * onbereikbare dienst — het profiel is een extraatje, nooit een blokkade.
 */
export async function fetchElevationProfile(
  geometry: GeoJSON.LineString,
  signal?: AbortSignal
): Promise<ElevationProfile | null> {
  const { positions, distances, total } = sampleAlongGeometry(geometry);
  if (positions.length < 2 || total < MIN_DISTANCE_M) return null;

  try {
    const res = await fetch("/api/elevation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: positions }),
      signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { code?: string; elevation?: number[] };
    if (data.code !== "Ok" || !Array.isArray(data.elevation)) return null;
    return summarizeElevation(distances, data.elevation);
  } catch {
    return null;
  }
}
