"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, RefreshCw, ArrowRight, Copy, Check, Route as RouteIcon, TrendingUp, Gauge } from "lucide-react";
import {
  spinRoulette,
  rouletteShareText,
  CORRIDOR_POOL,
  type RouletteResult,
  type RouletteVehicle,
} from "@/lib/roulette";
import { ROULETTE, type Lang } from "@/lib/i18n";

/** volgorde = index in ROULETTE[lang].vehicles */
const VEHICLES: { id: RouletteVehicle; idx: number }[] = [
  { id: "motorcycle", idx: 0 },
  { id: "car", idx: 1 },
  { id: "bicycle", idx: 2 },
  { id: "pedestrian", idx: 3 },
];

const SECTORS = CORRIDOR_POOL.length;
const SECTOR_DEG = 360 / SECTORS;

/** Instrumentendial: schaalverdeling zoals een toerenteller, met regio's als schaalwaarden. */
function DialFace({ activeKey }: { activeKey?: string }) {
  // 50 kleine streepjes, elke 5e groot — als een echte teller
  const ticks = Array.from({ length: 50 }, (_, i) => {
    const deg = i * (360 / 50);
    const major = i % 5 === 0;
    return { deg, major };
  });
  return (
    <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="dial-face" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#17171a" />
          <stop offset="62%" stopColor="#0c0c0e" />
          <stop offset="100%" stopColor="#050506" />
        </radialGradient>
        <radialGradient id="dial-sheen" cx="38%" cy="30%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* wijzerplaat */}
      <circle cx="150" cy="150" r="132" fill="url(#dial-face)" />
      <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="150" cy="150" r="132" fill="url(#dial-sheen)" />

      {/* schaalstrepen */}
      {ticks.map(({ deg, major }) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const r1 = major ? 112 : 119;
        const r2 = 126;
        return (
          <line
            key={deg}
            x1={150 + r1 * Math.cos(rad)}
            y1={150 + r1 * Math.sin(rad)}
            x2={150 + r2 * Math.cos(rad)}
            y2={150 + r2 * Math.sin(rad)}
            stroke={major ? "rgba(255,230,0,0.75)" : "rgba(255,255,255,0.22)"}
            strokeWidth={major ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {/* regio-labels + sector-leds */}
      {CORRIDOR_POOL.map((c, i) => {
        const mid = i * SECTOR_DEG + SECTOR_DEG / 2;
        const rad = ((mid - 90) * Math.PI) / 180;
        const lr = 97;
        const x = 150 + lr * Math.cos(rad);
        const y = 150 + lr * Math.sin(rad);
        const edge = ((i * SECTOR_DEG - 90) * Math.PI) / 180;
        const active = activeKey === c.key;
        return (
          <g key={c.key}>
            <circle
              cx={150 + 126 * Math.cos(((i * SECTOR_DEG - 90 + SECTOR_DEG / 2) * Math.PI) / 180)}
              cy={150 + 126 * Math.sin(((i * SECTOR_DEG - 90 + SECTOR_DEG / 2) * Math.PI) / 180)}
              r={2.6}
              fill={active ? "var(--accent)" : "rgb(var(--overlay-rgb) / 0.18)"}
              style={active ? { filter: "drop-shadow(0 0 5px var(--accent))" } : undefined}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${mid} ${x} ${y})`}
              fontSize="8"
              fontWeight="700"
              letterSpacing="0.08em"
              fill={active ? "var(--accent)" : "rgb(var(--overlay-rgb) / 0.55)"}
              style={{ fontFamily: "ui-monospace, Menlo, monospace", textTransform: "uppercase" }}
            >
              {c.label}
            </text>
            <line
              x1={150 + 128 * Math.cos(edge)}
              y1={150 + 128 * Math.sin(edge)}
              x2={150 + 136 * Math.cos(edge)}
              y2={150 + 136 * Math.sin(edge)}
              stroke="rgba(255,230,0,0.4)"
              strokeWidth="1.5"
            />
          </g>
        );
      })}

      {/* glasrand */}
      <circle cx="150" cy="150" r="131" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" opacity="0.35" />
    </svg>
  );
}

/** Naald met tegengewicht — draait met realistische demping. */
function Needle({ rotation }: { rotation: number }) {
  return (
    <motion.div
      animate={{ rotate: rotation }}
      transition={{ duration: 1.7, ease: [0.15, 0.9, 0.28, 1] }}
      className="absolute inset-0 z-10"
      style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.7))" }}
    >
      <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden>
        <polygon points="150,34 153.5,150 146.5,150" fill="var(--accent)" />
        <polygon points="150,34 153.5,150 150,150" fill="#fff7c2" opacity="0.6" />
        <rect x="146" y="150" width="8" height="34" rx="3" fill="#2a2a2e" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      </svg>
    </motion.div>
  );
}

export default function RouletteWheel({
  onOpenRoute,
  lang = "nl",
}: {
  onOpenRoute: (prompt: string) => void;
  lang?: Lang;
}) {
  const L = ROULETTE[lang];
  const SPIN_STATUS = L.statuses;
  const [vehicle, setVehicle] = useState<RouletteVehicle>("motorcycle");
  const [kmTarget, setKmTarget] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const lastKey = useRef<string | undefined>(undefined);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const [style, setStyle] = useState<"rustig" | "mix" | "kronkel">("mix");

  const spin = () => {
    if (spinning) return;
    setResult(null);
    setCopied(false);
    setSpinning(true);
    setRotation((r) => r + 1080 + Math.floor(Math.random() * 360));
    SPIN_STATUS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStatusIdx(i), i * 300));
    });
    timers.current.push(
      window.setTimeout(() => {
        const r = spinRoulette({ vehicle, kmTarget, avoidKey: lastKey.current, style });
        lastKey.current = r.corridor.key;
        setResult(r);
        setSpinning(false);
      }, 1700)
    );
  };

  const copyShare = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(rouletteShareText(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // klembord geblokkeerd — geen ramp
    }
  };

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-center justify-items-center">
      {/* instrument */}
      <div className="relative scale-[0.84] sm:scale-100">
        <div className="relative w-[300px] h-[300px]">
          {/* metalen buitenring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 210deg, #3a3a40, #131316 25%, #4a4a52 50%, #17171b 75%, #3a3a40)",
              boxShadow:
                "0 24px 60px -18px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.6)",
            }}
            aria-hidden
          />
          <div className="absolute inset-[8px] rounded-full overflow-hidden">
            <DialFace activeKey={result?.corridor.key} />
            <Needle rotation={rotation} />
            {/* naaf */}
            <div className="absolute inset-0 m-auto w-[74px] h-[74px] rounded-full bg-[var(--surface-solid)] border border-yellow-400/50 flex flex-col items-center justify-center z-20 shadow-[0_6px_18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Gauge className="w-5 h-5 text-yellow-400" aria-hidden />
              <span className="text-[9px] uppercase tracking-[0.18em] text-yellow-400/90 font-bold mt-1 font-mono">
                Apex
              </span>
            </div>
            {/* top-marker boven de naaf */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1 z-20 w-0 h-0 border-x-[8px] border-x-transparent border-t-[13px] border-t-yellow-400 drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* bediening + uitslag */}
      <div className="w-full max-w-md">
        <div className="flex flex-wrap gap-2 mb-5">
          {VEHICLES.map((v) => (
            <button
              key={v.id}
              onClick={() => !spinning && setVehicle(v.id)}
              disabled={spinning}
              className={`glass rounded px-3.5 py-2 text-[13px] font-semibold border transition-all while-hover-scale ${
                vehicle === v.id
                  ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
                  : "border-white/10 text-slate-300 hover:border-white/25"
              }`}
              aria-pressed={vehicle === v.id}
            >
              {L.vehicles[v.idx]}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="roulette-km" className="text-[13px] text-slate-400">
              {L.kmTarget}
            </label>
            <span className="font-display font-bold text-yellow-400 font-mono">{kmTarget} km</span>
          </div>
          <input
            id="roulette-km"
            type="range"
            min={40}
            max={300}
            step={10}
            value={kmTarget}
            disabled={spinning}
            onChange={(e) => setKmTarget(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
          <div className="flex justify-between text-[11px] text-slate-600 mt-1 font-mono">
            <span>40</span>
            <span>300</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[13px] text-slate-400 mb-1.5">Stijl</p>
          <div className="flex gap-1.5">
            {(
              [
                { id: "rustig", label: "Rustig", hint: "Recht en vloeiend — weinig bochten" },
                { id: "mix", label: "Mix", hint: "Van alles wat — laat het lot beslissen" },
                { id: "kronkel", label: "Kronkel", hint: "Maximaal bochtenwerk — de leukste wegen" },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStyle(st.id)}
                aria-pressed={style === st.id}
                title={st.hint}
                className={`flex-1 px-3 py-2 rounded text-[12px] font-semibold border transition-colors ${
                  style === st.id
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "glass border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className="btn-brand btn-shine w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded font-semibold text-[16px] disabled:opacity-60"
        >
          {spinning ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Dices className="w-5 h-5" />
          )}
          {spinning ? SPIN_STATUS[statusIdx] : result ? L.spinAgain : L.spin}
        </button>

        {/* uitslag */}
        <AnimatePresence mode="wait">
          {result && !spinning && (
            <motion.div
              key={result.seed}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="glass rounded border border-yellow-400/30 p-5 mt-5 relative overflow-hidden"
            >
              <div className="aurora w-56 h-56 bg-[var(--accent)]/10 -top-20 -right-16" />
              <div className="flex items-center gap-4">
                <span className="w-11 h-11 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0" aria-hidden>
                  <MapPinIcon label={result.corridor.label} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-yellow-400 font-bold font-mono">
                    {result.rideName}
                  </p>
                  <h3 className="font-display font-bold text-xl leading-tight">
                    {result.corridor.label}
                  </h3>
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-[14px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <RouteIcon className="w-4 h-4 text-yellow-400/90" /> {result.km} km
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-yellow-400/90" /> ≈ {result.climbEstimate} hm
                </span>
                <span className="text-slate-600 font-mono text-[11px] self-center ml-auto">
                  {result.seed}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onOpenRoute(result.prompt)}
                  className="btn-brand flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded font-semibold text-sm"
                >
                  Open deze route
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={copyShare}
                  className="btn-ghost px-3.5 rounded"
                  aria-label="Deeltekst kopiëren"
                  title="Deeltekst kopiëren"
                >
                  {copied ? <Check className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[12px] text-slate-600 mt-4 text-center md:text-left">
          Het lot kiest de regio, jij draait door tot het klikt. Elke uitslag is met
          één klik een echte route.
        </p>
      </div>
    </div>
  );
}

/** Compacte regio-markering in de uitslag-kaart. */
function MapPinIcon({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold text-yellow-300 font-mono uppercase leading-tight text-center px-1">
      {label.split(" ")[0]}
    </span>
  );
}
