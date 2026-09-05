import Link from "next/link";
import LegalShell, { LegalSection } from "@/components/LegalShell";
import WithdrawalForm from "@/components/WithdrawalForm";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Aankoop herroepen · Apex Routes",
  description: "Dien binnen de wettelijke bedenktijd eenvoudig online een herroeping van je Apex Routes-aankoop in en ontvang direct een bevestiging.",
  path: "/herroepen",
});

export default function HerroepenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Aankoop herroepen", path: "/herroepen" },
            ])
          ),
        }}
      />
      <LegalShell
        eyebrow="HERROEPING"
        title="Een online aankoop eenvoudig terugdraaien"
        intro="Kocht je als consument op afstand? Dan heb je meestal veertien dagen bedenktijd. Met het formulier hieronder kun je zonder account en zonder reden laten weten dat je de overeenkomst herroept."
      >
        <LegalSection title="Voordat je verstuurt">
          <p>
            Dit formulier is voor het wettelijke herroepingsrecht binnen de bedenktijd.
            We blokkeren een later verzoek niet: het team controleert altijd welke rechten
            en voorwaarden op jouw aankoop van toepassing zijn.
          </p>
          <p>
            Wil je alleen een volgende verlenging stoppen en de lopende betaalde periode
            blijven gebruiken? Open dan “Abonnement en facturen beheren” vanuit je Pro-status.
            Je kunt ook <Link href="/voorwaarden" className="text-yellow-300 underline">de voorwaarden bekijken</Link>.
          </p>
        </LegalSection>
        <WithdrawalForm />
        <LegalSection title="Wat gebeurt er daarna?">
          <p>
            Je ontvangt direct per e-mail een ontvangstbevestiging met datum en verzoek-ID.
            Daarna zoekt het team de betaling op, verwerkt een geldige herroeping en bevestigt
            de uitkomst. Wettelijke consumentenrechten worden door dit formulier niet beperkt.
          </p>
        </LegalSection>
      </LegalShell>
    </>
  );
}
