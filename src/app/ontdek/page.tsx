import type { Metadata } from "next";
import Discover from "@/components/Discover";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Ontdek routes — Apex Routes",
  description:
    "Top-10 motor- en autoroutes per land (NL · BE · LU · DE), mooie ritten naar circuits en rally-GPX van StreetGasm en meer.",
};

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
