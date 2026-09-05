import test from "node:test";
import assert from "node:assert/strict";
import { fallbackMapStyle, MAP_TILE_SOURCES } from "../maptiles.ts";

test("kaarttegels gebruiken één sleutelvrije bron zonder CARTO-fouttegels", () => {
  for (const source of Object.values(MAP_TILE_SOURCES)) {
    assert.equal(new URL(source.url).hostname, "server.arcgisonline.com");
    assert.doesNotMatch(source.url, /carto|api.?key|token/i);
    assert.match(source.attribution, /Esri/i);
    assert.equal(source.maxZoom, 19);
  }
});

test("donkere kaart gebruikt lokaal filter en veilige fallback", () => {
  assert.equal(MAP_TILE_SOURCES.dark.className, "apex-dark-tiles");
  assert.equal(fallbackMapStyle("dark"), "topo");
  assert.equal(fallbackMapStyle("satellite"), "topo");
  assert.equal(fallbackMapStyle("topo"), "dark");
});
