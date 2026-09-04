import { NextResponse } from "next/server";
import {
  EVENT_FEEDS,
  parseIcsFeed,
  filterUpcoming,
  type FeedEvent,
} from "@/lib/eventsfeed";

/**
 * Live-evenementenfeeds: haalt openbare iCal-kalenders op en normaliseert
 * ze naar events (incl. afgelastingen). Response cache't 30 min op het CDN —
 * de kalender vernieuwt zichzelf, zonder handmatige update.
 */
export const revalidate = 1800;

export async function GET() {
  const sources: {
    id: string;
    label: string;
    ok: boolean;
    count: number;
    error?: string;
  }[] = [];
  const events: FeedEvent[] = [];

  await Promise.all(
    EVENT_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          signal: AbortSignal.timeout(6000),
          // de route zelf cache't; haal de bron vers op
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const parsed = filterUpcoming(parseIcsFeed(text, feed.id), new Date(), 30);
        events.push(...parsed.slice(0, 60));
        sources.push({
          id: feed.id,
          label: feed.label,
          ok: true,
          count: parsed.length,
        });
      } catch (err) {
        sources.push({
          id: feed.id,
          label: feed.label,
          ok: false,
          count: 0,
          error: err instanceof Error ? err.message : "onbekende fout",
        });
      }
    })
  );

  events.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  return NextResponse.json(
    { fetchedAt: new Date().toISOString(), sources, events: events.slice(0, 180) },
    { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=600" } }
  );
}
