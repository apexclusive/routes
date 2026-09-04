"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Link2,
  Check,
  MessageCircle,
  Heart,
  Send,
  Users,
  ImagePlus,
  Play,
  Square,
} from "lucide-react";
import { haversineKm } from "@/lib/routing";
import { getProState, tierOf } from "@/lib/pro";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch, { LangNotice } from "./LangSwitch";
import { listSavedRoutes, type StoredRoute } from "@/lib/storage";
import { encodeRoute, decodeRoute, buildShareUrl } from "@/lib/share";
import { formatDistance } from "@/lib/routing";

/**
 * Ritbank — de community-hub. Delen werkt volledig zonder server: een
 * deel-link bevat de hele route (gecomprimeerd in de URL). Stuur hem via
 * WhatsApp/groepen; hier plak je een link van een ander om de route te
 * openen. Het prikbord bewaart reacties lokaal — zodra er een backend
 * aangaat (Supabase) verhuizen ze mee.
 */

const WALL_KEY = "apex-routes:wall";

/** Categorieën op het prikbord — van motor tot wandelen. */
const CATEGORIES = ["Motor", "Auto", "Wandelen", "Fietsen", "Algemeen"] as const;
type Category = (typeof CATEGORIES)[number];

interface WallNote {
  id: string;
  rider: string;
  text: string;
  at: number;
  hearts: number;
  heartedByMe: boolean;
  cat: Category;
  /** optionele foto (verkleinde data-url, blijft in deze browser) */
  photo?: string;
}

function loadWall(): WallNote[] {
  try {
    const raw = localStorage.getItem(WALL_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is WallNote =>
        !!n && typeof n === "object" && typeof (n as WallNote).text === "string"
    );
  } catch {
    return [];
  }
}

function saveWall(notes: WallNote[]): boolean {
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false; // quota vol of privémodus
  }
}

export default function Ritbank() {
  const router = useRouter();
  const [routes, setRoutes] = useState<StoredRoute[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [pasteOk, setPasteOk] = useState<string | null>(null);
  const [notes, setNotes] = useState<WallNote[]>([]);
  const [rider, setRider] = useState("");
  const [note, setNote] = useState("");
  const [cat, setCat] = useState<Category>("Motor");
  const [filter, setFilter] = useState<Category | "Alles">("Alles");
  const [zoek, setZoek] = useState("");
  const [isPro, setIsPro] = useState(false);
  // rit-opname (REVER/Calimoto-stijl, maar lokaal en gratis)
  const [rec, setRec] = useState<"idle" | "opname" | "fout">("idle");
  const [recKm, setRecKm] = useState(0);
  const [recSec, setRecSec] = useState(0);
  const [recMsg, setRecMsg] = useState("");
  const watchId = useRef<number | null>(null);
  const tickId = useRef<number | null>(null);
  const trackPts = useRef<{ lat: number; lng: number }[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (tickId.current !== null) window.clearInterval(tickId.current);
    },
    []
  );

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setIsPro(tierOf(getProState()) !== "free");
    });
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setRoutes(listSavedRoutes());
      setNotes(loadWall());
    });
    return () => cancelAnimationFrame(r);
  }, []);

  const shareLinkFor = (r: StoredRoute) => {
    const { hash } = encodeRoute({
      name: r.name,
      vehicle: r.vehicle,
      waypoints: r.waypoints.map((w) => ({ name: w.name, coordinates: w.coordinates })),
      geometry: r.geometry,
      imported: r.imported,
    });
    return buildShareUrl(window.location.origin, "/", hash);
  };

  const copyLink = async (r: StoredRoute) => {
    const url = shareLinkFor(r);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Kopieer je deel-link:", url);
    }
    setCopiedId(r.id);
    window.setTimeout(() => setCopiedId(null), 2200);
  };

  const tryOpenPaste = () => {
    const raw = pasteValue.trim();
    if (!raw) return;
    const hash = raw.includes("#") ? raw.slice(raw.indexOf("#")) : raw;
    const decoded = decodeRoute(hash);
    if (!decoded) {
      setPasteError("Dit is geen geldige Apex deel-link. Vraag om de volledige link.");
      setPasteOk(null);
      return;
    }
    setPasteError("");
    setPasteOk(decoded.name);
    router.push(`/${hash}`);
  };

  /** Foto verkleinen naar een compacte data-url (max 720px, jpeg). */
  const onPhoto = (file: File) => {
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
      setPhoto(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = url;
  };

  const startRec = () => {
    if (!("geolocation" in navigator)) {
      setRec("fout");
      setRecMsg("Deze browser ondersteunt geen locatie-opname.");
      return;
    }
    trackPts.current = [];
    setRecKm(0);
    setRecSec(0);
    setRecMsg("");
    setRec("opname");
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (Number.isFinite(accuracy) && accuracy > 75) return; // ruis weg
        const pts = trackPts.current;
        const last = pts[pts.length - 1];
        if (last && haversineKm(last, { lat, lng }) < 0.005) return; // < 5 m
        pts.push({ lat, lng });
        let km = 0;
        for (let i = 1; i < pts.length; i++) km += haversineKm(pts[i - 1], pts[i]);
        setRecKm(km);
      },
      (err) => {
        setRec("fout");
        setRecMsg(
          err.code === err.PERMISSION_DENIED
            ? "Locatie geweigerd — sta locatie toe in de browserbalk en probeer opnieuw."
            : "Geen locatie-signaal — probeer het buiten of met beter zicht op de hemel."
        );
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    tickId.current = window.setInterval(() => setRecSec((t) => t + 1), 1000);
  };

  const stopRec = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (tickId.current !== null) {
      window.clearInterval(tickId.current);
      tickId.current = null;
    }
    const km = recKm;
    setRec("idle");
    if (km >= 0.1) {
      const min = Math.max(1, Math.round(recSec / 60));
      setNote(`Rit opgenomen met Apex: ${km.toFixed(1).replace(".", ",")} km in ${min} min`);
      setRecMsg("Klaar — het verslag staat klaar in het veld: voeg je naam toe en plak.");
    } else {
      setRecMsg("Te weinig beweging opgenomen om een verslag van te maken.");
    }
  };

  const addNote = () => {
    const t = note.trim();
    if (t.length < 3) return;
    const entry: WallNote = {
      id: `n-${Date.now()}`,
      rider: rider.trim().slice(0, 40) || "Anonieme rijder",
      text: t.slice(0, 300),
      at: Date.now(),
      hearts: 0,
      heartedByMe: false,
      cat,
    };
    if (photo) entry.photo = photo;
    let next = [entry, ...notes].slice(0, 50);
    setNotes(next);
    if (!saveWall(next)) {
      // quota vol: nog een keer zonder foto's van vóór deze poging
      next = next.map((n, i) => (i > 0 ? { ...n, photo: undefined } : n));
      setNotes(next);
      saveWall(next);
    }
    setNote("");
    setPhoto(null);
  };

  const toggleHeart = (id: string) => {
    const next = notes.map((n) =>
      n.id === id
        ? { ...n, heartedByMe: !n.heartedByMe, hearts: n.hearts + (n.heartedByMe ? -1 : 1) }
        : n
    );
    setNotes(next);
    saveWall(next);
  };

  return (
    <div className="min-h-dvh text-white grain relative overflow-x-clip bg-[#050507]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[#ffe600]/[0.12] top-[-180px] right-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={38} />
          <span className="text-lg font-bold tracking-tight font-display">
            Ritbank
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
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

      {/* hero */}
      <section id="apex-main" className="relative z-10 px-6 pt-14 pb-10 max-w-3xl mx-auto text-center">
        <span className="eyebrow block mb-3">RITBANK /</span>
        <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded text-[12px] text-slate-300 mb-6 border border-white/10">
          <Users className="w-3.5 h-3.5 text-yellow-400" />
          Community · delen zonder server
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] font-display mb-5">
          Deel je <span className="text-gradient">mooiste ritten</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-[15px] leading-relaxed">
          Elke Apex-route past in één link — geen account, geen upload. Stuur hem
          naar je rijgroep, plak hier een link van een ander, of hang je rit aan
          het prikbord.
        </p>
      </section>

      <section className="relative z-10 px-4 sm:px-6 pb-14 max-w-5xl mx-auto grid md:grid-cols-2 gap-3">
        {/* jouw routes delen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lux-card p-6"
        >
          <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
            <Link2 className="w-4.5 h-4.5 text-yellow-400" />
            Jouw routes → link
          </h2>
          <p className="text-[13px] text-slate-500 mb-4">
            Alles wat je in de planner hebt bewaard, staat hier. Eén klik = deel-link.
          </p>
          {routes.length === 0 ? (
            <p className="text-[13px] text-slate-500 glass rounded border border-white/10 p-4 leading-relaxed">
              Nog niets bewaard. Bouw een route in de{" "}
              <Link href="/" className="text-yellow-400 underline underline-offset-2">
                planner
              </Link>{" "}
              en klik daar op *Bewaar*.
            </p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {routes.map((r) => (
                <li
                  key={r.id}
                  className="glass rounded border border-white/10 p-3.5 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold truncate">{r.name}</p>
                    <p className="text-[12px] text-slate-500">
                      {r.distance ? formatDistance(r.distance) : `${r.waypoints.length} punten`}
                      {" · "}
                      {new Date(r.savedAt).toLocaleDateString("nl-NL")}
                    </p>
                  </div>
                  <button
                    onClick={() => copyLink(r)}
                    className={`px-3.5 py-2 rounded text-[13px] font-semibold shrink-0 flex items-center gap-1.5 ${
                      copiedId === r.id ? "bg-yellow-400 text-black" : "btn-ghost"
                    }`}
                  >
                    {copiedId === r.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                    {copiedId === r.id ? "Gekopieerd" : "Deel-link"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* link van ander openen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="lux-card p-6"
        >
          <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
            <Send className="w-4.5 h-4.5 text-yellow-400" />
            Link van een ander
          </h2>
          <p className="text-[13px] text-slate-500 mb-4">
            Kreeg een Apex-link via de groep? Plak hem hier en rij hem vandaag nog.
          </p>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            rows={3}
            placeholder="https://routes.apexclusive.nl/#..."
            aria-label="Deel-link plakken"
            className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-[13px] outline-none focus:border-yellow-500/60 resize-none font-mono"
          />
          {pasteError && <p className="text-[12px] text-red-400 mt-2">{pasteError}</p>}
          {pasteOk && !pasteError && (
            <p className="text-[12px] text-yellow-400 mt-2">
              ✓ {pasteOk} gevonden — momentje…
            </p>
          )}
          <button
            onClick={tryOpenPaste}
            className="btn-brand btn-shine w-full mt-3 px-5 py-3 rounded font-semibold text-sm"
          >
            Open deze route
          </button>
          <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
            Een link bevat alleen de routepunten en de routevorm — geen
            persoonlijke data, en hij verloopt nooit.
          </p>
        </motion.div>

        {/* prikbord */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lux-card p-6 md:col-span-2"
        >
          {/* rit-opname: live km en tijd, direct als verslag naar het prikbord */}
          <div className="glass rounded border border-white/10 p-3.5 mb-4 flex flex-wrap items-center gap-3">
            {rec === "opname" ? (
              <>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" aria-hidden />
                <span className="font-mono text-[15px] font-bold text-yellow-300">
                  {recKm.toFixed(1).replace(".", ",")} km
                </span>
                <span className="font-mono text-[13px] text-slate-400">
                  {String(Math.floor(recSec / 60)).padStart(2, "0")}:
                  {String(recSec % 60).padStart(2, "0")}
                </span>
                <button
                  onClick={stopRec}
                  className="btn-brand px-4 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5" aria-hidden />
                  Stop en maak verslag
                </button>
              </>
            ) : (
              <button
                onClick={startRec}
                className="px-4 py-2 rounded text-[13px] font-semibold glass border border-white/10 hover:border-yellow-400/50 flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-yellow-400" aria-hidden />
                Rit opnemen
              </button>
            )}
            {recMsg && (
              <span className={`text-[12px] ${rec === "fout" ? "text-orange-300" : "text-slate-500"}`}>
                {recMsg}
              </span>
            )}
          </div>

          <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
            <MessageCircle className="w-4.5 h-4.5 text-yellow-400" />
            Prikbord
          </h2>
          <p className="text-[13px] text-slate-500 mb-4">
            Roep iets de wereld in: wie rijdt er zaterdag, welke route is nu het
            mooist, waar zit de nieuwe koffiestop? (Nog lokaal op dit apparaat —
            het echte forum met accounts komt met de community-server.)
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={`px-3 py-1.5 rounded text-[12px] font-semibold ${
                  cat === c ? "bg-yellow-400 text-black" : "glass border border-white/10 text-slate-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              value={rider}
              onChange={(e) => setRider(e.target.value)}
              placeholder="Je (rij)naam"
              aria-label="Je naam"
              className="sm:w-48 bg-white/5 border border-white/10 rounded px-3.5 py-2.5 text-[13px] outline-none focus:border-yellow-500/60"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder="Wie rijdt er zaterdag mee door de Ardennen?"
              aria-label="Je bericht"
              maxLength={300}
              className="flex-1 bg-white/5 border border-white/10 rounded px-3.5 py-2.5 text-[13px] outline-none focus:border-yellow-500/60"
            />
            <label className="glass border border-white/10 rounded px-3 py-2.5 text-[13px] font-semibold text-slate-300 cursor-pointer flex items-center gap-1.5 shrink-0 hover:border-yellow-400/50 transition-colors">
              <ImagePlus className="w-4 h-4 text-yellow-400" />
              {photo ? "Foto klaar" : "Foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhoto(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={addNote}
              className="btn-brand px-4 py-2.5 rounded text-[13px] font-semibold shrink-0"
            >
              Prikken
            </button>
          </div>
          {photo && (
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Voorbeeld van je foto" className="h-16 w-24 object-cover rounded border border-white/10" />
              <button onClick={() => setPhoto(null)} className="text-[12px] text-slate-500 hover:text-red-400">
                foto verwijderen
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(["Alles", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={`px-3 py-1 rounded text-[12px] font-semibold ${
                  filter === c ? "bg-white/15 text-white" : "text-slate-500 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
            <div className="relative flex-1 min-w-[160px]">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                aria-hidden
              />
              <input
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setZoek("");
                }}
                placeholder="Zoek in ritverslagen..."
                aria-label="Zoek in ritverslagen"
                className="w-full h-8 glass rounded border border-white/10 pl-8 pr-2.5 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-yellow-400/50 transition-colors"
              />
            </div>
          </div>

          {notes.length === 0 ? (
            <p className="text-[13px] text-slate-600">
              Nog leeg — jij mag de eerste zijn.
            </p>
          ) : (
            <ul className="space-y-2">
              {notes
                .filter((n) => filter === "Alles" || n.cat === filter)
                .filter((n) => {
                  const q = zoek.trim().toLowerCase();
                  return !q || n.rider.toLowerCase().includes(q) || n.text.toLowerCase().includes(q);
                })
                .map((n) => (
                <li
                  key={n.id}
                  className="glass rounded border border-white/10 p-4 flex items-start gap-3"
                >
                  <span className="w-9 h-9 rounded-full bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-[13px] font-bold text-yellow-300 shrink-0">
                    {n.rider.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px]">
                      <b className="text-yellow-300">{n.rider}</b>
                      {isPro && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-yellow-300 border border-yellow-400/40 bg-yellow-400/10 align-middle">
                          PRO
                        </span>
                      )}{" "}
                      <span className="text-yellow-400/70 text-[11px] uppercase tracking-wide font-bold ml-1.5">
                        {n.cat}
                      </span>
                      <span className="text-slate-600 text-[11px] ml-1">
                        {new Date(n.at).toLocaleString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                    <p className="text-[14px] text-slate-300 leading-snug mt-0.5 break-words">
                      {n.text}
                    </p>
                    {n.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.photo}
                        alt={`Foto bij bericht van ${n.rider}`}
                        className="mt-2 max-h-64 rounded-sm border border-white/10 object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => toggleHeart(n.id)}
                    aria-label="Vinden ze leuk"
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[12px] font-semibold shrink-0 ${
                      n.heartedByMe ? "bg-yellow-400 text-black" : "glass border border-white/10 text-slate-400"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${n.heartedByMe ? "fill-black" : ""}`}
                    />
                    {n.hearts}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </section>

      <footer className="relative z-10 px-6 py-10 border-t border-white/[0.07] text-center">
        <p className="text-[12px] text-slate-600 max-w-md mx-auto leading-relaxed">
          Praten over routes? Het{" "}
          <Link href="/forum" className="underline underline-offset-2 hover:text-yellow-400">
            Apex Forum
          </Link>{" "}
          is er nu — gesprekken delen via een link. Volgende stap: een echte
          community-server (accounts, gedeelde routebank met zoekfunctie).
        </p>
        <p className="text-[12px] text-slate-500 mt-3">
          Steun Apex — elke euro gaat in de allerbeste kaart- en routedata.{" "}
          <Link href="/#pricing" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
      </footer>
    </div>
  );
}
