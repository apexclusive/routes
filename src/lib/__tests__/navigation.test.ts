import test from "node:test";
import assert from "node:assert/strict";

import {
  nlInstruction,
  buildTurnByTurn,
  selectNavigationAnchors,
  type OSRMStep,
} from "../navigation.ts";
import type { GeoJSON } from "../../types.ts";

/* ---------- helpers ---------- */

/** Verplaats een punt `meters` ver in richting `bearing` (graden). */
function move(
  lng: number,
  lat: number,
  meters: number,
  bearing: number
): [number, number] {
  const dLat = (meters * Math.cos((bearing * Math.PI) / 180)) / 111320;
  const dLng =
    (meters * Math.sin((bearing * Math.PI) / 180)) /
    (111320 * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

/**
 * Bouwt een zigzag-lijn: `legs` rechte stukken van `legMeters`, met tussen elk
 * stuk een scherpe koerswijziging. Elk recht stuk krijgt tussenpunten zodat de
 * hoekpunten de enige plekken met een echte afslag zijn.
 */
function zigzag(legs: number, legMeters = 2000, turn = 70): GeoJSON.LineString {
  const coords: [number, number][] = [[5.7, 50.85]];
  let bearing = 0;
  for (let l = 0; l < legs; l++) {
    const steps = 8;
    for (let s = 0; s < steps; s++) {
      const last = coords[coords.length - 1];
      coords.push(move(last[0], last[1], legMeters / steps, bearing));
    }
    bearing = (bearing + (l % 2 === 0 ? turn : -turn) + 360) % 360;
  }
  return { type: "LineString", coordinates: coords as GeoJSON.Position[] };
}

function step(
  type: string,
  modifier?: string,
  name?: string,
  distance = 500,
  exit?: number
): OSRMStep {
  return {
    maneuver: { type, modifier, exit, location: [5.7, 50.85] },
    distance,
    duration: distance / 14,
    name,
  };
}

/* ---------- nlInstruction ---------- */

test("nlInstruction: straatnaam krijgt een lidwoord, wegnummer niet", () => {
  assert.equal(
    nlInstruction(step("turn", "left", "Kerkstraat")),
    "Sla linksaf naar de Kerkstraat"
  );
  assert.equal(nlInstruction(step("turn", "right", "A2")), "Sla rechtsaf naar A2");
  assert.equal(nlInstruction(step("turn", "right", "N278")), "Sla rechtsaf naar N278");
  // zonder wegnaam blijft de kale instructie over
  assert.equal(nlInstruction(step("turn", "left")), "Sla linksaf");
});

test("nlInstruction: rotonde noemt de afslag", () => {
  assert.equal(
    nlInstruction(step("roundabout", "right", "Dorpsstraat", 300, 2)),
    "Rotonde: neem de 2e afslag naar de Dorpsstraat"
  );
  assert.equal(nlInstruction(step("rotary", "right", undefined, 300)), "Ga de rotonde op");
  assert.equal(nlInstruction(step("exit roundabout", "right")), "Verlaat de rotonde");
});

test("nlInstruction: ruis wordt onderdrukt, vertrek en aankomst niet", () => {
  assert.equal(nlInstruction(step("new name", "straight", "Rijksweg")), null);
  assert.equal(nlInstruction(step("notification", "straight")), null);
  assert.equal(nlInstruction(step("depart", undefined, "Stationsplein")), "Vertrek op de Stationsplein");
  assert.equal(nlInstruction(step("arrive")), "Aangekomen op je bestemming");
});

test("nlInstruction: onbekend type valt terug op links/rechts", () => {
  assert.equal(nlInstruction(step("verzonnen-type", "left", "Bosweg")), "Sla linksaf naar de Bosweg");
  assert.equal(nlInstruction(step("verzonnen-type", "uturn")), "Keer om");
  assert.equal(nlInstruction(step("verzonnen-type", "straight")), null);
});

/* ---------- buildTurnByTurn ---------- */

test("buildTurnByTurn: vertrek valt weg, afstanden lopen cumulatief op", () => {
  const turns = buildTurnByTurn({
    legs: [
      {
        steps: [
          step("depart", undefined, "Stationsplein", 200),
          step("turn", "left", "Kerkstraat", 800),
          step("turn", "right", "A2", 1000),
          step("arrive", undefined, undefined, 0),
        ],
      },
    ],
  });

  assert.equal(turns.length, 3);
  assert.equal(turns[0].instruction, "Sla linksaf naar de Kerkstraat");
  assert.equal(turns[0].distanceFromStart, 1000); // 200 + 800
  assert.equal(turns[1].distanceFromStart, 2000);
  assert.equal(turns[2].type, "arrive");
});

test("buildTurnByTurn: ruisstappen komen niet in de beschrijving", () => {
  const turns = buildTurnByTurn({
    legs: [
      {
        steps: [
          step("new name", "straight", "Rijksweg", 400),
          step("turn", "left", "Kerkstraat", 400),
          step("notification", "straight", undefined, 100),
        ],
      },
    ],
  });
  assert.deepEqual(
    turns.map((t) => t.instruction),
    ["Sla linksaf naar de Kerkstraat"]
  );
});

test("buildTurnByTurn: bij een cap blijven de belangrijkste stappen én de aankomst over", () => {
  const steps: OSRMStep[] = [];
  for (let i = 0; i < 40; i++) {
    steps.push(step("continue", "slight left", `Zijweg ${i}`, 300));
  }
  steps.push(step("turn", "sharp right", "Bergweg", 500));
  steps.push(step("roundabout", "right", "Ringweg", 300, 3));
  steps.push(step("arrive", undefined, undefined, 0));

  const turns = buildTurnByTurn({ legs: [{ steps }] }, 3);

  assert.ok(turns.length <= 4, `verwacht ≤4 instructies, kreeg ${turns.length}`);
  const texts = turns.map((t) => t.instruction);
  assert.ok(texts.some((t) => t.includes("scherp rechtsaf")), "scherpe bocht ontbreekt");
  assert.ok(texts.some((t) => t.startsWith("Rotonde")), "rotonde ontbreekt");
  assert.equal(turns[turns.length - 1].type, "arrive", "aankomst moet behouden blijven");
});

test("buildTurnByTurn: lege of ontbrekende legs geven een lege lijst", () => {
  assert.deepEqual(buildTurnByTurn({}), []);
  assert.deepEqual(buildTurnByTurn({ legs: [] }), []);
  assert.deepEqual(buildTurnByTurn({ legs: [{ steps: [] }] }), []);
});

/* ---------- selectNavigationAnchors ---------- */

test("selectNavigationAnchors: start en eind liggen altijd op de lijn", () => {
  const line = zigzag(6);
  const cs = line.coordinates;
  const anchors = selectNavigationAnchors(line, 9);

  assert.equal(anchors[0].reason, "start");
  assert.equal(anchors[anchors.length - 1].reason, "end");
  assert.equal(anchors[0].coordinates.lng, cs[0][0]);
  assert.equal(anchors[0].coordinates.lat, cs[0][1]);
  assert.equal(anchors[anchors.length - 1].coordinates.lng, cs[cs.length - 1][0]);
  assert.equal(anchors[anchors.length - 1].coordinates.lat, cs[cs.length - 1][1]);
});

test("selectNavigationAnchors: elk anker is een bestaand punt van de geometrie", () => {
  const line = zigzag(8);
  const onLine = new Set(line.coordinates.map((c) => `${c[0]},${c[1]}`));
  for (const a of selectNavigationAnchors(line, 9)) {
    assert.ok(
      onLine.has(`${a.coordinates.lng},${a.coordinates.lat}`),
      "anker ligt niet exact op de weg"
    );
  }
});

test("selectNavigationAnchors: nooit meer dan 9 tussenankers (11 totaal)", () => {
  const anchors = selectNavigationAnchors(zigzag(30), 9);
  assert.ok(anchors.length <= 11, `verwacht ≤11 ankers, kreeg ${anchors.length}`);
  assert.equal(anchors.filter((a) => a.reason !== "start" && a.reason !== "end").length, 9);
});

test("selectNavigationAnchors: kiest de hoekpunten van een zigzag", () => {
  const legs = 6;
  const line = zigzag(legs);
  const anchors = selectNavigationAnchors(line, 9);

  // hoekpunten liggen op index 8, 16, 24, ... (8 tussenstappen per been)
  const corners = new Set<string>();
  for (let l = 1; l < legs; l++) {
    const c = line.coordinates[l * 8];
    corners.add(`${c[0]},${c[1]}`);
  }

  const turns = anchors.filter((a) => a.reason === "turn");
  assert.ok(turns.length >= 3, `verwacht minstens 3 afslag-ankers, kreeg ${turns.length}`);
  for (const t of turns) {
    assert.ok(
      corners.has(`${t.coordinates.lng},${t.coordinates.lat}`),
      "afslag-anker ligt niet op een hoekpunt van de zigzag"
    );
    assert.ok((t.delta ?? 0) >= 22, "afslag-anker zonder noemenswaardige hoek");
  }
});

test("selectNavigationAnchors: twee punten leveren alleen start en eind op", () => {
  const line: GeoJSON.LineString = {
    type: "LineString",
    coordinates: [
      [5.7, 50.85],
      [5.8, 50.9],
    ] as GeoJSON.Position[],
  };
  const anchors = selectNavigationAnchors(line, 9);
  assert.equal(anchors.length, 2);
  assert.deepEqual(
    anchors.map((a) => a.reason),
    ["start", "end"]
  );
});

test("selectNavigationAnchors: maxIntermediate 0 levert alleen start en eind op", () => {
  const anchors = selectNavigationAnchors(zigzag(6), 0);
  assert.equal(anchors.length, 2);
});

test("selectNavigationAnchors: vult een rechte lijn met gelijkmatige tussenankers", () => {
  // kaarsrechte lijn: geen enkele afslag, dus alleen spacing-ankers
  const coords: [number, number][] = [];
  for (let i = 0; i <= 60; i++) coords.push(move(5.7, 50.85, i * 500, 90));
  const line: GeoJSON.LineString = {
    type: "LineString",
    coordinates: coords as GeoJSON.Position[],
  };

  const anchors = selectNavigationAnchors(line, 4);
  assert.equal(anchors.length, 6);
  // oplopend langs de lijn, geen dubbelen
  const lngs = anchors.map((a) => a.coordinates.lng);
  for (let i = 1; i < lngs.length; i++) {
    assert.ok(lngs[i] > lngs[i - 1], "ankers staan niet in volgorde langs de route");
  }
  // zonder afslagen is elk tussenanker opvulling, niet "turn"
  const middle = anchors.slice(1, -1);
  assert.equal(middle.length, 4);
  assert.ok(
    middle.every((a) => a.reason === "spacing"),
    "opvul-ankers moeten reason 'spacing' krijgen, niet 'turn'"
  );
  assert.ok(
    middle.every((a) => a.delta === undefined),
    "opvul-ankers hebben geen afslaghoek"
  );
});
