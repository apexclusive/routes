"use client";

import { useEffect, useState } from "react";
import { LANGS, SHARED, type Lang } from "@/lib/i18n";

const LANG_KEY = "apex-routes:lang";
export const LANG_EVENT = "apex:lang";

/** Voorkeurstaal: opgeslagen keuze, anders navigatietaal, anders NL. */
export function detectLang(): Lang {
  if (typeof window === "undefined") return "nl";
  try {
    const stored = localStorage.getItem(LANG_KEY) as Lang | null;
    if (stored && LANGS.some((l) => l.id === stored)) return stored;
  } catch {
    /* privémodus */
  }
  const nav = window.navigator.language?.slice(0, 2).toLowerCase();
  if (nav === "en" || nav === "fr" || nav === "de") return nav;
  return "nl";
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    const r = requestAnimationFrame(() => setLangState(detectLang()));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Lang>).detail;
      if (detail) setLangState(detail);
    };
    window.addEventListener(LANG_EVENT, onChange);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener(LANG_EVENT, onChange);
    };
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ok */
    }
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: l }));
    // screen readers uitspreken de nieuwe taal correct uit
    document.documentElement.lang = l;
  };

  return [lang, setLang];
}

/** Taalwisselaar: compacte pill met vlagjes, overal in de navs te hangen. */
export default function LangSwitch({ className = "" }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <div
      className={`flex items-center gap-0.5 glass rounded p-[3px] border border-white/10 h-10 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          title={l.label}
          className={`h-9 px-2 rounded text-[12px] font-bold transition-colors ${
            lang === l.id ? "bg-yellow-400 text-black" : "text-slate-400 hover:bg-white/10"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/** Melding op gids-pagina's zolang die alleen Nederlands zijn. */
export function LangNotice() {
  const [lang] = useLang();
  if (lang === "nl") return null;
  return (
    <p className="max-w-6xl mx-auto px-4 sm:px-6 mt-3 text-[12px] text-slate-500 glass border border-white/10 rounded px-3.5 py-2 inline-block">
      {SHARED[lang].guideNote}
    </p>
  );
}
