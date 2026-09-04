/**
 * Nederland-kennis: hoogtepunten per provincie, de must-have top-10,
 * lucht-ervaringen en de bucketlist-zaden. Pure data + pure logica.
 */

export interface Province {
  id: string;
  name: string;
  highlight: string;
  detail: string;
  prompt: string;
}

/** Twaalf provincies, elk met hét stuk dat je gezien moet hebben. */
export const PROVINCES: Province[] = [
  { id: "limburg", name: "Limburg", highlight: "Wilhelminaberg-trap & Vaalserberg", detail: "508 treden omhoog (248 m trap, top ±225 m NAP) en daarna het hoogste punt van NL: 322,4 m bij Vaals.", prompt: "wandeling over de Wilhelminaberg en daarna mooie rit naar het Drielandenpunt bij Vaals" },
  { id: "gelderland", name: "Gelderland", highlight: "Veluwezoom & Posbank", detail: "Kanhoeve-dal en heidevelden: de enige echte klimmetjes boven de zeespiegel in het midden van NL.", prompt: "mooie rit van 90 km door de Veluwezoom vanaf Arnhem over de Posbank" },
  { id: "noord-holland", name: "Noord-Holland", highlight: "Texel met de veerboot", detail: "Overstag met de boot, dan rondje duinen, vuurtoren en polder: een eilanddag zonder paspoort.", prompt: "dagrit over Texel vanaf de veerboot in Den Helder, duinen en vuurtoren" },
  { id: "zeeland", name: "Zeeland", highlight: "Deltawerken", detail: "Over de Oosterscheldekering rijden met de wind eromheen: Nederlands grootste machine als wegbed.", prompt: "mooie rit over de Deltawerken van Zeeland via de Oosterscheldekering" },
  { id: "drenthe", name: "Drenthe", highlight: "Boomkroonpad & hunebedden", detail: "Tussen de toppen van de dennen lopen op het Boomkroonpad (Drouwen) en langs 5.000 jaar oude stenen.", prompt: "rit door Drenthe langs hunebedden en het Boomkroonpad bij Drouwen" },
  { id: "friesland", name: "Friesland", highlight: "De Elf Steden", detail: "De route van de schaatslegendes: Leeuwarden, Sneek, Sloten — elf steden, één dag, 200 km.", prompt: "mooie motorrit langs de elf steden van Friesland vanaf Leeuwarden" },
  { id: "overijssel", name: "Overijssel", highlight: "Giethoorn & Blauwe Loper", detail: "'s Ochtends vroeg door Giethoorn (vóór de drukte) en over de Blauwe Loper bij Zwolle.", prompt: "rit naar Giethoorn vroeg in de ochtend en daarna Zwolle over de Blauwe Loper" },
  { id: "utrecht", name: "Utrecht", highlight: "Utrechtse Heuvelrug", detail: "Amerongse Berg en Kaapse Bossen: stuwwallen die voelen als een echte klim in een compact pakket.", prompt: "rit over de Utrechtse Heuvelrug via de Amerongse Berg" },
  { id: "noord-brabant", name: "Noord-Brabant", highlight: "Loonse en Drunense Duinen", detail: "Zee van zand midden in bos: de enige woestijn-imitatie die Nederland heeft.", prompt: "rit naar de Loonse en Drunense Duinen en door de Brabantse bossen" },
  { id: "groningen", name: "Groningen", highlight: "Reitdiep & stadshaven", detail: "Oer-Hollandse polderweggetjes langs het Reitdiep naar Zoutkamp — wind, ruimte, niets.", prompt: "rit door het Groningse Reitdiepgebied naar Zoutkamp en terug langs de kust" },
  { id: "flevoland", name: "Flevoland", highlight: "Oostvaardersplassen", detail: "Nieuw Land: wildernis op de bodem van een voormalige zee, met knipoog naar Batavialand.", prompt: "rit door Flevoland langs de Oostvaardersplassen" },
  { id: "wadden", name: "Waddeneilanden", highlight: "Ameland & Schiermonnikoog", detail: "Oversteken met de boot en een eilandrit: duinen, stilte en zout op je jas.", prompt: "mooie rit naar Holwerd en met de boot naar Ameland" },
];

/** De must-have top-10 volgens rijders en wandelaars. */
export const TOP10_NL: { title: string; why: string }[] = [
  { title: "Zondagochtend Mergelland", why: "Vóór 9:00 heb je de heuvels alleen — de klassieker op zijn best." },
  { title: "Koffie op het Drielandenpunt", why: "Drie landen, één terras, de hoogste punt van NL op loopafstand." },
  { title: "Zonsopgang op de Posbank", why: "Mist in het dal, koffie uit de thermos: Veluwezoom op z'n mooist." },
  { title: "Texel met de veerboot", why: "Overstag, dan duinen en vuurtoren — een vakantiegevoel in één dag." },
  { title: "Oosterscheldekering over", why: "De wind, de zee, de machine: rijd langzaam en kijk om." },
  { title: "Elf steden in één dag", why: "200 km Friesland, elf stempels in je hoofd, verhaal voor altijd." },
  { title: "Giethoorn vóór negenen", why: "Daarna komen de bussen — ga bij zonsopgang over de bruggetjes." },
  { title: "Duinen van Loon en Drunen", why: "Zee van zand midden in het bos: voelt als een andere wereld." },
  { title: "De trap van Landgraaf", why: "508 treden, 248 meter: de mooiste longenpijn van Nederland." },
  { title: "Cauberg afdalen na de klim", why: "Eerst omhoog zwoegen, dan de afdaling: Amstel Gold-gevoel." },
];

/** Lucht-ervaringen: vliegtuigje, zweefvliegen of ballonvaart. */
export interface AirExperience {
  name: string;
  place: string;
  what: string;
  url: string; // leeg = geen directe link
  season: string;
}

export const AIR_EXPERIENCES: AirExperience[] = [
  { name: "Rondvlucht Maastricht Aachen Airport", place: "Beek (NL)", what: "Sightseeingvlucht over Zuid-Limburg, de Maas en de Ardennen-rand.", url: "https://maastrichtaachenairport.nl", season: "hele jaar" },
  { name: "Rondvlucht Rotterdam The Hague Airport", place: "Rotterdam (NL)", what: "Boven de delta, haven en duinen; ook combinaties met de kustlijn.", url: "https://rotterdamthehagueairport.nl", season: "hele jaar" },
  { name: "Zweefvliegen Terlet", place: "Rheden (NL)", what: "Nederlands bekendste zweefvliegveld op de Veluwezoom: meevliegen in de thermiek.", url: "", season: "apr – sep" },
  { name: "Ballonvaart over de Veluwe", place: "Ede / Otterlo (NL)", what: "Stil boven bos en heide bij zonsopgang — het langzaamste vervoer dat bestaat.", url: "", season: "apr – okt" },
  { name: "Vliegveld Teuge", place: "Teuge (NL)", what: "Van sightseeing tot skydiven: de luchtvaart-thuishaven van het oosten.", url: "", season: "hele jaar" },
  { name: "Stuntvlucht boven de Eifel", place: "Bitburg (DE)", what: "Aerobatics boven de vulkaanmeren: 4G en een verhaal dat niemand gelooft.", url: "", season: "apr – okt" },
];

/* ---------- bucketlist ---------- */

export interface BucketItem {
  id: string;
  label: string;
  /** optionele prompt om 'm meteen te rijden */
  prompt?: string;
}

/** De Apex-bucketlist: twaalf ritten die erin horen. */
export const BUCKETLIST_SEEDS: BucketItem[] = [
  { id: "b-mergel", label: "Mergellandroute bij zonsopgang", prompt: "mooie motorrondrit van 110 km door het Mergelland" },
  { id: "b-vaalser", label: "Drielandenpunt + koffie op de top", prompt: "rondrit van 70 km via Vaals en het Drielandenpunt" },
  { id: "b-b500", label: "Schwarzwaldhochstraße (B500)", prompt: "motorrondrit van 250 km door het Zwarte Woud via de Schwarzwaldhochstraße" },
  { id: "b-ring", label: "Eigen ronde Nordschleife", prompt: "mooie motorrit van 190 km door de Eifel naar de Nürburgring" },
  { id: "b-furka", label: "Furka + Grimsel in één dag", prompt: "mooie motorrit over de Furka en Grimsel" },
  { id: "b-ardennen", label: "Weekend Durbuy", prompt: "mooie motorrondrit van 200 km door de Ardennen via La Roche en Durbuy" },
  { id: "b-texel", label: "Texel met de veerboot", prompt: "dagrit over Texel vanaf de veerboot in Den Helder" },
  { id: "b-posbank", label: "Zonsopgang Posbank", prompt: "mooie rit van 90 km door de Veluwezoom over de Posbank" },
  { id: "b-mosel", label: "Moezel-haarspelden", prompt: "mooie rit van 220 km langs de Moezel van Trier naar Bernkastel" },
  { id: "b-vierdaagse", label: "Vierdaagse uitlopen (Nijmegen)" },
  { id: "b-berlin", label: "Berlin Marathon finishen" },
  { id: "b-zeeeland", label: "Deltawerken crosswind-rit", prompt: "mooie rit over de Deltawerken van Zeeland" },
];

export const BUCKETLIST_KEY = "apex-routes:bucketlist";

/** Pure helpers voor de bucketlist (goed testbaar). */
export function progressOf(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, done / total));
}

export function isComplete(done: number, total: number): boolean {
  return total > 0 && done === total;
}
