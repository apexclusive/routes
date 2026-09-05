import type { Climb } from "./climbs.ts";
import type { Rit } from "./ritten.ts";
import { climbScore, klimtijdMinuten, zwaarteKlasse } from "./climbscore.ts";

export type FaqItem = { q: string; a: string };

function nl(v: number | string) {
  return String(v).replace(".", ",");
}

/** FAQ voor een klim-detailpagina; volledig afgeleid uit de data. */
export function buildKlimFaq(c: Climb): FaqItem[] {
  const km = nl((c.lengthM / 1000).toFixed(1));
  const gem = nl(c.avgPct);
  const max = nl(c.maxPct);
  const items: FaqItem[] = [
    {
      q: `Hoe steil is de ${c.name}?`,
      a: `De ${c.name} bij ${c.place} stijgt gemiddeld ${gem}% over ${km} km, met pieken tot ${max}%. Cijfers zijn indicatief — het bord aan de voet telt altijd.`,
    },
    {
      q: `Hoe lang is de ${c.name} en hoeveel hoogtemeters tel je?`,
      a: `De beklimming is ${km} km lang en overbrugt ${c.elevationM} hoogtemeters.`,
    },
  ];
  if (c.surface !== "asfalt") {
    items.push({
      q: `Is de ${c.name} geasfalteerd?`,
      a: `Nee, het wegdek bestaat uit ${c.surface}. Bij nat weer is dat glad: rij met voldoende profiel en rem voor de stenen, niet erop.`,
    });
  }
  if (/tolweg/i.test(c.note + " " + c.prompt)) {
    items.push({
      q: `Kost de ${c.name} geld?`,
      a: `Ja, dit is een tolweg: je betaalt per voertuig aan de slagboom. Houd rekening met wachttijden in het hoogseizoen.`,
    });
  }
  if (c.seizoen) {
    items.push({
      q: `Wanneer is de ${c.name} open?`,
      a: `${c.seizoen.charAt(0).toUpperCase()}${c.seizoen.slice(1)}. Peil altijd de actuele toestand: sneeuw, werkzaamheden of evenementen kunnen de weg tijdelijk afsluiten.`,
    });
  }
  const score = climbScore(c);
  const tijd = klimtijdMinuten(c);
  const duur = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)} uur en ${m % 60} minuten` : `${m} minuten`;
  items.push({
    q: `Hoe zwaar is de ${c.name} vergeleken met andere klimmen?`,
    a: `Op de FIETS-index scoort de ${c.name} ${nl(score)} punten: ${zwaarteKlasse(score).label.toLowerCase()} Die index weegt de hoogtemeters kwadratisch tegen de lengte en corrigeert voor hoogte boven 1000 meter — ter vergelijking: de Mont Ventoux staat rond de 12,8 en de Cauberg op 0,4.`,
  });
  items.push({
    q: `Hoe lang doe je over de ${c.name}?`,
    a: `Op de fiets reken je ongeveer ${duur(tijd.recreant)} als recreant, ${duur(tijd.sportief)} op sportief niveau en ${duur(tijd.pro)} op profniveau. Met de motor of auto ben je er in een fractie daarvan, maar juist dan loont het om te stoppen voor het uitzicht.`,
  });
  items.push({
    q: `Waar overnacht je het best voor de ${c.name}?`,
    a: `In en rond ${c.place} vind je hotels en B&B's in elke klasse. Via de knop "Verblijf bij ${c.place}" op deze pagina check je direct de beschikbaarheid.`,
  });
  return items;
}

/** FAQ voor een rit-detailpagina; volledig afgeleid uit de data. */
export function buildRitFaq(r: Rit): FaqItem[] {
  const uur = `± ${Math.floor(r.rijmin / 60)} uur${r.rijmin % 60 ? ` en ${r.rijmin % 60} minuten` : ""}`;
  const soorten = r.tags
    .map((t) => (t === "uitsicht" ? "panorama-liefhebbers" : t === "kassei" ? "kasseienrijders" : `${t}rijders`))
    .filter((t) => t !== "panorama-liefhebbers" || r.tags.includes("uitsicht"))
    .slice(0, 2)
    .join(" en ");
  return [
    {
      q: `Hoe lang is de ${r.naam}?`,
      a: `De rit is ${r.lengthKm} km en doet er ${uur} aan rijden over, exclusief stops voor foto's, koffie en brandstof.`,
    },
    {
      q: `Wat zijn de hoogtepunten van de ${r.naam}?`,
      a: `Onderweg passeer je ${r.hoogtepunten.slice(0, 3).join(", ")}${r.hoogtepunten.length > 3 ? " en meer" : ""}.`,
    },
    {
      q: `Wanneer is de beste periode voor deze rit?`,
      a: `${r.seizoen.charAt(0).toUpperCase()}${r.seizoen.slice(1)}. In de bergen kan het weer snel omslaan — check de voorspelling voor de hoogste punten.`,
    },
    {
      q: `Voor wie is de ${r.naam} geschikt?`,
      a: `De rit is vooral geliefd bij ${soorten || "touringrijders"}. De route volgt gewone wegen; ${r.klimIds.length > 0 ? "reken op klimmen onderweg (zie de klim-chips)" : "het profiel is glooiend tot heuvellig"}.`,
    },
    {
      q: `Waar start ik de ${r.naam} en waar slaap ik?`,
      a: `De startplaats is ${r.plaats}. Via de knop "Verblijf in ${r.plaats}" op deze pagina zie je direct hotels en B&B's voor een weekend of midweek.`,
    },
  ];
}

/** FAQPage-JSON-LD voor rich snippets. */
export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
