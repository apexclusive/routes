import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  DESTINATIONS,
  CLIMBS,
  EMERGENCY_NUMBERS,
  MEET_EVENTS,
  SAFETY_TIPS,
} from "../advisor.ts";

test("advisor:vijf bestemmingen met beeld, feiten, tips en prompt", () => {
  assert.equal(DESTINATIONS.length, 5);
  for (const d of DESTINATIONS) {
    assert.ok(d.facts.length >= 2, d.id);
    assert.ok(d.tips.length >= 3, d.id);
    assert.ok(d.prompt.includes("km"), d.id);
    assert.ok(d.sources.every((s) => s.url.startsWith("https://")), d.id);
    assert.ok(existsSync(join(import.meta.dirname, "../../../public", d.img)), d.img);
  }
});

test("advisor:klimdata is fysiek plausibel", () => {
  assert.ok(CLIMBS.length >= 6);
  for (const c of CLIMBS) {
    assert.ok(c.lengthM > 300 && c.lengthM < 12000, c.name);
    assert.ok(c.heightM > 30 && c.heightM < 500, c.name);
    assert.ok(c.avgPct >= 3 && c.avgPct <= 15, c.name);
    assert.ok(c.maxPct > c.avgPct && c.maxPct <= 20, c.name);
  }
  const vaalserberg = CLIMBS.find((c) => c.name === "Vaalserberg");
  assert.ok(vaalserberg, "Vaalserberg ontbreekt");
  const cauberg = CLIMBS.find((c) => c.name === "Cauberg");
  assert.equal(cauberg!.maxPct, 13.2);
});

test("advisor:alarmnummers bevatten 112 en ANWB", () => {
  const all = EMERGENCY_NUMBERS.map((e) => `${e.situation} ${e.number} ${e.note}`).join(" ");
  assert.ok(all.includes("112"));
  assert.ok(all.includes("+31 70 314 14 14"));
  assert.ok(all.includes("088 - 269 28 88"));
});

test("advisor:events hebben periode, url en aanmeldingsinfo", () => {
  assert.ok(MEET_EVENTS.length >= 5);
  for (const e of MEET_EVENTS) {
    assert.ok(e.period.length > 2, e.id);
    assert.ok(e.url.startsWith("https://"), e.id);
    assert.ok(e.free.length > 2, e.id);
  }
});

test("advisor:veiligheidsblokken dekken apk, banden en meenemen", () => {
  const all = SAFETY_TIPS.map((b) => b.items.join(" ")).join(" ");
  assert.ok(all.includes("APK"));
  assert.ok(all.includes("DOT"));
  assert.ok(all.toLowerCase().includes("bandenspanning"));
});
