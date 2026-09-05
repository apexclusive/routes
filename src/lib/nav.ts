/** Eén bron van waarheid voor site-brede navigatie (hamburger-menu). */
export type SiteLink = {
  href: string;
  label: string;
  /** icoon-key, gemapt in SiteMenu */
  icon: "planner" | "ritten" | "tours" | "passen" | "klimmen" | "ranglijst" | "kalender" | "forum" | "atlas" | "advisor" | "ritbank" | "checklist" | "gpx" | "pricing" | "adverteren";
  groep: "plannen" | "ontdekken" | "meer";
};

export const SITE_LINKS: SiteLink[] = [
  { href: "/", label: "Routeplanner", icon: "planner", groep: "plannen" },
  { href: "/ritten", label: "Ritten", icon: "ritten", groep: "plannen" },
  { href: "/tours", label: "Meerdaagse tours", icon: "tours", groep: "plannen" },
  { href: "/klimmen", label: "Klimbibliotheek", icon: "klimmen", groep: "plannen" },
  { href: "/klimmen/ranglijst", label: "Klimranglijst", icon: "ranglijst", groep: "plannen" },
  { href: "/passen", label: "Passen open?", icon: "passen", groep: "plannen" },
  { href: "/kalender", label: "Evenementenkalender", icon: "kalender", groep: "plannen" },
  { href: "/ontdek", label: "Route-atlas", icon: "atlas", groep: "ontdekken" },
  { href: "/advies", label: "Route-advisor", icon: "advisor", groep: "ontdekken" },
  { href: "/forum", label: "Forum & chat", icon: "forum", groep: "ontdekken" },
  { href: "/ritbank", label: "Ritbank", icon: "ritbank", groep: "meer" },
  { href: "/checklist", label: "Vertrek-checklist", icon: "checklist", groep: "meer" },
  { href: "/gpx", label: "GPX & bestanden", icon: "gpx", groep: "meer" },
  { href: "/prijzen", label: "Prijzen & Apex Pro", icon: "pricing", groep: "meer" },
  { href: "/adverteren", label: "Adverteren", icon: "adverteren", groep: "meer" },
];

export const SITE_GROEPEN: { id: SiteLink["groep"]; label: string }[] = [
  { id: "plannen", label: "Plannen" },
  { id: "ontdekken", label: "Ontdekken" },
  { id: "meer", label: "Meer" },
];
