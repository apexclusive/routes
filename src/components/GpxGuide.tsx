"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  FileDown,
  FileText,
  Navigation,
  Smartphone,
  TriangleAlert,
  Lightbulb,
} from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch, { LangNotice } from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";

/**
 * GPX & bestanden — de toolpagina over routebestanden: welke formaten, hoe
 * importeren, en waar exporteer je naartoe per app. Volledig statisch.
 */

const FORMATS = [
  { ext: ".gpx", what: "De gangbare standaard voor routes en tracks uit GPS-apps en -toestellen.", apps: "Veel route-apps, waaronder Garmin, OsmAnd, Kurviger en Komoot" },
  { ext: ".kml", what: "Google Earth-formaat; veel kaartdiensten schrijven het.", apps: "Google Earth, sommige kaarttools" },
  { ext: ".tcx", what: "Garmin Training Center — routes met trainingsdata.", apps: "Garmin Connect, Edge-toestellen" },
  { ext: ".fit", what: "Modern Garmin/Wahoo-formaat, compact en snel.", apps: "Garmin, Wahoo, Sigma" },
  { ext: ".geojson", what: "Open uitwisselingsformaat voor kaartlagen.", apps: "Webtools, QGIS, developers" },
];

const EXPORTS = [
  { app: "Google Maps", best: "Auto & dagtochten", how: "De knop in de samenvatting stuurt start, einde en maximaal negen representatieve tussenpunten mee. Maps berekent zelf het wegverloop." },
  { app: "Waze", best: "Verkeer & meldingen", how: "Waze opent direct met de eindbestemming; gebruik GPX in een compatibele app als de volledige routevorm belangrijk is." },
  { app: "Kurviger", best: "Motor", how: "Download en importeer de GPX met routelijn en beschikbare afslagpunten; controleer Kurvigers importpreview vóór vertrek." },
  { app: "OsmAnd", best: "Offline (fiets & wandelen)", how: "GPX importeren; werkt volledig offline met OpenStreetMap-kaarten." },
  { app: "Komoot", best: "Fiets & wandelen", how: "Importeer de GPX als “tour” — Komoot herberekent op paden, check even de voetafdruk." },
  { app: "Garmin / Wahoo", best: "Op het toestel", how: "Upload de Apex-GPX via Garmin Connect of de Wahoo ELEMNT-app en controleer de route vóór synchronisatie." },
];

const FAQ = [
  {
    q: "Mijn route wordt niet één lijn maar losse punten — nu?",
    a: "Apex probeert de track aan het wegennet te koppelen met de gekozen voertuigmodus. Lukt dat niet betrouwbaar, dan blijft de oorspronkelijke trackvorm behouden en krijg je geen verzonnen afslagen.",
  },
  {
    q: "Waarom max 11 punten voor Google Maps?",
    a: "Google Maps begrenst het aantal tussenpunten en kan per platform anders reageren. Apex kiest daarom maximaal negen representatieve tussenpunten naast start en einde. Maps herberekent de route; vergelijk die vóór vertrek met je oorspronkelijke track.",
  },
  {
    q: "Werkt importeren ook vanaf mijn telefoon?",
    a: "Ja: deel het bestand via “openen met” naar de Apex Routes-PWA, of sleep het in de planner op desktop. Het bestand wordt lokaal gelezen; voor map matching kunnen routecoördinaten via de Apex-API naar de geconfigureerde routingdienst gaan.",
  },
  {
    q: "Welk formaat kan ik het beste bewaren?",
    a: "Bewaar GPX 1.1 met tijdspunten voor latere analyse; zonder tijden blijft het bestand compacter. Een Apex-export bevat de routelijn en, wanneer beschikbaar, afslagpunten. Apps kunnen GPX verschillend interpreteren: controleer de geïmporteerde route vóór vertrek.",
  },
];

export default function GpxGuide() {
  return (
    <div className="min-h-dvh bg-[var(--base)] text-slate-100">
      <ScrollProgress />
      <SkipLink />

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">
            GPX &amp; bestanden
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/checklist" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Vertrek-checklist
          </Link>
          <Link href="/advies" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Advisor
          </Link>
          <Link href="/forum" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Forum
          </Link>
          <ThemeSwitch />
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Naar de planner</span>
          </Link>
        </div>
      </nav>
      <LangNotice />

      {/* hero */}
      <header className="relative z-10 px-4 sm:px-6 pt-12 pb-8 max-w-6xl mx-auto">
        <span className="sec-index block mb-3">TOOL /</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display">
          Alles over <span className="text-gradient">routebestanden</span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-[15px] leading-relaxed">
          Vijf formaten, zes apps, nul gedoe. Hoe je GPX, KML, TCX, FIT en
          GeoJSON in Apex krijgt — en hoe je elke route weer uit Apex krijgt,
          in de app die jij onderweg gebruikt.
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <Link href="/" className="btn-brand px-5 py-3 rounded font-semibold text-sm flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Route importeren
          </Link>
          <Link href="/advies#apps" className="btn-ghost px-5 py-3 rounded font-semibold text-sm flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Welke app wanneer?
          </Link>
        </div>
      </header>

      {/* formaten */}
      <section id="apex-main" className="relative z-10 px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <h2 className="sec-index mb-5">01 / FORMAAT-HERKENNER</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FORMATS.map((f, i) => (
            <motion.div
              key={f.ext}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="lux-card corner-frame p-5"
            >
              <p className="font-mono text-yellow-300 font-bold text-lg">{f.ext}</p>
              <p className="text-[14px] text-slate-300 mt-2 leading-snug">{f.what}</p>
              <p className="text-[12px] text-slate-500 mt-2">{f.apps}</p>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="glass rounded border border-yellow-400/30 p-5 flex flex-col justify-center"
          >
            <p className="flex items-center gap-2 text-[14px] font-semibold text-yellow-200/90">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Sleep elk bestand op de planner
            </p>
            <p className="text-[13px] text-slate-400 mt-1.5 leading-snug">
              Apex herkent de extensie en doet de rest — map matching maakt er
              één navigeerbare route van.
            </p>
          </motion.div>
        </div>
      </section>

      {/* export-matrix */}
      <section className="relative z-10 px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <h2 className="sec-index mb-5">02 / EXPORT NAAR JE APP</h2>
        <div className="lux-card overflow-hidden">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-5 py-3.5 font-semibold">App</th>
                <th className="px-5 py-3.5 font-semibold hidden sm:table-cell">Waarvoor</th>
                <th className="px-5 py-3.5 font-semibold">Zo werkt het</th>
              </tr>
            </thead>
            <tbody>
              {EXPORTS.map((e) => (
                <tr key={e.app} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-200 whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-yellow-400/70" />
                      {e.app}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 hidden sm:table-cell whitespace-nowrap">{e.best}</td>
                  <td className="px-5 py-4 text-slate-400 leading-snug">{e.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-slate-600 mt-3 flex items-start gap-1.5">
          <TriangleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-yellow-400/60" />
          Apps veranderen import-flows regelmatig — werkt iets niet, meld het op het{" "}
          <Link href="/forum" className="underline underline-offset-2 hover:text-yellow-400">
            forum
          </Link>
          .
        </p>
      </section>

      {/* faq */}
      <section className="relative z-10 px-4 sm:px-6 py-10 pb-24 max-w-4xl mx-auto">
        <h2 className="sec-index mb-5">03 / VAAK GEVRAAGD</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="glass rounded border border-white/10 group">
              <summary className="px-5 py-4 cursor-pointer text-[15px] font-semibold text-slate-200 flex items-center gap-2.5 list-none">
                <FileText className="w-4 h-4 text-yellow-400/80 shrink-0" />
                {f.q}
                <ArrowUpRight className="w-4 h-4 ml-auto text-slate-600 group-open:text-yellow-400 transition-colors shrink-0" />
              </summary>
              <p className="px-5 pb-5 text-[14px] text-slate-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="relative z-10 px-6 py-10 border-t border-white/[0.07] text-center">
        <p className="text-[12px] text-slate-500">
          <Link href="/checklist" className="underline underline-offset-2 hover:text-yellow-400">
            vertrek-checklist
          </Link>{" "}
          ·{" "}
          <Link href="/advies" className="underline underline-offset-2 hover:text-yellow-400">
            reisadvies &amp; noodnummers
          </Link>{" "}
          ·{" "}
          <Link href="/forum" className="underline underline-offset-2 hover:text-yellow-400">
            forum
          </Link>
        </p>
        <p className="text-[12px] text-slate-600 mt-2">
          Steun Apex — je bijdrage helpt routingcapaciteit, datakwaliteit en routeonderzoek betalen.{" "}
          <Link href="/prijzen" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
      </footer>
    </div>
  );
}
