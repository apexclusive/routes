import test from "node:test";
import assert from "node:assert/strict";
import {
  applyTheme,
  isDonker,
  isThemeKeuze,
  parseKeuze,
  resolveTheme,
  THEMES,
  THEME_KEUZES,
  THEME_KLEUR,
  THEME_LABEL,
  THEME_OMSCHRIJVING,
  THEME_STORAGE_KEY,
  themeBootScript,
  volgendeKeuze,
  type ThemeKeuze,
} from "../theme.ts";

test("theme:systeemkeuze volgt het besturingssysteem", () => {
  assert.equal(resolveTheme("systeem", true), "startgrid");
  assert.equal(resolveTheme("systeem", false), "licht");
});

test("theme:een expliciete keuze wint altijd van het systeem", () => {
  for (const t of THEMES) {
    assert.equal(resolveTheme(t, true), t, `${t} genegeerd bij donker systeem`);
    assert.equal(resolveTheme(t, false), t, `${t} genegeerd bij licht systeem`);
  }
});

test("theme:rommel uit localStorage valt veilig terug op systeem", () => {
  for (const raw of [null, undefined, "", "donker", 42, {}, "SYSTEEM"]) {
    assert.equal(parseKeuze(raw), "systeem", `niet afgevangen: ${String(raw)}`);
  }
  for (const k of THEME_KEUZES) {
    assert.equal(parseKeuze(k), k);
  }
  assert.ok(!isThemeKeuze("blauw"));
});

test("theme:alleen het lichte thema telt als licht", () => {
  assert.equal(isDonker("startgrid"), true);
  assert.equal(isDonker("smaragd"), true);
  assert.equal(isDonker("licht"), false);
});

test("theme:elke keuze heeft een label, omschrijving en (thema's) een kleur", () => {
  for (const k of THEME_KEUZES) {
    assert.ok(THEME_LABEL[k]?.length > 2, `label mist: ${k}`);
    assert.ok(THEME_OMSCHRIJVING[k]?.length > 10, `omschrijving mist: ${k}`);
  }
  for (const t of THEMES) {
    assert.match(THEME_KLEUR[t], /^#[0-9a-f]{6}$/, `kleur raar: ${t}`);
  }
  // de opgegeven smaragd-basiskleur moet exact gebruikt worden
  assert.equal(THEME_KLEUR.smaragd, "#0d1612");
});

test("theme:de rondgang bezoekt elke keuze precies één keer", () => {
  const gezien: ThemeKeuze[] = [];
  let huidig: ThemeKeuze = "systeem";
  for (let i = 0; i < THEME_KEUZES.length; i += 1) {
    gezien.push(huidig);
    huidig = volgendeKeuze(huidig);
  }
  assert.equal(huidig, "systeem", "rondgang komt niet terug bij het begin");
  assert.equal(new Set(gezien).size, THEME_KEUZES.length, "niet elke keuze bezocht");
});

test("theme:applyTheme zet data-theme en color-scheme", () => {
  const attrs: Record<string, string> = {};
  const fake = {
    setAttribute: (k: string, v: string) => {
      attrs[k] = v;
    },
    style: { colorScheme: "" },
  };
  applyTheme("smaragd", fake);
  assert.equal(attrs["data-theme"], "smaragd");
  assert.equal(fake.style.colorScheme, "dark");
  applyTheme("licht", fake);
  assert.equal(attrs["data-theme"], "licht");
  assert.equal(fake.style.colorScheme, "light");
});

test("theme:bootscript is zelfstandig, foutbestendig en kent alle keuzes", () => {
  const src = themeBootScript();
  assert.ok(src.includes(THEME_STORAGE_KEY), "leest de opslagsleutel niet");
  assert.ok(src.includes("prefers-color-scheme: dark"), "checkt het systeem niet");
  assert.ok(src.includes("try"), "geen foutafhandeling — mag nooit de pagina breken");
  for (const k of THEME_KEUZES) {
    assert.ok(src.includes(`"${k}"`), `bootscript kent ${k} niet`);
  }
  // het script moet syntactisch geldig zijn: parsen mag niet gooien
  assert.doesNotThrow(() => new Function(src));
});

test("theme:bootscript kiest hetzelfde thema als resolveTheme", () => {
  // simuleer het script met een nagebootste browser en vergelijk de uitkomst
  for (const keuze of [...THEME_KEUZES, "onzin"]) {
    for (const systeemDonker of [true, false]) {
      const html = { attr: "", style: { colorScheme: "" } };
      const fakeWindow = {
        matchMedia: () => ({ matches: systeemDonker }),
      };
      const fakeDoc = {
        documentElement: {
          setAttribute: (_k: string, v: string) => {
            html.attr = v;
          },
          style: html.style,
        },
      };
      const run = new Function(
        "window",
        "document",
        "localStorage",
        themeBootScript()
      );
      run(fakeWindow, fakeDoc, { getItem: () => keuze });
      assert.equal(
        html.attr,
        resolveTheme(parseKeuze(keuze), systeemDonker),
        `bootscript wijkt af bij keuze=${keuze} donker=${systeemDonker}`
      );
    }
  }
});
