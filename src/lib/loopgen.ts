/**
 * Rondrit-generator: vanaf een startpunt een lus van ongeveer X km bouwen
 * (Calimoto's "loop from here", maar dan zonder account en gratis).
 * Puur en alias-vrij — testbaar in node.
 */

import type { Coordinates, Waypoint } from "../types.ts";

/** Deterministische rng (mulberry32) zodat een seed dezelfde lus geeft. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Doelpunt op afstand + peiling vanaf een start (grote-cirkel, graden). */
export function destinationPoint(
  start: Coordinates,
  bearingDeg: number,
  distKm: number
): Coordinates {
  const R = 6371;
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (start.lat * Math.PI) / 180;
  const lng1 = (start.lng * Math.PI) / 180;
  const dr = distKm / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(br)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(dr) * Math.cos(lat1),
      Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (((lng2 * 180) / Math.PI + 540) % 360) - 180 };
}

/** Aantal lusankers op basis van de lengte. */
export function loopAnchorCount(km: number): number {
  if (km <= 60) return 6;
  if (km <= 150) return 8;
  return 10;
}

/**
 * Bouwt waypoints voor een lus van ongeveer `km` kilometer rond `start`:
 * start + ankers op een cirkel (straal km/2pi) met jitter, eindigend weer
 * op de start. De routing-engine legt alles daarna op echte wegen.
 */
export function generateLoopWaypoints(
  start: Coordinates,
  km: number,
  seed = 42,
  startName = "Startpunt"
): Waypoint[] {
  const rng = mulberry32(seed);
  const n = loopAnchorCount(km);
  const radius = km / (2 * Math.PI);

  const wps: Waypoint[] = [
    { id: "loop-0", name: startName, coordinates: start },
  ];
  for (let i = 1; i < n; i++) {
    const hoek = (360 / n) * i + (rng() - 0.5) * 36;
    const afstand = radius * (0.82 + rng() * 0.33);
    wps.push({
      id: `loop-${i}`,
      name: `Luspunt ${i}`,
      coordinates: destinationPoint(start, hoek, afstand),
    });
  }
  wps.push({ id: `loop-${n}`, name: `${startName} (einde)`, coordinates: start });
  return wps;
}
