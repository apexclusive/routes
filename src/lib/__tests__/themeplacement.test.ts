/**
 * Bewaakt dat de thema-schakelaar echt overal staat.
 *
 * De eis is "op de homepage en op alle subpagina's". Bij een eerdere ronde
 * bleek /adverteren als enige pagina geen navigatie te hebben; die fout mag
 * niet terugkomen als er later een pagina bijkomt. Daarom controleren we de
 * bron: elk bestand met een sticky navigatiebalk moet ThemeSwitch bevatten.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../../", import.meta.url).pathname;

function alleBestanden(map: string): string[] {
  const uit: string[] = [];
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) uit.push(...alleBestanden(pad));
    else if (naam.endsWith(".tsx")) uit.push(pad);
  }
  return uit;
}

/** Bestanden die zelf een paginanavigatie tekenen. */
function metNavigatiebalk(): { pad: string; inhoud: string }[] {
  return alleBestanden(SRC)
    .map((pad) => ({ pad, inhoud: readFileSync(pad, "utf8") }))
    .filter(
      (b) =>
        b.inhoud.includes("sticky top-0") &&
        b.inhoud.includes("<nav") &&
        // de schakelaar zelf en het menu tellen niet mee als pagina
        !b.pad.endsWith("ThemeSwitch.tsx") &&
        !b.pad.endsWith("SiteMenu.tsx")
    );
}

test("themeplacement:elke pagina met een navigatiebalk heeft de schakelaar", () => {
  const balken = metNavigatiebalk();
  assert.ok(balken.length >= 15, `te weinig navigaties gevonden: ${balken.length}`);
  const missend = balken
    .filter((b) => !b.inhoud.includes("<ThemeSwitch"))
    .map((b) => b.pad.replace(SRC, ""));
  assert.deepEqual(missend, [], `deze pagina's missen de themaschakelaar: ${missend.join(", ")}`);
});

test("themeplacement:de schakelaar is niet verstopt achter een breakpoint", () => {
  // LangSwitch staat bewust op hidden sm:flex; het thema moet juist altijd
  // bereikbaar zijn, ook op een telefoon.
  for (const b of metNavigatiebalk()) {
    const match = b.inhoud.match(/<ThemeSwitch[^/>]*\/?>/);
    if (!match) continue;
    assert.ok(
      !/hidden/.test(match[0]),
      `${b.pad.replace(SRC, "")}: schakelaar verborgen op mobiel (${match[0]})`
    );
  }
});

test("themeplacement:het bootscript staat in de root-layout vóór de content", () => {
  const layout = readFileSync(join(SRC, "app/layout.tsx"), "utf8");
  assert.ok(layout.includes("themeBootScript"), "bootscript ontbreekt in de layout");
  assert.ok(
    layout.indexOf("themeBootScript()") < layout.indexOf("<body>"),
    "bootscript moet in de <head> staan, anders flitst de pagina"
  );
  assert.ok(
    layout.includes("suppressHydrationWarning"),
    "html mist suppressHydrationWarning terwijl het script het element aanpast"
  );
});
