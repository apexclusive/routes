import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { LANDING, ROULETTE, SHARED, LANGS } from "../i18n.ts";
import type { Lang } from "../i18n.ts";

/**
 * i18n-integriteit: alle vier de talen moeten exact dezelfde structuur
 * hebben, zodat de UI nergens op een ontbrekende key valt.
 */

function keysOf(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keysOf(v, prefix ? `${prefix}.${k}` : k),
  );
}

test("i18n: LANDING heeft identieke keys in nl/en/fr/de", () => {
  const base = keysOf(LANDING.nl).sort().join("|");
  for (const lang of ["en", "fr", "de"] as Lang[]) {
    assert.equal(keysOf(LANDING[lang]).sort().join("|"), base);
  }
});

test("i18n: pricing beschrijft per taal drie lagen (free/supporter/pro)", () => {
  for (const { id } of LANGS) {
    const p = LANDING[id].pricing;
    assert.ok(p.freeBullets.length >= 3);
    assert.ok(p.suppBullets.length >= 3);
    assert.ok(p.proBullets.length >= 3);
    assert.ok(p.suppTitle.length > 0 && p.proTitle.length > 0);
    assert.ok(p.supportLine.length > 0, `supportLine mist in ${id}`);
  }
});

test("i18n: ROULETTE heeft 4 voertuiglabels per taal", () => {
  for (const { id } of LANGS) {
    assert.equal(ROULETTE[id].vehicles.length, 4);
  }
});

test("i18n: SHARED bevat chatPlaceholder en guideNote per taal", () => {
  for (const { id } of LANGS) {
    assert.ok(SHARED[id].chatPlaceholder.length > 3);
    if (id !== "nl") assert.ok(SHARED[id].guideNote.length > 3);
  }
});

test("i18n: vertalingen zijn geen kopieën van het Nederlands", () => {
  for (const lang of ["en", "fr", "de"] as Lang[]) {
    assert.notEqual(LANDING[lang].hero.sub, LANDING.nl.hero.sub);
    assert.notEqual(SHARED[lang].chatPlaceholder, SHARED.nl.chatPlaceholder);
  }
});

test("seo: llms.txt bestaat en beschrijft de planner", () => {
  const txt = readFileSync(join(process.cwd(), "public", "llms.txt"), "utf-8");
  assert.ok(txt.includes("Apex Routes"));
  assert.ok(txt.includes("GPX"));
  assert.ok(txt.toLowerCase().includes("google"));
});

test("seo: sitemap.ts bevat de kernpagina's", () => {
  const src = readFileSync(join(process.cwd(), "src", "app", "sitemap.ts"), "utf-8");
  for (const page of ["/ontdek", "/advies", "/kalender", "/ritbank", "/forum", "/checklist", "/gpx"]) {
    assert.ok(src.includes(`"${page}"`), `sitemap mist ${page}`);
  }
});

test("seo: robots.ts verwijst naar de sitemap", () => {
  const src = readFileSync(join(process.cwd(), "src", "app", "robots.ts"), "utf-8");
  assert.ok(src.includes("sitemap.xml"));
});

test("seo: layout.tsx bevat JSON-LD (schema.org WebSite)", () => {
  const src = readFileSync(join(process.cwd(), "src", "app", "layout.tsx"), "utf-8");
  assert.ok(src.includes("application/ld+json"));
  assert.ok(src.includes("schema.org"));
});

test("seo: LangSwitch bestaat en kent 4 talen", () => {
  assert.ok(
    existsSync(join(process.cwd(), "src", "components", "LangSwitch.tsx")),
  );
  assert.equal(LANGS.length, 4);
});
