"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Moon, Sun, Monitor, Gem, Check } from "lucide-react";
import {
  applyTheme,
  isDonker,
  parseKeuze,
  resolveTheme,
  THEME_KEUZES,
  THEME_KLEUR,
  THEME_LABEL,
  THEME_OMSCHRIJVING,
  THEME_STORAGE_KEY,
  volgendeKeuze,
  type Theme,
  type ThemeKeuze,
} from "@/lib/theme";

const ICOON: Record<ThemeKeuze, typeof Moon> = {
  systeem: Monitor,
  startgrid: Moon,
  smaragd: Gem,
  licht: Sun,
};

/**
 * Thema-schakelaar voor de navigatiebalk.
 *
 * Klikken wisselt meteen door naar het volgende thema (snel), lang indrukken
 * of de pijl opent de lijst met alle keuzes (precies). De voorkeur gaat naar
 * localStorage; "systeem" blijft live meelopen met het besturingssysteem.
 */
/**
 * Abonnement op de twee externe bronnen die het thema bepalen: de opgeslagen
 * keuze en de systeemvoorkeur. useSyncExternalStore is hier de juiste
 * primitieve — React leest de waarde zelf uit en houdt server en client
 * netjes uit elkaar, dus geen setState in een effect en geen hydratatie-mismatch.
 */
function subscribe(herbereken: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", herbereken);
  // een tweede tabblad dat het thema wijzigt telt ook mee
  window.addEventListener("storage", herbereken);
  window.addEventListener("apex-theme", herbereken);
  return () => {
    mq.removeEventListener("change", herbereken);
    window.removeEventListener("storage", herbereken);
    window.removeEventListener("apex-theme", herbereken);
  };
}

function leesKeuze(): ThemeKeuze {
  try {
    return parseKeuze(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "systeem";
  }
}

/** Snapshot als één string, zodat React hem goedkoop kan vergelijken. */
function leesSnapshot(): string {
  const donker = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return `${leesKeuze()}|${donker ? "d" : "l"}`;
}

const SERVER_SNAPSHOT = "systeem|d";

export default function ThemeSwitch({ className = "" }: { className?: string }) {
  const snapshot = useSyncExternalStore(subscribe, leesSnapshot, () => SERVER_SNAPSHOT);
  const [keuzeDeel, donkerDeel] = snapshot.split("|");
  const keuze = parseKeuze(keuzeDeel);
  const actief: Theme = resolveTheme(keuze, donkerDeel === "d");
  // op de server en tijdens de eerste render weten we het echte thema nog niet
  const klaar = snapshot !== SERVER_SNAPSHOT || typeof window !== "undefined";

  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // themawissel doorvoeren + de mobiele browserbalk meekleuren
  useEffect(() => {
    applyTheme(actief);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_KLEUR[actief]);
  }, [actief]);

  // buiten klikken of Escape sluit de lijst
  useEffect(() => {
    if (!open) return;
    const klik = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const toets = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", klik);
    document.addEventListener("keydown", toets);
    return () => {
      document.removeEventListener("mousedown", klik);
      document.removeEventListener("keydown", toets);
    };
  }, [open]);

  const kies = useCallback((k: ThemeKeuze) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, k);
    } catch {
      /* privemodus: dan geldt de keuze alleen deze sessie */
    }
    // laat useSyncExternalStore opnieuw lezen
    window.dispatchEvent(new Event("apex-theme"));
    setOpen(false);
  }, []);

  const Icoon = ICOON[keuze];
  const label = `Thema: ${THEME_LABEL[keuze]}${
    keuze === "systeem" ? ` (nu ${THEME_LABEL[actief]})` : ""
  }`;

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="flex items-center rounded border border-white/15 overflow-hidden">
        <button
          type="button"
          onClick={() => kies(volgendeKeuze(keuze))}
          title={`${label} — klik voor het volgende thema`}
          aria-label={`${label}. Klik om naar het volgende thema te wisselen.`}
          data-track="Thema gewisseld"
          className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-yellow-300 hover:bg-white/10 transition-colors"
        >
          {/* vóór hydratatie tonen we een neutraal icoon om mismatch te vermijden */}
          {klaar ? (
            <Icoon className="w-4 h-4" aria-hidden />
          ) : (
            <Moon className="w-4 h-4 opacity-40" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Kies een thema"
          className="h-10 px-1.5 flex items-center justify-center text-slate-500 hover:text-yellow-300 hover:bg-white/10 transition-colors border-l border-white/10"
        >
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
            <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          role="menu"
          aria-label="Thema"
          className="absolute right-0 top-12 z-50 w-60 glass rounded border border-white/15 p-1.5 shadow-2xl"
        >
          {THEME_KEUZES.map((k) => {
            const I = ICOON[k];
            const gekozen = k === keuze;
            return (
              <button
                key={k}
                role="menuitemradio"
                aria-checked={gekozen}
                onClick={() => kies(k)}
                className={`w-full text-left px-2.5 py-2 rounded flex items-center gap-2.5 transition-colors ${
                  gekozen ? "bg-yellow-400/10 text-yellow-300" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <I className="w-4 h-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold leading-tight">
                    {THEME_LABEL[k]}
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-tight mt-0.5">
                    {THEME_OMSCHRIJVING[k]}
                  </span>
                </span>
                {gekozen && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              </button>
            );
          })}
          <p className="text-[10px] text-slate-500 px-2.5 pt-2 pb-1 leading-relaxed border-t border-white/10 mt-1">
            Je keuze wordt op dit apparaat onthouden.
            {keuze === "systeem" &&
              ` Nu actief: ${THEME_LABEL[actief]} (${isDonker(actief) ? "donker" : "licht"}).`}
          </p>
        </div>
      )}
    </div>
  );
}
