import type {
  Coordinates,
  Waypoint,
  RoutePreferences,
  GeoJSON,
  VehicleType,
  TurnInstruction,
} from "../types.ts";

/* ---------- geometry ---------- */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
  }
  return `${Math.round(meters / 10) * 10} m`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} u ${minutes} min`;
  }
  return `${minutes} min`;
}

/* ---------- geocoding ---------- */
// Ingebouwde gazetteer als laatste redmiddel wanneer de externe dienst
// (tijdelijk) onbereikbaar is. In productie wint Nominatim; dit is enkel fallback.
const KNOWN_PLACES: { name: string; lat: number; lng: number; aliases: string[] }[] =
  [
    { name: "Maastricht", lat: 50.8511, lng: 5.6909, aliases: ["maastricht"] },
    { name: "Eijsden", lat: 50.7781, lng: 5.7219, aliases: ["eijsden"] },
    { name: "Slenaken", lat: 50.7553, lng: 5.833, aliases: ["slenaken"] },
    { name: "Gulpen", lat: 50.813, lng: 5.8893, aliases: ["gulpen"] },
    { name: "Valkenburg", lat: 50.8644, lng: 5.833, aliases: ["valkenburg"] },
    { name: "Baden-Baden", lat: 48.7606, lng: 8.2396, aliases: ["baden-baden", "baden baden"] },
    { name: "Freudenstadt", lat: 48.4636, lng: 8.411, aliases: ["freudenstadt"] },
    { name: "Monschau", lat: 50.5479, lng: 6.2408, aliases: ["monschau"] },
    { name: "Middelburg", lat: 51.4995, lng: 3.6109, aliases: ["middelburg"] },
    { name: "Amsterdam", lat: 52.3676, lng: 4.9041, aliases: ["amsterdam"] },
    { name: "Rotterdam", lat: 51.9244, lng: 4.4777, aliases: ["rotterdam"] },
    { name: "Utrecht", lat: 52.0907, lng: 5.1214, aliases: ["utrecht"] },
    { name: "Eindhoven", lat: 51.4416, lng: 5.4697, aliases: ["eindhoven"] },
    { name: "Brussel", lat: 50.8503, lng: 4.3517, aliases: ["brussel", "brussels"] },
    { name: "Antwerpen", lat: 51.2194, lng: 4.4025, aliases: ["antwerpen"] },
    { name: "Keulen", lat: 50.9375, lng: 6.9603, aliases: ["keulen", "cologne", "köln"] },
  ];

function offlineGeocode(query: string): Coordinates | null {
  const q = query.toLowerCase().trim();
  const hit = KNOWN_PLACES.find(
    (p) =>
      p.aliases.some((a) => q.includes(a)) || q.includes(p.name.toLowerCase())
  );
  return hit ? { lat: hit.lat, lng: hit.lng } : null;
}

function offlineReverse(coords: Coordinates): string {
  let best: (typeof KNOWN_PLACES)[number] | null = null;
  let bd = Infinity;
  for (const p of KNOWN_PLACES) {
    const d = haversineKm(coords, { lat: p.lat, lng: p.lng });
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  if (best && bd < 30) {
    return bd > 1.5 ? `${best.name} (omgeving)` : best.name;
  }
  return "Onbekende locatie";
}

/** Naam van de dichtstbijzijnde bekende plaats — instant, zonder netwerk. */
export function nearestKnownPlaceName(coords: Coordinates): string {
  return offlineReverse(coords);
}

export async function geocodeAddress(
  query: string
): Promise<Coordinates | null> {
  const cacheKey = `geocode_${query.toLowerCase().trim()}`;
  try {
    if (typeof sessionStorage !== "undefined") {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as Coordinates;
    }
  } catch {
    /* ignore */
  }

  try {
    const response = await fetch(
      `/api/geocode?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Geocoding failed");
    const data = await response.json();
    if (Array.isArray(data) && data[0]) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      if (!isFinite(result.lat) || !isFinite(result.lng)) {
        return offlineGeocode(query);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        }
      } catch {
        /* ignore */
      }
      return result;
    }
    return offlineGeocode(query);
  } catch {
    return offlineGeocode(query);
  }
}

export async function reverseGeocode(coords: Coordinates): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/reverse?lat=${coords.lat}&lng=${coords.lng}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const addr = data.address || {};
    const parts = [
      addr.road || addr.pedestrian || addr.path,
      addr.city || addr.town || addr.village,
    ].filter(Boolean);
    return parts.slice(0, 2).join(", ") || "Onbekende locatie";
  } catch {
    return offlineReverse(coords);
  }
}

/* ---------- routing (OSRM public demo) ---------- */
// Offline fallback: als de routing-engine onbereikbaar is, maken we een
// gevulde polylijn tussen de punten met een realistische afstand/snelheid-schatting.
function buildOfflineRoute(
  waypoints: Coordinates[],
  vehicle: VehicleType
): OSRMRoute {
  const line: number[][] = [];
  let dist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const seg = haversineKm(a, b);
    dist += seg;
    const n = Math.max(2, Math.min(80, Math.round(seg / 0.5)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      line.push([a.lng + (b.lng - a.lng) * t, a.lat + (b.lat - a.lat) * t]);
    }
  }
  const speed =
    vehicle === "bicycle" ? 18 : vehicle === "pedestrian" ? 4.5 : vehicle === "motorcycle" ? 65 : 55;
  const distanceM = dist * 1000 * 1.25; // wegenfactor voor bochten
  const durationS = (distanceM / 1000 / speed) * 3600;
  return {
    distance: distanceM,
    duration: durationS,
    geometry: { type: "LineString", coordinates: line as GeoJSON.Position[] },
    legs: [],
    // markeer de schatting: de UI toont hiermee eerlijk "≈ geschat"
    estimated: true,
  };
}

export interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
  /**
   * true = de routing-dienst was onbereikbaar en dit is een hemelsbrede
   * schatting i.p.v. een route over echte wegen.
   */
  estimated?: boolean;
  legs: {
    steps: {
      maneuver: {
        type: string;
        modifier?: string;
        location: [number, number];
      };
      distance: number;
      duration: number;
      name?: string;
      instruction: string;
    }[];
  }[];
}

/** Veiligheidsplafond: de publieke OSRM-demo heeft een URL-limiet. */
export const MAX_WAYPOINTS = 25;

const VEHICLE_PROFILE: Record<VehicleType, string> = {
  car: "driving",
  motorcycle: "driving",
  bicycle: "bike",
  pedestrian: "foot",
};

export async function calculateRoute(
  waypoints: Coordinates[],
  preferences?: Partial<RoutePreferences>
): Promise<OSRMRoute> {
  if (waypoints.length < 2) {
    throw new Error("Minimaal 2 routepunten vereist");
  }
  if (waypoints.length > MAX_WAYPOINTS) {
    throw new Error(`Maximaal ${MAX_WAYPOINTS} routepunten per route`);
  }

  const coords = waypoints
    .map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`)
    .join(";");

  const vehicle = (preferences?.vehicleType ?? "car") as VehicleType;
  const profile = VEHICLE_PROFILE[vehicle] ?? "driving";

  const params = new URLSearchParams({ profile, coords });
  if (preferences?.avoidHighways && profile === "driving") {
    params.set("exclude", "highways");
  }

  try {
    const response = await fetch(`/api/route?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.code === "Ok" && data.routes?.[0]) {
        return { ...(data.routes[0] as OSRMRoute), estimated: false };
      }
    }
  } catch {
    /* val onderstaand terug */
  }

  // Engine onbereikbaar → offline schatting zodat de UI altijd een route toont.
  return buildOfflineRoute(waypoints, vehicle);
}

/* ---------- winding score ---------- */
export function calculateWindingScore(geometry: GeoJSON.LineString): number {
  const coords = geometry.coordinates;
  if (coords.length < 3) return 0;

  let sum = 0;
  let totalDistance = 0;

  for (let i = 1; i < coords.length - 1; i++) {
    const d1 = haversineKm(
      { lat: coords[i - 1][1], lng: coords[i - 1][0] },
      { lat: coords[i][1], lng: coords[i][0] }
    );
    const d2 = haversineKm(
      { lat: coords[i][1], lng: coords[i][0] },
      { lat: coords[i + 1][1], lng: coords[i + 1][0] }
    );

    if (d1 < 0.02 || d2 < 0.02) continue;

    const angle1 = Math.atan2(
      coords[i][0] - coords[i - 1][0],
      coords[i][1] - coords[i - 1][1]
    );
    const angle2 = Math.atan2(
      coords[i + 1][0] - coords[i][0],
      coords[i + 1][1] - coords[i][1]
    );

    let angleDiff = Math.abs(angle1 - angle2) * (180 / Math.PI);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    sum += angleDiff;
    totalDistance += (d1 + d2) / 2;
  }

  return totalDistance > 0 ? Math.round(sum / totalDistance) : 0;
}

export function windingLabel(score: number): {
  text: string;
  color: string;
  icon: string;
} {
  if (score > 260)
    return { text: "Extreme slingers", color: "text-rose-400", icon: "≈≈≈" };
  if (score > 170)
    return { text: "Veel bochten", color: "text-orange-400", icon: "≈≈" };
  if (score > 90)
    return { text: "Licht kronkelig", color: "text-yellow-400", icon: "≈" };
  return { text: "Vlotte route", color: "text-emerald-400", icon: "≈" };
}

/* ---------- GPX ---------- */
export function generateGPX(
  name: string,
  waypoints: Waypoint[],
  geometry?: GeoJSON.LineString,
  turns?: TurnInstruction[]
): string {
  const escapeXml = (s: string) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const wptElements = waypoints
    .map(
      (w, i) =>
        `  <wpt lat="${w.coordinates.lat.toFixed(6)}" lon="${
          w.coordinates.lng.toFixed(6)
        }">\n    <name>${escapeXml(`${i + 1}. ${w.name}`)}</name>\n    <desc>${escapeXml(
          w.description || ""
        )}</desc>\n  </wpt>`
    )
    .join("\n");

  let trkElement = "";
  if (geometry && geometry.coordinates.length > 1) {
    const stepMax = Math.max(1, Math.ceil(geometry.coordinates.length / 2500));
    const pts: number[][] = [];
    for (let i = 0; i < geometry.coordinates.length; i += stepMax) {
      pts.push(geometry.coordinates[i]);
    }
    if (pts[pts.length - 1] !== geometry.coordinates[geometry.coordinates.length - 1]) {
      pts.push(geometry.coordinates[geometry.coordinates.length - 1]);
    }

    trkElement = `  <trk>\n    <name>${escapeXml(name)} — Route</name>\n    <trkseg>\n${pts
      .map(
        (c) =>
          `      <trkpt lat="${c[1].toFixed(6)}" lon="${c[0].toFixed(6)}"/>`
      )
      .join("\n")}\n    </trkseg>\n  </tr>`;
  }

  // routebeschrijving als <rte>: nav-apps (OsmAnd, Kurviger, TomTom, Garmin)
  // tonen deze afslagen als echte turn-by-turn-instructies
  let rteElement = "";
  if (turns && turns.length > 0) {
    rteElement = `  <rte>\n    <name>${escapeXml(name)} — Routebeschrijving</name>\n${turns
      .map(
        (t, i) =>
          `    <rtept lat="${t.location.lat.toFixed(6)}" lon="${t.location.lng.toFixed(6)}"><name>${escapeXml(
            `${i + 1}. ${t.instruction}`
          )}</name></rtept>`
      )
      .join("\n")}\n  </rte>`;
  }

  const body = [wptElements, trkElement, rteElement].filter(Boolean).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Apex Routes" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${body}
</gpx>`;
}

export function downloadGPX(
  name: string,
  waypoints: Waypoint[],
  geometry?: GeoJSON.LineString,
  turns?: TurnInstruction[]
): void {
  const gpx = generateGPX(name, waypoints, geometry, turns);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- share links ---------- */
const GMAP_TRAVELMODE: Record<VehicleType, string> = {
  car: "driving",
  motorcycle: "driving",
  bicycle: "bicycling",
  pedestrian: "walking",
};

export function getGoogleMapsUrl(
  waypoints: Coordinates[],
  navigate = true,
  vehicle: VehicleType = "car"
): string {
  if (waypoints.length < 2) return "";

  const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
  const destination = `${waypoints[waypoints.length - 1].lat},${
    waypoints[waypoints.length - 1].lng
  }`;
  const waypointsStr =
    waypoints.length > 2
      ? waypoints
          .slice(1, -1)
          .map((w) => `${w.lat},${w.lng}`)
          .join("|")
      : "";

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: GMAP_TRAVELMODE[vehicle] ?? "driving",
  });

  if (waypointsStr) {
    params.set("waypoints", waypointsStr);
  }

  if (navigate) {
    params.set("dir_action", "navigate");
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function getWazeUrl(destination: Coordinates): string {
  return `https://ul.waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
}

/* ---------- loop generator ---------- */
/**
 * Straal (km) voor een lus van N punten waarvan de rijafstand ~targetKm moet zijn.
 * De omtrek van een N-hoek is 2·N·r·sin(π/N); wegen zijn ~25% langer dan de
 * hemelsbrede lijn, dus we delen door een wegenfactor.
 */
export function estimateLoopRadiusKm(targetKm: number, points = 8): number {
  const n = Math.max(3, points);
  const roadFactor = 1.25;
  return targetKm / (2 * n * Math.sin(Math.PI / n) * roadFactor);
}

export function generateRouteSkeleton(
  center: Coordinates,
  radiusKm: number,
  points = 8
): Coordinates[] {
  const skeleton: Coordinates[] = [];
  const radiusDeg = radiusKm / 111.32;

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const wobble = Math.sin(i * 7.3) * 0.16;
    const radiusVariation = 0.82 + ((Math.cos(i * 3.7) + 1) / 2) * 0.36;
    const r = radiusDeg * radiusVariation + wobble * radiusDeg;

    skeleton.push({
      lat: center.lat + r * Math.cos(angle),
      lng:
        center.lng +
        (r * Math.sin(angle)) / Math.cos((center.lat * Math.PI) / 180),
    });
  }

  return skeleton;
}

/* ---------- GPX / GeoJSON / KML import ---------- */
export function parseGPX(text: string): Coordinates[] | null {
  let doc: Document | null = null;
  try {
    doc = new DOMParser().parseFromString(text, "application/xml");
  } catch {
    return null;
  }
  if (!doc || doc.getElementsByTagName("parsererror").length) return null;

  const pick = (tag: string) =>
    Array.from(doc!.getElementsByTagNameNS("*", tag));
  let nodes = pick("trkpt");
  if (!nodes.length) nodes = pick("rtept");
  if (!nodes.length) nodes = pick("wpt");
  if (nodes.length < 2) return null;

  const pts: Coordinates[] = [];
  for (const nd of nodes) {
    const la = parseFloat(nd.getAttribute("lat") ?? "");
    const lo = parseFloat(nd.getAttribute("lon") ?? "");
    if (!isFinite(la) || !isFinite(lo)) continue;
    pts.push({ lat: la, lng: lo });
  }
  return pts.length >= 2 ? pts : null;
}

export function parseGeoJSON(text: string): Coordinates[] | null {
  let j: unknown = null;
  try {
    j = JSON.parse(text);
  } catch {
    return null;
  }
  const lines: number[][][] = [];
  const walk = (g: unknown): void => {
    if (!g || typeof g !== "object") return;
    const o = g as Record<string, unknown>;
    if (o.type === "FeatureCollection") {
      ((o.features as unknown[]) || []).forEach((f) => walk(f));
      return;
    }
    if (o.type === "Feature") {
      walk(o.geometry);
      return;
    }
    if (o.type === "LineString") lines.push(o.coordinates as number[][]);
    else if (o.type === "MultiLineString")
      (o.coordinates as number[][][]).forEach((l) => lines.push(l));
  };
  walk(j);
  let best: number[][] = [];
  lines.forEach((l) => {
    if (Array.isArray(l) && l.length > best.length) best = l;
  });
  best = best.filter(
    (p) => Array.isArray(p) && p.length >= 2 && isFinite(p[0]) && isFinite(p[1])
  );
  return best.length >= 2
    ? best.map((p) => ({ lng: p[0], lat: p[1] }))
    : null;
}

/** Bestandstypes die geïmporteerd kunnen worden (voor <input accept> en checks). */
export { ROUTE_FILE_EXTENSIONS, isRouteFileName } from "./routefiles.ts";
export { parseFIT, looksLikeFIT } from "./fit.ts";

export function parseRouteFile(text: string): Coordinates[] | null {
  const t = String(text || "");
  if (/^[\s]*[[{]/.test(t)) {
    const g = parseGeoJSON(t);
    if (g) return g;
  }
  if (/<kml|<linestring|<coordinates/i.test(t)) {
    const k = parseKml(t);
    if (k) return k;
  }
  if (/<trainingcenterdatabase|<trackpoint/i.test(t)) {
    const x = parseTCX(t);
    if (x) return x;
  }
  return parseGPX(t);
}

/** Garmin TCX (Training Center XML): <Trackpoint><Position><LatitudeDegrees>. */
export function parseTCX(text: string): Coordinates[] | null {
  let doc: Document | null = null;
  try {
    doc = new DOMParser().parseFromString(text, "application/xml");
  } catch {
    return null;
  }
  if (!doc || doc.getElementsByTagName("parsererror").length) return null;

  const pts: Coordinates[] = [];
  const trackpoints = Array.from(doc.getElementsByTagNameNS("*", "Trackpoint"));
  for (const tp of trackpoints) {
    const la = parseFloat(
      tp.getElementsByTagNameNS("*", "LatitudeDegrees")[0]?.textContent ?? ""
    );
    const lo = parseFloat(
      tp.getElementsByTagNameNS("*", "LongitudeDegrees")[0]?.textContent ?? ""
    );
    if (Number.isFinite(la) && Number.isFinite(lo)) pts.push({ lat: la, lng: lo });
  }
  return pts.length >= 2 ? pts : null;
}

export function parseKml(text: string): Coordinates[] | null {
  let doc: Document | null = null;
  try {
    doc = new DOMParser().parseFromString(text, "application/xml");
  } catch {
    return null;
  }
  if (!doc || doc.getElementsByTagName("parsererror").length) return null;
  let best: number[][] = [];
  Array.from(doc.getElementsByTagNameNS("*", "coordinates")).forEach((cd) => {
    const trip = (cd.textContent || "").trim().split(/\s+/);
    const l = trip
      .map((t) => {
        const a = t.split(",");
        const lo = parseFloat(a[0]);
        const la = parseFloat(a[1]);
        return isFinite(lo) && isFinite(la) ? [lo, la] : null;
      })
      .filter(Boolean) as number[][];
    if (l.length > best.length) best = l;
  });
  return best.length >= 2
    ? best.map((p) => ({ lng: p[0], lat: p[1] }))
    : null;
}

/* ---------- GPX-track → echte weg (map matching) ---------- */
export interface MatchedTrack {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
  legs: OSRMRoute["legs"];
  /** true = via OSRM /match op het wegenraster gelegd; false = benadering. */
  matched: boolean;
  confidence?: number | null;
  /** true = duur of wegverloop is niet door een routing-engine bevestigd. */
  estimated?: boolean;
  /** true = de geüploade trackvorm is behouden in plaats van herberekend. */
  preserved?: boolean;
}

/** Uniform sample op afstand: behoudt start/eind en de vorm bij wisselende dichtheid. */
export function sampleByDistance(points: Coordinates[], max: number): Coordinates[] {
  if (points.length <= max) return points;
  const cum: number[] = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i]) * 1000;
    cum.push(total);
  }
  const step = total / (max - 1);
  const out: Coordinates[] = [points[0]];
  let idx = 1;
  for (let k = 1; k < max - 1; k++) {
    const target = step * k;
    while (idx < points.length - 1 && cum[idx] < target) idx++;
    out.push(points[idx]);
  }
  out.push(points[points.length - 1]);
  return out;
}

/** Houdt een geldige upload bruikbaar als een wegrouter geen betrouwbare match geeft. */
export function preserveImportedTrack(
  points: Coordinates[],
  vehicle: VehicleType = "car"
): MatchedTrack | null {
  if (points.length < 2) return null;
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    distance += haversineKm(points[i - 1], points[i]) * 1000;
  }
  const speedKmh =
    vehicle === "bicycle" ? 18 : vehicle === "pedestrian" ? 4.5 : vehicle === "motorcycle" ? 65 : 55;
  const geometryPoints = sampleByDistance(points, 2500);
  return {
    geometry: {
      type: "LineString",
      coordinates: geometryPoints.map((point) => [point.lng, point.lat] as GeoJSON.Position),
    },
    distance,
    duration: distance > 0 ? (distance / 1000 / speedKmh) * 3600 : 0,
    legs: [],
    matched: false,
    estimated: true,
    preserved: true,
  };
}

/**
 * Legt een geüploade track (GPX/KML/GeoJSON) op het echte wegenraster.
 * Auto en motor gaan eerst via OSRM /match (100 punten). Voor fiets en
 * wandelen slaan we die driving-only matcher bewust over. Daarna proberen we
 * voertuig-specifieke waypoint-routing. Geeft ook die slechts een schatting,
 * dan bewaren we liever de originele trackvorm dan hem te vervormen.
 */
export async function matchTrackToRoads(
  points: Coordinates[],
  vehicle: VehicleType = "car"
): Promise<MatchedTrack | null> {
  if (points.length < 2) return null;

  if (vehicle === "car" || vehicle === "motorcycle") {
    try {
      const sampled = sampleByDistance(points, 100);
      const pts = sampled
        .map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`)
        .join(";");
      const res = await fetch(`/api/match?points=${encodeURIComponent(pts)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.route?.geometry) {
          return {
            geometry: data.route.geometry as GeoJSON.LineString,
            distance: data.route.distance as number,
            duration: data.route.duration as number,
            legs: data.route.legs ?? [],
            matched: true,
            confidence: data.confidence ?? null,
          };
        }
      }
    } catch {
      /* val terug op voertuig-specifieke waypoint-routing */
    }
  }

  try {
    const r = await calculateRoute(sampleByDistance(points, MAX_WAYPOINTS), {
      vehicleType: vehicle,
    });
    if (!r.estimated) {
      return {
        geometry: r.geometry,
        distance: r.distance,
        duration: r.duration,
        legs: r.legs,
        matched: false,
        estimated: false,
      };
    }
  } catch {
    /* bewaar hieronder de oorspronkelijke track */
  }
  return preserveImportedTrack(points, vehicle);
}

/* ---------- optionele AI-laag (server route /api/parse) ---------- */
export async function parseWithAI(
  text: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return (j && j.ai) || null;
  } catch {
    return null;
  }
}

/**
 * Vraagt de server of de AI-laag geconfigureerd is (OPENAI_API_KEY gezet).
 * Een lege text triggert geen upstream-call — dit is een gratis probe.
 */
export async function aiLayerConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
    });
    if (!res.ok) return false;
    const j = await res.json();
    return Boolean(j && j.aiConfigured);
  } catch {
    return false;
  }
}