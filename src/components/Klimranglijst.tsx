"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mountain, Trophy, Road, Route as RouteIcon } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import { CLIMBS, type EventCountry } from "@/lib/climbs";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";
import { klimtijdMinuten, rankClimbs, zwaarteKlasse, type ZwaarteKlasse } from "@/lib/climbscore";

const LANDEN: { id: EventCountry | "alle"; label: string }[] = [
  { id: "alle", label: "Heel Europa" },
  { id: "NL", label: "Nederland" },
  { id: "BE", label: "België" },
  { id: "DE", label: "Duitsland" },
  { id: "FR", label: "Frankrijk" },
  { id: "IT", label: "Italië" },
  { id: "CH", label: "Zwitserland" },
  { id: "AT", label: "Oostenrijk" },
];

const KLASSE_KLEUR: Record<ZwaarteKlasse, string> = {
  instap: "zwaarte zwaarte-instap",
  pittig: "zwaarte zwaarte-pittig",
  zwaar: "zwaarte zwaarte-zwaar",
  loodzwaar: "zwaarte zwaarte-loodzwaar",
  buitencategorie: "zwaarte zwaarte-buitencategorie",
};

export default function Klimranglijst() {
  const [land, setLand] = useState<EventCountry | "alle">("alle");

  const alles = rankClimbs(CLIMBS);
  const rijen = alles.filter((r) => land === "alle" || r.climb.country === land);
  const topScore = alles[0].score;

  const planRit = (prompt: string) => {
    setPendingPrompt(prompt);
    window.location.assign(plannerUrl(prompt));
  };

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[#ffe600]/[0.10] top-[-180px] left-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">Klimranglijst</span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/klimmen" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Klimbibliotheek
          </Link>
          <ThemeSwitch />
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block">
            Naar de planner
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-4 sm:px-6 pt-12 pb-6 max-w-6xl mx-auto">
        <p className="eyebrow">GERANGSCHIKT OP DE FIETS-INDEX</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          De zwaarste beklimmingen
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl mb-8">
          Alle {CLIMBS.length} klimmen uit de bibliotheek, objectief gerangschikt
          met de FIETS-index: hoogtemeters wegen kwadratisch tegen de lengte, met
          een correctie voor de ijle lucht boven 1000 meter. Zo weet je precies
          hoe de Keutenberg zich verhoudt tot het Timmelsjoch.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {LANDEN.map((l) => {
            const aantal = alles.filter((r) => l.id === "alle" || r.climb.country === l.id).length;
            if (aantal === 0) return null;
            return (
              <button
                key={l.id}
                onClick={() => setLand(l.id)}
                aria-pressed={land === l.id}
                className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                  land === l.id ? "bg-white/15 text-white" : "text-slate-500 hover:bg-white/10"
                }`}
              >
                {l.label}
                <span className="ml-1.5 font-mono text-[11px] opacity-60">{aantal}</span>
              </button>
            );
          })}
        </div>
      </section>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pb-24 max-w-6xl mx-auto">
        <div className="glass rounded border border-white/10 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[3.5rem_1fr_5rem_5rem_5rem_6rem] gap-3 px-4 py-3 border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
            <span>Rang</span>
            <span>Beklimming</span>
            <span className="text-right">Lengte</span>
            <span className="text-right">Gem.</span>
            <span className="text-right">Hm</span>
            <span className="text-right">FIETS</span>
          </div>

          {rijen.map((r, i) => {
            const c = r.climb;
            const klasse = zwaarteKlasse(r.score).klasse;
            const tijd = klimtijdMinuten(c);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.012, 0.2) }}
                className="relative border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-yellow-400/[0.06] pointer-events-none"
                  style={{ width: `${Math.max(2, (r.score / topScore) * 100)}%` }}
                  aria-hidden
                />
                <div className="relative grid sm:grid-cols-[3.5rem_1fr_5rem_5rem_5rem_6rem] gap-x-3 gap-y-1 px-4 py-3.5 items-center">
                  <span className="font-mono font-bold text-[15px] text-slate-500">
                    {r.rang <= 3 ? (
                      <span className="text-yellow-300 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" aria-hidden />
                        {r.rang}
                      </span>
                    ) : (
                      r.rang
                    )}
                  </span>

                  <div className="min-w-0">
                    <Link
                      href={`/klimmen/${c.id}`}
                      className="font-display font-bold text-[15px] hover:text-yellow-300 transition-colors"
                    >
                      {c.name}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>
                        {c.place} · {c.country} · top {c.summitM} m
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${KLASSE_KLEUR[klasse]}`}
                      >
                        {klasse}
                      </span>
                      {c.surface !== "asfalt" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border border-white/15 text-slate-400">
                          {c.surface}
                        </span>
                      )}
                      <span className="text-slate-600">
                        klimtijd ± {tijd.recreant >= 60 ? `${Math.floor(tijd.recreant / 60)}u${String(tijd.recreant % 60).padStart(2, "0")}` : `${tijd.recreant} min`}
                      </span>
                    </p>
                  </div>

                  <span className="font-mono text-[13px] text-slate-300 sm:text-right">
                    <span className="sm:hidden text-slate-500 text-[10px] uppercase mr-1">lengte </span>
                    {c.lengthM >= 1000
                      ? `${(c.lengthM / 1000).toFixed(1).replace(".", ",")} km`
                      : `${c.lengthM} m`}
                  </span>
                  <span className="font-mono text-[13px] text-slate-300 sm:text-right">
                    <span className="sm:hidden text-slate-500 text-[10px] uppercase mr-1">gem </span>
                    {String(c.avgPct).replace(".", ",")}%
                  </span>
                  <span className="font-mono text-[13px] text-slate-300 sm:text-right">
                    <span className="sm:hidden text-slate-500 text-[10px] uppercase mr-1">hm </span>
                    {c.elevationM}
                  </span>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="font-mono font-bold text-[16px] text-yellow-300">
                      {String(r.score).replace(".", ",")}
                    </span>
                    <button
                      onClick={() => planRit(c.prompt)}
                      data-track="Planner gestart"
                      data-track-source="klimranglijst"
                      aria-label={`Plan een rit over de ${c.name}`}
                      className="p-2 rounded text-yellow-300 border border-yellow-400/25 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors"
                      title={`Plan een rit over de ${c.name}`}
                    >
                      <RouteIcon className="w-3.5 h-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="glass rounded border border-white/10 p-5 mt-6">
          <h2 className="font-display font-bold text-[15px] mb-2 flex items-center gap-2">
            <Mountain className="w-4 h-4 text-yellow-400" aria-hidden />
            Hoe de FIETS-index werkt
          </h2>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            De index is bedacht door het Nederlandse tijdschrift Fiets en wordt
            internationaal gebruikt om beklimmingen te vergelijken. De formule is{" "}
            <span className="font-mono text-slate-300">H² / (D × 10)</span>, waarbij
            H de hoogtemeters zijn en D de lengte in meters, plus{" "}
            <span className="font-mono text-slate-300">(T − 1000) / 1000</span> als
            de top boven de 1000 meter ligt. Apex telt daar een eigen toeslag bij op
            voor kasseien en keien, omdat die op de Vlaamse hellingen echt het
            verschil maken. Ter ijking: de Mont Ventoux komt uit rond de 12,8 en de
            Cauberg op 0,4.
          </p>
        </div>

        <footer className="pt-8">
          <div className="h-px bg-white/10 mb-5" />
          <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Road className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
            Cijfers zijn indicatief en afgerond (bronnen: climbfinder, wielerflits,
            fiets.nl en organisatiedata) — hoogtes en percentages verschillen per
            bron en meetmethode. De ranglijst is bedoeld om klimmen onderling te
            vergelijken, niet als officiële uitslag.
          </p>
        </footer>
      </main>
    </div>
  );
}
