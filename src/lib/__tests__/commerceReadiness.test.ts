import test from "node:test";
import assert from "node:assert/strict";
import { missingCommerceSettings } from "../server/commerceReadiness.ts";

const ready = {
  LEGAL_NAME: "Apex B.V.",
  LEGAL_ADDRESS: "Voorbeeldstraat 1, Maastricht",
  LEGAL_REGISTRATION: "12345678",
  RESEND_API_KEY: "re_test",
  RESEND_FROM: "Apex <mail@example.nl>",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
};

test("commerce-readiness:lokale ontwikkeling blokkeert niet", () => {
  assert.deepEqual(missingCommerceSettings({}, false), []);
});

test("commerce-readiness:productie vereist identiteit, mail en webhook", () => {
  assert.deepEqual(missingCommerceSettings(ready, true), []);
  const missing = missingCommerceSettings({ ...ready, LEGAL_ADDRESS: "", RESEND_API_KEY: undefined }, true);
  assert.deepEqual(missing, ["LEGAL_ADDRESS", "RESEND_API_KEY"]);
});
