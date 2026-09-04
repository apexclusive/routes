/**
 * Verdienmodel-hub: Stripe-betaallinks per plan, partner-links (hotels) en
 * helper-logica. Puur en alias-vrij — testbaar in node.
 *
 * Configuratie via Vercel-dashboard (NEXT_PUBLIC_-vars), nooit via de chat:
 * - NEXT_PUBLIC_STRIPE_LINK_SUPPORTER / _MONTH / _YEAR / _LIFE (per plan)
 * - NEXT_PUBLIC_STRIPE_LINK (fallback voor alle plannen)
 * - NEXT_PUBLIC_BOOKING_AID (Booking.com partner-id voor hotelboekingen)
 */

import type { ProPlan } from "./pro.ts";

const ENV = (typeof process !== "undefined" ? process.env : undefined) ?? {};

/** Stripe-betaallink per plan; lege string = nog niet geconfigureerd. */
export function checkoutUrl(plan: ProPlan | "supporter"): string {
  const key =
    plan === "supporter"
      ? "NEXT_PUBLIC_STRIPE_LINK_SUPPORTER"
      : `NEXT_PUBLIC_STRIPE_LINK_${plan.toUpperCase()}`;
  return (
    (ENV as Record<string, string | undefined>)[key] ||
    (ENV as Record<string, string | undefined>).NEXT_PUBLIC_STRIPE_LINK ||
    ""
  );
}

/** Zoek-URL voor een hotel in de buurt van een plaats (Booking.com). */
export function bookingSearchUrl(place: string): string {
  const clean = place.trim().split("(")[0].trim();
  const params = new URLSearchParams({
    ss: clean || "Maastricht",
    lang: "nl",
  });
  const aid = (ENV as Record<string, string | undefined>).NEXT_PUBLIC_BOOKING_AID;
  if (aid) params.set("aid", aid);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/** true als er minstens één betaallink geconfigureerd is. */
export function anyCheckoutConfigured(): boolean {
  return ["supporter", "month", "year", "life"].some(
    (p) => checkoutUrl(p as ProPlan | "supporter") !== ""
  );
}

/** Mailto voor partner-aanvragen (zero-backend lead-capture). */
export function buildPartnerMailto(
  bedrijf: string,
  email: string,
  pakket: string,
  bericht: string
): string {
  const subject = `Partnerschapsaanvraag — ${pakket} — ${bedrijf.trim() || "onbekend"}`;
  const body = [
    `Bedrijf: ${bedrijf.trim()}`,
    `E-mail: ${email.trim()}`,
    `Pakket: ${pakket}`,
    "",
    bericht.trim(),
  ].join("\n");
  return `mailto:partners@apexclusive.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
