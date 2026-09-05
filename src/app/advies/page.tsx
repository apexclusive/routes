import { pageMetadata } from "@/lib/metadata";
import Advisor from "@/components/Advisor";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Apex Advisor — kennis voor onderweg · Apex Routes",
  description: "Bestemmingengidsen met geschiedenis, bekende steile klimmen in Nederland, banden- en pechkennis, hotels, navigatie-apps en auto-evenementen.",
  path: "/advies",
});

export default function AdviesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "App-advies", path: "/advies" }])) }}
      />
      <Advisor />
    </>
  );
}
