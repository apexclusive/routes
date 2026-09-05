import type { ProPlan } from "./pro.ts";
import { storedAttribution } from "./analytics.ts";

export const INSTALLATION_KEY = "apex-routes:installation-id";
export const PENDING_CHECKOUT_KEY = "apex-routes:pending-checkout";

export interface VerifiedEntitlement {
  plan: ProPlan;
  sessionId: string;
  verifiedAt: number;
  /** Werkelijk afgerekend bedrag na promotie, in de valuta-eenheid (geen centen). */
  amount?: number;
  currency?: string;
  email?: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
  provider: "stripe-session";
}

export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && /^cs_[a-zA-Z0-9_]{8,196}$/.test(value);
}

export function rememberPendingCheckout(sessionId: string): void {
  if (!isCheckoutSessionId(sessionId) || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PENDING_CHECKOUT_KEY, sessionId);
  } catch {
    // De installatiecheck voorkomt normaal dat checkout zonder opslag start.
  }
}

export function getPendingCheckout(): string {
  if (typeof window === "undefined") return "";
  try {
    const sessionId = window.localStorage.getItem(PENDING_CHECKOUT_KEY);
    return isCheckoutSessionId(sessionId) ? sessionId : "";
  } catch {
    return "";
  }
}

export function clearPendingCheckout(sessionId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!sessionId || stored === sessionId) window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    // niets te wissen
  }
}

export async function openBillingPortal(sessionId: string): Promise<string> {
  if (!isCheckoutSessionId(sessionId)) {
    throw new Error("Geen geldige betaling gevonden op dit apparaat.");
  }
  const installationId = getInstallationId();
  if (!installationId) {
    throw new Error("Browseropslag is nodig om deze betaling veilig te beheren.");
  }
  const response = await fetch("/api/billing/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      installationId,
      returnPath: window.location.pathname === "/prijzen" ? "/prijzen" : "/",
    }),
  });
  const data = (await response.json().catch(() => null)) as { url?: unknown; error?: unknown } | null;
  if (response.ok && typeof data?.url === "string" && /^https:\/\//.test(data.url)) {
    return data.url;
  }
  throw new Error(
    typeof data?.error === "string"
      ? data.error.slice(0, 180)
      : "Abonnementsbeheer is tijdelijk niet bereikbaar."
  );
}

export function isInstallationId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{16,100}$/.test(value);
}

function fallbackId(): string {
  return `install_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

/** Anonieme apparaat-id koppelt een Checkout-sessie aan de browser, zonder PII. */
export function getInstallationId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(INSTALLATION_KEY);
    if (isInstallationId(existing)) return existing;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `install_${crypto.randomUUID().replace(/-/g, "")}`
      : fallbackId();
    window.localStorage.setItem(INSTALLATION_KEY, id);
    return window.localStorage.getItem(INSTALLATION_KEY) === id ? id : "";
  } catch {
    return "";
  }
}

export async function beginCheckout(plan: ProPlan, email?: string): Promise<CheckoutResult> {
  const installationId = getInstallationId();
  if (!installationId) {
    throw new Error("Sta browseropslag toe om een aankoop veilig aan dit apparaat te koppelen.");
  }
  let serverError = "";
  try {
    const attribution = storedAttribution();
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        installationId,
        email,
        returnPath: window.location.pathname === "/prijzen" ? "/prijzen" : "/",
        attribution: attribution
          ? {
              source: attribution.source,
              medium: attribution.medium,
              campaign: attribution.campaign,
            }
          : undefined,
      }),
    });
    const data = (await response.json().catch(() => null)) as {
      url?: unknown;
      sessionId?: unknown;
      error?: unknown;
    } | null;
    if (
      response.ok &&
      typeof data?.url === "string" &&
      /^https:\/\//.test(data.url) &&
      isCheckoutSessionId(data.sessionId)
    ) {
      rememberPendingCheckout(data.sessionId);
      return { url: data.url, sessionId: data.sessionId, provider: "stripe-session" };
    }
    if (typeof data?.error === "string") serverError = data.error.slice(0, 180);
  } catch {
    serverError = "De beveiligde checkout is tijdelijk niet bereikbaar.";
  }

  // Een statische Payment Link kan niet betrouwbaar aan deze anonieme
  // installatie worden gekoppeld. Nooit geld aannemen zonder daarna het recht
  // te kunnen leveren: alleen een verifieerbare Checkout Session is geldig.
  throw new Error(serverError || "Betalen is nog niet geconfigureerd. Neem contact op met het Apex-team.");
}

export interface CheckoutVerification {
  entitlement: VerifiedEntitlement | null;
  /** Alleen true als Stripe definitief meldt dat deze aankoop geen toegang geeft. */
  inactive: boolean;
  /** De betaling is geautoriseerd maar nog niet definitief verwerkt. */
  pending: boolean;
  /** Pending/netwerk/5xx/limiet: bewaar de sessie en probeer later opnieuw. */
  retryable: boolean;
}

export async function verifyCheckoutStatus(sessionId: string): Promise<CheckoutVerification> {
  if (!isCheckoutSessionId(sessionId)) {
    return { entitlement: null, inactive: true, pending: false, retryable: false };
  }
  const installationId = getInstallationId();
  try {
    const response = await fetch("/api/billing/verify", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, installationId }),
      cache: "no-store",
    });
    if (response.status === 202) {
      return { entitlement: null, inactive: false, pending: true, retryable: true };
    }
    if (!response.ok) {
      // 402 = verlopen/geannuleerd; 5xx, 429 en netwerkfouten mogen een
      // eerder geverifieerd recht nooit stilzwijgend intrekken.
      return {
        entitlement: null,
        inactive: [400, 402, 403].includes(response.status),
        pending: false,
        retryable: response.status === 429 || response.status >= 500,
      };
    }
    const data = (await response.json()) as { verified?: boolean; entitlement?: VerifiedEntitlement };
    return {
      entitlement: data.verified && data.entitlement ? data.entitlement : null,
      inactive: false,
      pending: false,
      retryable: false,
    };
  } catch {
    return { entitlement: null, inactive: false, pending: false, retryable: true };
  }
}
