import { NextRequest, NextResponse } from "next/server";
import { nominatimJson } from "@/lib/server/upstream";

export const dynamic = "force-dynamic";

const NOMINATIM_BASE =
  process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

const UA = "ApexRoutes/1.0 (https://routes.apexclusive.nl)";
const TTL = 24 * 60 * 60 * 1000; // 24 u — adressen veranderen zelden

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 200);
  if (!q) {
    return NextResponse.json({ error: "q required" }, { status: 400 });
  }

  const headers = { "User-Agent": UA, "Accept-Language": "nl" };
  const base = `${NOMINATIM_BASE}/search?format=jsonv2&limit=3&accept-language=nl`;

  // 1) zoek eerst in de Lage Landen + buurlanden, 2) daarna wereldwijd
  const regional = await nominatimJson<unknown[]>(
    `${base}&countrycodes=nl,be,de,lu,fr&q=${encodeURIComponent(q)}`,
    headers,
    TTL
  );
  if (regional.ok && Array.isArray(regional.data) && regional.data.length > 0) {
    return NextResponse.json(regional.data);
  }

  const world = await nominatimJson<unknown[]>(
    `${base}&q=${encodeURIComponent(q)}`,
    headers,
    TTL
  );
  if (world.ok && Array.isArray(world.data)) {
    return NextResponse.json(world.data);
  }

  return NextResponse.json(
    { error: "geocode failed" },
    { status: 502 }
  );
}
