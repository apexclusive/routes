import test from "node:test";
import assert from "node:assert/strict";
import { chargeAllowsEntitlement } from "../server/stripeEntitlement.ts";

const paidCharge = {
  status: "succeeded",
  paid: true,
  disputed: false,
  refunded: false,
  amount: 9_900,
  amount_refunded: 0,
};

test("stripe-entitlement:geslaagde charge houdt lifetime actief", () => {
  assert.equal(chargeAllowsEntitlement("succeeded", paidCharge), true);
  assert.equal(
    chargeAllowsEntitlement("succeeded", { ...paidCharge, amount_refunded: 2_000 }),
    true,
    "gedeeltelijke refund trekt het volledige recht niet automatisch in"
  );
});

test("stripe-entitlement:refund of dispute trekt lifetime in", () => {
  assert.equal(
    chargeAllowsEntitlement("succeeded", { ...paidCharge, refunded: true }),
    false
  );
  assert.equal(
    chargeAllowsEntitlement("succeeded", { ...paidCharge, amount_refunded: 9_900 }),
    false
  );
  assert.equal(
    chargeAllowsEntitlement("succeeded", { ...paidCharge, disputed: true }),
    false
  );
  assert.equal(chargeAllowsEntitlement("processing", paidCharge), false);
});
