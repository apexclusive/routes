import { NextRequest, NextResponse } from "next/server";
import { validatePartnerLead } from "@/lib/monetize";
import { clientKey, rateLimitHeaders, takeRateLimit } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Zet een commerciële aanvraag direct in de inbox via Resend. Zonder sleutel
 * meldt de route expliciet dat de client op mailto moet terugvallen; er gaat
 * dus nooit stilletjes een waardevolle lead verloren.
 */
export async function POST(req: NextRequest) {
  const rate = takeRateLimit(`partner:${clientKey(req.headers)}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Te veel aanvragen; probeer het later opnieuw." },
      { status: 429, headers: { ...rateLimitHeaders(rate), "Retry-After": "3600" } }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  // Onzichtbaar honeypotveld: een mens laat dit leeg.
  if (raw && typeof raw === "object" && String((raw as { website?: unknown }).website || "")) {
    return NextResponse.json({ ok: true });
  }

  const lead = validatePartnerLead(raw);
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Vul een bedrijf en geldig e-mailadres in." },
      { status: 400 }
    );
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.PARTNER_EMAIL_TO || "partners@apexclusive.nl";
  if (!key || !from) {
    return NextResponse.json(
      { ok: false, fallback: "mailto", error: "E-mailservice niet geconfigureerd." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(8_000),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email,
        subject: `Partnerlead · ${lead.pakket} · ${lead.bedrijf}`,
        text: [
          "Nieuwe aanvraag via routes.apexclusive.nl/adverteren",
          "",
          `Bedrijf: ${lead.bedrijf}`,
          `E-mail: ${lead.email}`,
          `Pakket: ${lead.pakket}`,
          "",
          lead.bericht || "(geen extra bericht)",
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, fallback: "mailto", error: "Versturen is tijdelijk niet gelukt." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { ok: true },
      { headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, fallback: "mailto", error: "Versturen is tijdelijk niet gelukt." },
      { status: 502 }
    );
  }
}
