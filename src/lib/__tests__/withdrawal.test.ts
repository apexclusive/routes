import test from "node:test";
import assert from "node:assert/strict";
import { validateWithdrawalRequest, withdrawalMailto } from "../withdrawal.ts";

const REQUEST_ID = "123e4567-e89b-12d3-a456-426614174000";

test("herroeping:minimale identificatie wordt genormaliseerd", () => {
  assert.deepEqual(
    validateWithdrawalRequest({
      email: " KLANT@EXAMPLE.NL ",
      reference: " Factuur\n 123 ",
      sessionId: "cs_test_abc123",
      requestId: REQUEST_ID,
    }),
    {
      email: "klant@example.nl",
      reference: "Factuur 123",
      sessionId: "cs_test_abc123",
      requestId: REQUEST_ID,
    }
  );
});

test("herroeping:reden is niet verplicht en ongeldige sessie wordt niet meegestuurd", () => {
  const request = validateWithdrawalRequest({
    email: "klant@example.nl",
    reference: "",
    sessionId: "geen-stripe-id",
    requestId: REQUEST_ID,
  });
  assert.ok(request);
  assert.equal(request.reference, "");
  assert.equal(request.sessionId, "");
});

test("herroeping:ongeldig e-mail- of verzoek-id wordt geweigerd", () => {
  assert.equal(validateWithdrawalRequest({ email: "mis", requestId: REQUEST_ID }), null);
  assert.equal(validateWithdrawalRequest({ email: "klant@example.nl", requestId: "kort" }), null);
});

test("herroeping:mailto bevat een ondubbelzinnige verklaring", () => {
  const url = withdrawalMailto("klant@example.nl", "INV-42");
  const params = new URLSearchParams(url.split("?")[1]);
  assert.match(params.get("subject") || "", /Herroeping/i);
  assert.match(params.get("body") || "", /hierbij herroep ik/i);
  assert.match(params.get("body") || "", /INV-42/);
});
