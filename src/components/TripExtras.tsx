"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import {
  bookingSearchUrl,
  defaultTravelDates,
  experienceSearchUrl,
  localIsoDate,
} from "@/lib/monetize";

/**
 * Contextuele commerce zonder banner-spam: pas ná de routekeuze, met bestemming
 * en reisdata al ingevuld. Dit is nuttiger voor de reiziger en meetbaar voor
 * affiliatepartners.
 */
export default function TripExtras({
  place,
  context,
}: {
  place: string;
  context: "rit" | "klim" | "planner";
}) {
  const defaults = useMemo(() => defaultTravelDates(), []);
  const [checkin, setCheckin] = useState(defaults.checkin);
  const [checkout, setCheckout] = useState(defaults.checkout);
  const [adults, setAdults] = useState(2);
  const datesValid = Boolean(checkin && checkout && checkout > checkin);
  const hotelUrl = bookingSearchUrl(place, {
    ...(datesValid ? { checkin, checkout } : {}),
    adults,
    rooms: 1,
  });
  const activityUrl = experienceSearchUrl(place);
  const today = localIsoDate(new Date());

  return (
    <section className="trip-extras glass rounded border border-white/10 p-5 sm:p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-5">
        <span className="w-10 h-10 rounded bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-yellow-300" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1">MAAK DE RIT COMPLEET</p>
          <h2 className="font-display font-bold text-xl">
            Slapen en beleven bij {place}
          </h2>
          <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
            Zoek een verblijf voor je gekozen weekend of bekijk activiteiten
            voor een stop naast de route.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_110px] gap-2 mb-3">
        <label className="block min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
            <CalendarDays className="w-3 h-3" aria-hidden /> aankomst
          </span>
          <input
            type="date"
            value={checkin}
            min={today}
            onChange={(event) => {
              const next = event.target.value;
              setCheckin(next);
              if (checkout <= next) {
                const end = new Date(`${next}T12:00:00`);
                end.setDate(end.getDate() + 1);
                setCheckout(localIsoDate(end));
              }
            }}
            className="w-full h-10 bg-white/5 border border-white/10 rounded px-2.5 text-[12px] text-slate-200 outline-none focus:border-yellow-400/60 [color-scheme:dark]"
          />
        </label>
        <label className="block min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
            <CalendarDays className="w-3 h-3" aria-hidden /> vertrek
          </span>
          <input
            type="date"
            value={checkout}
            min={checkin || today}
            onChange={(event) => setCheckout(event.target.value)}
            className="w-full h-10 bg-white/5 border border-white/10 rounded px-2.5 text-[12px] text-slate-200 outline-none focus:border-yellow-400/60 [color-scheme:dark]"
          />
        </label>
        <label className="block col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
            <Users className="w-3 h-3" aria-hidden /> reizigers
          </span>
          <select
            value={adults}
            onChange={(event) => setAdults(Number(event.target.value))}
            className="w-full h-10 bg-[var(--surface-solid)] border border-white/10 rounded px-2.5 text-[12px] text-slate-200 outline-none focus:border-yellow-400/60"
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </label>
      </div>

      {!datesValid && (
        <p className="text-[11px] text-red-300 mb-3">Vertrek moet na aankomst liggen.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-2.5">
        <a
          href={hotelUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          data-track="Affiliate klik"
          data-track-partner="booking"
          data-track-context={context}
          className="group rounded border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/[0.12] p-4 flex items-center gap-3 transition-colors"
        >
          <span className="w-9 h-9 rounded bg-yellow-400 text-black flex items-center justify-center shrink-0">
            <BedDouble className="w-4 h-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-[13px]">Zoek op Booking.com</span>
            <span className="block text-[11px] text-slate-500 mt-0.5 truncate">
              {datesValid ? `${checkin} – ${checkout}` : place}
            </span>
          </span>
          <ArrowUpRight className="w-4 h-4 text-yellow-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
        </a>
        <a
          href={activityUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          data-track="Affiliate klik"
          data-track-partner="getyourguide"
          data-track-context={context}
          className="group rounded border border-white/10 bg-white/[0.03] hover:border-yellow-400/30 p-4 flex items-center gap-3 transition-colors"
        >
          <span className="w-9 h-9 rounded bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4 text-yellow-300" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-[13px]">Bekijk op GetYourGuide</span>
            <span className="block text-[11px] text-slate-500 mt-0.5 truncate">
              Tours en tickets rond {place}
            </span>
          </span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" aria-hidden />
        </a>
      </div>

      <p className="text-[10px] text-slate-600 mt-3 flex items-start gap-1.5 leading-relaxed">
        <ShieldCheck className="w-3 h-3 shrink-0 mt-px" aria-hidden />
        Partnerlinks. Apex kan bij een geldige boeking een commissie ontvangen.
        Vergelijk prijs, beschikbaarheid en voorwaarden altijd bij de aanbieder.
      </p>
    </section>
  );
}
