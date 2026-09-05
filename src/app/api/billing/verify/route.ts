import { NextRequest, NextResponse } from "next/server";
import {
  isCheckoutSessionId,
  isInstallationId,
  type VerifiedEntitlement,
} from "@/lib/billing";
import type { ProPlan } from "@/lib/pro";
import { chargeAllowsEntitlement } from "@/lib/server/stripeEntitlement";
import { clientKey, rateLimitHeaders, takeRateLimit } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

const PLANS = new Set<ProPlan>(["supporter", "month", "year", "life"]);
const ACTIVE_SUBSCRIPTIONS = new Set(["active", "trialing"]);

interface StripeSession {
  id?: string;
  status?: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  mode?: string;
  client_reference_id?: string | null;
  subscription?: string | { id?: string } | null;
  payment_intent?: string | { id?: string } | null;
  metadata?: Record<string, string>;
  customer_details?: { email?: string | null } | null;
}

async function stripeGet<T>(path: string, secret: string): Promise<T | null> {
  try {
    const response = await fetch(`https://api.stripe.com${path}`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const rate = takeRateLimit(`verify:${clientKey(req.headers)}`, 30, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { verified: false, error: "Te veel controles." },
      { status: 429, headers: { ...rateLimitHeaders(rate), "Retry-After": "3600" } }
    );
  }

  let body: { sessionId?: unknown; installationId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ verified: false, error: "Ongeldige controle." }, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const installationId = body.installationId;
  if (!isCheckoutSessionId(sessionId) || !isInstallationId(installationId)) {
    return NextResponse.json({ verified: false, error: "Ongeldige controle." }, { status: 400 });
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ verified: false, error: "Billing niet geconfigureerd." }, { status: 503 });
  }

  const session = await stripeGet<StripeSession>(
    `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    secret
  );
  if (!session) {
    return NextResponse.json(
      { verified: false, error: "Stripe kon tijdelijk niet worden bereikt." },
      { status: 502, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
    );
  }
  const plan = session.metadata?.plan as ProPlan | undefined;
  const linkedInstallation = session.metadata?.installation_id || session.client_reference_id;
  if (
    session.id !== sessionId ||
    session.status !== "complete" ||
    !plan ||
    !PLANS.has(plan) ||
    linkedInstallation !== installationId
  ) {
    return NextResponse.json({ verified: false, error: "Aankoop niet bevestigd." }, { status: 403 });
  }

  const expectedMode = plan === "life" ? "payment" : "subscription";
  if (session.mode !== expectedMode) {
    return NextResponse.json({ verified: false, error: "Plan en betaalwijze komen niet overeen." }, { status: 403 });
  }

  if (session.mode === "subscription") {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    if (!subscriptionId) {
      return NextResponse.json({ verified: false, error: "Abonnement niet gevonden." }, { status: 402 });
    }
    const subscription = await stripeGet<{ status?: string }>(
      `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
      secret
    );
    if (!subscription) {
      return NextResponse.json(
        { verified: false, error: "Abonnementsstatus tijdelijk niet beschikbaar." },
        { status: 502, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
      );
    }
    if (subscription.status === "incomplete") {
      return NextResponse.json(
        { verified: false, pending: true, error: "Betaling wordt nog verwerkt." },
        { status: 202, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
      );
    }
    if (!subscription.status || !ACTIVE_SUBSCRIPTIONS.has(subscription.status)) {
      return NextResponse.json(
        { verified: false, error: "Abonnement is niet actief." },
        { status: 402, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
      );
    }
  } else if (session.payment_status === "unpaid") {
    return NextResponse.json(
      { verified: false, pending: true, error: "Betaling wordt nog verwerkt." },
      { status: 202, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
    );
  } else if (!["paid", "no_payment_required"].includes(session.payment_status || "")) {
    return NextResponse.json({ verified: false, error: "Betaling is niet voltooid." }, { status: 402 });
  } else if (session.payment_status === "paid") {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntentId) {
      return NextResponse.json(
        { verified: false, error: "Betaalstatus tijdelijk niet beschikbaar." },
        { status: 502, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
      );
    }
    const paymentIntent = await stripeGet<{
      status?: string;
      latest_charge?:
        | string
        | {
            status?: string;
            paid?: boolean;
            disputed?: boolean;
            refunded?: boolean;
            amount?: number;
            amount_refunded?: number;
          }
        | null;
    }>(
      `/v1/payment_intents/${encodeURIComponent(paymentIntentId)}?expand%5B%5D=latest_charge`,
      secret
    );
    if (!paymentIntent) {
      return NextResponse.json(
        { verified: false, error: "Betaalstatus tijdelijk niet beschikbaar." },
        { status: 502, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
      );
    }
    const charge =
      paymentIntent.latest_charge && typeof paymentIntent.latest_charge === "object"
        ? paymentIntent.latest_charge
        : null;
    if (!chargeAllowsEntitlement(paymentIntent.status, charge)) {
      return NextResponse.json(
        { verified: false, error: "Betaling is teruggedraaid of niet meer actief." },
        { status: 402, headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
      );
    }
  }

  const entitlement: VerifiedEntitlement = {
    plan,
    sessionId,
    verifiedAt: Date.now(),
    ...(typeof session.amount_total === "number" && session.amount_total >= 0
      ? { amount: session.amount_total / 100 }
      : {}),
    ...(typeof session.currency === "string"
      ? { currency: session.currency.toUpperCase().slice(0, 3) }
      : {}),
    ...(session.customer_details?.email
      ? { email: session.customer_details.email.slice(0, 160) }
      : {}),
  };
  return NextResponse.json(
    { verified: true, entitlement },
    { headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
  );
}
