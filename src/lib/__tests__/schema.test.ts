import test from "node:test";
import assert from "node:assert/strict";
import { breadcrumbSchema, SITE_BASE } from "../schema.ts";

test("schema:breadcrumb geeft posities en volledige urls", () => {
  const s = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Kalender", path: "/kalender" },
  ]);
  assert.equal(s["@type"], "BreadcrumbList");
  assert.equal(s.itemListElement.length, 2);
  assert.equal(s.itemListElement[0].position, 1);
  assert.equal(s.itemListElement[1].name, "Kalender");
  assert.equal(s.itemListElement[1].item, `${SITE_BASE}/kalender`);
});

test("schema:breadcrumb werkt met eigen base", () => {
  const s = breadcrumbSchema([{ name: "X", path: "/x" }], "https://example.com");
  assert.equal(s.itemListElement[0].item, "https://example.com/x");
});
