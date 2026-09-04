import test from "node:test";
import assert from "node:assert/strict";
import {
  generateLoopWaypoints,
  destinationPoint,
  loopAnchorCount,
  mulberry32,
} from "../loopgen.ts";
import { haversineKm } from "../routing.ts";

const MAASTRICHT = { lat: 50.8514, lng: 5.691 };

test("loopgen:bestemming op 0 graden gaat noordwaarts, afstand klopt", () => {
  const p = destinationPoint(MAASTRICHT, 0, 10);
  assert.ok(p.lat > MAASTRICHT.lat, "noordwaarts");
  assert.ok(Math.abs(haversineKm(MAASTRICHT, p) - 10) < 0.1, "afstand ~10 km");
});

test("loopgen:ankerantal schaalt met de lengte", () => {
  assert.equal(loopAnchorCount(40), 6);
  assert.equal(loopAnchorCount(100), 8);
  assert.equal(loopAnchorCount(300), 10);
});

test("loopgen:lus start en eindigt op het startpunt", () => {
  const wps = generateLoopWaypoints(MAASTRICHT, 100, 7, "Maastricht");
  assert.equal(wps[0].name, "Maastricht");
  assert.deepEqual(wps[wps.length - 1].coordinates, MAASTRICHT);
  assert.match(wps[wps.length - 1].name, /\(einde\)/);
  assert.equal(wps.length, 9); // 8 ankers + eindpunt
});

test("loopgen:alle ankers liggen binnen 1,45x de cirkelstraal", () => {
  const km = 100;
  const r = km / (2 * Math.PI);
  const wps = generateLoopWaypoints(MAASTRICHT, km, 3);
  for (const w of wps.slice(1, -1)) {
    const d = haversineKm(MAASTRICHT, w.coordinates);
    assert.ok(d < r * 1.45, `anker op ${d.toFixed(1)} km > ${r * 1.45}`);
  }
});

test("loopgen:zelfde seed geeft dezelfde lus, andere seed verschilt", () => {
  const a = generateLoopWaypoints(MAASTRICHT, 80, 99);
  const b = generateLoopWaypoints(MAASTRICHT, 80, 99);
  const c = generateLoopWaypoints(MAASTRICHT, 80, 100);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test("loopgen:mulberry32 blijft in [0,1) en is deterministisch", () => {
  const r1 = mulberry32(5);
  const r2 = mulberry32(5);
  const values = Array.from({ length: 50 }, () => r1());
  assert.ok(values.every((v) => v >= 0 && v < 1));
  const r3 = mulberry32(5);
  assert.deepEqual(values, Array.from({ length: 50 }, () => r3()));
  const r4 = mulberry32(6);
  assert.notEqual(r4(), values[0]);
});
