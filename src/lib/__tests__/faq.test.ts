import { test } from "node:test";
import assert from "node:assert/strict";
import { buildKlimFaq, buildRitFaq, faqPageSchema } from "../faq.ts";
import { CLIMBS } from "../climbs.ts";
import { RITTEN } from "../ritten.ts";

test("faq: elke klim krijgt minimaal 4 vragen met de naam erin", () => {
  for (const c of CLIMBS) {
    const faq = buildKlimFaq(c);
    assert.ok(faq.length >= 4, `${c.id}: maar ${faq.length} vragen`);
    assert.ok(faq[0].q.includes(c.name), `${c.id}: naam mist in eerste vraag`);
    for (const f of faq) {
      assert.ok(f.q.length >= 10 && f.a.length >= 30, `${c.id}: te karig`);
      assert.ok(f.a.length <= 400, `${c.id}: antwoord te lang voor schema (${f.a.length})`);
    }
  }
});

test("faq: tol- en seizoensvragen verschijnen waar ze horen", () => {
  for (const c of CLIMBS) {
    const faq = buildKlimFaq(c);
    const qs = faq.map((f) => f.q).join(" ");
    if (/tolweg/i.test(c.note + " " + c.prompt)) {
      assert.ok(qs.includes("geld"), `${c.id}: tolvraag mist`);
    }
    if (c.seizoen) {
      assert.ok(qs.includes("open") || qs.includes("Wanneer"), `${c.id}: seizoensvraag mist`);
    }
    if (c.surface !== "asfalt") {
      assert.ok(qs.includes("geasfalteerd"), `${c.id}: oppervlaktevraag mist`);
    }
  }
});

test("faq: elke rit krijgt 5 vragen incl. periode en hoogtepunten", () => {
  for (const r of RITTEN) {
    const faq = buildRitFaq(r);
    assert.equal(faq.length, 5, `${r.id}: ${faq.length} vragen`);
    const qs = faq.map((f) => f.q).join(" ");
    assert.ok(qs.includes("Hoe lang"), `${r.id}: lengtevraag mist`);
    assert.ok(qs.includes("beste periode"), `${r.id}: seizoensvraag mist`);
    assert.ok(qs.includes("hoogtepunten"), `${r.id}: hoogtepuntvraag mist`);
    const periode = faq.find((f) => f.q.includes("beste periode"));
    assert.ok(periode?.a.toLowerCase().includes(r.seizoen.split(/[—(]/)[0].trim().slice(0, 8).toLowerCase()), `${r.id}: seizoen niet in antwoord`);
  }
});

test("faq: faqPageSchema heeft de juiste JSON-LD-vorm", () => {
  const schema = faqPageSchema(buildRitFaq(RITTEN[0]));
  assert.equal(schema["@type"], "FAQPage");
  assert.ok(Array.isArray(schema.mainEntity));
  assert.equal(schema.mainEntity.length, 5);
  assert.equal(schema.mainEntity[0]["@type"], "Question");
  assert.ok(schema.mainEntity[0].acceptedAnswer.text.length > 30);
});
