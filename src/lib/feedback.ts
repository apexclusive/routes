export const FEEDBACK_CATEGORIES = ["idee", "bug", "wens"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const ROADMAP_OPTIONS = [
  { id: "weer-onderweg", title: "Weer langs de hele route", note: "Regen en wind per uur op je vertrektijd" },
  { id: "groepsrit", title: "Live groepsrit", note: "Dezelfde route, vertrekpunt en status delen" },
  { id: "offline-kaarten", title: "Volledige offline kaarten", note: "Navigeren waar mobiel bereik wegvalt" },
  { id: "cloud-sync", title: "Veilige cloud-synchronisatie", note: "Routes op al je apparaten, met export" },
  { id: "carplay", title: "CarPlay & Android Auto", note: "Native afslagbegeleiding op het dashboard" },
] as const;

const ROADMAP_IDS = new Set<string>(ROADMAP_OPTIONS.map((option) => option.id));

export function validRoadmapVotes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)].filter(
    (item): item is string => typeof item === "string" && ROADMAP_IDS.has(item)
  );
}

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return typeof value === "string" && FEEDBACK_CATEGORIES.includes(value as FeedbackCategory);
}
