/**
 * De Garage — ritstatistieken en badges over opgeslagen routes.
 * Local-first: alles wordt uit de eigen opslag gehaald, niets verlaat de browser.
 * Structuur-compatibel met StoredRoute (maar zonder aliassen, zodat het testbaar is).
 */

export interface GarageRoute {
  name: string;
  /** meters, zoals de app die overal gebruikt */
  distance?: number;
  vehicle: string;
  windingScore?: number;
}

export interface GarageStats {
  routes: number;
  totalKm: number;
  longestKm: number;
  corridors: number;
  corridorLabels: string[];
  vehicles: number;
  bestWinding: number;
}

const CORRIDOR_KEYWORDS: { label: string; words: string[] }[] = [
  { label: "Mergelland", words: ["mergelland", "maastricht", "valkenburg", "gulpen", "slenaken", "zuid-limburg", "ejsden"] },
  { label: "Ardennen", words: ["ardennen", "ardenne", "durbuy", "bastogne", "bastenaken", "houffalize", "la roche"] },
  { label: "Eifel", words: ["eifel", "rursee", "monschau", "nideggen", "nürburg"] },
  { label: "Vogezen", words: ["vogezen", "vosges", "crêtes", "cretes", "ballon", "gérardmer", "gerardmer"] },
  { label: "Sauerland", words: ["sauerland", "winterberg", "willingen", "schmallenberg"] },
  { label: "Zwarte Woud", words: ["zwarte woud", "schwarzwald", "black forest"] },
  { label: "Müllerthal", words: ["müllerthal", "mullerthal", "echternach", "luxemburg", "luxembourg"] },
  { label: "Veluwe", words: ["veluwe", "otterlo", "kröller"] },
  { label: "Zeeland", words: ["zeeland", "domburg", "middelburg", "vlissingen"] },
  { label: "Alpen", words: ["alpen", "alps", "chamonix", "col de"] },
];

const VEHICLE_LABELS: Record<string, string> = {
  car: "Auto",
  motorcycle: "Motor",
  bicycle: "Fiets",
  pedestrian: "Te voet",
};

export function vehicleLabel(vehicle: string): string {
  return VEHICLE_LABELS[vehicle] ?? vehicle;
}

export function computeGarageStats(routes: GarageRoute[]): GarageStats {
  const corridorLabels = new Set<string>();
  const vehicles = new Set<string>();
  let totalKm = 0;
  let longestKm = 0;
  let bestWinding = 0;

  for (const r of routes) {
    const km = (r.distance ?? 0) / 1000;
    totalKm += km;
    if (km > longestKm) longestKm = km;
    if ((r.windingScore ?? 0) > bestWinding) bestWinding = r.windingScore ?? 0;
    if (r.vehicle) vehicles.add(r.vehicle);

    const name = r.name.toLowerCase();
    for (const c of CORRIDOR_KEYWORDS) {
      if (c.words.some((w) => name.includes(w))) {
        corridorLabels.add(c.label);
        break; // één regio per route is genoeg
      }
    }
  }

  return {
    routes: routes.length,
    totalKm: Math.round(totalKm),
    longestKm,
    corridors: corridorLabels.size,
    corridorLabels: [...corridorLabels].sort(),
    vehicles: vehicles.size,
    bestWinding: Math.round(bestWinding),
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  goal: number;
  /** huidige voortgang richting het doel */
  progress: (s: GarageStats) => number;
}

export const BADGES: Badge[] = [
  { id: "eerste-rit", name: "Eerste rit", description: "Bewaar je eerste route", goal: 1, progress: (s) => s.routes },
  { id: "honderd", name: "Honderdknuppel", description: "Één rit van 100 km of langer", goal: 100, progress: (s) => Math.round(s.longestKm) },
  { id: "kilometervreter", name: "Kilometervreter", description: "1.000 km totaal in de garage", goal: 1000, progress: (s) => s.totalKm },
  { id: "verzamelaar", name: "Routeverzamelaar", description: "Vijf routes opgeslagen", goal: 5, progress: (s) => s.routes },
  { id: "grensganger", name: "Grensganger", description: "Rij in drie verschillende regio's", goal: 3, progress: (s) => s.corridors },
  { id: "kronkelaar", name: "Kronkelaar", description: "Kronkelfactor 70+ op een route", goal: 70, progress: (s) => s.bestWinding },
  { id: "allroad", name: "Allroad", description: "Plan met drie verschillende vervoersmiddelen", goal: 3, progress: (s) => s.vehicles },
];

export function unlockedIds(stats: GarageStats): string[] {
  return BADGES.filter((b) => b.progress(stats) >= b.goal).map((b) => b.id);
}

/** Welke badges zijn nieuw bijgekomen (voor confetti + melding). */
export function newlyUnlocked(prev: string[], next: string[]): string[] {
  return next.filter((id) => !prev.includes(id));
}
