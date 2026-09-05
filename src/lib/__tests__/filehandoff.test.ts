import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PROMPT_LENGTH,
  cleanPlannerPrompt,
  plannerUrl,
  promptFromSearch,
  setPendingPrompt,
  consumePendingPrompt,
} from "../filehandoff.ts";

test("filehandoff:planner-link is deelbaar en round-tript accenten", () => {
  const prompt = "Motorrit door de Eifel via Nürburg, 180 km";
  const url = plannerUrl(prompt);
  assert.ok(url.startsWith("/?plan="));
  assert.equal(promptFromSearch(new URL(url, "https://example.test").search), prompt);
});

test("filehandoff:prompt wordt opgeschoond en begrensd", () => {
  assert.equal(cleanPlannerPrompt("  Rondrit   Zuid-Limburg \n 100 km  "), "Rondrit Zuid-Limburg 100 km");
  assert.equal(cleanPlannerPrompt(null), "");
  assert.equal(cleanPlannerPrompt("x".repeat(900)).length, MAX_PROMPT_LENGTH);
  assert.equal(promptFromSearch("?ander=tekst"), "");
});

test("filehandoff:lege prompt opent alleen de planner", () => {
  assert.equal(plannerUrl("   "), "/?rit=1");
});

test("filehandoff:modulebuffer wordt precies eenmaal geconsumeerd", () => {
  setPendingPrompt("Rondrit Veluwe 90 km");
  assert.equal(consumePendingPrompt(), "Rondrit Veluwe 90 km");
  assert.equal(consumePendingPrompt(), null);
});
