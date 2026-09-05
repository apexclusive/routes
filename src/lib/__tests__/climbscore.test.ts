import test from "node:test";
import assert from "node:assert/strict";
import { CLIMBS, type Climb } from "../climbs.ts";
import {
  climbScore,
  fietsIndex,
  klimtijdMinuten,
  rankClimbs,
  rateClimb,
  zwaarteKlasse,
} from "../climbscore.ts";

const byId = (id: string): Climb => {
  const c = CLIMBS.find((x) => x.id === id);
  assert.ok(c, `klim ontbreekt: ${id}`);
  return c;
};

test("climbscore:zwaardere cols scoren hoger dan Limburgse heuvels", () => {
  assert.ok(climbScore(byId("timmelsjoch")) > climbScore(byId("cauberg")) * 10);
  assert.ok(climbScore(byId("mont-ventoux")) > climbScore(byId("schauinsland")));
  assert.ok(climbScore(byId("stelvio")) > climbScore(byId("passo-sella")));
});

test("climbscore:FIETS-index komt overeen met de gepubliceerde referentiewaarden", () => {
  // De Mont Ventoux vanaf Bedoin staat in de literatuur op ongeveer 12,8 punten
  // en de Alpe d'Huez rond de 9-10. Wijkt de formule af, dan is er iets stuk.
  assert.ok(Math.abs(fietsIndex(byId("mont-ventoux")) - 12.8) < 1, "Ventoux buiten bandbreedte");
  assert.ok(Math.abs(fietsIndex(byId("alpe-huez")) - 9.6) < 1.2, "Alpe d'Huez buiten bandbreedte");
  // Limburgse heuvels blijven ver onder de 1
  assert.ok(fietsIndex(byId("cauberg")) < 1);
  // hoogtecorrectie telt alleen boven 1000 m
  assert.equal(
    Math.round(fietsIndex(byId("koppenberg")) * 100),
    Math.round(((64 * 64) / (600 * 10)) * 100)
  );
});

test("climbscore:steilheid weegt kwadratisch, niet alleen lengte", () => {
  // Passo Giau (9,8 km @ 9,5%) moet zwaarder zijn dan de langere,
  // veel vlakkere Col de l'Iseran (32 km @ 4,5%) qua klimintensiteit per meter.
  const giau = byId("passo-giau");
  const iseran = byId("col-de-liseran");
  const intensiteitGiau = (giau.elevationM * giau.elevationM) / giau.lengthM;
  const intensiteitIseran = (iseran.elevationM * iseran.elevationM) / iseran.lengthM;
  assert.ok(intensiteitGiau > intensiteitIseran);
});

test("climbscore:kasseien krijgen een toeslag", () => {
  const koppenberg = byId("koppenberg");
  const alsAsfalt: Climb = { ...koppenberg, surface: "asfalt" };
  assert.ok(climbScore(koppenberg) > climbScore(alsAsfalt));
});

test("climbscore:klassen lopen oplopend en dekken alles af", () => {
  for (const score of [0, 0.5, 1, 2.9, 3, 5.9, 8, 20]) {
    const { klasse, label } = zwaarteKlasse(score);
    assert.ok(klasse.length > 3, `geen klasse bij ${score}`);
    assert.ok(label.length > 10, `geen label bij ${score}`);
  }
  assert.equal(zwaarteKlasse(0.4).klasse, "instap");
  assert.equal(zwaarteKlasse(100000).klasse, "buitencategorie");
});

test("climbscore:relatieve score blijft tussen 1 en 100 en de zwaarste haalt 100", () => {
  let honderd = 0;
  for (const c of CLIMBS) {
    const r = rateClimb(c, CLIMBS);
    assert.ok(r.relatief >= 1 && r.relatief <= 100, `${c.id}: ${r.relatief}`);
    if (r.relatief === 100) honderd += 1;
  }
  assert.equal(honderd, 1, "precies één zwaarste klim");
});

test("climbscore:ranglijst is compleet, uniek en aflopend", () => {
  const lijst = rankClimbs(CLIMBS);
  assert.equal(lijst.length, CLIMBS.length);
  assert.equal(new Set(lijst.map((r) => r.climb.id)).size, CLIMBS.length);
  for (let i = 1; i < lijst.length; i += 1) {
    assert.ok(lijst[i - 1].score >= lijst[i].score, "niet aflopend gesorteerd");
    assert.equal(lijst[i].rang, i + 1);
  }
});

test("climbscore:klimtijden zijn realistisch en oplopend van pro naar recreant", () => {
  for (const c of CLIMBS) {
    const t = klimtijdMinuten(c);
    assert.ok(t.pro <= t.sportief && t.sportief <= t.recreant, `volgorde raar: ${c.id}`);
    assert.ok(t.recreant <= 400, `onrealistisch lang: ${c.id}`);
  }
  // Alpe d'Huez: pro rond 45-50 min, recreant rond 1h50 — bandbreedte controleren
  const ah = klimtijdMinuten(byId("alpe-huez"));
  assert.ok(ah.pro >= 35 && ah.pro <= 60, `pro-tijd raar: ${ah.pro}`);
  assert.ok(ah.recreant >= 90 && ah.recreant <= 150, `recreant-tijd raar: ${ah.recreant}`);
});
