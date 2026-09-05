import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTION_ORIGIN, trustedReturnOrigin } from "../server/origin.ts";

test("return-origin:productie accepteert alleen geconfigureerde HTTPS-origin", () => {
  assert.equal(
    trustedReturnOrigin("https://routes.example.com/path?x=1", "https://attacker.example", true),
    "https://routes.example.com"
  );
  assert.equal(
    trustedReturnOrigin("http://routes.example.com", "https://attacker.example", true),
    PRODUCTION_ORIGIN
  );
});

test("return-origin:ongeldige productieconfig valt nooit terug op request-host", () => {
  assert.equal(
    trustedReturnOrigin("geen-url", "https://attacker.example", true),
    PRODUCTION_ORIGIN
  );
  assert.equal(
    trustedReturnOrigin(undefined, "https://attacker.example", true),
    PRODUCTION_ORIGIN
  );
});

test("return-origin:lokale HTTP-ontwikkeling blijft mogelijk", () => {
  assert.equal(
    trustedReturnOrigin("http://localhost:3000/prijzen", "http://localhost:3000", false),
    "http://localhost:3000"
  );
});
