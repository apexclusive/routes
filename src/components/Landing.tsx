"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useScroll, useSpring, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Upload,
  Sparkles,
  Crown,
  Menu,
  X,
  Compass,
  CalendarDays,
  MessagesSquare,
  Archive,
  BookOpen,
  Route as RouteIcon,
  Timer,
  TrendingUp,
  Fuel,
  Dices,
  Link2,
  Navigation,
  CloudSun,
  Copy,
  Leaf,
  ArrowUpRight,
  MapPinned,
  FileDown,
  ClipboardCheck,
  Mountain,
  Megaphone,
  Route,
} from "lucide-react";
import Logo from "./Logo";
import SkipLink from "./SkipLink";
import RouletteWheel from "./RouletteWheel";
import ProDialog from "./ProDialog";
import Poll from "./Poll";
import RotwBand from "./RotwBand";
import LangSwitch from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import { LANDING, type Lang } from "@/lib/i18n";
import { ROUTE_FILE_EXTENSIONS, isRouteFileName } from "@/lib/routing";
import { PRO_PLANS } from "@/lib/pro";

const LandingMap = dynamic(() => import("./LandingMap"), { ssr: false });

const CORRIDORS = [
  "Mergellandroute",
  "Zwarte Woud",
  "Eifel",
  "Ardennen",
  "Vogezen",
  "Sauerland",
  "Müllerthal",
  "Veluwe",
  "Zeeland",
  "Franse Alpen",
];

/** Hoofdwoord dat meebeweegt in de kop. */
function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => window.clearInterval(t);
  }, [words.length]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[i]}
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
        transition={{ duration: 0.4 }}
        className="inline-block"
      >
        {words[i]}
      </motion.span>
    </AnimatePresence>
  );
}

/** Teller die optelt zodra hij in beeld is. */
function CountUp({
  to,
  suffix = "",
  duration = 1100,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const r = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(r);
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

/** Micro-visual per functie-kaart: geanimeerd, volwassen, licht van gewicht. */
function FeatureVisual({ kind }: { kind: string }) {
  if (kind === "chat")
    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="glass rounded rounded-bl-md px-3.5 py-2 text-[13px] text-slate-300 border border-white/10">
          &quot;rondrit Zuid-Limburg, 100 km&quot;
        </span>
        <span className="glass rounded px-3 py-2.5 border border-yellow-400/25 flex items-center gap-1">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="w-1.5 h-1.5 rounded-full bg-yellow-400 typing-dot"
              style={{ animationDelay: `${d * 0.18}s` }}
            />
          ))}
        </span>
      </div>
    );
  if (kind === "turns")
    return (
      <svg viewBox="0 0 220 56" className="w-full max-w-[240px] h-14 mt-4" aria-hidden>
        <path
          d="M6 44 C 60 44, 70 12, 120 12 S 200 30, 214 30"
          fill="none"
          stroke="rgba(255,230,0,0.85)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="route-draw"
        />
        <circle cx="6" cy="44" r="3.5" fill="#ffe600" />
        <circle cx="214" cy="30" r="3.5" fill="#ffe600" />
        <g transform="translate(120 12)">
          <circle r="9" fill="rgba(255,230,0,0.15)" className="poi-dot" />
          <path d="M-3.5 1 L0 -3 L3.5 1 M0 -3 L0 4" stroke="#ffe600" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  if (kind === "fuel")
    return (
      <svg viewBox="0 0 220 64" className="w-full max-w-[260px] h-16 mt-4" aria-hidden>
        <path
          d="M8 50 C 50 20, 90 56, 130 30 S 190 14, 212 22"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeDasharray="5 6"
        />
        {[
          { x: 50, y: 20, d: 0 },
          { x: 130, y: 30, d: 0.5 },
          { x: 190, y: 14, d: 1 },
        ].map((p) => (
          <g key={`${p.x}-${p.y}`} transform={`translate(${p.x} ${p.y})`}>
            <circle r="10" fill="rgba(255,230,0,0.14)" className="poi-dot" style={{ animationDelay: `${p.d}s` }} />
            <circle r="3" fill="#ffe600" />
          </g>
        ))}
      </svg>
    );
  if (kind === "share")
    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="glass rounded px-3 py-2 text-[12px] text-yellow-200/90 font-mono border border-white/10 flex items-center gap-2 min-w-0">
          <Link2 className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
          <span className="truncate">apex-routes.nl/#r=…</span>
        </span>
        <span className="glass rounded p-2 border border-white/10">
          <Copy className="w-3.5 h-3.5 text-slate-400" />
        </span>
      </div>
    );
  if (kind === "apps")
    return (
      <div className="flex flex-wrap gap-1.5 mt-4">
        {["Google Maps", "Waze", "Kurviger", "OsmAnd", "TomTom", "GPX"].map((app) => (
          <span
            key={app}
            className="glass rounded px-3 py-1.5 text-[12px] font-semibold text-slate-300 border border-white/10"
          >
            {app}
          </span>
        ))}
      </div>
    );
  // weather
  return (
    <div className="flex items-end gap-3 mt-4">
      <svg viewBox="0 0 160 44" className="flex-1 max-w-[190px] h-11" aria-hidden>
        <path
          d="M4 38 L28 30 L52 34 L76 16 L100 22 L124 8 L156 14"
          fill="none"
          stroke="rgba(255,230,0,0.8)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="route-draw"
        />
      </svg>
      <span className="glass rounded px-3 py-2 text-[12px] font-semibold flex items-center gap-1.5 border border-white/10 shrink-0">
        <CloudSun className="w-4 h-4 text-yellow-400/90" />
        12°
      </span>
    </div>
  );
}

/** Visuele identiteit per functie-kaart: routescape-foto + lucide-icoon. */
/**
 * Functie-kaarten: compact (3×2), kleine betekenisvolle thumbnail, en elke
 * kaart is een échte link — geen nep-klik-doeleinden meer.
 * target: "app" = planner openen, verder = pagina-link.
 */
const FEATURE_ART: {
  photo: string | null;
  icon: React.ComponentType<{ className?: string }>;
  kind: string;
  target: { app: true } | { href: string };
}[] = [
  { photo: "/routescapes/limburg-hills-thumb.webp", icon: Sparkles, kind: "chat", target: { app: true } },
  { photo: "/routescapes/eifel-thumb.webp", icon: Navigation, kind: "turns", target: { app: true } },
  { photo: "/routescapes/nl-fields-thumb.webp", icon: Fuel, kind: "fuel", target: { app: true } },
  { photo: "/routescapes/nl-dikes-thumb.webp", icon: Link2, kind: "share", target: { href: "/ritbank" } },
  { photo: null, icon: FileDown, kind: "apps", target: { href: "/gpx" } },
  { photo: "/routescapes/swiss-pass-thumb.webp", icon: CloudSun, kind: "weather", target: { app: true } },
];

export default function Landing({
  onStart,
  onImportFile,
  onRouletteStart,
}: {
  onStart: () => void;
  onImportFile: (file: File) => void;
  onRouletteStart: (prompt: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dropActive, setDropActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [showPro, setShowPro] = useState(false);
  const [langState, setLangState] = useState<Lang>("nl");
  const depth = useRef(0);
  const t = LANDING[langState];

  // taal laden zodra de client het weet (rAF i.v.m. React-compiler)
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      import("./LangSwitch").then(({ detectLang }) => setLangState(detectLang()));
    });
    const onLang = (e: Event) => {
      const detail = (e as CustomEvent<Lang>).detail;
      if (detail) setLangState(detail);
    };
    window.addEventListener("apex:lang", onLang);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("apex:lang", onLang);
    };
  }, []);

  const readFile = useCallback(
    (file: File) => {
      if (!isRouteFileName(file.name)) return;
      onImportFile(file);
    },
    [onImportFile]
  );

  const dropHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      depth.current += 1;
      setDropActive(true);
    },
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDropActive(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setDropActive(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) readFile(f);
    },
  };

  return (
    <div className="min-h-dvh text-slate-100 relative grain overflow-x-clip" {...dropHandlers}>
      {/* aurora + grid achtergrond */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[#ffe600]/[0.13] top-[-180px] right-[-140px]" />
        <div
          className="aurora w-[36rem] h-[36rem] bg-white/[0.07] bottom-[-160px] left-[-120px]"
          style={{ animationDelay: "-9s" }}
        />
      </div>

      {/* scroll-voortgang */}
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden />
      <SkipLink />

      {/* drop-overlay */}
      {dropActive && (
        <div className="fixed inset-0 z-[900] bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="glass border-2 border-dashed border-yellow-400 rounded px-10 py-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center">
              <Upload className="w-6 h-6 text-yellow-300" />
            </div>
            <p className="font-display font-bold text-xl">{t.hero.dropTitle}</p>
            <p className="text-sm text-slate-400 mt-1">{t.hero.hint}</p>
          </div>
        </div>
      )}

      {/* verborgen bestandsinput */}
      <input
        ref={fileRef}
        type="file"
        accept={ROUTE_FILE_EXTENSIONS.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f);
          e.target.value = "";
        }}
      />

      {/* nav */}
      <nav className="sticky top-0 z-40 px-3 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] border border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <Logo size={38} />
          <span className="text-lg font-bold tracking-tight font-display hidden sm:block">
            Apex Routes
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a href="/ontdek" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden md:flex items-center gap-2">
            <Compass className="w-4 h-4 text-yellow-400/80" />
            <span className="hidden lg:inline">{t.nav.discover}</span>
          </a>
          <a href="/kalender" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden lg:flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-yellow-400/80" />
            {t.nav.kalender}
          </a>
          <a href="/forum" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden lg:flex items-center gap-2">
            <MessagesSquare className="w-4 h-4 text-yellow-400/80" />
            {t.nav.forum}
          </a>
          <a href="/ritbank" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden lg:flex items-center gap-2">
            <Archive className="w-4 h-4 text-yellow-400/80" />
            <span className="hidden xl:inline">{t.nav.ritbank}</span>
          </a>
          <a href="/advies" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden md:flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400/80" />
            <span className="hidden lg:inline">{t.nav.advisor}</span>
          </a>
          <ThemeSwitch />
          <LangSwitch className="hidden sm:flex" />
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden xl:inline">{t.nav.import}</span>
          </button>
          <button
            onClick={() => setShowPro(true)}
            data-track="Prijsdialoog geopend"
            data-track-source="navigatie"
            className="h-10 px-3.5 rounded font-bold text-[13px] flex items-center gap-1.5 pro-chip"
            aria-label="Apex Pro"
          >
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Pro</span>
          </button>
          <button
            onClick={onStart}
            data-track="Planner gestart"
            data-track-source="navigatie"
            className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block"
          >
            {t.nav.openApp}
          </button>
          {/* mobiel: menu-knop */}
          <button
            onClick={() => setMenuOpen(true)}
            className="btn-ghost h-10 w-10 rounded items-center justify-center sm:hidden flex"
            aria-label="Menu openen"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* mobiel menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[940] bg-black/70 backdrop-blur-md sm:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-[19rem] bg-[var(--surface-raised)] border-l border-white/10 p-5 flex flex-col gap-1 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded"
                  aria-label="Menu sluiten"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {(
                [
                  { href: "/ontdek", icon: Compass, label: t.nav.discover },
                  { href: "/advies", icon: BookOpen, label: t.nav.advisor },
                  { href: "/kalender", icon: CalendarDays, label: t.nav.kalender },
                  { href: "/forum", icon: MessagesSquare, label: t.nav.forum },
                  { href: "/ritbank", icon: Archive, label: t.nav.ritbank },
                  { href: "/checklist", icon: ClipboardCheck, label: t.footer.checklist },
                  { href: "/gpx", icon: FileDown, label: t.footer.gpx },
                  { href: "/ritten", icon: Route, label: t.footer.ritten },
                  { href: "/klimmen", icon: Mountain, label: t.footer.klimmen },
                  { href: "/prijzen", icon: Crown, label: "Apex Pro & prijzen" },
                  { href: "/adverteren", icon: Megaphone, label: t.footer.adverteren },
                ] as const
              ).map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3.5 py-3 rounded hover:bg-white/[0.07] text-[15px] font-medium"
                >
                  <Icon className="w-[18px] h-[18px] text-yellow-400/80" />
                  {label}
                </a>
              ))}
              <div className="h-px bg-white/10 my-3" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  fileRef.current?.click();
                }}
                className="flex items-center gap-3 px-3.5 py-3 rounded hover:bg-white/[0.07] text-[15px] font-medium w-full text-left"
              >
                <Upload className="w-[18px] h-[18px] text-yellow-400/80" />
                {t.nav.import}
              </button>
              <div className="mt-2">
                <LangSwitch />
              </div>
              <button
                onClick={onStart}
                className="btn-brand btn-shine mt-auto px-5 py-3.5 rounded font-semibold"
              >
                {t.nav.openApp}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hero */}
      <section id="apex-main" className="relative z-10 px-6 pt-16 sm:pt-24 pb-12 max-w-6xl mx-auto text-center overflow-visible">
        <div className="headlight" aria-hidden />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[13px] text-slate-300 mb-8 border border-white/10"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-yellow-400 opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-yellow-400" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          {t.hero.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-[2.75rem] leading-[1.02] sm:text-7xl font-bold mb-6 tracking-[-0.03em] font-display"
        >
          {t.hero.titleLead}{" "}
          <span className="text-gradient">
            <RotatingWord words={t.hero.titleWords} />
          </span>{" "}
          {t.hero.titleTailA}
          <br />
          <span className="hl">{t.hero.titleTailB}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
            data-track="Planner gestart"
            data-track-source="hero"
            className="group inline-flex items-center gap-3 px-8 py-4 btn-brand btn-shine rounded font-semibold text-lg"
          >
            {t.hero.start}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => fileRef.current?.click()}
            data-track="Route import gestart"
            data-track-source="hero"
            className="inline-flex items-center gap-3 px-8 py-4 btn-ghost rounded font-semibold text-lg"
          >
            <Upload className="w-5 h-5" />
            {t.hero.importRoute}
          </motion.button>
        </motion.div>

        <p className="ticker text-[11px] text-slate-500">
          {ROUTE_FILE_EXTENSIONS.map((e) => e.replace(".", "").toUpperCase()).join(" · ")}
          {" — "}
          {t.hero.hint}
        </p>
      </section>

      {/* live map paneel */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded overflow-hidden lux-card corner-frame"
        >
          <div className="h-[380px] sm:h-[480px] relative">
            <LandingMap className="absolute inset-0 z-0" />
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              {(
                [
                  { icon: RouteIcon, value: "98 km" },
                  { icon: Timer, value: "1 u 47" },
                  { icon: TrendingUp, value: "↑ 640 m" },
                  { icon: Fuel, value: `7 ${t.map.tankstops}` },
                ] as const
              ).map(({ icon: Icon, value }) => (
                <span
                  key={value}
                  className="glass rounded px-3 py-1.5 text-[13px] font-semibold flex items-center gap-1.5 border border-white/10"
                >
                  <Icon className="w-3.5 h-3.5 text-yellow-400/90" aria-hidden />
                  {value}
                </span>
              ))}
            </div>
            <span className="absolute top-4 right-4 z-10 text-[10px] uppercase tracking-widest text-slate-500 glass rounded px-3 py-1 border border-white/10">
              {t.map.demo}
            </span>
            <button
              onClick={onStart}
              data-track="Planner gestart"
              data-track-source="kaart-demo"
              className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 px-6 py-3 btn-brand rounded font-semibold"
            >
              {t.map.tryLive}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* marquee */}
      <section className="relative z-10 py-6 border-y border-white/[0.07] marquee">
        <div className="marquee-track">
          {[...CORRIDORS, ...CORRIDORS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="ticker flex items-center gap-8 text-base sm:text-xl font-semibold text-slate-500 whitespace-nowrap"
            >
              {name}
              <span className="text-yellow-400/70 text-[12px]">{"///"}</span>
            </span>
          ))}
        </div>
      </section>

      {/* bento features */}
      <section className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-bold text-center mb-12 tracking-tight font-display"
        >
          <span className="sec-index block mb-3">01 /</span>
          {t.featuresTitle}
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {t.features.map((f, i) => {
            const art = FEATURE_ART[i] ?? FEATURE_ART[0];
            const Icon = art.icon;
            const cta =
              "app" in art.target ? t.nav.openApp : art.target.href === "/ritbank" ? t.nav.ritbank : t.footer.gpx;
            const inner = (
              <>
                <div className="flex items-start gap-3.5 p-4 sm:p-5">
                  {art.photo && (
                    <span
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded shrink-0 bg-cover bg-center border border-white/10"
                      style={{ backgroundImage: `url(${art.photo})` }}
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-4 h-4 text-yellow-300 shrink-0" />
                      <span className="font-display text-[11px] font-bold tracking-[0.18em] text-white/30 font-mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <h3 className="text-[16px] font-semibold mb-1.5 font-display leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-slate-400 text-[13px] leading-relaxed line-clamp-3">
                      {f.desc}
                    </p>
                  </span>
                </div>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
                  <FeatureVisual kind={art.kind} />
                  <span className="mt-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-yellow-400/90 group-hover:text-yellow-300">
                    {cta}
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </>
            );
            const cls =
              "group lux-card h-full text-left block w-full cursor-pointer hover:border-yellow-400/30 transition-colors";
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              >
                {"app" in art.target ? (
                  <button onClick={onStart} className={cls}>
                    {inner}
                  </button>
                ) : (
                  <a href={art.target.href} className={cls}>
                    {inner}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* stappen — klikbaar: elke kaart doet iets */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-3">
          {(
            [
              { action: "app" as const, href: undefined },
              { action: "app" as const, href: undefined },
              { action: "link" as const, href: "/advies#apps" },
            ] as const
          ).map((meta, i) => {
            const step = t.steps[i];
            const inner = (
              <>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-display text-4xl font-bold text-yellow-400/90">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-yellow-300" />
                  </span>
                </div>
                <h3 className="text-lg font-semibold mt-3 mb-2">{step.t}</h3>
                <p className="text-slate-400 text-[15px] leading-relaxed">{step.d}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-yellow-400/90">
                  {meta.action === "app" ? t.nav.openApp : t.nav.advisor}
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </>
            );
            const cls =
              "group lux-card corner-frame p-6 h-full text-left block w-full cursor-pointer";
            return (
              <motion.div
                key={step.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                {meta.action === "app" ? (
                  <button onClick={onStart} className={cls}>
                    {inner}
                  </button>
                ) : (
                  <a href={meta.href} className={cls}>
                    {inner}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* scheiding met midmarker */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="rule-mark" aria-hidden />
      </div>

      {/* route roulette */}
      <section id="roulette" className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
        >
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[13px] text-slate-300 mb-5 border border-white/10">
              <Dices className="w-4 h-4 text-yellow-400" />
              {t.roulette.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight font-display">
              <span className="sec-index block mb-3">02 /</span>
              {t.roulette.titleA} <span className="text-gradient">{t.roulette.titleB}</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">{t.roulette.sub}</p>
          </div>
          <RouletteWheel onOpenRoute={onRouletteStart} lang={langState} />
        </motion.div>
      </section>

      {/* tellers */}
      <section className="relative z-10 py-10 border-y border-white/[0.07]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { to: 10, suffix: "", label: t.stats.regions },
            { to: 6, suffix: "", label: t.stats.formats },
            { to: 7, suffix: "", label: t.stats.apps },
            { to: 0, suffix: "", label: t.stats.cost },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display font-bold text-4xl sm:text-5xl text-gradient">
                {s.to === 0 ? "€0" : <CountUp to={s.to} suffix={s.suffix} />}
              </p>
              <p className="text-[13px] text-slate-500 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* stem mee */}
      <section className="relative z-10 px-4 sm:px-6 py-14 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              {t.poll.title}
            </h2>
            <p className="text-slate-500 text-[14px] mt-1.5">{t.poll.sub}</p>
          </div>
          <Poll id="home-weekend" question={t.poll.q} options={t.poll.options} />
        </motion.div>
      </section>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="rule-mark" aria-hidden />
      </div>

      {/* community: forum */}
      <RotwBand />

      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lux-card corner-frame p-8 sm:p-10 relative overflow-hidden"
        >
          <div className="aurora w-72 h-72 bg-[#ffe600]/[0.07] -top-24 -right-20" aria-hidden />
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative">
            <span className="w-14 h-14 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
              <MessagesSquare className="w-7 h-7 text-yellow-300" />
            </span>
            <div className="flex-1">
              <span className="sec-index block mb-2">FORUM /</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mb-2">
                {t.forumBand.title}
              </h2>
              <p className="text-slate-400 text-[15px] leading-relaxed max-w-xl">
                {t.forumBand.sub}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {["Motor", "Auto & cabrio", "Fiets", "Wandelen", "Apps & navigatie", "Ideeën"].map((c) => (
                  <span key={c} className="glass rounded px-2.5 py-1 text-[12px] font-semibold text-slate-300 border border-white/10">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <a
              href="/forum"
              className="btn-brand btn-shine px-6 py-3.5 rounded font-semibold whitespace-nowrap flex items-center gap-2 shrink-0"
            >
              {t.forumBand.cta}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="rule-mark" aria-hidden />
      </div>

      {/* pricing: drie lagen */}
      <span id="pricing" className="block scroll-mt-24" aria-hidden />
      <section className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-bold text-center mb-4 tracking-tight font-display"
        >
          <span className="sec-index block text-center mb-3">03 /</span>
          {t.pricing.titleA} <span className="text-gradient">{t.pricing.titleB}</span>
        </motion.h2>
        <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">{t.pricing.sub}</p>

        <div className="grid md:grid-cols-3 gap-3 items-stretch">
          {/* basis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lux-card p-7 flex flex-col"
          >
            <p className="text-[12px] uppercase tracking-widest text-slate-500 font-semibold">
              {t.pricing.freeTitle}
            </p>
            <p className="font-display font-bold text-4xl mt-2 mb-1">{t.pricing.freePrice}</p>
            <p className="text-[13px] text-slate-500 mb-6">{t.pricing.freeForever}</p>
            <ul className="space-y-2.5 text-[14px] text-slate-300 flex-1">
              {t.pricing.freeBullets.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={onStart} className="btn-ghost w-full mt-7 px-5 py-3 rounded font-semibold">
              {t.pricing.ctaFree}
            </button>
          </motion.div>

          {/* supporter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="lux-card p-7 flex flex-col"
          >
            <p className="text-[12px] uppercase tracking-widest text-yellow-400/90 font-semibold">
              {t.pricing.suppTitle}
            </p>
            <p className="font-display font-bold text-4xl mt-2 mb-1">
              {t.pricing.suppPrice}
              <span className="text-base font-medium text-slate-500"> /mo</span>
            </p>
            <p className="text-[13px] text-slate-500 mb-6">{t.pricing.suppNote}</p>
            <ul className="space-y-2.5 text-[14px] text-slate-300 flex-1">
              {t.pricing.suppBullets.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowPro(true)}
              data-track="Prijsdialoog geopend"
              data-track-source="pricing-supporter"
              className="btn-ghost w-full mt-7 px-5 py-3 rounded font-semibold"
            >
              {t.pricing.ctaSupporter}
            </button>
          </motion.div>

          {/* pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="relative lux-card p-6 flex flex-col overflow-hidden"
          >
            <span className="stripe-accent absolute top-0 inset-x-0 h-[3px]" aria-hidden />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[11px] font-bold px-3 py-1 rounded whitespace-nowrap">
              {t.pricing.popular}
            </span>
            <p className="text-[12px] uppercase tracking-widest text-yellow-400 font-semibold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /> {t.pricing.proTitle}
            </p>
            <p className="font-display font-bold text-4xl mt-2 mb-1">
              {t.pricing.proPrice}
              <span className="text-base font-medium text-slate-500"> /{PRO_PLANS[2].id === "year" ? "jr" : ""}</span>
            </p>
            <p className="text-[13px] text-slate-500 mb-6">{t.pricing.proNote}</p>
            <ul className="space-y-2.5 text-[14px] text-slate-200 flex-1">
              {t.pricing.proBullets.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowPro(true)}
              data-track="Prijsdialoog geopend"
              data-track-source="pricing-pro"
              className="btn-brand btn-shine w-full mt-7 px-5 py-3 rounded font-semibold flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {t.pricing.ctaPro}
            </button>
          </motion.div>
        </div>
        <p className="text-center text-[13px] text-slate-500 mt-6">{t.pricing.supportLine}</p>
        <p className="text-center mt-3">
          <Link href="/prijzen" className="text-[12px] font-semibold text-yellow-300 hover:text-yellow-200 inline-flex items-center gap-1.5">
            Vergelijk alle plannen en voorwaarden
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </p>
      </section>

      {/* slot-cta */}
      <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden lux-card p-10 sm:p-14 text-center"
        >
          <div className="aurora w-[26rem] h-[26rem] bg-[#ffe600]/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4 font-display tracking-tight">
            {t.finalTitle}
          </h2>
          <p className="relative text-slate-400 mb-8">{t.finalSub}</p>
          <button
            onClick={onStart}
            className="relative inline-flex items-center gap-3 px-8 py-4 btn-brand btn-shine rounded font-semibold text-lg"
          >
            {t.finalCta}
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="relative text-[13px] text-emerald-300/80 mt-5 italic flex items-center justify-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 not-italic shrink-0" />
            {t.finalNature}
          </p>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/[0.07] overflow-hidden">
        <div className="topo-lines absolute inset-0 pointer-events-none" aria-hidden />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[24rem] aurora bg-[#ffe600]/[0.05] pointer-events-none" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
            {/* merk */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Logo size={34} />
                <span className="text-lg font-bold tracking-tight font-display">
                  Apex Routes
                </span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[26ch]">
                {t.hero.sub.split(".")[0]}.
              </p>
              <button
                onClick={() => setShowPro(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded pro-chip font-semibold text-[13px]"
              >
                <Crown className="w-4 h-4" />
                {t.footer.supportCta}
              </button>
            </div>

            {/* plannen */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">
                {t.footer.plan}
              </p>
              <ul className="space-y-2.5 text-[14px]">
                <li>
                  <button onClick={onStart} className="text-slate-400 hover:text-yellow-400 transition-colors">
                    {t.nav.openApp}
                  </button>
                </li>
                <li>
                  <button onClick={() => fileRef.current?.click()} className="text-slate-400 hover:text-yellow-400 transition-colors">
                    {t.nav.import}
                  </button>
                </li>
                <li>
                  <Link href="/#roulette" className="text-slate-400 hover:text-yellow-400 transition-colors">
                    {t.footer.roulette}
                  </Link>
                </li>
                <li>
                  <Link href="/prijzen" className="text-slate-400 hover:text-yellow-400 transition-colors">
                    {t.pricing.titleA} {t.pricing.titleB}
                  </Link>
                </li>
                <li>
                  <a href="/checklist" className="text-slate-400 hover:text-yellow-400 transition-colors">
                    {t.footer.checklist}
                  </a>
                </li>
                <li>
                  <a href="/gpx" className="text-slate-400 hover:text-yellow-400 transition-colors">
                    {t.footer.gpx}
                  </a>
                </li>
              </ul>
            </div>

            {/* ontdekken */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">
                {t.footer.discover}
              </p>
              <ul className="space-y-2.5 text-[14px]">
                <li><a href="/ontdek" className="text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1.5">{t.nav.discover}</a></li>
                <li><a href="/advies" className="text-slate-400 hover:text-yellow-400 transition-colors">{t.nav.advisor}</a></li>
                <li><a href="/kalender" className="text-slate-400 hover:text-yellow-400 transition-colors">{t.nav.kalender}</a></li>
              </ul>
            </div>

            {/* community */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">
                {t.footer.community}
              </p>
              <ul className="space-y-2.5 text-[14px]">
                <li><a href="/forum" className="text-slate-400 hover:text-yellow-400 transition-colors">{t.nav.forum}</a></li>
                <li><a href="/ritbank" className="text-slate-400 hover:text-yellow-400 transition-colors">{t.nav.ritbank}</a></li>
              </ul>
            </div>

            {/* waarom apex */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">
                {t.footer.why}
              </p>
              <ul className="space-y-2.5 text-[14px]">
                <li><a href="/advies#apps" className="text-slate-400 hover:text-yellow-400 transition-colors">Google Maps · Waze · Kurviger</a></li>
                <li><a href="/ontdek" className="text-slate-400 hover:text-yellow-400 transition-colors">Zuid-Limburg · Eifel · Alpen</a></li>
                <li><a href="/adverteren" className="text-slate-400 hover:text-yellow-400 transition-colors">Partners & adverteren</a></li>
                <li className="text-slate-500 flex items-start gap-1.5">
                  <Leaf className="w-3.5 h-3.5 mt-0.5 text-emerald-400/80 shrink-0" />
                  {t.finalNature}
                </li>
              </ul>
            </div>
          </div>

          {/* onderbalk */}
          <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-slate-600 text-center sm:text-left leading-relaxed">
              © 2026 Apex Routes · {t.footer.credits}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/privacy" className="text-[11px] text-slate-600 hover:text-yellow-300">Privacy</Link>
              <Link href="/voorwaarden" className="text-[11px] text-slate-600 hover:text-yellow-300">Voorwaarden</Link>
              <span className="text-[12px] text-slate-600">{t.footerBuilt}</span>
              <LangSwitch />
            </div>
          </div>
        </div>
      </footer>

      {/* pro-dialog */}
      <ProDialog open={showPro} onClose={() => setShowPro(false)} />
    </div>
  );
}
