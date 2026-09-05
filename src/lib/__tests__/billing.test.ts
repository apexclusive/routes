import test from "node:test";
import assert from "node:assert/strict";
import {
  isCheckoutSessionId,
  isInstallationId,
  verifyCheckoutStatus,
} from "../billing.ts";

test("billing:installatie-id accepteert alleen begrensde veilige tokens", () => {
  assert.equal(isInstallationId("install_1234567890123456"), true);
  assert.equal(isInstallationId("kort"), false);
  assert.equal(isInstallationId("install_1234567890123456?x=1"), false);
  assert.equal(isInstallationId("a".repeat(101)), false);
});

test("billing:checkout-sessie-id is veilig en begrensd", () => {
  assert.equal(isCheckoutSessionId("cs_test_abc123"), true);
  assert.equal(isCheckoutSessionId("cs_kort"), false);
  assert.equal(isCheckoutSessionId(`cs_${"a".repeat(197)}`), false);
  assert.equal(isCheckoutSessionId("cs_test_abc123?redirect=1"), false);
});

test("billing:ongeldige sessie is definitief, zonder netwerkrequest", async () => {
  const result = await verifyCheckoutStatus("geen-stripe-sessie");
  assert.deepEqual(result, { entitlement: null, inactive: true, pending: false, retryable: false });
});

test("billing:alleen definitieve Stripe-status trekt toegang in", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('{"verified":false}', { status: 402 });
    assert.deepEqual(await verifyCheckoutStatus("cs_test_abc123"), {
      entitlement: null,
      inactive: true,
      pending: false,
      retryable: false,
    });

    globalThis.fetch = async () => new Response('{"verified":false}', { status: 503 });
    assert.deepEqual(await verifyCheckoutStatus("cs_test_abc123"), {
      entitlement: null,
      inactive: false,
      pending: false,
      retryable: true,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("billing:vertraagde betaalmethode blijft pending en verificatie gebruikt POST", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "/api/billing/verify");
      assert.equal(init?.method, "POST");
      assert.equal(new URLSearchParams(String(input).split("?")[1] || "").size, 0);
      return new Response('{"verified":false,"pending":true}', { status: 202 });
    };
    assert.deepEqual(await verifyCheckoutStatus("cs_test_abc123"), {
      entitlement: null,
      inactive: false,
      pending: true,
      retryable: true,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("billing:geverifieerd entitlement inclusief echt bedrag blijft intact", async () => {
  const originalFetch = globalThis.fetch;
  const entitlement = {
    plan: "year" as const,
    sessionId: "cs_test_abc123",
    verifiedAt: 1_800_000_000_000,
    amount: 29,
    currency: "EUR",
  };
  try {
    globalThis.fetch = async () => Response.json({ verified: true, entitlement });
    assert.deepEqual(await verifyCheckoutStatus(entitlement.sessionId), {
      entitlement,
      inactive: false,
      pending: false,
      retryable: false,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
