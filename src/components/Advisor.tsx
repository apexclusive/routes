"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Cable,
  Camera,
  MapPinned,
  Mountain,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
  Motorbike, Bike, Footprints, Smartphone, Car,
} from "lucide-react";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import TiltCard from "./TiltCard";
import Poll from "./Poll";
import LangSwitch, { LangNotice } from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import { plannerUrl, setPendingPrompt } from "@/lib/filehandoff";
import {
  DESTINATIONS,
  CLIMBS,
  NL_HIGH_FACTS,
  SAFETY_TIPS,
  EMERGENCY_NUMBERS,
  BREAKDOWN_TIPS,
  HOTEL_TIPS,
  APP_TIPS,
  MEET_EVENTS,
  ADVISOR_FOOTER,
  APP_GUIDE,
} from "@/lib/advisor";
import { PROVINCES, TOP10_NL, AIR_EXPERIENCES } from "@/lib/nl";

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "bestemmingen", label: "Bestemmingen", icon: MapPinned },
  { id: "klimmen", label: "Klimmen & hoogtes", icon: Mountain },
  { id: "toertips", label: "Toertips & veiligheid", icon: ShieldCheck },
  { id: "pech", label: "Pech & alarm", icon: PhoneCall },
  { id: "hotels", label: "Slapen & apps", icon: Sparkles },
  { id: "meets", label: "Meetings & events", icon: Camera },
  { id: "provincies", label: "NL per provincie", icon: MapPinned },
  { id: "lucht", label: "Door de lucht", icon: Sparkles },
  { id: "apps", label: "App-keuze", icon: Cable },
];

export default function Advisor() {
  const router = useRouter();
  const [active, setActive] = useState(SECTIONS[0].id);

  const openRoute = (prompt: string) => {
    setPendingPrompt(prompt);
    router.push(plannerUrl(prompt));
  };

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[var(--accent)]/[0.11] top-[-180px] left-[-140px]" />
        <div
          className="aurora w-[34rem] h-[34rem] bg-white/[0.05] bottom-[-160px] right-[-120px]"
          style={{ animationDelay: "-11s" }}
        />
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={38} />
          <span className="text-lg font-bold tracking-tight font-display">
            Apex Advisor
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link
            href="/ontdek"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Route-atlas
          </Link>
          <Link
            href="/kalender"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Kalender
          </Link>
          <Link
            href="/ritbank"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Ritbank
          </Link>
          <Link
            href="/forum"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Forum
          </Link>
          <Link
            href="/checklist"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden lg:flex"
          >
            Checklist
          </Link>
          <ThemeSwitch />
          <LangSwitch className="hidden sm:flex" />
          <Link
            href="/"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Naar de planner</span>
          </Link>
        </div>
      </nav>
      <LangNotice />

      {/* hero */}
      <section id="apex-main" className="relative z-10 px-6 pt-16 pb-12 max-w-4xl mx-auto text-center">
        <span className="eyebrow block mb-3">ADVIES /</span>
        <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[12px] text-slate-300 mb-6 border border-white/10">
          <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
          De kennisbank voor onderweg
        </span>
        <h1 className="text-[2.6rem] leading-[1.04] sm:text-6xl font-bold tracking-[-0.03em] font-display mb-5">
          Weet waar je rijdt.
          <br />
          <span className="text-gradient">En waarom het mooi is.</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-[15px] leading-relaxed">
          Geschiedenis van de grote routes, de scherpste klimmen van Nederland,
          banden- en pechkennis voor onderweg, en de meetings waar het vak zit.
          Geschreven voor rijders en wandelaars die weten wat ze doen.
        </p>
      </section>

      {/* inhoud */}
      <nav className="sticky top-20 z-30 px-4 sm:px-6 pb-4 max-w-6xl mx-auto hidden md:block print:hidden">
        <div className="glass rounded-[22px] border border-white/10 px-2 py-2 flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setActive(s.id)}
              className={`px-3.5 py-2 rounded text-[13px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                active === s.id ? "bg-yellow-400 text-black" : "text-slate-400 hover:bg-white/10"
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* bestemmingen */}
      <section id="bestemmingen" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            01 — Bestemmingen
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Vijf plekken met een verhaal
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-3">
          {DESTINATIONS.map((d, i) => (
            <motion.article
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.25) }}
              className={i === 0 ? "md:col-span-2" : ""}
            >
              <TiltCard className="h-full" maxTilt={4}>
                <div className="relative h-full overflow-hidden lux-card flex flex-col md:flex-row">
                  <div className={`relative ${i === 0 ? "md:w-1/2 h-56 md:h-auto" : "h-44 md:h-auto md:w-2/5"} shrink-0`}>
                    <Image
                      priority
                      src={d.img}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--base)]/70 md:to-[var(--base)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)]/80 to-transparent md:hidden" />
                  </div>
                  <div className="relative p-6 flex flex-col flex-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-400/90 font-bold mb-1.5">
                      {d.region}
                    </p>
                    <h3 className="font-display font-bold text-xl leading-snug mb-2">
                      {d.name}
                    </h3>
                    <p className="text-[14px] text-slate-400 leading-relaxed mb-4">
                      {d.intro}
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {d.facts.map((f) => (
                        <li key={f.slice(0, 24)} className="text-[13px] text-slate-300 leading-snug flex gap-2">
                          <span className="text-yellow-400/80 shrink-0 mt-0.5">—</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                      Onderweg
                    </p>
                    <ul className="space-y-1.5 mb-5">
                      {d.tips.map((t) => (
                        <li key={t.slice(0, 24)} className="text-[13px] text-slate-400 leading-snug flex gap-2">
                          <span className="text-slate-600 shrink-0 mt-0.5">·</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => openRoute(d.prompt)}
                        className="btn-brand btn-shine px-4 py-2.5 rounded text-[13px] font-semibold"
                      >
                        Rij erheen
                      </button>
                      <div className="flex gap-2 flex-wrap">
                        {d.sources.map((src) => (
                          <a
                            key={src.url}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-500 hover:text-yellow-400 underline underline-offset-2 transition-colors"
                          >
                            {src.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.article>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <Poll
            id="advies-bestemming"
            question="Waar staat jouw volgende rit gepland?"
            options={["Mergelland", "Ardennen", "Eifel", "Zwarte Woud"]}
          />
          <div className="lux-card p-6">
            <h3 className="font-display font-bold text-[16px] mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-yellow-400" />
              Waarom een Advisor en geen advertentiepolder
            </h3>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Geen betaalde plaatsingen, geen &quot;partnerbadges&quot;. Wij schrijven over
              plekken omdat ze het waard zijn — bronnen staan er altijd bij, en
              wie het niet met ons eens is, mag het op de Ritbank komen zeggen.
            </p>
          </div>
        </div>
      </section>

      {/* klimmen */}
      <section id="klimmen" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            02 — Klimmen & hoogtes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Hoe steil kan Nederland zijn?
          </h2>
          <p className="text-slate-500 text-[14px] mt-2 max-w-2xl">
            Voor wielrenners en wie een gearing zoekt: de bekende cijfers van de
            zwaarste beklimmingen van het land.
          </p>
        </header>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-3">
          <div className="lux-card p-2 sm:p-4 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-2 font-bold">Beklimming</th>
                  <th className="px-2 py-2 font-bold">Lengte</th>
                  <th className="px-2 py-2 font-bold">Hoogte</th>
                  <th className="px-2 py-2 font-bold">Gem.</th>
                  <th className="px-2 py-2 font-bold">Max</th>
                </tr>
              </thead>
              <tbody>
                {CLIMBS.map((c) => (
                  <tr key={c.name} className="border-t border-white/[0.06]">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.note}</p>
                    </td>
                    <td className="px-2 py-2.5 tabular-nums text-slate-400 whitespace-nowrap">
                      {(c.lengthM / 1000).toFixed(1)} km
                    </td>
                    <td className="px-2 py-2.5 tabular-nums text-slate-400 whitespace-nowrap">
                      {c.heightM} m
                    </td>
                    <td className="px-2 py-2.5 tabular-nums whitespace-nowrap">{c.avgPct}%</td>
                    <td className="px-2 py-2.5 tabular-nums text-yellow-300 whitespace-nowrap font-semibold">
                      {c.maxPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-slate-600 px-3 py-2">
              Cijfers uit openbare klimdatabases — kan per meting licht verschillen.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative h-44 rounded-[24px] overflow-hidden shrink-0">
              <Image
                src="/routescapes/cyclist-climb.jpg"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)] to-transparent" />
            </div>
            <div className="lux-card p-5">
              <ul className="space-y-2">
                {NL_HIGH_FACTS.map((f) => (
                  <li key={f.slice(0, 20)} className="text-[13px] text-slate-300 leading-snug flex gap-2">
                    <span className="text-yellow-400/80 shrink-0 mt-0.5">—</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Poll
              compact
              id="advies-klim"
              question="Welke klim moet écht in je leven?"
              options={["Cauberg", "Eyserbosweg", "Vaalserberg", "Camerig"]}
            />
          </div>
        </div>
      </section>

      {/* toertips */}
      <section id="toertips" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            03 — Toertips & veiligheid
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            De check vóór de sleutel omgaat
          </h2>
        </header>

        <div className="grid md:grid-cols-[1fr_1.3fr] gap-3">
          <div className="relative h-52 md:h-auto rounded-[24px] overflow-hidden min-h-52">
            <Image
              src="/routescapes/tire-check.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)]/85 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[13px] text-slate-300 leading-snug">
                <b className="text-yellow-300">DOT-code.</b> Vier cijfers op de
                zijkant: week + jaar. 2319 = week 23 van 2019.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {SAFETY_TIPS.map((block) => (
              <div key={block.id} className="lux-card p-5">
                <h3 className="font-display font-bold text-[16px] mb-3">{block.title}</h3>
                <ul className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item.slice(0, 24)} className="text-[13px] text-slate-300 leading-relaxed flex gap-2">
                      <span className="text-yellow-400/80 shrink-0 mt-0.5">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pech */}
      <section id="pech" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            04 — Pech & alarm
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Stilstand boven de grens
          </h2>
        </header>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-3">
          <div className="lux-card p-2 sm:p-4">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-2 font-bold">Situatie</th>
                  <th className="px-2 py-2 font-bold">Nummer</th>
                </tr>
              </thead>
              <tbody>
                {EMERGENCY_NUMBERS.map((e) => (
                  <tr key={e.situation} className="border-t border-white/[0.06]">
                    <td className="px-3 py-3">
                      <p className="font-semibold">{e.situation}</p>
                      <p className="text-[12px] text-slate-500 leading-snug">{e.note}</p>
                    </td>
                    <td className="px-2 py-3 tabular-nums font-bold text-yellow-300 whitespace-nowrap">
                      {e.number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-slate-600 px-3 py-2">
              Nummers kunnen wijzigen — bewaar ze vóór vertrek offline in je telefoon.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative h-40 rounded-[24px] overflow-hidden shrink-0">
              <Image
                src="/routescapes/pech.jpg"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="lux-card p-5">
              <h3 className="font-display font-bold text-[16px] mb-3">
                Afgesleept in het buitenland — het protocol
              </h3>
              <ul className="space-y-2">
                {BREAKDOWN_TIPS.map((t) => (
                  <li key={t.slice(0, 24)} className="text-[13px] text-slate-300 leading-relaxed flex gap-2">
                    <span className="text-yellow-400/80 shrink-0 mt-0.5">—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* hotels + apps */}
      <section id="hotels" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            05 — Slapen & apps
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Waar de nacht begint
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="relative rounded-[24px] overflow-hidden min-h-56">
            <Image
              src="/routescapes/hotel-evening.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)]/90 via-transparent to-transparent" />
          </div>
          <div className="lux-card p-6">
            <h3 className="font-display font-bold text-[16px] mb-3">Hotelkeuze die morgen beter maakt</h3>
            <ul className="space-y-2">
              {HOTEL_TIPS.map((t) => (
                <li key={t.slice(0, 24)} className="text-[13px] text-slate-300 leading-relaxed flex gap-2">
                  <span className="text-yellow-400/80 shrink-0 mt-0.5">—</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lux-card p-6 md:col-span-2">
            <h3 className="font-display font-bold text-[16px] mb-4 flex items-center gap-2">
              <Cable className="w-4 h-4 text-yellow-400" />
              Apps die een plek in je helm verdienen
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {APP_TIPS.map((a) => (
                <div key={a.name} className="glass rounded-[20px] border border-white/10 p-3.5">
                  <p className="text-[14px] font-semibold mb-1">{a.name}</p>
                  <p className="text-[12px] text-slate-400 leading-snug">{a.what}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* meets */}
      <section id="meets" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            06 — Meetings & events
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Waar het vak bij elkaar staat
          </h2>
          <p className="text-slate-500 text-[14px] mt-2 max-w-2xl">
            Terugkerende beurzen, rally&apos;s en raceweekenden in de Benelux en
            buurlanden. Data wisselen per editie — tik op de bron voor actuele
            data en aanmelding.
          </p>
        </header>

        <div className="relative h-48 sm:h-60 rounded-[24px] overflow-hidden mb-4">
          <Image
            src="/routescapes/carmeet.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)]/80 to-transparent" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MEET_EVENTS.map((e) => (
            <a
              key={e.id}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="spotlight-card lux-card p-5 flex flex-col group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[11px] uppercase tracking-[0.16em] text-yellow-400/90 font-bold">
                  {e.period}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-400 transition-colors shrink-0" />
              </div>
              <h3 className="font-display font-bold text-[16px] leading-snug mb-1">
                {e.name}
              </h3>
              <p className="text-[12px] text-slate-500 mb-2">{e.place}</p>
              <p className="text-[13px] text-slate-400 leading-relaxed flex-1">{e.what}</p>
              <p className="text-[11px] text-slate-600 mt-3">{e.free}</p>
            </a>
          ))}
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <Poll
            id="advies-meet"
            question="Waar zien we jou dit jaar?"
            options={["StreetGasm", "TT Assen", "InterClassics", "Zandvoort GP"]}
          />
          <div className="lux-card p-6 flex flex-col justify-center">
            <h3 className="font-display font-bold text-[16px] mb-2">
              Zelf een meeting op de kaart?
            </h3>
            <p className="text-[13px] text-slate-400 leading-relaxed mb-4">
              Organiseer je een terugkerende meet? Laat het weten via het
              feedback-bord — terugkerende events komen gratis in de kalender.
            </p>
            <Link href="/ritbank" className="btn-ghost px-4 py-2.5 rounded text-[13px] font-semibold self-start">
              Naar de Ritbank
            </Link>
          </div>
        </div>
      </section>

      {/* provincies + top10 */}
      <section id="provincies" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            07 — Nederland per provincie
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Twaalf provincies, twaalf redenen
          </h2>
        </header>

        <div className="relative h-44 sm:h-56 rounded-[24px] overflow-hidden mb-4">
          <Image
            src="/routescapes/wandeltrap.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)]/85 to-transparent" />
          <p className="absolute bottom-4 left-5 right-5 text-[13px] text-slate-300 leading-snug">
            <b className="text-yellow-300">De trap van Landgraaf.</b> 508 treden,
            248 meter lang, top ±225 m NAP — de langste trap van Nederland, en
            het bewijs dat &quot;vlak&quot; Nederland niet bestaat.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {PROVINCES.map((prov) => (
            <div key={prov.id} className="spotlight-card lux-card p-5 flex flex-col">
              <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-400/90 font-bold mb-1.5">
                {prov.name}
              </p>
              <h3 className="font-display font-bold text-[16px] leading-snug mb-2">
                {prov.highlight}
              </h3>
              <p className="text-[13px] text-slate-400 leading-relaxed flex-1">
                {prov.detail}
              </p>
              <button
                onClick={() => openRoute(prov.prompt)}
                className="btn-ghost mt-3 px-3.5 py-2 rounded text-[12px] font-semibold self-start"
              >
                Rij erheen →
              </button>
            </div>
          ))}
        </div>

        <div className="lux-card p-6">
          <h3 className="font-display font-bold text-lg mb-1">
            De must-have top-10 van Nederland
          </h3>
          <p className="text-[13px] text-slate-500 mb-5">
            Niet van een bureau — van rijders en wandelaars die het weten.
          </p>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
            {TOP10_NL.map((t, i) => (
              <li key={t.title} className="flex gap-3.5">
                <span className="font-display font-bold text-2xl text-yellow-400/80 leading-none w-8 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[14px] font-semibold">{t.title}</p>
                  <p className="text-[12px] text-slate-500 leading-snug">{t.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* lucht */}
      <section id="lucht" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            08 — Door de lucht
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Zelfs met een vliegtuigje
          </h2>
          <p className="text-slate-500 text-[14px] mt-2 max-w-2xl">
            De route hoeft niet te stoppen waar het asfalt ophoudt: rondvluchten,
            zweefvliegen en ballonvaart boven hetzelfde landschap.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_1.4fr] gap-3">
          <div className="relative rounded-[24px] overflow-hidden min-h-56">
            <Image
              src="/routescapes/balloon.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)]/70 to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {AIR_EXPERIENCES.map((a) => (
              <div key={a.name} className="lux-card p-5 flex flex-col">
                <p className="text-[11px] uppercase tracking-[0.16em] text-yellow-400/90 font-bold mb-1">
                  {a.place} · {a.season}
                </p>
                <h3 className="font-display font-bold text-[15px] mb-1.5">{a.name}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed flex-1">
                  {a.what}
                </p>
                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-yellow-400/90 hover:text-yellow-300 font-semibold mt-2.5"
                  >
                    Site bekijken →
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-600 mt-2.5">
                    Boek via een lokale aanbieder bij het veld.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* app-keuze */}
      <section id="apps" className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto scroll-mt-36 border-t border-white/[0.07]">
        <header className="mb-8">
          <p className="eyebrow mb-2">
            09 — Welke app wanneer
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Google Maps is niet overal koning
          </h2>
          <p className="text-slate-500 text-[14px] mt-2 max-w-2xl">
            In de auto wint Maps, op de motor Kurviger, te voet Komoot — en Apex
            levert aan ze allemaal aan. Onze export-knoppen doen het werk.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {APP_GUIDE.map((row) => (
            <div key={row.profile} className="spotlight-card lux-card p-5 flex flex-col">
              <p className="mb-2 h-6" aria-hidden>
                {row.icon === "motor" ? (
                  <Motorbike className="w-6 h-6 text-yellow-400" />
                ) : row.icon === "bike" ? (
                  <Bike className="w-6 h-6 text-yellow-400" />
                ) : row.icon === "hike" ? (
                  <Footprints className="w-6 h-6 text-yellow-400" />
                ) : row.icon === "phone" ? (
                  <Smartphone className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Car className="w-6 h-6 text-yellow-400" />
                )}
              </p>
              <h3 className="font-display font-bold text-[16px] mb-3">{row.profile}</h3>
              <ul className="space-y-2.5 flex-1">
                {row.picks.map((pick) => (
                  <li key={pick.name}>
                    <p className="text-[14px] font-semibold text-yellow-200/90">{pick.name}</p>
                    <p className="text-[12px] text-slate-400 leading-snug">{pick.why}</p>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-slate-500 mt-3 pt-3 border-t border-white/[0.07] leading-snug">
                <b className="text-yellow-400/90">Apex →</b> {row.apex}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 py-12 border-t border-white/[0.07] text-center">
        <p className="text-[12px] text-slate-600 max-w-xl mx-auto leading-relaxed">
          {ADVISOR_FOOTER}
        </p>
        <p className="text-[12px] text-slate-500 mt-3">
          Steun Apex — je bijdrage helpt routingcapaciteit, datakwaliteit en routeonderzoek betalen.{" "}
          <Link href="/prijzen" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
        <button
          onClick={() => openRoute("mooie rondrit van 100 km, verras me")}
          className="btn-brand btn-shine mt-6 px-8 py-4 rounded font-semibold text-lg while-hover-scale inline-flex items-center gap-2"
        >
          Nu zelf gaan rijden
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
