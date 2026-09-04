import { test } from "node:test";
import assert from "node:assert/strict";
import { RITTEN } from "../ritten.ts";
import { CLIMBS } from "../climbs.ts";

const LANDEN = new Set(["NL", "BE", "LU", "DE", "FR", "IT", "CH", "AT"]);

test("ritten:ids uniek en URL-safe", () => {
  const ids = RITTEN.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "dubbele id's");
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `niet URL-safe: ${id}`);
});

test("ritten:data is consistent en volledig", () => {
  assert.ok(RITTEN.length >= 10, "minimaal 10 ritten");
  for (const r of RITTEN) {
    assert.ok(LANDEN.has(r.country), `onbekend land: ${r.country}`);
    assert.ok(r.lengthKm >= 60 && r.lengthKm <= 400, `lengte raar: ${r.id}`);
    assert.ok(r.rijmin >= 60 && r.rijmin <= 600, `rijtijd raar: ${r.id}`);
    assert.ok(r.hoogtepunten.length >= 3, `te weinig hoogtepunten: ${r.id}`);
    assert.ok(r.prompt.length >= 30, `te korte prompt: ${r.id}`);
    assert.ok(r.plaats.length >= 3, `geen plaats: ${r.id}`);
    assert.ok(r.naam.length >= 4, `geen naam: ${r.id}`);
  }
});

test("ritten:klim-verwijzingen bestaan in de bibliotheek", () => {
  const ids = new Set(CLIMBS.map((c) => c.id));
  for (const r of RITTEN) {
    for (const k of r.klimIds) {
      assert.ok(ids.has(k), `${r.id} verwijst naar onbekende klim: ${k}`);
    }
  }
});

test("ritten:meerdere landen en tags gedekt", () => {
  const landen = new Set(RITTEN.map((r) => r.country));
  for (const nodig of ["NL", "BE", "DE", "FR", "IT", "AT"] as const) {
    assert.ok(landen.has(nodig), `geen rit in ${nodig}`);
  }
  const tags = new Set(RITTEN.flatMap((r) => r.tags));
  for (const nodig of ["motor", "auto", "fiets", "kassei"]) {
    assert.ok(tags.has(nodig), `tag mist: ${nodig}`);
  }
});
