import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RitDetail from "@/components/RitDetail";
import { RITTEN } from "@/lib/ritten";
import { breadcrumbSchema } from "@/lib/schema";
import { buildRitFaq, faqPageSchema } from "@/lib/faq";

/** data is statisch: onbekende ids geven een echte 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return RITTEN.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = RITTEN.find((x) => x.id === id);
  if (!r) return {};
  return {
    title: `${r.naam} (${r.regio}) — ${r.lengthKm} km dagrit · Apex Routes`,
    description: `${r.naam}: ${r.lengthKm} km in ${r.rijmin >= 60 ? Math.floor(r.rijmin / 60) : 1} uur rijden door ${r.regio}. Hoogtepunten: ${r.hoogtepunten.join(", ")}. Plan de rit direct of boek je verblijf in ${r.plaats}.`,
  };
}

export default async function RitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = RITTEN.find((x) => x.id === id);
  if (!r) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Ritten", path: "/ritten" },
              { name: r.naam, path: `/ritten/${r.id}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(buildRitFaq(r))) }}
      />
      <RitDetail rit={r} />
    </>
  );
}
