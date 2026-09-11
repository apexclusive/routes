/**
 * Contrastbewaking voor de thema's.
 *
 * Een themaschakelaar is pas af als elk thema leesbaar is. Deze test leest de
 * echte kleuren uit globals.css en rekent het WCAG-contrast uit, zodat een
 * onbedachte kleurwijziging niet stilletjes een onleesbaar thema oplevert.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { THEMES, THEME_KLEUR } from "../theme.ts";

const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

/** Haalt de custom properties van één selectorblok uit de CSS. */
function leesTokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  assert.ok(start >= 0, `selector niet gevonden: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  // commentaar eruit, anders lopen de declaraties door elkaar
  const body = css.slice(open + 1, close).replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Record<string, string> = {};
  for (const regel of body.split(";")) {
    const i = regel.indexOf(":");
    if (i < 0) continue;
    const key = regel.slice(0, i).trim();
    if (key.startsWith("--")) out[key] = regel.slice(i + 1).trim();
  }
  return out;
}

function hexNaarRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const vol = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(vol.slice(0, 2), 16),
    parseInt(vol.slice(2, 4), 16),
    parseInt(vol.slice(4, 6), 16),
  ];
}

/** Relatieve luminantie volgens WCAG 2.1. */
function luminantie([r, g, b]: [number, number, number]): number {
  const kanaal = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanaal(r) + 0.7152 * kanaal(g) + 0.0722 * kanaal(b);
}

function contrast(voorgrond: string, achtergrond: string): number {
  const a = luminantie(hexNaarRgb(voorgrond));
  const b = luminantie(hexNaarRgb(achtergrond));
  const [licht, donker] = a > b ? [a, b] : [b, a];
  return (licht + 0.05) / (donker + 0.05);
}

const SELECTORS: Record<(typeof THEMES)[number], string> = {
  startgrid: '[data-theme="startgrid"]',
  smaragd: '[data-theme="smaragd"]',
  licht: '[data-theme="licht"]',
};

test("themecontrast:hoofdtekst haalt overal WCAG AA (4,5:1)", () => {
  for (const thema of THEMES) {
    const t = leesTokens(SELECTORS[thema]);
    const ratio = contrast(t["--text-strong"], t["--base"]);
    assert.ok(
      ratio >= 4.5,
      `${thema}: hoofdtekst ${t["--text-strong"]} op ${t["--base"]} haalt maar ${ratio.toFixed(2)}:1`
    );
  }
});

test("themecontrast:gedempte tekst haalt minstens AA voor grote tekst (3:1)", () => {
  for (const thema of THEMES) {
    const t = leesTokens(SELECTORS[thema]);
    for (const token of ["--text-muted", "--text-faint"]) {
      const ratio = contrast(t[token], t["--base"]);
      assert.ok(
        ratio >= 3,
        `${thema}: ${token} (${t[token]}) haalt maar ${ratio.toFixed(2)}:1`
      );
    }
  }
});

test("themecontrast:het accent is leesbaar op de achtergrond", () => {
  for (const thema of THEMES) {
    const t = leesTokens(SELECTORS[thema]);
    const ratio = contrast(t["--accent"], t["--base"]);
    assert.ok(
      ratio >= 3,
      `${thema}: accent ${t["--accent"]} op ${t["--base"]} haalt maar ${ratio.toFixed(2)}:1`
    );
  }
});

test("themecontrast:tekst op een accentknop is leesbaar", () => {
  for (const thema of THEMES) {
    const t = leesTokens(SELECTORS[thema]);
    const ratio = contrast(t["--accent-contrast"], t["--accent"]);
    assert.ok(
      ratio >= 4.5,
      `${thema}: knoptekst ${t["--accent-contrast"]} op ${t["--accent"]} haalt maar ${ratio.toFixed(2)}:1`
    );
  }
});

test("themecontrast:de opgegeven smaragd-huisstijl is exact overgenomen", () => {
  const t = leesTokens(SELECTORS.smaragd);
  assert.equal(t["--base"], "#0d1612", "diepe smaragdbasis");
  assert.equal(t["--surface-solid"], "#16241d", "tweede smaragdtint");
  assert.equal(t["--text-strong"], "#f3f4f6", "heldere contrasttekst");
  assert.equal(t["--accent"], "#10b981", "zacht emerald-accent");
});

test("themecontrast:meta theme-color klopt met de echte achtergrond", () => {
  for (const thema of THEMES) {
    const t = leesTokens(SELECTORS[thema]);
    const basis = t["--base"].toLowerCase();
    const meta = THEME_KLEUR[thema].toLowerCase();
    // het lichte thema mag wit gebruiken i.p.v. de iets grijzere pagina-basis
    const ok = meta === basis || (thema === "licht" && meta === "#ffffff");
    assert.ok(ok, `${thema}: theme-color ${meta} wijkt af van de basis ${basis}`);
  }
});
