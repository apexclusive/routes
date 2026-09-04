import test from "node:test";
import assert from "node:assert/strict";
import { checkoutUrl, bookingSearchUrl, anyCheckoutConfigured, buildPartnerMailto } from "../monetize.ts";

const g = process.env as Record<string, string | undefined>;

test("monetize:per-plan link wint boven de generieke fallback", () => {
  const bak = { ...g };
  g.NEXT_PUBLIC_STRIPE_LINK = "https://pay.stripe.com/generiek";
  g.NEXT_PUBLIC_STRIPE_LINK_YEAR = "https://pay.stripe.com/jaar";
  try {
    assert.equal(checkoutUrl("year"), "https://pay.stripe.com/jaar");
    assert.equal(checkoutUrl("month"), "https://pay.stripe.com/generiek");
    assert.equal(anyCheckoutConfigured(), true);
  } finally {
    Object.assign(g, bak);
    delete g.NEXT_PUBLIC_STRIPE_LINK;
    delete g.NEXT_PUBLIC_STRIPE_LINK_YEAR;
  }
});

test("monetize:zonder configuratie levert alles een lege string op", () => {
  const bak = { ...g };
  delete g.NEXT_PUBLIC_STRIPE_LINK;
  delete g.NEXT_PUBLIC_STRIPE_LINK_SUPPORTER;
  delete g.NEXT_PUBLIC_STRIPE_LINK_MONTH;
  delete g.NEXT_PUBLIC_STRIPE_LINK_YEAR;
  delete g.NEXT_PUBLIC_STRIPE_LINK_LIFE;
  try {
    assert.equal(checkoutUrl("supporter"), "");
    assert.equal(anyCheckoutConfigured(), false);
  } finally {
    Object.assign(g, bak);
  }
});

test("monetize:hotel-zoeklink is geldig en neemt partner-id mee", () => {
  const url = new URL(bookingSearchUrl("Valkenburg (NL)"));
  assert.equal(url.hostname, "www.booking.com");
  assert.equal(url.searchParams.get("ss"), "Valkenburg");
  assert.ok(url.searchParams.has("aid") === false); // zonder env geen aid

  const bak = g.NEXT_PUBLIC_BOOKING_AID;
  g.NEXT_PUBLIC_BOOKING_AID = "1234567";
  try {
    const metAid = new URL(bookingSearchUrl("  Aken  "));
    assert.equal(metAid.searchParams.get("aid"), "1234567");
    assert.equal(metAid.searchParams.get("ss"), "Aken");
  } finally {
    if (bak === undefined) delete g.NEXT_PUBLIC_BOOKING_AID;
    else g.NEXT_PUBLIC_BOOKING_AID = bak;
  }
});

test("monetize:partner-mailto bevat bedrijf, pakket en bericht url-encoded", () => {
  const url = buildPartnerMailto("Café De Bende", "info@debende.be", "Event-promotie", "Dag APEX,\nWij willen onze rally aanmelden.");
  assert.ok(url.startsWith("mailto:partners@apexclusive.nl?"));
  const [, qs] = url.split("?");
  const params = new URLSearchParams(qs);
  assert.ok(params.get("subject")?.includes("Event-promotie"));
  assert.ok(params.get("subject")?.includes("Caf"));
  assert.ok(params.get("body")?.includes("Caf"));
  assert.ok((params.get("body") ?? "").includes("\n"), "newlines moeten bewaard blijven");
});
