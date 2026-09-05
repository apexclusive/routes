import { NextRequest, NextResponse } from "next/server";
import { nominatimJson } from "@/lib/server/upstream";

export const dynamic = "force-dynamic";

const NOMINATIM_BASE =
  process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

const UA = "ApexRoutes/1.0 (https://routes.apexclusive.nl)";
const TTL = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number.parseFloat(searchParams.get("lat") || "");
  const lng = Number.parseFloat(searchParams.get("lng") || "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "valid lat/lng required" }, { status: 400 });
  }

  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&accept-language=nl&lat=${lat}&lon=${lng}`;
  const result = await nominatimJson<unknown>(url, {
    "User-Agent": UA,
    "Accept-Language": "nl",
  }, TTL);

  if (result.ok) return NextResponse.json(result.data);
  return NextResponse.json({ error: "reverse failed" }, { status: 502 });
}
