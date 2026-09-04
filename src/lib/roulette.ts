/**
 * Route Roulette — de verrassingsmotor.
 * Pure logica (geen DOM, geen aliases) zodat node --test erbij kan.
 * Zelfde seed → zelfde uitkomst: deelnemers kunnen een uitslag delen.
 */

export type RouletteVehicle = "car" | "motorcycle" | "bicycle" | "pedestrian";

export interface CorridorSpec {
  key: string;
  /** Weergavenaam (zonder lidwoord). */
  label: string;
  /** Naam mét lidwoord, zoals hij in een prompt moet staan. */
  inName: string;
  /** Realistisch kilometerbereik voor een dagrit in deze regio. */
  km: [number, number];
  /** Grove hoogtemeters per km — voor de schatting op de kaart. */
  climbPerKm: number;
  /** Kronkelfactor 1–10 (subjectief, op basis van bekende wegen). */
  winding: number;
}

/** Stijl-voorkeur voor de roulette: filtert op kronkelfactor. */
export type RouletteStyle = "rustig" | "mix" | "kronkel";

export const CORRIDOR_POOL: CorridorSpec[] = [
  { key: "mergellandroute", label: "Mergelland", inName: "het Mergelland", km: [40, 140], climbPerKm: 11, winding: 9 },
  { key: "ardennen", label: "Ardennen", inName: "de Ardennen", km: [80, 260], climbPerKm: 12, winding: 8 },
  { key: "eifel", label: "Eifel", inName: "de Eifel", km: [80, 250], climbPerKm: 11, winding: 7 },
  { key: "vogezen", label: "Vogezen", inName: "de Vogezen", km: [100, 300], climbPerKm: 13, winding: 8 },
  { key: "sauerland", label: "Sauerland", inName: "het Sauerland", km: [90, 260], climbPerKm: 10, winding: 6 },
  { key: "zwarte-woud", label: "Zwarte Woud", inName: "het Zwarte Woud", km: [120, 320], climbPerKm: 12, winding: 7 },
  { key: "mullerthal", label: "Müllerthal", inName: "het Müllerthal", km: [50, 160], climbPerKm: 12, winding: 4 },
  { key: "veluwe", label: "Veluwe", inName: "de Veluwe", km: [50, 180], climbPerKm: 5, winding: 3 },
  { key: "zeeland", label: "Zeeland", inName: "Zeeland", km: [40, 150], climbPerKm: 3, winding: 2 },
  { key: "alpen", label: "Franse Alpen", inName: "de Franse Alpen", km: [150, 400], climbPerKm: 20, winding: 10 },
];

const VEHICLE_WORDS: Record<RouletteVehicle, string> = {
  motorcycle: "motorrondrit",
  car: "autorondrit",
  bicycle: "fietstocht",
  pedestrian: "wandeling",
};

const RIDE_ADJECTIVES = [
  "Gouden", "Wilde", "Zwarte", "Snelle", "Stille",
  "Brullende", "Vrije", "Donkere", "Glooiende", "Verre",
];

const RIDE_NOUNS = [
  "Havik", "Valk", "Panter", "Adelaar", "Feniks",
  "Komeet", "Horizon", "Kronkel", "Bliksem", "Nachtwind",
];

/** String → 32-bit seed (xmur3-variant). */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Deterministische PRNG (mulberry32) — klein, snel, goed genoeg voor roulette. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RouletteResult {
  seed: string;
  corridor: CorridorSpec;
  /** Afgerond op 5 km, altijd binnen het bereik van de corridor. */
  km: number;
  climbEstimate: number;
  rideName: string;
  /** Kant-en-klare prompt voor de route-assistent. */
  prompt: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Draait een verrassingsrit. `kmTarget` is een wens (wordt begrensd door wat
 * de regio te bieden heeft); `avoidKey` voorkomt twee keer dezelfde regio.
 */
export function spinRoulette(opts: {
  vehicle: RouletteVehicle;
  kmTarget?: number;
  seed?: string;
  avoidKey?: string;
  /** "rustig" (winding <= 5), "kronkel" (>= 7) of "mix" (alles). */
  style?: RouletteStyle;
}): RouletteResult {
  const seed = opts.seed ?? Math.random().toString(36).slice(2, 10);
  const rnd = mulberry32(hashSeed(seed));
  const target = clamp(opts.kmTarget ?? 100, 30, 400);

  let pool = CORRIDOR_POOL;
  if (opts.style === "rustig") {
    pool = pool.filter((c) => c.winding <= 5);
  } else if (opts.style === "kronkel") {
    pool = pool.filter((c) => c.winding >= 7);
  }
  if (opts.avoidKey && pool.length > 1) {
    pool = pool.filter((c) => c.key !== opts.avoidKey);
  }
  // regio's die het gewenste aantal km aankunnen hebben voorkeur
  const reachable = pool.filter((c) => target <= c.km[1] + 40);
  const list = reachable.length ? reachable : pool;
  const corridor = list[Math.floor(rnd() * list.length)];

  const span = corridor.km[1] - corridor.km[0];
  const wish = clamp((target - corridor.km[0]) / span, 0, 1);
  const mix = 0.55 * wish + 0.45 * rnd(); // wens telt zwaar, verrassing blijft
  const km = clamp(
    Math.round((corridor.km[0] + span * mix) / 5) * 5,
    corridor.km[0],
    corridor.km[1]
  );

  const climbEstimate = Math.round((km * corridor.climbPerKm) / 10) * 10;
  const rideName = `De ${RIDE_ADJECTIVES[Math.floor(rnd() * RIDE_ADJECTIVES.length)]} ${
    RIDE_NOUNS[Math.floor(rnd() * RIDE_NOUNS.length)]
  }`;

  const prompt =
    `mooie kronkelige ${VEHICLE_WORDS[opts.vehicle]} van ongeveer ${km} km ` +
    `door ${corridor.inName}`;

  return { seed, corridor, km, climbEstimate, rideName, prompt };
}

/** Korte deel-tekst voor een uitslag (bijv. onder een social-post). */
export function rouletteShareText(r: RouletteResult): string {
  return `${r.rideName} — ${r.km} km door ${r.corridor.inName} ` +
    `(≈ ${r.climbEstimate} hm). Gedraaid met Apex Routes, seed ${r.seed}.`;
}
