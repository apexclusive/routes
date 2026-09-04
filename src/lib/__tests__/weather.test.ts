import test from "node:test";
import assert from "node:assert/strict";
import { weatherLabel } from "../weather.ts";

test("weatherLabel: neerslag overschrijft de code", () => {
  assert.deepEqual(weatherLabel(0, 2), { text: "regen" });
  assert.deepEqual(weatherLabel(1, 0.2), { text: "motregen" });
});

test("weatherLabel: WMO-codes zonder neerslag", () => {
  assert.deepEqual(weatherLabel(0, 0), { text: "zon" });
  assert.deepEqual(weatherLabel(3, 0), { text: "bewolkt" });
  assert.deepEqual(weatherLabel(45, 0), { text: "mist" });
  assert.deepEqual(weatherLabel(95, 0), { text: "onweer" });
});

test("weatherLabel: sneeuwbuien en onbekende code", () => {
  assert.deepEqual(weatherLabel(85, 0), { text: "sneeuwbuien" });
  // 88 bestaat niet in WMO → nette fallback
  assert.deepEqual(weatherLabel(88, 0), { text: "wisselend" });
});
