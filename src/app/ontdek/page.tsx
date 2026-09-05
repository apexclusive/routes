import { pageMetadata } from "@/lib/metadata";
import Discover from "@/components/Discover";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Ontdek routes — Apex Routes",
  description: "Route-inspiratie voor Nederland, België, Luxemburg en Duitsland, ritten naar circuits en evenementen waarvan organisatoren routebestanden aanbieden.",
  path: "/ontdek",
});

export default function OntdekPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Ontdek routes", path: "/ontdek" }])) }}
      />
      <Discover />
    </>
  );
}
