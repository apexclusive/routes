/**
 * Apex Advisor — gecureerde kennis voor onderweg: bestemmingen, klimmen,
 * toertips, pechhulp en events. Feiten voor zover verifieerbaar; bronnen
 * staan erbij. Geen aliases, zodat node --test erbij kan.
 */

export interface Destination {
  id: string;
  name: string;
  region: string;
  img: string;
  /** korte kenkrachtige intro */
  intro: string;
  /** historische / feitelijke bullets */
  facts: string[];
  /** praktische tips (drinken, eten, parkeren, lopen) */
  tips: string[];
  /** prompt om er heen te rijden via de planner */
  prompt: string;
  /** bronnen (naam + url) */
  sources: { name: string; url: string }[];
}

export const DESTINATIONS: Destination[] = [
  {
    id: "mergelland",
    name: "Mergellandroute",
    region: "Zuid-Limburg · NL",
    img: "/routescapes/limburg-hills.jpg",
    intro:
      "Dé klassieker onder de Nederlandse toerroutes: het glooiende mergelland met orchideeënweides, holle wegen en dorpspleintjes.",
    facts: [
      "De ANWB legde de Mergellandfietsroute én de gelijknamige autoroute aan in 1963 — de toeristische routes begonnen in 1962 op de Veluwe.",
      "De naam komt van Mergelland: zachte, gele kalksteen (mergel) gevormd uit kalkskeletjes van prehistorische zeedieren.",
      "De autoroute is nog steeds bewegwijzerd met bruin-witte borden; ooit kostte de kaart 25 cent bij de VVV.",
    ],
    tips: [
      "Koffie met uitzicht: terrassen in Sint Geertruid en Epen, op de route zelf.",
      "Combineer met de Bemelerberg en de Loorberg voor de scherpste bochten.",
      "Vroeg vertrekken: zondagmiddag is het drukst bij Valkenburg.",
    ],
    prompt: "mooie autorondrit van ongeveer 110 km door het Mergelland vanaf Maastricht",
    sources: [
      { name: "ANWB — Mergellandroute Zuid", url: "https://www.anwb.nl/fietsroutes/routes/mergellandroute-zuid" },
      { name: "Visit Zuid-Limburg", url: "https://www.visitzuidlimburg.nl" },
    ],
  },
  {
    id: "drielandenpunt",
    name: "Drielandenpunt & Vaalserberg",
    region: "Vaals · NL/BE/DE",
    img: "/routescapes/drielandenpunt.jpg",
    intro:
      "Het hoogste punt van Nederland (322,4 m) waar drie landen elkaar raken — in één rit door NL, België en Duitsland.",
    facts: [
      "De Vaalserberg meet 322,4 m: het hoogste punt van het Europese Nederland.",
      "Bij het Drielandenpunt raken Nederland, België (Voerstreek) en Duitsland (Aken) elkaar; de historische grenspalen staan er nog.",
      "De Boudewijntoren geeft uitzicht over alle drie de landen tegelijk.",
    ],
    tips: [
      "Drinken: grand café op de top zelf, of het dorpsplein van Vaals (5 min) voor een beter kop koffie.",
      "Wandel de korte Grenslanden-route rond de top als benenstrekker.",
      "Vlakbij: Vijlenerbos voor stille boswegen en de Gemmenicherweg voor bochtenwerk.",
    ],
    prompt: "rondrit van 70 km vanaf Maastricht via Vaals en het Drielandenpunt, mooie wegen",
    sources: [
      { name: "Climbfinder — Vaalserberg", url: "https://climbfinder.com/us/regions/netherlands" },
    ],
  },
  {
    id: "encigroeve",
    name: "Sint-Pietersberg & ENCI-groeve",
    region: "Maastricht · NL",
    img: "/routescapes/enci-groeve.jpg",
    intro:
      "De witte kalksteenwanden boven de Maas: de mooiste stadswandeling van Maastricht, van het centrum naar de groeve.",
    facts: [
      "De ENCI-fabriek bij de groeve sloot in 2020; de groeve verandert stap voor stap in natuurgebied.",
      "In de berg zitten kilometers mergelgangen, deels openbaar te bezoeken (grotten van Sint Pietersberg).",
    ],
    tips: [
      "Route: van het Onze Lieve Vrouweplein via de Krotweg omhoog, langs het uitzichtpunt over de groeve en terug langs de Maas.",
      "Goede wandelschoenen: de holle wegen kleverig bij regen.",
      "Onderweg koffie: cafés aan de Maas bij het stadspark, of brasserie in Sint Pieter.",
    ],
    prompt: "wandeling van 12 km vanaf Maastricht over de Sint-Pietersberg langs de ENCI-groeve",
    sources: [
      { name: "Visit Zuid-Limburg — Sint Pietersberg", url: "https://www.visitzuidlimburg.nl" },
    ],
  },
  {
    id: "zwartewoud",
    name: "Zwarte Woud — Schwarzwaldhochstraße",
    region: "Baden-Württemberg · DE",
    img: "/routescapes/blackforest.jpg",
    intro:
      "De oudste themedrive van Duitsland (B500): 60 km hoogwegen van Baden-Baden naar Freudenstadt door een zwart woud.",
    facts: [
      "De naam Schwarzwaldhochstraße wordt sinds 1930 gebruikt, na voltooiing van het stuk Hundseck–Untersmatt.",
      "In 1938–1941 werd het ontbrekende stuk Ruhestein–Alexanderschanze aangelegd; de volledige route klaar in 1952.",
      "De Romeinen noemden het bos al Silva Nigra — het dichte dak van naaldbomen liet bijna geen licht door.",
    ],
    tips: [
      "Stop op de Mummelsee en bij de Ruhestein-pass voor de klassieke uitzichten.",
      "Overnacht in Baden-Baden en rij de B500 als opener vóór het toerisme (vóór 10:00).",
      "Combinatie: daal af naar de Moezel voor de tweede dag.",
    ],
    prompt: "motorrondrit van 250 km door het Zwarte Woud via de Schwarzwaldhochstraße",
    sources: [
      { name: "Wikiwand — Schwarzwaldhochstraße", url: "https://www.wikiwand.com/en/articles/Schwarzwaldhochstra%C3%9Fe" },
    ],
  },
  {
    id: "zwitserland",
    name: "Zwitserse passen",
    region: "Alpen · CH",
    img: "/routescapes/swiss-pass.jpg",
    intro:
      "Furka, Grimsel, Susten, Julier: haarspelden tegen graniet — de heilige graal voor wie écht klimmen wil.",
    facts: [
      "De grote passen begonnen als 19e-eeuwse post- en handelsroutes en werden in de 20e eeuw geasfalteerd tot wat ze nu zijn.",
      "De meeste hoogpassen zijn van oktober/november tot mei/juni gesloten wegens sneeuw — check de toestand vooraf.",
      "Grimsel en Furka samen (met de Susten als lus) vormen de beroemde driepassenrit vanuit de richting Meiringen.",
    ],
    tips: [
      "Beste maanden: juni t/m september; vertrek vroeg — 's middags komt de bewolking op.",
      "Tank op tijd: op de passen zelf is niets, en benzine is in Zwitserland prijzig.",
      "Een vignet is verplicht op Zwitserse snelwegen; rijd je enkel over passen en lokale wegen, dan heb je het niet nodig.",
    ],
    prompt: "mooie motorrit van 180 km over de grote Alpenpassen zoals de Furka en Grimsel",
    sources: [
      { name: "MySwitzerland — passen", url: "https://www.myswitzerland.com" },
    ],
  },
];

/* ---------- klimmen in Nederland (wielrennen) ---------- */

export interface Climb {
  name: string;
  where: string;
  lengthM: number;
  heightM: number;
  avgPct: number;
  maxPct: number;
  note: string;
}

/** Hoogste punten & scherpste klimmen — gemiddelde/max percentages uit openbare klimdatabases. */
export const CLIMBS: Climb[] = [
  { name: "Vaalserberg", where: "Vaals", lengthM: 2400, heightM: 139, avgPct: 6, maxPct: 10, note: "Hoogste punt van NL (top 322,4 m) — gelijkmatige klim, haarspeld bovenin." },
  { name: "Cauberg", where: "Valkenburg", lengthM: 780, heightM: 58, avgPct: 7.8, maxPct: 13.2, note: "Dé bekende klim: Amstel Gold Race-finish, zwaarste 150 m aan 13%." },
  { name: "Eyserbosweg", where: "Eys", lengthM: 1100, heightM: 87, avgPct: 7.9, maxPct: 12, note: "Steile boerenweg in een holle weg; volgens velen de mooiste klim van Limburg." },
  { name: "Keutenberg", where: "Stokhem", lengthM: 1450, heightM: 88, avgPct: 6.1, maxPct: 12, note: "Muurtje na de bocht bij de start, daarna lang doorsudderen." },
  { name: "Kromhagerweg", where: "Epen", lengthM: 650, heightM: 72, avgPct: 11.1, maxPct: 14, note: "Kort maar wreed: het scherpste gemiddelde van het land." },
  { name: "Camerig", where: "Epen", lengthM: 4300, heightM: 148, avgPct: 4.2, maxPct: 9, note: "Nummer 1 in de nationale ranking: lang, vals en prachtig." },
  { name: "Wilhelminaberg", where: "Landgraaf", lengthM: 600, heightM: 55, avgPct: 9.8, maxPct: 12, note: "Oud mijnterrein — de Mijnsteenweg-variant is het steilst." },
];

export const NL_HIGH_FACTS: string[] = [
  "Hoogste punt van het Europese Nederland: Vaalserberg, 322,4 m (Drielandenpunt).",
  "'Zeven heuvels'-mythe: Zuid-Limburg telt honderden heuvels, maar geen enkele berg — de bochten maken hem berucht, niet de hoogte.",
  "Buiten Zuid-Limburg is de Veluwezoom (±110 m, de Posbank) het hoogste punt van het vaste land.",
  "Voor wielrenners: Limburg telt 1.400+ geregistreerde beklimmingen; de scherpste stukken asfalt lopen op tot ~14%.",
];

/* ---------- toertips & veiligheid ---------- */

export interface TipBlock {
  id: string;
  title: string;
  items: string[];
}

export const SAFETY_TIPS: TipBlock[] = [
  {
    id: "apk-banden",
    title: "APK & banden — de check voor je wegrijdt",
    items: [
      "APK (personenauto/motor): eerste keuring na 4 jaar, daarna om de 2 jaar; vanaf 8 jaar oud elk jaar. Plan de keuring vóór een meerdaagse rit.",
      "Bandenleeftijd: op de zijkant staat een DOT-code van vier cijfers — week + jaar (2319 = week 23 van 2019). Vervang banden vanaf ~6 jaar oud, ook met voldoende profiel; hard rubber grip je niet meer in de regen.",
      "Profiel: wettelijk minimaal 1,6 mm, maar 3 mm (auto) / 2 mm (motor) is het verstandige minimum voor natte tochten.",
      "Bandenspanning koud meten en 0,2 bar bijzetten bij volle belading — en check 'm halverwege de week.",
    ],
  },
  {
    id: "meenemen",
    title: "Meenemen op een toerdag",
    items: [
      "Internationale schadeformulier-set (geel/groen formulier) en groene kaart — in sommige landen verplicht gevraagd bij een controle.",
      "Reflecterende veiligheidshesjes voor iedereen: in België, Frankrijk en Italië is een hesje in de auto verplicht (en bij pech dragen).",
      "Gevarendriehoek, verbanddoos en een powerbank; op de motor: plaksetje + minicompressor.",
      "Regenpak én zonnebrand — Limburgse en Ardense dagen hebben allebei in één middag.",
      "Cash: sommige bergcafés en Franse dépanneurs willen contant.",
    ],
  },
  {
    id: "rijden",
    title: "Rijden zelf",
    items: [
      "Rijd in groepen van max 5-6: houd 1-2 seconden onderling afstand en spreek een verzamelpunt af bij afvallers.",
      "In woonkernen 30 echt 30: de boetes in BE/DE zijn fors en de dorpen leven van toerisme — geef het goede voorbeeld.",
      "Na een regenbui: kasseien en bladdek zijn spekglad; de eerste 10 minuten nat asfalt zijn de gevaarlijkste.",
      "Plan tankstops bij >200 km ritten: de POI-laag in Apex laat tankstations binnen 2 km van je route zien.",
    ],
  },
];

/* ---------- pech & alarm ---------- */

export interface EmergencyNumber {
  situation: string;
  number: string;
  note: string;
}

export const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { situation: "Nood (ongeval, brand, politijk)", number: "112", note: "In heel Europa — ook Duitsland, Frankrijk, Zwitserland." },
  { situation: "ANWB Wegenwacht (NL pech)", number: "088 - 269 28 88", note: "24/7, ook als je geen lid bent (betalend)." },
  { situation: "ANWB Alarmcentrale (buitenland)", number: "+31 70 314 14 14", note: "Nederlandstalig, regelt garage/sleepdienst; opslaan vóór je vertrekt." },
  { situation: "ADAC (Duitsland)", number: "+49 89 20 20 40 00", note: "Duitse tegenhanger van de Wegenwacht; groot netwerk in de Eifel/Alpen." },
];

export const BREAKDOWN_TIPS: string[] = [
  "Frankrijk kent géén wegenwacht langs de snelweg: alleen officiële dépanneurs (bergers) mogen daar slepen, en ze brengen je altijd naar een garage. Bel bij pech op de Française snelweg 112; échte pech (niet-snelweg): bel eerst je alarmcentrale vóórdat je een opdracht accepteert.",
  "Afgesleept worden? Noteer naam en erkenning van de sleepdienst, fotografeer de auto vóór het aankoppelen en vraag altijd een gespecificeerde bon — alarmcentrales vergoeden alleen met papieren.",
  "Zet de auto zo ver mogelijk op de vluchtstrook, hesje aan, driehoek 30 m achteruit (snelweg: veel verder), en ga achter de vangrail wachten.",
  "In het buitenland werkt je ANWB/ADAC-dekking alleen als je die afdekt vóór de rit — een Europe-dekking kost weinig en regelt alles via één telefoontje.",
];

/* ---------- hotels ---------- */

export const HOTEL_TIPS: string[] = [
  "Motvriendelijk checken: afgesloten nachtparking of garage, spoelmogelijkheid voor kit, en een ontbijt dat vóór 8:00 start.",
  "Boek flexibel annuleerbaar tot de avond vóór aankomst — toerweer verandert, misschien jouw planning wel mee.",
  "Kies in de bergen een hotel op de valleibodem in plaats van op de pas: rustiger, warmer, en je start de dag met klimmen in plaats van afdalen.",
  "Kleine boutique-hotels in dorpscentra (Durbuy, Monschau, Baden-Baden) zijn vaak goedkoper midweek en je loopt 's avonds het restaurant in.",
];

/* ---------- apps & gadgets ---------- */

export const APP_TIPS: { name: string; what: string }[] = [
  { name: "Apex Routes", what: "Route bouwen via chat, GPX/FIT importeren, vooraf controleren en openen in Maps/Waze of exporteren als GPX." },
  { name: "Google Maps", what: "Navigatie met onze slimme ankers; werkt offline met gedownloade regio's." },
  { name: "OsmAnd", what: "OpenStreetMap-navigatie met GPX-import, volledig offline." },
  { name: "Kurviger", what: "Kronkelroute-navigatie die snelwegen vermijdt — favoriet bij motorrijders." },
  { name: "Calimoto / REVER", what: "Curated motorroutes, tracking en een sociale laag." },
  { name: "Komoot", what: "Wandel- en fietsnavigatie met goede hoogteprofielen." },
  { name: "Strava", what: "Segmenten en KOM-jacht op klimmen als de Cauberg." },
];

/* ---------- (super)car-meetings & events ---------- */

export interface MeetEvent {
  id: string;
  name: string;
  period: string;
  place: string;
  what: string;
  url: string;
  free: string;
}

/**
 * Terugkerende events — data wisselen per editie: check altijd de bron.
 * Gratis meets vragen meestal geen aanmelding; beurzen wel een ticket.
 */
export const MEET_EVENTS: MeetEvent[] = [
  { id: "interclassics", name: "InterClassics Maastricht", period: "januari", place: "MECC, Maastricht", what: "Een van Europa's grootste klassiekerbeurzen: concours, clubs en handel.", url: "https://www.interclassics.nl", free: "Ticket vereist" },
  { id: "streetgasm", name: "StreetGasm", period: "mei/juni", place: "Nederland (start) → abroad", what: "Grote internationale rally voor auto's en motoren; route-GPX via het deelnemersplatform.", url: "https://streetgasm.com", free: "Inschrijving vereist" },
  { id: "tt-festival", name: "TT Festival & TT Assen", period: "juni", place: "Assen", what: "Raceweekend met motorfestival in de binnenstad; dé ontmoetplek van NL.", url: "https://www.ttassen.nl", free: "Racekaart vereist, straatfestivals gratis" },
  { id: "limburgs-mooiste", name: "Limburgs Mooiste", period: "juni", place: "Zuid-Limburg", what: "Motoren-auto-evenement over de mooiste Limburgse wegen; GPX via de organisatie.", url: "https://www.limburgsmooiste.nl", free: "Aanmelding via site" },
  { id: "techno-classica", name: "Techno-Classica Essen", period: "april", place: "Essen (DE)", what: "Werelds grootste klassiekerbeurs: 20+ hallen, ook jongtimers en clubs.", url: "https://www.siha.de", free: "Ticket vereist" },
  { id: "zandvoort-gp", name: "Dutch Grand Prix Zandvoort", period: "augustus/september", place: "Circuit Zandvoort", what: "Formule 1-weekend met enorme carmeets op de duinparkingen rondom.", url: "https://www.dutchgp.com", free: "Racekaart vereist" },
];

/* ---------- app-keuze per activiteit ---------- */

export interface AppGuideRow {
  profile: string;
  icon: "car" | "motor" | "bike" | "hike" | "phone";
  picks: { name: string; why: string }[];
  apex: string;
}

/** Welke navigatie-app past bij welke activiteit — en hoe Apex aansluit. */
export const APP_GUIDE: AppGuideRow[] = [
  {
    profile: "Auto & cabrio",
    icon: "car",
    picks: [
      { name: "Google Maps", why: "Beste verkeersinfo en onze slimme ankers (max 11, exact op de weg) — geen U-turn-POI's." },
      { name: "Waze", why: "Politie- en gevarenmeldingen onderweg; minder mooi, wel scherp." },
    ],
    apex: "Kies in de samenvatting 'Google Maps' of 'Waze'. Google Maps krijgt slimme route-ankers; Waze opent de bestemming.",
  },
  {
    profile: "Motor",
    icon: "motor",
    picks: [
      { name: "Kurviger", why: "Bouwt zelf kronkelroutes en vermijdt snelwegen; importeert onze GPX met afslagen." },
      { name: "Calimoto / REVER", why: "Curated motortochten en tracking van je gereden kilometers." },
    ],
    apex: "Download de standaard-GPX met routelijn en beschikbare afslagpunten; controleer na import hoe je app die interpreteert.",
  },
  {
    profile: "Fiets & racefiets",
    icon: "bike",
    picks: [
      { name: "Komoot", why: "Kent oppervlak en wegtype; het hoogteprofiel is sterk." },
      { name: "OsmAnd", why: "Volledig offline met GPX-import — fijn in de Ardennen zonder bereik." },
    ],
    apex: "Plan de fietsroute in Apex en exporteer de standaard-GPX naar een compatibele app.",
  },
  {
    profile: "Wandelen",
    icon: "hike",
    picks: [
      { name: "Komoot", why: "Wandelmodus met echte paden en goede tijdschattingen." },
      { name: "AllTrails", why: "Grote database met reviews als je ergens nieuw bent." },
    ],
    apex: "Gebruik onze POI-laag (uitzichtpunten, cafés) om stops te kiezen vóór je de GPX deelt.",
  },
  {
    profile: "Onderweg plannen",
    icon: "phone",
    picks: [
      { name: "Apex Routes (deze site)", why: "Installeren als app (PWA): offline shell, bestanden openen met 'openen met'." },
      { name: "Strava", why: "Segmenten op klimmen als de Cauberg — voor als het toch een wedstrijdje wordt." },
    ],
    apex: "Open direct in Google Maps of Waze, of download GPX voor een compatibele navigatie-app.",
  },
];

/* ---------- nieuwbouw: wat komt eraan ---------- */

export const ADVISOR_FOOTER =
  "Feiten zorgvuldig samengesteld uit openbare bronnen (ANWB, klimdatabases, toerismebureaus). " +
  "Data van events wisselen per editie — check altijd de site van de organisatie.";
