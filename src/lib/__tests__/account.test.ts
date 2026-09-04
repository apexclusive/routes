import test from "node:test";
import assert from "node:assert/strict";
import {
  tidyName,
  tidyEmail,
  isValidEmail,
  isAccount,
  createAccount,
} from "../account.ts";

test("account:naam wordt opgeschoond (spaties, lengte)", () => {
  assert.equal(tidyName("  Jan   de   Vries  "), "Jan de Vries");
  assert.equal(tidyName("x".repeat(50)).length, 40);
});

test("account:e-mail validatie en normalisatie", () => {
  assert.ok(isValidEmail("rit@apexclusive.nl"));
  assert.ok(isValidEmail("a.b+c@server.co.uk"));
  assert.equal(isValidEmail("geen-mail"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail("a b@c.nl"), false);
  assert.equal(tidyEmail("  RiT@ApExclusive.NL "), "rit@apexclusive.nl");
});

test("account:createAccount vraagt naam en geldige e-mail", () => {
  const acc = createAccount("Sam", "SAM@Example.com", 1000);
  assert.ok(acc);
  assert.equal(acc.name, "Sam");
  assert.equal(acc.email, "sam@example.com");
  assert.equal(acc.createdAt, 1000);
  assert.ok(acc.id.length > 4);
  assert.equal(createAccount("A", "ok@example.com"), null);
  assert.equal(createAccount("Sam", "geen-mail"), null);
});

test("account:isAccount wijst afwijkende objecten af", () => {
  assert.equal(isAccount(null), false);
  assert.equal(isAccount({}), false);
  assert.equal(isAccount({ id: "1", name: "Sam", email: "fout", createdAt: 1 }), false);
  assert.ok(
    isAccount({ id: "1", name: "Sam", email: "sam@ex.nl", createdAt: 1 }),
  );
});
