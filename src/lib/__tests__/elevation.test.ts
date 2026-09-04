import test from "node:test";
import assert from "node:assert/strict";

import {
  sampleAlongGeometry,
  summarizeElevation,
  buildProfilePath,
  MAX_SAMPLES,
} from "../elevation.ts";
import type { GeoJSON } from "../../types.ts";

function line(points: [number, number][]): GeoJSON.LineString {
  return { type: "LineString", coordinates: points as GeoJSON.Position[] };
}

/** Rechte lijn oost-west met `n` punten van elk ~`stepM` meter. */
function straight(n: number, stepM = 500): GeoJSON.LineString {
  const coords: [number, number][] = [];
  const dLng = stepM / (111320 * Math.cos((50.85 * Math.PI) / 180));
  for (let i = 0; i < n; i++) coords.push([5.7 + i * dLng, 50.85]);
  return line(coords);
}

/* ---------- bemonsteren ---------- */

test("bemonsteren: korte geometrie blijft ongewijzigd", () => {
  const g = straight(10);
  const { positions, distances, total } = sampleAlongGeometry(g);
  assert.equal(positions.length, 10);
  assert.equal(distances[0], 0);
  assert.ok(Math.abs(total - 9 * 500) < 50, `totaal ${total} wijkt te ver af`);
});

test("bemonsteren: lange geometrie wordt teruggebracht tot 100 punten", () => {
  const g = straight(2000);
  const { positions, distances } = sampleAlongGeometry(g);
  assert.equal(positions.length, MAX_SAMPLES);
  assert.equal(distances.length, MAX_SAMPLES);
  // start en eind blijven exact behouden
  assert.deepEqual(positions[0], g.coordinates[0]);
  assert.deepEqual(positions[positions.length - 1], g.coordinates[g.coordinates.length - 1]);
  // afstanden lopen monotoon op
  for (let i = 1; i < distances.length; i++) {
    assert.ok(distances[i] >= distances[i - 1], `afstand daalt op index ${i}`);
  }
});

test("bemonsteren: lege en enkele punten crashen niet", () => {
  assert.deepEqual(sampleAlongGeometry(line([])), { positions: [], distances: [], total: 0 });
  const one = sampleAlongGeometry(line([[5.7, 50.85]]));
  assert.equal(one.positions.length, 1);
  assert.equal(one.total, 0);
});

/* ---------- klim- en daalmeters ---------- */

test("klimmeters: gelijkmatige klim telt volledig mee", () => {
  const distances = [0, 1000, 2000, 3000];
  const elevations = [100, 150, 200, 250];
  const p = summarizeElevation(distances, elevations);
  assert.equal(p.ascent, 150);
  assert.equal(p.descent, 0);
  assert.equal(p.min, 100);
  assert.equal(p.max, 250);
});

test("klimmeters: klim en daling worden apart geteld", () => {
  const p = summarizeElevation([0, 1000, 2000, 3000, 4000], [100, 200, 300, 150, 180]);
  assert.equal(p.ascent, 200 + 30, "200 m omhoog, daarna nog 30 m");
  assert.equal(p.descent, 150);
});

test("klimmeters: ruis onder de drempel telt niet mee", () => {
  // zaagtand van ±2 m op een vlakke route: fietscomputers negeren dit ook
  const distances: number[] = [];
  const elevations: number[] = [];
  for (let i = 0; i < 60; i++) {
    distances.push(i * 200);
    elevations.push(50 + (i % 2 === 0 ? 2 : -2));
  }
  const p = summarizeElevation(distances, elevations);
  assert.equal(p.ascent, 0, "GPS-ruis mag geen klimmeters opleveren");
  assert.equal(p.descent, 0);
});

test("klimmeters: echte heuvel met ruis eroverheen wordt wél geteld", () => {
  const distances: number[] = [];
  const elevations: number[] = [];
  for (let i = 0; i <= 40; i++) {
    distances.push(i * 250);
    const base = i <= 20 ? 100 + i * 10 : 300 - (i - 20) * 10;
    elevations.push(base + (i % 2 === 0 ? 1.5 : -1.5));
  }
  const p = summarizeElevation(distances, elevations);
  assert.ok(p.ascent > 180 && p.ascent < 220, `klim ${p.ascent} m buiten verwachting`);
  assert.ok(p.descent > 180 && p.descent < 220, `daling ${p.descent} m buiten verwachting`);
});

test("klimmeters: ontbrekende hoogtes worden overgeslagen", () => {
  const p = summarizeElevation(
    [0, 1000, 2000, 3000],
    [100, Number.NaN, 200, 250]
  );
  assert.equal(p.points.length, 3);
  assert.equal(p.ascent, 150);
});

test("klimmeters: lege invoer geeft een leeg profiel", () => {
  const p = summarizeElevation([], []);
  assert.deepEqual(p, { points: [], ascent: 0, descent: 0, min: 0, max: 0 });
});

/* ---------- SVG ---------- */

test("SVG-pad: blijft binnen de viewBox", () => {
  const p = summarizeElevation([0, 1000, 2000, 3000], [100, 250, 120, 300]);
  const { line: l, area } = buildProfilePath(p, 300, 60);

  assert.ok(l.startsWith("M"), "lijn begint niet met een move");
  assert.ok(area.endsWith("Z"), "vlak is niet gesloten");

  const coords = l.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g);
  for (const [, xs, ys] of coords) {
    const x = Number(xs);
    const y = Number(ys);
    assert.ok(x >= 0 && x <= 300, `x=${x} buiten de viewBox`);
    assert.ok(y >= 0 && y <= 60, `y=${y} buiten de viewBox`);
  }
});

test("SVG-pad: vlakke route levert een nette lijn op (geen deling door nul)", () => {
  const p = summarizeElevation([0, 1000, 2000], [50, 50, 50]);
  const { line: l } = buildProfilePath(p, 300, 60);
  assert.ok(l.length > 0);
  assert.ok(!l.includes("NaN"), "vlakke route geeft NaN in het pad");
  assert.ok(!l.includes("Infinity"));
});

test("SVG-pad: te weinig punten geeft een leeg pad", () => {
  assert.deepEqual(buildProfilePath(summarizeElevation([0], [100]), 300, 60), {
    line: "",
    area: "",
  });
});
