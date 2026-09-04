import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/server/upstream";
import { buildOverpassQuery, type PoiKind } from "@/lib/pois";

export const dynamic = "force-dynamic";

/**
 * POI's (tankstation/laadpaal/eetgelegenheid) via Overpass — open data, geen
 * key nodig. De client stuurt een bbox + soorten; het corridor-filter op
 * afstand-tot-de-route doet de client zelf (die heeft de geometrie).
 */
const OVERPASS_BASE = (
  process.env.OVERPASS_BASE_URL || "https://overpass-api.de"
).replace(/\/+$/, "");

const ALLOWED_KINDS = new Set<PoiKind>(["fuel", "charging", "food", "viewpoint"]);

interface Bbox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: "InvalidBody", message: "JSON-body verwacht" },
      { status: 400 }
    );
  }

  const { bbox, kinds } = (body ?? {}) as { bbox?: Bbox; kinds?: unknown };
  if (
    !bbox ||
    !Number.isFinite(bbox.south) ||
    !Number.isFinite(bbox.west) ||
    !Number.isFinite(bbox.north) ||
    !Number.isFinite(bbox.east) ||
    bbox.south >= bbox.north ||
    bbox.west >= bbox.east ||
    Math.abs(bbox.south) > 90 ||
    Math.abs(bbox.north) > 90 ||
    Math.abs(bbox.west) > 180 ||
    Math.abs(bbox.east) > 180
  ) {
    return NextResponse.json(
      { code: "InvalidBbox", message: "bbox verwacht als {south,west,north,east}" },
      { status: 400 }
    );
  }

  // gigantische bbox's weren (pan-Europa-query's slopen de publieke instantie)
  const MAX_SPAN = 3; // ~3 graden ≈ 330 km
  if (
    bbox.north - bbox.south > MAX_SPAN ||
    bbox.east - bbox.west > MAX_SPAN
  ) {
    return NextResponse.json(
      { code: "BboxTooLarge", message: "bbox te groot (max ~3° per richting)" },
      { status: 400 }
    );
  }

  const wanted = Array.isArray(kinds)
    ? kinds.filter((k): k is PoiKind => typeof k === "string" && ALLOWED_KINDS.has(k as PoiKind))
    : [];
  if (wanted.length === 0) {
    return NextResponse.json(
      { code: "InvalidKinds", message: "kinds verwacht als [fuel|charging|food|viewpoint]" },
      { status: 400 }
    );
  }

  const query = buildOverpassQuery(bbox, wanted);
  // cache op afronding van de bbox: herhaalde views van dezelfde route slaan aan
  const key = `overpass:${query}`;
  const result = await cachedJson<{ elements?: unknown[] }>(
    key,
    `${OVERPASS_BASE}/api/interpreter`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
    },
    60 * 60 * 1000, // tankstations verhuizen zelden: 1 uur
    20000 // Overpass kan traag zijn; na 20 s geven we op
  );

  if (!result.ok || !result.data) {
    return NextResponse.json({ error: "overpass failed" }, { status: 502 });
  }
  return NextResponse.json({ code: "Ok", elements: result.data.elements ?? [] });
}
