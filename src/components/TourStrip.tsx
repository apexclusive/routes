"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, ArrowRight, Mountain } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { TOURS, tourKm, toursOpZwaarte } from "@/lib/tours";

/**
 * Landings-blok voor de meerdaagse tours. Het prijsanker (een begeleide reis
 * kost 1500-4650 euro) doet hier het overtuigingswerk: bezoekers snappen in
 * één zin waarom een basiskamp aantrekkelijk is, en de doorklik naar een
 * tourpagina is de meest waardevolle die de landing heeft.
 */
const COPY: Record<
  Lang,
  {
    badge: string;
    titelA: string;
    titelB: string;
    sub: string;
    nachten: (n: number, p: string) => string;
    vanaf: (e: string) => string;
    cta: string;
    alle: string;
  }
> = {
  nl: {
    badge: "Meerdaagse tours",
    titelA: "Eén hotel,",
    titelB: "elke dag een andere pas",
    sub: "Een begeleide alpenreis kost al gauw €1.500 tot €4.650 per persoon. Boek zelf een dorp midden tussen de passen, blijf er slapen en rijd elke dag een andere lus terug naar hetzelfde bed.",
    nachten: (n, p) => `${n} nachten in ${p}`,
    vanaf: (e) => `Georganiseerd vanaf €${e} p.p.`,
    cta: "Bekijk de dagritten",
    alle: "Alle meerdaagse tours",
  },
  en: {
    badge: "Multi-day tours",
    titelA: "One hotel,",
    titelB: "a different pass every day",
    sub: "A guided Alpine trip easily costs €1,500 to €4,650 per person. Book a village in the middle of the passes yourself, stay put and ride a different loop back to the same bed each day.",
    nachten: (n, p) => `${n} nights in ${p}`,
    vanaf: (e) => `Guided from €${e} pp`,
    cta: "See the daily rides",
    alle: "All multi-day tours",
  },
  fr: {
    badge: "Voyages de plusieurs jours",
    titelA: "Un seul hôtel,",
    titelB: "un col différent chaque jour",
    sub: "Un voyage alpin encadré coûte vite de 1 500 à 4 650 € par personne. Réservez vous-même un village au cœur des cols, restez-y et roulez chaque jour une boucle différente.",
    nachten: (n, p) => `${n} nuits à ${p}`,
    vanaf: (e) => `Encadré à partir de ${e} € / pers.`,
    cta: "Voir les étapes",
    alle: "Tous les voyages",
  },
  de: {
    badge: "Mehrtagestouren",
    titelA: "Ein Hotel,",
    titelB: "jeden Tag ein anderer Pass",
    sub: "Eine geführte Alpenreise kostet schnell 1.500 bis 4.650 Euro pro Person. Buchen Sie selbst ein Dorf mitten zwischen den Pässen, bleiben Sie dort und fahren Sie jeden Tag eine andere Schleife.",
    nachten: (n, p) => `${n} Nächte in ${p}`,
    vanaf: (e) => `Geführt ab ${e} € p. P.`,
    cta: "Tagesetappen ansehen",
    alle: "Alle Mehrtagestouren",
  },
};

export default function TourStrip({ lang = "nl" }: { lang?: Lang }) {
  const c = COPY[lang] ?? COPY.nl;
  // de drie zwaarste tours: dat zijn de Alpen-reizen met de hoogste boekwaarde
  const uitgelicht = toursOpZwaarte(TOURS).slice(-3).reverse();

  return (
    <section id="tours" className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
      >
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[13px] text-slate-300 mb-5 border border-white/10">
            <BedDouble className="w-4 h-4 text-yellow-400" />
            {c.badge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight font-display">
            <span className="sec-index block mb-3">03 /</span>
            {c.titelA} <span className="text-gradient">{c.titelB}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-[15px] leading-relaxed">{c.sub}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {uitgelicht.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="lux-card corner-frame p-5 flex flex-col"
            >
              <span className="w-9 h-9 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center mb-3">
                <Mountain className="w-4 h-4 text-yellow-300" aria-hidden />
              </span>
              <Link
                href={`/tours/${t.id}`}
                className="font-display font-bold text-[17px] leading-snug hover:text-yellow-300 transition-colors"
              >
                {t.naam}
              </Link>
              <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                {c.nachten(t.nachten, t.basiskamp)} · {t.dagen.length}× · {tourKm(t)} km
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed mt-3 flex-1">
                {t.waaromHier.length > 150 ? `${t.waaromHier.slice(0, 147)}…` : t.waaromHier}
              </p>
              <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-white/[0.07]">
                {c.vanaf(t.georganiseerdVanafEur.toLocaleString("nl-NL"))}
              </p>
              <Link
                href={`/tours/${t.id}`}
                className="mt-3 px-3 py-2 rounded text-[12px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors inline-flex items-center gap-1.5 self-start"
              >
                {c.cta}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/tours"
            className="btn-ghost h-11 px-5 rounded font-semibold text-[14px] inline-flex items-center gap-2"
          >
            {c.alle}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
