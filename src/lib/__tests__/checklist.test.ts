import test from "node:test";
import assert from "node:assert/strict";
import {
  CHECKLISTS,
  CHECKLIST_VEHICLES,
  toggleChecked,
  progress,
  checkKey,
  customKey,
  loadCustom,
  saveCustom,
  makeCustomId,
} from "../checklist.ts";

test("checklist:vier voertuigen met elk minstens 3 secties", () => {
  for (const { id } of CHECKLIST_VEHICLES) {
    const doc = CHECKLISTS[id];
    assert.ok(doc.sections.length >= 3, `${id} heeft te weinig secties`);
  }
});

test("checklist:ids zijn per voertuig uniek", () => {
  for (const { id } of CHECKLIST_VEHICLES) {
    const ids = CHECKLISTS[id].sections.flatMap((s) => s.items.map((i) => i.id));
    assert.equal(new Set(ids).size, ids.length, `${id} heeft dubbele ids`);
  }
});

test("checklist:motor en auto zijn volledig (20+ items)", () => {
  const count = (v: "motor" | "auto") =>
    CHECKLISTS[v].sections.reduce((n, s) => n + s.items.length, 0);
  assert.ok(count("motor") >= 20);
  assert.ok(count("auto") >= 20);
});

test("checklist:elk item heeft een label van 3+ tekens", () => {
  for (const { id } of CHECKLIST_VEHICLES) {
    for (const sec of CHECKLISTS[id].sections) {
      for (const item of sec.items) {
        assert.ok(item.label.length >= 3, `${id}/${item.id}`);
      }
    }
  }
});

test("checklist:toggleChecked heen en weer", () => {
  assert.deepEqual(toggleChecked([], "a"), ["a"]);
  assert.deepEqual(toggleChecked(["a", "b"], "a"), ["b"]);
});

test("checklist:progress telt alleen geldige ids", () => {
  const doc = CHECKLISTS.wandelen;
  const first = doc.sections[0].items[0].id;
  const all = doc.sections.flatMap((s) => s.items.map((i) => i.id));
  assert.equal(progress(doc, []), 0);
  assert.equal(progress(doc, all), 100);
  assert.equal(progress(doc, [first, "bestaat-niet"]), Math.round((1 / all.length) * 100));
});

test("checklist:opslagsleutel per voertuig", () => {
  assert.equal(checkKey("motor"), "apex-routes:checklist:motor");
  assert.notEqual(checkKey("motor"), checkKey("auto"));
});

test("checklist:custom-items hebben eigen sleutel per voertuig", () => {
  assert.equal(customKey("motor"), "apex-routes:checklist-custom:motor");
  assert.notEqual(customKey("motor"), customKey("auto"));
});

test("checklist:loadCustom geeft [] zonder localStorage", () => {
  assert.deepEqual(loadCustom("auto"), []);
});

test("checklist:saveCustom/loadCustom roundtrip met stub", () => {
  const store = new Map<string, string>();
  const g = globalThis as unknown as { localStorage?: Storage };
  g.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };
  try {
    const items = [
      { id: makeCustomId(), label: "Tankpas" },
      { id: makeCustomId(), label: "Intercom-lader" },
    ];
    assert.equal(saveCustom("fiets", items), true);
    assert.deepEqual(loadCustom("fiets"), items);
    assert.deepEqual(loadCustom("motor"), []); // aparte sleutel per voertuig

    store.set(customKey("wandelen"), "geen array");
    assert.deepEqual(loadCustom("wandelen"), []);
    store.set(customKey("auto"), '[{"id":5,"label":"x"}]');
    assert.deepEqual(loadCustom("auto"), []); // ongeldig item valt weg
  } finally {
    g.localStorage = undefined;
  }
});
