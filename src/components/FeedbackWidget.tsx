"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareHeart, X, ChevronUp, Check, Copy } from "lucide-react";

/**
 * Feedback-bord: bezoekers kunnen stemmen op de roadmap en eigen ideeën
 * achterlaten. Local-first (geen server): feedback wordt lokaal bewaard en
 * kan met één klik gekopieerd worden om te versturen. Zo is het bord meteen
 * eerlijk: niks verdwijnt in een zwarte doos.
 */

const STORAGE_KEY = "apex-routes:feedback";

/** De roadmap waarop gestemd kan worden (met de stemmen van deze browser). */
const ROADMAP: { id: string; title: string; note: string }[] = [
  { id: "week-challenge", title: "Weekend-challenge", note: "Zaterdag rijdt iedereen dezelfde roulette-seed" },
  { id: "pdf-boek", title: "PDF-routeboek (Pro)", note: "Kaart, hoogteprofiel en afslagen als printbare pdf" },
  { id: "forum", title: "Community-forum", note: "Routes delen en bespreken met andere rijders" },
  { id: "weer-onderweg", title: "Weer per uur onderweg", note: "Regenradar langs de route op vertrektijd" },
  { id: "groepsrit", title: "Groepsrit-planner", note: "Startpunt delen, iedereen rijdt dezelfde route" },
];

interface FeedbackEntry {
  id: string;
  category: string;
  text: string;
  at: number;
}

function loadEntries(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is FeedbackEntry =>
        !!e && typeof e === "object" && typeof (e as FeedbackEntry).text === "string"
    );
  } catch {
    return [];
  }
}

function saveEntries(entries: FeedbackEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // privémodus — dan blijft feedback alleen in het geheugen
  }
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("idee");
  const [copied, setCopied] = useState(false);

  const toggleVote = (id: string) => {
    setVotes((v) => ({ ...v, [id]: !v[id] }));
  };

  const submit = () => {
    const t = text.trim();
    if (t.length < 3) return;
    const next = [
      { id: `fb-${Date.now()}`, category, text: t.slice(0, 500), at: Date.now() },
      ...entries,
    ].slice(0, 25);
    setEntries(next);
    saveEntries(next);
    setText("");
  };

  const copyAll = async () => {
    const votesTxt = ROADMAP.filter((r) => votes[r.id])
      .map((r) => `✦ ${r.title}`)
      .join("\n");
    const entriesTxt = entries
      .map((e) => `[${e.category}] ${e.text}`)
      .join("\n");
    const payload =
      `Apex Routes feedback\n\nGestemde wensen:\n${votesTxt || "(geen)"}\n\nMijn feedback:\n${
        entriesTxt || "(geen)"
      }`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // klembord geblokkeerd
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Feedback geven"
        title="Feedback &amp; ideeën"
        className="fixed bottom-4 right-4 z-[1000] w-12 h-12 rounded btn-brand flex items-center justify-center shadow-xl shadow-black/50 print:hidden"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageSquareHeart className="w-5 h-5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            role="dialog"
            aria-label="Feedback en ideeën"
            className="fixed bottom-20 right-4 z-[1000] w-[min(22rem,calc(100vw-2rem))] glass rounded border border-white/10 p-5 max-h-[70dvh] overflow-y-auto print:hidden"
          >
            <h2 className="font-display font-bold text-[16px] mb-1">
              Maak Apex beter
            </h2>
            <p className="text-[12px] text-slate-500 mb-4 leading-snug">
              Stem op de roadmap of laat je eigen idee achter. Bewaart lokaal —
              kopieer onderaan om het te versturen.
            </p>

            {/* roadmap */}
            <div className="space-y-1.5 mb-5">
              {ROADMAP.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggleVote(r.id)}
                  className={`w-full text-left glass rounded border p-3 flex items-center gap-3 transition-colors ${
                    votes[r.id]
                      ? "border-yellow-400/50 bg-yellow-400/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  aria-pressed={Boolean(votes[r.id])}
                >
                  <span
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                      votes[r.id] ? "bg-yellow-400 text-black" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold truncate">
                      {r.title}
                    </span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      {r.note}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* eigen feedback */}
            <div className="flex gap-1.5 mb-2">
              {["idee", "bug", "wens"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                    category === c
                      ? "bg-yellow-400 text-black"
                      : "glass border border-white/10 text-slate-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
              rows={3}
              maxLength={500}
              placeholder="Wat kan beter? Wat mis je?"
              aria-label="Jouw feedback"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-[13px] outline-none focus:border-yellow-500/60 resize-none"
            />
            <button
              onClick={submit}
              className="btn-brand w-full mt-2 px-4 py-2 rounded text-[13px] font-semibold"
            >
              Bewaren (op dit apparaat)
            </button>

            {entries.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-3 space-y-1.5 max-h-32 overflow-y-auto">
                {entries.map((e) => (
                  <p key={e.id} className="text-[12px] text-slate-400">
                    <span className="text-yellow-400/80 font-semibold uppercase mr-1.5">
                      {e.category}
                    </span>
                    {e.text}
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={copyAll}
              className="btn-ghost w-full mt-4 px-4 py-2 rounded text-[13px] flex items-center justify-center gap-2"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Gekopieerd — stuur het naar ons" : "Kopieer mijn feedback"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
