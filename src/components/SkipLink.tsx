"use client";

import { useEffect, useState } from "react";
import { SHARED } from "@/lib/i18n";
import { detectLang } from "./LangSwitch";

/**
 * Skip-link: voor toetsenbord- en screenreader-gebruikers de eerste tab-stop —
 * springt direct naar de hoofdinhoud (het eerste content-blok op de pagina).
 */
export default function SkipLink({ target = "#apex-main" }: { target?: string }) {
  const [lang, setLang] = useState<"nl" | "en" | "fr" | "de">("nl");
  useEffect(() => {
    const r = requestAnimationFrame(() => setLang(detectLang()));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <a
      href={target}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded focus:bg-[#ffe600] focus:text-black focus:font-bold focus:text-sm"
    >
      {SHARED[lang].skip}
    </a>
  );
}
