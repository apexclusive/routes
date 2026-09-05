export interface WithdrawalRequest {
  email: string;
  reference: string;
  sessionId: string;
  requestId: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUEST_ID = /^[a-zA-Z0-9_-]{20,64}$/;
const SESSION_ID = /^cs_[a-zA-Z0-9_]{8,196}$/;

/** Minimal data needed to identify and acknowledge an online withdrawal. */
export function validateWithdrawalRequest(value: unknown): WithdrawalRequest | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const email = String(raw.email || "").trim().toLowerCase().slice(0, 160);
  const reference = String(raw.reference || "")
    .trim()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100);
  const candidateSession = String(raw.sessionId || "").trim();
  const sessionId = SESSION_ID.test(candidateSession) ? candidateSession : "";
  const requestId = String(raw.requestId || "").trim().slice(0, 64);
  if (!EMAIL.test(email) || !REQUEST_ID.test(requestId)) return null;
  return { email, reference, sessionId, requestId };
}

export function withdrawalMailto(email: string, reference = ""): string {
  const subject = "Herroeping online aankoop Apex Routes";
  const body = [
    "Hierbij herroep ik mijn online aankoop van Apex Routes.",
    "",
    `E-mail bij de betaling: ${email.trim()}`,
    `Orderreferentie (indien bekend): ${reference.trim() || "niet bekend"}`,
    "",
    "Datum:",
    "Naam (optioneel):",
  ].join("\n");
  return `mailto:partners@apexclusive.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
