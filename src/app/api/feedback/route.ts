import { NextRequest, NextResponse } from "next/server";
import { isFeedbackCategory, validRoadmapVotes } from "@/lib/feedback";
import { clientKey, rateLimitHeaders, takeRateLimit } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

function refererPath(headers: Headers): string {
  try {
    return new URL(headers.get("referer") || "").pathname.slice(0, 160) || "/";
  } catch {
    return "onbekend";
  }
}

export async function POST(req: NextRequest) {
  const rate = takeRateLimit(`feedback:${clientKey(req.headers)}`, 8, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Te veel berichten; probeer het later opnieuw." },
      { status: 429, headers: { ...rateLimitHeaders(rate), "Retry-After": "3600" } }
    );
  }

  let body: { category?: unknown; text?: unknown; votes?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }
  if (String(body.website || "")) return NextResponse.json({ ok: true });

  const category = String(body.category || "idee").toLowerCase();
  const text = String(body.text || "").trim().slice(0, 500);
  const votes = validRoadmapVotes(body.votes);
  if (!isFeedbackCategory(category) || text.length < 3) {
    return NextResponse.json({ ok: false, error: "Schrijf minimaal drie tekens." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.FEEDBACK_EMAIL_TO || process.env.PARTNER_EMAIL_TO || "partners@apexclusive.nl";
  if (!key || !from) {
    return NextResponse.json(
      { ok: false, fallback: "mailto", error: "Feedbackmail is niet geconfigureerd." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(8_000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Apex-feedback · ${category}`,
        text: [
          `Categorie: ${category}`,
          `Pagina: ${refererPath(req.headers)}`,
          votes.length ? `Roadmap-keuzes: ${votes.join(", ")}` : "Roadmap-keuzes: geen",
          "",
          text,
        ].join("\n"),
      }),
    });
    if (!response.ok) throw new Error("resend failed");
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
