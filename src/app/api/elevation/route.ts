import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/server/upstream";

export const dynamic = "force-dynamic";

/**
 * Hoogteprofiel via de Open-Meteo Elevation API — gratis en zonder key.
 * De client bemonstert de routegeometrie tot maximaal 100 punten (de limiet
 * van de dienst) en krijgt hier de hoogte per punt terug.
 */
const ELEVATION_BASE = (
  process.env.ELEVATION_BASE_URL || "https://api.open-meteo.com"
).replace(/\/+$/, "");

const MAX_POINTS = 100;

interface ElevationResponse {
  elevation?: number[];
}

function isValidPoint(p: unknown): p is [number, number] {
  return (
    Array.isArray(p) &&
    p.length >= 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1]) &&
    Math.abs(p[0]) <= 180 &&
    Math.abs(p[1]) <= 90
  );
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

  const points = (body as { points?: unknown })?.points;
  if (!Array.isArray(points) || points.length < 2) {
    return NextResponse.json(
      { code: "InvalidPoints", message: "points verwacht als [[lng,lat], ...]" },
      { status: 400 }
    );
  }
  if (points.length > MAX_POINTS) {
    return NextResponse.json(
      { code: "TooManyPoints", message: `max ${MAX_POINTS} punten per aanvraag` },
      { status: 400 }
    );
  }
  if (!points.every(isValidPoint)) {
    return NextResponse.json(
      { code: "InvalidPoints", message: "elk punt moet [lng, lat] zijn" },
      { status: 400 }
    );
  }

  // afronden op 5 decimalen (≈ 1 m): scheelt URL-lengte én verhoogt cache-hits
  const lat = points.map((p) => p[1].toFixed(5)).join(",");
  const lng = points.map((p) => p[0].toFixed(5)).join(",");
  const url = `${ELEVATION_BASE}/v1/elevation?latitude=${lat}&longitude=${lng}`;

  const result = await cachedJson<ElevationResponse>(
    url,
    url,
    { cache: "no-store" },
    24 * 60 * 60 * 1000 // hoogtes veranderen niet: een dag cachen mag
  );

  if (!result.ok || !result.data || !Array.isArray(result.data.elevation)) {
    return NextResponse.json({ error: "elevation failed" }, { status: 502 });
  }
  if (result.data.elevation.length !== points.length) {
    return NextResponse.json({ error: "elevation mismatch" }, { status: 502 });
  }

  return NextResponse.json({ code: "Ok", elevation: result.data.elevation });
}
