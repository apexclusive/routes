"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Mountain, CalendarDays, Route as RouteIcon, Wallet } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import {
  TOURS,
  tourKm,
  tourKlimmen,
  tourRijmin,
  toursOpZwaarte,
  type EventCountry,
  type Voertuig,
} from "@/lib/tours";
import { bookingSearchUrl } from "@/lib/monetize";

const LANDEN: { id: EventCountry | "alle"; label: string }[] = [
  { id: "alle", label: "Alles" },
  { id: "NL", label: "Nederland" },
  { id: "BE", label: "België" },
  { id: "IT", label: "Italië" },
  { id: "CH", label: "Zwitserland" },
  { id: "AT", label: "Oostenrijk" },
];

const VOERTUIGEN: { id: Voertuig | "alle"; label: string }[] = [
  { id: "alle", label: "Elk voertuig" },
  { id: "motor", label: "Motor" },
  { id: "auto", label: "Auto" },
  { id: "fiets", label: "Fiets" },
];

function uren(min: number): string {
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${u} u ${m} m` : `${u} uur`;
}

export default function Tours() {
  const [land, setLand] = useState<EventCountry | "alle">("alle");
  const [voertuig, setVoertuig] = useState<Voertuig | "alle">("alle");

  const zichtbaar = toursOpZwaarte(TOURS).filter(
    (t) =>
      (land === "alle" || t.country === land) &&
      (voertuig === "alle" || t.voertuigen.includes(voertuig))
  );

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[var(--accent)]/[0.10] top-[-180px] left-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">Meerdaagse tours</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <SiteMenu />
          <Link href="/ritten" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Dagritten
          </Link>
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block">
            Naar de planner
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-4 sm:px-6 pt-12 pb-6 max-w-6xl mx-auto">
        <p className="eyebrow">ÉÉN HOTEL, ELKE DAG EEN ANDERE PAS</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          Meerdaagse tours vanuit één basiskamp
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl mb-4">
          Een georganiseerde alpentour kost al gauw €1.500 tot €4.650 per persoon.
          Hetzelfde rijplezier regel je zelf: kies een dorp dat midden tussen de
          passen ligt, boek daar al je nachten en rijd elke dag een andere lus
          terug naar hetzelfde bed. Geen koffers sjouwen, geen groepstempo.
        </p>
        <p className="text-[12px] text-slate-500 mb-8 max-w-2xl">
          Elke tour hieronder is opgebouwd rond een basiskamp met genoeg hotels,
          met dagritten die &apos;s avonds weer thuiskomen. Afstanden zijn indicatief.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {LANDEN.map((l) => {
            const n = TOURS.filter((t) => l.id === "alle" || t.country === l.id).length;
            if (n === 0) return null;
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
                <span className="ml-1.5 font-mono text-[11px] opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          {VOERTUIGEN.map((v) => (
            <button
              key={v.id}
              onClick={() => setVoertuig(v.id)}
              aria-pressed={voertuig === v.id}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                voertuig === v.id ? "bg-yellow-400/15 text-yellow-300" : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {v.label}
            </button>
          ))}
          <span className="text-[12px] text-slate-500 self-center ml-2 font-mono">
            {zichtbaar.length} van {TOURS.length} tours · oplopend in zwaarte
          </span>
        </div>
      </section>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pb-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-3">
        {zichtbaar.map((t, i) => {
          const klimmen = tourKlimmen(t);
          return (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
              className="lux-card corner-frame p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <Link
                    href={`/tours/${t.id}`}
                    className="font-display font-bold text-[17px] leading-snug hover:text-yellow-300 transition-colors"
                  >
                    {t.naam}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <BedDouble className="w-3 h-3" aria-hidden />
                    {t.nachten} nachten in {t.basiskamp} · {t.regio}
                  </p>
                </div>
                <span className="w-9 h-9 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
                  <Mountain className="w-4 h-4 text-yellow-300" aria-hidden />
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3 font-mono">
                {[
                  { l: "dagen", v: String(t.dagen.length) },
                  { l: "totaal", v: `${tourKm(t)} km` },
                  { l: "rijtijd", v: uren(tourRijmin(t)) },
                  { l: "cols", v: String(klimmen.length) },
                ].map((s) => (
                  <div key={s.l} className="bg-white/5 rounded p-2 text-center">
                    <p className="text-[9px] uppercase tracking-wide text-slate-500">{s.l}</p>
                    <p className="text-[13px] font-bold text-yellow-300">{s.v}</p>
                  </div>
                ))}
              </div>

              <p className="text-[13px] text-slate-400 leading-relaxed flex-1 mb-3">
                {t.waaromHier}
              </p>

              <p className="text-[11px] text-slate-500 mb-3 flex items-start gap-1.5">
                <CalendarDays className="w-3 h-3 mt-0.5 shrink-0" aria-hidden />
                {t.seizoen}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <Link
                  href={`/tours/${t.id}`}
                  className="px-3 py-2 rounded text-[12px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors flex items-center gap-1.5"
                >
                  <RouteIcon className="w-3.5 h-3.5" aria-hidden />
                  Bekijk de {t.dagen.length} dagritten
                </Link>
                <a
                  href={bookingSearchUrl(t.basiskamp)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  data-track="Affiliate klik"
                  data-track-partner="booking"
                  data-track-context="tour-overzicht"
                  className="px-3 py-2 rounded text-[12px] font-semibold text-slate-300 border border-white/15 hover:border-yellow-400/50 hover:text-yellow-300 transition-colors flex items-center gap-1.5"
                >
                  <BedDouble className="w-3.5 h-3.5" aria-hidden />
                  Hotels in {t.basiskamp}
                </a>
              </div>
            </motion.article>
          );
        })}
      </main>

      <footer className="relative z-10 px-4 sm:px-6 pb-16 max-w-6xl mx-auto">
        <div className="h-px bg-white/10 mb-5" />
        <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
          <Wallet className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
          Afstanden, rijtijden en prijzen zijn indicatief en afgerond. De
          genoemde prijzen van georganiseerde reizen komen uit openbare
          aanbiedingen en dienen alleen ter vergelijking. Hotel-links zijn
          partnerlinks: boek je via die knop, dan verdienen wij een commissie —
          jij betaalt daardoor niets extra.
        </p>
      </footer>
    </div>
  );
}
