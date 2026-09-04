/**
 * Live-evenementenfeeds: parseert openbare iCal/.ics-abonnementen en houdt
 * de Apex Kalender automatisch actueel — inclusief afgelastingen
 * (STATUS:CANCELLED uit de feed). Puur en alias-vrij: testbaar in node.
 */

/** Geverifieerde, publieke ICS-feeds (server-side opgehaald, elke 30 min vers). */
export const EVENT_FEEDS: { id: string; label: string; url: string }[] = [
  {
    id: "f1",
    label: "Formule 1 2026",
    url: "https://Bmorganqwe98.github.io/racing-2026-calendar/f1.ics",
  },
  {
    id: "wec",
    label: "WEC 2026",
    url: "https://Bmorganqwe98.github.io/racing-2026-calendar/wec.ics",
  },
  {
    id: "wrc",
    label: "WRC 2026",
    url: "https://Bmorganqwe98.github.io/racing-2026-calendar/wrc.ics",
  },
];

export interface FeedEvent {
  uid: string;
  title: string;
  /** ISO-datum of -datumtijd van de start. */
  start: string;
  end?: string;
  location?: string;
  url?: string;
  /** true als de feed het event annuleerde (weer, organisatie, kalenderwijziging). */
  cancelled: boolean;
  source: string;
}

/** ICS-datums: 20260717 (hele dag) of 20260717T130000Z. */
export function parseIcsDate(raw: string): string | undefined {
  const v = raw.trim();
  const m1 = v.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;
  const m2 = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (m2) {
    return `${m2[1]}-${m2[2]}-${m2[3]}T${m2[4]}:${m2[5]}:${m2[6]}${m2[7] ?? ""}`;
  }
  return undefined;
}

function unfold(text: string): string[] {
  // RFC 5545: vervolgregels beginnen met een spatie of tab
  const lines: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    if ((raw.startsWith(" ") || raw.startsWith("\t")) && lines.length) {
      lines[lines.length - 1] += raw.slice(1);
    } else {
      lines.push(raw);
    }
  }
  return lines;
}

/** Parseert een ICS-tekst naar events; onherkenbare blokken worden overgeslagen. */
export function parseIcsFeed(text: string, source: string): FeedEvent[] {
  const events: FeedEvent[] = [];
  const lines = unfold(String(text || ""));
  let cur: Partial<FeedEvent> & { cancelledRaw?: boolean } | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      cur = { source, cancelled: false };
    } else if (line.startsWith("END:VEVENT")) {
      if (cur?.uid && cur.title && cur.start) {
        events.push({
          uid: cur.uid,
          title: cur.title,
          start: cur.start,
          end: cur.end,
          location: cur.location,
          url: cur.url,
          cancelled: cur.cancelledRaw ?? false,
          source,
        });
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx < 1) continue;
      const key = line.slice(0, idx).toUpperCase();
      const val = line.slice(idx + 1).trim();
      if (key.startsWith("UID")) cur.uid = val;
      else if (key.startsWith("SUMMARY")) cur.title = val;
      else if (key.startsWith("DTSTART")) cur.start = parseIcsDate(val);
      else if (key.startsWith("DTEND")) cur.end = parseIcsDate(val);
      else if (key.startsWith("LOCATION")) cur.location = val;
      else if (key.startsWith("URL")) cur.url = val;
      else if (key.startsWith("STATUS") && val.toUpperCase() === "CANCELLED")
        cur.cancelledRaw = true;
    }
  }
  return events;
}

/** Houdt alleen events die (nog) niet ver achter ons liggen. */
export function filterUpcoming(events: FeedEvent[], now: Date, keepDaysBack = 2): FeedEvent[] {
  const grens = now.getTime() - keepDaysBack * 86_400_000;
  return events
    .filter((e) => {
      const t = Date.parse(e.start);
      return Number.isFinite(t) && t >= grens;
    })
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
