/**
 * Zwaarte-indicatie (Komoot-stijl): klimometers tegenover de afstand,
 * met strengere drempels voor fietsers en wandelaars.
 */

import type { VehicleType } from "../types.ts";

export type DifficultyLevel = "flat" | "rolling" | "hilly" | "mountain";

/** Drempels in hoogtemeters per km (bovengrens per niveau). */
const THRESHOLDS: Record<VehicleType, [number, number, number]> = {
  // auto/motor verdragen meer klimwerk voordat het "zwaar" voelt
  car: [5, 12, 20],
  motorcycle: [5, 12, 20],
  bicycle: [3, 8, 14],
  pedestrian: [4, 10, 16],
};

export function difficultyLevel(
  vehicle: VehicleType,
  distanceKm: number,
  ascentM: number
): DifficultyLevel {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return "flat";
  const perKm = ascentM / distanceKm;
  const [flat, rolling, hilly] = THRESHOLDS[vehicle] ?? THRESHOLDS.car;
  if (perKm <= flat) return "flat";
  if (perKm <= rolling) return "rolling";
  if (perKm <= hilly) return "hilly";
  return "mountain";
}
