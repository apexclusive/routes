/**
 * Privacyvriendelijke product-analytics.
 *
 * Geen route, coördinaten, naam, e-mail of vrije tekst wordt verstuurd. Alleen
 * expliciete eventnamen en korte, vooraf gekozen eigenschappen gaan naar een
 * geconfigureerde Plausible-installatie. Zonder configuratie is dit een no-op.
 */

export type AnalyticsValue = string | number | boolean;
export type AnalyticsProps = Record<string, AnalyticsValue | null | undefined>;

export const ATTRIBUTION_KEY = "apex-routes:attribution";
const ATTRIBUTION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PROP_LENGTH = 80;

type PlausibleOptions = {
  props?: Record<string, AnalyticsValue>;
  revenue?: { amount: number; currency: string };
};

declare global {
  interface Window {
    plausible?: ((event: string, options?: PlausibleOptions) => void) & {
      q?: unknown[][];
    };
  }
}

export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  referrer?: string;
  capturedAt: number;
}

function cleanValue(value: AnalyticsValue): AnalyticsValue {
  return typeof value === "string" ? value.slice(0, MAX_PROP_LENGTH) : value;
}

export function sanitizeAnalyticsProps(props: AnalyticsProps = {}): Record<string, AnalyticsValue> {
  const clean: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === "") continue;
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key)) continue;
    clean[key] = cleanValue(value);
  }
  return clean;
}

export function parseAttribution(
  search: string,
  referrer = "",
  now = Date.now()
): Attribution | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return null;
  }
  const source = params.get("utm_source")?.slice(0, MAX_PROP_LENGTH) || undefined;
  const medium = params.get("utm_medium")?.slice(0, MAX_PROP_LENGTH) || undefined;
  const campaign = params.get("utm_campaign")?.slice(0, MAX_PROP_LENGTH) || undefined;
  const content = params.get("utm_content")?.slice(0, MAX_PROP_LENGTH) || undefined;
  let referrerHost: string | undefined;
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname.slice(0, MAX_PROP_LENGTH) || undefined;
    } catch {
      referrerHost = undefined;
    }
  }
  if (!source && !medium && !campaign && !content && !referrerHost) return null;
  return { source, medium, campaign, content, referrer: referrerHost, capturedAt: now };
}

export function isFreshAttribution(value: unknown, now = Date.now()): value is Attribution {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Attribution>;
  return (
    typeof item.capturedAt === "number" &&
    item.capturedAt <= now + 60_000 &&
    now - item.capturedAt <= ATTRIBUTION_MAX_AGE_MS
  );
}

export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const fresh = parseAttribution(window.location.search, document.referrer);
  try {
    if (fresh) {
      window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored: unknown = JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || "null");
    return isFreshAttribution(stored) ? stored : null;
  } catch {
    return fresh;
  }
}

export function storedAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || "null");
    return isFreshAttribution(value) ? value : null;
  } catch {
    return null;
  }
}

/** Stuurt één meetbaar funnel-event; werkt ook als Plausible later laadt. */
export function trackEvent(
  event: string,
  props: AnalyticsProps = {},
  revenue?: { amount: number; currency?: string }
): void {
  if (typeof window === "undefined" || !event.trim()) return;
  const attribution = storedAttribution();
  const merged = sanitizeAnalyticsProps({
    ...props,
    utm_source: attribution?.source,
    utm_medium: attribution?.medium,
    utm_campaign: attribution?.campaign,
  });
  window.plausible?.(event.trim().slice(0, 80), {
    ...(Object.keys(merged).length ? { props: merged } : {}),
    ...(revenue && Number.isFinite(revenue.amount) && revenue.amount >= 0
      ? { revenue: { amount: revenue.amount, currency: revenue.currency || "EUR" } }
      : {}),
  });
}
