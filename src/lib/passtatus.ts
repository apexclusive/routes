/**
 * Wanneer gaan de bergpassen open?
 *
 * "Is de Stelvio al open?" is verreweg de meest gestelde vraag in dit
 * onderwerp, en de zoekvraag piekt elk voorjaar opnieuw. We kunnen geen
 * live-status geven zonder wegbeheerders te scrapen, maar wél iets dat
 * bijna net zo nuttig en veel eerlijker is: de gebruikelijke openingsperiode
 * per pas, met de werkelijke openingsdata van 2026 als ijkpunt, en een
 * duidelijke doorverwijzing naar de officiële bron voor de dag zelf.
 *
 * Bewust géén "OPEN" in groen op basis van een gemiddelde: iemand die
 * daarop 800 km rijdt en voor een slagboom staat, komt nooit meer terug.
 * Daarom heet het overal "meestal open" en staat de bron ernaast.
 */

export type PasStatus = "meestal-open" | "randseizoen" | "meestal-dicht" | "hele-jaar";

export interface Pas {
  /** id uit de klimbibliotheek, zodat we naar de detailpagina kunnen linken */
  climbId: string;
  naam: string;
  land: "IT" | "AT" | "CH" | "FR";
  hoogteM: number;
  /** maand (1-12) waarin de pas normaal opengaat */
  openVanafMaand: number;
  /** maand waarin de pas normaal sluit */
  dichtVanafMaand: number;
  /** wat er in 2026 echt gebeurde, als ijkpunt voor de bezoeker */
  referentie2026?: string;
  /** officiële bron voor de status van vandaag */
  bron: { label: string; url: string };
  /** dagen waarop de weg dichtgaat voor gemotoriseerd verkeer */
  autovrij2026?: string[];
}

export const PASSEN: Pas[] = [
  {
    climbId: "stelvio",
    naam: "Passo dello Stelvio",
    land: "IT",
    hoogteM: 2757,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026:
      "Ging in 2026 op 31 mei open en sluit rond 1 november. In sneeuwrijke jaren (2021, 2022) werd het half juni.",
    bron: { label: "ANAS / stelviopass.com", url: "https://www.stelviopass.net/" },
    autovrij2026: [
      "29 augustus 2026 — Stelvio Cima Coppi, alleen fietsers",
      "19 september 2026 — Enjoy Stelvio Valtellina, alleen fietsers",
    ],
  },
  {
    climbId: "passo-gavia",
    naam: "Passo Gavia",
    land: "IT",
    hoogteM: 2622,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Smalle, ongeveer 3 meter brede weg; gaat meestal iets later open dan de Stelvio.",
    bron: { label: "Enjoy Stelvio Valtellina", url: "https://www.enjoystelviovaltellina.it/" },
    autovrij2026: ["30 augustus 2026 — Gavia, alleen fietsers"],
  },
  {
    climbId: "mortirolo",
    naam: "Passo del Mortirolo",
    land: "IT",
    hoogteM: 1852,
    openVanafMaand: 5,
    dichtVanafMaand: 11,
    referentie2026: "Lager dan de Stelvio en daardoor langer open, maar zonder winterdienst.",
    bron: { label: "Enjoy Stelvio Valtellina", url: "https://www.enjoystelviovaltellina.it/" },
    autovrij2026: ["27 en 28 augustus 2026 — Mortirolo, alleen fietsers"],
  },
  {
    climbId: "grossglockner",
    naam: "Grossglockner Hochalpenstrasse",
    land: "AT",
    hoogteM: 2504,
    openVanafMaand: 5,
    dichtVanafMaand: 11,
    referentie2026:
      "Ging in 2026 al op 25 april open. Let op de openingstijden: de poorten sluiten 's avonds, in de zomer rond 21.00 uur.",
    bron: { label: "grossglockner.at", url: "https://www.grossglockner.at/" },
  },
  {
    climbId: "timmelsjoch",
    naam: "Timmelsjoch",
    land: "AT",
    hoogteM: 2509,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Tolweg, 's nachts gesloten en niet toegankelijk voor vrachtverkeer.",
    bron: { label: "timmelsjoch.com", url: "https://www.timmelsjoch.com/" },
  },
  {
    climbId: "furkapass",
    naam: "Furkapass",
    land: "CH",
    hoogteM: 2436,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Ging in 2026 op 29 mei open, samen met de Grimsel en de Nufenen.",
    bron: { label: "TCS wegeninfo", url: "https://www.tcs.ch/de/tools/verkehrsinfo/" },
  },
  {
    climbId: "grimselpass",
    naam: "Grimselpass",
    land: "CH",
    hoogteM: 2164,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Ging in 2026 op 29 mei open.",
    bron: { label: "TCS wegeninfo", url: "https://www.tcs.ch/de/tools/verkehrsinfo/" },
  },
  {
    climbId: "nufenenpass",
    naam: "Nufenenpass",
    land: "CH",
    hoogteM: 2478,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Ging in 2026 op 29 mei open. Op één na hoogste verharde pas van Zwitserland.",
    bron: { label: "TCS wegeninfo", url: "https://www.tcs.ch/de/tools/verkehrsinfo/" },
  },
  {
    climbId: "sustenpass",
    naam: "Sustenpass",
    land: "CH",
    hoogteM: 2224,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026:
      "Ging in 2026 pas op 12 juni open — de Susten is berucht laat, ook als de buren al open zijn.",
    bron: { label: "TCS wegeninfo", url: "https://www.tcs.ch/de/tools/verkehrsinfo/" },
  },
  {
    climbId: "klausenpass",
    naam: "Klausenpass",
    land: "CH",
    hoogteM: 1948,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Lager dan de andere Zwitserse passen, maar wel 's nachts gesloten.",
    bron: { label: "TCS wegeninfo", url: "https://www.tcs.ch/de/tools/verkehrsinfo/" },
  },
  {
    climbId: "col-de-liseran",
    naam: "Col de l'Iséran",
    land: "FR",
    hoogteM: 2770,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026:
      "Ging in 2026 op 12 juni open en sluit op 2 november. Hoogste verharde pas van de Alpen.",
    bron: { label: "savoie-route.fr", url: "https://www.savoie-route.fr/" },
  },
  {
    climbId: "col-de-la-bonette",
    naam: "Cime de la Bonette",
    land: "FR",
    hoogteM: 2802,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "De hoogste doorgaande asfaltweg van Europa.",
    bron: { label: "inforoute06", url: "https://www.inforoute06.fr/" },
  },
  {
    climbId: "galibier",
    naam: "Col du Galibier",
    land: "FR",
    hoogteM: 2642,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    referentie2026: "Sluit doorgaans als eerste bij vroege sneeuwval in oktober.",
    bron: { label: "savoie-route.fr", url: "https://www.savoie-route.fr/" },
  },
  {
    climbId: "izoard",
    naam: "Col d'Izoard",
    land: "FR",
    hoogteM: 2360,
    openVanafMaand: 6,
    dichtVanafMaand: 11,
    bron: { label: "inforoute05", url: "https://www.inforoutes05.fr/" },
  },
  {
    climbId: "passo-pordoi",
    naam: "Passo Pordoi",
    land: "IT",
    hoogteM: 2239,
    openVanafMaand: 5,
    dichtVanafMaand: 12,
    referentie2026:
      "De Sella Ronda-passen worden 's winters vaak opengehouden voor het skiverkeer, maar kunnen na sneeuwval dicht.",
    bron: { label: "Dolomiti / provincia.bz.it", url: "https://www.provinz.bz.it/verkehr-mobilitaet/" },
  },
  {
    climbId: "passo-sella",
    naam: "Passo Sella",
    land: "IT",
    hoogteM: 2244,
    openVanafMaand: 5,
    dichtVanafMaand: 12,
    referentie2026: "In de zomer op sommige dagen beperkt toegankelijk voor gemotoriseerd verkeer.",
    bron: { label: "Dolomiti / provincia.bz.it", url: "https://www.provinz.bz.it/verkehr-mobilitaet/" },
  },
  {
    climbId: "passo-giau",
    naam: "Passo Giau",
    land: "IT",
    hoogteM: 2238,
    openVanafMaand: 5,
    dichtVanafMaand: 12,
    bron: { label: "Veneto strade", url: "https://www.venetostrade.it/" },
  },
  {
    climbId: "mont-ventoux",
    naam: "Mont Ventoux",
    land: "FR",
    hoogteM: 1912,
    openVanafMaand: 5,
    dichtVanafMaand: 12,
    referentie2026:
      "Meestal het langst open van allemaal, maar de top gaat dicht bij harde mistral of ijzel.",
    bron: { label: "inforoute84", url: "https://www.vaucluse.fr/" },
  },
];

/**
 * Status van een pas in een gegeven maand.
 * De randmaanden zijn expliciet "randseizoen": daar gaat het mis.
 */
export function statusInMaand(p: Pas, maand: number): PasStatus {
  const open = p.openVanafMaand;
  const dicht = p.dichtVanafMaand;
  if (maand > open && maand < dicht - 1) return "meestal-open";
  if (maand === open || maand === dicht - 1 || maand === dicht) return "randseizoen";
  return "meestal-dicht";
}

export const STATUS_LABEL: Record<PasStatus, string> = {
  "meestal-open": "Meestal open",
  randseizoen: "Randseizoen",
  "meestal-dicht": "Meestal dicht",
  "hele-jaar": "Hele jaar open",
};

export const STATUS_UITLEG: Record<PasStatus, string> = {
  "meestal-open": "In deze maand ligt de pas er normaal gesproken open bij.",
  randseizoen:
    "Kan open zijn, kan dicht zijn — dit is precies de maand waarin het misgaat. Check de officiële bron op je vertrekdag.",
  "meestal-dicht": "Normaal gesproken gesloten door sneeuw.",
  "hele-jaar": "Deze weg blijft het hele jaar begaanbaar.",
};

/** Tailwind-klassen per status, zodat de kleur één bron heeft. */
export const STATUS_KLEUR: Record<PasStatus, string> = {
  "meestal-open": "text-emerald-300 border-emerald-400/30 bg-emerald-400/[0.08]",
  randseizoen: "text-amber-300 border-amber-400/30 bg-amber-400/[0.08]",
  "meestal-dicht": "text-slate-400 border-white/15 bg-white/[0.04]",
  "hele-jaar": "text-emerald-300 border-emerald-400/30 bg-emerald-400/[0.08]",
};

export const MAANDEN = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

/** Openingsperiode als leesbare zin. */
export function periodeLabel(p: Pas): string {
  return `${MAANDEN[p.openVanafMaand - 1]} – ${MAANDEN[p.dichtVanafMaand - 1]}`;
}

/** Passen gesorteerd op hoogte, hoogste eerst: die gaan het laatst open. */
export function passenOpHoogte(): Pas[] {
  return [...PASSEN].sort((a, b) => b.hoogteM - a.hoogteM);
}

/** Hoeveel passen zijn er in deze maand normaal open? */
export function telOpen(maand: number): number {
  return PASSEN.filter((p) => statusInMaand(p, maand) === "meestal-open").length;
}

/** De eerstvolgende maand waarin vrijwel alles open is — handig als planningsadvies. */
export function besteMaand(): number {
  let beste = 8;
  let max = -1;
  for (let m = 1; m <= 12; m++) {
    const n = telOpen(m);
    if (n > max) {
      max = n;
      beste = m;
    }
  }
  return beste;
}
