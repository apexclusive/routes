import { pageMetadata } from "@/lib/metadata";
import Klimranglijst from "@/components/Klimranglijst";
import { breadcrumbSchema } from "@/lib/schema";
import { CLIMBS } from "@/lib/climbs";
import { rankClimbs } from "@/lib/climbscore";

export const metadata = pageMetadata({
  title: "De zwaarste beklimmingen — klimranglijst op FIETS-index · Apex Routes",
  description:
    "Alle beklimmingen van de Benelux en de Alpen objectief gerangschikt op de FIETS-index: Timmelsjoch, Stelvio, Mont Ventoux, Alpe d'Huez tot de Cauberg en de Keutenberg. Met lengte, percentage, hoogtemeters en indicatieve klimtijd.",
  path: "/klimmen/ranglijst",
});

/** ItemList-schema: Google toont ranglijsten graag als rich result. */
function ranglijstSchema() {
  const top = rankClimbs(CLIMBS).slice(0, 25);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "De zwaarste beklimmingen volgens de FIETS-index",
    numberOfItems: top.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: top.map((r) => ({
      "@type": "ListItem",
      position: r.rang,
      name: r.climb.name,
      url: `https://routes.apexclusive.nl/klimmen/${r.climb.id}`,
    })),
  };
}

export default function KlimranglijstPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Klimbibliotheek", path: "/klimmen" },
              { name: "Ranglijst", path: "/klimmen/ranglijst" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ranglijstSchema()) }}
      />
      <Klimranglijst />
    </>
  );
}
