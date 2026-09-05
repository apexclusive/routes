import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingSearchUrl,
  experienceSearchUrl,
  defaultTravelDates,
  localIsoDate,
  buildPartnerMailto,
  validatePartnerLead,
} from "../monetize.ts";

const g = process.env as Record<string, string | undefined>;

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

test("monetize:hotel-link neemt geldige reisdata en gasten mee", () => {
  const url = new URL(bookingSearchUrl("Bormio (IT)", {
    checkin: "2026-09-18",
    checkout: "2026-09-20",
    adults: 12,
    rooms: 0,
  }));
  assert.equal(url.searchParams.get("checkin"), "2026-09-18");
  assert.equal(url.searchParams.get("checkout"), "2026-09-20");
  assert.equal(url.searchParams.get("group_adults"), "10");
  assert.equal(url.searchParams.get("no_rooms"), "1");

  const fout = new URL(bookingSearchUrl("Bormio", {
    checkin: "2026-09-20",
    checkout: "2026-09-18",
  }));
  assert.equal(fout.searchParams.has("checkin"), false);
});

test("monetize:activiteiten-link gebruikt zoekplaats en optionele partner-id", () => {
  const old = g.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID;
  g.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID = "APEX123";
  try {
    const url = new URL(experienceSearchUrl("Gérardmer (FR)"));
    assert.equal(url.searchParams.get("q"), "Gérardmer");
    assert.equal(url.searchParams.get("partner_id"), "APEX123");
    assert.equal(url.searchParams.get("utm_medium"), "online_publisher");
  } finally {
    if (old === undefined) delete g.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID;
    else g.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID = old;
  }
});

test("monetize:standaardweekend ligt minimaal twee weken vooruit en duurt twee nachten", () => {
  const dates = defaultTravelDates(new Date("2026-09-04T12:00:00Z"));
  assert.deepEqual(dates, { checkin: "2026-09-18", checkout: "2026-09-20" });
});

test("monetize:lokale datum verschuift niet via UTC", () => {
  assert.equal(localIsoDate(new Date(2026, 8, 4, 0, 30)), "2026-09-04");
});

test("monetize:partnerlead wordt begrensd en gevalideerd", () => {
  assert.deepEqual(
    validatePartnerLead({
      bedrijf: "  Hotel   Apex ",
      email: " INFO@APEX.NL ",
      pakket: "Hotel- & horecapartner",
      bericht: "Bel mij terug",
    }),
    {
      bedrijf: "Hotel Apex",
      email: "info@apex.nl",
      pakket: "Hotel- & horecapartner",
      bericht: "Bel mij terug",
    }
  );
  assert.equal(validatePartnerLead({ bedrijf: "X", email: "mis", pakket: "p" }), null);
  assert.equal(
    validatePartnerLead({ bedrijf: "Apex", email: "info@apex.nl", pakket: "Onbekend\nBCC" }),
    null
  );
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
