import type { VehicleType } from "@/types";

export interface ParsedIntent {
  vehicle: VehicleType | null;
  startLocation: string | null;
  endLocation: string | null;
  roundTrip: boolean;
  distance: number | null;
  duration: number | null;
  style: "scenic" | "direct" | "mixed";
  scenic: boolean;
  corridor: string | null;
}

/** Letters (incl. accenten), spaties, koppeltekens en apostrofs — voor plaatsnamen. */
const PLACE = "[\\p{L}\\p{M}'''\\- ]";

const VEHICLE_PATTERNS: [VehicleType, RegExp][] = [
  // volgorde = specificiteit: eerst fiets/wandelen, dan motor, dan auto
  ["bicycle", /fiets|e-?bike|bicycle|racefiets|mtb|_grit_|gravel/i],
  ["pedestrian", /wandel|walk|lopen|te voet|hike|hielen/i],
  ["motorcycle", /motor(r|rijden|fiets)?|motorcycle|biker|moto\b|motortocht|motoren/i],
  ["car", /auto|wagen|car\b|cabri(o|olet)|roadster|suv/i],
];

const CORRIDOR_PATTERNS: [string, RegExp][] = [
  [
    "mergellandroute",
    /mergelland|mergel|sint.geertruid|slenaken|gulpen|maastricht|zuid.limburg|valkenburg/i,
  ],
  [
    "zwarte-woud",
    /zwarte woud|schwarzwald|black forest|baden.baden|freudenstadt|mummelsee/i,
  ],
  ["eifel", /eifel|rursee|monschau|nideggen/i],
  [
    "ardennen",
    /ardennen|ardenne|durbuy|la roche|houffalize|bastenaken|bastogne|belgi(ë|e)/i,
  ],
  [
    "vogezen",
    /vogezen|vosges|route des cr(ê|e)tes|grand ballon|markstein|schlucht|g(é|e)rardmer|munster/i,
  ],
  [
    "sauerland",
    /sauerland|winterberg|willingen|schmallenberg|meschede|attendorn|biggesee/i,
  ],
  [
    "mullerthal",
    /m(ü|u)llerthal|mullerthal|klein zwitserland|petite suisse|echternach|berdorf|larochette|luxemburg|luxembourg/i,
  ],
  ["veluwe", /veluwe|apeldoorn|kröller|otterlo|arnhem/i],
  ["zeeland", /zeeland|vlissingen|middelburg|domburg|westkapelle/i],
  ["alpen", /alpen|alps|frankrijk|france|chamonix|col de/i],
];

const DISTANCE_PATTERNS: { pattern: RegExp; extract: (m: RegExpMatchArray) => number }[] =
  [
    {
      // expliciete km wint altijd: "100 km", "52,5 km", "100km"
      pattern: /(\d+(?:[.,]\d+)?)\s*(?:km|kilometer)/i,
      extract: (m) => Math.round(parseFloat(m[1].replace(",", "."))),
    },
    {
      // "2 uur", "1,5 uur" → ~80 km/u bij auto/motor
      pattern: /(\d+(?:[.,]\d+)?)\s*uur(?!\w)/i,
      extract: (m) => Math.round(parseFloat(m[1].replace(",", ".")) * 80),
    },
    {
      // "90 minuten" → 1,5 uur
      pattern: /(\d+)\s*min(?:uten)?\b/i,
      extract: (m) => Math.max(2, Math.round((parseInt(m[1], 10) / 60) * 80)),
    },
    { pattern: /halve dag/i, extract: () => 160 },
    { pattern: /hele dag|dagtocht/i, extract: () => 320 },
    { pattern: /anderhalf uur/i, extract: () => 120 },
  ];

const SCENIC_PATTERNS =
  /kronkel|bocht(ig)?|scenic|slinger|kurve|curvy|bochtig|mooi\s*(weg|route|rit)|leuke weg/i;
const ROUNDTRIP_PATTERNS = /rond(rit|je|tocht)?\b|return|tour\b|lus\b|lusje/i;
const DIRECT_PATTERNS = /direct|snel(st|e)?\b|efficiënt|zonder.*stop/i;

/** Woorden waarop een plaatsnaam-capture afgebroken moet worden. */
const PLACE_STOP_WORDS =
  "naar|via|met|voor|van|vanuit|tot|in|op|bij|over|onder|rond|rondrit|rondje|tocht|route|trip|rit|km|uur|min|ca|circa";

const FROM_PATTERN = new RegExp(
  `(?:\\bvan(?:af)?|\\bvertrek(?:punt)?|\\bstart(?:punt)?|\\bbegin)` +
    `(?:\\s+(?:in|bij|uit))?\\s+` +
    `(${PLACE}{2,48}?)` +
    `(?=\\s+(?:${PLACE_STOP_WORDS}|\\d)|\\s*[,;!?.]|$)`,
  "iu"
);

const TO_PATTERN = new RegExp(
  `(?:\\bnaar|\\btot in|\\brichting)\\s+` +
    `(?:de |het |een )?` +
    `(${PLACE}{2,48}?)` +
    `(?=\\s+(?:${PLACE_STOP_WORDS}|\\d)|\\s*[,;!?.]|$)`,
  "iu"
);

// "Auto rit Amsterdam naar Rotterdam" — startpunt staat direct vóór "naar",
// mogelijk voorafgegaan door voertuig/tocht-woorden die we er af strippen.
const IMPLICIT_FROM_PATTERN = new RegExp(
  `(${PLACE}{3,48}?)(?=\\s+naar\\b)`,
  "iu"
);

const LEADING_NOISE =
  /^(?:auto|motor|motorrijden|motortocht|motorroute|motorrit|fiets|fietsroute|fietsrit|gravel|wandel|wandelen|wandeling|wandeltocht|rit|ritten|tocht|tochten|route|trip|rondrit|rondje|mooie|mooi|mooiste|leuke|leukste|korte|korte|lange|langste|snelle|snelste|sportieve|kronkelige|kronkelend|kronkel|bochtige|scenic|curvy|dag|dagtocht|uur|half|halve|hele|min|km|de|het|een|mijn|vanaf|start|begin|graag|even)\b/i;

function stripLeadingNoise(raw: string): string | null {
  let p = raw.trim().replace(/\s+/g, " ");
  let changed = true;
  while (changed && p.includes(" ")) {
    changed = false;
    const m = p.match(LEADING_NOISE);
    if (m) {
      p = p.slice(m[0].length).trim();
      changed = true;
    }
  }
  return p || null;
}

/** Woorden die wel op een plaats lijken, maar het nooit zijn. */
const NOT_A_PLACE =
  /^(?:uur|minuten|min|km|kilometer|dag|halve|hele|rit|tocht|route|trip|rondrit|rondje|auto|motor|motortocht|fiets|fietsroute|wandel|wandelen|wandeling|start|begin|mooie|mooi|leuke|kronkel|kronkelende|scenic|snel|direct|ca|circa|van|naar|via)$/i;

function cleanPlace(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let p = raw.trim().replace(/\s+/g, " ");
  if (NOT_A_PLACE.test(p)) return null;
  if (/\d/.test(p)) return null;
  if (p.length < 2 || p.length > 48) return null;
  return p;
}

export function parseUserInput(text: string): ParsedIntent {
  const lower = text.toLowerCase();

  let vehicle: ParsedIntent["vehicle"] = null;
  for (const [type, pattern] of VEHICLE_PATTERNS) {
    if (pattern.test(lower)) {
      vehicle = type;
      break;
    }
  }

  const scenic = SCENIC_PATTERNS.test(lower);
  const roundTrip = ROUNDTRIP_PATTERNS.test(lower);
  const style: ParsedIntent["style"] = DIRECT_PATTERNS.test(lower)
    ? "direct"
    : scenic
      ? "scenic"
      : "mixed";

  let corridor: string | null = null;
  for (const [name, pattern] of CORRIDOR_PATTERNS) {
    if (pattern.test(lower)) {
      corridor = name;
      break;
    }
  }

  let distance: number | null = null;
  for (const { pattern, extract } of DISTANCE_PATTERNS) {
    const match = lower.match(pattern);
    if (match) {
      distance = extract(match);
      break;
    }
  }
  if (distance !== null) distance = Math.min(2000, Math.max(2, distance));

  const explicitFrom = text.match(FROM_PATTERN);
  const implicitFrom = explicitFrom ? null : text.match(IMPLICIT_FROM_PATTERN);
  const startLocation = cleanPlace(
    explicitFrom?.[1] ?? (implicitFrom ? stripLeadingNoise(implicitFrom[1]) : null)
  );

  const toMatch = text.match(TO_PATTERN);
  let endLocation = cleanPlace(toMatch?.[1]);
  if (endLocation && startLocation && endLocation.toLowerCase() === startLocation.toLowerCase()) {
    endLocation = null;
  }

  return {
    vehicle,
    startLocation,
    endLocation,
    roundTrip,
    distance,
    duration: null,
    style,
    scenic,
    corridor,
  };
}

const VEHICLE_NAMES: Record<VehicleType, string> = {
  car: "Auto",
  motorcycle: "Motor",
  bicycle: "Fiets",
  pedestrian: "Wandelen",
};

const CORRIDOR_NAMES: Record<string, string> = {
  "mergellandroute": "Mergellandroute (Zuid-Limburg)",
  "zwarte-woud": "Zwarte Woud",
  eifel: "Eifel",
  ardennen: "Ardennen",
  vogezen: "Vogezen (Route des Crêtes)",
  sauerland: "Sauerland",
  mullerthal: "Müllerthal (Luxemburg)",
  veluwe: "Veluwe",
  zeeland: "Zeeland",
  alpen: "Franse Alpen",
};

export function corridorDisplayName(corridor: string): string {
  return CORRIDOR_NAMES[corridor] || corridor;
}

export function vehicleDisplayName(vehicle: VehicleType): string {
  return VEHICLE_NAMES[vehicle] || vehicle;
}

export function generateBotResponse(intent: ParsedIntent): string {
  const parts: string[] = [];

  if (intent.vehicle)
    parts.push(`**${vehicleDisplayName(intent.vehicle)}**`);
  if (intent.corridor) parts.push(`**${corridorDisplayName(intent.corridor)}**`);
  if (intent.distance) parts.push(`**${intent.distance} km**`);
  if (intent.roundTrip) parts.push("**Rondrit**");
  if (intent.scenic) parts.push("**Scenic**");
  else if (intent.style === "direct") parts.push("**Direct**");

  if (parts.length > 0) return `Ik begrijp: ${parts.join(" · ")}\n\n`;
  return "";
}
