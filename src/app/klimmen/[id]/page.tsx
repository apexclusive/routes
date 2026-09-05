import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KlimDetail from "@/components/KlimDetail";
import { CLIMBS } from "@/lib/climbs";
import { breadcrumbSchema } from "@/lib/schema";
import { buildKlimFaq, faqPageSchema } from "@/lib/faq";

/** data is statisch: onbekende ids worden door de router geweigerd (404) */
export const dynamicParams = false;

export function generateStaticParams() {
  return CLIMBS.map((c) => ({ id: c.id }));
}

function kmLabel(lengthM: number) {
  return (lengthM / 1000).toFixed(1).replace(".", ",");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = CLIMBS.find((x) => x.id === id);
  if (!c) return {};
  const title = `${c.name} (${c.place}) — ${kmLabel(c.lengthM)} km aan ${c.avgPct}% · Apex Routes`;
  const description = `${c.name}: ${kmLabel(c.lengthM)} km, gemiddeld ${c.avgPct}%, maximaal ${c.maxPct}%, ${c.elevationM} hoogtemeters${c.surface === "asfalt" ? "" : `, ${c.surface}`}. ${c.note} Plan direct een rit over de ${c.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/klimmen/${c.id}` },
    openGraph: {
      title,
      description,
      url: `/klimmen/${c.id}`,
      type: "article",
      images: [{ url: `/klimmen/${c.id}/opengraph-image`, width: 1200, height: 630, alt: `${c.name} — beklimming bij ${c.place}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/klimmen/${c.id}/opengraph-image`],
    },
  };
}

export default async function KlimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = CLIMBS.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Klimbibliotheek", path: "/klimmen" },
              { name: c.name, path: `/klimmen/${c.id}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(buildKlimFaq(c))) }}
      />
      <KlimDetail klim={c} />
    </>
  );
}
