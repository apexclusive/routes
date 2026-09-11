import test from "node:test";
import assert from "node:assert/strict";
import { TOURS, tourKm } from "../tours.ts";
import {
  BENZINE_EUR_PER_LITER,
  HOTEL_EUR_PER_NACHT,
  euro,
  grootsteBesparingen,
  kamers,
  raamKosten,
  standaardRaming,
  tolKostenEur,
} from "../tourkosten.ts";

test("elk basiskamp heeft een hotelraming", () => {
  for (const t of TOURS) {
    assert.ok(
      HOTEL_EUR_PER_NACHT[t.basiskamp] > 0,
      `geen hotelprijs bekend voor ${t.basiskamp} (${t.id})`
    );
  }
});

test("elk tourland heeft een brandstofprijs", () => {
  for (const t of TOURS) {
    const p = BENZINE_EUR_PER_LITER[t.country];
    assert.ok(p > 1 && p < 3, `onwaarschijnlijke benzineprijs voor ${t.country}: ${p}`);
  }
});

test("kamers rondt naar boven af, twee personen per kamer", () => {
  assert.equal(kamers(1), 1);
  assert.equal(kamers(2), 1);
  assert.equal(kamers(3), 2);
  assert.equal(kamers(4), 2);
  assert.equal(kamers(5), 3);
  // ook onzin-invoer mag geen nul kamers opleveren
  assert.equal(kamers(0), 1);
  assert.equal(kamers(-4), 1);
});

test("de raming telt netjes op en blijft realistisch", () => {
  for (const t of TOURS) {
    const r = standaardRaming(t);
    assert.equal(
      r.totaalEur,
      r.hotelEur + r.brandstofEur + r.tolEur,
      `${t.id}: totaal klopt niet met de posten`
    );
    assert.ok(r.hotelEur > 0, `${t.id}: hotel kost niets`);
    assert.ok(r.brandstofEur > 0, `${t.id}: brandstof kost niets`);
    assert.equal(r.perPersoonEur, Math.round(r.totaalEur / 2));
    // een tour van een paar dagen die meer kost dan een begeleide reis
    // zou het hele verhaal van de pagina onderuithalen
    assert.ok(
      r.perPersoonEur < t.georganiseerdVanafEur,
      `${t.id}: zelf rijden (${r.perPersoonEur}) is duurder dan georganiseerd (${t.georganiseerdVanafEur})`
    );
    assert.ok(r.besparingPerPersoonEur > 0, `${t.id}: geen besparing`);
  }
});

test("brandstof schaalt mee met de afstand en het verbruik", () => {
  const t = TOURS[0];
  const motor = raamKosten(t, { personen: 1, voertuig: "motor" });
  const auto = raamKosten(t, { personen: 1, voertuig: "auto" });
  assert.ok(auto.brandstofEur > motor.brandstofEur, "een auto slurpt meer dan een motor");
  // 8 l/100km bij de landprijs, binnen een euro of wat
  const verwacht = (tourKm(t) * 8) / 100 * BENZINE_EUR_PER_LITER[t.country];
  assert.ok(Math.abs(auto.brandstofEur - verwacht) < 2, "autoverbruik wijkt te ver af");
});

test("meer motorrijders betekent meer machines, meer auto's niet", () => {
  const t = TOURS[0];
  const motor1 = raamKosten(t, { personen: 1, voertuig: "motor" });
  const motor4 = raamKosten(t, { personen: 4, voertuig: "motor" });
  assert.ok(
    motor4.brandstofEur > motor1.brandstofEur * 3,
    "vier motoren tanken ongeveer vier keer zo veel"
  );
  const auto1 = raamKosten(t, { personen: 1, voertuig: "auto" });
  const auto4 = raamKosten(t, { personen: 4, voertuig: "auto" });
  assert.equal(auto4.brandstofEur, auto1.brandstofEur, "één auto, ongeacht het aantal inzittenden");
  // en delen loont: per persoon wordt het goedkoper
  assert.ok(auto4.perPersoonEur < auto1.perPersoonEur);
});

test("een eigen hotelprijs overschrijft de raming", () => {
  const t = TOURS[0];
  const duur = raamKosten(t, { personen: 2, voertuig: "motor", hotelPerNachtEur: 400 });
  const goedkoop = raamKosten(t, { personen: 2, voertuig: "motor", hotelPerNachtEur: 60 });
  assert.equal(duur.hotelEur, 400 * t.nachten);
  assert.equal(goedkoop.hotelEur, 60 * t.nachten);
  assert.ok(duur.totaalEur > goedkoop.totaalEur);
});

test("tol en vignetten kloppen met wat de tour zelf vermeldt", () => {
  for (const t of TOURS) {
    const tol = tolKostenEur(t);
    assert.ok(tol >= 0, `${t.id}: negatieve tol`);
    if (t.country === "CH") assert.ok(tol >= 40, `${t.id}: Zwitsers vignet ontbreekt`);
    if (t.kosten.some((k) => /grossglockner/i.test(k))) {
      assert.ok(tol >= 30, `${t.id}: Grossglockner-dagtol ontbreekt`);
    }
    // de Benelux-tours kennen geen vignetplicht
    if (t.country === "NL" || t.country === "BE") {
      assert.equal(tol, 0, `${t.id}: onverwachte tol in de Benelux`);
    }
  }
});

test("een fietstour verbruikt geen brandstof en betaalt geen tol", () => {
  const t = TOURS.find((x) => x.voertuigen.includes("fiets"));
  assert.ok(t, "geen enkele tour is per fiets te doen");
  const r = raamKosten(t, { personen: 2, voertuig: "fiets" });
  assert.equal(r.brandstofEur, 0);
  assert.equal(r.tolEur, 0);
  assert.equal(r.totaalEur, r.hotelEur);
});

test("de besparingen zijn aflopend gesorteerd", () => {
  const lijst = grootsteBesparingen();
  assert.equal(lijst.length, TOURS.length);
  for (let i = 1; i < lijst.length; i++) {
    assert.ok(
      lijst[i - 1].raming.besparingPerPersoonEur >= lijst[i].raming.besparingPerPersoonEur,
      "besparingen staan niet op volgorde"
    );
  }
});

test("euro formatteert in het Nederlands zonder centen", () => {
  assert.equal(euro(1234.56), "€1.235");
  assert.equal(euro(0), "€0");
  assert.equal(euro(999), "€999");
});
