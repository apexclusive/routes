/**
 * Schema.org-helpers voor structured data op de toolpagina's.
 * Puur en alias-vrij zodat ze ook in node --test draaien.
 */

export const SITE_BASE = "https://routes.apexclusive.nl";

/** BreadcrumbList: Home > Toolpagina — helpt Google én AI-assistenten de structuur te snappen. */
export function breadcrumbSchema(
  items: { name: string; path: string }[],
  base = SITE_BASE
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}
