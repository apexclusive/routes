"use client";

import { useEffect, useState } from "react";
import { Share2, Link2, Check, MessageCircle, Send } from "lucide-react";
import { buildShareUrls } from "@/lib/share";

/**
 * Delen met fallback: Web Share API waar beschikbaar, anders
 * kopieerlink + WhatsApp / X / e-mail.
 */
export default function ShareButton({
  titel,
  pad,
  tekst,
  compact = false,
}: {
  titel: string;
  pad: string;
  tekst?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(pad);

  // absolute url zodra de client leeft (rAF i.v.m. React-compiler)
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setUrl(new URL(pad, window.location.origin).toString());
    });
    return () => cancelAnimationFrame(r);
  }, [pad]);

  const links = buildShareUrls(titel, url, tekst);

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Kopieer deze link:", url);
    }
  };

  const nativeDeel = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: titel, text: tekst ?? titel, url });
        return;
      } catch {
        /* gebruiker annuleerde — knoppen blijven beschikbaar */
      }
    }
    await kopieer();
  };

  if (compact) {
    return (
      <button
        onClick={() => void nativeDeel()}
        aria-label={`Deel ${titel}`}
        className="glass border border-white/10 hover:border-yellow-400/50 px-4 py-2.5 rounded font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
      >
        <Share2 className="w-4 h-4 text-yellow-300" aria-hidden />
        Deel
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => void nativeDeel()}
        className="glass border border-white/10 hover:border-yellow-400/50 px-4 py-2.5 rounded font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
      >
        <Share2 className="w-4 h-4 text-yellow-300" aria-hidden />
        Deel
      </button>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Deel via WhatsApp"
        className="glass border border-white/10 hover:border-yellow-400/50 w-10 h-10 rounded flex items-center justify-center transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-slate-300" aria-hidden />
      </a>
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Deel op X"
        className="glass border border-white/10 hover:border-yellow-400/50 w-10 h-10 rounded flex items-center justify-center transition-colors font-display font-bold text-[13px] text-slate-300"
      >
        X
      </a>
      <a
        href={links.mail}
        aria-label="Deel via e-mail"
        className="glass border border-white/10 hover:border-yellow-400/50 w-10 h-10 rounded flex items-center justify-center transition-colors"
      >
        <Send className="w-4 h-4 text-slate-300" aria-hidden />
      </a>
      <button
        onClick={() => void kopieer()}
        aria-label="Kopieer link"
        className={`glass border w-10 h-10 rounded flex items-center justify-center transition-colors ${
          copied ? "border-yellow-400/60" : "border-white/10 hover:border-yellow-400/50"
        }`}
      >
        {copied ? <Check className="w-4 h-4 text-yellow-300" aria-hidden /> : <Link2 className="w-4 h-4 text-slate-300" aria-hidden />}
      </button>
    </div>
  );
}
