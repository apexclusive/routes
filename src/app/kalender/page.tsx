import { pageMetadata } from "@/lib/metadata";
import Kalender from "@/components/Kalender";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Kalender — events voor rijders & lopers · Apex Routes",
  description: "Trackdays op de Nordschleife, MTB-festivals, marathons in Europa, de Vierdaagse en cyclo's — filter op maand en categorie.",
  path: "/kalender",
});

export default function KalenderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Kalender", path: "/kalender" }])) }}
      />
      <Kalender />
    </>
  );
}
