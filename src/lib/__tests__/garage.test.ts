import test from "node:test";
import assert from "node:assert/strict";

import {
  computeGarageStats,
  BADGES,
  unlockedIds,
  newlyUnlocked,
  vehicleLabel,
} from "../garage.ts";

const km = (n: number) => n * 1000;

test("garage:statistieken tellen km, regio's en vervoersmiddelen", () => {
  const stats = computeGarageStats([
    { name: "Mergelland classics", distance: km(98), vehicle: "motorcycle", windingScore: 72 },
    { name: "Durbuy weekend", distance: km(155), vehicle: "car" },
    { name: "Eifel wandeling", distance: km(14), vehicle: "pedestrian" },
  ]);
  assert.equal(stats.routes, 3);
  assert.equal(stats.totalKm, 267);
  assert.equal(stats.longestKm, 155);
  assert.equal(stats.corridors, 3);
  assert.ok(stats.corridorLabels.includes("Mergelland"));
  assert.ok(stats.corridorLabels.includes("Ardennen"));
  assert.ok(stats.corridorLabels.includes("Eifel"));
  assert.equal(stats.vehicles, 3);
  assert.equal(stats.bestWinding, 72);
});

test("garage:één regio per route telt niet dubbel", () => {
  const stats = computeGarageStats([
    { name: "Mergelland via Maastricht en Gulpen", distance: km(80), vehicle: "motorcycle" },
  ]);
  assert.equal(stats.corridors, 1);
});

test("garage:afwezige velden doen geen pijn", () => {
  const stats = computeGarageStats([{ name: "Losse rit", vehicle: "car" }]);
  assert.equal(stats.totalKm, 0);
  assert.equal(stats.bestWinding, 0);
  assert.deepEqual(stats.corridorLabels, []);
});

test("garage:badges unlocken op de juiste drempels", () => {
  const leeg = computeGarageStats([]);
  assert.deepEqual(unlockedIds(leeg), []);

  const eerste = computeGarageStats([{ name: "Eerste rit", distance: km(42), vehicle: "motorcycle" }]);
  assert.ok(unlockedIds(eerste).includes("eerste-rit"));
  assert.ok(!unlockedIds(eerste).includes("honderd"));

  const honderd = computeGarageStats([{ name: "Grote rit", distance: km(101), vehicle: "car" }]);
  assert.ok(unlockedIds(honderd).includes("honderd"));

  const kronkel = computeGarageStats([{ name: "Kronkels", distance: km(60), vehicle: "motorcycle", windingScore: 74 }]);
  assert.ok(unlockedIds(kronkel).includes("kronkelaar"));
});

test("garage:newlyUnlocked vindt precies de nieuwe badges", () => {
  assert.deepEqual(newlyUnlocked(["eerste-rit"], ["eerste-rit", "honderd"]), ["honderd"]);
  assert.deepEqual(newlyUnlocked(["a", "b"], ["a", "b"]), []);
});

test("garage:elke badge heeft zinnige voortgangfunctie", () => {
  const stats = computeGarageStats([{ name: "Test", distance: km(50), vehicle: "car" }]);
  for (const b of BADGES) {
    const p = b.progress(stats);
    assert.ok(Number.isFinite(p) && p >= 0, `progress raar bij ${b.id}`);
    assert.ok(b.goal > 0 && b.description.length > 3, `meta raar bij ${b.id}`);
  }
});

test("garage:vehicleLabel vertaalt bekende voertuigen", () => {
  assert.equal(vehicleLabel("motorcycle"), "Motor");
  assert.equal(vehicleLabel("car"), "Auto");
  assert.equal(vehicleLabel("bosmaaier"), "bosmaaier");
});
