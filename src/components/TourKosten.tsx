"use client";

import { useState } from "react";
import { Calculator, BedDouble, Fuel, Receipt, TrendingDown } from "lucide-react";
import {
  BRON,
  HOTEL_EUR_PER_NACHT,
  euro,
  raamKosten,
  type Voertuig,
} from "@/lib/tourkosten";
import { tourKm, type Tour } from "@/lib/tours";

/**
 * Wat kost deze tour jou echt? Het contrast met de prijs van een
 * georganiseerde reis is het sterkste argument dat de pagina heeft — en de
 * directe aanleiding om het hotel te boeken.
 */
export default function TourKosten({ tour }: { tour: Tour }) {
  const beschikbaar = tour.voertuigen.filter((v) => v !== "fiets");
  const [voertuig, setVoertuig] = useState<Voertuig>(
    (beschikbaar[0] as Voertuig) ?? "motor"
  );
  const [personen, setPersonen] = useState(2);
  const [hotel, setHotel] = useState(HOTEL_EUR_PER_NACHT[tour.basiskamp] ?? 130);

  const r = raamKosten(tour, { personen, voertuig, hotelPerNachtEur: hotel });
  const georganiseerdTotaal = tour.georganiseerdVanafEur * personen;
  const bespaartSamen = Math.max(0, georganiseerdTotaal - r.totaalEur);

  const posten = [
    {
      icon: BedDouble,
      label: `Hotel · ${tour.nachten} nachten`,
      detail: `${euro(hotel)} p.n. × ${Math.ceil(personen / 2)} kamer${Math.ceil(personen / 2) > 1 ? "s" : ""}`,
      bedrag: r.hotelEur,
    },
    {
      icon: Fuel,
      label: "Brandstof",
      detail: `± ${r.liters} liter voor ${tourKm(tour)} km`,
      bedrag: r.brandstofEur,
    },
    {
      icon: Receipt,
      label: "Tol en vignetten",
      detail: r.tolEur > 0 ? "Zie de kostenlijst hieronder" : "Niet van toepassing",
      bedrag: r.tolEur,
    },
  ];

  return (
    <section className="glass rounded border border-white/10 p-5 sm:p-6 mb-10">
      <div className="flex items-start gap-3 mb-5">
        <span className="w-10 h-10 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-yellow-300" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="eyebrow mb-1">WAT KOST HET JOU ECHT?</p>
          <h2 className="font-display font-bold text-xl">Reken je eigen tour door</h2>
          <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
            Schuif de bedragen naar jouw situatie. Alles is een raming, geen offerte.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2.5 mb-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">
            Voertuig
          </span>
          <select
            value={voertuig}
            onChange={(e) => setVoertuig(e.target.value as Voertuig)}
            className="w-full h-10 bg-[var(--surface-solid)] border border-white/10 rounded px-2.5 text-[13px] text-slate-200 outline-none focus:border-yellow-400/60"
          >
            {beschikbaar.map((v) => (
              <option key={v} value={v}>
                {v === "motor" ? "Motor" : "Auto"}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">
            Personen
          </span>
          <select
            value={personen}
            onChange={(e) => setPersonen(Number(e.target.value))}
            className="w-full h-10 bg-[var(--surface-solid)] border border-white/10 rounded px-2.5 text-[13px] text-slate-200 outline-none focus:border-yellow-400/60"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">
            Hotel per nacht
          </span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-slate-500">
              €
            </span>
            <input
              type="number"
              min={40}
              max={600}
              step={5}
              value={hotel}
              onChange={(e) => setHotel(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 bg-white/5 border border-white/10 rounded pl-6 pr-2.5 text-[13px] text-slate-200 outline-none focus:border-yellow-400/60"
            />
          </div>
        </label>
      </div>

      <ul className="mb-4">
        {posten.map((p) => (
          <li
            key={p.label}
            className="flex items-center gap-3 py-2.5 border-b border-white/[0.07]"
          >
            <p.icon className="w-4 h-4 text-slate-500 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-slate-200">{p.label}</span>
              <span className="block text-[11px] text-slate-500">{p.detail}</span>
            </span>
            <span className="font-mono font-bold text-[15px] text-slate-100 shrink-0">
              {euro(p.bedrag)}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-3 py-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-slate-100">
              Totaal voor {personen} {personen === 1 ? "persoon" : "personen"}
            </span>
            <span className="block text-[11px] text-slate-500">
              {euro(r.perPersoonEur)} per persoon
            </span>
          </span>
          <span className="font-mono font-bold text-2xl text-yellow-300 shrink-0">
            {euro(r.totaalEur)}
          </span>
        </li>
      </ul>

      {bespaartSamen > 0 && (
        <div className="rounded border border-emerald-400/25 bg-emerald-400/[0.07] p-4 flex items-start gap-3">
          <TrendingDown className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-hidden />
          <p className="text-[13px] text-slate-300 leading-relaxed">
            Een begeleide reis in dit gebied begint bij{" "}
            <strong className="text-slate-100">
              {euro(tour.georganiseerdVanafEur)} per persoon
            </strong>
            , oftewel {euro(georganiseerdTotaal)} voor jullie{" "}
            {personen === 1 ? "eentje" : `${personen} samen`}. Zelf rijden scheelt{" "}
            <strong className="text-emerald-300">{euro(bespaartSamen)}</strong> — en je
            bepaalt zelf wanneer je stopt voor koffie.
          </p>
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">{BRON}</p>
    </section>
  );
}
