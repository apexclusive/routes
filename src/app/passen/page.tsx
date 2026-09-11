import { pageMetadata } from "@/lib/metadata";
import Passen from "@/components/Passen";
import { breadcrumbSchema } from "@/lib/schema";
import { faqPageSchema } from "@/lib/faq";
import { PASSEN, periodeLabel } from "@/lib/passtatus";

export const metadata = pageMetadata({
  title: "Wanneer gaan de bergpassen open? Seizoenskalender 18 alpenpassen · Apex Routes",
  description:
    "Stelvio, Gavia, Grossglockner, Susten, Furka, Iséran en Bonette: per maand welke alpenpassen normaal open liggen, met de werkelijke openingsdata van 2026, de autovrije fietsdagen en een directe link naar de officiële status van vandaag.",
  path: "/passen",
});

/** Elke dag opnieuw genereren, zodat de standaardmaand meeloopt met het seizoen. */
export const revalidate = 86400;

const FAQ = [
  {
    q: "Wanneer gaat de Stelvio open?",
    a: "De Passo dello Stelvio gaat normaal gesproken begin juni open en sluit rond 1 november. In 2026 ging de pas op 31 mei open. In sneeuwrijke jaren zoals 2021 en 2022 werd het pas half juni. De officiële status staat bij ANAS en op stelviopass.net.",
  },
  {
    q: "Welke alpenpas gaat het vroegst open?",
    a: "De Grossglockner Hochalpenstrasse: die ging in 2026 al op 25 april open, omdat er actief geruimd wordt voor het toerisme. Let wel op de openingstijden van de tolpoorten, want 's nachts is de weg dicht.",
  },
  {
    q: "Welke pas gaat het laatst open?",
    a: "De Sustenpass is berucht laat — in 2026 pas op 12 juni, terwijl de Furka, Grimsel en Nufenen al op 29 mei opengingen. Ook de Col de l'Iséran, met 2770 m de hoogste van de Alpen, ging pas op 12 juni open.",
  },
  {
    q: "Wat is de veiligste maand voor een alpentour?",
    a: "Juli tot en met september. Dan liggen vrijwel alle passen open. September is bij veel rijders favoriet: minder druk, koelere lucht en asfalt dat nog warm genoeg is voor grip. Juni en oktober zijn randseizoen — dan kan het net misgaan.",
  },
  {
    q: "Kan een bergpas ook in de zomer dicht zijn?",
    a: "Ja. Zomerse sneeuwval, steenslag, werkzaamheden of een wielerevenement sluiten een pas zomaar voor een dag. De Stelvio is in 2026 op 29 augustus en 19 september volledig autovrij voor fietsers. Controleer daarom altijd de officiële bron op je vertrekdag.",
  },
  {
    q: "Waarom staat hier geen live-status?",
    a: "Omdat een gemiddelde geen garantie is. Wie op basis van 'meestal open' achthonderd kilometer rijdt en voor een slagboom staat, heeft niets aan ons. Daarom tonen we de seizoensverwachting plus een directe link naar de wegbeheerder die het écht weet.",
  },
];

export default function PassenPage() {
  const maand = new Date().getMonth() + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Passen open?", path: "/passen" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(FAQ)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Openingsperiodes van alpenpassen",
            numberOfItems: PASSEN.length,
            itemListElement: PASSEN.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${p.naam} (${p.hoogteM} m) — normaal open ${periodeLabel(p)}`,
            })),
          }),
        }}
      />
      <Passen huidigeMaand={maand} />
    </>
  );
}
