import test from "node:test";
import assert from "node:assert/strict";

import { COUNTRIES, CIRCUITS, RALLY_EVENTS } from "../discover.ts";

test("ontdek:vier landen met elk precies 10 top-routes", () => {
  assert.equal(COUNTRIES.length, 4);
  const ids = new Set<string>();
  for (const c of COUNTRIES) {
    assert.equal(c.routes.length, 10, `${c.id} heeft geen 10 routes`);
    for (const r of c.routes) {
      assert.ok(!ids.has(r.id), `dubbel id: ${r.id}`);
      ids.add(r.id);
      assert.ok(r.name.length > 2);
      assert.ok(r.km >= 40 && r.km <= 400, `km raar: ${r.id}=${r.km}`);
      assert.ok(r.hm >= 0 && r.hm <= 4000, `hm raar: ${r.id}`);
      assert.ok(r.prompt.length >= 20, `te kort prompt: ${r.id}`);
      assert.ok(r.prompt.includes("km"), `prompt zonder km: ${r.id}`);
    }
  }
  assert.equal(ids.size, 40);
});

test("ontdek:vijf circuits met bruikbare prompts", () => {
  assert.equal(CIRCUITS.length, 5);
  for (const c of CIRCUITS) {
    assert.ok(c.name.length > 3);
    assert.ok(c.km >= 80 && c.km <= 300);
    assert.ok(c.prompt.includes("km"));
    assert.ok(c.blurb.length > 20);
  }
  const places = CIRCUITS.map((c) => c.name);
  assert.ok(places.includes("Circuit Zolder"), "Zolder ontbreekt");
});

test("ontdek:rally-evenementen hebben bron-URLs", () => {
  assert.ok(RALLY_EVENTS.length >= 3);
  for (const e of RALLY_EVENTS) {
    assert.ok(e.name.length > 2);
    assert.ok(e.what.length > 20);
    assert.ok(e.url.startsWith("https://"), `geen https: ${e.url}`);
  }
});

/* ---------- afbeeldingen per kaart ---------- */

import { existsSync } from "node:fs";
import { join } from "node:path";

test("ontdek:elke route en circuit heeft een bestaande routescape-afbeelding", () => {
  const all = [
    ...COUNTRIES.flatMap((c) => c.routes.map((r) => r.img)),
    ...CIRCUITS.map((c) => c.img),
  ];
  assert.equal(all.length, 45);
  for (const img of all) {
    assert.ok(img.startsWith("/routescapes/"), `pad raar: ${img}`);
    assert.ok(img.endsWith(".jpg"), `geen jpg: ${img}`);
    assert.ok(
      existsSync(join(import.meta.dirname, "../../../public", img)),
      `bestand ontbreekt: ${img}`
    );
  }
});
