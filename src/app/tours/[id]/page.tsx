import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TourDetail from "@/components/TourDetail";
import { TOURS, tourKm, type Tour } from "@/lib/tours";
import { breadcrumbSchema, SITE_BASE } from "@/lib/schema";
import { buildTourFaq, faqPageSchema } from "@/lib/faq";
import { standaardRaming } from "@/lib/tourkosten";

/** data is statisch: onbekende ids geven een echte 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return TOURS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = TOURS.find((x) => x.id === id);
  if (!t) return {};
  const title = `${t.naam} — ${t.nachten} nachten, ${t.dagen.length} dagritten · Apex Routes`;
  const r = standaardRaming(t);
  const description = `${t.naam}: ${t.dagen.length} dagritten (${tourKm(t)} km) vanuit één basiskamp in ${t.basiskamp}. Zelf rijden kost ± €${r.perPersoonEur.toLocaleString("nl-NL")} p.p. tegen €${t.georganiseerdVanafEur.toLocaleString("nl-NL")} voor een begeleide reis. Met dagafstanden, passen, seizoen, tol en vignetten.`;
  return {
    title,
    description,
    alternates: { canonical: `/tours/${t.id}` },
    openGraph: {
      title,
      description,
      url: `/tours/${t.id}`,
      type: "article",
      images: [
        {
          url: `/tours/${t.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${t.naam} — ${t.nachten} nachten vanuit ${t.basiskamp}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/tours/${t.id}/opengraph-image`],
    },
  };
}

/** TouristTrip met de dagritten als deelroutes. */
function tripSchema(t: Tour) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t.naam,
    description: t.waaromHier,
    url: `${SITE_BASE}/tours/${t.id}`,
    touristType: t.voertuigen.join(", "),
    itinerary: {
      "@type": "ItemList",
      numberOfItems: t.dagen.length,
      itemListElement: t.dagen.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TouristDestination",
          name: d.titel,
          description: `${d.lengthKm} km — ${d.omschrijving}`,
        },
      })),
    },
    subjectOf: {
      "@type": "Place",
      name: t.basiskamp,
      address: { "@type": "PostalAddress", addressRegion: t.regio, addressCountry: t.country },
    },
  };
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = TOURS.find((x) => x.id === id);
  if (!t) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Tours", path: "/tours" },
              { name: t.naam, path: `/tours/${t.id}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripSchema(t)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(buildTourFaq(t))) }}
      />
      <TourDetail tour={t} />
    </>
  );
}
