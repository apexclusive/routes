import test from "node:test";
import assert from "node:assert/strict";

import {
  checkCode,
  planForCode,
  bumpUsage,
  remainingToday,
  canUse,
  todayKey,
  tierOf,
  trialDaysLeft,
  TIER_LIMITS,
  PRO_PLANS,
} from "../pro.ts";

const day = todayKey();

test("pro:activatiecodes herkend inclusief spaties/hoofdletters", () => {
  assert.equal(planForCode("APEXPRO"), "year");
  assert.equal(planForCode("apex-pro"), "year");
  assert.equal(planForCode("  APEXPRO-MAAND  "), "month");
  assert.equal(planForCode("APEXPRO-LEVEN"), "life");
  assert.equal(planForCode("APEXPRO-JAAR"), "year");
  assert.equal(planForCode("APXSUPPORT"), "supporter");
  assert.equal(planForCode("APEX-SUPPORTER"), "supporter");
  assert.equal(planForCode("GRATIS-VOOR-EVER"), null);
  assert.equal(planForCode(""), null);
});

test("pro:proefcodes markeren een proefmaand", () => {
  assert.deepEqual(checkCode("APEXPROEF"), { plan: "month", trial: true });
  assert.deepEqual(checkCode("PROEFMAAND"), { plan: null, trial: false }); // zonder prefix
  assert.deepEqual(checkCode("APEXPROEFMAAND"), { plan: "month", trial: true });
  assert.equal(checkCode("APEXPRO").trial, false);
});

test("pro:drie lagen met oplopende limieten", () => {
  assert.equal(TIER_LIMITS.free.aiRoutes, 3);
  assert.equal(TIER_LIMITS.supporter.aiRoutes, 10);
  assert.equal(TIER_LIMITS.supporter.exports, 15);
  assert.equal(TIER_LIMITS.pro.aiRoutes, Number.POSITIVE_INFINITY);
  assert.ok(TIER_LIMITS.supporter.aiRoutes > TIER_LIMITS.free.aiRoutes);
});

test("pro:tierOf bepaalt de laag uit de status", () => {
  assert.equal(tierOf(null), "free");
  assert.equal(tierOf({ active: false, plan: "year", code: "", activatedAt: 0 }), "free");
  assert.equal(tierOf({ active: true, plan: "supporter", code: "X", activatedAt: 1 }), "supporter");
  assert.equal(tierOf({ active: true, plan: "month", code: "X", activatedAt: 1 }), "pro");
  assert.equal(tierOf({ active: true, plan: "life", code: "X", activatedAt: 1 }), "pro");
});

test("pro:daglimiet reset bij nieuwe datum en geldt per laag", () => {
  assert.equal(remainingToday("aiRoutes", { date: "2020-01-01", aiRoutes: 3, exports: 0 }, null), 3);
  const vol = { date: day, aiRoutes: 3, exports: 5 };
  assert.equal(remainingToday("aiRoutes", vol, null), 0);
  assert.ok(!canUse("aiRoutes", vol, null));
  // supporter heeft ruimte
  assert.equal(remainingToday("aiRoutes", vol, { active: true, plan: "supporter", code: "X", activatedAt: 1 }), 7);
  // pro is onbeperkt, ook bij volledig volle tellers
  assert.equal(remainingToday("exports", vol, { active: true, plan: "year", code: "X", activatedAt: 1 }), Number.POSITIVE_INFINITY);
  assert.ok(canUse("exports", vol, { active: true, plan: "month", code: "X", activatedAt: 1 }));
});

test("pro:bumpUsage telt per soort en reset op nieuwe dag", () => {
  let s = bumpUsage(null, "aiRoutes", "2026-09-02");
  assert.deepEqual(s, { date: "2026-09-02", aiRoutes: 1, exports: 0 });
  s = bumpUsage(s, "aiRoutes", "2026-09-02");
  assert.equal(s.aiRoutes, 2);
  s = bumpUsage(s, "exports", "2026-09-02");
  assert.equal(s.exports, 1);
  const nextDay = bumpUsage(s, "aiRoutes", "2026-09-03");
  assert.deepEqual(nextDay, { date: "2026-09-03", aiRoutes: 1, exports: 0 });
});

test("pro:proefdagen tellen af en niet-actief geeft nul", () => {
  const now = 1_000_000_000_000;
  const trial = { active: true, plan: "month" as const, code: "X", activatedAt: now, trialUntil: now + 30 * 86400000 };
  assert.equal(trialDaysLeft(trial, now), 30);
  assert.equal(trialDaysLeft(trial, now + 29.5 * 86400000), 1);
  assert.equal(trialDaysLeft(trial, now + 31 * 86400000), 0);
  assert.equal(trialDaysLeft(null, now), 0);
});

test("pro:plannen hebben prijs en notitie, middenmoot aanwezig", () => {
  assert.equal(PRO_PLANS.length, 4);
  assert.ok(PRO_PLANS.some((p) => p.id === "supporter"), "supporter ontbreekt");
  for (const p of PRO_PLANS) {
    assert.ok(p.price.includes("€"));
    assert.ok(p.note.length > 3);
  }
});
