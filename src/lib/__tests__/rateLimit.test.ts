import test from "node:test";
import assert from "node:assert/strict";
import { clientKey, takeRateLimit } from "../server/rateLimit.ts";

test("rate-limit:laat limiet toe en blokkeert de volgende burst", () => {
  const key = `test-${Math.random()}`;
  assert.equal(takeRateLimit(key, 2, 60_000, 1_000).allowed, true);
  const second = takeRateLimit(key, 2, 60_000, 1_001);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
  assert.equal(takeRateLimit(key, 2, 60_000, 1_002).allowed, false);
});

test("rate-limit:nieuw venster reset de teller", () => {
  const key = `test-reset-${Math.random()}`;
  takeRateLimit(key, 1, 1_000, 5_000);
  assert.equal(takeRateLimit(key, 1, 1_000, 6_001).allowed, true);
});

test("rate-limit:client key pakt alleen eerste proxy-ip", () => {
  const headers = new Headers({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" });
  assert.equal(clientKey(headers), "203.0.113.10");
  assert.equal(clientKey(new Headers()), "anonymous");
});
