import test from "node:test";
import assert from "node:assert/strict";

import {
  cumulativeDistances,
  positionAtDistance,
  bearingDeg,
  totalDistanceM,
  rideSpeedMps,
  nextTurnAfter,
  type LatLon,
} from "../playback.ts";

// ~1 breedtegraad ≈ 111,2 km; genoeg precisie voor deze tests
const A: LatLon = [50.0, 6.0];
const B: LatLon = [50.1, 6.0]; // ~11,1 km zuidwaarts… nee: noordwaarts
const C: LatLon = [50.1, 6.1]; // ~7,1 km oostwaarts op deze breedtegraad

test("playback:cumulativeDistances telt op en totalDistance klopt", () => {
  const cum = cumulativeDistances([A, B, C]);
  assert.ok(cum[0] === 0);
  assert.ok(Math.abs(cum[1] - 11120) < 60, `seg1: ${cum[1]}`);
  assert.ok(Math.abs(cum[2] - cum[1] - 7130) < 60, `seg2: ${cum[2] - cum[1]}`);
  assert.equal(totalDistanceM(cum), cum[2]);
});

test("playback:positie aan het begin, midden en einde", () => {
  const coords = [A, B, C];
  const cum = cumulativeDistances(coords);
  const start = positionAtDistance(coords, cum, 0)!;
  assert.ok(Math.abs(start.lat - A[0]) < 1e-9);
  const end = positionAtDistance(coords, cum, totalDistanceM(cum) + 999)!;
  assert.ok(Math.abs(end.lat - C[0]) < 1e-6);
  assert.equal(end.progress, 1);
  const mid = positionAtDistance(coords, cum, cum[1])!;
  assert.ok(Math.abs(mid.lat - B[0]) < 1e-9);
  assert.ok(mid.progress > 0.5 && mid.progress < 0.7);
});

test("playback:bearing noord/oost/zuid en klemmen", () => {
  assert.ok(Math.abs(bearingDeg([50, 6], [50.01, 6])) < 0.01); // noord ≈ 0°
  assert.ok(Math.abs(bearingDeg([50, 6], [50, 6.01]) - 90) < 0.01); // oost ≈ 90°
  assert.ok(Math.abs(bearingDeg([50, 6], [49.99, 6]) - 180) < 0.01); // zuid ≈ 180°
});

test("playback:snelheden liggen realistisch per vervoermiddel", () => {
  assert.ok(rideSpeedMps("pedestrian") < 2);
  assert.ok(rideSpeedMps("bicycle") < 8);
  assert.ok(rideSpeedMps("motorcycle") > rideSpeedMps("car"));
  assert.ok(rideSpeedMps("car") > 10);
});

test("playback:nextTurnAfter geeft de eerstvolgende afslag met afstand", () => {
  const turns = [
    { distanceFromStart: 500, instruction: "links" },
    { distanceFromStart: 1500, instruction: "rechts" },
  ];
  const n1 = nextTurnAfter(turns, 200)!;
  assert.equal(n1.turn.instruction, "links");
  assert.equal(n1.aheadM, 300);
  const n2 = nextTurnAfter(turns, 1200)!;
  assert.equal(n2.turn.instruction, "rechts");
  assert.equal(nextTurnAfter(turns, 1600), null);
});

test("playback:degenerate input wordt netjes afgehandeld", () => {
  assert.equal(positionAtDistance([], [], 10), null);
  assert.equal(positionAtDistance([A], [0], 10), null);
  assert.equal(nextTurnAfter([], 0), null);
});
