"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Flag, Medal, Library, Globe, Wind, Wrench, Motorbike } from "lucide-react";
import { computeGarageStats, BADGES, vehicleLabel } from "@/lib/garage";
import type { StoredRoute } from "@/lib/storage";
import { formatDistance } from "@/lib/routing";

/**
 * De Garage — je ritgeschiedenis als spel: statistieken en badges over alle
 * opgeslagen routes. Alles lokaal, niets verlaat de browser.
 */
/** Badge-beeld in het thema: lucide i.p.v. emoji's. */
const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "eerste-rit": Flag,
  honderd: Medal,
  kilometervreter: Trophy,
  verzamelaar: Library,
  grensganger: Globe,
  kronkelaar: Wind,
  allroad: Wrench,
};

export default function GaragePanel({
  open,
  onClose,
  routes,
  onGoPro,
}: {
  open: boolean;
  onClose: () => void;
  routes: StoredRoute[];
  onGoPro?: () => void;
}) {
  const stats = computeGarageStats(routes);
  const unlocked = new Set(
    BADGES.filter((b) => b.progress(stats) >= b.goal).map((b) => b.id)
  );

  const statCells: [string, string][] = [
    ["Routes", String(stats.routes)],
    ["Totaal", `${stats.totalKm.toLocaleString("nl-NL")} km`],
    ["Langste rit", stats.longestKm ? formatDistance(stats.longestKm * 1000) : "—"],
    ["Beste kronkel", stats.bestWinding ? `${stats.bestWinding}/100` : "—"],
    ["Regio's", String(stats.corridors)],
    ["Vervoer", String(stats.vehicles)],
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Garage"
            className="glass w-full max-w-xl rounded border border-white/10 p-6 sm:p-8 max-h-[88dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-yellow-400 text-black flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">De Garage</h2>
                  <p className="text-[13px] text-slate-400">
                    Jouw ritgeschiedenis als scoreboard.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {routes.length === 0 ? (
              <div className="text-center py-10">
                <Motorbike className="w-12 h-12 mb-3 text-yellow-400" aria-hidden />
                <p className="font-display font-bold text-lg">Nog leeg hier</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Bewaar je eerste route (kop *Bewaar* bij Mijn routes) en je garage
                  vult zich vanzelf — met kilometers, regio&apos;s en badges.
                </p>
              </div>
            ) : (
              <>
                {/* statistieken */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                  {statCells.map(([label, value]) => (
                    <div
                      key={label}
                      className="glass rounded border border-white/10 p-3 text-center"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="font-display font-bold text-[17px] mt-0.5 truncate">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* recenter gereden vervoer + regio's */}
                {(stats.corridorLabels.length > 0 || stats.vehicles > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {stats.corridorLabels.map((c) => (
                      <span
                        key={c}
                        className="glass rounded px-3 py-1 text-[12px] border border-white/10 text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                    {routes.length > 0 &&
                      [...new Set(routes.map((r) => r.vehicle))].map((v) => (
                        <span
                          key={v}
                          className="glass rounded px-3 py-1 text-[12px] border border-white/10 text-slate-300"
                        >
                          {vehicleLabel(v)}
                        </span>
                      ))}
                  </div>
                )}

                {/* badges */}
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">
                  Badges · {unlocked.size}/{BADGES.length}
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {BADGES.map((b) => {
                    const value = Math.min(b.progress(stats), b.goal);
                    const done = unlocked.has(b.id);
                    const pct = Math.min(100, Math.round((value / b.goal) * 100));
                    return (
                      <div
                        key={b.id}
                        className={`glass rounded border p-3.5 flex items-center gap-3 transition-colors ${
                          done ? "border-yellow-400/40" : "border-white/10"
                        }`}
                      >
                        <span
                          className={`w-10 h-10 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0 ${done ? "" : "opacity-30"}`}
                          aria-hidden
                        >
                          {(() => {
                            const Icon = BADGE_ICONS[b.id] ?? Trophy;
                            return <Icon className={`w-5 h-5 ${done ? "text-yellow-300" : "text-slate-400"}`} />;
                          })()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-[14px] font-semibold truncate ${done ? "text-yellow-300" : "text-slate-300"}`}>
                              {b.name}
                            </p>
                            <span className="text-[11px] text-slate-500 shrink-0">
                              {done ? "✓ behaald" : `${value}/${b.goal}`}
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 truncate">
                            {b.description}
                          </p>
                          <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className={`h-full rounded-full ${done ? "bg-yellow-400" : "bg-yellow-400/50"}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-600 mt-5 text-center">
                  Meer rijden = meer badges. Routes blijven lokaal in deze browser.
                </p>
              </>
            )}

            {onGoPro && (
              <button
                onClick={onGoPro}
                className="btn-ghost w-full mt-4 px-4 py-2.5 rounded text-sm"
              >
                ✦ Bekijk Apex Pro
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
