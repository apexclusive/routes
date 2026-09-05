import { NextRequest, NextResponse } from "next/server";
import { isInstallationId } from "@/lib/billing";
import type { ProPlan } from "@/lib/pro";
import { clientKey, rateLimitHeaders, takeRateLimit } from "@/lib/server/rateLimit";
import { trustedReturnOrigin } from "@/lib/server/origin";
import { missingCommerceSettings } from "@/lib/server/commerceReadiness";

export const dynamic = "force-dynamic";

const PRICE_ENV: Record<ProPlan, keyof NodeJS.ProcessEnv> = {
  supporter: "STRIPE_PRICE_SUPPORTER",
  month: "STRIPE_PRICE_MONTH",
  year: "STRIPE_PRICE_YEAR",
  life: "STRIPE_PRICE_LIFE",
};
const PLANS = new Set<ProPlan>(["supporter", "month", "year", "life"]);

function safeCampaignValue(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/[^\p{L}\p{N}._:/ -]/gu, "").trim().slice(0, 80)
    : "";
}

function safeOrigin(req: NextRequest): string {
  return trustedReturnOrigin(
    process.env.NEXT_PUBLIC_SITE_URL,
    req.nextUrl.origin,
    process.env.NODE_ENV === "production"
  );
}

export async function POST(req: NextRequest) {
  const rate = takeRateLimit(`checkout:${clientKey(req.headers)}`, 12, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Te veel checkoutpogingen; probeer het over enkele minuten opnieuw." },
      { status: 429, headers: { ...rateLimitHeaders(rate), "Retry-After": "600" } }
    );
  }

  let body: {
    plan?: unknown;
    installationId?: unknown;
    email?: unknown;
    returnPath?: unknown;
    attribution?: { source?: unknown; medium?: unknown; campaign?: unknown };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const plan = String(body.plan || "") as ProPlan;
  if (!PLANS.has(plan) || !isInstallationId(body.installationId)) {
    return NextResponse.json({ error: "Ongeldig plan of apparaat." }, { status: 400 });
  }

  const missing = missingCommerceSettings(
    process.env,
    process.env.NODE_ENV === "production"
  );
  if (missing.length > 0) {
    console.error(`Checkout geblokkeerd; ontbrekende productieconfig: ${missing.join(", ")}`);
    return NextResponse.json(
      { error: "Checkout is tijdelijk niet beschikbaar." },
      { status: 503 }
    );
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env[PRICE_ENV[plan]];
  if (!secret || !price) {
    return NextResponse.json({ error: "Checkout niet geconfigureerd." }, { status: 503 });
  }

  const origin = safeOrigin(req);
  const mode = plan === "life" ? "payment" : "subscription";
  const returnPath = body.returnPath === "/prijzen" ? "/prijzen" : "/";
  const form = new URLSearchParams({
    mode,
    success_url: `${origin}${returnPath}?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${returnPath}?billing=cancelled${returnPath === "/" ? "#pricing" : ""}`,
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: body.installationId,
    "metadata[plan]": plan,
    "metadata[installation_id]": body.installationId,
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
    locale: "nl",
  });
  const campaignFields = {
    utm_source: safeCampaignValue(body.attribution?.source),
    utm_medium: safeCampaignValue(body.attribution?.medium),
    utm_campaign: safeCampaignValue(body.attribution?.campaign),
  };
  for (const [key, value] of Object.entries(campaignFields)) {
    if (value) form.set(`metadata[${key}]`, value);
  }
  if (mode === "subscription") {
    form.set("subscription_data[metadata][plan]", plan);
    form.set("subscription_data[metadata][installation_id]", body.installationId);
    for (const [key, value] of Object.entries(campaignFields)) {
      if (value) form.set(`subscription_data[metadata][${key}]`, value);
    }
  } else {
    form.set("customer_creation", "always");
    form.set("payment_intent_data[metadata][plan]", plan);
    form.set("payment_intent_data[metadata][installation_id]", body.installationId);
  }
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) form.set("customer_email", email);
  if (process.env.STRIPE_AUTOMATIC_TAX === "true") {
    form.set("automatic_tax[enabled]", "true");
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `apex-${body.installationId}-${plan}-${Math.floor(Date.now() / 60_000)}`,
      },
      body: form,
    });
    const session = (await response.json().catch(() => null)) as {
      id?: string;
      url?: string;
      error?: { message?: string };
    } | null;
    if (!response.ok || !session?.url || !session.id) {
      return NextResponse.json(
        { error: process.env.NODE_ENV === "development" ? session?.error?.message || "Stripe-fout" : "Checkout kon niet starten." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { url: session.url, sessionId: session.id },
      { headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Checkout is tijdelijk niet bereikbaar." }, { status: 502 });
  }
}
