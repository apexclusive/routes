import type { Metadata } from "next";
import Checklist from "@/components/Checklist";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Vertrek-checklist — motor, auto, fiets & wandelen · Apex Routes",
  description:
    "Interactieve checklist vóór vertrek: techniek, papieren, uitrusting en onderweg. Per voertuig, bewaard in je browser.",
};

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
