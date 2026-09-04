/**
 * Deel-afbeelding (REVER-stijl): route als social-card. De geometrie-transformatie
 * is puur zodat die testbaar is; het tekenwerk gebeurt in het canvas-component.
 */

import type { Coordinates } from "../types.ts";

export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Past een routelijn in een canvas van w×h met padding: behoudt de verhouding
 * (uniforme schaal), centreert de route en spiegelt de y-as (canvas y groeit omlaag).
 */
export function lineStringToCanvasPoints(
  coords: Coordinates[],
  w: number,
  h: number,
  pad = 60
): CanvasPoint[] {
  if (coords.length < 2 || w <= pad * 2 || h <= pad * 2) return [];
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const c of coords) {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  }
  const spanLat = Math.max(maxLat - minLat, 1e-9);
  const spanLng = Math.max(maxLng - minLng, 1e-9);
  const scale = Math.min((w - pad * 2) / spanLng, (h - pad * 2) / spanLat);
  const usedW = spanLng * scale;
  const usedH = spanLat * scale;
  const offX = (w - usedW) / 2;
  const offY = (h - usedH) / 2;
  return coords.map((c) => ({
    x: offX + (c.lng - minLng) * scale,
    y: offY + (maxLat - c.lat) * scale, // y omlaag = zuidwaarts
  }));
}
