"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Footprints,
  Heart,
  MessageSquare,
  Plus,
  X,
  Camera,
  Search,
  Share2,
  Leaf,
  Users,
  Sparkles,
} from "lucide-react";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch, { LangNotice } from "./LangSwitch";
import {
  CATEGORY_LABELS,
  FORUM_RULES,
  decodeThreadHash,
  encodeThread,
  loadLikedIds,
  loadThreads,
  likeThread,
  makeThread,
  mergeShared,
  relTime,
  saveThreadsDroppingPhotos,
  sortThreads,
  tidyAuthor,
  withPost,
  type ForumCategory,
  type ForumThread,
} from "@/lib/forum";
import { getAccount } from "@/lib/account";

/**
 * Apex Forum — lokaal-eerst community voor rijders, fietsers en wandelaars.
 * Gesprekken leven in de browser; delen kan via een link (gesprek zit in de
 * URL-hash). Account (proefmaand) voorvult je naam.
 */
export default function Forum() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [filter, setFilter] = useState<"alle" | ForumCategory>("alle");
  const [zoek, setZoek] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shared, setShared] = useState<ForumThread | null>(null);
  const [now, setNow] = useState(0);
  const [author, setAuthor] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // nieuw gesprek
  const [draftOpen, setDraftOpen] = useState(false);
  const [dCat, setDCat] = useState<ForumCategory>("motor");
  const [dTitle, setDTitle] = useState("");
  const [dRegion, setDRegion] = useState("");
  const [dBody, setDBody] = useState("");
  const [dPhoto, setDPhoto] = useState<string | null>(null);
  const [dErr, setDErr] = useState("");

  // reactie
  const [replyBody, setReplyBody] = useState("");
  const [replyPhoto, setReplyPhoto] = useState<string | null>(null);
  const [rErr, setRErr] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setNow(Date.now());
      setThreads(loadThreads());
      setLiked(loadLikedIds());
      setAuthor(getAccount()?.name ?? "");
      // gedeeld gesprek in de URL?
      if (window.location.hash.startsWith("#f=")) {
        const decoded = decodeThreadHash(window.location.hash);
        if (decoded) {
          setShared(decoded);
          setOpenId(decoded.id);
        }
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(r);
  }, []);

  // Escape sluit het nieuwe-gesprek-paneel
  useEffect(() => {
    if (!draftOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDraftOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draftOpen]);

  const persist = (next: ForumThread[]) => {
    setThreads(next);
    saveThreadsDroppingPhotos(next);
  };

  /** Foto verkleinen naar een compacte data-url (max 720px, jpeg). */
  const shrink = (file: File, done: (dataUrl: string) => void) => {
    if (!file.type.startsWith("image/")) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 720 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = url;
  };

  const submitThread = () => {
    const t = makeThread(dCat, dTitle, author || "Gastrijder", dBody, dRegion);
    if (!t) {
      setDErr("Vul een titel (3+ tekens), je naam (2+) en een bericht in.");
      return;
    }
    if (dPhoto) t.posts[0] = { ...t.posts[0], photo: dPhoto };
    persist(sortThreads([t, ...threads]));
    setDraftOpen(false);
    setDTitle("");
    setDRegion("");
    setDBody("");
    setDPhoto(null);
    setDErr("");
    setOpenId(t.id);
  };

  const submitReply = (id: string) => {
    const thread = threads.find((x) => x.id === id);
    if (!thread) return;
    const next = withPost(thread, author || "Gastrijder", replyBody);
    if (!next) {
      setRErr("Je naam (2+ tekens) en een bericht zijn nodig.");
      return;
    }
    if (replyPhoto) {
      next.posts[next.posts.length - 1] = {
        ...next.posts[next.posts.length - 1],
        photo: replyPhoto,
      };
    }
    persist(threads.map((x) => (x.id === id ? next : x)));
    setReplyBody("");
    setReplyPhoto(null);
    setRErr("");
  };

  const doLike = (id: string) => {
    const next = likeThread(threads, id);
    if (next) {
      setThreads(next);
      setLiked(loadLikedIds());
    }
  };

  const doShare = async (thread: ForumThread) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/forum${encodeThread(thread)}`;
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedId(thread.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      if (typeof window !== "undefined") window.location.hash = encodeThread(thread).slice(1);
    }
  };

  const importShared = () => {
    if (!shared) return;
    persist(sortThreads(mergeShared(threads, shared)));
    setShared(null);
    if (typeof window !== "undefined") window.location.hash = "";
  };

  const q = zoek.trim().toLowerCase();
  const visible = threads.filter(
    (t) =>
      (filter === "alle" || t.category === filter) &&
      (!q ||
        t.title.toLowerCase().includes(q) ||
        (t.region ?? "").toLowerCase().includes(q) ||
        t.posts.some((p) => p.body.toLowerCase().includes(q)))
  );
  const counts = new Map<string, number>();
  for (const t of threads) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  const totalPosts = threads.reduce((n, t) => n + t.posts.length, 0);

  return (
    <div className="min-h-dvh bg-[#050507] text-slate-100">
      <ScrollProgress />
      <SkipLink />
      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">
            Apex Forum
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link
            href="/ontdek"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Route-atlas
          </Link>
          <Link
            href="/kalender"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Kalender
          </Link>
          <Link
            href="/ritbank"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex"
          >
            Ritbank
          </Link>
          <Link
            href="/checklist"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden lg:flex"
          >
            Checklist
          </Link>
          <LangSwitch className="hidden sm:flex" />
          <Link
            href="/"
            className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Naar de planner</span>
          </Link>
        </div>
      </nav>
      <LangNotice />

      {/* gedeeld gesprek */}
      <AnimatePresence>
        {shared && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 mt-4"
          >
            <div className="glass border border-yellow-400/30 rounded p-4 flex items-center justify-between gap-3">
              <p className="text-[13px] text-slate-300">
                <Sparkles className="w-4 h-4 inline text-yellow-400 mr-1" />
                Je bekijkt een <b>gedeeld gesprek</b>: “{shared.title}”. Voeg het
                toe aan je eigen forum om te reageren.
              </p>
              <button
                onClick={importShared}
                className="btn-brand px-3.5 py-2 rounded text-[13px] font-semibold shrink-0"
              >
                Toevoegen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hero */}
      <header className="relative z-10 px-4 sm:px-6 pt-12 pb-8 max-w-6xl mx-auto">
        <p className="eyebrow mb-3">
          Community · lokaal op je apparaat, delen via link
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display">
          Praathoek voor{" "}
          <span className="text-gradient">rijders &amp; wandelaars</span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-[15px] leading-relaxed">
          Routes delen, apps vergelijken, foto&apos;s van jouw mooiste
          kilometers. Dit forum groeit met je mee — alles blijft eerst in je
          eigen browser, en een gesprek delen kan gewoon per link.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="glass rounded border border-white/10 px-3.5 py-1.5 text-[12px] text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-yellow-400/80" />
            {threads.length} gesprekken · {totalPosts} berichten
          </span>
          {FORUM_RULES.map((rule) => (
            <span
              key={rule}
              className="glass rounded border border-white/10 px-3.5 py-1.5 text-[12px] text-slate-400"
            >
              {rule}
            </span>
          ))}
          <span className="glass rounded border border-emerald-400/25 px-3.5 py-1.5 text-[12px] text-emerald-300/90 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5" />
            Geniet van de natuur en ga erop uit
          </span>
        </div>
      </header>

      {/* controls */}
      <div className="relative z-10 px-4 sm:px-6 max-w-6xl mx-auto flex flex-wrap items-center gap-2 pb-6">
        <button
          onClick={() => setFilter("alle")}
          className={`px-3.5 py-1.5 rounded text-[13px] font-semibold transition-colors border ${
            filter === "alle"
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
              : "glass text-slate-400 border-white/10 hover:text-white"
          }`}
        >
          Alles ({threads.length})
        </button>
        {(Object.keys(CATEGORY_LABELS) as ForumCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3.5 py-1.5 rounded text-[13px] font-semibold transition-colors border ${
              filter === c
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
                : "glass text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[c].label} (
            {counts.get(c) ?? 0})
          </button>
        ))}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            aria-hidden
          />
          <input
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setZoek("");
            }}
            placeholder="Zoek in gesprekken..."
            aria-label="Zoek in gesprekken"
            className="w-full h-10 glass rounded border border-white/10 pl-9 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setDraftOpen(true)}
          className="btn-brand btn-shine px-4 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nieuw gesprek
        </button>
      </div>

      {/* draaden */}
      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pb-24 max-w-6xl mx-auto space-y-3">
        {!hydrated ? null : visible.length === 0 ? (
          <div className="glass rounded border border-white/10 p-10 text-center">
            <span className="w-14 h-14 mx-auto mb-3 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center" aria-hidden>
              <Footprints className="w-7 h-7 text-yellow-300" />
            </span>
            <p className="font-display font-bold text-lg">
              {q ? "Niets gevonden" : "Nog geen gesprekken in deze rubriek"}
            </p>
            <p className="text-slate-500 text-[13px] mt-1 mb-5">
              {q
                ? `Geen gesprekken bij “${zoek.trim()}” — probeer een ander woord of start zelf het gesprek.`
                : "Start de eerste — geniet van de natuur en ga erop uit."}
            </p>
            <button
              onClick={() => setDraftOpen(true)}
              className="btn-brand px-4 py-2.5 rounded text-[13px] font-semibold"
            >
              Nieuw gesprek
            </button>
          </div>
        ) : (
          visible.map((t) => {
            const open = openId === t.id;
            const isLiked = liked.includes(t.id);
            return (
              <motion.article
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded border overflow-hidden ${
                  t.team ? "border-yellow-400/20" : "border-white/10"
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/[0.07] text-slate-300">
                          {CATEGORY_LABELS[t.category].label}
                        </span>
                        {t.region && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white/[0.07] text-slate-400">
                            {t.region}
                          </span>
                        )}
                        {t.team && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 font-bold">
                            Apex-team
                          </span>
                        )}
                      </div>
                      <h2 className="font-display font-bold text-[17px] leading-snug">
                        {t.title}
                      </h2>
                      <p className="text-[12px] text-slate-500 mt-1">
                        {t.posts[0].author} · {now ? relTime(t.lastAt, now) : "…"} ·{" "}
                        {t.posts.length - 1} reactie{t.posts.length - 1 === 1 ? "" : "en"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => doLike(t.id)}
                        aria-label="Vind ik leuk"
                        className={`px-2.5 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
                          isLiked
                            ? "bg-red-500/15 text-red-300"
                            : "text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                        />
                        {t.likes}
                      </button>
                      <button
                        onClick={() => doShare(t)}
                        aria-label="Gesprek delen"
                        className="px-2.5 py-2 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {copiedId === t.id ? (
                          <span className="text-[12px] text-emerald-300 font-semibold">
                            Gekopieerd!
                          </span>
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!open && (
                    <p className="text-[13px] text-slate-400 mt-2.5 line-clamp-2">
                      {t.posts[0].body}
                    </p>
                  )}

                  <button
                    onClick={() => setOpenId(open ? null : t.id)}
                    className="mt-3 text-[13px] font-semibold text-yellow-400/90 hover:text-yellow-300 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {open ? "Inklappen" : "Lezen & reageren"}
                  </button>
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.07]"
                    >
                      <div className="p-4 sm:p-5 space-y-4">
                        {t.posts.map((p) => (
                          <div key={p.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-400/15 text-yellow-300 font-bold text-[13px] flex items-center justify-center shrink-0">
                              {p.author.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px]">
                                <b className="text-slate-200">{p.author}</b>{" "}
                                <span className="text-slate-600">
                                  · {now ? relTime(p.at, now) : "…"}
                                </span>
                              </p>
                              <p className="text-[14px] text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                {p.body}
                              </p>
                              {p.photo && (
                                // eslint-disable-next-line @next/next/no-img-element -- gebruikersfoto is een data-url, geen statisch asset
                                <img
                                  src={p.photo}
                                  alt={`Foto van ${p.author}`}
                                  className="mt-2 rounded border border-white/10 max-h-72 object-cover"
                                />
                              )}
                            </div>
                          </div>
                        ))}

                        {/* reageren */}
                        <div className="glass rounded border border-white/10 p-3.5">
                          <div className="flex flex-col sm:flex-row gap-2 mb-2">
                            <input
                              value={author}
                              onChange={(e) => setAuthor(tidyAuthor(e.target.value))}
                              placeholder="Je naam"
                              aria-label="Je naam"
                              className="sm:w-44 bg-white/5 border border-white/10 rounded px-3.5 py-2.5 text-[13px] outline-none focus:border-yellow-500/60"
                            />
                            <div className="flex-1" />
                            <input
                              ref={replyFileRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) shrink(f, setReplyPhoto);
                                e.target.value = "";
                              }}
                            />
                            <button
                              onClick={() => replyFileRef.current?.click()}
                              className={`px-3.5 py-2.5 rounded text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
                                replyPhoto
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "glass text-slate-400 hover:text-white"
                              }`}
                            >
                              <Camera className="w-4 h-4" />
                              {replyPhoto ? "Foto toegevoegd" : "Foto"}
                            </button>
                          </div>
                          {replyPhoto && (
                            // eslint-disable-next-line @next/next/no-img-element -- gebruikersfoto is een data-url
                            <img
                              src={replyPhoto}
                              alt="Voorbeeld van je foto"
                              className="mb-2 rounded border border-white/10 max-h-44 object-cover"
                            />
                          )}
                          <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value.slice(0, 2000))}
                            placeholder="Jouw reactie…"
                            aria-label="Jouw reactie"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded px-3.5 py-2.5 text-[14px] outline-none focus:border-yellow-500/60 resize-y"
                          />
                          {rErr && <p className="text-[12px] text-red-400 mt-1">{rErr}</p>}
                          <button
                            onClick={() => submitReply(t.id)}
                            className="btn-brand mt-2 px-4 py-2.5 rounded text-[13px] font-semibold"
                          >
                            Reageren
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })
        )}
      </main>

      {/* nieuw gesprek */}
      <AnimatePresence>
        {draftOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDraftOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Nieuw gesprek"
              className="glass w-full max-w-lg rounded border border-white/10 p-6 sm:p-7 max-h-[88dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl">Nieuw gesprek</h2>
                <button
                  onClick={() => setDraftOpen(false)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  aria-label="Sluiten"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(CATEGORY_LABELS) as ForumCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setDCat(c)}
                    className={`px-3 py-1.5 rounded text-[12px] font-semibold border transition-colors ${
                      dCat === c
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
                        : "glass text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {CATEGORY_LABELS[c].label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input
                  value={dTitle}
                  onChange={(e) => setDTitle(e.target.value.slice(0, 80))}
                  placeholder="Waar gaat het over? (bijv. Mooiste B-wegen in de Eifel)"
                  aria-label="Titel"
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm outline-none focus:border-yellow-500/60"
                />
                <div className="flex gap-2">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(tidyAuthor(e.target.value))}
                    placeholder="Je naam"
                    aria-label="Je naam"
                    className="w-40 bg-white/5 border border-white/10 rounded px-4 py-3 text-sm outline-none focus:border-yellow-500/60"
                  />
                  <input
                    value={dRegion}
                    onChange={(e) => setDRegion(e.target.value.slice(0, 40))}
                    placeholder="Regio (optioneel)"
                    aria-label="Regio"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-3 text-sm outline-none focus:border-yellow-500/60"
                  />
                </div>
                <textarea
                  value={dBody}
                  onChange={(e) => setDBody(e.target.value.slice(0, 2000))}
                  placeholder="Vertel — wat, waar, waarom moeten anderen dit rijden of lopen?"
                  aria-label="Bericht"
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm outline-none focus:border-yellow-500/60 resize-y"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) shrink(f, setDPhoto);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className={`px-4 py-2.5 rounded text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
                    dPhoto
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "glass text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {dPhoto ? "Foto toegevoegd" : "Foto toevoegen (optioneel)"}
                </button>
                {dPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element -- gebruikersfoto is een data-url
                  <img
                    src={dPhoto}
                    alt="Voorbeeld van je foto"
                    className="rounded border border-white/10 max-h-44 object-cover"
                  />
                )}
                {dErr && <p className="text-[12px] text-red-400">{dErr}</p>}
                <button
                  onClick={submitThread}
                  className="btn-brand btn-shine w-full px-5 py-3 rounded font-semibold"
                >
                  Gesprek starten
                </button>
                <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                  Alles blijft in je eigen browser (en in de deellink die je
                  maakt). Wees aardig voor elkaar.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* footer */}
      <footer className="relative z-10 px-6 py-10 border-t border-white/[0.07] text-center">
        <p className="text-[13px] text-slate-500">
          Apex Forum · onderdeel van{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-yellow-400">
            Apex Routes
          </Link>{" "}
          ·{" "}
          <Link href="/kalender" className="underline underline-offset-2 hover:text-yellow-400">
            Kalender
          </Link>{" "}
          ·{" "}
          <Link href="/advies" className="underline underline-offset-2 hover:text-yellow-400">
            Advisor
          </Link>
        </p>
        <p className="text-[12px] text-slate-600 mt-2">
          Steun ons — je bijdrage helpt routingcapaciteit, datakwaliteit en routeonderzoek betalen.{" "}
          <Link href="/prijzen" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
      </footer>
    </div>
  );
}
