/**
 * Navigatie-hulp: OSRM-manoeuvres → Nederlandse routebeschrijving en slimme
 * navigatie-ankers voor de Google Maps URL-API.
 *
 * Achtergrond: Google Maps URLs ondersteunen max ±9 tussenliggende waypoints.
 * Ruwe GPX-punten of POI's als anker geven een verkeerde route (Google navigeert
 * *naartoe* i.p.v. *erlangs*). Deze module kiest ankers die exact op de
 * (map-matched) weg liggen, op de punten waar de route écht afslaat — zo volgt
 * Google tussen de ankers de bedoelde weg.
 */
import type { GeoJSON, TurnInstruction, Coordinates } from "../types.ts";

/* ---------- NL-instructies ---------- */

export interface OSRMStep {
  maneuver: {
    type: string;
    modifier?: string;
    exit?: number;
    location: [number, number];
  };
  distance: number;
  duration: number;
  name?: string;
}

const DIRECTION_NL: Record<string, Record<string, string>> = {
  turn: {
    left: "Sla linksaf",
    right: "Sla rechtsaf",
    "sharp left": "Sla scherp linksaf",
    "sharp right": "Sla scherp rechtsaf",
    "slight left": "Blijf links aanhouden",
    "slight right": "Blijf rechts aanhouden",
    straight: "Ga rechtdoor",
    uturn: "Keer om",
  },
  continue: {
    left: "Blijf linksaan",
    right: "Blijf rechtsaan",
    "sharp left": "Sla scherp linksaf",
    "sharp right": "Sla scherp rechtsaf",
    "slight left": "Blijf links aanhouden",
    "slight right": "Blijf rechts aanhouden",
    straight: "Rechtdoor",
    uturn: "Keer om",
  },
  fork: {
    left: "Splitsing: houd links aan",
    right: "Splitsing: houd rechts aan",
    "slight left": "Splitsing: links aanhouden",
    "slight right": "Splitsing: rechts aanhouden",
    straight: "Splitsing: rechtdoor",
    uturn: "Keer om",
  },
  merge: {
    left: "Voeg links in",
    right: "Voeg rechts in",
    "slight left": "Voeg links in",
    "slight right": "Voeg rechts in",
    straight: "Voeg in",
    uturn: "Keer om",
  },
  "on ramp": {
    left: "Neem de oprit links",
    right: "Neem de oprit rechts",
    "slight left": "Neem de oprit links",
    "slight right": "Neem de oprit rechts",
    straight: "Neem de oprit",
    uturn: "Keer om",
  },
  "off ramp": {
    left: "Neem de afrit links",
    right: "Neem de afrit rechts",
    "slight left": "Neem de afrit links",
    "slight right": "Neem de afrit rechts",
    straight: "Neem de afrit",
    uturn: "Keer om",
  },
  "end of road": {
    left: "Einde van de weg: sla linksaf",
    right: "Einde van de weg: sla rechtsaf",
    "slight left": "Einde van de weg: links aanhouden",
    "slight right": "Einde van de weg: rechts aanhouden",
    straight: "Einde van de weg: rechtdoor",
    uturn: "Keer om",
  },
};

/** "Sla linksaf" + wegnaam met correct lidwoord ("naar de Kerkstraat", "naar A2"). */
function withRoad(base: string, road?: string): string {
  if (!road) return base;
  if (/^(A|N|R|E|L|B)\d/i.test(road)) return `${base} naar ${road}`;
  return `${base} naar de ${road}`;
}

export function nlInstruction(step: OSRMStep): string | null {
  const t = step.maneuver.type;
  const m = step.maneuver.modifier || "straight";

  // ruis wegfilteren
  if (t === "new name" || t === "notification") return null;

  if (t === "depart") {
    return step.name ? `Vertrek op de ${step.name}` : "Vertrek";
  }
  if (t === "arrive") {
    return "Aangekomen op je bestemming";
  }
  if (t === "roundabout" || t === "rotary" || t === "roundabout turn") {
    const exit = step.maneuver.exit;
    const base = exit ? `Rotonde: neem de ${exit}e afslag` : "Ga de rotonde op";
    return step.name ? withRoad(base, step.name) : base;
  }
  if (t === "exit roundabout" || t === "exit rotary") {
    return "Verlaat de rotonde";
  }

  const table = DIRECTION_NL[t];
  const base = table?.[m];
  if (base) return withRoad(base, step.name);

  // fallback voor onbekende combinaties
  if (m === "uturn") return "Keer om";
  if (m.includes("left")) return withRoad("Sla linksaf", step.name);
  if (m.includes("right")) return withRoad("Sla rechtsaf", step.name);
  return null;
}

function stepPriority(t: string, m: string): number {
  if (t.includes("roundabout") || t === "rotary") return 3.2;
  if (m === "uturn") return 3.5;
  if (m.startsWith("sharp")) return 3;
  if (m === "left" || m === "right") return 2.5;
  if (t === "fork" || t === "merge" || t === "on ramp" || t === "off ramp" || t === "end of road")
    return 2;
  if (m.startsWith("slight")) return 1.2;
  return 0.5; // rechtdoor-achtige stappen
}

/**
 * Zet OSRM-legs om naar een compacte NL-routebeschrijving.
 * Ruis (naamloze rechtdoor-stappen) valt weg; bij > max instructies blijven
 * de belangrijkste afslagen over (aankomst gaat altijd mee).
 */
export function buildTurnByTurn(
  route: { legs?: { steps?: OSRMStep[] }[] },
  max = 80
): TurnInstruction[] {
  const all: (TurnInstruction & { p: number })[] = [];
  let fromStart = 0;

  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      fromStart += step.distance ?? 0;
      const text = nlInstruction(step);
      if (!text) continue;
      if (step.maneuver.type === "depart") continue;

      all.push({
        instruction: text,
        distanceFromStart: fromStart,
        distanceAfter: step.distance ?? 0,
        road: step.name,
        modifier: step.maneuver.modifier,
        type: step.maneuver.type,
        location: {
          lat: step.maneuver.location[1],
          lng: step.maneuver.location[0],
        },
        p: stepPriority(step.maneuver.type, step.maneuver.modifier || "straight"),
      });
    }
  }

  const strip = (x: TurnInstruction & { p: number }): TurnInstruction => {
    const { p: _p, ...rest } = x;
    return rest;
  };

  if (all.length <= max) return all.map(strip);

  // behoud aankomst + belangrijkste instructies
  const keep = new Set<number>();
  all.forEach((s, i) => {
    if (s.type === "arrive") keep.add(i);
  });
  all
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.p - a.s.p)
    .slice(0, max)
    .forEach(({ i }) => keep.add(i));

  return all.filter((_, i) => keep.has(i)).map(strip);
}

/* ---------- slimme navigatie-ankers ---------- */

export interface NavAnchor {
  coordinates: Coordinates;
  reason: "start" | "turn" | "spacing" | "end";
  /** Afslaaghoeek in graden (alleen bij reason==="turn"). */
  delta?: number;
}

function bearingDeg(a: GeoJSON.Position, b: GeoJSON.Position): number {
  const φ1 = (a[1] * Math.PI) / 180;
  const φ2 = (b[1] * Math.PI) / 180;
  const Δλ = ((b[0] - a[0]) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function distM(a: GeoJSON.Position, b: GeoJSON.Position): number {
  const R = 6371000;
  const φ1 = (a[1] * Math.PI) / 180;
  const φ2 = (b[1] * Math.PI) / 180;
  const dφ = φ2 - φ1;
  const dλ = ((b[0] - a[0]) * Math.PI) / 180;
  const h =
    Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Kiest maximaal `maxIntermediate` + 2 ankers op de (map-matched) geometrie:
 * - start en eind altijd;
 * - daarna de punten met de grootste afslaaghoeken (beslispunten waar Google
 *   zonder anker de verkeerde weg zou kiezen), met minimale onderlinge afstand;
 * - resterende plekken: gelijkmatig verdeelde tussenankers tegen shortcuts.
 * Alle ankers zijn bestaande vertices van de geometrie → liggen exact op de weg.
 */
export function selectNavigationAnchors(
  geometry: GeoJSON.LineString,
  maxIntermediate = 9
): NavAnchor[] {
  const cs = geometry.coordinates;
  const n = cs.length;
  const start = { coordinates: { lat: cs[0][1], lng: cs[0][0] }, reason: "start" as const };
  const end = {
    coordinates: { lat: cs[n - 1][1], lng: cs[n - 1][0] },
    reason: "end" as const,
  };
  if (n < 3 || maxIntermediate <= 0) return [start, end];

  // cumulatieve afstand
  const cum = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + distM(cs[i - 1], cs[i]);
  const total = cum[n - 1];
  const minSpacing = Math.max(400, total / 50);

  // kandidaten: echte afslagen (Δhoek ≥ 22°), niet vlak bij start/eind
  const cands: { i: number; delta: number; score: number }[] = [];
  for (let i = 1; i < n - 1; i++) {
    const delta = angleDiff(bearingDeg(cs[i - 1], cs[i]), bearingDeg(cs[i], cs[i + 1]));
    if (delta < 22) continue;
    if (cum[i] < 300 || total - cum[i] < 300) continue;
    // hoe langer het rechte stuk rondom, hoe belangrijker het anker
    const around = Math.min(cum[i] - cum[Math.max(0, i - 3)], cum[Math.min(n - 1, i + 3)] - cum[i]);
    cands.push({ i, delta, score: delta * Math.log10(10 + around) });
  }

  const picked: number[] = [];
  /** Indices die als beslispunt zijn gekozen (de rest is opvulling). */
  const turnIdx = new Set<number>();
  const spaced = (i: number) => picked.every((j) => Math.abs(cum[i] - cum[j]) >= minSpacing);

  cands.sort((a, b) => b.score - a.score);
  for (const c of cands) {
    if (picked.length >= maxIntermediate) break;
    if (spaced(c.i)) {
      picked.push(c.i);
      turnIdx.add(c.i);
    }
  }

  // overgebleven plekken: gelijkmatige tussenankers
  if (picked.length < maxIntermediate && n > 2) {
    const slots = maxIntermediate - picked.length;
    for (let k = 1; k <= slots; k++) {
      const target = (total * k) / (slots + 1);
      let best = -1;
      let bd = Infinity;
      for (let i = 1; i < n - 1; i++) {
        const d = Math.abs(cum[i] - target);
        if (d < bd && spaced(i)) {
          bd = d;
          best = i;
        }
      }
      if (best >= 0) picked.push(best);
      else break;
    }
  }

  picked.sort((a, b) => a - b);
  const deltaByIdx = new Map(cands.map((c) => [c.i, c.delta]));
  return [
    start,
    ...picked.map((i) =>
      turnIdx.has(i)
        ? {
            coordinates: { lat: cs[i][1], lng: cs[i][0] },
            reason: "turn" as const,
            delta: deltaByIdx.get(i),
          }
        : {
            coordinates: { lat: cs[i][1], lng: cs[i][0] },
            reason: "spacing" as const,
          }
    ),
    end,
  ];
}
