"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Mountain,
  Route as RouteIcon,
  Wallet,
  ChevronDown,
} from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import ShareButton from "./ShareButton";
import TripExtras from "./TripExtras";
import { CLIMBS } from "@/lib/climbs";
import { climbScore } from "@/lib/climbscore";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";
import { buildTourFaq } from "@/lib/faq";
import { TOURS, tourKm, tourKlimmen, tourRijmin, type Tour } from "@/lib/tours";

function uren(min: number): string {
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${u} u ${m} m` : `${u} uur`;
}

export default function TourDetail({ tour }: { tour: Tour }) {
  const klimById = new Map(CLIMBS.map((c) => [c.id, c]));
  const klimmen = tourKlimmen(tour);
  const faq = buildTourFaq(tour);
  const andere = TOURS.filter((t) => t.id !== tour.id).slice(0, 4);

  const planDag = (prompt: string) => {
    setPendingPrompt(prompt);
    window.location.assign(plannerUrl(prompt));
  };

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
          <span className="text-lg font-bold tracking-tight font-display">Meerdaagse tour</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <SiteMenu />
          <Link href="/tours" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Alle tours
          </Link>
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block">
            Naar de planner
          </Link>
        </div>
      </nav>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pt-10 pb-16 max-w-4xl mx-auto">
        <Link
          href="/tours"
          className="text-[12px] text-slate-500 hover:text-yellow-400 transition-colors inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          Alle meerdaagse tours
        </Link>

        <p className="eyebrow">
          {tour.regio.toUpperCase()} · {tour.nachten} NACHTEN
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          {tour.naam}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          {[
            { label: "Dagritten", waarde: String(tour.dagen.length) },
            { label: "Totaal", waarde: `${tourKm(tour)} km` },
            { label: "Rijtijd", waarde: uren(tourRijmin(tour)) },
            { label: "Bekende cols", waarde: String(klimmen.length) },
          ].map((s) => (
            <div key={s.label} className="glass rounded border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
              <p className="font-display font-bold text-2xl font-mono">{s.waarde}</p>
            </div>
          ))}
        </div>

        {/* het basiskamp-argument: dit is de kern van het concept */}
        <section className="glass rounded border border-yellow-400/25 bg-yellow-400/[0.05] p-5 mb-6">
          <h2 className="font-display font-bold text-[15px] mb-2 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-yellow-400" aria-hidden />
            Waarom {tour.basiskamp} als basiskamp?
          </h2>
          <p className="text-[14px] text-slate-300 leading-relaxed mb-3">{tour.waaromHier}</p>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            Je boekt <strong className="text-slate-200">{tour.nachten} nachten in één hotel</strong> en
            rijdt elke dag een andere lus terug naar hetzelfde bed. Een
            vergelijkbare begeleide reis in deze streek begint rond de{" "}
            <strong className="text-slate-200">
              €{tour.georganiseerdVanafEur.toLocaleString("nl-NL")}
            </strong>{" "}
            per persoon.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-2 mb-3 text-[12px] text-slate-400">
          <CalendarDays className="w-3.5 h-3.5 text-yellow-400" aria-hidden />
          <span>{tour.seizoen}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {tour.voertuigen.map((v) => (
            <span
              key={v}
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/5 border border-white/15 text-slate-300"
            >
              {v}
            </span>
          ))}
        </div>

        {/* dag voor dag */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl mb-4">Dag voor dag</h2>
          <ol className="space-y-3">
            {tour.dagen.map((d, i) => (
              <li key={d.titel} className="glass rounded border border-white/10 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-8 h-8 rounded bg-yellow-400 text-black font-display font-bold text-[14px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-[16px] leading-snug">{d.titel}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {d.lengthKm} km · {uren(d.rijmin)} rijden
                    </p>
                  </div>
                </div>
                <p className="text-[14px] text-slate-400 leading-relaxed mb-3">{d.omschrijving}</p>

                {d.klimIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {d.klimIds.map((id) => {
                      const c = klimById.get(id);
                      if (!c) return null;
                      return (
                        <Link
                          key={id}
                          href={`/klimmen/${c.id}`}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold glass border border-white/10 text-slate-300 hover:border-yellow-400/50 hover:text-yellow-300 transition-colors flex items-center gap-1.5"
                        >
                          <Mountain className="w-3 h-3" aria-hidden />
                          {c.name}
                          <span className="font-mono opacity-60">
                            {String(climbScore(c)).replace(".", ",")}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => planDag(d.prompt)}
                  data-track="Planner gestart"
                  data-track-source="tour-detail"
                  className="px-3 py-2 rounded text-[12px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors flex items-center gap-1.5"
                >
                  <RouteIcon className="w-3.5 h-3.5" aria-hidden />
                  Plan dag {i + 1} in de planner
                </button>
              </li>
            ))}
          </ol>
        </section>

        {/* de boeking: meerdere nachten, dus de waardevolste conversie */}
        <TripExtras
          place={tour.basiskamp}
          context="tour"
          nachten={tour.nachten}
          titel={`Boek je basiskamp in ${tour.basiskamp}`}
        />

        <section className="glass rounded border border-white/10 p-5 mb-6">
          <h2 className="font-display font-bold text-[15px] mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-yellow-400" aria-hidden />
            Tol, vignet en andere kosten
          </h2>
          <ul className="space-y-1.5">
            {tour.kosten.map((k) => (
              <li key={k} className="text-[13px] text-slate-400 leading-relaxed flex gap-2">
                <span className="text-yellow-400/70 shrink-0">·</span>
                {k}
              </li>
            ))}
          </ul>
        </section>

        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Deel deze tour</p>
          <ShareButton
            titel={`${tour.naam} — ${tour.dagen.length} dagritten vanuit ${tour.basiskamp}`}
            pad={`/tours/${tour.id}`}
            tekst={`Deze meerdaagse tour staat op mijn lijst: ${tour.naam} (${tour.nachten} nachten in ${tour.basiskamp}, ${tourKm(tour)} km). Via Apex Routes:`}
          />
        </div>

        <div className="glass rounded border border-white/10 p-5 mb-6">
          <h2 className="font-display font-bold text-[14px] mb-2">Veelgestelde vragen</h2>
          {faq.map((f) => (
            <details key={f.q} className="group border-b border-white/5 last:border-0 py-3">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-[14px] font-semibold text-slate-200 hover:text-yellow-300 transition-colors">
                {f.q}
                <ChevronDown
                  className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="text-[13px] text-slate-400 leading-relaxed mt-2">{f.a}</p>
            </details>
          ))}
        </div>

        {andere.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-yellow-400" aria-hidden />
              Andere meerdaagse tours
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {andere.map((t) => (
                <Link
                  key={t.id}
                  href={`/tours/${t.id}`}
                  className="px-3 py-2 rounded glass border border-white/10 text-[13px] hover:border-yellow-400/50 hover:text-yellow-300 transition-colors"
                >
                  {t.naam}
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-[11px] text-slate-500 leading-relaxed mt-10 pt-5 border-t border-white/10">
          Afstanden en rijtijden zijn indicatief (bron: {tour.bron}). Controleer
          altijd de actuele openstelling van bergpassen: sneeuw, werkzaamheden
          en evenementen kunnen een weg ook midden in het seizoen sluiten.
          Hotel-links zijn partnerlinks — jij betaalt niets extra.
        </p>
      </main>
    </div>
  );
}
