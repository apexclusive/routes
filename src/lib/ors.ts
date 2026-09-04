/**
 * OpenRouteService → het OSRM-formaat dat de rest van de app al spreekt.
 *
 * Waarom: de publieke OSRM-demo draait alleen het driving-profiel, dus fiets-
 * en wandelroutes vielen terug op een hemelsbrede schatting. ORS heeft wél
 * `cycling-regular` en `foot-walking`. Door het antwoord om te zetten naar de
 * OSRM-vorm blijft alles er achter ongewijzigd: buildTurnByTurn maakt er
 * gewoon Nederlandse instructies van, en de kaart tekent dezelfde geometrie.
 *
 * ORS geeft de manoeuvre als getal (0–13) in plaats van een OSRM-`type`/
 * `modifier`-paar; die vertaling zit in MANEUVER_BY_TYPE.
 */
import type { GeoJSON } from "@/types";

export const ORS_PROFILES: Record<string, string> = {
  bike: "cycling-regular",
  foot: "foot-walking",
};

export interface ORSStep {
  distance?: number;
  duration?: number;
  type?: number;
  instruction?: string;
  name?: string;
  exit_number?: number;
  way_points?: number[];
}

export interface ORSFeature {
  geometry?: { type?: string; coordinates?: unknown };
  properties?: {
    summary?: { distance?: number; duration?: number };
    segments?: { distance?: number; duration?: number; steps?: ORSStep[] }[];
  };
}

export interface ORSResponse {
  features?: ORSFeature[];
}

export interface ConvertedRoute {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
  legs: {
    steps: {
      maneuver: { type: string; modifier?: string; exit?: number; location: [number, number] };
      distance: number;
      duration: number;
      name?: string;
      instruction: string;
    }[];
  }[];
}

/** ORS-manoeuvrecodes → OSRM-type/modifier. */
const MANEUVER_BY_TYPE: Record<number, { type: string; modifier?: string }> = {
  0: { type: "turn", modifier: "left" },
  1: { type: "turn", modifier: "right" },
  2: { type: "turn", modifier: "sharp left" },
  3: { type: "turn", modifier: "sharp right" },
  4: { type: "turn", modifier: "slight left" },
  5: { type: "turn", modifier: "slight right" },
  6: { type: "continue", modifier: "straight" },
  7: { type: "roundabout", modifier: "right" },
  8: { type: "exit roundabout", modifier: "right" },
  9: { type: "turn", modifier: "uturn" },
  10: { type: "arrive" },
  11: { type: "depart" },
  12: { type: "fork", modifier: "slight left" },
  13: { type: "fork", modifier: "slight right" },
};

function isPosition(p: unknown): p is [number, number] {
  return (
    Array.isArray(p) &&
    p.length >= 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1]) &&
    Math.abs(p[0]) <= 180 &&
    Math.abs(p[1]) <= 90
  );
}

/**
 * Zet een ORS-GeoJSON-antwoord om. Geeft null als er geen bruikbare route in
 * zit — de aanroeper valt dan terug op het bestaande gedrag.
 */
export function orsToRoute(data: ORSResponse | null | undefined): ConvertedRoute | null {
  const feature = data?.features?.[0];
  const rawCoords = feature?.geometry?.coordinates;
  if (!Array.isArray(rawCoords)) return null;

  const coordinates = rawCoords.filter(isPosition) as GeoJSON.Position[];
  if (coordinates.length < 2) return null;

  const segments = feature?.properties?.segments ?? [];
  const summary = feature?.properties?.summary;

  // som van de segmenten is de betrouwbaarste bron; summary als terugval
  const summed = segments.reduce<{ distance: number; duration: number }>(
    (acc, s) => ({
      distance: acc.distance + (s.distance ?? 0),
      duration: acc.duration + (s.duration ?? 0),
    }),
    { distance: 0, duration: 0 }
  );
  const distance = summed.distance || summary?.distance || 0;
  const duration = summed.duration || summary?.duration || 0;

  const legs = segments.map((segment) => ({
    steps: (segment.steps ?? []).map((step) => {
      const maneuver = MANEUVER_BY_TYPE[step.type ?? -1] ?? {
        type: "continue",
        modifier: "straight",
      };
      // way_points[0] wijst naar de index in de geometrie waar de stap begint
      const index = step.way_points?.[0];
      const at =
        typeof index === "number" && index >= 0 && index < coordinates.length
          ? coordinates[index]
          : coordinates[0];

      return {
        maneuver: {
          type: maneuver.type,
          modifier: maneuver.modifier,
          exit: step.exit_number,
          location: [at[0], at[1]] as [number, number],
        },
        distance: step.distance ?? 0,
        duration: step.duration ?? 0,
        name: step.name && step.name !== "-" ? step.name : undefined,
        instruction: step.instruction ?? "",
      };
    }),
  }));

  return {
    distance,
    duration,
    geometry: { type: "LineString", coordinates },
    legs,
  };
}
