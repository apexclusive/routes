/**
 * iCal-export voor kalender-events: "zet het in je agenda" zonder server.
 *
 * Events hebben bewust maandniveau (data's wisselen per editie) — daarom
 * zetten we een herinnering midden in de maand en verwijzen de beschrijving
 * naar de organisator voor de exacte datum. Pure builders + een downloadhook.
 */

import type { CalendarEvent } from "./calendar";

/** RFC 5545-tekst: komma's, puntkomma's en regeleinden escapen. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** YYYYMMDD voor een dag-indicatie (VALUE=DATE). */
export function icsDate(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}${m}${d}`;
}

export interface IcsOptions {
  /** jaar van de editie (default: het huidige jaar) */
  year?: number;
  /** dag-indicator in de maand (default 15, midden in de maand) */
  day?: number;
  /** gegenereerd-op tijdstip voor DTSTAMP */
  now?: Date;
}

/** Bouwt een complete .ics (VCALENDAR met één VEVENT) voor één event. */
export function buildIcs(event: CalendarEvent, opts: IcsOptions = {}): string {
  const year = opts.year ?? event.year ?? new Date().getFullYear();
  const day = opts.day ?? 15;
  const stamp = (opts.now ?? new Date())
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const start = icsDate(year, event.month, Math.min(day, 28));
  // dag erna als DTEND (exclusief) — volledige-dag-event
  const endDate = new Date(Date.UTC(year, event.month - 1, Math.min(day, 28) + 1));
  const end =
    icsDate(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, endDate.getUTCDate());

  const description = [
    event.what,
    `Periode: ${event.period}`,
    `Toegang: ${event.access}`,
    "Exacte datum en aanmelden via de organisator.",
  ].join("\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Apex Routes//Kalender//NL",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}-${year}@apex-routes`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcsText(`${event.name} (${event.period})`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(`${event.place}`)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** Downloadt de .ics in de browser. */
export function downloadIcs(event: CalendarEvent, opts: IcsOptions = {}): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([buildIcs(event, opts)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}-${opts.year ?? new Date().getFullYear()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Bouwt één VEVENT-regelblok (zonder VCALENDAR-wrapper) — bouwsteen voor bundels. */
function veventLines(event: CalendarEvent, opts: IcsOptions = {}): string[] {
  return buildIcs(event, opts)
    .split("\r\n")
    .filter((l) => l !== "BEGIN:VCALENDAR" && l !== "END:VCALENDAR");
}

/** Hele agenda in één .ics: alle events als één VCALENDAR-bundel. */
export function buildIcsBundle(events: CalendarEvent[], opts: IcsOptions = {}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Apex Routes//Kalender//NL",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) lines.push(...veventLines(e, opts));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Downloadt de agenda-bundel in de browser. */
export function downloadIcsBundle(events: CalendarEvent[], opts: IcsOptions = {}): void {
  if (typeof document === "undefined" || events.length === 0) return;
  const blob = new Blob([buildIcsBundle(events, opts)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apex-routes-agenda-${opts.year ?? events[0]?.year ?? new Date().getFullYear()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
