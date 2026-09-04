import test from "node:test";
import assert from "node:assert/strict";
import {
  bboxFromGeometry,
  buildOverpassQuery,
  distanceToRouteM,
  fetchRoutePois,
  poiIcon,
  CORRIDOR_KM,
} from "../pois.ts";

const p = (lng: number, lat: number): [number, number] => [lng, lat];

const line = {
  type: "LineString" as const,
  coordinates: [p(5.69, 50.85), p(5.7, 50.86), p(5.71, 50.87)],
};

test("bboxFromGeometry bepaalt de omsluitende box", () => {
  const bbox = bboxFromGeometry(line);
  assert.deepEqual(bbox, { south: 50.85, west: 5.69, north: 50.87, east: 5.71 });
  assert.equal(bboxFromGeometry({ type: "LineString", coordinates: [] }), null);
});

test("buildOverpassQuery bevat alléén de gevraagde soorten", () => {
  const q = buildOverpassQuery(
    { south: 50.85, west: 5.69, north: 50.87, east: 5.71 },
    ["fuel", "charging"]
  );
  assert.match(q, /node\["amenity"="fuel"\]/);
  assert.match(q, /node\["amenity"="charging_station"\]/);
  assert.doesNotMatch(q, /restaurant/);
  assert.match(q, /\(50\.85,5\.69,50\.87,5\.71\)/);

  const foodOnly = buildOverpassQuery(
    { south: 10, west: 0, north: 11, east: 1 },
    ["food"]
  );
  assert.match(foodOnly, /restaurant/);
  assert.doesNotMatch(foodOnly, /amenity"="fuel"/);
});

test("distanceToRouteM: punt op de lijn is ~0, ver weg is groot", () => {
  const onRoute = distanceToRouteM(50.86, 5.7, line);
  assert.ok(onRoute < 25, `op route: ${onRoute}m`);
  const far = distanceToRouteM(51.86, 5.7, line);
  assert.ok(far > 100_000, `ver weg: ${far}m`);
});

test("distanceToRouteM meetelt ook het laatste punt bij grote sample-stap", () => {
  const long = {
    type: "LineString" as const,
    coordinates: Array.from({ length: 40 }, (_, i) => p(5.69, 50.85 + i * 0.001)),
  };
  const atEnd = distanceToRouteM(50.889, 5.69, long);
  assert.ok(atEnd < 30, `eindpunt: ${atEnd}m`);
});

test("fetchRoutePois zonder soorten of geometrie geeft leeg (geen netwerk)", async () => {
  assert.deepEqual(await fetchRoutePois(line, []), []);
  assert.deepEqual(
    await fetchRoutePois({ type: "LineString", coordinates: [] }, ["fuel"]),
    []
  );
});

test("poiIcon geeft per soort een inline SVG-lijnicoon en corridor is 2 km", () => {
  assert.match(poiIcon("fuel"), /^<svg/);
  assert.match(poiIcon("charging"), /polygon/);
  assert.match(poiIcon("food"), /M3 2v7/);
  assert.match(poiIcon("viewpoint"), /circle/);
  assert.equal(CORRIDOR_KM, 2);
});

test("fetchRoutePois probeert na een netwerkfatal opnieuw en slaagt", async () => {
  let calls = 0;
  const g = globalThis as { fetch?: typeof fetch };
  const real = g.fetch;
  g.fetch = (async () => {
    calls++;
    if (calls === 1) throw new Error("netwerk hapert even");
    return new Response(JSON.stringify({ elements: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const r = await fetchRoutePois(line, ["fuel"], 5);
    assert.deepEqual(r, []);
    assert.equal(calls, 2, "precies twee pogingen");
  } finally {
    g.fetch = real;
  }
});

test("fetchRoutePois probeert ook na een 500 opnieuw en geeft anders leeg", async () => {
  let calls = 0;
  const g = globalThis as { fetch?: typeof fetch };
  const real = g.fetch;
  g.fetch = (async () => {
    calls++;
    return new Response("overload", { status: 500 });
  }) as typeof fetch;
  try {
    const r = await fetchRoutePois(line, ["fuel"], 2);
    assert.deepEqual(r, []);
    assert.equal(calls, 2, "twee pogingen, dan opgeven zonder crash");
  } finally {
    g.fetch = real;
  }
});
