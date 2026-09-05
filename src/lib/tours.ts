/**
 * Meerdaagse tours: het "basiskamp"-model.
 *
 * Georganiseerde alpentours kosten 1500-4650 euro per persoon. Hetzelfde
 * rijplezier is zelf te doen vanuit één hotel: je boekt één keer, blijft
 * slapen waar je bent en rijdt elke dag een andere lus. Dat is voor de
 * bezoeker goedkoper en voor ons de waardevolste boeking (meerdere nachten
 * in plaats van één).
 *
 * Alle dagafstanden en passen zijn afgeleid van publieke bronnen en de eigen
 * klimbibliotheek; cijfers zijn indicatief en afgerond.
 */

import type { EventCountry } from "./calendar.ts";
import { CLIMBS, type Climb } from "./climbs.ts";
import { climbScore } from "./climbscore.ts";

export type { EventCountry } from "./calendar.ts";

export type Voertuig = "motor" | "auto" | "fiets";

export interface TourDag {
  /** korte titel van de dagrit */
  titel: string;
  lengthKm: number;
  /** rijtijd in minuten, exclusief stops */
  rijmin: number;
  /** klim-ids uit de bibliotheek die deze dag op de route liggen */
  klimIds: string[];
  omschrijving: string;
  /** opdracht voor de route-assistent */
  prompt: string;
}

export interface Tour {
  id: string;
  naam: string;
  /** de plaats waar je alle nachten slaapt */
  basiskamp: string;
  regio: string;
  country: EventCountry;
  /** aantal nachten dat je boekt */
  nachten: number;
  seizoen: string;
  /** waarom juist dit dorp als uitvalsbasis werkt */
  waaromHier: string;
  voertuigen: Voertuig[];
  dagen: TourDag[];
  /** tol, vignet en andere kosten die mensen onderweg verrassen */
  kosten: string[];
  /** wat een georganiseerde tour in dit gebied ongeveer kost, per persoon */
  georganiseerdVanafEur: number;
  bron: string;
}

export const TOURS: Tour[] = [
  {
    id: "dolomieten-sella-ronda",
    naam: "Dolomieten vanuit Arabba",
    basiskamp: "Arabba",
    regio: "Dolomieten (Zuid-Tirol)",
    country: "IT",
    nachten: 4,
    seizoen: "ca. juni–september (passen wintergesloten)",
    waaromHier:
      "Arabba ligt precies op de Sella Ronda-lus, tussen de Campolongo en de Pordoi. Je rijdt vanaf de hoteldeur de passen op zonder eerst een uur te verplaatsen, en het dorp is rustiger en goedkoper dan Corvara of Selva.",
    voertuigen: ["motor", "auto", "fiets"],
    dagen: [
      {
        titel: "De Sella Ronda",
        lengthKm: 55,
        rijmin: 120,
        klimIds: ["passo-pordoi", "passo-sella"],
        omschrijving:
          "De klassieke rondrit om het Sellamassief: Pordoi, Sella, Gardena en Campolongo achter elkaar. Kort in kilometers, maar vier passen en eindeloos uitzicht — begin vroeg, want het wordt druk.",
        prompt:
          "Rondrit Sella Ronda vanaf Arabba over de Passo Pordoi, Passo Sella, Passo Gardena en Passo Campolongo, 55 km",
      },
      {
        titel: "Passo Giau en Cortina",
        lengthKm: 110,
        rijmin: 180,
        klimIds: ["passo-giau"],
        omschrijving:
          "De zwaarste en mooiste col van de Dolomieten: 24 haarspelden aan gemiddeld 9,5%. Via Falzarego naar Cortina d'Ampezzo en over de Giau terug.",
        prompt:
          "Rondrit vanaf Arabba over de Passo Falzarego naar Cortina d'Ampezzo en terug over de Passo Giau, 110 km",
      },
      {
        titel: "Marmolada en Fedaia",
        lengthKm: 95,
        rijmin: 160,
        klimIds: [],
        omschrijving:
          "Langs het Fedaia-stuwmeer met de gletsjer van de Marmolada — met 3343 m de hoogste top van de Dolomieten — en terug door het Val di Fassa.",
        prompt:
          "Rondrit vanaf Arabba langs Passo Fedaia, de Marmolada en het Val di Fassa, 95 km",
      },
      {
        titel: "Val Gardena en Passo delle Erbe",
        lengthKm: 130,
        rijmin: 200,
        klimIds: ["passo-sella"],
        omschrijving:
          "Weg van de drukte: over de Gardena naar het Val Badia en de rustige Passo delle Erbe, met de smalste en stilste bochten van de streek.",
        prompt:
          "Rondrit vanaf Arabba over Passo Gardena, Val Badia en de Passo delle Erbe, 130 km",
      },
    ],
    kosten: [
      "Geen tol op de Dolomietenpassen zelf",
      "Italiaanse snelwegen zijn wél tolwegen (ticket bij oprit)",
      "Sommige passen sluiten op zomerse zondagen voor gemotoriseerd verkeer — check Sellaronda Bike Day",
    ],
    georganiseerdVanafEur: 1499,
    bron: "adventurebikerider.com, maratona.it, outdooractive",
  },
  {
    id: "stelvio-bormio",
    naam: "Stelvio, Gavia en Mortirolo vanuit Bormio",
    basiskamp: "Bormio",
    regio: "Valtellina / Alta Valtellina",
    country: "IT",
    nachten: 4,
    seizoen: "ca. juni–september (Gavia en Stelvio wintergesloten)",
    waaromHier:
      "Bormio is het enige dorp waar de drie zwaarste Giro-cols binnen een dagrit liggen: Stelvio, Gavia en Mortirolo. Bovendien een thermenstad, wat na een dag klimmen geen overbodige luxe is.",
    voertuigen: ["motor", "auto", "fiets"],
    dagen: [
      {
        titel: "Stelvio vanaf beide zijden",
        lengthKm: 100,
        rijmin: 190,
        klimIds: ["stelvio"],
        omschrijving:
          "48 haarspelden naar 2757 m vanaf Prato, terug over de Umbrailpas door Zwitserland. De heilige graal — rijd vroeg, want de bussen en motoren komen rond tienen.",
        prompt:
          "Rondrit vanaf Bormio over de Stelvio naar Prato allo Stelvio en terug via de Umbrailpas, 100 km",
      },
      {
        titel: "Passo Gavia",
        lengthKm: 85,
        rijmin: 150,
        klimIds: ["passo-gavia"],
        omschrijving:
          "Smaller, wilder en eenzamer dan de Stelvio: 16 km aan 8% naar 2622 m, met een tunnel die je op de fiets via het nieuwe fietspad omzeilt.",
        prompt:
          "Rondrit vanaf Bormio over de Passo Gavia naar Ponte di Legno en terug, 85 km",
      },
      {
        titel: "Mortirolo",
        lengthKm: 120,
        rijmin: 180,
        klimIds: ["mortirolo"],
        omschrijving:
          "De brute kant vanaf Mazzo: 12 km aan gemiddeld 10,4%, met het Pantani-monument op de top. De kant vanaf Grosio is met 8% een stuk menselijker.",
        prompt:
          "Rondrit vanaf Bormio door de Valtellina over de Mortirolo vanaf Mazzo, 120 km",
      },
      {
        titel: "Cancano en de Fraele-torens",
        lengthKm: 70,
        rijmin: 120,
        klimIds: [],
        omschrijving:
          "Rustdag met de mooiste haarspeldenwand van de streek: de trappen naar de Torri di Fraele en de stuwmeren van Cancano.",
        prompt:
          "Korte rondrit vanaf Bormio naar de Torri di Fraele en de meren van Cancano, 70 km",
      },
    ],
    kosten: [
      "Passen zelf zijn tolvrij",
      "Umbrailpas loopt door Zwitserland — vignet alleen nodig voor de snelweg, niet voor de pas",
      "Stelvio en Gavia gaan bij slecht weer ook in de zomer dicht",
    ],
    georganiseerdVanafEur: 1499,
    bron: "sportivebreaks.com, climbfinder",
  },
  {
    id: "hohe-tauern-zell-am-see",
    naam: "Grossglockner en de Hohe Tauern vanuit Zell am See",
    basiskamp: "Zell am See",
    regio: "Salzburgerland",
    country: "AT",
    nachten: 3,
    seizoen: "ca. mei–oktober (Grossglockner wintergesloten)",
    waaromHier:
      "Zell am See ligt aan het meer, vlak voor de tolpoort van de Grossglockner, en heeft de grootste hotelvoorraad van de streek — je zit binnen twintig minuten op de mooiste alpenweg van Oostenrijk.",
    voertuigen: ["motor", "auto"],
    dagen: [
      {
        titel: "Grossglockner Hochalpenstrasse",
        lengthKm: 180,
        rijmin: 260,
        klimIds: ["grossglockner"],
        omschrijving:
          "36 genummerde bochten naar 2504 m, met de Kaiser-Franz-Josefs-Höhe en de Pasterze-gletsjer als keerpunt. Reken op een halve dag inclusief stops.",
        prompt:
          "Motorrit vanaf Zell am See over de Grossglockner Hochalpenstrasse naar Heiligenblut en terug, 180 km, tolweg",
      },
      {
        titel: "Gerlospas en de Krimmler watervallen",
        lengthKm: 150,
        rijmin: 210,
        klimIds: [],
        omschrijving:
          "Over de Gerlos naar de hoogste watervallen van Europa (380 m), met het Zillertal als lange, vloeiende afdaling.",
        prompt:
          "Rondrit vanaf Zell am See over de Gerlospas langs de Krimmler Wasserfälle en het Zillertal, 150 km",
      },
      {
        titel: "Kitzbüheler Horn en de Thurn",
        lengthKm: 140,
        rijmin: 190,
        klimIds: [],
        omschrijving:
          "Rustiger slotdag over de Pass Thurn naar Kitzbühel, met de steile tolweg naar het Kitzbüheler Horn als optioneel dessert.",
        prompt:
          "Rondrit vanaf Zell am See over de Pass Thurn naar Kitzbühel en het Kitzbüheler Horn, 140 km",
      },
    ],
    kosten: [
      "Grossglockner: dagticket ongeveer 30 euro voor de motor",
      "Oostenrijkse snelwegen: vignet verplicht (digitaal 10-daags voldoet)",
      "Kitzbüheler Horn is een aparte tolweg",
    ],
    georganiseerdVanafEur: 2200,
    bron: "grossglockner.at, staytoride.com, edelweisstours",
  },
  {
    id: "zwitserse-passen-andermatt",
    naam: "De Zwitserse passenkruising vanuit Andermatt",
    basiskamp: "Andermatt",
    regio: "Uri / Gotthard",
    country: "CH",
    nachten: 3,
    seizoen: "ca. juni–oktober (passen wintergesloten)",
    waaromHier:
      "Andermatt is het kruispunt van de Alpen: Furka, Susten, Grimsel, Gotthard en Oberalp beginnen allemaal binnen een half uur. Nergens anders liggen zoveel grote passen zo dicht op elkaar.",
    voertuigen: ["motor", "auto", "fiets"],
    dagen: [
      {
        titel: "De drie-passenrit",
        lengthKm: 190,
        rijmin: 260,
        klimIds: ["furkapass", "grimselpass", "sustenpass"],
        omschrijving:
          "Furka, Grimsel en Susten in één lus — de bekendste dagrit van Zwitserland, met de Furka-haarspelden uit Goldfinger en het Rhônegletsjer-uitzicht.",
        prompt:
          "Zwitserse drie-passenrit vanaf Andermatt over Furka, Grimsel en Susten, 190 km",
      },
      {
        titel: "Gotthard en de Tremola",
        lengthKm: 120,
        rijmin: 190,
        klimIds: [],
        omschrijving:
          "De oude kasseiweg Tremola naar de Gotthardpas: 24 haarspelden over historisch plaveisel, en aan de zuidkant meteen Italiaans klimaat in het Tessin.",
        prompt:
          "Rondrit vanaf Andermatt over de Gotthardpas via de oude Tremola-kasseiweg naar Airolo, 120 km",
      },
      {
        titel: "Oberalp en Nufenen",
        lengthKm: 170,
        rijmin: 240,
        klimIds: ["nufenenpass"],
        omschrijving:
          "Over de Oberalp naar Graubünden, of zuidwaarts naar de Nufenen — met 2478 m de hoogste volledig Zwitserse pas.",
        prompt:
          "Rondrit vanaf Andermatt over de Nufenenpass en de Oberalppass, 170 km",
      },
    ],
    kosten: [
      "Zwitsers snelwegvignet: 40 CHF per jaar, ook voor de motor",
      "De passen zelf zijn tolvrij",
      "Furka-autotrein door de tunnel als de pas dicht is",
    ],
    georganiseerdVanafEur: 2400,
    bron: "climbfinder, staytoride.com",
  },
  {
    id: "zuid-limburg-valkenburg",
    naam: "Heuvelland-weekend vanuit Valkenburg",
    basiskamp: "Valkenburg",
    regio: "Zuid-Limburg",
    country: "NL",
    nachten: 2,
    seizoen: "hele jaar — lente en herfst op hun mooist",
    waaromHier:
      "Valkenburg ligt midden in het enige echte heuvelland van Nederland: Cauberg voor de deur, Camerig en het drielandenpunt binnen een uur. Ideaal om te kijken of meerdaags rijden je bevalt zonder meteen naar de Alpen te moeten.",
    voertuigen: ["motor", "auto", "fiets"],
    dagen: [
      {
        titel: "De klassiekers van de Amstel Gold Race",
        lengthKm: 85,
        rijmin: 150,
        klimIds: ["cauberg", "eyserbosweg", "keutenberg", "bemelerberg"],
        omschrijving:
          "Cauberg, Eyserbosweg, Keutenberg en Bemelerberg in één lus — de hellingen die de Amstel Gold Race beslissen, met holle wegen en vakwerkhuisjes ertussen.",
        prompt:
          "Rondrit vanaf Valkenburg over de Cauberg, Eyserbosweg, Keutenberg en Bemelerberg, 85 km",
      },
      {
        titel: "Geuldal, Camerig en het drielandenpunt",
        lengthKm: 95,
        rijmin: 160,
        klimIds: ["camerig", "vaalserberg", "loorberg"],
        omschrijving:
          "De langste klim van Nederland (Camerig, 4,4 km) en het hoogste punt (Vaalserberg, 322 m) op één dag, met het Geuldal als terugweg.",
        prompt:
          "Rondrit vanaf Valkenburg over de Camerig bij Epen, de Loorberg en het drielandenpunt bij Vaals, 95 km",
      },
    ],
    kosten: [
      "Geen tol of vignet",
      "Sommige holle wegen zijn in het weekend fietsstraat — rustig aan",
    ],
    georganiseerdVanafEur: 450,
    bron: "climbfinder, eigen klimbibliotheek",
  },
  {
    id: "ardennen-la-roche",
    naam: "Ardennen-lange-weekend vanuit La Roche-en-Ardenne",
    basiskamp: "La Roche-en-Ardenne",
    regio: "Ardennen",
    country: "BE",
    nachten: 2,
    seizoen: "apr–okt ideaal — in de winter kan sneeuw liggen",
    waaromHier:
      "La Roche ligt in een bocht van de Ourthe met bossen in alle richtingen: binnen een half uur zit je op de klimmen van Luik-Bastenaken-Luik én op de rivierwegen langs de Ourthe en de Amblève.",
    voertuigen: ["motor", "auto", "fiets"],
    dagen: [
      {
        titel: "De klimmen van Luik-Bastenaken-Luik",
        lengthKm: 140,
        rijmin: 210,
        klimIds: ["la-redoute", "col-du-rosier"],
        omschrijving:
          "La Redoute bij Aywaille en de Col du Rosier richting Spa — de hellingen die de oudste klassieker van het peloton beslissen.",
        prompt:
          "Rondrit vanaf La Roche-en-Ardenne over La Redoute bij Aywaille en de Col du Rosier naar Spa, 140 km",
      },
      {
        titel: "Ourthe, Durbuy en de Baraque de Fraiture",
        lengthKm: 160,
        rijmin: 220,
        klimIds: ["baraque-fraiture"],
        omschrijving:
          "Langs de Ourthe naar Durbuy, het kleinste stadje ter wereld, en over het hoogste punt van de Belgische wegen (652 m) terug.",
        prompt:
          "Rondrit vanaf La Roche-en-Ardenne langs Durbuy en de Baraque de Fraiture, 160 km",
      },
    ],
    kosten: ["Geen tol of vignet in België", "Let op de lage snelheidslimieten in de dorpen"],
    georganiseerdVanafEur: 400,
    bron: "eigen klimbibliotheek, autosport.be",
  },
];

/** Totale afstand van een tour. */
export function tourKm(t: Tour): number {
  return t.dagen.reduce((n, d) => n + d.lengthKm, 0);
}

/** Totale rijtijd in minuten. */
export function tourRijmin(t: Tour): number {
  return t.dagen.reduce((n, d) => n + d.rijmin, 0);
}

/** De klimmen uit de bibliotheek die op deze tour liggen, zonder dubbelingen. */
export function tourKlimmen(t: Tour): Climb[] {
  const ids = new Set(t.dagen.flatMap((d) => d.klimIds));
  return CLIMBS.filter((c) => ids.has(c.id));
}

/** Opgetelde hoogtemeters van de bekende klimmen op de tour (ondergrens). */
export function tourHoogtemeters(t: Tour): number {
  return tourKlimmen(t).reduce((n, c) => n + c.elevationM, 0);
}

/**
 * Zwaarte van de tour: de som van de FIETS-indexen van de klimmen erop.
 * Geeft een eerlijke volgorde van "weekendje Limburg" tot "Stelvio-week".
 */
export function tourZwaarte(t: Tour): number {
  return Math.round(tourKlimmen(t).reduce((n, c) => n + climbScore(c), 0) * 10) / 10;
}

/** Tours gesorteerd van licht naar zwaar — de natuurlijke opbouw voor een bezoeker. */
export function toursOpZwaarte(tours: Tour[] = TOURS): Tour[] {
  return [...tours].sort((a, b) => tourZwaarte(a) - tourZwaarte(b));
}
