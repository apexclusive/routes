import test from "node:test";
import assert from "node:assert/strict";
import { parseIcsFeed, parseIcsDate, filterUpcoming, EVENT_FEEDS } from "../eventsfeed.ts";

const ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "UID:dutch-gp-2026@apex",
  "SUMMARY:Dutch Grand Prix",
  "DTSTART;VALUE=DATE:20260821",
  "DTEND;VALUE=DATE:20260824",
  "LOCATION:Zandvoort, Netherlands",
  "URL:https://dutchgp.com",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:afgelast@apex",
  "SUMMARY:Regenrace Afgelast",
  "DTSTART:20260901T120000Z",
  "STATUS:CANCELLED",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:kort@apex",
  "SUMMARY:Te weinig data",
  "DTSTART:20261010",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

test("eventsfeed:parseert events met datums, locatie en url", () => {
  const evts = parseIcsFeed(ICS, "test");
  assert.equal(evts.length, 3);
  const gp = evts[0];
  assert.equal(gp.title, "Dutch Grand Prix");
  assert.equal(gp.start, "2026-08-21");
  assert.equal(gp.end, "2026-08-24");
  assert.equal(gp.location, "Zandvoort, Netherlands");
  assert.equal(gp.cancelled, false);
});

test("eventsfeed:STATUS CANCELLED wordt doorgegeven (afgelastingen zichtbaar)", () => {
  const evts = parseIcsFeed(ICS, "test");
  assert.equal(evts[1].cancelled, true);
  assert.equal(evts[1].start, "2026-09-01T12:00:00Z");
});

test("eventsfeed:ontvouwen van vervolgregels en rare datums vallen weg", () => {
  assert.equal(parseIcsDate("20260821"), "2026-08-21");
  assert.equal(parseIcsDate("20260821T130000Z"), "2026-08-21T13:00:00Z");
  assert.equal(parseIcsDate("geen-datum"), undefined);
  const metVervolg = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:sub",
    "SUMMARY:Eerste regel",
    "  en vervolg",
    "DTSTART:20261111",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
  const evts = parseIcsFeed(metVervolg, "t");
  assert.equal(evts[0].title, "Eerste regel en vervolg");
});

test("eventsfeed:filterUpcoming houdt toekomst en afgelaste, dropt verleden", () => {
  const evts = parseIcsFeed(ICS, "test");
  const augustus2026 = new Date("2026-08-01T00:00:00Z");
  const up = filterUpcoming(evts, augustus2026);
  assert.equal(up.length, 3);
  const sep2026 = new Date("2026-09-02T00:00:00Z");
  const up2 = filterUpcoming(evts, sep2026);
  assert.equal(up2.length, 2);
  assert.ok(up2.some((e) => e.cancelled), "afgelast event blijft zichtbaar als waarschuwing");
});

test("eventsfeed:de feedlijst bevat de geverifieerde bronnen", () => {
  assert.equal(EVENT_FEEDS.length, 3);
  for (const f of EVENT_FEEDS) {
    assert.ok(f.url.startsWith("https://"));
    assert.ok(f.label.length > 3);
  }
});
