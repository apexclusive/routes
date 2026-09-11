import test from "node:test";
import assert from "node:assert/strict";
import {
  afstandKm,
  afstandLabel,
  boundingBox,
  clusters,
  dichtstbij,
  middelpunt,
  wegAfstandKm,
} from "../geo.ts";
import { CLIMBS } from "../climbs.ts";

test("geo:afstand klopt met bekende referenties", () => {
  // Maastricht -> Valkenburg is hemelsbreed ongeveer 11 km
  const maastricht = { lat: 50.8514, lon: 5.691 };
  const valkenburg = { lat: 50.8646, lon: 5.829 };
  const km = afstandKm(maastricht, valkenburg);
  assert.ok(km > 8 && km < 14, `Maastricht-Valkenburg raar: ${km.toFixed(1)} km`);

  // Amsterdam -> Parijs is ongeveer 430 km hemelsbreed
  const parijs = afstandKm({ lat: 52.3676, lon: 4.9041 }, { lat: 48.8566, lon: 2.3522 });
  assert.ok(parijs > 400 && parijs < 460, `Amsterdam-Parijs raar: ${parijs.toFixed(0)} km`);

  // dezelfde plek is nul, en de functie is symmetrisch
  assert.equal(afstandKm(parijsPunt(), parijsPunt()), 0);
  assert.ok(
    Math.abs(afstandKm(maastricht, valkenburg) - afstandKm(valkenburg, maastricht)) < 1e-9
  );
});

function parijsPunt() {
  return { lat: 48.8566, lon: 2.3522 };
}

test("geo:wegafstand is altijd langer dan hemelsbreed", () => {
  const a = { lat: 46.5285, lon: 10.4534 };
  const b = { lat: 46.3436, lon: 10.4917 };
  assert.ok(wegAfstandKm(a, b) > afstandKm(a, b));
  assert.ok(Math.abs(wegAfstandKm(a, b, 1) - afstandKm(a, b)) < 1e-9);
});

test("geo:dichtstbij vindt echte buren en sluit zichzelf uit", () => {
  const stelvio = CLIMBS.find((c) => c.id === "stelvio");
  assert.ok(stelvio);
  const buren = dichtstbij(stelvio, CLIMBS, { max: 3, binnenKm: 120 });
  assert.ok(buren.length > 0, "Stelvio hoort buren te hebben");
  assert.ok(!buren.some((b) => b.item.id === "stelvio"), "zichzelf niet meetellen");
  // Gavia en Mortirolo liggen echt vlakbij de Stelvio
  const ids = buren.map((b) => b.item.id);
  assert.ok(
    ids.includes("passo-gavia") || ids.includes("mortirolo"),
    `verwachtte Gavia/Mortirolo, kreeg: ${ids.join(", ")}`
  );
  // oplopend gesorteerd
  for (let i = 1; i < buren.length; i += 1) {
    assert.ok(buren[i - 1].km <= buren[i].km, "niet oplopend gesorteerd");
  }
});

test("geo:dichtstbij respecteert de straal en de limiet", () => {
  const cauberg = CLIMBS.find((c) => c.id === "cauberg");
  assert.ok(cauberg);
  const dichtbij = dichtstbij(cauberg, CLIMBS, { max: 50, binnenKm: 25 });
  for (const b of dichtbij) {
    assert.ok(b.km <= 25, `${b.item.id} ligt op ${b.km} km, buiten de straal`);
  }
  // Limburgse buren moeten gevonden worden, de Alpen niet
  assert.ok(dichtbij.length >= 3, "Zuid-Limburg heeft meerdere klimmen dicht bijeen");
  assert.ok(!dichtbij.some((b) => b.item.country === "IT"));
  assert.ok(dichtstbij(cauberg, CLIMBS, { max: 2 }).length === 2, "limiet niet gerespecteerd");
});

test("geo:middelpunt en boundingBox omsluiten alle punten", () => {
  const punten = CLIMBS.filter((c) => c.country === "NL");
  const mid = middelpunt(punten);
  const box = boundingBox(punten);
  assert.ok(box);
  assert.ok(mid.lat >= box.zuid && mid.lat <= box.noord, "middelpunt buiten de box");
  assert.ok(mid.lon >= box.west && mid.lon <= box.oost, "middelpunt buiten de box");
  for (const p of punten) {
    assert.ok(p.lat <= box.noord && p.lat >= box.zuid, "punt buiten de box");
    assert.ok(p.lon <= box.oost && p.lon >= box.west, "punt buiten de box");
  }
  assert.equal(boundingBox([]), null);
  assert.deepEqual(middelpunt([]), { lat: 0, lon: 0 });
});

test("geo:clustering scheidt de Benelux van de Alpen", () => {
  const groepen = clusters(CLIMBS, 90);
  assert.ok(groepen.length >= 3, `te weinig clusters: ${groepen.length}`);
  // elke klim komt precies één keer voor
  const totaal = groepen.reduce((n, g) => n + g.length, 0);
  assert.equal(totaal, CLIMBS.length, "clustering verliest of dupliceert klimmen");
  // het grootste cluster mag niet de hele bibliotheek zijn
  assert.ok(groepen[0].length < CLIMBS.length, "alles in één cluster is geen clustering");
  // binnen een cluster mag niets uit een compleet ander gebergte zitten
  for (const groep of groepen) {
    const landen = new Set(groep.map((c) => c.country));
    assert.ok(!(landen.has("NL") && landen.has("IT")), "NL en IT in hetzelfde cluster");
  }
});

test("geo:afstandslabels lezen als Nederlands", () => {
  assert.equal(afstandLabel(0.4), "400 m");
  assert.equal(afstandLabel(3.25), "3,3 km");
  assert.equal(afstandLabel(42.7), "43 km");
});
