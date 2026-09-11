"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Route as RouteIcon, Copy, Check, BedDouble, Mountain } from "lucide-react";
import { useLang } from "./LangSwitch";
import { LANDING, type Lang } from "@/lib/i18n";
import { RITTEN } from "@/lib/ritten";
import { CLIMBS } from "@/lib/climbs";
import { bookingSearchUrl } from "@/lib/monetize";

const PARTNER_DISCLOSURE: Record<Lang, string> = {
  nl: "Partnerlink · Apex kan commissie ontvangen; jouw prijs blijft gelijk.",
  en: "Partner link · Apex may earn commission; your price stays the same.",
  fr: "Lien partenaire · Apex peut recevoir une commission, sans surcoût pour vous.",
  de: "Partnerlink · Apex kann eine Provision erhalten; dein Preis bleibt gleich.",
};

/**
 * "Rit van de week" — roteert automatisch per week (timestamp/weekmodulus),
 * volledig automatisch dus nooit handmatig onderhouden.
 */
export default function RotwBand() {
  const [lang] = useLang() as [Lang, (l: Lang) => void];
  const t = LANDING[lang].rotw;
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // weekkeuze na mount (i.v.m. SSR-hydratie en React-compiler)
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setIdx(Math.floor(Date.now() / 604800000) % RITTEN.length);
    });
    return () => cancelAnimationFrame(r);
  }, []);

  const rit = RITTEN[idx];
  const klimmen = rit.klimIds
    .map((id) => CLIMBS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 3);

  const plan = async () => {
    try {
      await navigator.clipboard.writeText(rit.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Kopieer deze opdracht voor de planner:", rit.prompt);
    }
    document.getElementById("apex-main")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative z-10 px-4 sm:px-6 py-16 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="lux-card corner-frame p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="aurora w-72 h-72 bg-[var(--accent)]/[0.07] -top-24 -left-20" aria-hidden />
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 relative">
          <span className="w-14 h-14 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
            <RouteIcon className="w-7 h-7 text-yellow-300" aria-hidden />
          </span>
          <div className="flex-1 min-w-0">
            <span className="sec-index block mb-2">{t.label.toUpperCase()} /</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mb-1.5">
              {rit.naam}
            </h2>
            <p className="font-mono text-[12px] text-yellow-300/90 mb-3">
              {rit.regio} · {rit.lengthKm} km · ± {Math.floor(rit.rijmin / 60)}:{String(rit.rijmin % 60).padStart(2, "0")} u
            </p>
            <ul className="text-slate-400 text-[14px] leading-relaxed space-y-1 mb-3 max-w-xl">
              {rit.hoogtepunten.slice(0, 2).map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <span className="text-yellow-400/70 mt-2 w-1 h-1 rounded-full bg-yellow-400/70 shrink-0" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
            {klimmen.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Mountain className="w-3 h-3" aria-hidden /> {t.climbs}:
                </span>
                {klimmen.map((k) => (
                  <Link
                    key={k.id}
                    href={`/klimmen/${k.id}`}
                    className="glass rounded px-2 py-1 text-[11px] font-semibold text-slate-300 border border-white/10 hover:border-yellow-400/50 hover:text-yellow-300 transition-colors"
                  >
                    {k.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => void plan()}
              className="btn-brand btn-shine px-6 py-3 rounded font-semibold whitespace-nowrap flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
              {copied ? t.copied : t.plan}
            </button>
            <a
              href={bookingSearchUrl(rit.plaats)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              data-track="Affiliate klik"
              data-track-partner="booking"
              data-track-context="rit-van-de-week"
              className="glass border border-white/10 hover:border-yellow-400/50 px-6 py-3 rounded font-semibold whitespace-nowrap flex items-center gap-2 transition-colors"
            >
              <BedDouble className="w-4 h-4 text-yellow-300" aria-hidden />
              {t.hotel} · {rit.plaats}
            </a>
            <p className="text-[10px] text-slate-600 max-w-[15rem] leading-snug text-center">
              {PARTNER_DISCLOSURE[lang]}
            </p>
            <Link
              href="/ritten"
              className="text-center text-[12px] text-slate-500 hover:text-yellow-400 transition-colors px-2 py-1"
            >
              {t.meer} →
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
