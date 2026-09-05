"use client";

import Link from "next/link";
import { Mountain, BedDouble, Road, ArrowLeft, Route as RouteIcon } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import { CLIMBS, type Climb, type EventCountry } from "@/lib/climbs";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";
import TripExtras from "./TripExtras";
import ShareButton from "./ShareButton";
import DeelKaart from "./DeelKaart";
import { buildKlimFaq } from "@/lib/faq";
import { klimtijdMinuten, rankClimbs, rateClimb } from "@/lib/climbscore";
import { ChevronDown } from "lucide-react";

const LAND_NAAM: Record<EventCountry, string> = {
  NL: "Nederland",
  BE: "België",
  LU: "Luxemburg",
  DE: "Duitsland",
  FR: "Frankrijk",
  IT: "Italië",
  CH: "Zwitserland",
  AT: "Oostenrijk",
};

export default function KlimDetail({ klim }: { klim: Climb }) {
  const km = (klim.lengthM / 1000).toFixed(1).replace(".", ",");
  const score = rateClimb(klim, CLIMBS);
  const ranglijst = rankClimbs(CLIMBS);
  const rang = ranglijst.find((r) => r.climb.id === klim.id)?.rang ?? ranglijst.length;
  const zwaarste = ranglijst[0].climb;
  const zwaartePct = score.relatief;
  const tijd = klimtijdMinuten(klim);
  const KLASSE_KLEUR: Record<string, string> = {
    instap: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300",
    pittig: "bg-lime-400/10 border-lime-400/30 text-lime-300",
    zwaar: "bg-yellow-400/10 border-yellow-400/30 text-yellow-300",
    loodzwaar: "bg-orange-400/10 border-orange-400/30 text-orange-300",
    buitencategorie: "bg-red-400/10 border-red-400/30 text-red-300",
  };
  const mmss = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)}u ${String(m % 60).padStart(2, "0")}m` : `${m} min`;
  const faq = buildKlimFaq(klim);
  const landgenoten = CLIMBS.filter(
    (c) => c.country === klim.country && c.id !== klim.id
  ).slice(0, 6);

  const planRit = () => {
    setPendingPrompt(klim.prompt);
    window.location.assign(plannerUrl(klim.prompt));
  };

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[#050507]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[#ffe600]/[0.10] top-[-180px] left-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">
            Klimbibliotheek
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/klimmen" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Alle klimmen
          </Link>
          <Link href="/kalender" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Kalender
          </Link>
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block">
            Naar de planner
          </Link>
        </div>
      </nav>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pt-10 pb-16 max-w-4xl mx-auto">
        <Link
          href="/klimmen"
          className="text-[12px] text-slate-500 hover:text-yellow-400 transition-colors inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          Alle klimmen
        </Link>

        <p className="eyebrow">
          {LAND_NAAM[klim.country].toUpperCase()} · {klim.place.toUpperCase()}
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4 flex items-center gap-3">
          {klim.name}
        </h1>
        <div className="flex flex-wrap gap-1.5 mb-8">
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-yellow-400/10 border border-yellow-400/25 text-yellow-300">
            {klim.surface}
          </span>
          {klim.seizoen && (
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/5 border border-white/15 text-slate-300">
              {klim.seizoen.split(/[—(]/)[0].trim()}
            </span>
          )}
          {/tolweg/i.test(klim.note + " " + klim.prompt) && (
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/5 border border-white/15 text-slate-300 flex items-center gap-1">
              <Road className="w-3 h-3" aria-hidden /> tolweg
            </span>
          )}
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/5 border border-white/15 text-slate-300">
            {km} km
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
          {[
            { label: "Lengte", waarde: `${km} km` },
            { label: "Gemiddeld", waarde: `${String(klim.avgPct).replace(".", ",")}%` },
            { label: "Maximaal", waarde: `${String(klim.maxPct).replace(".", ",")}%` },
            { label: "Hoogtemeters", waarde: `${klim.elevationM} hm` },
          ].map((s) => (
            <div key={s.label} className="glass rounded border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
              <p className="font-display font-bold text-2xl font-mono">{s.waarde}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded border border-white/10 p-5 mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 className="font-display font-bold text-[14px]">Zwaarte volgens de FIETS-index</h2>
            <Link
              href="/klimmen/ranglijst"
              className="text-[11px] text-slate-500 hover:text-yellow-300 transition-colors"
            >
              #{rang} van {CLIMBS.length} in de ranglijst · zwaarste is {zwaarste.name}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="font-display font-bold text-3xl font-mono text-yellow-300">
              {String(score.score).replace(".", ",")}
            </span>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide border ${KLASSE_KLEUR[score.klasse]}`}
            >
              {score.klasse}
            </span>
          </div>
          <div className="h-3 rounded bg-white/5 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300"
              style={{ width: `${Math.max(zwaartePct, 4)}%` }}
            />
          </div>
          <p className="text-[12px] text-slate-400 mt-2 leading-relaxed">
            {score.label} Dat is {zwaartePct}% van de zwaarste beklimming in de
            bibliotheek. De FIETS-index weegt hoogtemeters kwadratisch tegen de
            lengte en corrigeert voor hoogte boven 1000 m.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Recreant", waarde: mmss(tijd.recreant) },
              { label: "Sportief", waarde: mmss(tijd.sportief) },
              { label: "Profniveau", waarde: mmss(tijd.pro) },
            ].map((t) => (
              <div key={t.label} className="bg-white/5 rounded p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">
                  {t.label}
                </p>
                <p className="text-[13px] font-bold font-mono text-slate-200">{t.waarde}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Indicatieve klimtijden op de fiets, berekend uit de hoogtemeters bij
            600 / 950 / 1500 hoogtemeter per uur.
          </p>
        </div>

        <p className="text-slate-400 text-[15px] leading-relaxed mb-8 max-w-2xl">{klim.note}</p>

        <div className="flex flex-wrap gap-2.5 mb-6">
          <button
            onClick={planRit}
            data-track="Planner gestart"
            data-track-source="klim-detail"
            className="btn-brand px-5 py-3 rounded font-semibold text-[14px] flex items-center gap-2"
          >
            <RouteIcon className="w-4 h-4" aria-hidden />
            Plan direct over deze klim
          </button>
        </div>

        <TripExtras place={klim.place} context="klim" />

        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Deel deze klim</p>
          <div className="flex flex-wrap items-center gap-2">
            <ShareButton
              titel={`${klim.name} — ${km} km aan ${String(klim.avgPct).replace(".", ",")}%`}
              pad={`/klimmen/${klim.id}`}
              tekst={`Deze klim staat op mijn lijst: ${klim.name} (${km} km, gem ${String(klim.avgPct).replace(".", ",")}%). Via Apex Routes:`}
            />
            <DeelKaart
              soort="BEKLIMMING"
              naam={klim.name}
              sub={`${klim.place} — ${km} km aan ${String(klim.avgPct).replace(".", ",")}%`}
              stats={[`${km} km`, `gem ${String(klim.avgPct).replace(".", ",")}%`, `max ${String(klim.maxPct).replace(".", ",")}%`, `${klim.elevationM} hm`]}
              urlLabel="routes.apexclusive.nl/klimmen"
            />
          </div>
        </div>

        <div className="glass rounded border border-white/10 p-5 mb-6">
          <h2 className="font-display font-bold text-[14px] mb-2">Veelgestelde vragen</h2>
          {faq.map((f) => (
            <details key={f.q} className="group border-b border-white/5 last:border-0 py-3">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-[14px] font-semibold text-slate-200 hover:text-yellow-300 transition-colors">
                {f.q}
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="text-[13px] text-slate-400 leading-relaxed mt-2">{f.a}</p>
            </details>
          ))}
        </div>

        {landgenoten.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-yellow-400" aria-hidden />
              Andere klimmen in {LAND_NAAM[klim.country]}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {landgenoten.map((c) => (
                <Link
                  key={c.id}
                  href={`/klimmen/${c.id}`}
                  className="px-3 py-2 rounded glass border border-white/10 text-[13px] hover:border-yellow-400/50 hover:text-yellow-300 transition-colors"
                >
                  {c.name}
                  <span className="text-slate-500 ml-1.5 font-mono text-[11px]">{c.avgPct}%</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-[11px] text-slate-500 mt-10">
          Cijfers zijn indicatief en gebaseerd op publieke bronnen (wielerflits,
          fiets.nl, climbfinder); het bord aan de voet telt altijd.{" "}
          <Link href="/klimmen" className="underline hover:text-yellow-400">
            Terug naar de bibliotheek
          </Link>
        </p>
      </main>
    </div>
  );
}
