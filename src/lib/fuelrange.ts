/**
 * Tankbereik-advies: waarschuwt als de route langer is dan het bereik van
 * het voertuig — met fietskennis (0 = nooit tanken).
 */

import type { VehicleType } from "../types.ts";

/** Richtbereik per voertuig (km) — bewust conservatief. */
export const TANK_RANGE_KM: Record<VehicleType, number> = {
  motorcycle: 250,
  car: 650,
  bicycle: 0,
  pedestrian: 0,
};

export interface FuelAdvice {
  /** true als een tankstop gepland moet worden */
  needed: boolean;
  /** gebruikte bereik-schatting (km; 0 = niet van toepassing) */
  rangeKm: number;
}

/** Waarschuw vanaf 90% van het bereik — liever te vroeg dan stranden. */
export function fuelAdvice(vehicle: VehicleType, distanceKm: number): FuelAdvice {
  const rangeKm = TANK_RANGE_KM[vehicle] ?? 0;
  return { needed: rangeKm > 0 && distanceKm > rangeKm * 0.9, rangeKm };
}
