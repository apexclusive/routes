"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  ArrowUpRight,
  CalendarPlus,
  CalendarDays,
  Flag,
  Bike,
  PersonStanding,
  Footprints,
  Route as RouteIcon,
  Users,
  Newspaper,
  Megaphone,
  Ticket,
  Radio,
  Search,
} from "lucide-react";
import ScrollProgress from "./ScrollProgress";
import { downloadIcs, downloadIcsBundle } from "@/lib/ical";
import type { FeedEvent } from "@/lib/eventsfeed";
import SkipLink from "./SkipLink";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import TiltCard from "./TiltCard";
import Poll from "./Poll";
import LangSwitch, { LangNotice } from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import { EVENTS, eventsForYear, EVENT_CATS, MONTHS_NL, NEWS, type EventCat,
  type EventCountry,
} from "@/lib/calendar";

const CAT_ICONS: Record<EventCat, typeof Flag> = {
  track: Flag,
  mtb: Bike,
  loop: PersonStanding,
  wandel: Footprints,
  cyclo: RouteIcon,
  meet: Users,
  rally: Megaphone,
};

const LANDEN: { id: EventCountry | "alle"; label: string }[] = [
  { id: "alle", label: "Alle landen" },
  { id: "NL", label: "Nederland" },
  { id: "BE", label: "België" },
  { id: "LU", label: "Luxemburg" },
  { id: "DE", label: "Duitsland" },
  { id: "FR", label: "Frankrijk" },
];

export default function Kalender() {
  const [cat, setCat] = useState<EventCat | "alle">("alle");
  const [month, setMonth] = useState<number | "alle">("alle");
  const [land, setLand] = useState<EventCountry | "alle">("alle");
  const [jaar, setJaar] = useState<2026 | 2027>(2026);
  const [zoek, setZoek] = useState("");
  // live-feeds: automatische updates + afgelastingen
  const [live, setLive] = useState<{
    fetchedAt: string;
    sources: { id: string; label: string; ok: boolean; count: number }[];
    events: FeedEvent[];
  } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setLive(d))
      .catch(() => alive && setLive(null));
    return () => {
      alive = false;
    };
  }, []);
  const huidigeMaand = new Date().getMonth() + 1;

  const bron = eventsForYear(jaar);
  const deelnemers = bron.filter((e) => e.audience === "deelnemer");
  const toeschouwers = bron.filter((e) => e.audience === "toeschouwer");
  const q = zoek.trim().toLowerCase();
  const matched = (t: { name: string; place: string }) =>
    !q || t.name.toLowerCase().includes(q) || t.place.toLowerCase().includes(q);
  const visible = deelnemers.filter(
    (e) =>
      (cat === "alle" || e.cat === cat) &&
      (month === "alle" || e.month === month) &&
      (land === "alle" || e.country === land) &&
      matched(e)
  ).sort((a, b) => a.month - b.month || a.name.localeCompare(b.name));
  const toeschouwersVisible = toeschouwers.filter(
    (e) =>
      (cat === "alle" || e.cat === cat) &&
      (month === "alle" || e.month === month) &&
      (land === "alle" || e.country === land) &&
      matched(e)
  );

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[var(--accent)]/[0.12] top-[-180px] right-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={38} />
          <span className="text-lg font-bold tracking-tight font-display">
            Apex Kalender
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/advies" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Advisor
          </Link>
          <Link href="/ritbank" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Ritbank
          </Link>
          <Link href="/forum" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Forum
          </Link>
          <Link href="/checklist" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden lg:flex">
            Checklist
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

      {/* hero met circuit-beeld */}
      <section id="apex-main" className="relative z-10 px-4 sm:px-6 pt-10 pb-12 max-w-6xl mx-auto">
        <div className="relative h-64 sm:h-80 rounded overflow-hidden lux-card">
          <Image
            src="/routescapes/circuit-night.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--base)] via-[var(--base)]/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded text-[12px] text-slate-300 mb-4 border border-white/10">
              <CalendarDays className="w-3.5 h-3.5 text-yellow-400" />
              Klik wat je wilt meemaken
            </span>
            <span className="eyebrow block mb-2">KALENDER /</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] font-display">
              Het jaar op <span className="text-gradient">een pagina</span>
            </h1>
            <p className="text-slate-300/90 text-[14px] mt-2 max-w-xl">
              Baanrijden op de Nordschleife, MTB-festivals, marathons, de
              Vierdaagse en cyclo&apos;s — filter op maand of soort en plan eromheen.
            </p>
          </div>
        </div>
      </section>

      {/* filters */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {([2026, 2027] as const).map((j) => (
          <button
            key={j}
            onClick={() => setJaar(j)}
            aria-pressed={jaar === j}
            className={`px-4 py-1.5 rounded text-[13px] font-bold font-mono ${
              jaar === j ? "bg-yellow-400 text-black" : "glass border border-white/10 text-slate-400"
            }`}
          >
            {j}
          </button>
        ))}
        <span className="text-[11px] text-slate-500 self-center ml-1">
          {jaar === 2027 ? "seizoensverwachting · nog niet bevestigd" : "seizoen 2026"}
        </span>
        <div className="relative basis-full sm:basis-auto sm:flex-1 min-w-[180px] sm:ml-2 mt-1 sm:mt-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            aria-hidden
          />
          <input
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setZoek("");
            }}
            placeholder="Zoek events of plaatsen..."
            aria-label="Zoek events of plaatsen"
            className="w-full h-9 glass rounded border border-white/10 pl-9 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>
      </div>
      <section className="relative z-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <button
            onClick={() => setCat("alle")}
            aria-pressed={cat === "alle"}
            className={`px-3.5 py-2 rounded text-[13px] font-semibold ${
              cat === "alle" ? "bg-yellow-400 text-black" : "glass border border-white/10 text-slate-300"
            }`}
          >
            Alles
          </button>
          {EVENT_CATS.map((c) => {
            const Icon = CAT_ICONS[c.id];
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={`px-3.5 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5 ${
                  cat === c.id
                    ? "bg-yellow-400 text-black"
                    : "glass border border-white/10 text-slate-300 hover:border-white/25"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setMonth("alle")}
            aria-pressed={month === "alle"}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold shrink-0 ${
              month === "alle" ? "bg-white/15 text-white" : "text-slate-500 hover:bg-white/10"
            }`}
          >
            hele jaar
          </button>
          <button
            onClick={() => {
              setMonth(huidigeMaand);
              document
                .getElementById(`maand-${huidigeMaand}`)
                ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
            className="px-3 py-1.5 rounded text-[12px] font-semibold shrink-0 flex items-center gap-1.5 text-yellow-300/90 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors"
            title="Spring naar de huidige maand"
          >
            <CalendarClock className="w-3.5 h-3.5" aria-hidden />
            nu
          </button>
          {MONTHS_NL.map((m, i) => (
            <button
              key={m}
              id={`maand-${i + 1}`}
              onClick={() => setMonth(i + 1)}
              aria-pressed={month === i + 1}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold shrink-0 ${
                month === i + 1 ? "bg-white/15 text-white" : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {m}
              {i + 1 === huidigeMaand && (
                <span
                  className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block ml-1.5 align-middle"
                  aria-hidden
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {LANDEN.map((l) => {
            const n =
              l.id === "alle"
                ? bron.length
                : bron.filter((e) => e.country === l.id).length;
            return (
              <button
                key={l.id}
                onClick={() => setLand(l.id)}
                aria-pressed={land === l.id}
                className={`px-3 py-1.5 rounded text-[12px] font-semibold flex items-center gap-1.5 ${
                  land === l.id
                    ? "bg-white/15 text-white"
                    : "text-slate-500 hover:bg-white/10"
                }`}
              >
                {l.label}
                <span className="font-mono text-[10px] text-slate-600">{n}</span>
              </button>
            );
          })}
        </div>
        {jaar === 2027 && (
          <p className="mt-3 glass rounded border border-amber-400/25 px-3.5 py-2.5 text-[12px] text-amber-100/80 leading-relaxed" role="status">
            <b className="text-amber-200">Voorlopige seizoensspiegel:</b> deze evenementen keren doorgaans terug, maar 2027-data en tickets zijn nog niet bevestigd. Controleer altijd de gelinkte organisator vóór je accommodatie of vervoer boekt.
          </p>
        )}
      </section>

      {/* events */}
      <section className="relative z-10 px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        <p className="text-[12px] text-slate-500 mb-5">
          {jaar} · {visible.length + toeschouwersVisible.length} event{(visible.length + toeschouwersVisible.length) === 1 ? "" : "s"}
          {land !== "alle" && ` · ${LANDEN.find((l) => l.id === land)?.label}`}
          {month !== "alle" && ` · ${MONTHS_NL[month - 1]}`}
          {cat !== "alle" && ` · ${EVENT_CATS.find((c) => c.id === cat)?.label}`}
          {" "}· chronologisch · data op maandniveau — check altijd de site van de organisator
          {(visible.length > 0 || toeschouwersVisible.length > 0) && (
            <button
              onClick={() => downloadIcsBundle([...visible, ...toeschouwersVisible], { year: jaar })}
              className="ml-3 px-3 py-1 rounded text-[11px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors"
              title="Zet deze selectie in één keer in je agenda (.ics)"
            >
              <CalendarPlus className="w-3 h-3 inline -mt-0.5 mr-1" aria-hidden />
              Alles naar mijn agenda
            </button>
          )}
        </p>
        {toeschouwersVisible.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-3.5">
              <Ticket className="w-4 h-4 text-yellow-300" aria-hidden />
              <h3 className="font-display font-bold text-[14px] uppercase tracking-[0.18em] text-yellow-300">
                Kaartjes & pro-racing · kijken in plaats van meedoen
              </h3>
              <span className="font-mono text-[11px] text-slate-500">{toeschouwersVisible.length}</span>
              <div className="flex-1 h-px bg-white/10" aria-hidden />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {toeschouwersVisible.map((e, i) => (
                <motion.a
                  key={e.id}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="Eventlink geopend"
                  data-track-audience="toeschouwer"
                  data-track-country={e.country}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2) }}
                  className="h-full flex group"
                >
                  <div className="h-full lux-card p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-display font-bold text-2xl leading-none text-yellow-300">
                        {MONTHS_NL[e.month - 1].toUpperCase()}
                      </p>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1">
                      {e.place} · {e.period}
                    </p>
                    {e.dateStatus === "expected" && (
                      <span className="self-start text-[9px] font-bold uppercase tracking-widest text-amber-200 border border-amber-400/25 rounded px-1.5 py-0.5 mb-2">verwacht</span>
                    )}
                    <h3 className="font-display font-bold text-[16px] leading-snug mb-2">{e.name}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed flex-1">{e.what}</p>
                    <p className="text-[11px] text-yellow-400/80 mt-3 pt-3 border-t border-white/[0.07]">
                      {e.access}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 mt-3">
              Kaartverkoop loopt via de organisator — Apex Routes verwijst door. (Eigen ticketverkoop: op de roadmap.)
            </p>
          </div>
        )}

        {/* live-feeds: automatische updates, afgelastingen direct zichtbaar */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-3.5">
            <Radio className="w-4 h-4 text-yellow-300" aria-hidden />
            <h3 className="font-display font-bold text-[14px] uppercase tracking-[0.18em] text-yellow-300">
              Live-agenda · automatische feeds
            </h3>
            <div className="flex-1 h-px bg-white/10" aria-hidden />
          </div>
          {!live ? (
            <p className="text-[13px] text-slate-500">
              Live-feeds laden... (of zijn even onbereikbaar — de basisagenda hierboven geldt altijd)
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {live.sources.map((src) => (
                  <span
                    key={src.id}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                      src.ok
                        ? "border-white/10 text-slate-300"
                        : "border-orange-400/30 text-orange-300/90 bg-orange-400/[0.06]"
                    }`}
                  >
                    {src.label}
                    <span className="font-mono text-[10px] text-slate-500 ml-1.5">
                      {src.ok ? `${src.count} sessions` : "onbereikbaar"}
                    </span>
                  </span>
                ))}
              </div>
              {live.events.length > 0 ? (
                <ul className="glass rounded border border-white/10 divide-y divide-white/5">
                  {live.events.slice(0, 24).map((e) => (
                    <li
                      key={`${e.source}-${e.uid}`}
                      className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-2.5 ${
                        e.cancelled ? "opacity-70" : ""
                      }`}
                    >
                      <span className="font-mono text-[12px] text-yellow-300/90 shrink-0">
                        {new Date(e.start).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span
                        className={`text-[13px] ${
                          e.cancelled ? "text-slate-500 line-through decoration-red-400/60" : "text-slate-200"
                        }`}
                      >
                        {e.title}
                      </span>
                      {e.location && (
                        <span className="text-[11px] text-slate-500 truncate">{e.location}</span>
                      )}
                      {e.cancelled && (
                        <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-red-300 border border-red-400/40 bg-red-400/10 shrink-0">
                          Afgelast — via feed
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-slate-500">
                  Geen aankomende feed-events gevonden — de basisagenda hierboven geldt.
                </p>
              )}
              <p className="text-[11px] text-slate-600 mt-3">
                Automatisch bijgewerkt via openbare iCal-feeds (F1/WEC/WRC 2026); afgelastingen en
                datumwijzigingen verschijnen hier direct — laatst gecheckt{" "}
                {new Date(live.fetchedAt).toLocaleTimeString("nl-NL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                . Meer feeds (MotoGP, kalenders van NL- en BE-organisatoren) volgen zodra ze gepubliceerd worden.
              </p>
            </>
          )}
        </div>
        {visible.length === 0 && toeschouwersVisible.length === 0 && (
          <div className="glass rounded border border-white/10 p-10 text-center mb-5">
            <p className="font-display font-bold text-lg">Niets in deze combinatie</p>
            <p className="text-slate-500 text-[13px] mt-1">
              Probeer een andere maand of soort — het hele jaar heeft altijd wel iets.
            </p>
          </div>
        )}
        {(month === "alle"
          ? Array.from({ length: 12 }, (_, i) => i + 1)
              .map((m) => ({ m, events: visible.filter((e) => e.month === m) }))
              .filter((g) => g.events.length > 0)
          : [{ m: month as number, events: visible }]
        ).map((g) => (
          <div key={g.m} className="mb-9">
            <div className="flex items-center gap-3 mb-3.5">
              <h3 className="font-display font-bold text-[14px] uppercase tracking-[0.18em] text-yellow-300">
                {MONTHS_NL[g.m - 1]}
              </h3>
              <span className="font-mono text-[11px] text-slate-500">{g.events.length}</span>
              <div className="flex-1 h-px bg-white/10" aria-hidden />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.events.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2) }}
              className="h-full flex flex-col"
            >
            <motion.a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              data-track="Eventlink geopend"
              data-track-audience="deelnemer"
              data-track-category={e.cat}
              data-track-country={e.country}
              className="h-full flex"
            >
              <TiltCard className="h-full" maxTilt={5}>
                <div className="h-full lux-card p-5 flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-center shrink-0">
                      <p className="font-display font-bold text-2xl leading-none text-yellow-300">
                        {MONTHS_NL[e.month - 1].toUpperCase()}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mt-1">
                        {e.period}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">
                    {e.place} · {EVENT_CATS.find((c) => c.id === e.cat)?.label}
                  </p>
                  {e.dateStatus === "expected" && (
                    <span className="self-start text-[9px] font-bold uppercase tracking-widest text-amber-200 border border-amber-400/25 rounded px-1.5 py-0.5 mb-2">verwacht · niet bevestigd</span>
                  )}
                  <h3 className="font-display font-bold text-[16px] leading-snug mb-2">
                    {e.name}
                  </h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed flex-1">
                    {e.what}
                  </p>
                  <p className="text-[11px] text-yellow-400/80 mt-3 pt-3 border-t border-white/[0.07]">
                    {e.access}
                  </p>
                </div>
              </TiltCard>
            </motion.a>
              {e.dateStatus !== "expected" && (
                <button
                  onClick={() => downloadIcs(e)}
                  title="Herinnering in je agenda (midmaand-indicator) — exacte datum via de organisator"
                  className="mt-2 glass rounded px-3 py-2 text-[12px] font-semibold text-slate-300 hover:text-yellow-300 hover:border-yellow-400/40 transition-colors flex items-center gap-1.5 self-start"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  In mijn agenda
                </button>
              )}
            </motion.div>
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-center text-slate-500 text-[14px] py-10">
            Niets in deze combinatie — probeer een andere maand of categorie.
          </p>
        )}
      </section>

      {/* nieuws + poll */}
      <section className="relative z-10 px-4 sm:px-6 py-12 max-w-6xl mx-auto border-t border-white/[0.07]">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-3">
          <div>
            <h2 className="font-display font-bold text-2xl mb-1 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-yellow-400" />
              Apex Nieuws
            </h2>
            <p className="text-[13px] text-slate-500 mb-5">
              Wat er net live is en wat de redactie schreef.
            </p>
            <div className="space-y-2.5">
              {NEWS.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  className="block lux-card p-4.5 px-5 py-4 group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-yellow-400/90">
                      {n.tag}
                    </span>
                    <span className="text-[11px] text-slate-600">{n.date}</span>
                  </div>
                  <p className="font-semibold text-[15px] group-hover:text-yellow-300 transition-colors">
                    {n.title}
                  </p>
                  <p className="text-[13px] text-slate-400 leading-relaxed mt-1">
                    {n.text}
                  </p>
                  <p className="text-[12px] text-yellow-400/90 mt-2 font-semibold">
                    {n.hrefLabel} →
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative h-44 rounded-[24px] overflow-hidden">
              <Image
                src="/routescapes/marathon.jpg"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <Poll
              id="kalender-2026"
              question="Wat staat bovenaan je 2027-lijst?"
              options={["Nordschleife-ronde", "Vierdaagse", "Berlin Marathon", "B500"]}
            />
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-10 border-t border-white/[0.07] text-center">
        <p className="text-[12px] text-slate-600 max-w-lg mx-auto leading-relaxed">
          Events samengesteld op maandniveau; data en prijzen wisselen per editie —
          de site van de organisatie is altijd de bron.
        </p>
        <p className="text-[12px] text-slate-500 mt-3">
          Steun Apex — je bijdrage helpt routingcapaciteit, datakwaliteit en routeonderzoek betalen.{" "}
          <Link href="/prijzen" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
      </footer>
    </div>
  );
}
