import { pageMetadata } from "@/lib/metadata";
import GpxGuide from "@/components/GpxGuide";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "GPX & bestanden — formaten, import en export per app · Apex Routes",
  description: "Welk routebestand wanneer? Importeer GPX, KML, TCX, FIT en GeoJSON, open in Google Maps of Waze en download GPX voor compatibele navigatie-apps.",
  path: "/gpx",
});

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Mijn route wordt niet één lijn maar losse punten — nu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Apex probeert de track aan het wegennet te koppelen met de gekozen voertuigmodus. Lukt dat niet betrouwbaar, dan blijft de oorspronkelijke trackvorm behouden en krijg je geen verzonnen afslagen.",
      },
    },
    {
      "@type": "Question",
      name: "Waarom max 11 punten voor Google Maps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google Maps begrenst het aantal tussenpunten en kan per platform anders reageren. Apex kiest daarom maximaal negen representatieve tussenpunten naast start en einde. Maps herberekent de route; vergelijk die vóór vertrek met je oorspronkelijke track.",
      },
    },
    {
      "@type": "Question",
      name: "Werkt importeren ook vanaf mijn telefoon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja: deel het bestand via openen-met naar de Apex Routes-PWA, of sleep het in de planner op desktop. Het bestand wordt lokaal gelezen; voor map matching kunnen routecoördinaten via de Apex-API naar de geconfigureerde routingdienst gaan.",
      },
    },
    {
      "@type": "Question",
      name: "Welk routebestand kan ik het beste bewaren?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bewaar GPX 1.1 met tijdspunten voor latere analyse; zonder tijden blijft het bestand compacter. Een Apex-export bevat de routelijn en, wanneer beschikbaar, afslagpunten. Apps kunnen GPX verschillend interpreteren: controleer de geïmporteerde route vóór vertrek.",
      },
    },
  ],
};

export default function GpxPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "GPX & bestanden", path: "/gpx" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <GpxGuide />
    </>
  );
}
