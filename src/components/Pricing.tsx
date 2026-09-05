"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Heart,
  Infinity as InfinityIcon,
  LoaderCircle,
  LockKeyhole,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Logo from "./Logo";
import SiteMenu from "./SiteMenu";
import ThemeSwitch from "./ThemeSwitch";
import SkipLink from "./SkipLink";
import ScrollProgress from "./ScrollProgress";
import { beginCheckout } from "@/lib/billing";
import { getAccount } from "@/lib/account";
import { trackEvent } from "@/lib/analytics";
import { PRICING_COMPARISON, PRICING_FAQ } from "@/lib/pricing";
import type { ProPlan } from "@/lib/pro";

export default function Pricing() {
  const [billing, setBilling] = useState<"year" | "month">("year");
  const [loading, setLoading] = useState<ProPlan | null>(null);
  const [error, setError] = useState("");

  const checkout = async (plan: ProPlan) => {
    if (loading) return;
    setLoading(plan);
    setError("");
    trackEvent("Checkout gestart", { plan, location: "prijzen" });
    try {
      const result = await beginCheckout(plan, getAccount()?.email);
      window.location.assign(result.url);
    } catch (err) {
      setLoading(null);
      setError(err instanceof Error ? err.message : "Betalen kon niet worden gestart.");
    }
  };

  const proPlan: ProPlan = billing;
  const proMonthly = billing === "year" ? "€3,25" : "€5,99";

  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <ScrollProgress />
      <SkipLink />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[46rem] h-[46rem] bg-[var(--accent)]/[0.12] top-[-220px] right-[-160px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="text-lg font-bold tracking-tight font-display">Apex Pro</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <SiteMenu />
          <Link href="/?rit=1" className="btn-brand h-10 px-4 rounded font-semibold text-[13px] flex items-center">
            Open planner
          </Link>
        </div>
      </nav>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 pt-16 pb-24 max-w-6xl mx-auto">
        <header className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded text-[12px] text-yellow-200 border border-yellow-400/20 mb-5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Meer routes. Betere data. Geen route-lock-in.
          </span>
          <p className="eyebrow">LIDMAATSCHAP</p>
          <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-[-0.04em] mt-2 mb-5">
            Kies hoeveel <span className="text-gradient">vrijheid</span> je onderweg wilt
          </h1>
          <p className="text-slate-400 text-[15px] sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Begin gratis. Upgrade alleen als je vaker plant of exporteert. Elk
            betaald plan helpt routingcapaciteit en de routebibliotheek financieren.
          </p>
        </header>

        <div className="flex justify-center mb-7">
          <div className="glass rounded border border-white/10 p-1 flex" role="group" aria-label="Facturatieperiode">
            <button
              onClick={() => setBilling("year")}
              aria-pressed={billing === "year"}
              className={`px-4 py-2 rounded text-[13px] font-semibold transition-colors ${billing === "year" ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-white"}`}
            >
              Jaar <span className="text-[10px] ml-1 opacity-75">BESPAAR 46%</span>
            </button>
            <button
              onClick={() => setBilling("month")}
              aria-pressed={billing === "month"}
              className={`px-4 py-2 rounded text-[13px] font-semibold transition-colors ${billing === "month" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Maand
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 items-stretch mb-6">
          <article className="lux-card p-6 sm:p-7 flex flex-col">
            <span className="w-10 h-10 rounded bg-white/10 border border-white/10 flex items-center justify-center mb-5">
              <Route className="w-5 h-5 text-slate-300" aria-hidden />
            </span>
            <p className="eyebrow">BASIS</p>
            <p className="font-display font-bold text-4xl mt-2">€0</p>
            <p className="text-[12px] text-slate-500 mt-1 mb-6">voor altijd · zonder betaalkaart</p>
            <ul className="space-y-2.5 text-[13px] text-slate-300 flex-1">
              {["3 AI-routes per dag", "5 GPX-downloads per dag", "Kaart, weer, hoogte en delen", "Routes blijven in jouw browser"].map((item) => (
                <li key={item} className="flex gap-2"><Check className="w-4 h-4 text-yellow-400 shrink-0" />{item}</li>
              ))}
            </ul>
            <Link href="/?rit=1" data-track="Planner gestart" data-track-source="prijzen-basis" className="btn-ghost mt-7 px-5 py-3 rounded font-semibold text-[13px] text-center">
              Gratis starten
            </Link>
          </article>

          <article className="lux-card p-6 sm:p-7 flex flex-col">
            <span className="w-10 h-10 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center mb-5">
              <Heart className="w-5 h-5 text-yellow-300" aria-hidden />
            </span>
            <p className="eyebrow">SUPPORTER</p>
            <p className="font-display font-bold text-4xl mt-2">€2,99</p>
            <p className="text-[12px] text-slate-500 mt-1 mb-6">per maand · flexibel opzegbaar</p>
            <ul className="space-y-2.5 text-[13px] text-slate-300 flex-1">
              {["10 AI-routes per dag", "15 GPX-downloads per dag", "Deelkaart zonder Basis-regel", "Helpt betere data financieren"].map((item) => (
                <li key={item} className="flex gap-2"><Check className="w-4 h-4 text-yellow-400 shrink-0" />{item}</li>
              ))}
            </ul>
            <button
              onClick={() => void checkout("supporter")}
              disabled={Boolean(loading)}
              className="btn-ghost mt-7 px-5 py-3 rounded font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading === "supporter" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              Word Supporter
            </button>
          </article>

          <article className="lux-card pro-card p-6 sm:p-7 flex flex-col border-yellow-400/40 overflow-visible">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded whitespace-nowrap">
              {billing === "year" ? "46% JAARVOORDEEL" : "FLEXIBEL PER MAAND"}
            </span>
            <span className="w-10 h-10 rounded bg-yellow-400 text-black flex items-center justify-center mb-5">
              <Crown className="w-5 h-5" aria-hidden />
            </span>
            <p className="eyebrow">APEX PRO</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="font-display font-bold text-4xl">{proMonthly}</p>
              <p className="text-[13px] text-slate-500 mb-1">/ maand</p>
            </div>
            <p className="text-[12px] text-slate-500 mt-1 mb-6">
              {billing === "year" ? "€39 per jaar · €32,88 voordeel" : "maandelijks gefactureerd"}
            </p>
            <ul className="space-y-2.5 text-[13px] text-slate-200 flex-1">
              {["Onbeperkt AI-plannen en GPX downloaden", "Hoge-resolutie Pro-deelkaarten", "Print/PDF zonder Basis-footer", "Voorrang bij nieuwe Pro-tools"].map((item) => (
                <li key={item} className="flex gap-2"><Check className="w-4 h-4 text-yellow-400 shrink-0" />{item}</li>
              ))}
            </ul>
            <button
              onClick={() => void checkout(proPlan)}
              disabled={Boolean(loading)}
              className="btn-brand btn-shine mt-7 px-5 py-3 rounded font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading === proPlan ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              Kies Pro {billing === "year" ? "Jaar" : "Maand"}
            </button>
            <button
              onClick={() => void checkout("life")}
              disabled={Boolean(loading)}
              className="text-[11px] text-slate-500 hover:text-yellow-300 mt-3 underline underline-offset-2 disabled:opacity-50"
            >
              {loading === "life" ? "Lifetime-checkout openen…" : "Of één keer €99 · apparaatmigratie via support"}
            </button>
          </article>
        </div>

        {error && (
          <p className="max-w-xl mx-auto text-center text-[12px] text-red-300 glass rounded border border-red-400/25 p-3 mb-8" role="alert">
            {error} <a href="mailto:partners@apexclusive.nl" className="underline">Neem contact op</a>.
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500 mb-16">
          <span className="flex items-center gap-1.5"><LockKeyhole className="w-3.5 h-3.5" />Checkout via Stripe</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Geen betaalgegevens bij Apex</span>
          <span className="flex items-center gap-1.5"><InfinityIcon className="w-3.5 h-3.5" />Lifetime verlengt nooit</span>
        </div>

        <section className="mb-16">
          <div className="text-center mb-7">
            <p className="eyebrow">VERGELIJK</p>
            <h2 className="font-display font-bold text-3xl mt-2">Geen kleine lettertjes</h2>
          </div>
          <div className="glass rounded border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="p-4 text-[11px] uppercase tracking-widest text-slate-500">Functie</th>
                  <th className="p-4 text-[12px]">Basis</th>
                  <th className="p-4 text-[12px]">Supporter</th>
                  <th className="p-4 text-[12px] text-yellow-300">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {PRICING_COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <th className="p-4 text-[13px] font-medium text-slate-300">{row.feature}</th>
                    <td className="p-4 text-[12px] text-slate-500">{row.basis}</td>
                    <td className="p-4 text-[12px] text-slate-400">{row.supporter}</td>
                    <td className="p-4 text-[12px] text-yellow-200 font-semibold">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-7">
            <p className="eyebrow">VRAGEN</p>
            <h2 className="font-display font-bold text-3xl mt-2">Eerst helder, dan betalen</h2>
          </div>
          <div className="glass rounded border border-white/10 px-5 sm:px-6">
            {PRICING_FAQ.map((item) => (
              <details key={item.q} className="group border-b border-white/[0.07] last:border-0 py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-[14px] font-semibold">
                  {item.q}
                  <span className="text-yellow-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-[13px] text-slate-400 leading-relaxed mt-2 pr-8">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="lux-card corner-frame p-8 sm:p-10 text-center max-w-4xl mx-auto">
          <Crown className="w-8 h-8 text-yellow-300 mx-auto mb-4" aria-hidden />
          <h2 className="font-display font-bold text-3xl">Rijd eerst gratis. Kies later.</h2>
          <p className="text-[14px] text-slate-400 mt-3 mb-6 max-w-xl mx-auto">
            De snelste manier om te weten of Apex bij je past is één route plannen en exporteren.
          </p>
          <Link href="/?rit=1" className="btn-brand btn-shine inline-flex items-center gap-2 px-6 py-3 rounded font-semibold">
            Plan mijn eerste route <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <footer className="mt-12 pt-6 border-t border-white/[0.07] flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-600">
          <Link href="/privacy" className="hover:text-yellow-300">Privacy</Link>
          <Link href="/voorwaarden" className="hover:text-yellow-300">Voorwaarden</Link>
          <Link href="/herroepen" className="hover:text-yellow-300">Aankoop herroepen</Link>
          <Link href="/adverteren" className="hover:text-yellow-300">Zakelijke partners</Link>
        </footer>
      </main>
    </div>
  );
}
