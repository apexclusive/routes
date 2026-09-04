import test from "node:test";
import assert from "node:assert/strict";
import { CLIMBS } from "../climbs.ts";

const LANDEN = new Set(["NL", "BE", "LU", "DE", "FR", "IT", "CH", "AT"]);

test("climbs:unieke ids, geldige landen en oppervlaktes", () => {
  const ids = new Set<string>();
  for (const c of CLIMBS) {
    assert.ok(!ids.has(c.id), `dubbel id: ${c.id}`);
    ids.add(c.id);
    assert.ok(LANDEN.has(c.country), `land raar: ${c.id}`);
    assert.ok(["asfalt", "kassei", "keien"].includes(c.surface), `oppervlak raar: ${c.id}`);
  }
  assert.ok(CLIMBS.length >= 26, "bibliotheek te klein");
});

test("climbs:statistieken binnen geloofwaardige banden en consistent", () => {
  for (const c of CLIMBS) {
    assert.ok(c.lengthM >= 200 && c.lengthM <= 30000, `lengte raar: ${c.id}`);
    assert.ok(c.avgPct >= 2 && c.avgPct <= 15, `gem raar: ${c.id}`);
    assert.ok(c.maxPct >= c.avgPct && c.maxPct <= 28, `max raar: ${c.id}`);
    // vuistregel: hoogteverschil kan niet meer zijn dan lengte x steilste stuk
    assert.ok(c.elevationM <= (c.lengthM / 1000) * 1000 * (c.maxPct / 100) * 1.05, `hm te hoog: ${c.id}`);
    assert.ok(c.note.length > 20 && c.prompt.length > 25, `te mager: ${c.id}`);
  }
});

test("climbs:NL, BE en DE zijn alle vertegenwoordigd", () => {
  for (const land of ["NL", "BE", "DE"] as const) {
    assert.ok(CLIMBS.some((c) => c.country === land), `geen klimmen voor ${land}`);
  }
  assert.ok(CLIMBS.some((c) => c.surface === "kassei"), "Vlaamse kasseien moeten erin zitten");
});

test("climbs:de grote Alpen-cols zijn aanwezig (FR/IT/CH/AT)", () => {
  const namen = CLIMBS.map((c) => c.name).join(" ");
  for (const nodig of ["Alpe d'Huez", "Galibier", "Tourmalet", "Stelvio", "Mortirolo", "Furkapass", "Grossglockner", "Timmelsjoch"]) {
    assert.ok(namen.includes(nodig), `mist: ${nodig}`);
  }
  // tolwegen moeten eerlijk vermeld worden
  const tol = CLIMBS.filter((c) => /tolweg/i.test(c.note + " " + c.prompt));
  assert.ok(tol.length >= 2, "Grossglockner en Timmelsjoch zijn tolwegen");
});

test("climbs:kasseibibliotheek van Vlaanderen is compleet", () => {
  const kassei = CLIMBS.filter((c) => c.surface === "kassei");
  assert.ok(kassei.length >= 5, `te weinig kassei: ${kassei.length}`);
  const namen = kassei.map((c) => c.name).join(" ");
  for (const nodig of ["Koppenberg", "Oude Kwaremont", "Muur", "Taaienberg"]) {
    assert.ok(namen.includes(nodig), `mist: ${nodig}`);
  }
});

test("climbs:id's zijn uniek en URL-safe (detailpagina's)", () => {
  const ids = CLIMBS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "dubbele id's");
  for (const id of ids) {
    assert.match(id, /^[a-z0-9-]+$/, `niet URL-safe: ${id}`);
  }
});
