import test from "node:test";
import assert from "node:assert/strict";
import { lineStringToCanvasPoints } from "../sharecard.ts";

const MAASTRICHT = { lat: 50.8514, lng: 5.691 };
const VALKENBURG = { lat: 50.8702, lng: 5.8298 };

test("sharecard:punten blijven binnen het canvas met padding", () => {
  const pts = lineStringToCanvasPoints([MAASTRICHT, VALKENBURG], 1200, 630, 60);
  assert.equal(pts.length, 2);
  for (const p of pts) {
    assert.ok(p.x >= 59 && p.x <= 1141, `x buiten canvas: ${p.x}`);
    assert.ok(p.y >= 59 && p.y <= 571, `y buiten canvas: ${p.y}`);
  }
});

test("sharecard:noord ligt hoger op het canvas (y kleiner)", () => {
  const noord = { lat: 51.0, lng: 5.7 };
  const zuid = { lat: 50.8, lng: 5.7 };
  const [pNoord] = lineStringToCanvasPoints([noord, zuid], 1000, 600, 50);
  const [, pZuid] = lineStringToCanvasPoints([noord, zuid], 1000, 600, 50);
  assert.ok(pNoord.y < pZuid.y, "noord moet kleiner y hebben");
});

test("sharecard:één punt of te klein canvas geeft leeg (geen crash)", () => {
  assert.deepEqual(lineStringToCanvasPoints([MAASTRICHT], 1200, 630), []);
  assert.deepEqual(lineStringToCanvasPoints([MAASTRICHT, VALKENBURG], 80, 630, 60), []);
});
