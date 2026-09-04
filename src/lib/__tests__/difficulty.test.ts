import test from "node:test";
import assert from "node:assert/strict";
import { difficultyLevel } from "../difficulty.ts";

test("difficulty:vlakke polder is flat voor elk voertuig", () => {
  for (const v of ["car", "motorcycle", "bicycle", "pedestrian"] as const) {
    assert.equal(difficultyLevel(v, 100, 100), "flat", v);
  }
});

test("difficulty:fiets heeft strengere drempels dan auto", () => {
  // 10 hm/km: voor de auto glooiend, voor de racefiets al heuvelachtig
  assert.equal(difficultyLevel("car", 100, 1000), "rolling");
  assert.equal(difficultyLevel("bicycle", 100, 1000), "hilly");
});

test("difficulty:Ardennen-rondrit is hilly tot mountain", () => {
  assert.equal(difficultyLevel("motorcycle", 200, 3000), "hilly");
  assert.equal(difficultyLevel("motorcycle", 150, 3500), "mountain");
  assert.equal(difficultyLevel("bicycle", 100, 1500), "mountain");
});

test("difficulty:geen afstand of rare input geeft flat (geen crash)", () => {
  assert.equal(difficultyLevel("car", 0, 500), "flat");
  assert.equal(difficultyLevel("bicycle", NaN, 800), "flat");
  assert.equal(difficultyLevel("pedestrian", 10, 0), "flat");
});
