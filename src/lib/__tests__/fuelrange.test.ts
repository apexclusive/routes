import test from "node:test";
import assert from "node:assert/strict";
import { fuelAdvice, TANK_RANGE_KM } from "../fuelrange.ts";

test("fuelrange:motor waarschuwt boven 90% van het bereik", () => {
  assert.equal(fuelAdvice("motorcycle", 200).needed, false); // ruim binnen 250
  assert.equal(fuelAdvice("motorcycle", 230).needed, true); // > 225
  assert.equal(fuelAdvice("motorcycle", 230).rangeKm, 250);
});

test("fuelrange:auto waarschuwt pas bij echte afstanden", () => {
  assert.equal(fuelAdvice("car", 400).needed, false);
  assert.equal(fuelAdvice("car", 600).needed, true); // > 585
});

test("fuelrange:fiets en wandelen hoeven nooit te tanken", () => {
  assert.equal(fuelAdvice("bicycle", 200).needed, false);
  assert.equal(fuelAdvice("pedestrian", 50).needed, false);
  assert.equal(TANK_RANGE_KM.bicycle, 0);
});
