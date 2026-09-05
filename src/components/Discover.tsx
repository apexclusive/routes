"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  ArrowUpRight,
  Play,
  Coffee,
  Footprints,
  Beer,
  Route as RouteIcon,
  TrendingUp,
} from "lucide-react";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import TiltCard from "./TiltCard";
import LangSwitch, { LangNotice } from "./LangSwitch";
import Bucketlist from "./Bucketlist";
import {
  COUNTRIES,
  CIRCUITS,
  RALLY_EVENTS,
  DISCOVER_FOOTER,
} from "@/lib/discover";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";

/** Route openen in de planner: prompt klaarzetten en terug naar de app. */
function useOpenInPlanner() {
  const router = useRouter();
  return (prompt: string) => {
    setPendingPrompt(prompt);
    router.push(plannerUrl(prompt));
  };
}

const STOP_TIPS = [
  { icon: Coffee, label: "Koffietje", text: "Zet onderweg de POI-laag aan: cafés staan binnen 2 km van je route." },
  { icon: Beer, label: "(Alcoholvrij) biertje", text: "Zelfde laag, zelfde plek — proost op de bestuurder die nuchter blijft." },
  { icon: Footprints, label: "Korte wandeling", text: "Uitzichtpunten markeren we ook: ideale plek voor de benen te strekken." },
];

export default function Discover() {
  const [country, setCountry] = useState(COUNTRIES[0].id);
  const active = COUNTRIES.find((c) => c.id === country) ?? COUNTRIES[0];
  const openInPlanner = useOpenInPlanner();

  return (
    <div className="min-h-dvh text-white grain relative overflow-x-clip bg-[#050507]">
      <ScrollProgress />
      <SkipLink />
      {/* achtergrond */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[#ffe600]/[0.12] top-[-180px] left-[-140px]" />
        <div
          className="aurora w-[36rem] h-[36rem] bg-white/[0.06] bottom-[-160px] right-[-120px]"
          style={{ animationDelay: "-9s" }}
        />
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size={38} />
          <span className="text-lg font-bold tracking-tight font-display">
            Apex Routes
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link
            href="/kalender"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex items-center gap-2"
          >
            Kalender
          </Link>
          <Link
            href="/ritbank"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex items-center gap-2"
          >
            Ritbank
          </Link>
          <Link
            href="/forum"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Forum
          </Link>
          <LangSwitch className="hidden sm:flex" />
          <Link
            href="/"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Naar de planner</span>
          </Link>
          <button
            onClick={() => openInPlanner("mooie rondrit van 100 km, verras me")}
            className="btn-brand px-4 py-2 rounded font-semibold text-sm"
          >
            Naar de planner
          </button>
        </div>
      </nav>
      <LangNotice />

      {/* hero */}
      <section id="apex-main" className="relative z-10 px-6 pt-16 pb-10 max-w-4xl mx-auto text-center">
        <span className="eyebrow block mb-3">ATLAS /</span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] font-display mb-5">
          Ontdek <span className="text-gradient">rijdende routes</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-[16px] leading-relaxed">
          Top-10 per land, mooie ritten naar circuits en de rally&apos;s waar
          routebestanden officieel te halen zijn. Elke kaart opent met één klik
          als echte, navigeerbare route in de planner.
        </p>
      </section>

      {/* land-tabs + top-10 */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              aria-pressed={country === c.id}
              className={`glass rounded px-4 py-2.5 text-sm font-semibold border transition-all while-hover-scale ${
                country === c.id
                  ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
                  : "border-white/10 text-slate-300 hover:border-white/25"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="text-center text-slate-500 text-[14px] mb-8 max-w-xl mx-auto">
          {active.intro}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.routes.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
              className="h-full"
            >
              <TiltCard className="h-full">
              <div className="relative h-full overflow-hidden lux-card flex flex-col">
              <Image
                src={r.img}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/75 to-[#050507]/10" />
              <div className="relative flex flex-col flex-1 p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold text-yellow-400/90 font-mono">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {r.region}
                </span>
              </div>
              <h3 className="font-display font-bold text-[17px] leading-snug">
                {r.name}
              </h3>
              <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed flex-1">
                {r.blurb}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="glass rounded px-2.5 py-1 text-[11px] border border-white/10 flex items-center gap-1">
                  <RouteIcon className="w-3 h-3 text-yellow-400/80" /> {r.km} km
                </span>
                <span className="glass rounded px-2.5 py-1 text-[11px] border border-white/10 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-yellow-400/80" /> ≈ {r.hm} hm
                </span>
                {r.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="glass rounded px-2.5 py-1 text-[11px] border border-white/10 text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => openInPlanner(r.prompt)}
                className="btn-brand btn-shine mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-[14px]"
              >
                <Play className="w-3.5 h-3.5" />
                Open in planner
              </button>
              </div>
              </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* bucketlist */}
      <section className="relative z-10 px-4 sm:px-6 py-14 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Bucketlist />
        </motion.div>
      </section>

      {/* circuits */}
      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-6xl mx-auto border-t border-white/[0.07]">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[13px] text-slate-300 mb-5 border border-white/10">
            Ritten naar het circuit
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight font-display">
            Mooi rijden naar <span className="text-gradient">groene hellen</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-[15px]">
            &quot;Wil je naar Circuit Zolder?&quot; — rij er dan mooi naartoe.
            Onderweg zet je de POI-laag aan voor koffietjes, (alcoholvrije)
            biertjes en korte wandelingen, gemarkeerd op de kaart.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CIRCUITS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
              className="h-full"
            >
              <TiltCard className="h-full">
              <div className="relative h-full overflow-hidden lux-card flex flex-col">
              <Image
                src={c.img}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/78 to-[#050507]/15" />
              <div className="relative flex flex-col flex-1 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="w-10 h-10 rounded glass border border-yellow-400/20 flex items-center justify-center" aria-hidden>
                  <MapPin className="w-5 h-5 text-yellow-300" />
                </span>
                <span className="glass rounded px-2.5 py-1 text-[11px] border border-white/10 flex items-center gap-1">
                  <RouteIcon className="w-3 h-3 text-yellow-400/80" /> ≈ {c.km} km
                </span>
              </div>
              <h3 className="font-display font-bold text-[17px]">{c.name}</h3>
              <p className="text-[12px] text-slate-500 mb-2">{c.place}</p>
              <p className="text-[13px] text-slate-400 leading-relaxed flex-1">
                {c.blurb}
              </p>
              <button
                onClick={() => openInPlanner(c.prompt)}
                className="btn-brand btn-shine mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-[14px]"
              >
                <Play className="w-3.5 h-3.5" />
                Rij er mooi naartoe
              </button>
              </div>
              </div>
              </TiltCard>
            </motion.div>
          ))}

          {/* stop-tips */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded border border-yellow-400/25 p-5 flex flex-col"
          >
            <h3 className="font-display font-bold text-[15px] mb-3 flex items-center gap-2">
              Leuke stopjes onderweg
            </h3>
            <ul className="space-y-3 flex-1">
              {STOP_TIPS.map((t) => (
                <li key={t.label} className="flex items-start gap-2.5">
                  <t.icon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold">{t.label}</p>
                    <p className="text-[12px] text-slate-500 leading-snug">
                      {t.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* evenementen */}
      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-4xl mx-auto border-t border-white/[0.07]">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[13px] text-slate-300 mb-5 border border-white/10">
            Rally&apos;s &amp; evenementen
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight font-display">
            Routes van StreetGasm &amp; co
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-[14px] leading-relaxed">
            Deze organisaties publiceren hun GPX zelf, voor deelnemers. Wij
            kopiëren die routes niet — download ze bij de bron en{" "}
            <b className="text-yellow-300">sleep het bestand in Apex</b>: alle
            formaten (GPX/KML/TCX/FIT) worden meteen navigeerbare routes met
            afslaginstructies. Bron en eer: de organisatie.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {RALLY_EVENTS.map((e) => (
            <a
              key={e.id}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded border border-white/10 p-5 hover:border-yellow-400/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-bold text-[16px]">{e.name}</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                {e.what}
              </p>
              <p className="text-[11px] text-slate-600 mt-2 truncate">
                {e.url.replace("https://", "").replace("http://", "")}
              </p>
            </a>
          ))}
        </div>
        <p className="text-[12px] text-slate-600 mt-6 text-center leading-relaxed">
          {DISCOVER_FOOTER}
        </p>
        <p className="text-[12px] text-slate-500 mt-3">
          Steun Apex — je bijdrage helpt routingcapaciteit, datakwaliteit en routeonderzoek betalen.{" "}
          <Link href="/prijzen" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
      </section>

      {/* slot */}
      <section className="relative z-10 px-6 pb-20 pt-4 max-w-3xl mx-auto text-center">
        <button
          onClick={() => openInPlanner("mooie rondrit van 100 km, verras me")}
          className="btn-brand btn-shine inline-flex items-center gap-2 px-8 py-4 rounded font-semibold text-lg while-hover-scale"
        >
          Nu zelf een route bouwen
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
}
