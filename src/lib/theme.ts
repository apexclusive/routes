/**
 * Themabeheer: keuze, opslag en systeemvoorkeur.
 *
 * Drie thema's, want het merk mag niet verdwijnen achter een schakelaar:
 * - startgrid: de signatuur van Apex (diep zwart, geel accent) — standaard
 * - smaragd:   luxe donker in diepe smaragdtinten met emerald-accent
 * - licht:     lichte modus voor daglicht en printen
 *
 * "systeem" volgt het besturingssysteem: donker wordt het gekozen donkere
 * thema, licht wordt de lichte modus. Puur en DOM-vrij zodat alles buiten de
 * browser te testen is; de enige bijwerking zit in applyTheme().
 */

export const THEMES = ["startgrid", "smaragd", "licht"] as const;
export type Theme = (typeof THEMES)[number];

/** Wat de gebruiker kan kiezen: een vast thema of automatisch meelopen. */
export const THEME_KEUZES = ["systeem", ...THEMES] as const;
export type ThemeKeuze = (typeof THEME_KEUZES)[number];

export const THEME_STORAGE_KEY = "apex-routes:theme";

/** Welk donker thema "systeem = donker" oplevert. */
export const SYSTEEM_DONKER: Theme = "startgrid";
export const SYSTEEM_LICHT: Theme = "licht";

export function isThemeKeuze(value: unknown): value is ThemeKeuze {
  return typeof value === "string" && (THEME_KEUZES as readonly string[]).includes(value);
}

/** Leest een opgeslagen waarde veilig uit; onbekende rommel wordt "systeem". */
export function parseKeuze(raw: unknown): ThemeKeuze {
  return isThemeKeuze(raw) ? raw : "systeem";
}

/** Zet een keuze plus systeemvoorkeur om in het thema dat echt geldt. */
export function resolveTheme(keuze: ThemeKeuze, systeemIsDonker: boolean): Theme {
  if (keuze === "systeem") return systeemIsDonker ? SYSTEEM_DONKER : SYSTEEM_LICHT;
  return keuze;
}

/** Is dit thema donker? Bepaalt o.a. de browser-UI-kleur en kaarttegels. */
export function isDonker(theme: Theme): boolean {
  return theme !== "licht";
}

/** Kleur voor <meta name="theme-color"> zodat de mobiele browserbalk meekleurt. */
export const THEME_KLEUR: Record<Theme, string> = {
  startgrid: "#050507",
  smaragd: "#0d1612",
  licht: "#ffffff",
};

export const THEME_LABEL: Record<ThemeKeuze, string> = {
  systeem: "Systeem",
  startgrid: "Startgrid",
  smaragd: "Smaragd",
  licht: "Licht",
};

export const THEME_OMSCHRIJVING: Record<ThemeKeuze, string> = {
  systeem: "Volgt je besturingssysteem",
  startgrid: "Diep zwart met geel accent",
  smaragd: "Luxe smaragdgroen, zacht voor de ogen",
  licht: "Licht en helder voor overdag",
};

/** Volgende keuze in de rondgang (voor de snelle klik op de schakelaar). */
export function volgendeKeuze(huidig: ThemeKeuze): ThemeKeuze {
  const i = THEME_KEUZES.indexOf(huidig);
  return THEME_KEUZES[(i + 1) % THEME_KEUZES.length];
}

/**
 * Het script dat vóór de eerste paint draait, zodat er geen witte flits is.
 * Bewust als string: het moet inline in de <head> staan, vóór React.
 */
export function themeBootScript(): string {
  return `(function(){try{
var k=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
var v=[${THEME_KEUZES.map((t) => JSON.stringify(t)).join(",")}].indexOf(k)>=0?k:"systeem";
var d=window.matchMedia("(prefers-color-scheme: dark)").matches;
var t=v==="systeem"?(d?${JSON.stringify(SYSTEEM_DONKER)}:${JSON.stringify(SYSTEEM_LICHT)}):v;
document.documentElement.setAttribute("data-theme",t);
document.documentElement.style.colorScheme=t==="licht"?"light":"dark";
}catch(e){}})();`;
}

/** Zet het thema op <html>. De enige functie met een bijwerking. */
export function applyTheme(theme: Theme, root?: { setAttribute(k: string, v: string): void; style: { colorScheme: string } }): void {
  const el =
    root ?? (typeof document !== "undefined" ? document.documentElement : undefined);
  if (!el) return;
  el.setAttribute("data-theme", theme);
  el.style.colorScheme = isDonker(theme) ? "dark" : "light";
}
