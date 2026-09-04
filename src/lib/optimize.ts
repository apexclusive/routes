/**
 * Volgorde-optimalisatie voor routepunten ("travelling salesman", klein).
 *
 * Start- en eindpunt blijven staan waar ze staan — dat is bewust: je kiest je
 * vertrek en bestemming zelf, en bij een rondrit vallen die twee samen. Alleen
 * de tussenpunten worden herschikt.
 *
 * Aanpak: nearest-neighbour voor een fatsoenlijke startvolgorde, daarna 2-opt
 * (segmenten omdraaien zolang dat korter wordt). Voor de aantallen waar het
 * hier om gaat (< 25 punten) is dat binnen milliseconden optimaal genoeg; het
 * rekenbudget is een vangnet, geen normale afbreking.
 */
import type { Coordinates } from "@/types";

export const DEFAULT_TIME_BUDGET_MS = 1000;
/** Onder dit aantal punten valt er niets te herschikken. */
export const MIN_POINTS = 4;

export interface OptimizeResult {
  /** Nieuwe volgorde als indices in de originele lijst. */
  order: number[];
  /** Hemelsbrede lengte vóór en na, in kilometers. */
  before: number;
  after: number;
  improved: boolean;
}

function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function buildMatrix(points: Coordinates[]): number[][] {
  const n = points.length;
  const m: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineKm(points[i], points[j]);
      m[i][j] = d;
      m[j][i] = d;
    }
  }
  return m;
}

export function tourLength(order: number[], matrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) total += matrix[order[i]][order[i + 1]];
  return total;
}

/**
 * Herschikt de tussenpunten zodat de route korter wordt. Eerste en laatste punt
 * blijven op hun plek.
 */
export function optimizeWaypointOrder(
  points: Coordinates[],
  timeBudgetMs = DEFAULT_TIME_BUDGET_MS
): OptimizeResult {
  const n = points.length;
  const identity = Array.from({ length: n }, (_, i) => i);
  if (n < MIN_POINTS) {
    return { order: identity, before: 0, after: 0, improved: false };
  }

  const matrix = buildMatrix(points);
  const before = tourLength(identity, matrix);

  // 1) nearest neighbour over de vrije tussenpunten
  const last = n - 1;
  const free = identity.slice(1, last);
  const order = [0];
  const remaining = new Set(free);
  let current = 0;
  while (remaining.size > 0) {
    let best = -1;
    let bestDistance = Infinity;
    for (const candidate of remaining) {
      const d = matrix[current][candidate];
      if (d < bestDistance) {
        bestDistance = d;
        best = candidate;
      }
    }
    order.push(best);
    remaining.delete(best);
    current = best;
  }
  order.push(last);

  // 2) 2-opt: blijf segmenten omdraaien zolang dat winst oplevert
  const deadline = Date.now() + Math.max(0, timeBudgetMs);
  // winst kleiner dan een meter is afrondingsruis, niet het omdraaien waard
  const EPSILON = 1e-3;
  let improvedAny = true;
  while (improvedAny) {
    improvedAny = false;
    for (let i = 1; i < order.length - 2; i++) {
      if (Date.now() > deadline) break;
      for (let j = i + 1; j < order.length - 1; j++) {
        const a = order[i - 1];
        const b = order[i];
        const c = order[j];
        const d = order[j + 1];
        const delta = matrix[a][c] + matrix[b][d] - (matrix[a][b] + matrix[c][d]);
        if (delta < -EPSILON) {
          // segment i..j omdraaien
          let lo = i;
          let hi = j;
          while (lo < hi) {
            const tmp = order[lo];
            order[lo] = order[hi];
            order[hi] = tmp;
            lo++;
            hi--;
          }
          improvedAny = true;
        }
      }
    }
    if (Date.now() > deadline) break;
  }

  const after = tourLength(order, matrix);
  return {
    order,
    before,
    after,
    improved: after < before - EPSILON,
  };
}
