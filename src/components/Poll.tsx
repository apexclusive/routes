"use client";

import { useEffect, useState } from "react";
import { Check, BarChart3, ShieldCheck } from "lucide-react";

const PREFIX = "apex-routes:poll:";

/**
 * Lokale peiling zonder verzonnen publiekscijfers. Een keuze wordt op dit
 * apparaat onthouden; zodra centrale, privacyvriendelijke telling actief is
 * kan dezelfde UI echte totalen tonen.
 */
export default function Poll({
  id,
  question,
  options,
  compact = false,
}: {
  id: string;
  question: string;
  options: string[];
  compact?: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(null);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(PREFIX + id);
        if (raw !== null) {
          const parsed = Number(raw);
          if (Number.isInteger(parsed) && parsed >= 0 && parsed < options.length) {
            setChoice(parsed);
          }
        }
      } catch {
        /* privémodus */
      }
    });
    return () => cancelAnimationFrame(r);
  }, [id, options.length]);

  const vote = (i: number) => {
    setChoice(i);
    try {
      localStorage.setItem(PREFIX + id, String(i));
    } catch {
      /* de keuze blijft dan alleen voor deze sessie zichtbaar */
    }
  };

  return (
    <div className={compact ? "glass rounded-[22px] border border-white/10 p-4" : "lux-card p-6"}>
      <p className="text-[13px] font-semibold flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-yellow-400 shrink-0" />
        {question}
      </p>
      <div className="space-y-1.5">
        {options.map((option, i) => {
          const selected = choice === i;
          return (
            <button
              key={option}
              onClick={() => vote(i)}
              data-track="Peiling gestemd"
              data-track-poll={id}
              data-track-option={String(i + 1)}
              aria-pressed={selected}
              className={`w-full text-left rounded border px-3.5 py-2.5 transition-colors ${
                selected
                  ? "border-yellow-400/60 bg-yellow-400/[0.10] text-yellow-100"
                  : "border-white/10 hover:border-white/30 text-slate-300"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium truncate">{option}</span>
                <span
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    selected
                      ? "bg-yellow-400 border-yellow-400 text-black"
                      : "border-white/20 text-transparent"
                  }`}
                  aria-hidden
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-3 flex items-start gap-1.5 leading-relaxed">
        <ShieldCheck className="w-3.5 h-3.5 text-yellow-400/70 shrink-0 mt-px" aria-hidden />
        {choice === null
          ? "Kies anoniem. We tonen pas publiekspercentages zodra er een echte centrale telling is."
          : `Bedankt — jouw keuze “${options[choice]}” is op dit apparaat bewaard. Geen verzonnen stemmen.`}
      </p>
    </div>
  );
}
