import test from "node:test";
import assert from "node:assert/strict";

import { parseUserInput, corridorDisplayName } from "../parser.ts";

/* ---------- nieuwe corridors ---------- */

test("corridors: Vogezen wordt herkend, ook op de Route des Crêtes", () => {
  for (const text of [
    "mooie motorrit door de Vogezen",
    "route des crêtes met de motor",
    "route des cretes",
    "rondje Grand Ballon",
    "via Le Markstein naar het zuiden",
    "col de la Schlucht",
  ]) {
    assert.equal(parseUserInput(text).corridor, "vogezen", `mist: ${text}`);
  }
  assert.equal(corridorDisplayName("vogezen"), "Vogezen (Route des Crêtes)");
});

test("corridors: Sauerland wordt herkend", () => {
  for (const text of [
    "dagtocht Sauerland",
    "rondrit vanaf Winterberg",
    "fietsroute Schmallenberg",
    "langs de Biggesee",
  ]) {
    assert.equal(parseUserInput(text).corridor, "sauerland", `mist: ${text}`);
  }
  assert.equal(corridorDisplayName("sauerland"), "Sauerland");
});

test("corridors: Müllerthal wordt herkend, met en zonder trema", () => {
  for (const text of [
    "wandeling door het Müllerthal",
    "mullerthal trail",
    "klein zwitserland luxemburg",
    "rondje Echternach",
    "vanaf Larochette",
  ]) {
    assert.equal(parseUserInput(text).corridor, "mullerthal", `mist: ${text}`);
  }
  assert.equal(corridorDisplayName("mullerthal"), "Müllerthal (Luxemburg)");
});

/* ---------- geen regressies op de bestaande corridors ---------- */

test("corridors: bestaande gebieden blijven werken", () => {
  const cases: [string, string][] = [
    ["mergellandroute", "mergellandroute"],
    ["rondje Zuid-Limburg", "mergellandroute"],
    ["motorrit door het Zwarte Woud", "zwarte-woud"],
    ["Eifel rondrit vanaf Monschau", "eifel"],
    ["Ardennen, langs Durbuy", "ardennen"],
    ["Veluwe fietsroute", "veluwe"],
    ["Zeeland langs Domburg", "zeeland"],
  ];
  for (const [text, expected] of cases) {
    assert.equal(parseUserInput(text).corridor, expected, `mist: ${text}`);
  }
});

test("corridors: gewone ritten krijgen geen corridor opgeplakt", () => {
  for (const text of [
    "van Amsterdam naar Rotterdam",
    "100 km rondje met de motor",
    "snelste route naar mijn werk",
  ]) {
    assert.equal(parseUserInput(text).corridor, null, `onterecht: ${text}`);
  }
});

test("corridors: onbekende naam valt terug op zichzelf", () => {
  assert.equal(corridorDisplayName("verzonnen"), "verzonnen");
});

/* ---------- overige parsing blijft intact ---------- */

test("parser: voertuig, afstand en rondrit naast een nieuwe corridor", () => {
  const intent = parseUserInput("kronkelige motorrit van 250 km door de Vogezen, rondrit");
  assert.equal(intent.vehicle, "motorcycle");
  assert.equal(intent.distance, 250);
  assert.equal(intent.roundTrip, true);
  assert.equal(intent.scenic, true);
  assert.equal(intent.corridor, "vogezen");
});

test("parser: wandeling door het Müllerthal levert het juiste voertuig op", () => {
  const intent = parseUserInput("wandeling van 15 km door het Müllerthal");
  assert.equal(intent.vehicle, "pedestrian");
  assert.equal(intent.distance, 15);
  assert.equal(intent.corridor, "mullerthal");
});

/* ---------- bestandsherkenning (GPX/KML/TCX/GeoJSON) ---------- */

import { isRouteFileName, ROUTE_FILE_EXTENSIONS } from "../routefiles.ts";

test("bestanden: bekende route-extensies worden herkend (ook hoofdletters)", () => {
  for (const name of [
    "rondje.gpx",
    "Mergelland.GPX",
    "track.tcx",
    "Route.TCX",
    "garmin.xml",
    "export.kml",
    "route.geojson",
    "data.json",
  ]) {
    assert.equal(isRouteFileName(name), true, `moet geldig zijn: ${name}`);
  }
});

test("bestanden: geen route-extensies worden afgewezen", () => {
  for (const name of ["foto.jpg", "route.gpx.bak", "kaart.png", "document.pdf", "gpx"]) {
    assert.equal(isRouteFileName(name), false, `moet ongeldig zijn: ${name}`);
  }
});

test("bestanden: extensielijst dekt gpx/kml/tcx/geojson/json/xml", () => {
  for (const ext of [".gpx", ".kml", ".tcx", ".geojson", ".json", ".xml"]) {
    assert.ok(ROUTE_FILE_EXTENSIONS.includes(ext), `ontbreekt: ${ext}`);
  }
});
