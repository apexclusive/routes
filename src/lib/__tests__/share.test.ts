import test from "node:test";
import assert from "node:assert/strict";

import {
  buildShareUrls,
  encodePolyline,
  decodePolyline,
  encodeRoute,
  decodeRoute,
  buildShareUrl,
  MAX_HASH_LENGTH,
  type ShareableRoute,
} from "../share.ts";
import {
  toStoredRoute,
  fromStoredRoute,
  parseStoredRoutes,
  type StoredRoute,
} from "../storage.ts";
import type { GeoJSON, Route } from "../../types.ts";

/* ---------- polyline ---------- */

test("polyline: round-trip blijft binnen 1 meter", () => {
  const coords = [
    [5.6909, 50.8511],
    [5.7219, 50.7781],
    [5.833, 50.7553],
    [5.8893, 50.813],
  ] as GeoJSON.Position[];

  const decoded = decodePolyline(encodePolyline(coords));
  assert.equal(decoded.length, coords.length);
  decoded.forEach((c, i) => {
    assert.ok(Math.abs(c[0] - coords[i][0]) < 1e-5, `lng ${i} wijkt af`);
    assert.ok(Math.abs(c[1] - coords[i][1]) < 1e-5, `lat ${i} wijkt af`);
  });
});

test("polyline: negatieve coördinaten en de nulmeridiaan", () => {
  const coords = [
    [-0.1276, 51.5072],
    [0.0, 51.4],
    [-3.7038, 40.4168],
  ] as GeoJSON.Position[];
  const decoded = decodePolyline(encodePolyline(coords));
  decoded.forEach((c, i) => {
    assert.ok(Math.abs(c[0] - coords[i][0]) < 1e-5);
    assert.ok(Math.abs(c[1] - coords[i][1]) < 1e-5);
  });
});

test("polyline: is fors compacter dan losse JSON-getallen", () => {
  const coords: GeoJSON.Position[] = [];
  for (let i = 0; i < 500; i++) {
    coords.push([5.7 + i * 0.001, 50.85 + i * 0.0007] as GeoJSON.Position);
  }
  const encoded = encodePolyline(coords);
  assert.ok(
    encoded.length < JSON.stringify(coords).length / 3,
    "polyline zou minstens 3× compacter moeten zijn"
  );
});

test("polyline: lege invoer en rommel leveren geen exceptie op", () => {
  assert.equal(encodePolyline([]), "");
  assert.deepEqual(decodePolyline(""), []);
  assert.doesNotThrow(() => decodePolyline("!!!niet-eens-polyline!!!"));
});

/* ---------- deel-links ---------- */

function sampleRoute(points: number): ShareableRoute {
  const coords: GeoJSON.Position[] = [];
  for (let i = 0; i < points; i++) {
    coords.push([5.7 + i * 0.0004, 50.85 + i * 0.0003] as GeoJSON.Position);
  }
  return {
    name: "Mergellandroute",
    vehicle: "motorcycle",
    waypoints: [
      { name: "Maastricht", coordinates: { lat: 50.8511, lng: 5.6909 } },
      { name: "Slenaken", coordinates: { lat: 50.7553, lng: 5.833 } },
    ],
    geometry: { type: "LineString", coordinates: coords },
  };
}

test("deel-link: route overleeft coderen en decoderen", () => {
  const { hash, geometryIncluded } = encodeRoute(sampleRoute(200));
  assert.ok(geometryIncluded, "geometrie zou mee moeten gaan");

  const back = decodeRoute(hash);
  assert.ok(back, "decoderen mislukte");
  assert.equal(back.name, "Mergellandroute");
  assert.equal(back.vehicle, "motorcycle");
  assert.equal(back.waypoints.length, 2);
  assert.equal(back.waypoints[0].name, "Maastricht");
  assert.ok(Math.abs(back.waypoints[0].coordinates.lat - 50.8511) < 1e-5);
  assert.equal(back.geometry?.coordinates.length, 200);
});

test("deel-link: hash is URL-veilig", () => {
  const { hash } = encodeRoute(sampleRoute(50));
  assert.match(hash, /^[A-Za-z0-9_-]+$/, "hash bevat tekens die in een URL escapen");
  assert.equal(
    buildShareUrl("https://apex.example", "/", hash),
    `https://apex.example/#r=${hash}`
  );
});

test("deel-link: te lange geometrie valt terug op alleen de routepunten", () => {
  const { hash, geometryIncluded } = encodeRoute(sampleRoute(20000));
  assert.equal(geometryIncluded, false, "geometrie had eruit moeten vallen");
  assert.ok(hash.length <= MAX_HASH_LENGTH, `hash is ${hash.length} tekens`);

  const back = decodeRoute(hash);
  assert.ok(back);
  assert.equal(back.geometry, undefined);
  assert.equal(back.waypoints.length, 2, "routepunten blijven altijd behouden");
});

test("deel-link: accenten en emoji in de naam blijven intact", () => {
  const route = sampleRoute(10);
  route.name = "Ardennen — Durbuy → Bastenaken 🏍️";
  const back = decodeRoute(encodeRoute(route).hash);
  assert.equal(back?.name, "Ardennen — Durbuy → Bastenaken 🏍️");
});

test("deel-link: hash met of zonder r=-prefix werkt allebei", () => {
  const { hash } = encodeRoute(sampleRoute(10));
  assert.ok(decodeRoute(hash));
  assert.ok(decodeRoute(`#r=${hash}`));
  assert.ok(decodeRoute(`r=${hash}`));
});

test("deel-link: onzin geeft null in plaats van een crash", () => {
  for (const bad of ["", "#", "niet-base64!!", "eyJ2IjoyfQ", btoa("{}"), btoa("[1,2,3]")]) {
    assert.equal(decodeRoute(bad), null, `verwachtte null voor ${JSON.stringify(bad)}`);
  }
});

test("deel-link: onmogelijke coördinaten worden geweigerd", () => {
  const payload = btoa(
    JSON.stringify({ v: 1, n: "x", m: "car", w: [[999, 999], [50, 5]] })
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  assert.equal(decodeRoute(payload), null, "één geldig punt is te weinig voor een route");
});

/* ---------- opslag ---------- */

function sampleStoredInput(): Route {
  return {
    id: "route-1",
    name: "Eifel rondje",
    waypoints: [
      { id: "a", name: "Monschau", coordinates: { lat: 50.547912345, lng: 6.240812345 } },
      { id: "b", name: "Rursee", coordinates: { lat: 50.636112345, lng: 6.435312345 } },
    ],
    geometry: {
      type: "LineString",
      coordinates: [
        [6.240812345, 50.547912345],
        [6.435312345, 50.636112345],
      ] as GeoJSON.Position[],
    },
    distance: 24000,
    duration: 1800,
    windingScore: 180,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

test("opslag: coördinaten worden op 5 decimalen afgerond", () => {
  const stored = toStoredRoute(sampleStoredInput(), { vehicle: "motorcycle" });
  assert.equal(stored.waypoints[0].coordinates.lat, 50.54791);
  assert.equal(stored.geometry?.coordinates[0][0], 6.24081);
  assert.ok(
    JSON.stringify(stored).length < JSON.stringify(sampleStoredInput()).length,
    "opslagformaat zou compacter moeten zijn"
  );
});

test("opslag: heen en terug levert dezelfde route op", () => {
  const stored = toStoredRoute(sampleStoredInput(), {
    vehicle: "bicycle",
    imported: true,
    navAnchors: [{ lat: 50.5, lng: 6.2 }],
  });
  const back = fromStoredRoute(stored);

  assert.equal(back.route.name, "Eifel rondje");
  assert.equal(back.vehicle, "bicycle");
  assert.equal(back.imported, true);
  assert.equal(back.navAnchors.length, 1);
  assert.equal(back.waypoints.length, 2);
  assert.ok(back.route.createdAt instanceof Date);
});

test("opslag: lege ankers en imported=false worden niet opgeslagen", () => {
  const stored = toStoredRoute(sampleStoredInput(), { vehicle: "car", navAnchors: [] });
  assert.equal(stored.imported, undefined);
  assert.equal(stored.navAnchors, undefined);
});

test("opslag: corrupte entries worden overgeslagen, geldige behouden", () => {
  const good = toStoredRoute(sampleStoredInput(), { vehicle: "car" });
  const raw = JSON.stringify([
    good,
    null,
    "tekst",
    { id: "x" },
    { id: "y", name: "n", savedAt: 1, waypoints: [] },
    { id: "z", name: "n", savedAt: 1, waypoints: [{ name: "a", coordinates: { lat: "x", lng: 1 } }] },
  ]);
  const parsed = parseStoredRoutes(raw);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, "route-1");
});

test("opslag: null en ongeldige JSON geven een lege lijst", () => {
  assert.deepEqual(parseStoredRoutes(null), []);
  assert.deepEqual(parseStoredRoutes("{"), []);
  assert.deepEqual(parseStoredRoutes('{"niet":"een array"}'), []);
});

test("opslag: turns blijven behouden voor de routebeschrijving", () => {
  const input = sampleStoredInput();
  input.turns = [
    {
      instruction: "Sla linksaf naar de Kerkstraat",
      distanceFromStart: 1200,
      distanceAfter: 800,
      type: "turn",
      modifier: "left",
      location: { lat: 50.6, lng: 6.3 },
    },
  ];
  const stored: StoredRoute = toStoredRoute(input, { vehicle: "car" });
  assert.equal(stored.turns?.length, 1);
  assert.equal(fromStoredRoute(stored).route.turns?.[0].instruction, "Sla linksaf naar de Kerkstraat");
});

/* ---------- social-share links ---------- */

test("share-links: alle doelen bevatten de ge-encodeerde url en titel", () => {
  const d = buildShareUrls("Mergellandroute", "https://routes.apexclusive.nl/ritten/mergellandroute");
  assert.ok(d.x.includes(encodeURIComponent("Mergellandroute")));
  assert.ok(d.x.includes(encodeURIComponent("https://routes.apexclusive.nl/ritten/mergellandroute")));
  assert.ok(d.whatsapp.includes("wa.me"));
  assert.ok(d.facebook.includes("sharer/sharer.php?u="));
  assert.ok(d.mail.startsWith("mailto:?subject="));
});

test("share-links: aangepaste tekst landt in whatsapp en mail", () => {
  const d = buildShareUrls("Stelvio", "https://routes.apexclusive.nl/ritten/stelvio-meisterwerk", "Deze ga ik rijden");
  assert.ok(d.whatsapp.includes(encodeURIComponent("Deze ga ik rijden")));
  assert.ok(d.mail.includes(encodeURIComponent("Deze ga ik rijden")));
});

test("share-links: titel valt terug op de standaardtekst", () => {
  const d = buildShareUrls("Cauberg", "https://routes.apexclusive.nl/klimmen/cauberg");
  assert.ok(d.whatsapp.includes(encodeURIComponent("Cauberg")));
  assert.ok(d.mail.includes("%0A%0A"));
});
