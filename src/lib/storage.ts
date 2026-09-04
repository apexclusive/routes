/**
 * Opgeslagen routes in localStorage. Geen account, geen server: alles blijft in
 * de browser van de gebruiker. De geometrie wordt op 5 decimalen afgerond
 * (≈ 1 m nauwkeurig) zodat een lijst met routes niet onnodig ruimte kost.
 */
import type {
  Coordinates,
  GeoJSON,
  Route,
  TurnInstruction,
  VehicleType,
  Waypoint,
} from "@/types";

export const STORAGE_KEY = "apex-routes:saved";
/** localStorage is ~5 MB; we blijven daar met ruime marge onder. */
export const MAX_SAVED_ROUTES = 40;

export interface StoredRoute {
  id: string;
  name: string;
  savedAt: number;
  vehicle: VehicleType;
  waypoints: { id: string; name: string; coordinates: Coordinates }[];
  geometry?: GeoJSON.LineString;
  distance?: number;
  duration?: number;
  turns?: TurnInstruction[];
  windingScore?: number;
  /** geïmporteerde track → Google-navigatie gebruikt de ankers */
  imported?: boolean;
  navAnchors?: Coordinates[];
}

const round5 = (n: number): number => Number(n.toFixed(5));

function compactGeometry(geometry?: GeoJSON.LineString): GeoJSON.LineString | undefined {
  if (!geometry || geometry.coordinates.length < 2) return undefined;
  return {
    type: "LineString",
    coordinates: geometry.coordinates.map(
      (c) => [round5(c[0]), round5(c[1])] as GeoJSON.Position
    ),
  };
}

/** Route + UI-state → opslagformaat (pure functie, los te testen). */
export function toStoredRoute(
  route: Route,
  extras: { vehicle: VehicleType; imported?: boolean; navAnchors?: Coordinates[] }
): StoredRoute {
  return {
    id: route.id,
    name: route.name,
    savedAt: Date.now(),
    vehicle: extras.vehicle,
    waypoints: route.waypoints.map((w) => ({
      id: w.id,
      name: w.name,
      coordinates: { lat: round5(w.coordinates.lat), lng: round5(w.coordinates.lng) },
    })),
    geometry: compactGeometry(route.geometry),
    distance: route.distance,
    duration: route.duration,
    turns: route.turns,
    windingScore: route.windingScore,
    imported: extras.imported || undefined,
    navAnchors: extras.navAnchors?.length
      ? extras.navAnchors.map((c) => ({ lat: round5(c.lat), lng: round5(c.lng) }))
      : undefined,
  };
}

/** Opslagformaat → Route zoals de app die gebruikt. */
export function fromStoredRoute(stored: StoredRoute): {
  route: Route;
  waypoints: Waypoint[];
  vehicle: VehicleType;
  imported: boolean;
  navAnchors: Coordinates[];
} {
  const waypoints: Waypoint[] = stored.waypoints.map((w) => ({
    id: w.id,
    name: w.name,
    coordinates: w.coordinates,
  }));
  return {
    route: {
      id: stored.id,
      name: stored.name,
      waypoints,
      geometry: stored.geometry,
      distance: stored.distance,
      duration: stored.duration,
      turns: stored.turns,
      windingScore: stored.windingScore,
      createdAt: new Date(stored.savedAt),
      updatedAt: new Date(stored.savedAt),
    },
    waypoints,
    vehicle: stored.vehicle,
    imported: Boolean(stored.imported),
    navAnchors: stored.navAnchors ?? [],
  };
}

/** Ruwe JSON uit de opslag valideren — corrupte entries worden overgeslagen. */
export function parseStoredRoutes(raw: string | null): StoredRoute[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is StoredRoute => {
      if (!entry || typeof entry !== "object") return false;
      const r = entry as Partial<StoredRoute>;
      return (
        typeof r.id === "string" &&
        typeof r.name === "string" &&
        typeof r.savedAt === "number" &&
        Array.isArray(r.waypoints) &&
        r.waypoints.length >= 2 &&
        r.waypoints.every(
          (w) =>
            w &&
            typeof w.name === "string" &&
            w.coordinates &&
            Number.isFinite(w.coordinates.lat) &&
            Number.isFinite(w.coordinates.lng)
        )
      );
    });
  } catch {
    return [];
  }
}

/* ---------- browser-API (no-op buiten de browser) ---------- */

function readRaw(): string | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(routes: StoredRoute[]): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    return true;
  } catch {
    // quota vol of storage geblokkeerd (privémodus)
    return false;
  }
}

export function listSavedRoutes(): StoredRoute[] {
  return parseStoredRoutes(readRaw()).sort((a, b) => b.savedAt - a.savedAt);
}

/** Bewaart of overschrijft een route op naam. Geeft de nieuwe lijst terug. */
export function saveRoute(route: StoredRoute): StoredRoute[] {
  const existing = listSavedRoutes().filter(
    (r) => r.name.toLowerCase() !== route.name.toLowerCase()
  );
  const next = [route, ...existing].slice(0, MAX_SAVED_ROUTES);
  writeRaw(next);
  return next;
}

export function deleteSavedRoute(id: string): StoredRoute[] {
  const next = listSavedRoutes().filter((r) => r.id !== id);
  writeRaw(next);
  return next;
}
