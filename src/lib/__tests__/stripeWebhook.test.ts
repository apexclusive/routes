import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { parseStripeSignature, verifyStripeSignature } from "../server/stripeWebhook.ts";

const secret = "whsec_test_secret";
const body = '{"id":"evt_123","type":"checkout.session.completed"}';
const timestamp = 1_800_000_000;
const signature = createHmac("sha256", secret)
  .update(`${timestamp}.${body}`)
  .digest("hex");
const header = `t=${timestamp},v1=${signature}`;

test("Stripe signature parser leest timestamp en meerdere v1-handtekeningen", () => {
  const parsed = parseStripeSignature(`${header},v1=${"a".repeat(64)}`);
  assert.equal(parsed?.timestamp, timestamp);
  assert.equal(parsed?.signatures.length, 2);
});

test("Stripe webhook accepteert alleen geldige, recente HMAC", () => {
  assert.equal(verifyStripeSignature(body, header, secret, timestamp + 30), true);
  assert.equal(verifyStripeSignature(`${body} `, header, secret, timestamp + 30), false);
  assert.equal(verifyStripeSignature(body, header, "wrong", timestamp + 30), false);
  assert.equal(verifyStripeSignature(body, header, secret, timestamp + 301), false);
});

test("Stripe webhook weigert malformed headers", () => {
  assert.equal(verifyStripeSignature(body, "", secret, timestamp), false);
  assert.equal(verifyStripeSignature(body, `t=${timestamp},v0=${signature}`, secret, timestamp), false);
  assert.equal(verifyStripeSignature(body, `t=nope,v1=${signature}`, secret, timestamp), false);
});
