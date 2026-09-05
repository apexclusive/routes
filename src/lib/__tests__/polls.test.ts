import test from "node:test";
import assert from "node:assert/strict";

import { tally, type PollDef } from "../polls.ts";

test("polls:zonder echte stemmen is de telling eerlijk nul", () => {
  const result = tally("weekend", ["Ardennen", "Eifel", "Mergelland"], null);
  assert.deepEqual(result.votes, [0, 0, 0]);
  assert.deepEqual(result.percentages, [0, 0, 0]);
  assert.equal(result.total, 0);
  assert.equal(result.winner, -1);
});

test("polls:percentages tellen exact naar 100 en winnaar klopt", () => {
  const result = tally("p1", ["a", "b", "c"], [2, 3, 5]);
  assert.deepEqual(result.votes, [2, 3, 5]);
  assert.deepEqual(result.percentages, [20, 30, 50]);
  assert.equal(result.total, 10);
  assert.equal(result.winner, 2);
});

test("polls:largest remainder houdt gelijke opties samen op 100", () => {
  const result = tally("p2", ["a", "b", "c"], [1, 1, 1]);
  assert.equal(result.percentages.reduce((sum, value) => sum + value, 0), 100);
  assert.deepEqual(result.percentages, [34, 33, 33]);
});

test("polls:negatieve, ontbrekende en ongeldige waarden worden nul", () => {
  const result = tally("p3", ["a", "b", "c", "d"], [-4, Number.NaN, 2.9]);
  assert.deepEqual(result.votes, [0, 0, 2, 0]);
  assert.deepEqual(result.percentages, [0, 0, 100, 0]);
  assert.equal(result.winner, 2);
});

test("polls:lege opties blijft edgeloos", () => {
  const result = tally("leeg", [], null);
  assert.equal(result.total, 0);
  assert.deepEqual(result.percentages, []);
  assert.equal(result.winner, -1);
});

test("polls:PollDef blijft een compacte data-interface", () => {
  const poll: PollDef = { id: "x", question: "Waarheen?", options: ["Eifel"] };
  assert.equal(poll.options.length, 1);
});
