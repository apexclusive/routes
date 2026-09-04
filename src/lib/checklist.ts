/**
 * Vertrek-checklist per vervoermiddel — pure data, herbruikbaar voor de
 * gelijknamige toolpagina (/checklist). Gecheckte items worden per voertuig
 * in de browser bewaard (apex-routes:checklist:{vehicle}).
 */

export type ChecklistVehicle = "motor" | "auto" | "fiets" | "wandelen";

export interface ChecklistItem {
  id: string;
  label: string;
  /** optionele toelichting / waarom het telt */
  hint?: string;
}

export interface ChecklistDoc {
  sections: { title: string; items: ChecklistItem[] }[];
}

const DOCUMENTEN: ChecklistItem[] = [
  { id: "rijbewijs", label: "Rijbewijs / legitimatie" },
  { id: "verzekering", label: "Verzekeringspapieren (groene kaart buitenland)" },
  { id: "apk", label: "APK-keuring geldig tot na de rit", hint: "Check het tenaamstellingsbewijs" },
  { id: "noodnummers", label: "Noodnummers bekend: 112 · ANWB 088-269 28 88", hint: "In het buitenland: ADAC +49 89 20 20 40 00" },
];

const VLIESEN: ChecklistItem[] = [
  { id: "bandendruk", label: "Bandenspanning koud gemeten (incl. reservewiel)", hint: "Motor: ook onbelaste waarde checken" },
  { id: "profiel", label: "Profiel minimaal 2 mm (wens: 3 mm+)", hint: "Zijflanken op scheuren checken" },
  { id: "olie", label: "Oliepeil tussen min en max op vlakke ondergrond" },
  { id: "koelvloeistof", label: "Koelvloeistof op koud motorblok" },
  { id: "ruitenwissers", label: "Ruitenwisser­vloeistof en bladen" },
  { id: "verlichting", label: "Alle verlichting: rem, knipper, dim, achteruit" },
  { id: "remmen", label: "Remblokken/-schijven: slijtage-indicator vrij?" },
  { id: "accu", label: "Accu-spanning rust (12,6 V)" },
];

const MOTOR_EXTRA: ChecklistItem[] = [
  { id: "ketting", label: "Kettingspanning ~2,5 cm spel, gesmeerd" },
  { id: "hefbok", label: "Middenbok/koplager: geen spel" },
  { id: "kleding", label: "Motorpak of CE-AA-jas, handschoenen, laarzen" },
  { id: "helm", label: "Helm: pinlock, geen scheurtjes, D-ring sluit" },
];

const AUTO_EXTRA: ChecklistItem[] = [
  { id: "reservewiel", label: "Reservewiel/instantset aanwezig + krik" },
  { id: "drukmeter", label: "Bandenspanningsmeter mee" },
  { id: "veiligheidsvest", label: "Veiligheidsvest(en) binnen handbereik", hint: "In Frankrijk verplicht in de auto" },
  { id: "gevarendriehoek", label: "Gevarendriehoek" },
];

const FIETS_EXTRA: ChecklistItem[] = [
  { id: "bandenplug", label: "Pluckit/CO2 of reservebinnenband" },
  { id: "multitool", label: "Multitool met torx" },
  { id: "kettingpin", label: "Magazijnkoppeling / powerlink" },
  { id: "helm-fiets", label: "Helm past, riem OK" },
];

const WANDEL_EXTRA: ChecklistItem[] = [
  { id: "schoenen", label: "Schoenen ingelopen, veters dubbel geknoopt" },
  { id: "blaren", label: "Blarenkit: tape, naald, pleisters" },
  { id: "stokken", label: "Nordic stokken: schijven op rubber?" },
  { id: "laagjes", label: "Laagjes­systeem: basis + isolerende laag" },
];

const ONDERWEG: ChecklistItem[] = [
  { id: "water", label: "Water: 0,5 L per uur inspanning" },
  { id: "eten", label: "Snelle + trage energie (bananen, noten)" },
  { id: "powerbank", label: "Powerbank + kabels, telefoon 100%" },
  { id: "offline", label: "Route offline beschikbaar (GPX gedownload)" },
  { id: "weer", label: "Weercheck bij vertrek en terugweg" },
  { id: "zonsondergang", label: "Zonsondergang bekend — terug vóór donker?" },
  { id: "eerste-hulp", label: "Eerste-hulpkit" },
  { id: "contant", label: "Contant geld of pas voor koffiestop" },
  { id: "kenteken", label: "P-plek nota; sleutels reserve op zak" },
];

export const CHECKLISTS: Record<ChecklistVehicle, ChecklistDoc> = {
  motor: {
    sections: [
      { title: "Documenten & veiligheid", items: DOCUMENTEN },
      { title: "Vloeistoffen, banden & techniek", items: VLIESEN },
      { title: "Motor specifiek", items: MOTOR_EXTRA },
      { title: "Onderweg", items: ONDERWEG },
    ],
  },
  auto: {
    sections: [
      { title: "Documenten & veiligheid", items: DOCUMENTEN },
      { title: "Vloeistoffen, banden & techniek", items: VLIESEN },
      { title: "Auto specifiek", items: AUTO_EXTRA },
      { title: "Onderweg", items: ONDERWEG },
    ],
  },
  fiets: {
    sections: [
      { title: "Documenten & veiligheid", items: [DOCUMENTEN[0], DOCUMENTEN[3]] },
      { title: "Techniek", items: [VLIESEN[0], VLIESEN[6], FIETS_EXTRA[1]] },
      { title: "Fiets specifiek", items: [FIETS_EXTRA[0], FIETS_EXTRA[2], FIETS_EXTRA[3]] },
      { title: "Onderweg", items: ONDERWEG },
    ],
  },
  wandelen: {
    sections: [
      { title: "Veiligheid", items: [DOCUMENTEN[3]] },
      { title: "Uitrusting", items: [WANDEL_EXTRA[0], WANDEL_EXTRA[1], WANDEL_EXTRA[2], WANDEL_EXTRA[3]] },
      { title: "Onderweg", items: ONDERWEG },
    ],
  },
};

export const CHECKLIST_VEHICLES: { id: ChecklistVehicle; label: string }[] = [
  { id: "motor", label: "Motor" },
  { id: "auto", label: "Auto & cabrio" },
  { id: "fiets", label: "Fiets" },
  { id: "wandelen", label: "Wandelen" },
];

/* ---------- opslag (browser) ---------- */

export const checkKey = (vehicle: ChecklistVehicle): string =>
  `apex-routes:checklist:${vehicle}`;

export function loadChecked(vehicle: ChecklistVehicle): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(checkKey(vehicle));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveChecked(vehicle: ChecklistVehicle, ids: string[]): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(checkKey(vehicle), JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

/** Zuivere toggle op lijst-niveau. */
export function toggleChecked(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/** Voortgang in hele procenten (0–100). */
export function progress(doc: ChecklistDoc, checked: string[]): number {
  const total = doc.sections.reduce((n, sec) => n + sec.items.length, 0);
  if (total === 0) return 0;
  const valid = new Set(doc.sections.flatMap((sec) => sec.items.map((i) => i.id)));
  const done = checked.filter((id) => valid.has(id)).length;
  return Math.round((done / total) * 100);
}

/* ---------- eigen items (browser) ---------- */

/** Zelf toegevoegde regel op de vertrek-checklist. */
export interface CustomCheckItem {
  id: string;
  label: string;
}

export const customKey = (vehicle: ChecklistVehicle): string =>
  `apex-routes:checklist-custom:${vehicle}`;

/** Voldoende uniek id voor een eigen item. */
export function makeCustomId(): string {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadCustom(vehicle: ChecklistVehicle): CustomCheckItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(customKey(vehicle));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is CustomCheckItem =>
          !!x &&
          typeof x === "object" &&
          typeof (x as Record<string, unknown>).id === "string" &&
          typeof (x as Record<string, unknown>).label === "string"
      )
      .map((x) => ({ id: x.id, label: x.label.slice(0, 60) }));
  } catch {
    return [];
  }
}

export function saveCustom(
  vehicle: ChecklistVehicle,
  items: CustomCheckItem[]
): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(customKey(vehicle), JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
