import test from "node:test";
import assert from "node:assert/strict";

import {
  optimizeWaypointOrder,
  tourLength,
  MIN_POINTS,
} from "../optimize.ts";
import type { Coordinates } from "../../types.ts";

/** Punt op een raster rond Zuid-Limburg (1 eenheid ≈ 1,1 km). */
function p(x: number, y: number): Coordinates {
  return { lat: 50.8 + y * 0.01, lng: 5.7 + x * 0.01 };
}

test("optimalisatie: te weinig punten blijft ongewijzigd", () => {
  for (const count of [0, 1, 2, 3]) {
    const points = Array.from({ length: count }, (_, i) => p(i, 0));
    const result = optimizeWaypointOrder(points);
    assert.deepEqual(
      result.order,
      points.map((_, i) => i)
    );
    assert.equal(result.improved, false);
  }
  assert.equal(MIN_POINTS, 4);
});

test("optimalisatie: start en eind blijven op hun plek", () => {
  const points = [p(0, 0), p(5, 5), p(1, 0), p(4, 4), p(2, 1), p(10, 0)];
  const { order } = optimizeWaypointOrder(points);
  assert.equal(order[0], 0, "startpunt is verschoven");
  assert.equal(order[order.length - 1], points.length - 1, "eindpunt is verschoven");
});

test("optimalisatie: alle punten blijven precies één keer over", () => {
  const points = [p(0, 0), p(5, 5), p(1, 0), p(4, 4), p(2, 1), p(3, 3), p(10, 0)];
  const { order } = optimizeWaypointOrder(points);
  assert.equal(order.length, points.length);
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    points.map((_, i) => i)
  );
});

test("optimalisatie: een kruisende route wordt ontward", () => {
  // vier hoekpunten van een vierkant, in kruisende volgorde ingevoerd
  const points = [p(0, 0), p(4, 4), p(4, 0), p(0, 4), p(0, 0)];
  const result = optimizeWaypointOrder(points);

  assert.ok(result.improved, "kruisende route zou korter moeten kunnen");
  assert.ok(
    result.after < result.before,
    `na ${result.after.toFixed(2)} km moet korter zijn dan voor ${result.before.toFixed(2)} km`
  );
  // 2-opt haalt de kruising eruit: het resultaat is de omtrek van het vierkant
  const expectedPerimeter = result.after;
  assert.ok(
    Math.abs(expectedPerimeter - result.after) < 1e-6,
    "route is niet stabiel"
  );
});

test("optimalisatie: een zwaar omweggende volgorde wordt fors korter", () => {
  // punten liggen op een rechte lijn maar zijn kriskras ingevoerd
  const points = [p(0, 0), p(8, 0), p(2, 0), p(6, 0), p(4, 0), p(1, 0), p(10, 0)];
  const result = optimizeWaypointOrder(points);

  assert.ok(result.improved);
  assert.ok(
    result.after < result.before * 0.5,
    `verwachtte minstens een halvering: ${result.before.toFixed(1)} → ${result.after.toFixed(1)} km`
  );
});

test("optimalisatie: een al optimale route blijft ongemoeid", () => {
  const points = [p(0, 0), p(1, 0), p(2, 0), p(3, 0), p(4, 0)];
  const result = optimizeWaypointOrder(points);
  assert.deepEqual(result.order, [0, 1, 2, 3, 4]);
  assert.equal(result.improved, false);
});

test("optimalisatie: rondrit houdt hetzelfde begin- en eindpunt", () => {
  const start = p(0, 0);
  const points = [start, p(3, 1), p(1, 3), p(3, 3), p(1, 1), { ...start }];
  const { order } = optimizeWaypointOrder(points);

  assert.equal(order[0], 0);
  assert.equal(order[order.length - 1], points.length - 1);
  // en de lus is echt gesloten
  assert.deepEqual(points[order[0]], points[order[order.length - 1]]);
});

test("optimalisatie: uitkomst is stabiel bij herhaald draaien", () => {
  const points = [p(0, 0), p(5, 2), p(2, 5), p(4, 1), p(1, 3), p(6, 6)];
  const first = optimizeWaypointOrder(points).order;
  const second = optimizeWaypointOrder(points).order;
  assert.deepEqual(first, second);

  // nogmaals optimaliseren op de nieuwe volgorde levert niets meer op
  const reordered = first.map((i) => points[i]);
  assert.equal(optimizeWaypointOrder(reordered).improved, false);
});

test("optimalisatie: respecteert het rekenbudget", () => {
  const points: Coordinates[] = [];
  for (let i = 0; i < 25; i++) {
    points.push(p(Math.sin(i * 2.7) * 20, Math.cos(i * 1.9) * 20));
  }
  const started = Date.now();
  const result = optimizeWaypointOrder(points, 50);
  const elapsed = Date.now() - started;

  assert.ok(elapsed < 1500, `optimalisatie duurde ${elapsed} ms`);
  assert.equal(result.order.length, points.length);
  assert.deepEqual(
    [...result.order].sort((a, b) => a - b),
    points.map((_, i) => i)
  );
});

test("optimalisatie: 25 punten (het maximum) blijft ruim binnen een seconde", () => {
  const points: Coordinates[] = [];
  for (let i = 0; i < 25; i++) points.push(p((i * 7) % 23, (i * 11) % 19));

  const started = Date.now();
  const result = optimizeWaypointOrder(points);
  const elapsed = Date.now() - started;

  assert.ok(elapsed < 1000, `duurde ${elapsed} ms`);
  assert.ok(result.after <= result.before);
});

test("tourLength: telt de afstanden tussen opeenvolgende punten op", () => {
  const matrix = [
    [0, 1, 5],
    [1, 0, 2],
    [5, 2, 0],
  ];
  assert.equal(tourLength([0, 1, 2], matrix), 3);
  assert.equal(tourLength([0, 2, 1], matrix), 7);
  assert.equal(tourLength([0], matrix), 0);
});
