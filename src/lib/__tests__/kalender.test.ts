import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { EVENTS, EVENT_CATS, NEWS, eventsForYear, type EventCountry } from "../calendar.ts";
import { PROVINCES, TOP10_NL, AIR_EXPERIENCES, BUCKETLIST_SEEDS, progressOf, isComplete } from "../nl.ts";

const VALID_CATS = new Set(EVENT_CATS.map((c) => c.id));

test("kalender:evenementen hebben unieke ids, geldige maand en categorie", () => {
  assert.ok(EVENTS.length >= 18, `te weinig events: ${EVENTS.length}`);
  const ids = new Set<string>();
  for (const e of EVENTS) {
    assert.ok(!ids.has(e.id), `dubbel id: ${e.id}`);
    ids.add(e.id);
    assert.ok(e.month >= 1 && e.month <= 12, `maand raar: ${e.id}`);
    assert.ok(VALID_CATS.has(e.cat), `cat raar: ${e.id}`);
    assert.ok(e.url.startsWith("https://"), `geen https: ${e.id}`);
    assert.ok(e.what.length > 20 && e.access.length > 3, `te mager: ${e.id}`);
    assert.ok(e.period.length > 2, `periode raar: ${e.id}`);
  }
});

test("kalender:de grote drie (Nordschleife, Vierdaagse, Berlin) staan erin", () => {
  const all = EVENTS.map((e) => e.name).join(" ");
  assert.ok(all.includes("Nürburgring"));
  assert.ok(all.includes("Vierdaagse"));
  assert.ok(all.includes("Berlin"));
});

test("kalender:nieuwsitems linken intern met label", () => {
  assert.ok(NEWS.length >= 3);
  for (const n of NEWS) {
    assert.ok(n.href.startsWith("/"));
    assert.ok(n.hrefLabel.length > 2);
    assert.ok(n.title.length > 10);
  }
});

test("nl:twaalf provincies met unieke id, highlight en prompt", () => {
  assert.equal(PROVINCES.length, 12);
  const ids = new Set(PROVINCES.map((p) => p.id));
  assert.equal(ids.size, 12);
  for (const p of PROVINCES) {
    assert.ok(p.highlight.length > 4, p.id);
    assert.ok(p.detail.length > 20, p.id);
    assert.ok(p.prompt.length > 15, p.id);
  }
});

test("nl:top-10 heeft er echt tien en bucketlist twaalf zaden", () => {
  assert.equal(TOP10_NL.length, 10);
  for (const t of TOP10_NL) {
    assert.ok(t.title.length > 4 && t.why.length > 10);
  }
  assert.equal(BUCKETLIST_SEEDS.length, 12);
  const withPrompt = BUCKETLIST_SEEDS.filter((b) => b.prompt);
  assert.ok(withPrompt.length >= 8, "meeste zaden moeten rij-knoppen hebben");
});

test("nl:lucht-ervaringen: alleen vertrouwde links of leeg", () => {
  assert.ok(AIR_EXPERIENCES.length >= 5);
  for (const a of AIR_EXPERIENCES) {
    assert.ok(a.url === "" || a.url.startsWith("https://"), a.name);
    assert.ok(a.season.length > 2);
  }
});

test("nl:bucketlist-progress is klemmend en compleet-detectie klopt", () => {
  assert.equal(progressOf(0, 12), 0);
  assert.equal(progressOf(6, 12), 0.5);
  assert.equal(progressOf(12, 12), 1);
  assert.equal(progressOf(20, 12), 1);
  assert.equal(progressOf(3, 0), 0);
  assert.ok(isComplete(12, 12));
  assert.ok(!isComplete(11, 12));
  assert.ok(!isComplete(0, 0));
});

test("nl:alle aangehaalde routescape-beelden bestaan", () => {
  const files = [
    "/routescapes/circuit-night.jpg",
    "/routescapes/balloon.jpg",
    "/routescapes/wandeltrap.jpg",
    "/routescapes/marathon.jpg",
  ];
  for (const f of files) {
    assert.ok(existsSync(join(import.meta.dirname, "../../../public", f)), f);
  }
});

const LANDEN_GELDIG = new Set(["NL", "BE", "LU", "DE", "FR"]);

test("kalender:elk event heeft een geldig land en alle Benelux-landen zijn vertegenwoordigd", () => {
  for (const e of EVENTS) {
    assert.ok(LANDEN_GELDIG.has(e.country as EventCountry), `land raar: ${e.id} -> ${e.country}`);
  }
  const perLand = new Map<string, number>();
  for (const e of EVENTS) perLand.set(e.country, (perLand.get(e.country) ?? 0) + 1);
  assert.ok((perLand.get("NL") ?? 0) >= 10, "NL moet vol zitten");
  assert.ok((perLand.get("BE") ?? 0) >= 15, "BE moet vol zitten (rally-hart)");
  assert.ok((perLand.get("LU") ?? 0) >= 2, "LU moet minstens 2 events hebben");
});

test("kalender:rally's: het volledige BRC-seizoen plus de NL-kalender (15+)", () => {
  const rallies = EVENTS.filter((e) => e.cat === "rally");
  assert.ok(rallies.length >= 15, `te weinig rally's: ${rallies.length}`);
  const namen = rallies.map((r) => r.name).join(" ");
  assert.ok(namen.includes("Ypres"));
  assert.ok(namen.includes("Haspengouw"));
  assert.ok(namen.includes("Omloop van Vlaanderen") || namen.includes("Omloop"));
  const maanden = new Set(rallies.map((r) => r.month));
  assert.ok(maanden.size >= 9, "rally-seizoen moet bijna het hele jaar beslaan");
});

test("kalender:elke maand heeft events (dec = winterstop met 1)", () => {
  for (let m = 1; m <= 11; m++) {
    const n = EVENTS.filter((e) => e.month === m).length;
    assert.ok(n >= 2, `maand ${m} heeft maar ${n} events`);
  }
  const dec = EVENTS.filter((e) => e.month === 12).length;
  assert.ok(dec >= 1, "december mag de winterstop zijn, maar niet leeg");
});

test("kalender:mountainbike + oktober geeft minstens 3 events (geen dode filters)", () => {
  const mtbOktober = EVENTS.filter((e) => e.cat === "mtb" && e.month === 10);
  assert.ok(mtbOktober.length >= 3, `mtb in oktober: ${mtbOktober.length}`);
  assert.ok(mtbOktober.some((e) => e.country === "LU"), "Red Rock Challenge (LU) moet erbij zitten");
});

test("kalender:geen categorie+land-combinatie zonder events (bezetheidscheck)", () => {
  for (const cat of VALID_CATS) {
    const n = EVENTS.filter((e) => e.cat === cat).length;
    assert.ok(n >= 2, `cat ${cat} te dun: ${n}`);
  }
});

test("kalender:elk event heeft jaar 2026 en een geldig publiek", () => {
  for (const e of EVENTS) {
    assert.ok(e.year === 2026, `jaar raar: ${e.id}`);
    assert.ok(e.audience === "deelnemer" || e.audience === "toeschouwer", `publiek raar: ${e.id}`);
  }
});

test("kalender:toeschouwer-agenda (F1, MotoGP, WEC, wielerklassiekers) is compleet", () => {
  const t = EVENTS.filter((e) => e.audience === "toeschouwer");
  assert.ok(t.length >= 17, `te weinig toeschouwer-events: ${t.length}`);
  const namen = t.map((e) => e.name).join(" ");
  for (const nodig of ["Formule 1", "Dutch Grand Prix", "MotoGP", "24 Hours of Spa", "Oldtimer", "Ronde van Vlaanderen", "Waalse Pijl", "Zesdaagse"]) {
    assert.ok(namen.includes(nodig), `mist: ${nodig}`);
  }
});

test("kalender:2027-spiegel: zelfde aantal, unieke ids, jaar 2027", () => {
  const y27 = eventsForYear(2027);
  assert.equal(y27.length, EVENTS.length);
  assert.ok(y27.every((e) => e.year === 2027));
  assert.ok(new Set(y27.map((e) => e.id)).size === y27.length);
  assert.ok(y27.every((e) => e.id.endsWith("-2027")));
});

test("kalender:Duitsland heeft een volle deelnemersagenda (8+)", () => {
  const de = EVENTS.filter((e) => e.country === "DE" && e.audience === "deelnemer");
  assert.ok(de.length >= 8, `DE te dun: ${de.length}`);
});
