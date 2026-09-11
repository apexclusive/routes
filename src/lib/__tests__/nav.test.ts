import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE_LINKS, SITE_GROEPEN } from "../nav.ts";

test("nav:home is de eerste link en elke href is uniek", () => {
  assert.equal(SITE_LINKS[0].href, "/", "planner/home eerst");
  const hrefs = SITE_LINKS.map((l) => l.href);
  assert.equal(new Set(hrefs).size, hrefs.length, "dubbele hrefs");
});

test("nav:alle kernsecties zijn bereikbaar vanuit het menu", () => {
  const hrefs = new Set(SITE_LINKS.map((l) => l.href));
  for (const nodig of ["/", "/ritten", "/klimmen", "/klimmen/ranglijst", "/kalender", "/ontdek", "/advies", "/forum", "/ritbank", "/checklist", "/gpx", "/prijzen", "/adverteren"]) {
    assert.ok(hrefs.has(nodig), `menu mist ${nodig}`);
  }
});

test("nav:link-hrefs beginnen met / en groepen zijn gedekt", () => {
  const groepen = new Set(SITE_GROEPEN.map((g) => g.id));
  for (const l of SITE_LINKS) {
    assert.ok(l.href.startsWith("/"), `geen interne href: ${l.href}`);
    assert.ok(groepen.has(l.groep), `onbekende groep: ${l.groep}`);
    assert.ok(l.label.length >= 3, `leeg label: ${l.href}`);
  }
  for (const g of SITE_GROEPEN) {
    assert.ok(SITE_LINKS.some((l) => l.groep === g.id), `lege groep: ${g.id}`);
  }
});
