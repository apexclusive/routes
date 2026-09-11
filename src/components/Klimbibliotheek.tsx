"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mountain, Road, Route as RouteIcon } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import { CLIMBS, type EventCountry } from "@/lib/climbs";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";
import { climbScore, rankClimbs, zwaarteKlasse, type ZwaarteKlasse } from "@/lib/climbscore";

const LANDEN: { id: EventCountry | "alle"; label: string }[] = [
  { id: "alle", label: "Alles" },
  { id: "NL", label: "Nederland" },
  { id: "BE", label: "België" },
  { id: "DE", label: "Duitsland" },
  { id: "FR", label: "Frankrijk" },
  { id: "IT", label: "Italië" },
  { id: "CH", label: "Zwitserland" },
  { id: "AT", label: "Oostenrijk" },
];

const SURFACES = [
  { id: "alle", label: "Alle soorten" },
  { id: "asfalt", label: "Asfalt" },
  { id: "kassei", label: "Kassei" },
  { id: "keien", label: "Keien" },
] as const;

const SORTERINGEN = [
  { id: "zwaarte", label: "Zwaarste eerst" },
  { id: "steilst", label: "Steilste stuk" },
  { id: "langst", label: "Langste" },
  { id: "naam", label: "Alfabetisch" },
] as const;

const KLASSEN: { id: ZwaarteKlasse | "alle"; label: string }[] = [
  { id: "alle", label: "Elke zwaarte" },
  { id: "instap", label: "Instap" },
  { id: "pittig", label: "Pittig" },
  { id: "zwaar", label: "Zwaar" },
  { id: "loodzwaar", label: "Loodzwaar" },
  { id: "buitencategorie", label: "Buitencategorie" },
];

const KLASSE_KLEUR: Record<ZwaarteKlasse, string> = {
  instap: "zwaarte zwaarte-instap",
  pittig: "zwaarte zwaarte-pittig",
  zwaar: "zwaarte zwaarte-zwaar",
  loodzwaar: "zwaarte zwaarte-loodzwaar",
  buitencategorie: "zwaarte zwaarte-buitencategorie",
};

const SURFACE_LABEL: Record<string, string> = {
  asfalt: "asfalt",
  kassei: "kassei",
  keien: "keien",
};

export default function Klimbibliotheek() {
  const [land, setLand] = useState<EventCountry | "alle">("alle");
  const [surface, setSurface] = useState<(typeof SURFACES)[number]["id"]>("alle");
  const [sortering, setSortering] = useState<(typeof SORTERINGEN)[number]["id"]>("zwaarte");
  const [klasse, setKlasse] = useState<ZwaarteKlasse | "alle">("alle");

  const rangen = new Map(rankClimbs(CLIMBS).map((r) => [r.climb.id, r.rang]));

  const visible = CLIMBS.filter(
    (c) =>
      (land === "alle" || c.country === land) &&
      (surface === "alle" || c.surface === surface) &&
      (klasse === "alle" || zwaarteKlasse(climbScore(c)).klasse === klasse)
  ).sort((a, b) => {
    if (sortering === "steilst") return b.maxPct - a.maxPct;
    if (sortering === "langst") return b.lengthM - a.lengthM;
    if (sortering === "naam") return a.name.localeCompare(b.name, "nl");
    return climbScore(b) - climbScore(a);
  });

  const planRit = (prompt: string) => {
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

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">
            Klimbibliotheek
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/klimmen/ranglijst" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Ranglijst
          </Link>
          <Link href="/ontdek" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Ontdek
          </Link>
          <Link href="/advies" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Advisor
          </Link>
          <ThemeSwitch />
          <LangSwitch className="hidden sm:flex" />
          <Link
            href="/"
            className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block"
          >
            Naar de planner
          </Link>
        </div>
      </nav>

      {/* hero */}
      <header className="relative z-10 px-4 sm:px-6 pt-14 pb-10 max-w-6xl mx-auto">
        <p className="eyebrow">BIBLIOTHEEK</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          Elke klim die ertoe doet
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl">
          Van de Cauberg tot de Stelvio: 28 beklimmingen van de Benelux tot
          en met de Alpen, met lengte, percentages en hoogtemeters. Eén klik
          zet de klim in een complete route over mooie wegen.
        </p>
      </header>

      {/* filters */}
      <section className="relative z-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {LANDEN.map((l) => (
            <button
              key={l.id}
              onClick={() => setLand(l.id)}
              aria-pressed={land === l.id}
              className={`px-3.5 py-2 rounded text-[13px] font-semibold ${
                land === l.id ? "bg-yellow-400 text-black" : "glass border border-white/10 text-slate-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {SURFACES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSurface(s.id)}
              aria-pressed={surface === s.id}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                surface === s.id ? "bg-white/15 text-white" : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {KLASSEN.map((k) => (
            <button
              key={k.id}
              onClick={() => setKlasse(k.id)}
              aria-pressed={klasse === k.id}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                klasse === k.id ? "bg-white/15 text-white" : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 mr-1">
            Sorteer
          </span>
          {SORTERINGEN.map((o) => (
            <button
              key={o.id}
              onClick={() => setSortering(o.id)}
              aria-pressed={sortering === o.id}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                sortering === o.id ? "bg-yellow-400/15 text-yellow-300" : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {o.label}
            </button>
          ))}
          <span className="text-[12px] text-slate-500 self-center ml-2 font-mono">
            {visible.length} van {CLIMBS.length} klimmen
          </span>
        </div>
      </section>

      {/* klimmen */}
      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pb-24 max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2) }}
            className="lux-card corner-frame p-5 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <Link href={`/klimmen/${c.id}`} className="font-display font-bold text-[16px] leading-snug hover:text-yellow-300 transition-colors">
                  {c.name}
                </Link>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {c.place} · {c.country} · {c.summitM} m top
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="font-mono font-bold text-[15px] text-yellow-300 leading-none"
                  title="FIETS-index: de standaardmaat voor de zwaarte van een beklimming"
                >
                  {String(climbScore(c)).replace(".", ",")}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 leading-none">
                  #{rangen.get(c.id)} zwaarte
                </span>
              </div>
            </div>
            <span
              className={`self-start mb-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${KLASSE_KLEUR[zwaarteKlasse(climbScore(c)).klasse]}`}
            >
              {zwaarteKlasse(climbScore(c)).klasse}
            </span>
            <div className="grid grid-cols-4 gap-2 mb-3 font-mono">
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-[9px] uppercase tracking-wide text-slate-500">lengte</p>
                <p className="text-[13px] font-bold text-yellow-300">
                  {c.lengthM >= 1000 ? `${(c.lengthM / 1000).toFixed(1).replace(".", ",")} km` : `${c.lengthM} m`}
                </p>
              </div>
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-[9px] uppercase tracking-wide text-slate-500">gem</p>
                <p className="text-[13px] font-bold text-yellow-300">
                  {String(c.avgPct).replace(".", ",")}%
                </p>
              </div>
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-[9px] uppercase tracking-wide text-slate-500">max</p>
                <p className="text-[13px] font-bold text-yellow-300">
                  {String(c.maxPct).replace(".", ",")}%
                </p>
              </div>
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-[9px] uppercase tracking-wide text-slate-500">hm</p>
                <p className="text-[13px] font-bold text-yellow-300">{c.elevationM}</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed flex-1 mb-3">
              {c.note}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded border border-white/10 text-slate-400">
                {SURFACE_LABEL[c.surface]}
              </span>
              <button
                onClick={() => planRit(c.prompt)}
                data-track="Planner gestart"
                data-track-source="klimbibliotheek"
                className="ml-auto px-3 py-2 rounded text-[12px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors flex items-center gap-1.5"
                title="Opent deze klim direct als opdracht in de planner"
              >
                <RouteIcon className="w-3.5 h-3.5" aria-hidden />
                Plan direct
              </button>
            </div>
          </motion.div>
        ))}
      </main>

      <footer className="relative z-10 px-4 sm:px-6 pb-16 max-w-6xl mx-auto">
        <div className="h-px bg-white/10 mb-5" />
        <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
          <Road className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
          Cijfers zijn indicatief en afgerond (bronnen: wielerflits, fiets.nl,
          climbfinder, organisatiedata van de Maratona dles Dolomites) — hoogtevelden
          en percentages variëren per bron en meting;
          het verkeersbord ter plekke telt. Staan er klimmen die je mist? Meld
          ze via de feedback-knop rechtsonder. De zwaarte is de FIETS-index
          (H²/(D×10) plus hoogtecorrectie boven 1000 m), met een eigen toeslag
          voor kasseien en keien.
        </p>
      </footer>
    </div>
  );
}
