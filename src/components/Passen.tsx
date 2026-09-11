"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bike, Mountain, TriangleAlert } from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import LangSwitch from "./LangSwitch";
import ThemeSwitch from "./ThemeSwitch";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "./SkipLink";
import {
  MAANDEN,
  STATUS_KLEUR,
  STATUS_LABEL,
  STATUS_UITLEG,
  passenOpHoogte,
  periodeLabel,
  statusInMaand,
  telOpen,
  type PasStatus,
} from "@/lib/passtatus";

const LANDNAAM: Record<string, string> = {
  IT: "Italië",
  AT: "Oostenrijk",
  CH: "Zwitserland",
  FR: "Frankrijk",
};

export default function Passen({ huidigeMaand }: { huidigeMaand: number }) {
  const [maand, setMaand] = useState(huidigeMaand);
  const passen = passenOpHoogte();
  const open = telOpen(maand);

  const volgorde: PasStatus[] = ["meestal-open", "randseizoen", "meestal-dicht"];
  const gesorteerd = [...passen].sort(
    (a, b) =>
      volgorde.indexOf(statusInMaand(a, maand)) - volgorde.indexOf(statusInMaand(b, maand)) ||
      b.hoogteM - a.hoogteM
  );

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[var(--accent)]/[0.10] top-[-180px] left-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">Passen open?</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <SiteMenu />
          <Link href="/tours" className="btn-ghost h-10 px-3.5 rounded font-medium text-[13px] hidden sm:flex">
            Tours
          </Link>
          <LangSwitch className="hidden sm:flex" />
          <Link href="/" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] hidden sm:block">
            Naar de planner
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-4 sm:px-6 pt-12 pb-6 max-w-5xl mx-auto">
        <p className="eyebrow">SEIZOENSKALENDER VAN DE ALPENPASSEN</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          Wanneer gaan de bergpassen open?
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl mb-6">
          De Stelvio ging in 2026 op 31 mei open, de Grossglockner al op 25 april
          en de Sustenpass pas op 12 juni. Hoogte alleen zegt het niet: het hangt
          af van de sneeuwval van die winter en van hoe hard er geruimd wordt.
          Kies een maand en zie welke passen er dan normaal gesproken open liggen.
        </p>

        <div className="rounded border border-amber-400/25 bg-amber-400/[0.06] p-4 mb-8 flex items-start gap-3">
          <TriangleAlert className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" aria-hidden />
          <p className="text-[13px] text-slate-300 leading-relaxed">
            Dit is een <strong className="text-slate-100">seizoensverwachting</strong>, geen
            live-status. Een pas kan ook midden in de zomer dicht door sneeuw,
            steenslag of werkzaamheden. Klik altijd door naar de officiële bron
            voordat je vertrekt — bij elke pas staat de juiste link.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {MAANDEN.map((m, i) => (
            <button
              key={m}
              onClick={() => setMaand(i + 1)}
              aria-pressed={maand === i + 1}
              className={`px-3 py-1.5 rounded text-[12px] font-semibold capitalize transition-colors ${
                maand === i + 1
                  ? "bg-yellow-400 text-black"
                  : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-slate-400 mb-8">
          In <strong className="text-slate-200 capitalize">{MAANDEN[maand - 1]}</strong> liggen er
          normaal{" "}
          <strong className="text-yellow-300 font-mono">
            {open} van de {passen.length}
          </strong>{" "}
          passen open.
          {open === 0 && " Dit is geen maand voor een alpentour."}
        </p>
      </section>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto grid sm:grid-cols-2 gap-3">
        {gesorteerd.map((p, i) => {
          const status = statusInMaand(p, maand);
          return (
            <motion.article
              key={p.climbId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
              className="lux-card p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <Link
                    href={`/klimmen/${p.climbId}`}
                    className="font-display font-bold text-[16px] leading-snug hover:text-yellow-300 transition-colors"
                  >
                    {p.naam}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono flex items-center gap-1.5">
                    <Mountain className="w-3 h-3" aria-hidden />
                    {p.hoogteM} m · {LANDNAAM[p.land]}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border shrink-0 ${STATUS_KLEUR[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>

              <p className="text-[12px] text-slate-400 leading-relaxed mb-2">
                {STATUS_UITLEG[status]}
              </p>
              <p className="text-[11px] text-slate-500 mb-3">
                Normale periode: <span className="capitalize">{periodeLabel(p)}</span>
              </p>

              {p.referentie2026 && (
                <p className="text-[12px] text-slate-400 leading-relaxed mb-3 pl-3 border-l-2 border-white/10">
                  {p.referentie2026}
                </p>
              )}

              {p.autovrij2026 && p.autovrij2026.length > 0 && (
                <div className="mb-3">
                  {p.autovrij2026.map((d) => (
                    <p
                      key={d}
                      className="text-[11px] text-slate-400 flex items-start gap-1.5 mb-1"
                    >
                      <Bike className="w-3 h-3 mt-0.5 shrink-0 text-yellow-400/70" aria-hidden />
                      {d}
                    </p>
                  ))}
                </div>
              )}

              <a
                href={p.bron.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-[12px] font-semibold text-yellow-300 hover:text-yellow-200 inline-flex items-center gap-1.5 self-start"
              >
                Status van vandaag: {p.bron.label}
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
              </a>
            </motion.article>
          );
        })}
      </main>

      <footer className="relative z-10 px-4 sm:px-6 pb-16 max-w-5xl mx-auto">
        <div className="h-px bg-white/10 mb-5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Openingsperiodes zijn gebaseerd op de werkelijke data van 2026 en op
          meerjarige gemiddelden van de wegbeheerders. Ze zeggen iets over een
          normaal jaar, niet over vandaag. In sneeuwrijke jaren schuift een
          opening zomaar twee tot vier weken op.{" "}
          <Link href="/tours" className="text-yellow-400 hover:text-yellow-300">
            Bekijk de meerdaagse tours
          </Link>{" "}
          om te zien welke passen in één reis te combineren zijn.
        </p>
      </footer>
    </div>
  );
}
