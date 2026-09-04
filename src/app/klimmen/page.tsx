import type { Metadata } from "next";
import Klimbibliotheek from "@/components/Klimbibliotheek";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Klimbibliotheek — elke klim van NL, BE en DE · Apex Routes",
  description:
    "De beklimmingen die ertoe doen: Cauberg, Camerig, Muur van Geraardsbergen, Koppenberg, Schauinsland en meer — lengte, gemiddeld en max stijgingspercentage, hoogtemeters, kassei of asfalt. Plan direct een route over de klim.",
};

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
