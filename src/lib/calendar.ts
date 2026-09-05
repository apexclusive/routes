/**
 * Apex Kalender — events waar je heen kunt: baanrijden, MTB, marathons,
 * wandelevents, cyclo's en meets. Maandniveau met bronlink; data wisselen
 * per editie, dus altijd "check de bron". Pure data → testbaar.
 */

export type EventCat = "track" | "mtb" | "loop" | "wandel" | "cyclo" | "meet" | "rally";

/** Landcode voor het landen-filter (tekst, geen vlaggen). */
export type EventCountry = "NL" | "BE" | "LU" | "DE" | "FR" | "IT" | "CH" | "AT";

export interface CalendarEvent {
  id: string;
  name: string;
  cat: EventCat;
  country: EventCountry;
  /** Jaar van deze editie (basisdataset = 2026). */
  year: 2026 | 2027;
  /** "deelnemer" = je kunt je particulier inschrijven; "toeschouwer" = kaartje kopen en kijken. */
  audience: "deelnemer" | "toeschouwer";
  place: string;
  /** startmaand 1-12 (bij meermaandse events: het begin) */
  month: number;
  /** leesbare periode, bijv. "mrt – nov" of "3e weekend sep" */
  period: string;
  what: string;
  url: string;
  /** prijs/aanmelding in één zin */
  access: string;
  /** 2027-spiegeldata zijn verwachtingen, nooit als bevestigd presenteren. */
  dateStatus?: "confirmed" | "expected";
}

export const EVENT_CATS: { id: EventCat; label: string }[] = [
  { id: "track", label: "Baan & race" },
  { id: "mtb", label: "Mountainbike" },
  { id: "loop", label: "Hardlopen" },
  { id: "wandel", label: "Wandelen" },
  { id: "cyclo", label: "Cyclosportief" },
  { id: "meet", label: "Meetings" },
  { id: "rally", label: "Rally's" },
];

export const MONTHS_NL = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

export const EVENTS: CalendarEvent[] = [
  { id: "nurburgring-tf", name: "Nürburgring Touristenfahrten", cat: "track", country: "DE", year: 2026, audience: "deelnemer", place: "Nürburg (DE)", month: 3, period: "mrt – nov", what: "Eigen auto of motor op de Nordschleife: doordeweeks 17:00–19:30, weekend 8:00–19:00.", url: "https://nuerburgring.de", access: "± €30 do / €35 vr–zo per ronde · vanaf mrt t/m nov" },
  { id: "zolder-trackdays", name: "Trackdays Circuit Zolder", cat: "track", country: "BE", year: 2026, audience: "deelnemer", place: "Heusden-Zolder (BE)", month: 4, period: "apr – okt", what: "Open trackdays voor eigen auto; geluidsregels en helm verplicht.", url: "https://www.circuitzolder.be", access: "Inschrijving vooraf · vanaf ± €200 per dagdeel" },
  { id: "spa-trackdays", name: "Trackdays Spa-Francorchamps", cat: "track", country: "BE", year: 2026, audience: "deelnemer", place: "Stavelot (BE)", month: 4, period: "apr – sep", what: "De mooiste baan ter wereld in eigen auto; snel vol — vroeg boeken.", url: "https://www.spa-francorchamps.be", access: "Inschrijving vooraf · vaak ± 4 weken uitverkocht" },
  { id: "assen-trackdays", name: "Trackdays TT-Circuit Assen", cat: "track", country: "NL", year: 2026, audience: "deelnemer", place: "Assen (NL)", month: 4, period: "apr – okt", what: "Het noorden baan-dagen voor auto én motor, ook avondsessies.", url: "https://www.tt-assen.nl", access: "Inschrijving vooraf · avondritten vanaf ± €120" },

  { id: "willingen-bike", name: "Bike Festival Willingen", cat: "mtb", country: "DE", year: 2026, audience: "deelnemer", place: "Willingen (DE)", month: 5, period: "mei", what: "Groot MTB-festival: demo-bikes, enduro-races en trailpark-sessies.", url: "https://www.bikefestival.de", access: "Entreeticket · races aparte inschrijving" },
  { id: "dirt-masters", name: "IXS Dirt Masters", cat: "mtb", country: "DE", year: 2026, audience: "deelnemer", place: "Winterberg (DE)", month: 5, period: "mei (pinksteren)", what: "Downhill- en dirtfestival op de Bikepark Winterberg.", url: "https://www.bikepark-winterberg.de", access: "Entreeticket · parkpass apart" },
  { id: "eifel-trailpark", name: "MTB Trailpark Eifel", cat: "mtb", country: "DE", year: 2026, audience: "deelnemer", place: "Nideggen (DE)", month: 4, period: "apr – okt", what: "Singletracks boven de Rursee; seizoensopening met gidsenritten.", url: "https://www.eifel.info", access: "Gratis trails · gidsenritten tegen betaling" },

  { id: "berlin-marathon", name: "Berlin Marathon", cat: "loop", country: "DE", year: 2026, audience: "deelnemer", place: "Berlijn (DE)", month: 9, period: "sep", what: "Het snelste parcours ter wereld — persoonlijke records worden hier geboren.", url: "https://www.bmw-berlin-marathon.com", access: "Lotgingang · qualifier-tijden helpen" },
  { id: "parijs-marathon", name: "Marathon de Paris", cat: "loop", country: "FR", year: 2026, audience: "deelnemer", place: "Parijs (FR)", month: 4, period: "apr", what: "Van de Champs-Élysées naar Versailles en terug: hardlopen als sightseeing.", url: "https://www.schneiderelectricparismarathon.com", access: "Inschrijving ± €110 · vroeg vol" },
  { id: "amsterdam-marathon", name: "TCS Amsterdam Marathon", cat: "loop", country: "NL", year: 2026, audience: "deelnemer", place: "Amsterdam (NL)", month: 10, period: "okt", what: "Door het Olympisch Stadion en over de Amstel — de klassieker van NL.", url: "https://www.tcsamsterdammarathon.com", access: "Inschrijving ± €65 · lottery bij vol" },
  { id: "rotterdam-marathon", name: "NN Rotterdam Marathon", cat: "loop", country: "NL", year: 2026, audience: "deelnemer", place: "Rotterdam (NL)", month: 4, period: "apr", what: "Vlak en snel door de Coolsingel — dé plek voor NL-records.", url: "https://www.rotterdammarathon.nl", access: "Inschrijving ± €60" },
  { id: "antwerp-10miles", name: "Antwerp 10 Miles", cat: "loop", country: "BE", year: 2026, audience: "deelnemer", place: "Antwerpen (BE)", month: 4, period: "apr", what: "Grootste loop-event van België: 10 miles door de historische stad.", url: "https://www.antwerp10miles.be", access: "Inschrijving ± €35 · 40.000 deelnemers" },

  { id: "vierdaagse", name: "Internationale Vierdaagse Nijmegen", cat: "wandel", country: "NL", year: 2026, audience: "deelnemer", place: "Nijmegen (NL)", month: 7, period: "jul (3e week)", what: "Vier dagen 30–50 km door de Betuwe en over de Waal — de wandelwereldbeker.", url: "https://www.4daagse.nl", access: "Inschrijving via loting (jan)" },
  { id: "pieterpad-lente", name: "Pieterpad-seizoen", cat: "wandel", country: "NL", year: 2026, audience: "deelnemer", place: "Pietersberg → Pieterburen", month: 4, period: "apr – okt", what: "500 km legendepad in etappes; start bij de Sint-Pietersberg in Maastricht.", url: "https://www.pieterpad.nl", access: "Gratis · etappes zelf indelen" },

  { id: "amstel-gold", name: "Amstel Gold Race", cat: "cyclo", country: "NL", year: 2026, audience: "deelnemer", place: "Maastricht/Vilt (NL)", month: 4, period: "apr", what: "Pro-wedstrijd over de Cauberg + de cyclo voor iedereen een dag eerder.", url: "https://www.amstelgoldrace.nl", access: "Cyclo: inschrijving ± €75" },
  { id: "rvv", name: "Ronde van Vlaanderen Cyclo", cat: "cyclo", country: "BE", year: 2026, audience: "deelnemer", place: "Oudenaarde (BE)", month: 4, period: "apr", what: "Over de Koppenberg en Paterberg: rijden door Vlaanderens erfgoed.", url: "https://www.rvv.be", access: "Inschrijving ± €75 · zeer vroeg vol" },
  { id: "lbl", name: "Liège–Bastogne–Liège", cat: "cyclo", country: "BE", year: 2026, audience: "deelnemer", place: "Luik (BE)", month: 4, period: "apr", what: "La Doyenne: de oudste klassieker, met een cyclo over dezelfde cols.", url: "https://www.liegebastogneliege.com", access: "Inschrijving ± €80" },
  { id: "limburgs-mooiste-ev", name: "Limburgs Mooiste", cat: "cyclo", country: "NL", year: 2026, audience: "deelnemer", place: "Zuid-Limburg (NL)", month: 6, period: "jun", what: "Toertochten fietsen én motor over de mooiste Limburgse wegen.", url: "https://www.limburgsmooiste.nl", access: "Aanmelding via site" },

  { id: "streetgasm-ev", name: "StreetGasm", cat: "meet", country: "NL", year: 2026, audience: "deelnemer", place: "NL-start → Europa", month: 6, period: "mei/jun", what: "Grote internationale rally; route-GPX via het deelnemersplatform.", url: "https://streetgasm.com", access: "Inschrijving vereist" },
  { id: "interclassics-ev", name: "InterClassics Maastricht", cat: "meet", country: "NL", year: 2026, audience: "deelnemer", place: "MECC Maastricht (NL)", month: 1, period: "jan", what: "Een van Europa's grootste klassiekerbeurzen: concours en clubs.", url: "https://www.interclassics.nl", access: "Ticket vereist" },

  { id: "kerstcross-zolder", name: "Cyclocross Zolder (kerstcross)", cat: "meet", country: "BE", year: 2026, audience: "deelnemer", place: "Circuit Zolder (BE)", month: 12, period: "26 dec", what: "De kerstklassieker van het veldrijden op en naast het circuit: wereldbeker-niveau op tweedekerstdag.", url: "https://www.circuitzolder.be", access: "Ticket ± €20 · warm aankleden" },
  { id: "night-marathon-lu", name: "ING Night Marathon Luxembourg", cat: "loop", country: "LU", year: 2026, audience: "deelnemer", place: "Luxemburg-stad (LU)", month: 5, period: "laatste weekend mei", what: "Marathon en halve marathon bij avondlicht door de stad en langs de Alzette — het grootste loopevenement van het groothertogdom.", url: "https://www.ing-night-marathon.lu", access: "Inschrijving ± €60 · avondstart" },
  { id: "autosalon-brussel", name: "Brussels Motor Show", cat: "meet", country: "BE", year: 2026, audience: "deelnemer", place: "Brussel Expo (BE)", month: 1, period: "2e helft jan", what: "De grootste autoshow van de Benelux: nieuwe modellen, klassiekers en clubstands — seizoensopener voor petrolheads.", url: "https://www.autosalon.be", access: "Ticket vereist · parkeer met de trein in gedachten" },
  { id: "motorbeurs-utrecht", name: "Motorbeurs Utrecht", cat: "meet", country: "NL", year: 2026, audience: "deelnemer", place: "Jaarbeurs Utrecht (NL)", month: 2, period: "laatste weekend feb", what: "Start van het NL-motorseizoen: alle merken, reis-lezingen en clubstands onder één dak.", url: "https://www.jaarbeurs.nl", access: "Ticket vereist · komme vol — koop vooraf" },
  { id: "haspengouw-rally", name: "Rally van Haspengouw", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Haspengouw (BE)", month: 2, period: "laatste weekend feb", what: "Seizoensopener van het Belgisch kampioenschap: heuveleproeven tussen fruitboomgaarden. Kalender en data: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · kampioenschapsronde BRC" },
  { id: "ardennes-rallye", name: "Rallye des Ardennes", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Ardennen (BE)", month: 3, period: "mid-mrt", what: "Klassieke Ardennenproeven op smal asfalt; divisie 2 van het BRC. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · BRC divisie 2" },
  { id: "tac-rally", name: "TAC Rally", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "West-Vlaanderen (BE)", month: 4, period: "mid-apr", what: "Vlakke maar snelle proeven in West-Vlaanderen, vaste waarde in het BRC. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · kampioenschapsronde BRC" },
  { id: "wallonie-rallye", name: "Rallye de Wallonie", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Wallonië (BE)", month: 4, period: "laatste weekend apr", what: "Tweedaagse door de Waalse coulissen met klassieke proeven. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · tweedaagse BRC-ronde" },
  { id: "sezoensrally", name: "Sezoensrally", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Bocholt (BE)", month: 5, period: "mid-mei", what: "Klassieker rond Bocholt in Limburg: vakwerkproeven met sprongen. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · kampioenschapsronde BRC" },
  { id: "ardennes-festival", name: "Ardennes Rallye Festival", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Ardennen (BE)", month: 5, period: "laatste weekend mei", what: "Nieuwe BRC-ronde met historic-rally's en demonstration runs in de Oostkantons. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · festival-formule" },
  { id: "zuiderzee-rally", name: "Van Wieren Zuiderzee Rally", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Flevoland (NL)", month: 4, period: "mid-apr", what: "Nederlandse rally over dijken en polderwegen rond de Zuiderzee. Jaarlijkse kalender met data: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · NK-rally" },
  { id: "ele-rally", name: "ELE Rally", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Gelderland (NL)", month: 5, period: "laatste weekend mei", what: "Een van de grootste Nederlandse rally's, decennialang vaste waarde. Kalender: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · NK-rally" },
  { id: "ypres-rally", name: "Ardeca Ypres Rally", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Ieper (BE)", month: 6, period: "laatste weekend jun", what: "De beroemdste rally van België: nachtproeven rond Ieper, internationaal deelnemersveld. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · BRC + internationale rally" },
  { id: "vechtdal-rally", name: "Vechtdal Rally", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Vechtdal (NL)", month: 6, period: "3e weekend jun", what: "Snelle proeven door bos en zand langs de Vecht. Kalender: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · NK-rally" },
  { id: "gtc-rally", name: "GTC Rally", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Brabant (NL)", month: 7, period: "2e weekend jul", what: "Zomerrally in West-Brabant met kermis-atmosfeer bij de proeven. Kalender: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · NK-rally" },
  { id: "boucles-chevrotines", name: "Boucles Chevrotines", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Ardennen (BE)", month: 8, period: "1e weekend aug", what: "Zomerse BRC-ronde door de Ardennen, terug op de originele augustusdatum. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · BRC divisie 2" },
  { id: "omloop-vlaanderen", name: "Omloop van Vlaanderen", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Roeselare (BE)", month: 9, period: "1e weekend sep", what: "Vlaamse klassieker rond Roeselare met snel schakelwerk en dijkproeven. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · kampioenschapsronde BRC" },
  { id: "hellendoorn-rally", name: "Hellendoorn Rally", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Hellendoorn (NL)", month: 9, period: "3e weekend sep", what: "Twentse rally met proeven over de Sallandse heuvelrug. Kalender: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · NK-rally" },
  { id: "east-belgian-rally", name: "East Belgian Rally", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Sankt Vith (BE)", month: 9, period: "laatste weekend sep", what: "BRC-finale in de Oostkantons: brede snelle proeven, Duitse flair. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · kampioenschapsronde BRC" },
  { id: "twente-rally", name: "Twente Rally", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Twente (NL)", month: 10, period: "4e weekend okt", what: "Najaarsrally door Twentse esdorpen en bossen. Kalender: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · NK-rally" },
  { id: "spa-rally", name: "Spa Rally", cat: "rally", country: "BE", year: 2026, audience: "deelnemer", place: "Spa (BE)", month: 11, period: "laatste weekend nov", what: "Seizoensafsluiter van het BRC in de Ardennen rond Spa. Kalender: autosport.be.", url: "https://www.autosport.be", access: "Gratis langs de baan · BRC-finale" },
  { id: "berkelland-sprint", name: "Berkelland Rally Sprint", cat: "rally", country: "NL", year: 2026, audience: "deelnemer", place: "Berkelland (NL)", month: 11, period: "3e weekend nov", what: "Korte sprintproeven in de Achterhoek — laagdrempelig en fanatiek. Kalender: achtmaalserallyclub.nl.", url: "https://www.achtmaalserallyclub.nl", access: "Gratis langs de baan · sprint-formule" },

  { id: "la-hallonienne", name: "La Hallonienne", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "Grand-Halleux (BE)", month: 4, period: "1e weekend apr", what: "Vroege Ardennen-marathon met stevige beklimmingen boven de Ourthe.", url: "https://www.marathonmtb.be", access: "Inschrijving ± €35 · BAMS-reeks" },
  { id: "belgium-bike-festival", name: "Belgium Bike Festival", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "Andenne (BE)", month: 4, period: "2e weekend apr", what: "MTB-weekend met marathons, enduro en pro's in de Maasvallei.", url: "https://www.marathonmtb.be", access: "Entreeticket · races aparte inschrijving" },
  { id: "roc-ardenne", name: "Roc d'Ardenne", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "Houffalize (BE)", month: 5, period: "1e weekend mei", what: "Het Parijs-Roubaix van de mountainbike: technische trails rond Houffalize.", url: "https://www.rocdardenne.be", access: "Inschrijving ± €40 · snel vol" },
  { id: "ardennes-trophy", name: "Ardennes Trophy", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "La Reid (BE)", month: 5, period: "4e weekend mei", what: "Klassieke BAMS-marathon metSingletracks door de Hoge Venen.", url: "https://www.marathonmtb.be", access: "Inschrijving ± €35" },
  { id: "raid-hautes-fagnes", name: "Raid des Hautes-Fagnes", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "Malmedy (BE)", month: 6, period: "3e weekend jun", what: "Zware marathon door de Hoge Venen: pure hoogtemeters op smalle paden.", url: "https://www.marathonmtb.be", access: "Inschrijving ± €38" },
  { id: "bartje-200", name: "Bartje 200", cat: "mtb", country: "NL", year: 2026, audience: "deelnemer", place: "Ees (NL)", month: 6, period: "3e weekend jun", what: "Nederlands zwaarste MTB-ultra: 200 km door Drenthe en het Vechtdal.", url: "https://www.bartje200.nl", access: "Inschrijving vereist · ultra" },
  { id: "chouffe-marathon", name: "Chouffe Marathon", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "Achouffe (BE)", month: 8, period: "mid-aug", what: "Iconische marathon in de Ourthevallei met beroemde afdalingen.", url: "https://www.marathonmtb.be", access: "Inschrijving ± €35 · BAMS-reeks" },
  { id: "veldslag-norg", name: "Veldslag om Norg", cat: "mtb", country: "NL", year: 2026, audience: "deelnemer", place: "Norg (NL)", month: 9, period: "1e weekend sep", what: "100+ km door het Drentse zand: de Nederlandse marathon-klassieker.", url: "https://www.veldslagomnorg.nl", access: "Inschrijving ± €40" },
  { id: "grand-raid-godefroy", name: "Grand Raid Godefroy", cat: "mtb", country: "BE", year: 2026, audience: "deelnemer", place: "Bouillon (BE)", month: 9, period: "2e weekend sep", what: "Technische marathon in de Semois-vallei rond het kasteel van Bouillon.", url: "https://www.marathonmtb.be", access: "Inschrijving ± €38" },
  { id: "hondsrug-classic", name: "Hondsrug Classic", cat: "mtb", country: "NL", year: 2026, audience: "deelnemer", place: "Gasselte (NL)", month: 10, period: "1e weekend okt", what: "Najaarsmarathon over de Hondsrug: 90–120 km droge zandpaden.", url: "https://www.mtbmarathon.nl", access: "Inschrijving ± €35 · kalender: mtbmarathon.nl" },
  { id: "hammerstone", name: "Hammerstone", cat: "mtb", country: "NL", year: 2026, audience: "deelnemer", place: "Valkenburg (NL)", month: 10, period: "mid-okt", what: "100+ km met de Zuid-Limburgse heuvels: Cauberg en Bemelerberg in één dag.", url: "https://hammerstone.nl", access: "Inschrijving ± €45 · snel vol" },
  { id: "red-rock-challenge", name: "Red Rock Challenge", cat: "mtb", country: "LU", year: 2026, audience: "deelnemer", place: "Belval (LU)", month: 10, period: "2e weekend okt", what: "Luxemburgs MTB-feest in de Minette-regio: rode rotsen, industriële erfgoedtrails.", url: "https://www.rr-challenge.lu", access: "Inschrijving ± €40" },
  { id: "dutch-masters-mtb", name: "Dutch Masters of MTB", cat: "mtb", country: "NL", year: 2026, audience: "deelnemer", place: "Haarle (NL)", month: 11, period: "mid-nov", what: "Zesdaagse ultra-afsluiter van het Nederlandse MTB-seizoen in de Haarlerbossen.", url: "https://www.mtbmarathon.nl", access: "Inschrijving ± €50 · kalender: mtbmarathon.nl" },
  { id: "hamburg-marathon", name: "Hamburg Marathon", cat: "loop", country: "DE", year: 2026, audience: "deelnemer", place: "Hamburg (DE)", month: 4, period: "laatste weekend apr", what: "Grootste Duitse lente-marathon, vlak en snel langs de Alster en de Elbe.", url: "https://www.hamburg-marathon.com", access: "Inschrijving ± €90" },
  { id: "frankfurt-marathon", name: "Frankfurt Marathon", cat: "loop", country: "DE", year: 2026, audience: "deelnemer", place: "Frankfurt (DE)", month: 10, period: "laatste weekend okt", what: "Snel herfstparcours langs de skyline — PR-baan met dikke pack-loop.", url: "https://www.frankfurt-marathon.com", access: "Inschrijving ± €95" },
  { id: "koln-marathon", name: "Köln Marathon", cat: "loop", country: "DE", year: 2026, audience: "deelnemer", place: "Keulen (DE)", month: 10, period: "1e weekend okt", what: "Door de Dom-stad met massaal publiek langs de Rijnoever.", url: "https://www.koeln-marathon.de", access: "Inschrijving ± €85" },
  { id: "munchen-marathon", name: "München Marathon", cat: "loop", country: "DE", year: 2026, audience: "deelnemer", place: "München (DE)", month: 10, period: "2e weekend okt", what: "Finish in het Olympiastadion — het hoogtepunt van de Beierse loopherfst.", url: "https://www.muenchen-marathon.de", access: "Inschrijving ± €90" },
  { id: "cpc-loop", name: "City-Pier-City Loop", cat: "loop", country: "NL", year: 2026, audience: "deelnemer", place: "Den Haag (NL)", month: 3, period: "mid-mrt", what: "Half marathon door Den Haag naar Scheveningen: de Nederlandse seizoensopener.", url: "https://www.cpcloop.nl", access: "Inschrijving ± €45" },
  { id: "dam-tot-dam", name: "Dam tot Damloop", cat: "loop", country: "NL", year: 2026, audience: "deelnemer", place: "Amsterdam → Zaandam (NL)", month: 9, period: "3e weekend sep", what: "10 Engelse mijl door de IJ-tunnel: 's werelds grootste wegwedstrijd op deze afstand.", url: "https://www.damtotdamloop.nl", access: "Inschrijving ± €40 · snel vol" },
  { id: "zevenheuvelenloop", name: "Zevenheuvelenloop", cat: "loop", country: "NL", year: 2026, audience: "deelnemer", place: "Nijmegen (NL)", month: 11, period: "3e weekend nov", what: "15 km door de heuvels van Berg en Dal — volgens kenners de mooiste wegwedstrijd van NL.", url: "https://www.zevenheuvelenloop.nl", access: "Inschrijving ± €35 · limiet" },
  { id: "eindhoven-marathon", name: "Eindhoven Marathon", cat: "loop", country: "NL", year: 2026, audience: "deelnemer", place: "Eindhoven (NL)", month: 10, period: "2e weekend okt", what: "Vlak en snel door de lichtstad — de beste ticket naar een persoonlijk record.", url: "https://www.marathoneindhoven.nl", access: "Inschrijving ± €60" },
  { id: "brussel-20km", name: "20 km door Brussel", cat: "loop", country: "BE", year: 2026, audience: "deelnemer", place: "Brussel (BE)", month: 5, period: "laatste weekend mei", what: "40.000 lopers door het centrum: van de Grote Markt tot het Jubelpark.", url: "https://www.20kmdebruxelles.be", access: "Inschrijving ± €30" },
  { id: "rad-am-ring", name: "Rad am Ring", cat: "cyclo", country: "DE", year: 2026, audience: "deelnemer", place: "Nürburgring (DE)", month: 7, period: "1e weekend jul", what: "Fietsover de Nordschleife: sportieven over de beroemdste racebaan ter wereld, 's nachts de weerlicht-ronde.", url: "https://www.rad-am-ring.de", access: "Inschrijving ± €55 · nachtstart zaterdag" },
  { id: "cyclassics-hamburg", name: "Cyclassics Hamburg (Jedermann)", cat: "cyclo", country: "DE", year: 2026, audience: "deelnemer", place: "Hamburg (DE)", month: 9, period: "2e weekend sep", what: "Iedereen fietst het pro-parcours van de BEMER Cyclassics — met de profs op zondag.", url: "https://www.cyclassics-hamburg.de", access: "Inschrijving ± €50 · pro-race gratis te bekijken" },

  { id: "f1-spa-2026", name: "Formule 1 Grote Prijs van België", cat: "track", country: "BE", year: 2026, audience: "toeschouwer", place: "Spa-Francorchamps (BE)", month: 7, period: "17–19 jul 2026", what: "Het F1-weekend in de Ardennen: kwalificatie, sprint en de race over Eau Rouge en Raidillon.", url: "https://tickets.spa-francorchamps.be", access: "Kaartjes vanaf ± €85 · vroeg boeken loont" },
  { id: "f1-zandvoort-2026", name: "Formule 1 Dutch Grand Prix", cat: "track", country: "NL", year: 2026, audience: "toeschouwer", place: "Zandvoort (NL)", month: 8, period: "21–23 aug 2026 (sprint)", what: "Oranje zee in de duinen: sprintweekend met de beste sfeer van de kalender.", url: "https://www.dutchgp.com", access: "Kaartjes ± €125–400 · zeer snel vol" },
  { id: "motogp-assen-2026", name: "MotoGP TT Assen", cat: "track", country: "NL", year: 2026, audience: "toeschouwer", place: "TT-Circuit Assen (NL)", month: 6, period: "laatste weekend jun", what: "De Dutch TT: hét motorweekend van Nederland met MotoGP, Moto2 en Moto3.", url: "https://www.tt-assen.nl", access: "Kaartjes vanaf ± €60" },
  { id: "motogp-sachsenring-2026", name: "MotoGP Sachsenring", cat: "track", country: "DE", year: 2026, audience: "toeschouwer", place: "Hohenstein-Ernstthal (DE)", month: 7, period: "mid-jul", what: "Duitslands MotoGP-weekend in Sachsen: de beroemde waterval-bocht en 100.000 fans.", url: "https://www.sachsenring.de", access: "Kaartjes vanaf ± €55" },
  { id: "wsbk-assen-2026", name: "World Superbike Assen", cat: "track", country: "NL", year: 2026, audience: "toeschouwer", place: "TT-Circuit Assen (NL)", month: 4, period: "apr", what: "Het SBK-seizoen opent traditioneel in Assen: supersport en superbikes op het kathedrale circuit.", url: "https://www.ttassen.nl", access: "Kaartjes vanaf ± €40" },
  { id: "ewc-8h-spa-2026", name: "8 Hours of Spa Motos (EWC)", cat: "track", country: "BE", year: 2026, audience: "toeschouwer", place: "Spa-Francorchamps (BE)", month: 6, period: "begin jun", what: "Wereldkampioenschap duurracen voor motoren: 8 uur non-stop over Eau Rouge.", url: "https://www.spa-francorchamps.be", access: "Kaartjes ± €40 · incl. paddock" },
  { id: "24h-spa-2026", name: "CrowdStrike 24 Hours of Spa", cat: "track", country: "BE", year: 2026, audience: "toeschouwer", place: "Spa-Francorchamps (BE)", month: 6, period: "25–28 jun 2026", what: "De grootste GT-race ter wereld: 24 uur, 70+ GT-auto's — met amateurs naast fabrieksteams op dezelfde baan.", url: "https://www.24hspa.com", access: "Kaartjes ± €55 · weekend inclusief" },
  { id: "wec-6h-spa-2026", name: "WEC 6 Hours of Spa", cat: "track", country: "BE", year: 2026, audience: "toeschouwer", place: "Spa-Francorchamps (BE)", month: 5, period: "1e weekend mei", what: "Hypercars en LMGT3 in de generale repetitie voor Le Mans — zes uur racen in de Ardennen.", url: "https://www.spa-francorchamps.be", access: "Kaartjes ± €45" },
  { id: "adac-24h-nurburg-2026", name: "ADAC 24h-Rennen Nürburgring", cat: "track", country: "DE", year: 2026, audience: "toeschouwer", place: "Nürburg (DE)", month: 6, period: "1e weekend jun", what: "24 uur over Nordschleife en GP-baan: 150 auto's, amateurteams en fabrieksrijders samen.", url: "https://www.nuerburgring.de", access: "Kaartjes ± €75 · camping volgt snel" },
  { id: "truck-gp-nurburg-2026", name: "Truck Grand Prix Nürburgring", cat: "track", country: "DE", year: 2026, audience: "toeschouwer", place: "Nürburg (DE)", month: 7, period: "2e weekend jul", what: "Race trucks van 1.100 pk, showprogramma en muziek: evenzeer raceweekend als familie-festival.", url: "https://www.truck-grand-prix.de", access: "Kaartjes ± €55" },
  { id: "oldtimer-gp-2026", name: "Oldtimer Grand Prix Nürburgring", cat: "track", country: "DE", year: 2026, audience: "toeschouwer", place: "Nürburg (DE)", month: 8, period: "1e weekend aug", what: "Historisch racen op de Nordschleife: van pre-oorlog tot Le Mans-legendes, met open paddock.", url: "https://www.avd.de", access: "Kaartjes ± €45" },
  { id: "bikers-festival-spa-2026", name: "Bikers' Festival Spa", cat: "meet", country: "BE", year: 2026, audience: "toeschouwer", place: "Spa-Francorchamps (BE)", month: 8, period: "mid-aug", what: "Motorfeest op het circuit: Ducati-days-stijl shows, demos en het langeafstandsweekend.", url: "https://www.spa-francorchamps.be", access: "Kaartjes ± €35" },
  { id: "24h-zolder-2026", name: "24 Hours of Zolder", cat: "track", country: "BE", year: 2026, audience: "toeschouwer", place: "Heusden-Zolder (BE)", month: 7, period: "laatste weekend jul", what: "Belgiës andere 24-uursklassieker: toegankelijk, kampvuur-sfeer en veel Belgische teams.", url: "https://www.24hzolder.be", access: "Kaartjes ± €30" },
  { id: "deutschland-tour-2026", name: "Deutschland Tour", cat: "cyclo", country: "DE", year: 2026, audience: "toeschouwer", place: "Zuid-Duitsland (DE)", month: 8, period: "aug", what: "De Duitse etappenkoers voor profs, met amateur-rit voor jezelf op dezelfde dagen.", url: "https://www.deutschland-tour.com", access: "Straats gratis · amateurrit ± €45" },
  { id: "rvv-pro-2026", name: "Ronde van Vlaanderen (pro)", cat: "cyclo", country: "BE", year: 2026, audience: "toeschouwer", place: "Antwerpen → Oudenaarde (BE)", month: 4, period: "1e weekend apr", what: "De hoogmis van het Vlaamse wielrennen: Koppenberg, Oude Kwaremont en honderdduizenden langs de kant.", url: "https://www.rondevanvlaanderen.be", access: "Gratis langs de kant · hellingen vroeg bezetten" },
  { id: "lbl-pro-2026", name: "Liège–Bastogne–Liège (pro)", cat: "cyclo", country: "BE", year: 2026, audience: "toeschouwer", place: "Luik (BE)", month: 4, period: "laatste weekend apr", what: "La Doyenne, de oudste wielerklassieker ter wereld: van Bastenaken terug naar de finish in Luik.", url: "https://www.liegebastogneliege.com", access: "Gratis langs de kant" },
  { id: "waalse-pijl-2026", name: "Waalse Pijl (pro)", cat: "cyclo", country: "BE", year: 2026, audience: "toeschouwer", place: "Huy (BE)", month: 4, period: "mid-apr", what: "De Muur van Huy beslist — kort, steil en brutaler dan bijna alles.", url: "https://www.flechewallonne.be", access: "Gratis op de Muur · come early" },
  { id: "gent-wevelgem-2026", name: "Gent–Wevelgem (pro)", cat: "cyclo", country: "BE", year: 2026, audience: "toeschouwer", place: "Ieper → Wevelgem (BE)", month: 3, period: "laatste weekend mrt", what: "Over de Kemmelberg en de Vlaamse velden: sprintersklassieker met WOI-geschiedenis.", url: "https://www.gentwevelgem.be", access: "Gratis langs de kant" },
  { id: "zesdaagse-gent-2026", name: "Zesdaagse van Vlaanderen-Gent", cat: "cyclo", country: "BE", year: 2026, audience: "toeschouwer", place: "'t Kuipke, Gent (BE)", month: 11, period: "mid-nov", what: "Baanwielrennen in de kleinste, warmste wielerbak van de wereld — de ploegkoers als apotheose.", url: "https://www.zesdaagse.be", access: "Kaartjes ± €20 · avonden zijn snel uitverkocht" },

];

/* ---------- Apex Nieuws (redactie) ---------- */

export interface NewsItem {
  id: string;
  date: string;
  tag: string;
  title: string;
  text: string;
  href: string;
  hrefLabel: string;
}

export const NEWS: NewsItem[] = [
  {
    id: "demo-rit-live",
    date: "sep 2026",
    tag: "Product",
    title: "Demo-rit: proefrijd je route vóór je start",
    text: "Virtuele rit over je eigen route met afslagbanners en gesproken instructies — snelheid 1×, 2× of 4×.",
    href: "/?rit=1",
    hrefLabel: "Proberen",
  },
  {
    id: "roulette-live",
    date: "sep 2026",
    tag: "Product",
    title: "Route Roulette uit de beta",
    text: "Niet kiezen maar draaien: het wiel bepaalt regio en kilometers, de planner bouwt de route direct.",
    href: "/#roulette",
    hrefLabel: "Draaien",
  },
  {
    id: "ritbank-live",
    date: "sep 2026",
    tag: "Community",
    title: "Ritbank open: deel routes met één link",
    text: "Elke route past in een URL. Plak links van anderen, hang berichten en foto's op het prikbord.",
    href: "/ritbank",
    hrefLabel: "Naar de Ritbank",
  },
  {
    id: "advisor-live",
    date: "sep 2026",
    tag: "Redactie",
    title: "Apex Advisor gelanceerd",
    text: "Geschiedenis van de grote routes, klimtabel van Nederland, APK- en pechkennis — met bronnen.",
    href: "/advies",
    hrefLabel: "Lezen",
  },
];

/** Jaarweergave: 2027 is uitsluitend een seizoensverwachting totdat de bron bevestigt. */
export function eventsForYear(year: 2026 | 2027): CalendarEvent[] {
  if (year === 2026) return EVENTS;
  return EVENTS.map((e) => ({
    ...e,
    id: `${e.id}-2027`,
    year: 2027 as const,
    dateStatus: "expected" as const,
    period: `verwacht: ${e.period.replace(/\b2026\b/g, "2027")}`,
    access: "Nog niet bevestigd — controleer de organisator voor je boekt.",
  }));
}
