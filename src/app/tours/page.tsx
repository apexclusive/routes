import { pageMetadata } from "@/lib/metadata";
import Tours from "@/components/Tours";
import { breadcrumbSchema, SITE_BASE } from "@/lib/schema";
import { TOURS, tourKm } from "@/lib/tours";

export const metadata = pageMetadata({
  title: "Meerdaagse tours — 6 alpenreizen vanuit één basiskamp · Apex Routes",
  description:
    "Dolomieten vanuit Arabba, Stelvio vanuit Bormio, Grossglockner vanuit Zell am See, de Zwitserse passen vanuit Andermatt, plus Zuid-Limburg en de Ardennen. Eén hotel, elke dag een andere lus — met dagafstanden, rijtijden, tol en vignetten.",
  path: "/tours",
});

export default function ToursPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Tours", path: "/tours" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Meerdaagse tours vanuit één basiskamp",
            numberOfItems: TOURS.length,
            itemListElement: TOURS.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_BASE}/tours/${t.id}`,
              name: `${t.naam} — ${t.nachten} nachten, ${tourKm(t)} km`,
            })),
          }),
        }}
      />
      <Tours />
    </>
  );
}
