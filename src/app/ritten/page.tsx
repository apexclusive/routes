import { pageMetadata } from "@/lib/metadata";
import Ritten from "@/components/Ritten";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Ritten — de 10 mooiste dagritten van de Benelux tot de Alpen · Apex Routes",
  description: "Mergellandroute, Ardennen-Ourthe, Eifel met Nordschleife, Route des Crêtes, Schwarzwaldhochstraße, Stelvio en Grossglockner: lengte, rijtijd, hoogtepunten en klimmen. Direct te plannen in de Apex-planner.",
  path: "/ritten",
});

export default function RittenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Ritten", path: "/ritten" },
            ])
          ),
        }}
      />
      <Ritten />
    </>
  );
}
