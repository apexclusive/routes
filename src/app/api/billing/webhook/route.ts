import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/server/stripeWebhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WATCHED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "invoice.payment_failed",
  "customer.subscription.deleted",
  "customer.subscription.updated",
]);

interface StripeObject {
  id?: string;
  status?: string;
  payment_status?: string;
  amount_total?: number;
  amount_due?: number;
  currency?: string;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string>;
}

interface StripeEvent {
  id?: string;
  type?: string;
  created?: number;
  data?: { object?: StripeObject };
}

function describe(event: StripeEvent): { subject: string; text: string } | null {
  if (!event.id || !event.type || !WATCHED_EVENTS.has(event.type)) return null;
  const object = event.data?.object || {};
  // Een gewone actieve subscription-update is geen actiepunt en veroorzaakt
  // anders veel operationele mail bij elke wijziging.
  if (event.type === "customer.subscription.updated" && ["active", "trialing"].includes(object.status || "")) {
    return null;
  }
  const plan = object.metadata?.plan || "onbekend";
  const email = object.customer_details?.email || object.customer_email || "niet meegestuurd";
  const amount = typeof object.amount_total === "number"
    ? object.amount_total
    : object.amount_due;
  const money = typeof amount === "number"
    ? `${(amount / 100).toFixed(2)} ${(object.currency || "eur").toUpperCase()}`
    : "niet meegestuurd";
  const labels: Record<string, string> = {
    "checkout.session.completed": "Checkout voltooid",
    "checkout.session.async_payment_succeeded": "Vertraagde betaling geslaagd",
    "checkout.session.async_payment_failed": "Vertraagde betaling mislukt — opvolging nodig",
    "charge.refunded": "Betaling terugbetaald",
    "charge.dispute.created": "Betaling betwist — controle nodig",
    "invoice.payment_failed": "Betaling mislukt — opvolging nodig",
    "customer.subscription.deleted": "Abonnement beëindigd",
    "customer.subscription.updated": `Abonnementstatus: ${object.status || "onbekend"}`,
  };
  return {
    subject: `[Apex billing] ${labels[event.type]}`,
    text: [
      labels[event.type],
      `Stripe event: ${event.id}`,
      `Object: ${object.id || "onbekend"}`,
      `Plan: ${plan}`,
      `Campagne: ${[object.metadata?.utm_source, object.metadata?.utm_medium, object.metadata?.utm_campaign].filter(Boolean).join(" / ") || "direct/onbekend"}`,
      `Status: ${object.status || object.payment_status || "onbekend"}`,
      `Bedrag: ${money}`,
      `E-mail: ${email}`,
      "",
      "Controleer Stripe voor de definitieve status. Lokale entitlements worden bij appgebruik opnieuw server-side geverifieerd.",
    ].join("\n"),
  };
}

async function sendOperationalMail(event: StripeEvent): Promise<boolean> {
  const message = describe(event);
  if (!message) return true;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.BILLING_EMAIL_TO || process.env.PARTNER_EMAIL_TO;
  if (!apiKey || !from || !to) return true;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `stripe-${event.id}`,
      },
      body: JSON.stringify({ from, to: [to], subject: message.subject, text: message.text }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ received: false }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();
  if (rawBody.length > 1_000_000 || !verifyStripeSignature(rawBody, signature, secret)) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
  if (!event.id || !event.type) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  if (!(await sendOperationalMail(event))) {
    // Stripe probeert opnieuw; de Resend-idempotency-key voorkomt dubbele mail.
    return NextResponse.json({ received: false }, { status: 502 });
  }
  return NextResponse.json(
    { received: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
