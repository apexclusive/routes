"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronUp,
  Copy,
  LoaderCircle,
  MessageSquareHeart,
  Send,
  X,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { FEEDBACK_CATEGORIES, ROADMAP_OPTIONS } from "@/lib/feedback";

/** Feedback gaat naar het team; voorkeuren blijven daarnaast lokaal bewaard. */
const STORAGE_KEY = "apex-routes:feedback";
const VOTES_KEY = "apex-routes:roadmap-votes";

interface FeedbackEntry {
  id: string;
  category: string;
  text: string;
  at: number;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Privémodus: de UI blijft in het geheugen werken.
  }
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [category, setCategory] = useState("idee");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      const storedVotes = loadJson<Record<string, boolean>>(VOTES_KEY, {});
      const storedEntries = loadJson<FeedbackEntry[]>(STORAGE_KEY, []);
      setVotes(storedVotes && typeof storedVotes === "object" ? storedVotes : {});
      setEntries(Array.isArray(storedEntries) ? storedEntries.slice(0, 25) : []);
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleVote = (id: string) => {
    setVotes((current) => {
      const next = { ...current, [id]: !current[id] };
      saveJson(VOTES_KEY, next);
      trackEvent("Roadmap voorkeur", { item: id, selected: next[id] });
      return next;
    });
  };

  const selectedVotes = ROADMAP_OPTIONS.filter((item) => votes[item.id]).map((item) => item.id);

  const feedbackText = () => [
    `Apex Routes feedback [${category}]`,
    selectedVotes.length ? `Roadmap: ${selectedVotes.join(", ")}` : "Roadmap: geen keuze",
    "",
    text.trim(),
  ].join("\n");

  const submit = async () => {
    const clean = text.trim().slice(0, 500);
    if (clean.length < 3 || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, text: clean, votes: selectedVotes, website }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        fallback?: string;
        error?: string;
      } | null;
      if (response.ok && result?.ok) {
        const next = [
          { id: `fb-${Date.now()}`, category, text: clean, at: Date.now() },
          ...entries,
        ].slice(0, 25);
        setEntries(next);
        saveJson(STORAGE_KEY, next);
        setText("");
        setStatus("sent");
        trackEvent("Feedback verstuurd", { category });
        window.setTimeout(() => setStatus("idle"), 3500);
        return;
      }
      if (result?.fallback === "mailto") {
        window.location.href = `mailto:partners@apexclusive.nl?subject=${encodeURIComponent(`Apex feedback — ${category}`)}&body=${encodeURIComponent(feedbackText())}`;
        setStatus("idle");
        return;
      }
      throw new Error(result?.error || "Versturen is niet gelukt.");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Versturen is niet gelukt.");
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(feedbackText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setStatus("error");
      setError("Kopiëren is door je browser geblokkeerd.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Feedback geven"
        aria-expanded={open}
        title="Feedback & ideeën"
        className="fixed bottom-4 right-4 z-[1000] w-12 h-12 rounded btn-brand flex items-center justify-center shadow-xl shadow-black/50 print:hidden"
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquareHeart className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            role="dialog"
            aria-modal="false"
            aria-label="Feedback en ideeën"
            className="fixed bottom-20 right-4 z-[1000] w-[min(23rem,calc(100vw-2rem))] glass rounded border border-white/10 p-5 max-h-[72dvh] overflow-y-auto print:hidden"
          >
            <h2 className="font-display font-bold text-[16px] mb-1">Maak Apex beter</h2>
            <p className="text-[12px] text-slate-500 mb-4 leading-snug">
              Kies wat jij als volgende wilt en stuur een idee of probleem direct
              naar het team. Jouw keuzes staan lokaal; we verzinnen geen publiekscijfers.
            </p>

            <div className="space-y-1.5 mb-5">
              {ROADMAP_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleVote(item.id)}
                  className={`w-full text-left glass rounded border p-3 flex items-center gap-3 transition-colors ${
                    votes[item.id]
                      ? "border-yellow-400/50 bg-yellow-400/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  aria-pressed={Boolean(votes[item.id])}
                >
                  <span className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                    votes[item.id] ? "bg-yellow-400 text-black" : "bg-white/10 text-slate-400"
                  }`}>
                    {votes[item.id] ? <Check className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold truncate">{item.title}</span>
                    <span className="block text-[11px] text-slate-500 truncate">{item.note}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 mb-2" role="group" aria-label="Feedbackcategorie">
              {FEEDBACK_CATEGORIES.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                    category === item
                      ? "bg-yellow-400 text-black"
                      : "glass border border-white/10 text-slate-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="hidden" aria-hidden>
              <label>Website<input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} /></label>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit();
              }}
              rows={3}
              maxLength={500}
              placeholder="Wat kan beter? Wat mis je?"
              aria-label="Jouw feedback"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-[13px] outline-none focus:border-yellow-500/60 resize-y"
            />

            {status === "sent" && (
              <p className="text-[12px] text-yellow-300 flex items-center gap-1.5 mt-2" role="status">
                <Check className="w-3.5 h-3.5" /> Ontvangen — bedankt.
              </p>
            )}
            {status === "error" && (
              <p className="text-[12px] text-red-300 flex items-center gap-1.5 mt-2" role="alert">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}

            <button
              onClick={() => void submit()}
              disabled={text.trim().length < 3 || status === "sending"}
              className="btn-brand w-full mt-2 px-4 py-2.5 rounded text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {status === "sending" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {status === "sending" ? "Versturen…" : "Stuur naar het team"}
            </button>
            <button
              onClick={() => void copyAll()}
              className="btn-ghost w-full mt-2 px-4 py-2 rounded text-[12px] flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Gekopieerd" : "Kopieer als reserve"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
