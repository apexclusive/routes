import test from "node:test";
import assert from "node:assert/strict";
import { buildIcs, escapeIcsText, icsDate, buildIcsBundle } from "../ical.ts";
import { EVENTS } from "../calendar.ts";

const NOW = new Date("2026-05-04T10:00:00.000Z");

test("ical:tekst escapet RFC 5545-tekens", () => {
  assert.equal(escapeIcsText("a,b;c\nd"), "a\\,b\\;c\\nd");
  assert.equal(escapeIcsText("Zwarte Woud, Duitsland"), "Zwarte Woud\\, Duitsland");
});

test("ical:datumnotatie is YYYYMMDD", () => {
  assert.equal(icsDate(2026, 3, 9), "20260309");
  assert.equal(icsDate(2026, 12, 1), "20261201");
});

test("ical:ics heeft kalender- en eventstructuur", () => {
  const ev = EVENTS[0];
  const ics = buildIcs(ev, { year: 2026, now: NOW });
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes("END:VEVENT"));
  assert.ok(ics.trimEnd().endsWith("END:VCALENDAR"));
  assert.ok(ics.includes("DTSTART;VALUE=DATE:2026"));
  assert.ok(ics.includes(`SUMMARY:${ev.name.split(" ")[0]}`.slice(0, 12)));
});

test("ical:dtend ligt een dag na dtstart", () => {
  const ev = EVENTS.find((e) => e.month === 3) ?? EVENTS[0];
  const ics = buildIcs(ev, { year: 2026, day: 10, now: NOW });
  const start = ics.match(/DTSTART;VALUE=DATE:(\d{8})/)?.[1];
  const end = ics.match(/DTEND;VALUE=DATE:(\d{8})/)?.[1];
  assert.ok(start && end);
  const diff =
    (Date.parse(`${end!.slice(0, 4)}-${end!.slice(4, 6)}-${end!.slice(6, 8)}`) -
      Date.parse(`${start!.slice(0, 4)}-${start!.slice(4, 6)}-${start!.slice(6, 8)}`)) /
    86_400_000;
  assert.equal(diff, 1);
});

test("ical:beschrijving verwijst naar de bron en bevat periode", () => {
  const ics = buildIcs(EVENTS[0], { year: 2026, now: NOW });
  assert.ok(ics.includes("organisator"));
  assert.ok(ics.includes("Periode"));
  assert.ok(ics.includes(`URL:${EVENTS[0].url}`));
});

test("ical:elk event genereert een unieke uid", () => {
  const uids = new Set(
    EVENTS.map((e) => buildIcs(e, { year: 2026, now: NOW }).match(/UID:(.+)/)![1]),
  );
  assert.equal(uids.size, EVENTS.length);
});

test("ical:bundel bevat alle events als VEVENTs met unieke UIDs", () => {
  const bundel = buildIcsBundle([EVENTS[0], EVENTS[1], EVENTS[2]], { year: 2026, now: new Date("2026-01-01") });
  const regels = bundel.split("\r\n");
  assert.equal(regels.filter((l) => l === "BEGIN:VCALENDAR").length, 1);
  assert.equal(regels.filter((l) => l === "END:VCALENDAR").length, 1);
  assert.equal(regels.filter((l) => l === "BEGIN:VEVENT").length, 3);
  const uids = regels.filter((l) => l.startsWith("UID:"));
  assert.equal(new Set(uids).size, 3);
  assert.ok(bundel.endsWith("END:VCALENDAR\r\n"));
});
