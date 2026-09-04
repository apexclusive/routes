import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Optionele LLM-laag. Alleen actief wanneer OPENAI_API_KEY is gezet.
 * Zonder key (of bij een fout) geeft de route { ai: null } terug,
 * zodat de client terugvalt op de ingebouwde regex-parser. Niets breekt.
 *
 * `aiConfigured` vertelt de client alléén of er een key gezet is — zo kan de
 * UI een indicator tonen (een lege text doet géén upstream-call).
 */
export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ ai: null, aiConfigured: false });
  }

  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  let text = "";
  try {
    const body = await req.json();
    text = String(body?.text || "").slice(0, 500);
  } catch {
    /* ignore */
  }
  if (!text) return NextResponse.json({ ai: null, aiConfigured: true });

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      // trage LLM mag de chat niet vasthouden; de regex-parser vangt de val
      signal: AbortSignal.timeout(9000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              'Je bent een compacte NL-route-parser. Antwoord ALLEEN met JSON, geen markdown: {"start":"","bestemming":"","km":"","voertuig":"","stijl":"","tussenstops":[],"opmerking":""}. start/bestemming = plaatsnaam; een rondrit heeft bestemming "". km = getal of "". voertuig = auto|motor|cabrio|fiets|wandelen. stijl = kronkelig|direct|"".',
          },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return NextResponse.json({ ai: null, aiConfigured: true });
    const j = await res.json();
    const s = String(j?.choices?.[0]?.message?.content || "");
    const m = s.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ ai: null, aiConfigured: true });
    return NextResponse.json({ ai: JSON.parse(m[0]), aiConfigured: true });
  } catch {
    return NextResponse.json({ ai: null, aiConfigured: true });
  }
}
