import { NextRequest, NextResponse } from "next/server";
import { isCheckoutSessionId, isInstallationId } from "@/lib/billing";
import { clientKey, rateLimitHeaders, takeRateLimit } from "@/lib/server/rateLimit";
import { trustedReturnOrigin } from "@/lib/server/origin";

export const dynamic = "force-dynamic";

interface StripeSession {
  id?: string;
  status?: string;
  client_reference_id?: string | null;
  customer?: string | { id?: string } | null;
  metadata?: Record<string, string>;
}

function safeOrigin(req: NextRequest): string {
  return trustedReturnOrigin(
    process.env.NEXT_PUBLIC_SITE_URL,
    req.nextUrl.origin,
    process.env.NODE_ENV === "production"
  );
}

export async function POST(req: NextRequest) {
  const rate = takeRateLimit(`portal:${clientKey(req.headers)}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen; probeer het later opnieuw." },
      { status: 429, headers: { ...rateLimitHeaders(rate), "Retry-After": "600" } }
    );
  }
  let body: { sessionId?: unknown; installationId?: unknown; returnPath?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!isCheckoutSessionId(sessionId) || !isInstallationId(body.installationId)) {
    return NextResponse.json({ error: "Ongeldige betaling of apparaat." }, { status: 400 });
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Abonnementsbeheer is niet geconfigureerd." }, { status: 503 });
  }

  try {
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      }
    );
    if (!sessionResponse.ok) {
      return NextResponse.json({ error: "Betaling kon niet worden gecontroleerd." }, { status: 502 });
    }
    const session = (await sessionResponse.json()) as StripeSession;
    const linkedInstallation = session.metadata?.installation_id || session.client_reference_id;
    const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (
      session.id !== sessionId ||
      session.status !== "complete" ||
      linkedInstallation !== body.installationId ||
      !customer
    ) {
      return NextResponse.json({ error: "Geen beheerbaar abonnement gevonden." }, { status: 403 });
    }

    const returnPath = body.returnPath === "/prijzen" ? "/prijzen" : "/";
    const form = new URLSearchParams({
      customer,
      return_url: `${safeOrigin(req)}${returnPath}`,
    });
    const portalResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `portal-${sessionId}-${Math.floor(Date.now() / 60_000)}`,
      },
      body: form,
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    const portal = (await portalResponse.json().catch(() => null)) as {
      url?: string;
      error?: { message?: string };
    } | null;
    if (!portalResponse.ok || !portal?.url) {
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? portal?.error?.message || "Stripe Portal-fout."
              : "Abonnementsbeheer kon niet starten.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { url: portal.url },
      { headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Abonnementsbeheer is tijdelijk niet bereikbaar." }, { status: 502 });
  }
}
