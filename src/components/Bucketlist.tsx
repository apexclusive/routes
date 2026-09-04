"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Plus, Sparkles, X } from "lucide-react";
import { BUCKETLIST_SEEDS, progressOf, type BucketItem } from "@/lib/nl";
import { setPendingPrompt } from "@/lib/filehandoff";
import { fireConfetti } from "@/lib/confetti";

interface StoredBucket {
  done: string[];
  custom: BucketItem[];
}

const KEY = "apex-routes:bucketlist";

function load(): StoredBucket {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { done: [], custom: [] };
    const p = JSON.parse(raw) as Partial<StoredBucket>;
    return {
      done: Array.isArray(p.done) ? p.done.filter((x) => typeof x === "string") : [],
      custom: Array.isArray(p.custom) ? p.custom : [],
    };
  } catch {
    return { done: [], custom: [] };
  }
}

function save(state: StoredBucket) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* privémodus */
  }
}

/** Jouw route-bucketlist: afvinken, aanvullen, en confetti bij een volle bak. */
export default function Bucketlist() {
  const router = useRouter();
  const [state, setState] = useState<StoredBucket>({ done: [], custom: [] });
  const [newLabel, setNewLabel] = useState("");
  const celebratedRef = useRef(false);
  const customCounterRef = useRef(0);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      const s = load();
      setState(s);
      if (s.done.length >= BUCKETLIST_SEEDS.length + s.custom.length && s.done.length > 0) {
        celebratedRef.current = true; // al eerder vol — niet opnieuw vieren
      }
    });
    return () => cancelAnimationFrame(r);
  }, []);

  const items = [...BUCKETLIST_SEEDS, ...state.custom];
  const doneCount = items.filter((i) => state.done.includes(i.id)).length;
  const progress = progressOf(doneCount, items.length);
  const complete = doneCount === items.length && items.length > 0;

  const update = (next: StoredBucket) => {
    setState(next);
    save(next);
    const total = BUCKETLIST_SEEDS.length + next.custom.length;
    const done = next.done.length;
    if (done === total && total > 0 && !celebratedRef.current) {
      celebratedRef.current = true;
      fireConfetti({ count: 160 });
    }
  };

  const toggle = (id: string) => {
    const done = state.done.includes(id)
      ? state.done.filter((d) => d !== id)
      : [...state.done, id];
    update({ ...state, done });
  };

  const addCustom = () => {
    const label = newLabel.trim();
    if (label.length < 3) return;
    customCounterRef.current += 1;
    update({
      ...state,
      custom: [
        ...state.custom,
        { id: `c-${customCounterRef.current}`, label: label.slice(0, 80) },
      ],
    });
    setNewLabel("");
  };

  const removeCustom = (id: string) => {
    update({
      done: state.done.filter((d) => d !== id),
      custom: state.custom.filter((c) => c.id !== id),
    });
  };

  const rideNow = (prompt: string) => {
    setPendingPrompt(prompt);
    router.push("/?rit=1");
  };

  // ring-geometrie
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="lux-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        {/* voortgangsring */}
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
            <motion.circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke="#ffe600"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - progress) }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-xl leading-none">
              {Math.round(progress * 100)}%
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              gereden
            </span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-display font-bold text-xl flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
            Jouw route-bucketlist
          </h3>
          <p className="text-[13px] text-slate-400 mt-1 max-w-md leading-relaxed">
            {doneCount} van de {items.length} afgevinkt.{" "}
            {complete
              ? "Voltooid — leg de sleutel neer en ga verslag doen op de Ritbank."
              : "Vink af wat je gereden hebt, voeg je eigen dromen toe."}
          </p>
        </div>
      </div>

      <ul className="grid sm:grid-cols-2 gap-2">
        {items.map((item) => {
          const done = state.done.includes(item.id);
          return (
            <li
              key={item.id}
              className={`glass rounded-[18px] border p-3 flex items-center gap-3 transition-colors ${
                done ? "border-yellow-400/40 bg-yellow-400/[0.06]" : "border-white/10"
              }`}
            >
              <button
                onClick={() => toggle(item.id)}
                aria-pressed={done}
                aria-label={`${done ? "Afvinken: " : "Aangevinkt: "}${item.label}`}
                className={`w-6 h-6 rounded shrink-0 flex items-center justify-center border transition-all ${
                  done
                    ? "bg-yellow-400 border-yellow-400 text-black"
                    : "border-white/25 hover:border-yellow-400/60"
                }`}
              >
                {done && <Check className="w-3.5 h-3.5" strokeWidth={3.5} />}
              </button>
              <span
                className={`text-[14px] flex-1 min-w-0 leading-snug ${
                  done ? "text-slate-400 line-through decoration-yellow-400/60" : "text-slate-200"
                }`}
              >
                {item.label}
              </span>
              {item.prompt && (
                <button
                  onClick={() => rideNow(item.prompt!)}
                  className="text-[11px] font-bold text-yellow-400/90 hover:text-yellow-300 shrink-0 px-2 py-1 rounded hover:bg-yellow-400/10"
                  title="Nu rijden in de planner"
                >
                  rij →
                </button>
              )}
              {!item.prompt && item.id.startsWith("c-") && (
                <button
                  onClick={() => removeCustom(item.id)}
                  aria-label="Verwijderen"
                  className="p-1 text-slate-600 hover:text-red-400 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2 mt-4">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Voeg je eigen droomrit toe…"
          aria-label="Nieuw bucketlist-item"
          maxLength={80}
          className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2.5 text-[13px] outline-none focus:border-yellow-500/60"
        />
        <button
          onClick={addCustom}
          className="btn-brand px-4 py-2.5 rounded text-[13px] font-semibold shrink-0 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Toevoegen
        </button>
      </div>
    </div>
  );
}
