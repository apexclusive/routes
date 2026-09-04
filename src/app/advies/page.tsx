import type { Metadata } from "next";
import Advisor from "@/components/Advisor";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Apex Advisor — kennis voor onderweg · Apex Routes",
  description:
    "Bestemmingengidsen met geschiedenis, de steilste klimmen van Nederland, banden- en pechkennis, hotels, apps en carmeetings.",
};

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
