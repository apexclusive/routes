/**
 * Ontdek-routes: gecureerde top-routes per land, circuits en evenementen.
 * Alles vrij samengesteld door Apex Routes; prompts zijn zo geschreven dat
 * de route-assistent ze direct kan bouwen. Bij externe bronnen staat
 * een expliciete vermelding.
 */

export interface TopRoute {
  id: string;
  name: string;
  region: string;
  km: number;
  /** geschatte hoogtemeters */
  hm: number;
  tags: string[];
  blurb: string;
  /** prompt voor de route-assistent (parseerbaar) */
  prompt: string;
  /** illustratie in /routescapes (AI-gegenereerd, huisstijl) */
  img: string;
}

export interface CountryRoutes {
  id: string;
  label: string;
  intro: string;
  routes: TopRoute[];
}

export const COUNTRIES: CountryRoutes[] = [
  {
    id: "nl",
    label: "Nederland",
    intro: "Glooiend Zuid-Limburg, dijken langs de rivieren en verrassend lege wegen in Drenthe.",
    routes: [
      { id: "nl-1", name: "Mergellandroute", region: "Zuid-Limburg", km: 110, hm: 1150, tags: ["bochten", "heuvels", "klassieker"], blurb: "Dé Limburgse klassieker: Bemelen, Sint Geertruid, de Loorberg en het dal van de Geul.", prompt: "mooie kronkelige motorrondrit van ongeveer 110 km door het Mergelland vanaf Maastricht" , img: "/routescapes/limburg-hills.jpg" },
      { id: "nl-2", name: "Drie-landenpunt Vaals", region: "Limburg", km: 70, hm: 700, tags: ["grenzen", "uitzicht"], blurb: "Vaals, Vijlenerbossen en het hoogste punt van NL — in één middag drie landen raken.", prompt: "rondrit van 70 km vanaf Maastricht via Vaals en Vijlen, mooie wegen" , img: "/routescapes/limburg-hills.jpg" },
      { id: "nl-3", name: "Geuldal & Valkenburg", region: "Zuid-Limburg", km: 60, hm: 550, tags: ["kort maar krachtig"], blurb: "Korte rit door het Geuldal: Houthem, Meerssen en de Bunderbos." , prompt: "mooie autorondrit van 60 km door het Geuldal en Valkenburg" , img: "/routescapes/limburg-hills.jpg" },
      { id: "nl-4", name: "Veluwezoom", region: "Gelderland", km: 90, hm: 350, tags: ["natuur", "rustig"], blurb: "Door het Nationaal Park Veluwezoom en over de Posbank — klimmetjes die in NL zeldzaam zijn.", prompt: "rondrit van 90 km door de Veluwe vanaf Arnhem, mooie natuur" , img: "/routescapes/nl-forest.jpg" },
      { id: "nl-5", name: "Uiterdijken Nederrijn", region: "Betuwe", km: 120, hm: 200, tags: ["water", "dijken"], blurb: "Dijken, uiterwaarden en veerponten langs Nederrijn en Lek.", prompt: "mooie motorrit van 120 km langs de rivieren vanuit Arnhem richting Wijk bij Duurstede" , img: "/routescapes/nl-dikes.jpg" },
      { id: "nl-6", name: "Zeeuwse dijken", region: "Zeeland", km: 140, hm: 150, tags: ["wind", "water", "koffiestops"], blurb: "Domburg, Westkapelle en de Oosterscheldekering — water aan beide kanten.", prompt: "motorrondrit van 140 km door Zeeland langs Domburg en Westkapelle" , img: "/routescapes/nl-dikes.jpg" },
      { id: "nl-7", name: "Drents esdorpenlandschap", region: "Drenthe", km: 100, hm: 120, tags: ["snel", "leeg"], blurb: "Rechte snelheden en boerenschappen tussen Assen en Coevorden.", prompt: "ronde van 100 km door Drenthe vanaf Assen, mooie stille wegen" , img: "/routescapes/nl-fields.jpg" },
      { id: "nl-8", name: "Ameland-verbinding", region: "Noord", km: 80, hm: 40, tags: ["kust"], blurb: "Wieringen, de Afsluitdijk-uitzichtpunten en Makkum — kustlijn volgen.", prompt: "mooie rit van 80 km langs de kust en de Afsluitdijk vanaf Makkum" , img: "/routescapes/nl-dikes.jpg" },
      { id: "nl-9", name: "Achterhoek achtje", region: "Gelderland", km: 130, hm: 300, tags: ["bossen", "coupijnen"], blurb: "Slingerende wegen door bos- en coulisselandschap rond Lochem." , prompt: "kronkelige motorrondrit van 130 km door de Achterhoek vanaf Lochem" , img: "/routescapes/nl-forest.jpg" },
      { id: "nl-10", name: "Bollenstreek voorjaarsrit", region: "Zuid-Holland", km: 65, hm: 30, tags: ["lente", "kleur"], blurb: "Tulpenvelden, duinen en de Keukenhof-streek op z'n best in april.", prompt: "autorondrit van 65 km door de Bollenstreek vanaf Lisse" , img: "/routescapes/nl-fields.jpg" },
    ],
  },
  {
    id: "be",
    label: "België",
    intro: "De Ardennen zijn de speeltuin van de Benelux: bos, rivierdalen en eindeloze bochten.",
    routes: [
      { id: "be-1", name: "Ardennen-hoofdroute", region: "Luik/Ardennen", km: 200, hm: 2400, tags: ["klimmen", "klassieker"], blurb: "Spa, Stavelot, La Roche en Durbuy — de Grote Vieren van de Ardennen.", prompt: "mooie motorrondrit van ongeveer 200 km door de Ardennen via La Roche en Durbuy" , img: "/routescapes/ardennes.jpg" },
      { id: "be-2", name: "Ourthe-vallei", region: "Lux. provincie", km: 120, hm: 1400, tags: ["rivierdal", "bochten"], blurb: "Langs de Ourthe van Houffalize naar Durbuy, het bochtenparadijs.", prompt: "motorrit van 120 km door de Ourthe-vallei via Houffalize naar Durbuy" , img: "/routescapes/ardennes.jpg" },
      { id: "be-3", name: "Eifel-Ardennen grensrit", region: "Duits-Belgisch", km: 190, hm: 2100, tags: ["2 landen"], blurb: "Malmedy, Monschau en terug langs de stuwmeren — twee landen, één rit.", prompt: "rondrit van 190 km vanuit Malmedy door de Ardennen en de Eifel" , img: "/routescapes/eifel.jpg" },
      { id: "be-4", name: "Voerstreek & Hoge Kempen", region: "Limburg (B)", km: 140, hm: 1200, tags: ["grensroutes"], blurb: "'s Gravenvoeren, Nationaal Park Hoge Kempen en terug via Valkenburg.", prompt: "mooie motorrondrit van 140 km door de Voerstreek en het Nationaal Park Hoge Kempen" , img: "/routescapes/limburg-hills.jpg" },
      { id: "be-5", name: "Fagne & Baraque de Fraiture", region: "Luik", km: 150, hm: 1700, tags: ["hoogvlakte"], blurb: "De Hoge Venen: kaal, winderig, magisch — met de Baraque de Fraiture als hoogtepunt.", prompt: "rondrit van 150 km door de Hoge Venen vanuit Malmedy" , img: "/routescapes/ardennes.jpg" },
      { id: "be-6", name: "Semois-dal", region: "Naamur", km: 130, hm: 1500, tags: ["rivier", "uitzicht"], blurb: "Het mooiste riviertal van België: Bouillon, Vresse en rotsuitzichten.", prompt: "motorrit van 130 km door de Semois-vallei via Bouillon" , img: "/routescapes/ardennes.jpg" },
      { id: "be-7", name: "Condroz & Famenne", region: "Namen", km: 160, hm: 1200, tags: ["afwisselend"], blurb: "Zacht glooiend, leuke dorpjes en weinig verkeer tussen Namen en Marche.", prompt: "mooie autorondrit van 160 km door de Condroz vanuit Namen" , img: "/routescapes/nl-fields.jpg" },
      { id: "be-8", name: "Vlaamse Ardennen", region: "Oost-Vlaanderen", km: 90, hm: 700, tags: ["korte klimmen"], blurb: "De Muur van Geraardsbergen en de Parijs-Roubaix-streek in mini-vorm.", prompt: "rondrit van 90 km door de Vlaamse Ardennen met klimmetjes" , img: "/routescapes/limburg-hills.jpg" },
      { id: "be-9", name: "Kust naar polders", km: 100, region: "West-Vlaanderen", hm: 60, tags: ["vlak", "snel"], blurb: "Van Nieuwpoort het polderland in — lekker doorrijden.", prompt: "motorrit van 100 km vanuit Nieuwpoort door de West-Vlaamse polders" , img: "/routescapes/nl-dikes.jpg" },
      { id: "be-10", name: "Brabantse Wouden", region: "Vlaams-Brabant", km: 110, hm: 450, tags: ["bossen"], blurb: "Zoniënwoud en het Heverleebos — groene long vlakbij Brussel.", prompt: "mooie rit van 110 km door het Zoniënwoud en rond Leuven" , img: "/routescapes/nl-forest.jpg" },
    ],
  },
  {
    id: "lu",
    label: "Luxemburg",
    intro: "Klein maar fel: het Müllerthal (Zwitserland van Luxemburg) en de Moezel vormen één grote speelkaart.",
    routes: [
      { id: "lu-1", name: "Müllerthal volledige lus", region: "Grondhaff", km: 120, hm: 1600, tags: ["rotsen", "kloven"], blurb: "Echternach, Berdorf en de Schiessentümpel — rotsformaties als decor.", prompt: "mooie motorrondrit van 120 km door het Müllerthal vanaf Echternach" , img: "/routescapes/mullerthal.jpg" },
      { id: "lu-2", name: "Drei Länder Moezel", region: "Echternach", km: 150, hm: 1400, tags: ["3 landen"], blurb: "Moezel-vallei, Duitse wijngaarden en Frans Lorenes platteland.", prompt: "rondrit van 150 km door Luxemburg langs de Moezel en terug via Duitsland" , img: "/routescapes/mosel.jpg" },
      { id: "lu-3", name: "Our- en Sûre-dal", region: "Noorden", km: 110, hm: 1300, tags: ["rivieren"], blurb: "Vianden met zijn kasteel en het stille Sûre-dal.", prompt: "motorrit van 110 km langs Vianden en het Our-dal" , img: "/routescapes/mullerthal.jpg" },
      { id: "lu-4", name: "Kleine Zwitserland kort", region: "Müllerthal", km: 70, hm: 900, tags: ["half dagje"], blurb: "Compacte lus door de mooiste kloven.", prompt: "rondrit van 70 km door Luxemburgs Klein Zwitserland" , img: "/routescapes/mullerthal.jpg" },
      { id: "lu-5", name: "Ardennen-Luxemburg grens", region: "Wiltz", km: 160, hm: 1700, tags: ["grens"], blurb: "Wiltz, Clervaux en over de Belgische grens naar Houffalize.", prompt: "mooie rit van 160 km van Wiltz door de Luxemburgse Ardennen naar België" , img: "/routescapes/ardennes.jpg" },
      { id: "lu-6", name: "Moezelwijngaarden", region: "Grevenmacher", km: 90, hm: 800, tags: ["wijn", "terrasjes"], blurb: "Wijndorpen met proeflokalen — plan een extra stop.", prompt: "motorrit van 90 km door de Moezel-wijngaarden vanaf Grevenmacher" , img: "/routescapes/mosel.jpg" },
      { id: "lu-7", name: "Land van de Rode Rotsen", region: "Zuiden", km: 80, hm: 700, tags: ["mines"], blurb: "Minett Trail-gebied: industriële erfenis in het zuiden.", prompt: "rondrit van 80 km door het Land van de Rode Rotsen in Zuid-Luxemburg" , img: "/routescapes/mullerthal.jpg" },
      { id: "lu-8", name: "Esch-sur-Sûre reservoir", region: "Centrum", km: 100, hm: 900, tags: ["water"], blurb: "Rond het stuwmeer van de Sûre, met kasteelzicht.", prompt: "mooie rit van 100 km rond het stuwmeer van Esch-sur-Sûre" , img: "/routescapes/mullerthal.jpg" },
      { id: "lu-9", name: "Eislek hoogvlakte", region: "Noord", km: 130, hm: 1100, tags: ["ruig"], blurb: "Hoog, leeg en woest — de Eislek-streek.", prompt: "motorrondrit van 130 km door de Eislek-streek in Noord-Luxemburg" , img: "/routescapes/ardennes.jpg" },
      { id: "lu-10", name: "Grondhof-achtje", region: "Müllerthal", km: 55, hm: 650, tags: ["avondrit"], blurb: "Perfect voor na het werk: onder het uur toch écht bochtenwerk.", prompt: "korte mooie rondrit van 55 km vanuit Echternach" , img: "/routescapes/mullerthal.jpg" },
    ],
  },
  {
    id: "de",
    label: "Duitsland",
    intro: "Eifel, Sauerland, Moezel en Zwarte Woud: Duitsland is oneindig voor dagritten.",
    routes: [
      { id: "de-1", name: "Nürburgring Eifel-rit", region: "Eifel", km: 180, hm: 2200, tags: ["Nordschleife", "klassieker"], blurb: "Rond de Nordschleife, de Rursee en Adenau — Peloton-hoofdroute.", prompt: "mooie motorrondrit van 180 km in de Eifel rond de Nürburgring en de Rursee" , img: "/routescapes/eifel.jpg" },
      { id: "de-2", name: "Sauerland ochoog", region: "Sauerland", km: 200, hm: 2600, tags: ["klimmen"], blurb: "Winterberg, Willingen en de Kahler Asten — Duitslands bikeparadijs.", prompt: "motorrondrit van 200 km door het Sauerland via Winterberg en Willingen" , img: "/routescapes/sauerland.jpg" },
      { id: "de-3", name: "Moezel-panorama", region: "Moezel", km: 220, hm: 2400, tags: ["wijngaarden", "uitersten"], blurb: "De Moezel volgen van Trier naar Bernkastel — haarspeldbochten gegarandeerd.", prompt: "mooie rit van 220 km langs de Moezel van Trier naar Bernkastel en terug" , img: "/routescapes/mosel.jpg" },
      { id: "de-4", name: "Zwarte Woud hoogweggen", region: "Baden", km: 250, hm: 3300, tags: ["klimmen", "ver"], blurb: "Schwarzwaldhochstraße, Mummelsee en het Kinzigtal.", prompt: "motorrondrit van 250 km door het Zwarte Woud via de Schwarzwaldhochstraße" , img: "/routescapes/blackforest.jpg" },
      { id: "de-5", name: "Eifel vulkaanlus", region: "Eifel", km: 130, hm: 1500, tags: ["meren"], blurb: "Vulkaanmeren, Nideggen en het Rurtal — kort en compleet.", prompt: "rondrit van 130 km door de Vulkaaneifel met de meren" , img: "/routescapes/eifel.jpg" },
      { id: "de-6", name: "Westerwald snelheden", region: "Westerwald", km: 160, hm: 1400, tags: ["snel"], blurb: "Brede, snelle B-wegen tussen sloten en meren.", prompt: "mooie rit van 160 km door de Westerwald" , img: "/routescapes/sauerland.jpg" },
      { id: "de-7", name: "Taunus bergweg", region: "Hessen", km: 90, hm: 1100, tags: ["dichtbij"], blurb: "De Feldberg-bergweg: het streetrace-circuit van Frankfurt.", prompt: "motorrit van 90 km over de Taunus bergweg bij de Feldberg" , img: "/routescapes/blackforest.jpg" },
      { id: "de-8", name: "Hunsrück silverster", region: "Hunsrück", km: 170, hm: 1900, tags: ["uitkijk"], blurb: "Hoogvlaktes met ver uitzicht tussen Moezel en Rijn.", prompt: "rondrit van 170 km door de Hunsrück met mooie uitzichten" , img: "/routescapes/mosel.jpg" },
      { id: "de-9", name: "Odenwald lus", region: "Odenwald", km: 140, hm: 1600, tags: ["bossen"], blurb: "Bergstrasse en sdal van de Neckar.", prompt: "mooie motorrit van 140 km door de Odenwald" , img: "/routescapes/nl-forest.jpg" },
      { id: "de-10", name: "Vogelsberg achtje", region: "Hessen", km: 120, hm: 1200, tags: ["vulkaan"], blurb: "Rond de hoogste vulkaan van Europa — groen en vergeten.", prompt: "rondrit van 120 km rond de Vogelsberg" , img: "/routescapes/sauerland.jpg" },
    ],
  },
];

export interface Circuit {
  id: string;
  name: string;
  place: string;
  km: number;
  blurb: string;
  prompt: string;
  img: string;
}

/** Mooie ritten naar bekende circuits — met stopadvies onderweg. */
export const CIRCUITS: Circuit[] = [
  {
    id: "zolder",
    img: "/routescapes/limburg-hills.jpg",
    name: "Circuit Zolder",
    place: "Heusden-Zolder, Limburg (B)",
    km: 140,
    blurb:
      "Via de Voerstreek en het Mergelland naar Zolder — onderweg terrassen in vogelvlucht-uitzichtjes.",
    prompt:
      "mooie motorrit van ongeveer 140 km vanuit Maastricht via de Voerstreek naar Circuit Zolder in Heusden-Zolder",
  },
  {
    id: "zandvoort",
    img: "/routescapes/nl-dikes.jpg",
    name: "Circuit Zandvoort",
    place: "Zandvoort, Noord-Holland",
    km: 130,
    blurb:
      "Over de duinweggen en door de bollenstreek naar de kust — zilt, snel en groen.",
    prompt:
      "mooie autorit van ongeveer 130 km via de duinen en de Bollenstreek naar Circuit Zandvoort",
  },
  {
    id: "assen",
    img: "/routescapes/nl-fields.jpg",
    name: "TT-Circuit Assen",
    place: "Assen, Drenthe",
    km: 150,
    blurb:
      "Door het Drents esdorpenlandschap naar het kathedraal van de motorsport.",
    prompt:
      "mooie motorrit van ongeveer 150 km door Drenthe naar het TT-Circuit Assen",
  },
  {
    id: "spa",
    img: "/routescapes/ardennes.jpg",
    name: "Circuit Spa-Francorchamps",
    place: "Stavelot, Ardennen (B)",
    km: 210,
    blurb:
      "Eau Rouge als finish: via de Ardennen-hoogten naar het mooiste circuit ter wereld.",
    prompt:
      "mooie motorrit van ongeveer 210 km door de Ardennen naar Circuit Spa-Francorchamps bij Stavelot",
  },
  {
    id: "nurburgring",
    img: "/routescapes/eifel.jpg",
    name: "Nürburgring Nordschleife",
    place: "Nürburg, Eifel (D)",
    km: 190,
    blurb:
      "De groene hel als doel: Eifel-wegen, Rursee en dan Döttinger Höhe.",
    prompt:
      "mooie motorrit van ongeveer 190 km door de Eifel naar de Nürburgring Nordschleife",
  },
];

export interface RallyEvent {
  id: string;
  name: string;
  what: string;
  url: string;
}

/**
 * Evenementen waarvan de organisatoren zelf GPX-bestanden publiceren.
 * Wij publiceren hun routes niet na — download ze bij de bron en sleep ze
 * in Apex; alle bronvermelding ligt bij de organisatie.
 */
export const RALLY_EVENTS: RallyEvent[] = [
  {
    id: "streetgasm",
    name: "StreetGasm",
    what: "Grote internationale rally met start in Nederland; deelnemers krijgen de GPX via het eigen deelnemersplatform.",
    url: "https://streetgasm.com",
  },
  {
    id: "cc-rally",
    name: "CC Rally",
    what: "Populaire touringcar-/auto-rally's in Vlaanderen en Nederland; routes via de organisatie.",
    url: "https://ccrally.be",
  },
  {
    id: "limburgs-mooiste",
    name: "Limburgs Mooiste",
    what: "Motor- en autoevenement in Zuid-Limburg; GPX-routes publiceren ze vlak voor het evenement op de eigen site.",
    url: "https://www.limburgsmooiste.nl",
  },
  {
    id: "strade-bianche",
    name: "Strade Bianche Peelenhei",
    what: "Onverharde-gritten-tocht in Limburg met gratis GPX-downloads (via routeyou).",
    url: "https://stradebianchepeelenhei.nl",
  },
];

export const DISCOVER_FOOTER =
  "Routes samengesteld door Apex Routes op basis van openbare wegkennis en OpenStreetMap. " +
  "Evenementsroutes blijven eigendom van de organisatie — download ze bij de bron.";
