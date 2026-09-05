"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bike,
  Car,
  Gauge,
  Check,
  Footprints,
  RotateCcw,
  CircleDashed,
  FileText,
  Wrench,
  Backpack,
  PartyPopper,
  ListPlus,
  Plus,
  X,
} from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch, { LangNotice } from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import {
  CHECKLISTS,
  CHECKLIST_VEHICLES,
  loadChecked,
  saveChecked,
  toggleChecked,
  loadCustom,
  saveCustom,
  makeCustomId,
  type CustomCheckItem,
  type ChecklistVehicle,
} from "@/lib/checklist";

const VEHICLE_ICONS: Record<ChecklistVehicle, React.ComponentType<{ className?: string }>> = {
  motor: Gauge,
  auto: Car,
  fiets: Bike,
  wandelen: Footprints,
};

const SECTION_ICONS = [FileText, Wrench, CircleDashed, Backpack];

/**
 * Vertrek-checklist: hét gereedschap vóór de rit. Vink aan wat klaar is —
 * per voertuig bewaard in de browser. 100% = geniet van de natuur en ga erop uit.
 */
export default function Checklist() {
  const [vehicle, setVehicle] = useState<ChecklistVehicle>("motor");
  const [checked, setChecked] = useState<string[]>([]);
  const [custom, setCustom] = useState<CustomCheckItem[]>([]);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setChecked(loadChecked(vehicle));
      setCustom(loadCustom(vehicle));
      setHydrated(true);
    });
    return () => cancelAnimationFrame(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alléén eerste hydratie
  }, []);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const doc = CHECKLISTS[vehicle];
  const docIds = new Set(doc.sections.flatMap((s) => s.items.map((i) => i.id)));
  const total =
    doc.sections.reduce((n, s) => n + s.items.length, 0) + custom.length;
  const done = checked.filter(
    (id) => docIds.has(id) || custom.some((c) => c.id === id),
  ).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const switchVehicle = (v: ChecklistVehicle) => {
    setVehicle(v);
    setChecked(loadChecked(v));
    setCustom(loadCustom(v));
  };

  const toggle = (id: string) => {
    const next = toggleChecked(checked, id);
    setChecked(next);
    saveChecked(vehicle, next);
  };

  const reset = () => {
    setChecked([]);
    saveChecked(vehicle, []);
  };

  const addCustom = () => {
    const label = draft.trim().slice(0, 60);
    if (!label || custom.length >= 12) return;
    const next = [...custom, { id: makeCustomId(), label }];
    setCustom(next);
    saveCustom(vehicle, next);
    setDraft("");
  };

  const removeCustom = (id: string) => {
    const next = custom.filter((c) => c.id !== id);
    setCustom(next);
    saveCustom(vehicle, next);
    const nextChecked = checked.filter((x) => x !== id);
    setChecked(nextChecked);
    saveChecked(vehicle, nextChecked);
  };

  return (
    <div className="min-h-dvh bg-[var(--base)] text-slate-100">
      <ScrollProgress />
      <SkipLink />

      {/* nav */}
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">
            Vertrek-checklist
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteMenu />
          <Link href="/gpx" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            GPX &amp; bestanden
          </Link>
          <Link href="/advies" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Advisor
          </Link>
          <Link href="/forum" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Forum
          </Link>
          <ThemeSwitch />
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Naar de planner</span>
          </Link>
        </div>
      </nav>
      <LangNotice />

      {/* hero + voertuigkeuze */}
      <header className="relative z-10 px-4 sm:px-6 pt-12 pb-8 max-w-6xl mx-auto">
        <span className="sec-index block mb-3">TOOL /</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display">
          Vertrek <span className="text-gradient">100% voorbereid</span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-[15px] leading-relaxed">
          Eén keer doorvinken vóór je wegrijdt of vertrekt: techniek, papieren,
          uitrusting en onderweg. Je vinkjes blijven in deze browser staan —
          morgen staat de lijst weer klaar.
        </p>

        <div className="flex flex-wrap gap-2 mt-7">
          {CHECKLIST_VEHICLES.map((v) => {
            const Icon = VEHICLE_ICONS[v.id];
            const active = vehicle === v.id;
            return (
              <button
                key={v.id}
                onClick={() => switchVehicle(v.id)}
                aria-pressed={active}
                className={`glass rounded px-4 py-2.5 text-[14px] font-semibold border flex items-center gap-2 transition-all ${
                  active
                    ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
                    : "border-white/10 text-slate-300 hover:border-white/25"
                }`}
              >
                <Icon className="w-4 h-4" />
                {v.label}
              </button>
            );
          })}
        </div>

        {/* voortgang */}
        <div className="mt-7 glass rounded border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="ticker text-[12px] text-slate-400">
              Voortgang — {done}/{total}
            </span>
            <span className="flex items-center gap-3">
              {pct === 100 ? (
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-yellow-300">
                  <PartyPopper className="w-4 h-4" />
                  Klaar om te rijden — geniet van de natuur en ga erop uit!
                </span>
              ) : (
                <span className="font-display font-bold text-yellow-400 font-mono">{pct}%</span>
              )}
              <button
                onClick={reset}
                className="btn-ghost px-2.5 py-1.5 rounded text-[12px] flex items-center gap-1.5"
                title="Alles terugzetten"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Opnieuw
              </button>
            </span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ffe600] to-[#ffb300]"
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
            />
          </div>
        </div>
      </header>

      {/* secties */}
      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pb-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-3">
        {!hydrated ? null : doc.sections.map((sec, si) => {
          const Icon = SECTION_ICONS[si] ?? CircleDashed;
          return (
            <motion.section
              key={sec.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4 }}
              className="lux-card corner-frame p-5"
            >
              <h2 className="flex items-center gap-2.5 font-display font-bold text-[16px] mb-4">
                <span className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-yellow-300" />
                </span>
                {sec.title}
              </h2>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const on = checked.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggle(item.id)}
                        aria-pressed={on}
                        className={`w-full text-left px-3 py-2.5 rounded border transition-all flex items-start gap-3 ${
                          on
                            ? "bg-yellow-400/[0.07] border-yellow-400/30"
                            : "border-transparent hover:bg-white/[0.04] hover:border-white/10"
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-sm border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            on ? "bg-yellow-400 border-yellow-400" : "border-white/25"
                          }`}
                        >
                          {on && <Check className="w-3 h-3 text-black" strokeWidth={3.5} />}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`block text-[14px] leading-snug ${
                              on ? "text-slate-400 line-through decoration-yellow-400/50" : "text-slate-200"
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.hint && (
                            <span className="block text-[12px] text-slate-500 mt-0.5">
                              {item.hint}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          );
        })}
        {!hydrated ? null : (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="lux-card corner-frame p-5 md:col-span-2"
          >
            <h2 className="flex items-center gap-2.5 font-display font-bold text-[16px] mb-4">
              <span className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center">
                <ListPlus className="w-4 h-4 text-yellow-300" />
              </span>
              Eigen items
              <span className="ml-auto font-mono text-[11px] text-slate-500">
                {custom.length}/12
              </span>
            </h2>
            {custom.length === 0 ? (
              <p className="text-[13px] text-slate-500 mb-3">
                Voeg zelf regels toe die jij nooit wil vergeten — bewaard per
                voertuig, ook na verversen.
              </p>
            ) : (
              <ul className="space-y-1 mb-3">
                {custom.map((item) => {
                  const on = checked.includes(item.id);
                  return (
                    <li key={item.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(item.id)}
                        aria-pressed={on}
                        className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded border transition-all flex items-start gap-3 ${
                          on
                            ? "bg-yellow-400/[0.07] border-yellow-400/30"
                            : "border-transparent hover:bg-white/[0.04] hover:border-white/10"
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-sm border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            on ? "bg-yellow-400 border-yellow-400" : "border-white/25"
                          }`}
                        >
                          {on && <Check className="w-3 h-3 text-black" strokeWidth={3.5} />}
                        </span>
                        <span
                          className={`min-w-0 block text-[14px] leading-snug truncate ${
                            on
                              ? "text-slate-400 line-through decoration-yellow-400/50"
                              : "text-slate-200"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                      <button
                        onClick={() => removeCustom(item.id)}
                        className="btn-ghost h-10 w-10 rounded flex items-center justify-center shrink-0"
                        title="Eigen item verwijderen"
                        aria-label={`Verwijder ${item.label}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Bijv. tankpas of intercom-lader meenemen"
                aria-label="Nieuw eigen item"
                maxLength={60}
                className="flex-1 h-10 glass rounded border border-white/10 px-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-yellow-400/50 transition-colors"
              />
              <button
                onClick={addCustom}
                disabled={!draft.trim() || custom.length >= 12}
                className="btn-brand h-10 px-4 rounded text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                Toevoegen
              </button>
            </div>
          </motion.section>
        )}
      </main>

      {/* footer */}
      <footer className="relative z-10 px-6 py-10 border-t border-white/[0.07] text-center">
        <p className="text-[12px] text-slate-500">
          volgende stap:{" "}
          <Link href="/gpx" className="underline underline-offset-2 hover:text-yellow-400">
            GPX &amp; bestanden
          </Link>{" "}
          ·{" "}
          <Link href="/advies" className="underline underline-offset-2 hover:text-yellow-400">
            reisadvies &amp; noodnummers
          </Link>{" "}
          ·{" "}
          <Link href="/forum" className="underline underline-offset-2 hover:text-yellow-400">
            forum
          </Link>
        </p>
        <p className="text-[12px] text-slate-600 mt-2">
          Steun Apex — je bijdrage helpt routingcapaciteit, datakwaliteit en routeonderzoek betalen.{" "}
          <Link href="/prijzen" className="underline underline-offset-2 hover:text-yellow-400">
            Bekijk de lagen
          </Link>
        </p>
      </footer>
    </div>
  );
}
