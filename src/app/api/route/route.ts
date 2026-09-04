import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/server/upstream";
import { orsToRoute, ORS_PROFILES, type ORSResponse } from "@/lib/ors";

export const dynamic = "force-dynamic";

const OSRM_BASE = (
  process.env.OSRM_BASE_URL || "https://router.project-osrm.org"
).replace(/\/+$/, "");

// api.openrouteservice.org is sinds april 2026 vervangen door api.heigit.org
// (zelfde dienst, andere host) en heeft daar inmiddels een lagere quota.
const ORS_BASE = (
  process.env.ORS_BASE_URL || "https://api.heigit.org/openrouteservice"
).replace(/\/+$/, "");

const ALLOWED_PROFILES = new Set(["driving", "bike", "foot", "car"]);
const ALLOWED_EXCLUDES = new Set(["highways", "toll", "ferries"]);
const MAX_WAYPOINTS = 25;

const COORDS_RE = /^-?\d{1,3}\.\d+(,-?\d{1,3}\.\d+)(;-?\d{1,3}\.\d+,-?\d{1,3}\.\d+)*$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profile = searchParams.get("profile") || "driving";
  const coords = searchParams.get("coords") || "";
  const exclude = searchParams.get("exclude");

  if (!ALLOWED_PROFILES.has(profile)) {
    return NextResponse.json({ code: "InvalidProfile", message: "profile niet toegestaan" }, { status: 400 });
  }
  if (!COORDS_RE.test(coords)) {
    return NextResponse.json({ code: "InvalidCoords", message: "coords verwacht als lng,lat;lng,lat" }, { status: 400 });
  }
  if (coords.split(";").length > MAX_WAYPOINTS) {
    return NextResponse.json({ code: "TooManyWaypoints", message: `max ${MAX_WAYPOINTS} punten` }, { status: 400 });
  }

  const usingPublicDemo = !process.env.OSRM_BASE_URL;

  // Fiets en wandelen via OpenRouteService, mits er een key is. ORS kent wél
  // echte fiets-/wandelprofielen; het antwoord wordt naar het OSRM-formaat
  // omgezet zodat de rest van de app niets merkt.
  const orsProfile = ORS_PROFILES[profile];
  if (orsProfile && process.env.ORS_API_KEY) {
    const coordinates = coords
      .split(";")
      .map((pair) => pair.split(",").map(Number) as [number, number]);

    const url = `${ORS_BASE}/v2/directions/${orsProfile}/geojson`;
    const result = await cachedJson<ORSResponse>(
      `ors:${orsProfile}:${coords}`,
      url,
      {
        method: "POST",
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/geo+json",
        },
        body: JSON.stringify({ coordinates, instructions: true }),
        cache: "no-store",
      },
      10 * 60 * 1000
    );

    const converted = result.ok ? orsToRoute(result.data) : null;
    if (converted) {
      return NextResponse.json({ code: "Ok", routes: [converted] });
    }
    // ORS onbereikbaar of over de quota → zelfde signaal als hieronder, zodat
    // de client netjes op de offline-schatting terugvalt
    return NextResponse.json(
      { code: "ProfileUnavailable", message: "fiets/wandel-routing niet beschikbaar" },
      { status: 501 }
    );
  }

  // De publieke OSRM-demo draait alléén het driving-profiel; bike/foot vangen
  // we hier af zodat de client netjes op de offline-schatting terugvalt.
  if (usingPublicDemo && profile !== "driving") {
    return NextResponse.json(
      { code: "ProfileUnavailable", message: "publieke demo ondersteunt alleen driving" },
      { status: 501 }
    );
  }

  let url = `${OSRM_BASE}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`;
  if (exclude && ALLOWED_EXCLUDES.has(exclude)) {
    url += `&exclude=${exclude}`;
  }

  const result = await cachedJson(url, url, { cache: "no-store" }, 10 * 60 * 1000);
  if (result.ok && result.data) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json({ error: "route failed" }, { status: 502 });
}
