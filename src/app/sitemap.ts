import type { MetadataRoute } from "next";
import { CLIMBS } from "@/lib/climbs";
import { RITTEN } from "@/lib/ritten";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://routes.apexclusive.nl";
  const routes: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/ontdek", priority: 0.9, freq: "weekly" },
    { path: "/advies", priority: 0.9, freq: "weekly" },
    { path: "/kalender", priority: 0.8, freq: "weekly" },
    { path: "/ritbank", priority: 0.7, freq: "daily" },
    { path: "/forum", priority: 0.7, freq: "daily" },
    { path: "/checklist", priority: 0.8, freq: "monthly" },
    { path: "/gpx", priority: 0.8, freq: "monthly" },
    { path: "/ritten", priority: 0.8, freq: "monthly" },
    ...RITTEN.map((r) => ({
      path: `/ritten/${r.id}`,
      priority: 0.7,
      freq: "monthly" as const,
    })),
    { path: "/klimmen", priority: 0.8, freq: "monthly" },
    ...CLIMBS.map((c) => ({
      path: `/klimmen/${c.id}`,
      priority: 0.7,
      freq: "monthly" as const,
    })),
    { path: "/adverteren", priority: 0.4, freq: "monthly" },
  ];
  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
