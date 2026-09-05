import test from "node:test";
import assert from "node:assert/strict";
import { CLIMBS } from "../climbs.ts";
import {
  TOURS,
  tourHoogtemeters,
  tourKlimmen,
  tourKm,
  tourRijmin,
  tourZwaarte,
  toursOpZwaarte,
} from "../tours.ts";
import { afstandKm } from "../geo.ts";

import { buildTourFaq } from "../faq.ts";

test("tours:ids zijn uniek en URL-safe", () => {
  const ids = TOURS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, "dubbele tour-ids");
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `niet URL-safe: ${id}`);
});

test("tours:elke tour is compleet ingevuld", () => {
  assert.ok(TOURS.length >= 5, "te weinig tours");
  for (const t of TOURS) {
    assert.ok(t.naam.length > 5, `naam te mager: ${t.id}`);
    assert.ok(t.basiskamp.length > 2, `basiskamp mist: ${t.id}`);
    assert.ok(t.waaromHier.length > 60, `motivatie te mager: ${t.id}`);
    assert.ok(t.dagen.length >= 2, `te weinig dagen: ${t.id}`);
    assert.ok(t.kosten.length >= 1, `kosten niet vermeld: ${t.id}`);
    assert.ok(t.voertuigen.length >= 1, `geen voertuig: ${t.id}`);
    assert.ok(t.bron.length > 5, `bron mist: ${t.id}`);
    // je boekt één nacht minder dan je dagen rijdt, of evenveel
    assert.ok(
      t.nachten >= t.dagen.length - 1 && t.nachten <= t.dagen.length + 1,
      `nachten passen niet bij de dagen: ${t.id}`
    );
  }
});

test("tours:dagritten hebben realistische afstanden en snelheden", () => {
  for (const t of TOURS) {
    for (const d of t.dagen) {
      assert.ok(d.lengthKm >= 40 && d.lengthKm <= 350, `dagafstand raar: ${t.id}/${d.titel}`);
      assert.ok(d.rijmin >= 60 && d.rijmin <= 420, `rijtijd raar: ${t.id}/${d.titel}`);
      const kmu = d.lengthKm / (d.rijmin / 60);
      // bergwegen: tussen 20 en 70 km/u gemiddeld is geloofwaardig
      assert.ok(kmu >= 20 && kmu <= 70, `${t.id}/${d.titel}: ${kmu.toFixed(0)} km/u is raar`);
      assert.ok(d.omschrijving.length > 40, `omschrijving te mager: ${d.titel}`);
      assert.ok(d.prompt.length > 30, `prompt te mager: ${d.titel}`);
    }
  }
});

test("tours:alle klim-verwijzingen bestaan echt in de bibliotheek", () => {
  const bekend = new Set(CLIMBS.map((c) => c.id));
  for (const t of TOURS) {
    for (const d of t.dagen) {
      for (const id of d.klimIds) {
        assert.ok(bekend.has(id), `onbekende klim ${id} in ${t.id}/${d.titel}`);
      }
    }
  }
});

test("tours:de klimmen liggen echt in de buurt van het basiskamp", () => {
  // Een basiskamp is alleen zinvol als je er 's avonds weer bent. We toetsen
  // dat elke genoemde klim binnen een geloofwaardige dagstraal ligt van het
  // zwaartepunt van de tour.
  for (const t of TOURS) {
    const klimmen = tourKlimmen(t);
    if (klimmen.length < 2) continue;
    for (const a of klimmen) {
      const dichtsteBuur = Math.min(
        ...klimmen.filter((b) => b.id !== a.id).map((b) => afstandKm(a, b))
      );
      assert.ok(
        dichtsteBuur <= 120,
        `${t.id}: ${a.name} ligt ${dichtsteBuur.toFixed(0)} km van de rest — geen basiskamp meer`
      );
    }
  }
});

test("tours:totalen kloppen met de dagen", () => {
  for (const t of TOURS) {
    const km = tourKm(t);
    const min = tourRijmin(t);
    assert.equal(km, t.dagen.reduce((n, d) => n + d.lengthKm, 0));
    assert.equal(min, t.dagen.reduce((n, d) => n + d.rijmin, 0));
    assert.ok(km > 100, `tour te kort om te boeken: ${t.id}`);
    // hoogtemeters mogen nooit negatief of absurd zijn
    const hm = tourHoogtemeters(t);
    assert.ok(hm >= 0 && hm < 12000, `hoogtemeters raar: ${t.id} (${hm})`);
  }
});

test("tours:zwaarte loopt van Limburg naar de Alpen", () => {
  const oplopend = toursOpZwaarte();
  assert.equal(oplopend.length, TOURS.length);
  for (let i = 1; i < oplopend.length; i += 1) {
    assert.ok(
      tourZwaarte(oplopend[i - 1]) <= tourZwaarte(oplopend[i]),
      "niet oplopend gesorteerd op zwaarte"
    );
  }
  // het Limburgse weekend hoort lichter te zijn dan de Stelvio-week
  const limburg = TOURS.find((t) => t.id === "zuid-limburg-valkenburg");
  const stelvio = TOURS.find((t) => t.id === "stelvio-bormio");
  assert.ok(limburg && stelvio);
  assert.ok(
    tourZwaarte(limburg) < tourZwaarte(stelvio),
    "Limburg zwaarder dan de Stelvio — er klopt iets niet"
  );
});

test("tours:tolwegen en vignetten worden eerlijk vermeld", () => {
  const oostenrijk = TOURS.find((t) => t.country === "AT");
  assert.ok(oostenrijk, "geen Oostenrijkse tour");
  const kosten = oostenrijk.kosten.join(" ").toLowerCase();
  assert.ok(kosten.includes("vignet"), "Oostenrijks vignet niet vermeld");
  assert.ok(/tol|ticket|euro/.test(kosten), "Grossglockner-tol niet vermeld");

  const zwitserland = TOURS.find((t) => t.country === "CH");
  assert.ok(zwitserland);
  assert.ok(
    zwitserland.kosten.join(" ").toLowerCase().includes("vignet"),
    "Zwitsers vignet niet vermeld"
  );
});

test("tours:de vergelijking met georganiseerde reizen is onderbouwd", () => {
  for (const t of TOURS) {
    assert.ok(
      t.georganiseerdVanafEur >= 300 && t.georganiseerdVanafEur <= 6000,
      `prijsvergelijking onrealistisch: ${t.id}`
    );
    // alpentours horen duurder te zijn dan een weekend in de Benelux
    if (["IT", "CH", "AT"].includes(t.country)) {
      assert.ok(t.georganiseerdVanafEur >= 1000, `alpentour te goedkoop ingeschat: ${t.id}`);
    }
  }
});

test("elke tour heeft een FAQ met bruikbare, gevulde antwoorden", () => {
  for (const t of TOURS) {
    const faq = buildTourFaq(t);
    assert.ok(faq.length >= 5, `${t.id}: te weinig faq-items`);
    for (const item of faq) {
      assert.ok(item.q.endsWith("?"), `${t.id}: "${item.q}" is geen vraag`);
      assert.ok(item.a.length > 60, `${t.id}: antwoord te kort bij "${item.q}"`);
      assert.ok(!/undefined|NaN/.test(item.a), `${t.id}: kapot antwoord bij "${item.q}"`);
    }
    // de prijsvergelijking is het verkoopargument: die moet erin staan
    assert.ok(
      faq.some((f) => f.a.includes(t.georganiseerdVanafEur.toLocaleString("nl-NL"))),
      `${t.id}: faq noemt de prijs van een georganiseerde reis niet`
    );
  }
});

test("elke tour is bereikbaar vanuit de sitemap en heeft een uniek id", () => {
  const ids = TOURS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, "dubbele tour-id");
  for (const id of ids) {
    assert.match(id, /^[a-z0-9-]+$/, `${id} is geen url-veilige slug`);
  }
});
