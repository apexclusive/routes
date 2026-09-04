"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Route as RouteIcon, Copy, Check, BedDouble, Mountain } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import { RITTEN, type EventCountry } from "@/lib/ritten";
import { CLIMBS } from "@/lib/climbs";
import { bookingSearchUrl } from "@/lib/monetize";

const LANDEN: { id: EventCountry | "alle"; label: string }[] = [
  { id: "alle", label: "Alles" },
  { id: "NL", label: "Nederland" },
  { id: "BE", label: "België" },
  { id: "DE", label: "Duitsland" },
  { id: "FR", label: "Frankrijk" },
  { id: "IT", label: "Italië" },
  { id: "AT", label: "Oostenrijk" },
];

const TAGS: { id: string; label: string }[] = [
  { id: "alle", label: "Alle soorten" },
  { id: "motor", label: "Motor" },
  { id: "auto", label: "Auto / cabrio" },
  { id: "fiets", label: "Fiets" },
  { id: "kassei", label: "Kasseien" },
  { id: "uitsicht", label: "Panorama" },
];

export default function Ritten() {
  const [land, setLand] = useState<EventCountry | "alle">("alle");
  const [tag, setTag] = useState("alle");
  const [copied, setCopied] = useState<string | null>(null);

  const klimById = new Map(CLIMBS.map((c) => [c.id, c]));

  const zichtbaar = RITTEN.filter(
    (r) => (land === "alle" || r.country === land) && (tag === "alle" || r.tags.includes(tag))
  );

  const planRit = async (r: (typeof RITTEN)[number]) => {
    try {
      await navigator.clipboard.writeText(r.prompt);
      setCopied(r.id);
      window.setTimeout(() => setCopied(null), 2400);
    } catch {
      window.prompt("Kopieer deze opdracht voor de planner:", r.prompt);
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

      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">Ritten</span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/klimmen" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Klimmen
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

      <header className="relative z-10 px-4 sm:px-6 pt-14 pb-10 max-w-6xl mx-auto">
        <p className="eyebrow">RITTEN</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          Tien ritten die je hebt gereden moet hebben
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl">
          Van de Mergellandroute tot de Stelvio: samengestelde dagritten met
          lengte, rijtijd en hoogtepunten. Eén klik plant de rit in de planner;
          de hotelknop regelt je verblijf onderweg.
        </p>
      </header>

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
          {TAGS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTag(t.id)}
              aria-pressed={tag === t.id}
              className={`px-3 py-1.5 rounded text-[12px] font-medium ${
                tag === t.id ? "bg-yellow-400/20 border border-yellow-400/50 text-yellow-300" : "glass border border-white/10 text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {zichtbaar.length === 0 && (
          <p className="text-slate-500 text-[14px] glass rounded border border-white/10 p-6 mb-8">
            Geen ritten in deze combinatie — reset de filters.
          </p>
        )}
      </section>

      <section className="relative z-10 px-4 sm:px-6 max-w-6xl mx-auto grid gap-3.5 pb-20">
        {zichtbaar.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
            className="lux-card corner-frame p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <Link href={`/ritten/${r.id}`} className="font-display font-bold text-[17px] leading-snug hover:text-yellow-300 transition-colors">
                  {r.naam}
                </Link>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {r.regio} · {r.country}
                </p>
              </div>
              <span className="w-9 h-9 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
                <RouteIcon className="w-4 h-4 text-yellow-300" aria-hidden />
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3 font-mono text-[12px]">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                {r.lengthKm} km
              </span>
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                ± {Math.floor(r.rijmin / 60)}:{String(r.rijmin % 60).padStart(2, "0")} uur rijden
              </span>
              {r.tags.slice(0, 2).map((t) => (
                <span key={t} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400">
                  {t}
                </span>
              ))}
            </div>

            <ul className="space-y-1.5 mb-4">
              {r.hoogtepunten.map((h) => (
                <li key={h} className="text-[13px] text-slate-400 leading-snug flex items-start gap-2">
                  <span className="text-yellow-400/70 mt-1 w-1 h-1 rounded-full bg-yellow-400/70 shrink-0" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>

            {r.klimIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {r.klimIds.map((kid) => {
                  const klim = klimById.get(kid);
                  if (!klim) return null;
                  return (
                    <Link
                      key={kid}
                      href={`/klimmen/${kid}`}
                      className="px-2.5 py-1 rounded text-[11px] glass border border-white/10 text-slate-300 hover:border-yellow-400/50 hover:text-yellow-300 transition-colors inline-flex items-center gap-1"
                    >
                      <Mountain className="w-3 h-3" aria-hidden />
                      {klim.name}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void planRit(r)}
                className="btn-brand px-4 py-2.5 rounded font-semibold text-[13px] flex items-center gap-1.5"
              >
                {copied === r.id ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                {copied === r.id ? "Opdracht gekopieerd" : "Plan deze rit"}
              </button>
              <a
                href={bookingSearchUrl(r.plaats)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="glass border border-white/10 hover:border-yellow-400/50 px-4 py-2.5 rounded font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
              >
                <BedDouble className="w-4 h-4 text-yellow-300" aria-hidden />
                Verblijf in {r.plaats}
              </a>
            </div>
          </motion.article>
        ))}
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Afstanden en rijtijden zijn indicatief en gebaseerd op publieke bronnen
          (ANWB, myrouteapp, Wikipedia); peil altijd zelf de actuele toestand.
          Tolwegen (o.a. Grossglockner) zijn niet in de rijtijd inbegrepen.
        </p>
      </footer>
    </div>
  );
}
