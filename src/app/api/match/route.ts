import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/server/upstream";

export const dynamic = "force-dynamic";

/**
 * OSRM map matching: legt een vrije track (bv. uit een GPX) op het echte
 * wegenraster. Alleen gebruikt voor het driving-profiel van de publieke demo.
 */
const OSRM_BASE = (
  process.env.OSRM_BASE_URL || "https://router.project-osrm.org"
).replace(/\/+$/, "");

const MAX_POINTS = 100;
const POINTS_RE = /^-?\d{1,3}\.\d+(,-?\d{1,3}\.\d+)(;-?\d{1,3}\.\d+(,-?\d{1,3}\.\d+))*$/;

interface OSRMMatching {
  distance: number;
  duration: number;
  geometry: unknown;
  legs?: unknown;
  confidence?: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const points = searchParams.get("points") || "";

  if (!POINTS_RE.test(points)) {
    return NextResponse.json(
      { code: "InvalidPoints", message: "points verwacht als lng,lat;lng,lat" },
      { status: 400 }
    );
  }
  const n = points.split(";").length;
  if (n < 2 || n > MAX_POINTS) {
    return NextResponse.json(
      { code: "InvalidPointCount", message: `2 t/m ${MAX_POINTS} punten` },
      { status: 400 }
    );
  }

  const url = `${OSRM_BASE}/match/v1/driving/${points}?overview=full&geometries=geojson&steps=true`;
  const result = await cachedJson(url, url, { cache: "no-store" }, 10 * 60 * 1000);

  if (!result.ok || !result.data) {
    return NextResponse.json({ error: "match failed" }, { status: 502 });
  }

  const data = result.data as {
    code?: string;
    matchings?: OSRMMatching[];
  };

  if (data.code !== "Ok" || !Array.isArray(data.matchings) || data.matchings.length === 0) {
    return NextResponse.json({ code: "NoMatch" }, { status: 422 });
  }

  // bij meerdere stukken: het langste deel is de route
  const best = data.matchings.reduce((a, b) => (b.distance > a.distance ? b : a));

  return NextResponse.json({
    code: "Ok",
    confidence: best.confidence ?? null,
    route: {
      distance: best.distance,
      duration: best.duration,
      geometry: best.geometry,
      legs: best.legs ?? [],
    },
  });
}
