import test from "node:test";
import assert from "node:assert/strict";
import {
  isFeedbackCategory,
  ROADMAP_OPTIONS,
  validRoadmapVotes,
} from "../feedback.ts";

test("feedback:alleen bekende categorieën worden geaccepteerd", () => {
  assert.equal(isFeedbackCategory("idee"), true);
  assert.equal(isFeedbackCategory("bug"), true);
  assert.equal(isFeedbackCategory("wens"), true);
  assert.equal(isFeedbackCategory("anders\nBCC"), false);
});

test("feedback:roadmapstemmen worden gewhitelist en gededupliceerd", () => {
  const known = ROADMAP_OPTIONS[0].id;
  assert.deepEqual(validRoadmapVotes([known, "onbekend", known, 42]), [known]);
  assert.deepEqual(validRoadmapVotes("geen-array"), []);
});
