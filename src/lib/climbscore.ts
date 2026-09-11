/**
 * Klim-zwaarte volgens de FIETS-index — de standaard van het Nederlandse
 * tijdschrift Fiets die internationaal gebruikt wordt om beklimmingen
 * objectief te ranken (o.a. door climbfinder en de col-verzamelaars).
 *
 * De officiële formule:
 *
 *   index = H² / (D × 10)  +  (T − 1000) / 1000   [tweede term alleen als > 0]
 *
 *   H = hoogteverschil van de klim in meters
 *   D = lengte van de klim in meters
 *   T = hoogte van de top in meters boven zeeniveau
 *
 * De hoogtemeters wegen kwadratisch, dus een korte muur aan 12% telt zwaarder
 * dan een lange dijk aan 3%; de tweede term corrigeert voor ijle lucht boven
 * 1000 meter. Apex voegt daar één eerlijk gemarkeerde toeslag aan toe voor
 * kasseien en keien, omdat die op de Vlaamse hellingen het verschil maken.
 *
 * Referentiewaarden ter controle: Alpe d'Huez ≈ 9,2 · Mont Ventoux ≈ 12,8 ·
 * Cauberg ≈ 0,4. Puur en alias-vrij zodat de score buiten de browser te testen is.
 */

import type { Climb } from "./climbs.ts";

export type ZwaarteKlasse =
  | "instap"
  | "pittig"
  | "zwaar"
  | "loodzwaar"
  | "buitencategorie";

export interface ClimbScore {
  /** FIETS-index, één decimaal; hoger is zwaarder */
  score: number;
  klasse: ZwaarteKlasse;
  /** 0-100 t.o.v. de zwaarste klim in de bibliotheek */
  relatief: number;
  /** Nederlandse omschrijving in één zin */
  label: string;
}

/** Toeslag voor los wegdek, in FIETS-punten (Apex-uitbreiding, gemarkeerd). */
const SURFACE_TOESLAG: Record<Climb["surface"], number> = {
  asfalt: 0,
  kassei: 1.2,
  keien: 0.9,
};

/** Zuivere FIETS-index zonder Apex-toeslag. */
export function fietsIndex(c: Climb): number {
  const basis = (c.elevationM * c.elevationM) / (c.lengthM * 10);
  const hoogte = Math.max(0, (c.summitM - 1000) / 1000);
  return basis + hoogte;
}

/** FIETS-index inclusief de wegdektoeslag, afgerond op één decimaal. */
export function climbScore(c: Climb): number {
  return Math.round((fietsIndex(c) + SURFACE_TOESLAG[c.surface]) * 10) / 10;
}

const DREMPELS: { max: number; klasse: ZwaarteKlasse; label: string }[] = [
  { max: 1, klasse: "instap", label: "Instapklim — goed te doen op een rustig tempo." },
  { max: 3, klasse: "pittig", label: "Pittig — kort maar stevig, of lang en gelijkmatig." },
  { max: 6, klasse: "zwaar", label: "Zware klim — reken op een serieuze inspanning." },
  { max: 9, klasse: "loodzwaar", label: "Loodzwaar — een hoofdgerecht van de dag." },
  {
    max: Number.POSITIVE_INFINITY,
    klasse: "buitencategorie",
    label: "Buitencategorie — een col waar je de dag omheen plant.",
  },
];

export function zwaarteKlasse(score: number): { klasse: ZwaarteKlasse; label: string } {
  const hit = DREMPELS.find((d) => score < d.max) ?? DREMPELS[DREMPELS.length - 1];
  return { klasse: hit.klasse, label: hit.label };
}

/** Volledige score inclusief positie t.o.v. de hele bibliotheek. */
export function rateClimb(c: Climb, alle: Climb[]): ClimbScore {
  const score = climbScore(c);
  const max = alle.reduce((m, x) => Math.max(m, climbScore(x)), 0.1);
  const { klasse, label } = zwaarteKlasse(score);
  return {
    score,
    klasse,
    label,
    relatief: Math.max(1, Math.min(100, Math.round((score / max) * 100))),
  };
}

/** Bibliotheek gesorteerd van zwaar naar licht (voor ranglijsten). */
export function rankClimbs(alle: Climb[]): { climb: Climb; score: number; rang: number }[] {
  return alle
    .map((climb) => ({ climb, score: climbScore(climb) }))
    .sort((a, b) => b.score - a.score || a.climb.id.localeCompare(b.climb.id))
    .map((row, i) => ({ ...row, rang: i + 1 }));
}

/**
 * Geschatte klimtijd in minuten per niveau (fiets), op basis van VAM
 * (verticale meters per uur) — realistische bandbreedtes voor wielrenners.
 */
export function klimtijdMinuten(c: Climb): { recreant: number; sportief: number; pro: number } {
  const vam = { recreant: 600, sportief: 950, pro: 1500 };
  const rond = (v: number) => Math.max(2, Math.round((c.elevationM / v) * 60));
  return { recreant: rond(vam.recreant), sportief: rond(vam.sportief), pro: rond(vam.pro) };
}
