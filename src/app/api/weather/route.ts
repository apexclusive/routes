import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/server/upstream";

export const dynamic = "force-dynamic";

/**
 * Weer op de startplek via Open-Meteo — gratis, keyless. Alleen huidige
 * temperatuur + neerslag van de komende uren: genoeg voor een blikvoorbeeld
 * in de samenvatting, geen volledige weerdienst.
 */
const WEATHER_BASE = (
  process.env.WEATHER_BASE_URL || "https://api.open-meteo.com"
).replace(/\/+$/, "");

interface WeatherResponse {
  current?: { temperature_2m?: number; precipitation?: number; weather_code?: number };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number.parseFloat(searchParams.get("lat") || "");
  const lng = Number.parseFloat(searchParams.get("lng") || "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json(
      { code: "InvalidCoords", message: "geldige lat/lng vereist" },
      { status: 400 }
    );
  }

  const url =
    `${WEATHER_BASE}/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
    `&current=temperature_2m,precipitation,weather_code`;
  const result = await cachedJson<WeatherResponse>(url, url, { cache: "no-store" }, 15 * 60 * 1000);

  if (!result.ok || !result.data?.current) {
    return NextResponse.json({ error: "weather failed" }, { status: 502 });
  }
  return NextResponse.json({ code: "Ok", current: result.data.current });
}
