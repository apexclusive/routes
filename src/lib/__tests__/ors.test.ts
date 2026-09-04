import test from "node:test";
import assert from "node:assert/strict";

import { orsToRoute, ORS_PROFILES, type ORSResponse } from "../ors.ts";
import { buildTurnByTurn } from "../navigation.ts";

/** Antwoord zoals ORS het teruggeeft bij /v2/directions/{profile}/geojson. */
function orsResponse(): ORSResponse {
  return {
    features: [
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [5.6909, 50.8511],
            [5.6959, 50.8531],
            [5.7009, 50.8551],
            [5.7059, 50.8571],
            [5.7109, 50.8591],
          ],
        },
        properties: {
          summary: { distance: 1600, duration: 400 },
          segments: [
            {
              distance: 1600,
              duration: 400,
              steps: [
                {
                  distance: 400,
                  duration: 100,
                  type: 11,
                  instruction: "Head north on Stationsstraat",
                  name: "Stationsstraat",
                  way_points: [0, 1],
                },
                {
                  distance: 500,
                  duration: 120,
                  type: 0,
                  instruction: "Turn left onto Kerkstraat",
                  name: "Kerkstraat",
                  way_points: [1, 2],
                },
                {
                  distance: 400,
                  duration: 100,
                  type: 7,
                  instruction: "Enter the roundabout and take the 2nd exit",
                  name: "Ringweg",
                  exit_number: 2,
                  way_points: [2, 3],
                },
                {
                  distance: 300,
                  duration: 80,
                  type: 10,
                  instruction: "Arrive at your destination",
                  name: "-",
                  way_points: [3, 4],
                },
              ],
            },
          ],
        },
      },
    ],
  };
}

test("ORS: profielen zijn de fiets- en wandelvarianten", () => {
  assert.equal(ORS_PROFILES.bike, "cycling-regular");
  assert.equal(ORS_PROFILES.foot, "foot-walking");
  assert.equal(ORS_PROFILES.driving, undefined, "auto blijft via OSRM lopen");
});

test("ORS: geometrie, afstand en duur komen mee", () => {
  const route = orsToRoute(orsResponse());
  assert.ok(route);
  assert.equal(route.geometry.type, "LineString");
  assert.equal(route.geometry.coordinates.length, 5);
  assert.equal(route.distance, 1600);
  assert.equal(route.duration, 400);
});

test("ORS: manoeuvrecodes worden OSRM-type en -modifier", () => {
  const route = orsToRoute(orsResponse());
  const steps = route!.legs[0].steps;

  assert.equal(steps[0].maneuver.type, "depart");
  assert.equal(steps[1].maneuver.type, "turn");
  assert.equal(steps[1].maneuver.modifier, "left");
  assert.equal(steps[2].maneuver.type, "roundabout");
  assert.equal(steps[2].maneuver.exit, 2);
  assert.equal(steps[3].maneuver.type, "arrive");
});

test("ORS: stap-locatie komt uit way_points, niet uit de eerste coördinaat", () => {
  const route = orsToRoute(orsResponse());
  const steps = route!.legs[0].steps;
  assert.deepEqual(steps[1].maneuver.location, [5.6959, 50.8531]);
  assert.deepEqual(steps[2].maneuver.location, [5.7009, 50.8551]);
});

test("ORS: de naamloze straat '-' wordt weggelaten", () => {
  const route = orsToRoute(orsResponse());
  assert.equal(route!.legs[0].steps[3].name, undefined);
  assert.equal(route!.legs[0].steps[1].name, "Kerkstraat");
});

test("ORS: het resultaat levert een Nederlandse routebeschrijving op", () => {
  const route = orsToRoute(orsResponse());
  const turns = buildTurnByTurn(route!);

  assert.deepEqual(
    turns.map((t) => t.instruction),
    [
      "Sla linksaf naar de Kerkstraat",
      "Rotonde: neem de 2e afslag naar de Ringweg",
      "Aangekomen op je bestemming",
    ]
  );
  // afstanden zijn cumulatief vanaf de start
  assert.equal(turns[0].distanceFromStart, 900);
});

test("ORS: onbekende manoeuvrecode valt terug op rechtdoor", () => {
  const data = orsResponse();
  data.features![0].properties!.segments![0].steps![1].type = 99;
  const route = orsToRoute(data);
  assert.equal(route!.legs[0].steps[1].maneuver.type, "continue");
  assert.equal(route!.legs[0].steps[1].maneuver.modifier, "straight");
});

test("ORS: meerdere segmenten worden opgeteld tot losse legs", () => {
  const data = orsResponse();
  const segments = data.features![0].properties!.segments!;
  segments.push({ distance: 900, duration: 200, steps: [] });
  delete data.features![0].properties!.summary;

  const route = orsToRoute(data);
  assert.equal(route!.legs.length, 2);
  assert.equal(route!.distance, 2500);
  assert.equal(route!.duration, 600);
});

test("ORS: ontbrekende segmenten vallen terug op de summary", () => {
  const data: ORSResponse = {
    features: [
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [5.69, 50.85],
            [5.7, 50.86],
          ],
        },
        properties: { summary: { distance: 1200, duration: 300 } },
      },
    ],
  };
  const route = orsToRoute(data);
  assert.equal(route!.distance, 1200);
  assert.equal(route!.duration, 300);
  assert.deepEqual(route!.legs, []);
});

test("ORS: rommel geeft null in plaats van een halve route", () => {
  assert.equal(orsToRoute(null), null);
  assert.equal(orsToRoute(undefined), null);
  assert.equal(orsToRoute({}), null);
  assert.equal(orsToRoute({ features: [] }), null);
  assert.equal(orsToRoute({ features: [{ geometry: {} }] }), null);
  assert.equal(
    orsToRoute({ features: [{ geometry: { coordinates: [[5.7, 50.85]] } }] }),
    null,
    "één punt is geen route"
  );
});

test("ORS: onmogelijke coördinaten worden eruit gefilterd", () => {
  const data: ORSResponse = {
    features: [
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [5.69, 50.85],
            [999, 999],
            ["x", "y"],
            null,
            [5.7, 50.86],
          ] as unknown[],
        },
        properties: { summary: { distance: 100, duration: 20 } },
      },
    ],
  };
  const route = orsToRoute(data);
  assert.equal(route!.geometry.coordinates.length, 2);
});
