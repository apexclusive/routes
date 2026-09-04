import test from "node:test";
import assert from "node:assert/strict";

import {
  spinRoulette,
  hashSeed,
  mulberry32,
  rouletteShareText,
  CORRIDOR_POOL,
} from "../roulette.ts";

test("roulette:zelfde seed geeft dezelfde uitslag", () => {
  const a = spinRoulette({ vehicle: "motorcycle", kmTarget: 120, seed: "apex-test" });
  const b = spinRoulette({ vehicle: "motorcycle", kmTarget: 120, seed: "apex-test" });
  assert.deepEqual(
    { km: a.km, corridor: a.corridor.key, rideName: a.rideName },
    { km: b.km, corridor: b.corridor.key, rideName: b.rideName }
  );
});

test("roulette:km blijft binnen het bereik van de regio, afgerond op 5", () => {
  for (const seed of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
    const r = spinRoulette({ vehicle: "car", kmTarget: 150, seed });
    assert.ok(r.km >= r.corridor.km[0], `te klein: ${r.km}`);
    assert.ok(r.km <= r.corridor.km[1], `te groot: ${r.km}`);
    assert.equal(r.km % 5, 0, "niet afgerond op 5 km");
  }
});

test("roulette:avoidKey voorkomt dezelfde regio als net", () => {
  for (let i = 0; i < 12; i++) {
    const first = spinRoulette({ vehicle: "car", seed: `eerste-${i}` });
    const second = spinRoulette({
      vehicle: "car",
      seed: `tweede-${i}`,
      avoidKey: first.corridor.key,
    });
    assert.notEqual(second.corridor.key, first.corridor.key);
  }
});

test("roulette:prompt bevat voertuig, kilometers en regio (parseerbaar)", () => {
  const r = spinRoulette({ vehicle: "motorcycle", kmTarget: 100, seed: "moto" });
  assert.ok(r.prompt.includes("motor"));
  assert.ok(r.prompt.includes(`${r.km} km`));
  assert.ok(r.prompt.includes(r.corridor.inName));
});

test("roulette:hashSeed en mulberry32 zijn deterministisch", () => {
  assert.equal(hashSeed("apex"), hashSeed("apex"));
  assert.notEqual(hashSeed("apex"), hashSeed("apex2"));
  const a = mulberry32(42);
  const b = mulberry32(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});

test("roulette:elke regio in de pool heeft een geldig km-bereik", () => {
  for (const c of CORRIDOR_POOL) {
    assert.ok(c.km[0] >= 20 && c.km[1] > c.km[0], `onlogisch bereik: ${c.key}`);
    assert.ok(c.climbPerKm > 0 && c.climbPerKm <= 30, `klim per km raar: ${c.key}`);
  }
});

test("roulette:deeltekst bevat naam, km en seed", () => {
  const r = spinRoulette({ vehicle: "bicycle", seed: "deel" });
  const text = rouletteShareText(r);
  assert.ok(text.includes(r.rideName));
  assert.ok(text.includes(`${r.km} km`));
  assert.ok(text.includes(r.seed));
});

test("roulette:kronkel-stijl kiest alleen kronkelregio's", () => {
  for (let i = 0; i < 20; i++) {
    const r = spinRoulette({ vehicle: "motorcycle", seed: `kronkel-${i}`, style: "kronkel" });
    assert.ok(r.corridor.winding >= 7, `${r.corridor.key} winding ${r.corridor.winding}`);
    assert.notEqual(r.corridor.key, "zeeland");
    assert.notEqual(r.corridor.key, "veluwe");
  }
});

test("roulette:rustig-stijl kiest alleen rustige regio's", () => {
  for (let i = 0; i < 20; i++) {
    const r = spinRoulette({ vehicle: "car", seed: `rustig-${i}`, style: "rustig" });
    assert.ok(r.corridor.winding <= 5, `${r.corridor.key} winding ${r.corridor.winding}`);
    assert.notEqual(r.corridor.key, "alpen");
  }
});

test("roulette:default (mix) blijft alle regio's toestaan", () => {
  const gezien = new Set<string>();
  for (let i = 0; i < 60; i++) {
    const r = spinRoulette({ vehicle: "motorcycle", seed: `mix-${i}` });
    gezien.add(r.corridor.key);
  }
  assert.ok(gezien.size >= 5, "mix moet variëren over regio's");
});
