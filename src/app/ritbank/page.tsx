import { pageMetadata } from "@/lib/metadata";
import Ritbank from "@/components/Ritbank";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Ritbank — routes delen · Apex Routes",
  description: "Deel je Apex-routes met één link, open links van anderen en spreek af op het prikbord. Zonder account, zonder server.",
  path: "/ritbank",
});

export default function RitbankPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Ritbank", path: "/ritbank" }])) }}
      />
      <Ritbank />
    </>
  );
}
