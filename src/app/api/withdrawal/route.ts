import { NextRequest, NextResponse } from "next/server";
import { trustedReturnOrigin } from "@/lib/server/origin";
import { clientKey, rateLimitHeaders, takeRateLimit } from "@/lib/server/rateLimit";
import { validateWithdrawalRequest } from "@/lib/withdrawal";

export const dynamic = "force-dynamic";

async function sendMail({
  apiKey,
  from,
  to,
  subject,
  text,
  idempotencyKey,
  replyTo,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
  replyTo?: string;
}): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rate = takeRateLimit(`withdrawal:${clientKey(req.headers)}`, 4, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Te veel verzoeken; probeer het later opnieuw." },
      { status: 429, headers: { ...rateLimitHeaders(rate), "Retry-After": "3600" } }
    );
  }

  const expectedOrigin = trustedReturnOrigin(
    process.env.NEXT_PUBLIC_SITE_URL,
    req.nextUrl.origin,
    process.env.NODE_ENV === "production"
  );
  const origin = req.headers.get("origin");
  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ ok: false, error: "Ongeldige herkomst." }, { status: 403 });
  }
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 20_000) {
    return NextResponse.json({ ok: false, error: "Aanvraag is te groot." }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }
  if (raw && typeof raw === "object" && String((raw as { website?: unknown }).website || "")) {
    return NextResponse.json({ ok: true, submittedAt: new Date().toISOString() });
  }
  const withdrawal = validateWithdrawalRequest(raw);
  if (!withdrawal) {
    return NextResponse.json(
      { ok: false, error: "Vul het e-mailadres van de betaling in." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const team =
    process.env.WITHDRAWAL_EMAIL_TO ||
    process.env.BILLING_EMAIL_TO ||
    process.env.PARTNER_EMAIL_TO ||
    "partners@apexclusive.nl";
  if (!apiKey || !from) {
    return NextResponse.json(
      { ok: false, fallback: "mailto", error: "Bevestigingsmail is niet geconfigureerd." },
      { status: 503 }
    );
  }

  const submittedAt = new Date().toISOString();
  const operator = process.env.LEGAL_NAME?.trim() || "Apex Routes";
  const details = [
    "Online herroepingsverzoek Apex Routes",
    "",
    `Ontvangen (UTC): ${submittedAt}`,
    `E-mail bij betaling: ${withdrawal.email}`,
    `Orderreferentie: ${withdrawal.reference || "niet opgegeven"}`,
    `Checkout-sessie vanaf dit apparaat: ${withdrawal.sessionId || "niet beschikbaar"}`,
    `Verzoek-ID: ${withdrawal.requestId}`,
    "",
    "De consument hoeft geen reden op te geven. Controleer de aankoopdatum en verwerk een geldige herroeping in Stripe.",
  ].join("\n");

  const teamSent = await sendMail({
    apiKey,
    from,
    to: team,
    replyTo: withdrawal.email,
    subject: `Herroeping Apex Routes · ${withdrawal.requestId.slice(0, 12)}`,
    text: details,
    idempotencyKey: `withdrawal-team-${withdrawal.requestId}`,
  });
  if (!teamSent) {
    return NextResponse.json(
      { ok: false, fallback: "mailto", error: "Herroeping kon niet worden verstuurd." },
      { status: 502 }
    );
  }

  const customerSent = await sendMail({
    apiKey,
    from,
    to: withdrawal.email,
    subject: "Bevestiging ontvangst herroeping · Apex Routes",
    text: [
      `We bevestigen dat ${operator} je herroepingsverzoek heeft ontvangen.`,
      "",
      `Ontvangen (UTC): ${submittedAt}`,
      `Verzoek-ID: ${withdrawal.requestId}`,
      `Orderreferentie: ${withdrawal.reference || "niet opgegeven"}`,
      "",
      "We controleren de aankoop en bevestigen de verwerking per e-mail. Bewaar dit bericht. Je hoeft geen reden voor de herroeping op te geven.",
      "",
      "Heb jij dit niet aangevraagd? Antwoord dan op dit bericht of mail partners@apexclusive.nl.",
    ].join("\n"),
    idempotencyKey: `withdrawal-customer-${withdrawal.requestId}`,
  });
  if (!customerSent) {
    // Het team hééft de herroeping al ontvangen. Meld dus nooit ten onrechte
    // dat indienen is mislukt; de on-page ontvangst met verzoek-ID blijft geldig.
    return NextResponse.json(
      {
        ok: true,
        submittedAt,
        requestId: withdrawal.requestId,
        confirmationEmail: false,
      },
      { headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { ok: true, submittedAt, requestId: withdrawal.requestId, confirmationEmail: true },
    { headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
  );
}
