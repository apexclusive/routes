import { pageMetadata } from "@/lib/metadata";
import LegalShell, { LegalSection } from "@/components/LegalShell";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Privacy — lokaal waar het kan",
  description: "Lees welke gegevens Apex Routes lokaal bewaart, welke externe route- en betaaldiensten worden gebruikt en hoe affiliate- en analyticsmeting werkt.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Privacy", path: "/privacy" },
      ])) }} />
      <LegalShell
        eyebrow="PRIVACY"
        title="Jouw route is van jou"
        intro="Apex Routes is lokaal-eerst ontworpen. Hieronder staat in gewone taal wat in je browser blijft, wat een externe dienst ontvangt en wanneer er iets naar het Apex-team gaat."
      >
        <LegalSection title="1. Wie verwerkt wat">
          <p>De onderaan genoemde exploitant van Apex Routes is verwerkingsverantwoordelijke voor gegevens die je bewust via betaling, feedback of een zakelijke aanvraag verstrekt. Externe aanbieders verwerken hun deel volgens hun eigen beleid.</p>
          <p>De grondslag is uitvoering van de overeenkomst voor checkout en toegang, toestemming voor vrijwillige invoer, gerechtvaardigd belang voor beveiliging en geaggregeerde productverbetering, en wettelijke plicht voor betaaladministratie.</p>
        </LegalSection>

        <LegalSection title="2. Wat standaard op je apparaat blijft">
          <p>Opgeslagen routes, checkliststatus, forum- en Ritbankberichten, bucketlist, taalkeuze, pollkeuzes, gebruikstellers en een eventueel lokaal profiel staan in <code>localStorage</code> of <code>sessionStorage</code> van jouw browser.</p>
          <p>Deze gegevens worden niet automatisch naar een Apex-account gesynchroniseerd. Je verwijdert ze via de browserinstellingen of door de betreffende functie leeg te maken.</p>
        </LegalSection>

        <LegalSection title="3. Route-, kaart-, weer- en locatiediensten">
          <p>Om een route te berekenen stuurt de server noodzakelijke plaatsnamen of coördinaten door naar geconfigureerde diensten zoals OpenStreetMap/Nominatim, OSRM, OpenRouteService, Overpass, Open-Meteo, CARTO en Esri. De browser haalt kaarttegels bij CARTO/Esri en lettertypebestanden bij Google Fonts op; deze aanbieders ontvangen daarbij normale verbindingsgegevens zoals het IP-adres. Hun eigen privacyvoorwaarden gelden voor die verwerking.</p>
          <p>Browserlocatie wordt alleen gevraagd na jouw actie. Apex bewaart geen doorlopende locatiegeschiedenis op een eigen server. Bij rit-opname blijft de opname lokaal tenzij jij zelf een deel-link maakt.</p>
        </LegalSection>

        <LegalSection title="4. AI-verwerking">
          <p>Als de optionele AI-parser is ingeschakeld, kan maximaal 500 tekens van je routeopdracht via de Apex-server naar de geconfigureerde AI-aanbieder gaan. Zet geen gevoelige persoonsgegevens in een routeopdracht. Zonder AI-sleutel gebruikt de app alleen de lokale regelparser.</p>
        </LegalSection>

        <LegalSection title="5. Betalen en lidmaatschap">
          <p>Stripe verwerkt de checkout en betaalgegevens. Apex ontvangt geen kaart- of banknummer, maar wel de status, het gekozen plan, een Checkout-identificatie en mogelijk het e-mailadres op de betaling. Een anonieme installatie-id koppelt de geslaagde betaling aan deze browser.</p>
        </LegalSection>

        <LegalSection title="6. Analytics zonder route-inhoud">
          <p>Alleen wanneer privacyvriendelijke analytics is geconfigureerd, meten we paginaweergaven en expliciete productevents zoals “planner gestart”, “export” of “checkout gestart”. Routeopdrachten, coördinaten, namen en e-mailadressen worden niet als analytics-eigenschap verstuurd.</p>
          <p>Campagneparameters zoals <code>utm_source</code> kunnen maximaal 30 dagen lokaal worden onthouden om te zien welk kanaal werkt. De app laadt geen analytics-script als de beheerder geen analyticsdomein heeft ingesteld.</p>
        </LegalSection>

        <LegalSection title="7. Feedback, aanvragen en herroeping">
          <p>Alleen na drukken op “versturen” gaat de ingevulde tekst via de Apex-server en e-mailprovider naar het team. Zakelijke aanvragen bevatten het opgegeven bedrijf en e-mailadres. Bij een online herroeping gebruiken we het betaal-e-mailadres, een eventuele orderreferentie en de lokale Checkout-identificatie om de aankoop te vinden, het verzoek te verwerken en direct een ontvangstbevestiging te sturen.</p>
        </LegalSection>

        <LegalSection title="8. Partnerlinks en commissie">
          <p>Links naar onder meer Booking.com en GetYourGuide kunnen een partner-id bevatten. Als je daarna een geldige boeking doet, kan Apex commissie ontvangen. Vergelijk prijs, beschikbaarheid en voorwaarden bij de aanbieder. De aanbieder verwerkt de klik en boeking onder de eigen voorwaarden. Partnerlinks zijn herkenbaar en krijgen technisch het kenmerk <code>rel=&quot;sponsored&quot;</code>.</p>
        </LegalSection>

        <LegalSection title="9. Bewaartermijnen, beveiliging en vragen">
          <p>Contactmails bewaren we zolang nodig voor beantwoording, administratie en wettelijke verplichtingen. We begrenzen invoer, remmen misbruik en versturen geen betaalgegevens door de app.</p>
          <p>Voor inzage, correctie, verwijdering, beperking, bezwaar of overdraagbaarheid van gegevens die je bewust hebt verstrekt: <a className="text-yellow-300 underline" href="mailto:partners@apexclusive.nl">partners@apexclusive.nl</a>. Vermeld geen volledige betaalkaartgegevens in e-mail.</p>
          <p>Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens. Externe aanbieders kunnen gegevens buiten de EER verwerken op basis van hun gepubliceerde doorgiftemechanismen.</p>
        </LegalSection>
      </LegalShell>
    </>
  );
}
