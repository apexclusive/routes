import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

export interface StripeSignature {
  timestamp: number;
  signatures: string[];
}

export function parseStripeSignature(header: string): StripeSignature | null {
  const values = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = Number(values.find(([key]) => key === "t")?.[1]);
  const signatures = values
    .filter(([key, value]) => key === "v1" && /^[a-f0-9]{64}$/i.test(value || ""))
    .map(([, value]) => value.toLowerCase());
  return Number.isInteger(timestamp) && timestamp > 0 && signatures.length
    ? { timestamp, signatures }
    : null;
}

/** Stripe's signed payload is `${timestamp}.${rawBody}` using HMAC-SHA256. */
export function verifyStripeSignature(
  rawBody: string,
  header: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): boolean {
  const parsed = parseStripeSignature(header);
  if (!parsed || !secret || Math.abs(nowSeconds - parsed.timestamp) > MAX_CLOCK_SKEW_SECONDS) {
    return false;
  }
  const expected = createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return parsed.signatures.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate, "hex");
    return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
  });
}
