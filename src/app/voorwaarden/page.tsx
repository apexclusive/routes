import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import LegalShell, { LegalSection } from "@/components/LegalShell";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Voorwaarden — veilig plannen en transparant betalen",
  description: "Gebruiks-, veiligheids- en abonnementsvoorwaarden van Apex Routes in gewone taal.",
  path: "/voorwaarden",
});

export default function VoorwaardenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Voorwaarden", path: "/voorwaarden" },
      ])) }} />
      <LegalShell
        eyebrow="VOORWAARDEN"
        title="De route helpt. Jij blijft bestuurder."
        intro="Deze afspraken houden het eenvoudig: Apex is een planningshulpmiddel, verkeersregels en de situatie buiten gaan altijd voor, en een betaald plan mag nooit je eigen routes gijzelen."
      >
        <LegalSection title="1. Dienst en toepasselijkheid">
          <p>Apex Routes biedt routeplanning, bestandsimport en -export, route-inspiratie, weer-, hoogte- en evenementinformatie. Door de dienst te gebruiken stem je in met deze voorwaarden. Voor een zakelijke samenwerking gelden daarnaast de schriftelijk overeengekomen partnerafspraken.</p>
        </LegalSection>

        <LegalSection title="2. Veiligheid eerst">
          <p>Routes, afslaginstructies, wegstatus, weer, openingstijden, tol en evenementen kunnen wijzigen of onvolledig zijn. Controleer officiële bronnen en verkeersborden vóór en tijdens vertrek. Bedien de app niet rijdend en volg nooit een route over een afgesloten, privé- of onveilige weg.</p>
          <p>Een route met “geschat” is geen berekening over het actuele wegenraster. Gebruik die alleen als concept en controleer hem extra.</p>
        </LegalSection>

        <LegalSection title="3. Jouw inhoud en gedeelde links">
          <p>Je blijft verantwoordelijk voor bestanden, foto’s, berichten en routes die je invoert of deelt. Deel geen inhoud waarop je geen rechten hebt, persoonsgegevens van anderen, gevaarlijke instructies of onrechtmatige content.</p>
          <p>Een deel-link kan routegegevens in de URL bevatten. Iedereen met die link kan de inhoud zien; behandel een privéroute dus als een privélink.</p>
        </LegalSection>

        <LegalSection title="4. Gratis gebruik en redelijke grenzen">
          <p>Basis heeft dagelijkse gebruikslimieten die in de app staan. Geautomatiseerd scrapen, het omzeilen van limieten, overbelasten van routingdiensten en misbruik van API’s is niet toegestaan. We mogen redelijke limieten aanpassen om beschikbaarheid en kosten beheersbaar te houden.</p>
        </LegalSection>

        <LegalSection title="5. Supporter, Pro en Lifetime">
          <p>De checkout toont vóór betaling het gekozen plan, de periode, toepasselijke belastingen en het definitieve totaal. Maand- en jaarplannen verlengen volgens de informatie in Stripe totdat je opzegt. Lifetime is een eenmalig gebruiksrecht voor de levensduur van de Apex Routes-dienst; het is geen garantie dat elke externe databron eeuwig beschikbaar blijft.</p>
          <p>Omdat er nog geen centraal routeaccount is, wordt toegang na Stripe-verificatie in de browser bewaard. Voor herstel of apparaatmigratie van een betaald plan helpt support op basis van het betaalbewijs. Deze technische beperking staat ook vóór aankoop op de prijzenpagina.</p>
          <p>Opzeggen kan via “Abonnement en facturen beheren” in je Apex Pro-status, een beschikbare Stripe-beheerlink of via <a className="text-yellow-300 underline" href="mailto:partners@apexclusive.nl">partners@apexclusive.nl</a>. Na stoppen blijven lokaal opgeslagen routes van jou en valt het gebruik na de betaalde periode terug naar Basis.</p>
        </LegalSection>

        <LegalSection title="6. Herroeping, fouten en terugbetaling">
          <p>Koop je als consument op afstand, dan heb je meestal veertien dagen bedenktijd. Je kunt binnen die termijn zonder reden een ondubbelzinnige herroepingsverklaring indienen. Uitzonderingen gelden alleen als aan alle wettelijke voorwaarden daarvoor is voldaan.</p>
          <p><Link href="/herroepen" className="text-yellow-300 underline">Gebruik de online herroepingsfunctie</Link> om zonder account je verklaring in te dienen en direct een ontvangstbevestiging per e-mail te krijgen. Je mag ook een eigen duidelijke verklaring mailen. Neem bij een foutieve of dubbele betaling zo snel mogelijk contact op met het betaalbewijs.</p>
        </LegalSection>

        <LegalSection title="7. Externe diensten en partnerlinks">
          <p>Kaarten, routing, weer, evenementen, hotels, activiteiten en betalingen kunnen door externe aanbieders worden geleverd. Hun beschikbaarheid en voorwaarden vallen buiten de directe controle van Apex. Een herkenbare partnerlink kan commissie opleveren; redactionele routevolgorde wordt niet verkocht zonder sponsorvermelding.</p>
        </LegalSection>

        <LegalSection title="8. Beschikbaarheid en aansprakelijkheid">
          <p>We streven naar een snelle en betrouwbare dienst, maar garanderen geen ononderbroken werking of foutloze route. Voor zover wettelijk toegestaan is Apex niet aansprakelijk voor indirecte schade, gemiste evenementen, verkeersboetes of schade door het blind volgen van digitale aanwijzingen. Niets in deze tekst beperkt aansprakelijkheid die wettelijk niet mag worden beperkt.</p>
        </LegalSection>

        <LegalSection title="9. Wijzigingen en contact">
          <p>We kunnen de dienst en voorwaarden aanpassen bij nieuwe functies, leveranciers of wetgeving. De datum bovenaan laat zien welke versie geldt. Materiële wijzigingen communiceren we duidelijk in de app.</p>
          <p>Vragen of klachten: <a className="text-yellow-300 underline" href="mailto:partners@apexclusive.nl">partners@apexclusive.nl</a>. We proberen een inhoudelijke klacht eerst rechtstreeks op te lossen.</p>
        </LegalSection>

        <LegalSection title="10. Toepasselijk recht">
          <p>Nederlands recht is van toepassing. Voor consumenten blijven dwingende rechten en de bevoegde rechter van hun woonland gelden voor zover de wet dat voorschrijft.</p>
        </LegalSection>
      </LegalShell>
    </>
  );
}
