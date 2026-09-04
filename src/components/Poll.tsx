"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { tally } from "@/lib/polls";

const PREFIX = "apex-routes:poll:";

/** Eenvoudige peiling: stem lokaal, uitslag direct zichtbaar met balken. */
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
        if (raw !== null) setChoice(Number(raw));
      } catch {
        /* privémodus */
      }
    });
    return () => cancelAnimationFrame(r);
  }, [id]);

  const vote = (i: number) => {
    setChoice(i);
    try {
      localStorage.setItem(PREFIX + id, String(i));
    } catch {
      /* weg ermee */
    }
  };

  const localVotes = choice === null ? null : options.map((_, i) => (i === choice ? 1 : 0));
  const result = tally(id, options, localVotes);
  const voted = choice !== null;

  return (
    <div className={compact ? "glass rounded-[22px] border border-white/10 p-4" : "lux-card p-6"}>
      <p className="text-[13px] font-semibold flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-yellow-400 shrink-0" />
        {question}
      </p>
      <div className="space-y-1.5">
        {options.map((o, i) => {
          const isWinner = voted && result.winner === i;
          return (
            <button
              key={o}
              onClick={() => vote(i)}
              aria-pressed={choice === i}
              className={`w-full text-left relative overflow-hidden rounded border px-3.5 py-2.5 transition-colors ${
                choice === i
                  ? "border-yellow-400/60"
                  : voted
                    ? "border-white/10"
                    : "border-white/10 hover:border-white/30"
              }`}
            >
              {voted && (
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${result.percentages[i]}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 ${
                    isWinner ? "bg-yellow-400/25" : "bg-white/[0.06]"
                  }`}
                  aria-hidden
                />
              )}
              <span className="relative flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium truncate">
                  {voted && isWinner && <span className="text-yellow-300 mr-1">★</span>}
                  {o}
                </span>
                {voted && (
                  <span className="text-[12px] text-slate-400 shrink-0 tabular-nums">
                    {result.percentages[i]}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-600 mt-2.5">
        {voted
          ? `${result.total} stemmen · jij koos "${options[choice!]}"`
          : "Stem anoniem — de uitslag zie je direct."}
      </p>
    </div>
  );
}
