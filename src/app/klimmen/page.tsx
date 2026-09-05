import { pageMetadata } from "@/lib/metadata";
import Klimbibliotheek from "@/components/Klimbibliotheek";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Klimbibliotheek — iconische beklimmingen · Apex Routes",
  description: "Ontdek bekende beklimmingen in Nederland, België, Duitsland en de Alpen — met lengte, stijgingspercentages, hoogtemeters en wegdek. Plan direct een route over de klim.",
  path: "/klimmen",
});

export default function KlimmenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Klimbibliotheek", path: "/klimmen" },
            ])
          ),
        }}
      />
      <Klimbibliotheek />
    </>
  );
}
