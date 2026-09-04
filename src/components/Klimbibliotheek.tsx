"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mountain, Copy, Check, Road } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import { CLIMBS, type EventCountry } from "@/lib/climbs";

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

const SURFACE_LABEL: Record<string, string> = {
  asfalt: "asfalt",
  kassei: "kassei",
  keien: "keien",
};

export default function Klimbibliotheek() {
  const [land, setLand] = useState<EventCountry | "alle">("alle");
  const [surface, setSurface] = useState<(typeof SURFACES)[number]["id"]>("alle");
  const [copied, setCopied] = useState<string | null>(null);

  const visible = CLIMBS.filter(
    (c) =>
      (land === "alle" || c.country === land) &&
      (surface === "alle" || c.surface === surface)
  ).sort((a, b) => b.maxPct - a.maxPct);

  const planRit = async (id: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 2200);
    } catch {
      // klembord geblokkeerd — de planner opent toch
    }
    window.open("/", "_self");
  };

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[#050507]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[#ffe600]/[0.10] top-[-180px] left-[-140px]" />
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
          <Link href="/kalender" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Kalender
          </Link>
          <Link href="/ontdek" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Ontdek
          </Link>
          <Link href="/advies" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Advisor
          </Link>
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
          <span className="text-[12px] text-slate-500 self-center ml-2 font-mono">
            {visible.length} klimmen · gesorteerd op steilste stuk
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
            <div className="flex items-start justify-between mb-3">
              <div>
                <Link href={`/klimmen/${c.id}`} className="font-display font-bold text-[16px] leading-snug hover:text-yellow-300 transition-colors">
                  {c.name}
                </Link>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {c.place} · {c.country}
                </p>
              </div>
              <span className="w-9 h-9 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
                <Mountain className="w-4 h-4 text-yellow-300" aria-hidden />
              </span>
            </div>
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
                onClick={() => void planRit(c.id, c.prompt)}
                className="ml-auto px-3 py-2 rounded text-[12px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors flex items-center gap-1.5"
                title="Kopieert de opdracht en opent de planner — plak in de chat"
              >
                {copied === c.id ? (
                  <Check className="w-3.5 h-3.5" aria-hidden />
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden />
                )}
                {copied === c.id ? "Gekopieerd — plak in de chat" : "Plan rit over deze klim"}
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
          climbfinder) — hoogtevelden en percentages variëren per bron en meting;
          het verkeersbord ter plekke telt. Staan er klimmen die je mist? Meld
          ze via de feedback-knop rechtsonder.
        </p>
      </footer>
    </div>
  );
}
