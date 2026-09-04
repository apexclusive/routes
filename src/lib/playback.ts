/**
 * Demo-rit (playback): rijdt virtueel over de routegeometrie met een
 * realistische snelheid, zodat je de rit vooraf kunt "proefrijden" met
 * afslagbanners en gesproken instructies. Pure wiskunde, goed testbaar.
 */

export type LatLon = [number, number]; // [lat, lng]

/** Cumulatieve afstanden (meters) per punt, met haversine. */
export function cumulativeDistances(coords: LatLon[]): number[] {
  const cum = new Array<number>(coords.length);
  cum[0] = 0;
  for (let i = 1; i < coords.length; i++) {
    cum[i] = cum[i - 1] + haversineM(coords[i - 1], coords[i]);
  }
  return cum;
}

function haversineM(a: LatLon, b: LatLon): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface RidePosition {
  lat: number;
  lng: number;
  /** richting in graden (0 = noord, 90 = oost) voor het koppige marker-icoon */
  bearing: number;
  /** voortgang 0..1 over de hele route */
  progress: number;
}

/** Interpoleert de positie op afstand d (meters) langs de polylijn. */
export function positionAtDistance(
  coords: LatLon[],
  cum: number[],
  d: number
): RidePosition | null {
  if (coords.length < 2) return null;
  const total = cum[cum.length - 1];
  if (total <= 0) return null;
  const dist = Math.max(0, Math.min(d, total));

  // binaire zoektocht naar het segment
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= dist) lo = mid;
    else hi = mid;
  }
  const segLen = cum[hi] - cum[lo] || 1;
  const t = (dist - cum[lo]) / segLen;
  const lat = coords[lo][0] + (coords[hi][0] - coords[lo][0]) * t;
  const lng = coords[lo][1] + (coords[hi][1] - coords[lo][1]) * t;
  return {
    lat,
    lng,
    bearing: bearingDeg(coords[lo], coords[hi]),
    progress: dist / total,
  };
}

/** Kompasrichting van a naar b in graden (0 = noord, 90 = oost). */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Totale lengte in meters. */
export function totalDistanceM(cum: number[]): number {
  return cum.length ? cum[cum.length - 1] : 0;
}

/** Basis-snelheden per vervoermiddel in m/s (aangenomen gemiddelde). */
export function rideSpeedMps(vehicle: string): number {
  switch (vehicle) {
    case "pedestrian":
      return 1.4;
    case "bicycle":
      return 5.5;
    case "motorcycle":
      return 16.7; // ~60 km/u door bochtig gebied
    default:
      return 13.9; // ~50 km/u
  }
}

/** Zoekt de eerstvolgende afslag na afstand d; Geeft null bij geen vervolg. */
export function nextTurnAfter<T extends { distanceFromStart: number }>(
  turns: T[],
  d: number
): { turn: T; aheadM: number } | null {
  for (const turn of turns) {
    if (turn.distanceFromStart > d) {
      return { turn, aheadM: turn.distanceFromStart - d };
    }
  }
  return null;
}
