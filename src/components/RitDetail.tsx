"use client";

import Link from "next/link";
import { Route as RouteIcon, BedDouble, Mountain, ArrowLeft } from "lucide-react";
import Logo from "./Logo";
import LangSwitch from "./LangSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import SiteMenu from "./SiteMenu";
import ShareButton from "./ShareButton";
import DeelKaart from "./DeelKaart";
import { buildRitFaq } from "@/lib/faq";
import { ChevronDown } from "lucide-react";
import { RITTEN, type Rit, type EventCountry } from "@/lib/ritten";
import { CLIMBS } from "@/lib/climbs";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";
import TripExtras from "./TripExtras";

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

export default function RitDetail({ rit }: { rit: Rit }) {
  const klimmen = rit.klimIds
    .map((id) => CLIMBS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const andere = RITTEN.filter((r) => r.id !== rit.id).slice(0, 6);
  const faq = buildRitFaq(rit);
  const rijtijd = `${Math.floor(rit.rijmin / 60)}:${String(rit.rijmin % 60).padStart(2, "0")}`;

  const planRit = () => {
    setPendingPrompt(rit.prompt);
    window.location.assign(plannerUrl(rit.prompt));
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
          <span className="text-lg font-bold tracking-tight font-display">Ritten</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/ritten" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Alle ritten
          </Link>
          <Link href="/klimmen" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Klimmen
          </Link>
          <SiteMenu />
          <LangSwitch className="hidden sm:flex" />
        </div>
      </nav>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pt-10 pb-16 max-w-4xl mx-auto">
        <Link
          href="/ritten"
          className="text-[12px] text-slate-500 hover:text-yellow-400 transition-colors inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          Alle ritten
        </Link>

        <p className="eyebrow">
          {LAND_NAAM[rit.country].toUpperCase()} · {rit.regio.toUpperCase()}
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          {rit.naam}
        </h1>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {rit.tags.map((t) => (
            <span key={t} className="px-2.5 py-1 rounded text-[11px] font-semibold bg-yellow-400/10 border border-yellow-400/25 text-yellow-300">
              {t}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/5 border border-white/15 text-slate-300">
            startplaats {rit.plaats}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
          {[
            { label: "Afstand", waarde: `${rit.lengthKm} km` },
            { label: "Rijtijd", waarde: `± ${rijtijd} u` },
            { label: "Klimmen", waarde: `${klimmen.length}` },
            { label: "Beste periode", waarde: rit.seizoen.split(/[—(]/)[0].trim() },
          ].map((s) => (
            <div key={s.label} className="glass rounded border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
              <p className="font-display font-bold text-2xl font-mono">{s.waarde}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded border border-white/10 p-5 mb-6">
          <h2 className="font-display font-bold text-[14px] mb-3">Hoogtepunten</h2>
          <ul className="space-y-2">
            {rit.hoogtepunten.map((h) => (
              <li key={h} className="text-[14px] text-slate-300 leading-snug flex items-start gap-2.5">
                <span className="text-yellow-400 mt-2 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {klimmen.length > 0 && (
          <div className="glass rounded border border-white/10 p-5 mb-6">
            <h2 className="font-display font-bold text-[14px] mb-3 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-yellow-400" aria-hidden />
              Klimmen onderweg
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {klimmen.map((k) => (
                <Link
                  key={k.id}
                  href={`/klimmen/${k.id}`}
                  className="px-3 py-2 rounded glass border border-white/10 text-[13px] hover:border-yellow-400/50 hover:text-yellow-300 transition-colors"
                >
                  {k.name}
                  <span className="text-slate-500 ml-1.5 font-mono text-[11px]">
                    {String(k.avgPct).replace(".", ",")}% · {k.maxPct >= 15 ? "max " + k.maxPct + "%" : (k.lengthM / 1000).toFixed(1).replace(".", ",") + " km"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 mb-6">
          <button
            onClick={planRit}
            data-track="Planner gestart"
            data-track-source="rit-detail"
            className="btn-brand px-5 py-3 rounded font-semibold text-[14px] flex items-center gap-2"
          >
            <RouteIcon className="w-4 h-4" aria-hidden />
            Plan direct in de planner
          </button>
        </div>

        <TripExtras place={rit.plaats} context="rit" />

        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Deel deze rit</p>
          <div className="flex flex-wrap items-center gap-2">
            <ShareButton
              titel={`${rit.naam} — ${rit.lengthKm} km door ${rit.regio}`}
              pad={`/ritten/${rit.id}`}
              tekst={`Ik ga deze rit rijden: ${rit.naam} (${rit.lengthKm} km, ${rit.regio}). Gevonden op Apex Routes:`}
            />
            <DeelKaart
              soort="DAGRIT"
              naam={rit.naam}
              sub={`${rit.regio} — ${rit.lengthKm} km · ${rijtijd} u rijden`}
              stats={[`${rit.lengthKm} km`, `${rijtijd} u`, `${rit.plaats}`, rit.country]}
              urlLabel="routes.apexclusive.nl/ritten"
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

        <section>
          <h2 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-yellow-400" aria-hidden />
            Andere ritten
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {andere.map((r) => (
              <Link
                key={r.id}
                href={`/ritten/${r.id}`}
                className="px-3 py-2 rounded glass border border-white/10 text-[13px] hover:border-yellow-400/50 hover:text-yellow-300 transition-colors"
              >
                {r.naam}
                <span className="text-slate-500 ml-1.5 font-mono text-[11px]">{r.lengthKm} km</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-[11px] text-slate-500 mt-10">
          Afstand en rijtijd zijn indicatief (publieke bronnen: ANWB, myrouteapp,
          Wikipedia); tolwegen niet inbegrepen.{" "}
          <Link href="/ritten" className="underline hover:text-yellow-400">
            Terug naar alle ritten
          </Link>
        </p>
      </main>
    </div>
  );
}
