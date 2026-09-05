import { pageMetadata } from "@/lib/metadata";
import Checklist from "@/components/Checklist";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Vertrek-checklist — motor, auto, fiets & wandelen · Apex Routes",
  description: "Interactieve checklist vóór vertrek: techniek, papieren, uitrusting en onderweg. Per voertuig, bewaard in je browser.",
  path: "/checklist",
});

export default function ChecklistPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Vertrek-checklist", path: "/checklist" }])) }}
      />
      <Checklist />
    </>
  );
}
