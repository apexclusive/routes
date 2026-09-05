import test from "node:test";
import assert from "node:assert/strict";
import {
  ROUTE_FILE_EXTENSIONS,
  isRouteFileName,
  parseRouteFile,
  parseGeoJSON,
  preserveImportedTrack,
  getGoogleMapsUrl,
} from "../routing.ts";
import { buildTurnByTurn, selectNavigationAnchors, nlInstruction, type OSRMStep } from "../navigation.ts";
import type { Coordinates } from "../../types.ts";

/**
 * De import- en export-keten, getest van rauw bestand tot navigatie:
 * bestandsnaam → parsing → turn-by-turn → Google Maps-ankers.
 * (GPX/KML/TCX parsen via DOMParser en draaien alleen in de browser —
 * daar dekt de E2E-suite ze; GeoJSON-parsing is puur en hier meegenomen.)
 */

const MAASTRICHT: Coordinates = { lat: 50.8514, lng: 5.691 };
const VALKENBURG: Coordinates = { lat: 50.8702, lng: 5.8298 };

/* ---------- 1. bestandsherkenning ---------- */

test("routeflow:alle zeven routeformaten worden geaccepteerd", () => {
  assert.deepEqual(ROUTE_FILE_EXTENSIONS, [".gpx", ".kml", ".tcx", ".geojson", ".json", ".xml", ".fit"]);
  for (const name of ["rit.gpx", "RIT.GPX", "track.fit", "tocht.tcx", "kaart.kml", "route.geojson", "lijst.json", "export.xml"]) {
    assert.ok(isRouteFileName(name), `${name} moet geaccepteerd worden`);
  }
});

test("routeflow:geen routeformaten worden geweigerd", () => {
  for (const name of ["foto.png", "archive.zip", "document.pdf", "vals.gpx.bak", "geen-extensie"]) {
    assert.equal(isRouteFileName(name), false, `${name} moet geweigerd worden`);
  }
});

/* ---------- 2. parsing ---------- */

test("routeflow:GeoJSON LineString en FeatureCollection parsen naar punten", () => {
  const ls = parseRouteFile('{"type":"LineString","coordinates":[[5.691,50.8514],[5.8298,50.8702]]}');
  assert.ok(ls);
  assert.equal(ls.length, 2);
  assert.deepEqual(ls[0], MAASTRICHT);

  const fc = parseRouteFile(
    '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[5.691,50.8514],[5.7,50.86],[5.8298,50.8702]]}}]}',
  );
  assert.ok(fc);
  assert.equal(fc.length, 3);
});

test("routeflow:onbruikbare input levert null, geen crash", () => {
  assert.equal(parseRouteFile(""), null);
  assert.equal(parseRouteFile("dit is gewoon tekst"), null);
  assert.equal(parseGeoJSON("{geen json"), null);
  assert.equal(parseGeoJSON('{"type":"Point","coordinates":[5.6,50.8]}'), null);
});

test("routeflow:geldige upload behoudt vorm als wegroutering niet lukt", () => {
  const track = preserveImportedTrack([
    MAASTRICHT,
    { lat: 50.86, lng: 5.72 },
    VALKENBURG,
  ], "bicycle");
  assert.ok(track);
  assert.equal(track.preserved, true);
  assert.equal(track.estimated, true);
  assert.deepEqual(track.geometry.coordinates[0], [MAASTRICHT.lng, MAASTRICHT.lat]);
  assert.deepEqual(track.geometry.coordinates.at(-1), [VALKENBURG.lng, VALKENBURG.lat]);
  assert.ok(track.distance > 0);
  assert.ok(track.duration > 0);
});

/* ---------- 3. turn-by-turn in het Nederlands ---------- */

function step(type: string, modifier?: string, name?: string, distance = 500): OSRMStep {
  return {
    maneuver: { type, modifier, location: [5.691, 50.8514] },
    distance,
    duration: 60,
    name,
  };
}

test("routeflow:nlInstruction spreekt Nederlands met verkeersweg-onderscheid", () => {
  assert.equal(nlInstruction(step("turn", "left", "Kerkstraat")), "Sla linksaf naar de Kerkstraat");
  assert.equal(nlInstruction(step("turn", "right", "A2")), "Sla rechtsaf naar A2");
  assert.equal(nlInstruction(step("turn", "uturn")), "Keer om");
});

test("routeflow:buildTurnByTurn stapelt afstanden en slaat vertrek over", () => {
  const turns = buildTurnByTurn({
    legs: [
      {
        steps: [
          step("depart", undefined, "Startstraat", 100),
          step("turn", "left", "Kerkstraat", 400),
          step("turn", "right", "Bergweg", 600),
          step("arrive", undefined, undefined, 0),
        ],
      },
    ],
  });
  assert.equal(turns.length, 3); // depart valt weg
  assert.equal(turns[0].instruction, "Sla linksaf naar de Kerkstraat");
  assert.equal(turns[0].distanceFromStart, 500); // depart 100 + stap 400
  assert.equal(turns[1].distanceFromStart, 1100); // + 600
  assert.equal(turns[2].type, "arrive");
});

/* ---------- 4. Google Maps-ankers ---------- */

test("routeflow:ankers zijn max 11, beginnen bij start en eindigen bij finish", () => {
  // L-vormige route met één scherpe hoek (90° => beslispunt)
  const coords: [number, number][] = [];
  for (let i = 0; i < 20; i++) coords.push([5.6900 + i * 0.0005, 50.8500]);
  for (let i = 0; i < 20; i++) coords.push([5.6995, 50.8500 + i * 0.0005]);
  const anchors = selectNavigationAnchors({ type: "LineString", coordinates: coords });
  assert.ok(anchors.length >= 2 && anchors.length <= 11);
  assert.equal(anchors[0].reason, "start");
  assert.equal(anchors[anchors.length - 1].reason, "end");
});

/* ---------- 5. Google Maps-URL ---------- */

test("routeflow:twee punten worden origin + destination zonder waypoints", () => {
  const url = new URL(getGoogleMapsUrl([MAASTRICHT, VALKENBURG], true, "car"));
  assert.equal(url.searchParams.get("api"), "1");
  assert.equal(url.searchParams.get("origin"), "50.8514,5.691");
  assert.equal(url.searchParams.get("destination"), "50.8702,5.8298");
  assert.equal(url.searchParams.get("waypoints"), null);
  assert.equal(url.searchParams.get("dir_action"), "navigate");
  assert.equal(url.searchParams.get("travelmode"), "driving");
});

test("routeflow:tussenpunten gaan als waypoints mee en fiets wordt bicycling", () => {
  const mid: Coordinates = { lat: 50.86, lng: 5.75 };
  const url = new URL(getGoogleMapsUrl([MAASTRICHT, mid, VALKENBURG], false, "bicycle"));
  assert.equal(url.searchParams.get("waypoints"), "50.86,5.75");
  assert.equal(url.searchParams.get("travelmode"), "bicycling");
  assert.equal(url.searchParams.get("dir_action"), null); // zonder navigate-vlag
  assert.equal(getGoogleMapsUrl([MAASTRICHT], true, "car"), "");
});
