import type { Metadata } from "next";
import GpxGuide from "@/components/GpxGuide";

export const metadata: Metadata = {
  title: "GPX & bestanden — formaten, import en export per app · Apex Routes",
  description:
    "Welk routebestand wanneer? GPX, KML, TCX, FIT en Geojson importeren in Apex Routes en exporteren naar Google Maps, Waze, Kurviger, OsmAnd, Komoot en Garmin.",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Mijn route wordt niet één lijn maar losse punten — nu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Map matching legt je GPX-track op het wegenraster en maakt er één doorlopende route van, met echte afslaginstructies. Sleep het bestand op de planner en zie het gebeuren.",
      },
    },
    {
      "@type": "Question",
      name: "Waarom max 11 punten voor Google Maps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Maps knapt URLs met te veel waypoints af en zet ze als POI's neer, met omrij-U-turns tot gevolg. Apex Routes kiest max 11 slimme ankers exact op de weg, zodat Maps netjes van punt naar punt navigeert.",
      },
    },
    {
      "@type": "Question",
      name: "Werkt importeren ook vanaf mijn telefoon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja: deel het bestand via openen-met naar Apex Routes (PWA), of sleep het in de planner op desktop. Alles gebeurt lokaal — je track verlaat je apparaat niet.",
      },
    },
    {
      "@type": "Question",
      name: "Welk routebestand kan ik het beste bewaren?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GPX 1.1 met tijdspunten als je hem later wilt analyseren; zonder tijden is hij compacter. Apex-exports bevatten altijd afslaginstructies, zodat elke app de route identiek opbouwt.",
      },
    },
  ],
};

export default function GpxPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <GpxGuide />
    </>
  );
}
