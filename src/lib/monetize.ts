/**
 * Verdienmodel-hub: checkout, relevante reispartners en lead-validatie.
 * Puur en alias-vrij zodat URL's en bedragen buiten de browser te testen zijn.
 *
 * Configuratie gebeurt uitsluitend via deployment-variabelen:
 * - NEXT_PUBLIC_BOOKING_AID
 * - NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID
 * Betalingen staan bewust in lib/billing: statische links zijn geen veilig
 * entitlementmechanisme.
 */

const ENV = (typeof process !== "undefined" ? process.env : undefined) ?? {};

export interface BookingOptions {
  checkin?: string;
  checkout?: string;
  adults?: number;
  rooms?: number;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function cleanPlace(place: string): string {
  return place.trim().split("(")[0].trim().slice(0, 100) || "Maastricht";
}

/** Zoek-URL voor een verblijf, inclusief bruikbare data en affiliate-id. */
export function bookingSearchUrl(place: string, options: BookingOptions = {}): string {
  const params = new URLSearchParams({
    ss: cleanPlace(place),
    lang: "nl",
  });
  if (
    options.checkin &&
    options.checkout &&
    ISO_DATE.test(options.checkin) &&
    ISO_DATE.test(options.checkout) &&
    options.checkout > options.checkin
  ) {
    params.set("checkin", options.checkin);
    params.set("checkout", options.checkout);
  }
  if (options.adults !== undefined) {
    params.set("group_adults", String(Math.min(10, Math.max(1, Math.round(options.adults)))));
  }
  if (options.rooms !== undefined) {
    params.set("no_rooms", String(Math.min(5, Math.max(1, Math.round(options.rooms)))));
  }
  const aid = (ENV as Record<string, string | undefined>).NEXT_PUBLIC_BOOKING_AID;
  if (aid) params.set("aid", aid);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/**
 * Relevante activiteiten rondom een bestemming. GetYourGuide schrijft voor
 * dat handmatige deep links de eigen Partner ID meekrijgen.
 */
export function experienceSearchUrl(place: string): string {
  const params = new URLSearchParams({ q: cleanPlace(place) });
  const partnerId = (ENV as Record<string, string | undefined>)
    .NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID;
  if (partnerId) {
    params.set("partner_id", partnerId);
    params.set("utm_medium", "online_publisher");
    params.set("utm_source", "apex_routes");
  }
  return `https://www.getyourguide.com/s/?${params.toString()}`;
}

export function localIsoDate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Eerstvolgende vrijdag vanaf twee weken vooruit, standaard twee nachten. */
export function defaultTravelDates(now = new Date()): { checkin: string; checkout: string } {
  const start = new Date(now);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + 14);
  start.setDate(start.getDate() + ((5 - start.getDay() + 7) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return { checkin: localIsoDate(start), checkout: localIsoDate(end) };
}

export function affiliateDisclosureNeeded(): boolean {
  const values = ENV as Record<string, string | undefined>;
  return Boolean(
    values.NEXT_PUBLIC_BOOKING_AID || values.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID
  );
}

/** Mailto voor partner-aanvragen (fallback als de mail-API niet is ingericht). */
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

export const PARTNER_PACKAGES = [
  "Event-promotie",
  "Partner van het seizoen",
  "Hotel- & horecapartner",
  "Anders / maatwerk",
] as const;

export type PartnerPackage = (typeof PARTNER_PACKAGES)[number];

export interface PartnerLead {
  bedrijf: string;
  email: string;
  pakket: PartnerPackage;
  bericht: string;
}

/** Server/client delen exact dezelfde begrenzing voor een partnerlead. */
export function validatePartnerLead(value: unknown): PartnerLead | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<PartnerLead>;
  const bedrijf = String(raw.bedrijf || "").trim().replace(/\s+/g, " ").slice(0, 100);
  const email = String(raw.email || "").trim().toLowerCase().slice(0, 160);
  const pakket = String(raw.pakket || "").trim();
  const bericht = String(raw.bericht || "").trim().slice(0, 2_000);
  if (bedrijf.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  if (!PARTNER_PACKAGES.includes(pakket as PartnerPackage)) return null;
  return { bedrijf, email, pakket: pakket as PartnerPackage, bericht };
}
