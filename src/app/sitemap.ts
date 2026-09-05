import type { MetadataRoute } from "next";
import { CLIMBS } from "@/lib/climbs";
import { RITTEN } from "@/lib/ritten";
import { TOURS } from "@/lib/tours";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://routes.apexclusive.nl";
  const lastModified = new Date("2026-09-06T00:00:00.000Z");
  const routes: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/ontdek", priority: 0.9, freq: "weekly" },
    { path: "/advies", priority: 0.9, freq: "weekly" },
    { path: "/kalender", priority: 0.8, freq: "weekly" },
    { path: "/ritbank", priority: 0.7, freq: "monthly" },
    { path: "/forum", priority: 0.7, freq: "monthly" },
    { path: "/checklist", priority: 0.8, freq: "monthly" },
    { path: "/gpx", priority: 0.8, freq: "monthly" },
    { path: "/ritten", priority: 0.8, freq: "monthly" },
    ...RITTEN.map((r) => ({
      path: `/ritten/${r.id}`,
      priority: 0.7,
      freq: "monthly" as const,
    })),
    { path: "/passen", priority: 0.9, freq: "weekly" },
    { path: "/tours", priority: 0.9, freq: "monthly" },
    ...TOURS.map((t) => ({
      path: `/tours/${t.id}`,
      priority: 0.8,
      freq: "monthly" as const,
    })),
    { path: "/klimmen", priority: 0.8, freq: "monthly" },
    { path: "/klimmen/ranglijst", priority: 0.8, freq: "monthly" },
    ...CLIMBS.map((c) => ({
      path: `/klimmen/${c.id}`,
      priority: 0.7,
      freq: "monthly" as const,
    })),
    { path: "/prijzen", priority: 0.8, freq: "monthly" },
    { path: "/adverteren", priority: 0.5, freq: "monthly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/voorwaarden", priority: 0.2, freq: "yearly" },
    { path: "/herroepen", priority: 0.2, freq: "yearly" },
  ];
  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
