import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import { PRICING_FAQ } from "@/lib/pricing";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Prijzen — Basis, Supporter en Apex Pro",
  description:
    "Begin gratis met Apex Routes, kies Supporter voor ruimere daglimieten of Pro voor onbeperkte AI-routes en GPX-downloads. Vanaf €2,99 per maand via Stripe.",
  alternates: { canonical: "/prijzen" },
  openGraph: {
    title: "Apex Routes prijzen — rijd eerst gratis, kies later",
    description: "Basis gratis · Supporter €2,99 · Pro vanaf €3,25 per maand bij jaarbetaling.",
    url: "/prijzen",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Apex Routes — de mooiste route, in seconden" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Routes prijzen — rijd eerst gratis, kies later",
    description: "Basis gratis · Supporter €2,99 · Pro vanaf €3,25 per maand bij jaarbetaling.",
    images: ["/og.jpg"],
  },
};

export default function PrijzenPage() {
  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Prijzen", path: "/prijzen" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Apex Routes",
      applicationCategory: "TravelApplication",
      operatingSystem: "Web",
      description: "Routeplanner met een gratis Basis-laag en betaalde ruimere gebruikslimieten.",
      offers: [
        { "@type": "Offer", name: "Basis", price: "0", priceCurrency: "EUR", url: "https://routes.apexclusive.nl/prijzen" },
        { "@type": "Offer", name: "Supporter per maand", price: "2.99", priceCurrency: "EUR", url: "https://routes.apexclusive.nl/prijzen" },
        { "@type": "Offer", name: "Pro per maand", price: "5.99", priceCurrency: "EUR", url: "https://routes.apexclusive.nl/prijzen" },
        { "@type": "Offer", name: "Pro per jaar", price: "39.00", priceCurrency: "EUR", url: "https://routes.apexclusive.nl/prijzen" },
        { "@type": "Offer", name: "Pro Lifetime", price: "99.00", priceCurrency: "EUR", url: "https://routes.apexclusive.nl/prijzen" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: PRICING_FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <Pricing />
    </>
  );
}
