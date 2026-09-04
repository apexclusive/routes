import type { EventCountry } from "./calendar.ts";

export type { EventCountry } from "./calendar.ts";

/** Curated dagritten (indicatief; cijfers uit publieke bronnen). */
export type Rit = {
  id: string;
  naam: string;
  regio: string;
  country: EventCountry;
  lengthKm: number;
  /** rijtijd in minuten, exclusief stops */
  rijmin: number;
  /** beste periode, indicatief */
  seizoen: string;
  plaats: string;
  hoogtepunten: string[];
  /** klimmen uit de bibliotheek die op of nabij de route liggen */
  klimIds: string[];
  tags: string[];
  prompt: string;
};

export const RITTEN: Rit[] = [
  {
    id: "mergellandroute",
    naam: "Mergellandroute",
    regio: "Zuid-Limburg",
    country: "NL",
    lengthKm: 140,
    rijmin: 210,
    seizoen: "hele jaar — lente en herfst ideaal",
    plaats: "Valkenburg",
    hoogtepunten: ["Drielandenpunt bij Vaals", "Bochtenrijke Bemelerberg", "De oeverweg langs de Maas bij Meers"],
    klimIds: ["vaalserberg", "bemelerberg", "cauberg"],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit over de ANWB Mergellandroute in Zuid-Limburg met Vaals, Bemelerberg en de Maasoever, 140 km",
  },
  {
    id: "ardennen-ourthe",
    naam: "Ourthe-rivierroute",
    regio: "Ardennen",
    country: "BE",
    lengthKm: 185,
    rijmin: 240,
    seizoen: "apr–okt ideaal — in de winter kan sneeuw liggen",
    plaats: "La Roche-en-Ardenne",
    hoogtepunten: ["Kasteel van La Roche", "Durbuy, kleinste stadje ter wereld", "Bochten van de Ourthe-vallei"],
    klimIds: [],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit door de Ardennen langs de Ourthe: La Roche, Durbuy en Houffalize, 185 km",
  },
  {
    id: "vlaamse-ardennen-kasseien",
    naam: "Kasseienklassieker Vlaamse Ardennen",
    regio: "Vlaamse Ardennen",
    country: "BE",
    lengthKm: 120,
    rijmin: 210,
    seizoen: "hele jaar — kasseien het best bij droog weer; Ronde-week begin april levendig",
    plaats: "Oudenaarde",
    hoogtepunten: ["Oude Kwaremont en Koppenberg", "De Muur van Geraardsbergen", "Stille lanen rond Ronse"],
    klimIds: ["oude-kwaremont", "koppenberg", "paterberg", "muur-geraardsbergen", "kruisberg", "taaienberg"],
    tags: ["motor", "fiets", "kassei"],
    prompt: "Ronde van Vlaanderen-rit over kasseien: Oudenaarde, Oude Kwaremont, Koppenberg en de Muur, 120 km",
  },
  {
    id: "eifel-nordschleife",
    naam: "Eifel & Nordschleife",
    regio: "Eifel",
    country: "DE",
    lengthKm: 200,
    rijmin: 240,
    seizoen: "apr–okt ideaal",
    plaats: "Cochem",
    hoogtepunten: ["Nürburgring Nordschleife", "Vulkaanmeertjes (Maare)", "Klooster Maria Laach"],
    klimIds: [],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit door de Eifel langs de Nürburgring Nordschleife, de Maaren en klooster Maria Laach, 200 km",
  },
  {
    id: "sauerland-ahnenschleife",
    naam: "Sauerland-hoogvlakte",
    regio: "Sauerland",
    country: "DE",
    lengthKm: 220,
    rijmin: 260,
    seizoen: "apr–okt ideaal",
    plaats: "Winterberg",
    hoogtepunten: ["Kahler Asten (841 m)", "Möhnesee-stuwmeer", "Diemelsee"],
    klimIds: [],
    tags: ["motor", "auto"],
    prompt: "Motorrit door het Sauerland: Winterberg, Kahler Asten, Möhnesee en Diemelsee, 220 km",
  },
  {
    id: "mosel-schleifen",
    naam: "Moezel-slinger",
    regio: "Moezeltal",
    country: "DE",
    lengthKm: 190,
    rijmin: 230,
    seizoen: "apr–okt — de wijnoogst in sep–okt brengt drukte",
    plaats: "Cochem",
    hoogtepunten: ["Cochemer Krampen", "Reichsburg Cochem", "Wijngaarden bij Bernkastel-Kues"],
    klimIds: [],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit over de Moezel van Cochem naar Bernkastel-Kues via de Cochemer Krampen, 190 km",
  },
  {
    id: "route-des-cretes",
    naam: "Route des Crêtes",
    regio: "Vogezen",
    country: "FR",
    lengthKm: 165,
    rijmin: 210,
    seizoen: "ca. mei–okt (col de la Schlucht wintergesloten)",
    plaats: "Gérardmer",
    hoogtepunten: ["89 km kamweg uit de Eerste Wereldoorlog", "Grand Ballon (1424 m)", "Col du Bonhomme"],
    klimIds: [],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit over de Route des Crêtes in de Vogezen met de Grand Ballon en Col du Bonhomme, 165 km",
  },
  {
    id: "schwarzwald-b500",
    naam: "Schwarzwaldhochstraße (B500)",
    regio: "Zwarte Woud",
    country: "DE",
    lengthKm: 170,
    rijmin: 210,
    seizoen: "hele jaar — herfstkleuren in sep–okt prachtig",
    plaats: "Baden-Baden",
    hoogtepunten: ["B500 panormalweg", "Mummelsee", "Barokke stad Freudenstadt"],
    klimIds: ["feldberg"],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit over de Schwarzwaldhochstraße B500 van Baden-Baden naar Freudenstadt en de Feldberg, 170 km",
  },
  {
    id: "stelvio-meisterwerk",
    naam: "Stelvio-meesterwerk",
    regio: "Alpen (Zuid-Tirol)",
    country: "IT",
    lengthKm: 220,
    rijmin: 300,
    seizoen: "ca. jun–sep (passen wintergesloten)",
    plaats: "Bormio",
    hoogtepunten: ["48 haarspelden vanaf Prato", "Umbrailpas (2501 m)", "Thermenstad Bormio"],
    klimIds: ["stelvio", "mortirolo"],
    tags: ["motor", "uitsicht"],
    prompt: "Motorrit Stelvio: zuidzijde vanaf Prato, terug over de Umbrailpas naar Bormio, 220 km",
  },
  {
    id: "grossglockner-hochalpen",
    naam: "Grossglockner Hochalpenstrasse",
    regio: "Hohe Tauern",
    country: "AT",
    lengthKm: 180,
    rijmin: 260,
    seizoen: "ca. mei–okt (tolweg wintergesloten)",
    plaats: "Zell am See",
    hoogtepunten: ["Kaiser-Franz-Josefs-Höhe (2504 m)", "Pasterze-gletsjer", "Fuschertörl-uitzicht"],
    klimIds: ["grossglockner"],
    tags: ["motor", "auto", "uitsicht"],
    prompt: "Motorrit over de Grossglockner Hochalpenstrasse vanaf Zell am See, 180 km, tolweg",
  },
];
