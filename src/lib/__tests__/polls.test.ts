import test from "node:test";
import assert from "node:assert/strict";

import { baseVotes, tally, type PollDef } from "../polls.ts";

test("polls:basisstemmen zijn deterministisch en liggen tussen 12 en 89", () => {
  const a = baseVotes("weekend", ["Ardennen", "Eifel", "Mergelland"]);
  const b = baseVotes("weekend", ["Ardennen", "Eifel", "Mergelland"]);
  assert.deepEqual(a, b);
  assert.equal(a.length, 3);
  for (const v of a) assert.ok(v >= 12 && v <= 89, `buiten bereik: ${v}`);
});

test("polls:percentages tellen (bijna) exact naar 100 en winner klopt", () => {
  const t = tally("p1", ["a", "b", "c"], null);
  assert.equal(t.percentages.reduce((x, y) => x + y, 0), 100);
  assert.equal(t.winner, t.votes.indexOf(Math.max(...t.votes)));

  const local = [5, 0, 0];
  const t2 = tally("p1", ["a", "b", "c"], local);
  assert.equal(t2.votes[0], t.votes[0] + 5);
  assert.ok(t2.total > t.total);
});

test("polls:lokale stem draait de uitslag om als de basis dicht bij elkaar ligt", () => {
  // zoek een poll-id waar a en b dicht bij elkaar liggen
  for (let i = 0; i < 50; i++) {
    const id = `poll-${i}`;
    const base = baseVotes(id, ["a", "b"]);
    if (Math.abs(base[0] - base[1]) <= 3) {
      const withLocal = tally(id, ["a", "b"], [10, 0]);
      if (base[0] <= base[1]) {
        // b won net; 10 extra stemmen voor a moeten a laten winnen bij diff<=3
        assert.equal(withLocal.winner, 0, `id ${id}`);
        return;
      }
    }
  }
  // geen geschikte basis gevonden — toenemende stemmen moeten sowieso meetellen
  const t = tally("x", ["a", "b"], [100, 0]);
  assert.equal(t.winner, 0);
});

test("polls:lege opties-edgeloos", () => {
  const t = tally("leeg", [], null);
  assert.equal(t.total, 1); // voorkomt delen door nul
  assert.deepEqual(t.percentages, []);
});

test("polls:tally met alleen lokale stemmen blijft correct", () => {
  const t = tally("p2", ["a", "b", "c"], [0, 3, 0]);
  assert.equal(t.percentages.reduce((x, y) => x + y, 0), 100);
});
