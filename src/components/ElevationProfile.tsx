"use client";

import { Mountain } from "lucide-react";
import { buildProfilePath, type ElevationProfile as Profile } from "@/lib/elevation";

const WIDTH = 300;
const HEIGHT = 64;

function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(0)} km`;
}

/**
 * Compact hoogteprofiel onder de route-samenvatting: gevuld vlak met de
 * hoogtelijn erbovenop, plus klim- en daalmeters.
 */
export default function ElevationProfile({
  profile,
  loading = false,
}: {
  profile: Profile | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-3 bg-white/5 rounded p-3">
        <div className="h-3 w-24 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-16 w-full bg-white/[0.07] rounded animate-pulse" />
      </div>
    );
  }

  if (!profile || profile.points.length < 2) return null;

  const { line, area } = buildProfilePath(profile, WIDTH, HEIGHT);
  const total = profile.points[profile.points.length - 1].distance;

  return (
    <div className="mt-3 bg-white/5 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
          <Mountain className="w-3.5 h-3.5 text-yellow-400" />
          Hoogteprofiel
        </span>
        <span className="text-[12px] font-semibold text-white">
          <span className="text-emerald-400">↑ {profile.ascent} m</span>
          {"  "}
          <span className="text-slate-400">↓ {profile.descent} m</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-16 overflow-visible"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Hoogteprofiel: ${profile.ascent} meter klimmen, ${profile.descent} meter dalen, tussen ${profile.min} en ${profile.max} meter hoogte`}
      >
        <defs>
          <linearGradient id="apex-elev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#apex-elev)" />
        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
        <span>0 km</span>
        <span>
          {profile.min} – {profile.max} m NAP
        </span>
        <span>{formatKm(total)}</span>
      </div>
    </div>
  );
}
