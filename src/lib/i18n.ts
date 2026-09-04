/**
 * Meertaligheid — NL · EN · FR · DE.
 * Pure data (geen React) zodat node --test de volledigheid kan checken.
 * De app onthoudt de voorkeur (localStorage) en elke component luistert mee.
 */

export type Lang = "nl" | "en" | "fr" | "de";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "nl", label: "NL" },
  { id: "en", label: "EN" },
  { id: "fr", label: "FR" },
  { id: "de", label: "DE" },
];

export interface LandingStrings {
  nav: { discover: string; ritbank: string; advisor: string; kalender: string; forum: string; import: string; openApp: string };
  hero: {
    badge: string;
    titleLead: string;
    titleWords: string[];
    titleTailA: string;
    titleTailB: string;
    sub: string;
    start: string;
    importRoute: string;
    hint: string;
    dropTitle: string;
  };
  map: { demo: string; tryLive: string; tankstops: string };
  roulette: {
    badge: string;
    titleA: string;
    titleB: string;
    sub: string;
    kmTarget: string;
    spin: string;
    spinAgain: string;
    open: string;
    note: string;
  };
  stats: { regions: string; formats: string; apps: string; cost: string };
  poll: { title: string; sub: string; q: string; options: string[] };
  pricing: {
    titleA: string;
    titleB: string;
    sub: string;
    freeTitle: string;
    freePrice: string;
    freeForever: string;
    freeBullets: string[];
    suppTitle: string;
    suppPrice: string;
    suppNote: string;
    suppBullets: string[];
    proTitle: string;
    proPrice: string;
    proNote: string;
    proBullets: string[];
    popular: string;
    ctaFree: string;
    ctaSupporter: string;
    ctaPro: string;
    supportLine: string;
  };
  featuresTitle: string;
  features: { title: string; desc: string }[];
  footer: {
    plan: string;
    discover: string;
    community: string;
    why: string;
    supportCta: string;
    credits: string;
    roulette: string;
    checklist: string;
    gpx: string;
    klimmen: string;
    adverteren: string;
    ritten: string;
  };
  forumBand: { title: string; sub: string; cta: string };
  rotw: { label: string; plan: string; copied: string; hotel: string; climbs: string; meer: string };
  steps: { t: string; d: string }[];
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  finalNature: string;
  footerBuilt: string;
}

export const LANDING: Record<Lang, LandingStrings> = {
  nl: {
    nav: { discover: "Ontdek routes", ritbank: "Ritbank", advisor: "Advisor", kalender: "Kalender", forum: "Forum", import: "GPX importeren", openApp: "Open app" },
    hero: {
      badge: "Nieuw: tankstops & weer onderweg · AI-routebeschrijving",
      titleLead: "De",
      titleWords: ["mooiste", "spannendste", "kronkeligste", "snelste"],
      titleTailA: "route,",
      titleTailB: "in seconden.",
      sub: "Beschrijf je rit in gewone taal of sleep een GPX naar binnen. Apex Routes maakt er één vloeiende route over echte wegen van — met afslagen, hoogtemeters, tankstops en export naar elke navigatie-app.",
      start: "Start met plannen",
      importRoute: "Route importeren",
      hint: "of sleep een bestand op de pagina",
      dropTitle: "Laat je route vallen",
    },
    map: { demo: "demo · Mergelland", tryLive: "Probeer het live", tankstops: "tankstops" },
    roulette: {
      badge: "Nieuw: Route Roulette",
      titleA: "Niet kiezen.",
      titleB: "Draaien.",
      sub: "Geen idee waarheen? Kies je vervoermiddel, zet je kilometerdoel en laat het wiel beslissen. Elke draai is een echte, rijdbare route.",
      kmTarget: "Doelafstand",
      spin: "Draai mijn route",
      spinAgain: "Nog een keer draaien",
      open: "Open deze route",
      note: "Het lot kiest de regio, jij draait door tot het klikt.",
    },
    stats: { regions: "Rijdende regio's", formats: "Bestandsformaten", apps: "Navigatie-apps", cost: "Kosten voor de basis" },
    poll: {
      title: "Stem mee",
      sub: "Eén tik, direct uitslag — zo horen we wat we eerst moeten bouwen.",
      q: "Waar rij jij dit weekend heen?",
      options: ["Mergelland", "Ardennen", "Eifel", "Veluwe"],
    },
    pricing: {
      titleA: "Eerlijk",
      titleB: "freemium",
      sub: "De basis is en blijft gratis — ook zonder account. Pro? Eerste maand gratis met code APEXPROEF. Steun ons en we kopen er betere data van.",
      freeTitle: "Basis",
      freePrice: "€0",
      freeForever: "voor altijd",
      freeBullets: ["Alle regio's en vervoermiddelen", "3 AI-routes per dag", "5 exports per dag", "Routes opslaan, delen, importeren", "Tankstops, weer & hoogteprofiel"],
      suppTitle: "Supporter",
      suppPrice: "€2,99",
      suppNote: "per maand · houdt de kaart scherp",
      suppBullets: ["10 AI-routes en 15 exports per dag", "Alle badges en de Garage", "Stemrecht in nieuwe peilingen", "Je steunt betere data voor iedereen"],
      proTitle: "Apex Pro",
      proPrice: "€39",
      proNote: "per jaar · of €5,99 p/m · lifetime €99",
      proBullets: ["Onbeperkt AI-routes en exports", "PDF-routeboek (binnenkort)", "Alle Pro-features voorrang", "Geen advertenties, ooit", "Je maakt diepere route-research mogelijk"],
      popular: "POPULAIR",
      ctaFree: "Gratis beginnen",
      ctaSupporter: "Word Supporter",
      ctaPro: "Word Pro",
      supportLine: "Elke licentie steunt het inkopen van de beste kaart- en routedata — daar profiteert iedereen van mee.",
    },
    featuresTitle: "Alles voor onderweg",
    features: [
      { title: "Zeg wat je wilt rijden", desc: "\"Rondrit door Zuid-Limburg, 100 km\" — de AI-assistent snapt vrije taal, zet het om in een route over echte wegen en legt onderweg tankstops, weer en hoogtemeters naast je route." },
      { title: "Turn-by-turn uit je GPX", desc: "Sleep je track naar binnen: map matching legt hem op het wegenraster en levert echte afslaginstructies plus slimme navigatie-ankers voor Google Maps." },
      { title: "Tankstops onderweg", desc: "Alle tankstations en laadpalen binnen 2 km van je route, met weer bij vertrek." },
      { title: "Opslaan & delen", desc: "Routes blijven in je browser en een deel-link bevat de hele route — geen account, geen server." },
      { title: "Weer & hoogtemeters", desc: "Live weer bij vertrek, een hoogteprofiel naast je route en zicht op zonsondergang — alles voordat je de deur uit gaat." },
      { title: "Elke navigatie-app", desc: "Exporteer naar Google Maps, Waze of GPX met afslaginstructies voor OsmAnd, Kurviger, Calimoto, TomTom en Garmin." },
    ],
    steps: [
      { t: "Beschrijf of importeer", d: "Typ je rit in gewone taal, klik punten op de kaart of sleep een GPX/KML/TCX/FIT naar binnen." },
      { t: "Bewerk & verrijk", d: "Versleep punten, optimaliseer de volgorde, bekijk hoogtemeters, tankstops en het weer." },
      { t: "Navigeer", d: "Open in Google Maps met slimme ankers, of download GPX met afslaginstructies voor elke app." },
    ],
    footer: {
      plan: "Plannen",
      discover: "Ontdekken",
      community: "Community",
      why: "Waarom Apex",
      supportCta: "Steun de kaart",
      credits: "Kaartdata van OpenStreetMap, CARTO en Esri · weer van Open-Meteo",
      checklist: "Vertrek-checklist",
      klimmen: "Klimbibliotheek",
      adverteren: "Adverteren",
      ritten: "Ritten",
      gpx: "GPX & bestanden",
      roulette: "Route Roulette",
    },
    forumBand: {
      title: "Praathoek voor rijders, fietsers en wandelaars",
      sub: "Routes delen, apps vergelijken, foto's van je mooiste kilometers — het Apex Forum werkt zonder account en gesprekken deel je via een link.",
      cta: "Naar het forum",
    },
    rotw: { label: "Rit van de week", plan: "Plan deze rit", copied: "Gekopieerd", hotel: "Verblijf", climbs: "Klimmen onderweg", meer: "Alle ritten" },
    finalTitle: "Klaar om te rijden?",
    finalSub: "Je eerste route staat er binnen een minuut.",
    finalCta: "Nu beginnen",
    finalNature: "Geniet van de natuur en ga erop uit.",
    footerBuilt: "Gebouwd op OpenStreetMap · OSRM · Open-Meteo · Overpass — met liefde voor rijders",
  },
  en: {
    nav: { discover: "Discover routes", ritbank: "Ride bank", advisor: "Advisor", kalender: "Calendar", forum: "Forum", import: "Import GPX", openApp: "Open app" },
    hero: {
      badge: "New: fuel stops & live weather · AI route writing",
      titleLead: "The",
      titleWords: ["finest", "thrilling", "twistiest", "fastest"],
      titleTailA: "route,",
      titleTailB: "in seconds.",
      sub: "Describe your ride in plain words or drop in a GPX. Apex Routes turns it into one flowing route over real roads — with turn-by-turn, elevation, fuel stops and export to any navigation app.",
      start: "Start planning",
      importRoute: "Import a route",
      hint: "or drop a file anywhere on this page",
      dropTitle: "Drop your route",
    },
    map: { demo: "demo · Mergelland", tryLive: "Try it live", tankstops: "fuel stops" },
    roulette: {
      badge: "New: Route Roulette",
      titleA: "Don't choose.",
      titleB: "Spin.",
      sub: "No idea where to go? Pick your ride, set your distance and let the wheel decide. Every spin becomes a real, rideable route.",
      kmTarget: "Target distance",
      spin: "Spin my route",
      spinAgain: "Spin again",
      open: "Open this route",
      note: "Fate picks the region — you keep spinning until it clicks.",
    },
    stats: { regions: "Riding regions", formats: "File formats", apps: "Navigation apps", cost: "Cost for the basics" },
    poll: {
      title: "Cast your vote",
      sub: "One tap, instant results — it tells us what to build first.",
      q: "Where are you riding this weekend?",
      options: ["Mergelland", "Ardennes", "Eifel", "Veluwe"],
    },
    pricing: {
      titleA: "Fair",
      titleB: "freemium",
      sub: "The basics stay free — forever, no account needed. Try Pro free for a month with code APEXPROEF. Support us and we buy better data with it.",
      freeTitle: "Basic",
      freePrice: "€0",
      freeForever: "forever",
      freeBullets: ["All regions and vehicles", "3 AI routes per day", "5 exports per day", "Save, share and import routes", "Fuel stops, weather & elevation"],
      suppTitle: "Supporter",
      suppPrice: "€2.99",
      suppNote: "per month · keeps the map sharp",
      suppBullets: ["10 AI routes and 15 exports per day", "All badges and the Garage", "Voting rights in new polls", "You fund better data for everyone"],
      proTitle: "Apex Pro",
      proPrice: "€39",
      proNote: "per year · or €5.99/m · lifetime €99",
      proBullets: ["Unlimited AI routes and exports", "PDF route book (soon)", "Priority on all Pro features", "No ads, ever", "You enable deeper route research"],
      popular: "POPULAR",
      ctaFree: "Start free",
      ctaSupporter: "Become a Supporter",
      ctaPro: "Go Pro",
      supportLine: "Every licence funds licensing the best map and route data — everyone benefits.",
    },
    featuresTitle: "Everything for the road",
    features: [
      { title: "Say what you want to ride", desc: "\"Circular tour through South Limburg, 100 km\" — the AI assistant understands plain language and builds a route over real roads, with fuel stops, weather and elevation alongside." },
      { title: "Turn-by-turn from your GPX", desc: "Drop your track: map matching snaps it to the road network and produces real turn instructions plus smart anchors for Google Maps." },
      { title: "Fuel stops along the way", desc: "Every station and charger within 2 km of your route, with weather at departure." },
      { title: "Save & share", desc: "Routes stay in your browser and a share link contains the entire route — no account, no server." },
      { title: "Weather & elevation", desc: "Live weather at departure, an elevation profile next to your route and sunset in view — all before you head out." },
      { title: "Any navigation app", desc: "Export to Google Maps, Waze or GPX with turn instructions for OsmAnd, Kurviger, Calimoto, TomTom and Garmin." },
    ],
    steps: [
      { t: "Describe or import", d: "Type your ride in plain words, click points on the map or drop a GPX/KML/TCX/FIT file." },
      { t: "Refine & enrich", d: "Drag points, optimise the order, check elevation, fuel stops and the weather." },
      { t: "Navigate", d: "Open in Google Maps with smart anchors, or download GPX with turn instructions for any app." },
    ],
    footer: {
      plan: "Plan",
      discover: "Explore",
      community: "Community",
      why: "Why Apex",
      supportCta: "Support the map",
      credits: "Map data by OpenStreetMap, CARTO & Esri · weather by Open-Meteo",
      checklist: "Pre-ride checklist",
      klimmen: "Climb library",
      adverteren: "Advertise",
      ritten: "Rides",
      gpx: "GPX & files",
      roulette: "Route Roulette",
    },
    forumBand: {
      title: "The meeting place for riders, cyclists and hikers",
      sub: "Share routes, compare apps and show photos of your best kilometres — the Apex Forum needs no account and threads share via a simple link.",
      cta: "Open the forum",
    },
    rotw: { label: "Ride of the week", plan: "Plan this ride", copied: "Copied", hotel: "Stay", climbs: "Climbs along the way", meer: "All rides" },
    finalTitle: "Ready to ride?",
    finalSub: "Your first route is one minute away.",
    finalCta: "Begin now",
    finalNature: "Enjoy nature and get out there.",
    footerBuilt: "Built on OpenStreetMap · OSRM · Open-Meteo · Overpass — with love for riders",
  },
  fr: {
    nav: { discover: "Découvrir", ritbank: "Banque de sorties", advisor: "Conseils", kalender: "Agenda", forum: "Forum", import: "Importer GPX", openApp: "Ouvrir l'app" },
    hero: {
      badge: "Nouveau : stations-service & météo · itinéraires par IA",
      titleLead: "La",
      titleWords: ["plus belle", "plus palpitante", "plus sinueuse", "plus rapide"],
      titleTailA: "route,",
      titleTailB: "en quelques secondes.",
      sub: "Décrivez votre sortie en mots simples ou déposez un GPX. Apex Routes la transforme en un itinéraire fluide sur de vraies routes — avec instructions, dénivelé, stations-service et export vers toutes les apps de navigation.",
      start: "Commencer à planifier",
      importRoute: "Importer un itinéraire",
      hint: "ou déposez un fichier sur la page",
      dropTitle: "Déposez votre itinéraire",
    },
    map: { demo: "démo · Mergelland", tryLive: "Essayer en direct", tankstops: "stations-service" },
    roulette: {
      badge: "Nouveau : Roulette à routes",
      titleA: "Ne choisissez pas.",
      titleB: "Tournez.",
      sub: "Aucune idée où aller ? Choisissez votre monture, fixez la distance et laissez la roue décider. Chaque tour devient une vraie route.",
      kmTarget: "Distance cible",
      spin: "Tourner ma route",
      spinAgain: "Relancer",
      open: "Ouvrir cette route",
      note: "Le hasard choisit la région — vous tournez jusqu'à ce que ça clique.",
    },
    stats: { regions: "Régions à parcourir", formats: "Formats de fichiers", apps: "Apps de navigation", cost: "Coût de la base" },
    poll: {
      title: "Votez",
      sub: "Un clic, résultats immédiats — cela nous dit quoi construire en premier.",
      q: "Où roulez-vous ce week-end ?",
      options: ["Mergelland", "Ardennes", "Eifel", "Veluwe"],
    },
    pricing: {
      titleA: "Un freemium",
      titleB: "honnête",
      sub: "La base reste gratuite — pour toujours, sans compte. Premier mois de Pro gratuit avec le code APEXPROEF. Soutenez-nous et nous achetons de meilleures données.",
      freeTitle: "Base",
      freePrice: "€0",
      freeForever: "pour toujours",
      freeBullets: ["Toutes les régions et véhicules", "3 itinéraires IA par jour", "5 exports par jour", "Sauver, partager et importer", "Stations, météo & dénivelé"],
      suppTitle: "Supporter",
      suppPrice: "2,99 €",
      suppNote: "par mois · garde la carte affûtée",
      suppBullets: ["10 itinéraires IA et 15 exports par jour", "Tous les badges et le Garage", "Droit de vote aux nouveaux sondages", "Vous financez de meilleures données"],
      proTitle: "Apex Pro",
      proPrice: "39 €",
      proNote: "par an · ou 5,99 €/mois · à vie 99 €",
      proBullets: ["Itinéraires et exports illimités", "Carnet de route PDF (bientôt)", "Priorité sur les fonctions Pro", "Sans pub, jamais", "Vous permettez une recherche plus fine"],
      popular: "POPULAIRE",
      ctaFree: "Commencer gratuitement",
      ctaSupporter: "Devenir Supporter",
      ctaPro: "Passer Pro",
      supportLine: "Chaque licence finance l'achat des meilleures données cartographiques — tout le monde en profite.",
    },
    featuresTitle: "Tout pour la route",
    features: [
      { title: "Dites ce que vous voulez rouler", desc: "« Boucle dans le Sud-Limbourg, 100 km » — l'assistant IA comprend le langage courant et trace un itinéraire sur de vraies routes, avec stations, météo et dénivelé." },
      { title: "Instructions depuis votre GPX", desc: "Déposez votre trace : le map matching la colle au réseau routier et produit de vraies instructions plus des ancres intelligentes pour Google Maps." },
      { title: "Stations en route", desc: "Toutes les stations et bornes à moins de 2 km de votre itinéraire, avec la météo au départ." },
      { title: "Sauver & partager", desc: "Les sorties restent dans votre navigateur et un lien contient tout l'itinéraire — sans compte, sans serveur." },
      { title: "Météo & dénivelé", desc: "Météo live au départ, un profil de dénivelé à côté de votre itinéraire et l'heure de coucher du soleil — avant de partir." },
      { title: "Toutes les apps", desc: "Exportez vers Google Maps, Waze ou GPX avec instructions pour OsmAnd, Kurviger, Calimoto, TomTom et Garmin." },
    ],
    steps: [
      { t: "Décrire ou importer", d: "Tapez votre sortie en mots simples, cliquez des points ou déposez un GPX/KML/TCX/FIT." },
      { t: "Affiner & enrichir", d: "Déplacez des points, optimisez l'ordre, consultez dénivelé, stations et météo." },
      { t: "Naviguer", d: "Ouvrez dans Google Maps avec ancres intelligentes, ou téléchargez un GPX avec instructions." },
    ],
    footer: {
      plan: "Planifier",
      discover: "Explorer",
      community: "Communauté",
      why: "Pourquoi Apex",
      supportCta: "Soutenir la carte",
      credits: "Données cartographiques OpenStreetMap, CARTO & Esri · météo Open-Meteo",
      checklist: "Check-list de départ",
      klimmen: "Bibliothèque de cols",
      adverteren: "Publicité",
      ritten: "Sorties",
      gpx: "GPX & fichiers",
      roulette: "Route Roulette",
    },
    forumBand: {
      title: "Le lieu de rencontre des motards, cyclistes et randonneurs",
      sub: "Partagez des itinéraires, comparez les apps, montrez vos plus beaux kilomètres — le forum Apex fonctionne sans compte et se partage par lien.",
      cta: "Aller au forum",
    },
    rotw: { label: "Sortie de la semaine", plan: "Planifier", copied: "Copié", hotel: "Hébergement", climbs: "Cols en route", meer: "Toutes les sorties" },
    finalTitle: "Prêt à rouler ?",
    finalSub: "Votre première route est à une minute.",
    finalNature: "Profitez de la nature et partez sur les routes.",
    finalCta: "Commencer",
    footerBuilt: "Construit sur OpenStreetMap · OSRM · Open-Meteo · Overpass — avec passion pour les motards",
  },
  de: {
    nav: { discover: "Routen entdecken", ritbank: "Tourbank", advisor: "Berater", kalender: "Kalender", forum: "Forum", import: "GPX importieren", openApp: "App öffnen" },
    hero: {
      badge: "Neu: Tankstopps & Wetter · KI-Routenbeschreibung",
      titleLead: "Die",
      titleWords: ["schönste", "spannendste", "kurvenreichste", "schnellste"],
      titleTailA: "Route,",
      titleTailB: "in Sekunden.",
      sub: "Beschreibe deine Tour in normalen Worten oder zieh ein GPX herein. Apex Routes macht daraus eine flüssige Route über echte Straßen — mit Abbiegehinweisen, Höhenmetern, Tankstopps und Export in jede Navi-App.",
      start: "Losplanen",
      importRoute: "Route importieren",
      hint: "oder eine Datei auf die Seite ziehen",
      dropTitle: "Route hier ablegen",
    },
    map: { demo: "Demo · Mergelland", tryLive: "Live ausprobieren", tankstops: "Tankstopps" },
    roulette: {
      badge: "Neu: Routen-Roulette",
      titleA: "Nicht wählen.",
      titleB: "Drehen.",
      sub: "Keine Idee wohin? Wähle dein Fahrzeug, setze dein Kilometerziel und lass das Rad entscheiden. Jede Drehung wird eine echte, fahrbare Route.",
      kmTarget: "Zieldistanz",
      spin: "Meine Route drehen",
      spinAgain: "Nochmal drehen",
      open: "Diese Route öffnen",
      note: "Das Schicksal wählt die Region — du drehst weiter, bis es klickt.",
    },
    stats: { regions: "Fahrregionen", formats: "Dateiformate", apps: "Navi-Apps", cost: "Kosten für die Basis" },
    poll: {
      title: "Stimm ab",
      sub: "Ein Klick, sofortiges Ergebnis — so hören wir, was wir zuerst bauen sollen.",
      q: "Wohin fährst du dieses Wochenende?",
      options: ["Mergelland", "Ardennen", "Eifel", "Veluwe"],
    },
    pricing: {
      titleA: "Faires",
      titleB: "Freemium",
      sub: "Die Basis bleibt gratis — für immer, ohne Konto. Erster Pro-Monat gratis mit Code APEXPROEF. Unterstütze uns, dann kaufen wir bessere Daten davon.",
      freeTitle: "Basis",
      freePrice: "0 €",
      freeForever: "für immer",
      freeBullets: ["Alle Regionen und Fahrzeuge", "3 KI-Routen pro Tag", "5 Exporte pro Tag", "Routen speichern, teilen, importieren", "Tankstopps, Wetter & Höhenprofil"],
      suppTitle: "Supporter",
      suppPrice: "2,99 €",
      suppNote: "pro Monat · hält die Karte scharf",
      suppBullets: ["10 KI-Routen und 15 Exporte pro Tag", "Alle Abzeichen und die Garage", "Stimmrecht bei neuen Umfragen", "Du finanzierst bessere Daten für alle"],
      proTitle: "Apex Pro",
      proPrice: "39 €",
      proNote: "pro Jahr · oder 5,99 €/M · Lifetime 99 €",
      proBullets: ["Unbegrenzte KI-Routen und Exporte", "PDF-Routenbuch (bald)", "Vorrang bei allen Pro-Features", "Keine Werbung, niemals", "Du ermöglichst tiefere Routenforschung"],
      popular: "BELIEBT",
      ctaFree: "Kostenlos starten",
      ctaSupporter: "Supporter werden",
      ctaPro: "Pro werden",
      supportLine: "Jede Lizenz finanziert die besten Karten- und Routendaten — davon profitieren alle.",
    },
    featuresTitle: "Alles für unterwegs",
    features: [
      { title: "Sag, was du fahren willst", desc: "„Runde durch Südlimburg, 100 km“ — der KI-Assistent versteht normale Sprache, baut eine Route über echte Straßen und legt Tankstopps, Wetter und Höhenmeter daneben." },
      { title: "Abbiegehinweise aus deinem GPX", desc: "Track reinziehen: Map Matching legt ihn auf das Straßennetz und liefert echte Abbiegehinweise plus clevere Anker für Google Maps." },
      { title: "Tankstopps unterwegs", desc: "Alle Tankstellen und Ladepunkte innerhalb von 2 km deiner Route, mit Wetter beim Start." },
      { title: "Speichern & teilen", desc: "Routen bleiben im Browser und ein Teilen-Link enthält die ganze Route — ohne Konto, ohne Server." },
      { title: "Wetter & Höhenmeter", desc: "Live-Wetter beim Start, ein Höhenprofil neben der Route und den Sonnenuntergang im Blick — bevor du losfährst." },
      { title: "Jede Navi-App", desc: "Export nach Google Maps, Waze oder GPX mit Abbiegehinweisen für OsmAnd, Kurviger, Calimoto, TomTom und Garmin." },
    ],
    steps: [
      { t: "Beschreiben oder importieren", d: "Tippe deine Tour, klicke Punkte auf die Karte oder zieh GPX/KML/TCX/FIT herein." },
      { t: "Verfeinern & anreichern", d: "Punkte verschieben, Reihenfolge optimieren, Höhen, Tankstopps und Wetter prüfen." },
      { t: "Navigieren", d: "In Google Maps mit smarten Ankern öffnen oder GPX mit Hinweisen für jede App laden." },
    ],
    footer: {
      plan: "Planen",
      discover: "Entdecken",
      community: "Community",
      why: "Warum Apex",
      supportCta: "Unterstütze die Karte",
      credits: "Kartendaten von OpenStreetMap, CARTO & Esri · Wetter von Open-Meteo",
      checklist: "Start-Checkliste",
      klimmen: "Anstiegs-Bibliothek",
      adverteren: "Werbung",
      ritten: "Touren",
      gpx: "GPX & Dateien",
      roulette: "Route Roulette",
    },
    forumBand: {
      title: "Der Treffpunkt für Fahrer, Radler und Wanderer",
      sub: "Routen teilen, Apps vergleichen, Fotos deiner schönsten Kilometer zeigen — das Apex-Forum braucht kein Konto, Gespräche teilst du per Link.",
      cta: "Zum Forum",
    },
    rotw: { label: "Tour der Woche", plan: "Diese Tour planen", copied: "Kopiert", hotel: "Unterkunft", climbs: "Anstiege unterwegs", meer: "Alle Touren" },
    finalTitle: "Bereit zu fahren?",
    finalSub: "Deine erste Route steht in einer Minute.",
    finalNature: "Genieße die Natur und mach dich auf den Weg.",
    finalCta: "Jetzt starten",
    footerBuilt: "Gebaut auf OpenStreetMap · OSRM · Open-Meteo · Overpass — mit Liebe für Fahrer",
  },
};

/** Gedeelde strings buiten de landing. */
/** Planner-chrome: kaartstijlen, acties, samenvatting (chat-inhoud blijft NL). */
export interface PlannerStrings {
  mapDark: string;
  mapSatellite: string;
  mapTopo: string;
  optimize: string;
  reverse: string;
  closeLoop: string;
  stopsOn: string;
  stopsOff: string;
  recalc: string;
  myRoutes: string;
  save: string;
  savePlaceholder: string;
  points: string;
  turnByTurn: string;
  steps: string;
  distance: string;
  duration: string;
  winding: string;
  showMap: string;
  hideMap: string;
  weatherAt: string;
  stopsList: string;
  poiFuel: string;
  poiCharging: string;
  poiViewpoint: string;
  poiMore: string;
  loopGen: string;
  tankWarn: string;
  difficulty: string;
  diffFlat: string;
  diffRolling: string;
  diffHilly: string;
  diffMountain: string;
  variantCompare: string;
  hotelBtn: string;
  variantRide: string;
  variantAvoid: string;
  variantVia: string;
  shareImage: string;
}

export const PLANNER: Record<Lang, PlannerStrings> = {
  nl: {
    mapDark: "Kaart", mapSatellite: "Satelliet", mapTopo: "Topo",
    optimize: "Optimale volgorde", reverse: "Omkeren", closeLoop: "Sluit lus",
    stopsOn: "Stops aan", stopsOff: "Stops onderweg", recalc: "Route herberekenen",
    myRoutes: "Mijn routes /", save: "Bewaar", savePlaceholder: "Naam van deze route",
    points: "punten", turnByTurn: "Routebeschrijving", steps: "stappen",
    distance: "Afstand", duration: "Rijtijd", winding: "Slinger-score",
    showMap: "Toon op Google Maps", hideMap: "Verberg kaart", weatherAt: "bij vertrek",
    stopsList: "Stops langs de route", poiFuel: "Tanken", poiCharging: "Laden", poiViewpoint: "Uitzicht", poiMore: "en {n} meer",
    hotelBtn: "Hotel voor deze rit",
    variantCompare: "Vergelijk varianten", variantRide: "Rij variant B", variantAvoid: "vermijdt snelwegen", variantVia: "gebruikt snelwegen", shareImage: "Deel-afbeelding",
    difficulty: "Zwaarte", diffFlat: "Vlak", diffRolling: "Glooiend", diffHilly: "Heuvelachtig", diffMountain: "Bergachtig",
    loopGen: "Rondrit", tankWarn: "Tankopletten: rit van ~{km} km bij ~{range} km bereik — plan een tankstop (Stops onderweg)",
  },
  en: {
    mapDark: "Map", mapSatellite: "Satellite", mapTopo: "Topo",
    optimize: "Best order", reverse: "Reverse", closeLoop: "Close loop",
    stopsOn: "Stops on", stopsOff: "Stops along", recalc: "Recalculate",
    myRoutes: "My routes /", save: "Save", savePlaceholder: "Name this route",
    points: "points", turnByTurn: "Turn-by-turn", steps: "steps",
    distance: "Distance", duration: "Drive time", winding: "Winding score",
    showMap: "Show on Google Maps", hideMap: "Hide map", weatherAt: "at departure",
    stopsList: "Stops along the route", poiFuel: "Fuel", poiCharging: "Charging", poiViewpoint: "Viewpoint", poiMore: "and {n} more",
    hotelBtn: "Hotel for this ride",
    variantCompare: "Compare variants", variantRide: "Ride variant B", variantAvoid: "avoids highways", variantVia: "uses highways", shareImage: "Share image",
    difficulty: "Difficulty", diffFlat: "Flat", diffRolling: "Rolling", diffHilly: "Hilly", diffMountain: "Mountain",
    loopGen: "Round trip", tankWarn: "Fuel check: ~{km} km ride at ~{range} km range — plan a fuel stop (Stops along)",
  },
  fr: {
    mapDark: "Carte", mapSatellite: "Satellite", mapTopo: "Topo",
    optimize: "Ordre optimal", reverse: "Inverser", closeLoop: "Boucler",
    stopsOn: "Arrêts activés", stopsOff: "Arrêts en route", recalc: "Recalculer",
    myRoutes: "Mes itinéraires /", save: "Sauver", savePlaceholder: "Nom de cet itinéraire",
    points: "points", turnByTurn: "Feuille de route", steps: "étapes",
    distance: "Distance", duration: "Durée", winding: "Score de virages",
    showMap: "Afficher sur Google Maps", hideMap: "Masquer la carte", weatherAt: "au départ",
    stopsList: "Arrêts sur l'itinéraire", poiFuel: "Carburant", poiCharging: "Recharge", poiViewpoint: "Point de vue", poiMore: "et {n} de plus",
    hotelBtn: "Hôtel pour ce trajet",
    variantCompare: "Comparer les variantes", variantRide: "Prendre la variante B", variantAvoid: "évite les autoroutes", variantVia: "emprunte les autoroutes", shareImage: "Image de partage",
    difficulty: "Difficulté", diffFlat: "Plat", diffRolling: "Vallonné", diffHilly: "Collines", diffMountain: "Montagne",
    loopGen: "Boucle", tankWarn: "Essence : ~{km} km pour ~{range} km d'autonomie — prévoyez un arrêt (Arrêts)",
  },
  de: {
    mapDark: "Karte", mapSatellite: "Satellit", mapTopo: "Topo",
    optimize: "Beste Reihenfolge", reverse: "Umkehren", closeLoop: "Runde schließen",
    stopsOn: "Stopps an", stopsOff: "Stopps unterwegs", recalc: "Neu berechnen",
    myRoutes: "Meine Routen /", save: "Speichern", savePlaceholder: "Name dieser Route",
    points: "Punkte", turnByTurn: "Wegbeschreibung", steps: "Schritte",
    distance: "Strecke", duration: "Fahrzeit", winding: "Kurven-Score",
    showMap: "Auf Google Maps zeigen", hideMap: "Karte ausblenden", weatherAt: "bei Abfahrt",
    stopsList: "Stopps unterwegs", poiFuel: "Sprit", poiCharging: "Laden", poiViewpoint: "Aussicht", poiMore: "und {n} weitere",
    hotelBtn: "Hotel für diese Tour",
    variantCompare: "Varianten vergleichen", variantRide: "Variante B fahren", variantAvoid: "meidet Autobahnen", variantVia: "nutzt Autobahnen", shareImage: "Teilbild",
    difficulty: "Schwierigkeit", diffFlat: "Flach", diffRolling: "Wellig", diffHilly: "Hügelig", diffMountain: "Bergig",
    loopGen: "Rundtour", tankWarn: "Tankstopp: ~{km} km Fahrt bei ~{range} km Reichweite — jetzt einplanen (Stopps)",
  },
};

export const SHARED: Record<Lang, { chatPlaceholder: string; guideNote: string; langLabel: string; skip: string }> = {
  nl: { chatPlaceholder: "Typ wat je wilt rijden...", guideNote: "", langLabel: "Taal", skip: "Direct naar inhoud" },
  en: { chatPlaceholder: "Type what you want to ride...", guideNote: "This guide is Dutch-only for now — the app and map speak your language.", langLabel: "Language", skip: "Skip to content" },
  fr: { chatPlaceholder: "Écrivez la sortie souhaitée...", guideNote: "Ce guide est en néerlandais pour l'instant — l'app et la carte parlent votre langue.", langLabel: "Langue", skip: "Aller au contenu" },
  de: { chatPlaceholder: "Tippe, was du fahren willst...", guideNote: "Dieser Guide ist vorerst auf Niederländisch — App und Karte sprechen deine Sprache.", langLabel: "Sprache", skip: "Zum Inhalt springen" },
};

/** Roulette-UI per taal. */
export const ROULETTE: Record<
  Lang,
  { vehicles: string[]; kmTarget: string; spin: string; spinAgain: string; statuses: string[] }
> = {
  nl: { vehicles: ["Motor", "Auto", "Fiets", "Te voet"], kmTarget: "Doelafstand", spin: "Draai mijn route", spinAgain: "Nog een keer draaien", statuses: ["Bochten tellen…", "Cols opzoeken…", "Asfalt keuren…", "Tankstops markeren…", "Uitzichtpunt kiezen…"] },
  en: { vehicles: ["Motor", "Car", "Bike", "On foot"], kmTarget: "Target distance", spin: "Spin my route", spinAgain: "Spin again", statuses: ["Counting corners…", "Scouting cols…", "Inspecting asphalt…", "Marking fuel stops…", "Picking a viewpoint…"] },
  fr: { vehicles: ["Moto", "Voiture", "Vélo", "À pied"], kmTarget: "Distance cible", spin: "Tourner ma route", spinAgain: "Relancer", statuses: ["Comptage de virages…", "Repérage de cols…", "Contrôle de l'asphalte…", "Repérage des stations…", "Choix d'un point de vue…"] },
  de: { vehicles: ["Motorrad", "Auto", "Fahrrad", "Zu Fuß"], kmTarget: "Zieldistanz", spin: "Meine Route drehen", spinAgain: "Nochmal drehen", statuses: ["Kurven zählen…", "Pässe suchen…", "Asphalt prüfen…", "Tankstopps markieren…", "Aussichtspunkt wählen…"] },
};
