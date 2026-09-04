/**
 * Klimbibliotheek: de beklimmingen van de Benelux en grensstreek met
 * indicatieve statistieken. Cijfers zijn afgerond en gemarkeerd als indicatief
 * (bronnen: wielerflits, fiets.nl, climbfinder) — het bord ter plekke telt.
 */

import type { EventCountry } from "./calendar.ts";

export type { EventCountry } from "./calendar.ts";

export type Surface = "asfalt" | "kassei" | "keien";

export interface Climb {
  id: string;
  name: string;
  country: EventCountry;
  place: string;
  /** lengte in meters (indicatief) */
  lengthM: number;
  /** gemiddeld stijgingspercentage (indicatief) */
  avgPct: number;
  /** steilste stuk (indicatief) */
  maxPct: number;
  /** hoogteverschil in meters (indicatief) */
  elevationM: number;
  surface: Surface;
  /** openingsperiode, indicatief */
  seizoen?: string,
  note: string;
  /** kant-en-klare zin voor de route-assistent */
  prompt: string;
}

export const CLIMBS: Climb[] = [
  { id: "cauberg", name: "Cauberg", country: "NL", place: "Valkenburg", lengthM: 785, avgPct: 7.8, maxPct: 13.2, elevationM: 58, surface: "asfalt", seizoen: "hele jaar — in de winter soms glad", note: "De bekendste klim van Nederland: Amstel Gold Race-decidé, zwaarste 150 meter aan 13%.", prompt: "Bouw een fiets- of motorrondrit vanaf Valkenburg over de Cauberg, zo'n 60 km, mooie wegen" },
  { id: "camerig", name: "Camerig", country: "NL", place: "Epen", lengthM: 4400, avgPct: 5, maxPct: 12, elevationM: 165, surface: "asfalt", seizoen: "hele jaar — in de winter soms glad", note: "Langste en volgens velen mooiste klim van het land, met vergezicht over het Geuldal.", prompt: "Plan een rit door Zuid-Limburg over de Camerig bij Epen, ongeveer 80 km" },
  { id: "kromhagerweg", name: "Kromhagerweg", country: "NL", place: "Epen", lengthM: 700, avgPct: 9.5, maxPct: 11.1, elevationM: 60, surface: "asfalt", seizoen: "hele jaar — in de winter soms glad", note: "Korte maar gemene muur in de streek van de Camerig — echt benenwerk.", prompt: "Rondrit Zuid-Limburg met de Kromhagerweg bij Epen erin, 70 km" },
  { id: "loorberg", name: "Loorberg", country: "NL", place: "Slenaken", lengthM: 900, avgPct: 9, maxPct: 17, surface: "asfalt", seizoen: "hele jaar — in de winter soms glad", elevationM: 70, note: "Steile beklimming naar Slenaken; de combinatie met de Camerig is een klassieker.", prompt: "Fietsrit over de Loorberg en de Camerig, start in Gulpen, 75 km" },
  { id: "eyserbosweg", name: "Eyserbosweg", country: "NL", place: "Eys", lengthM: 900, avgPct: 9, maxPct: 16, surface: "keien", seizoen: "hele jaar — keien glad na regen", elevationM: 70, note: "Keien uit 1948 in het Limburgse heuvelland — Amstel Gold Race-terrein.", prompt: "Motor- of fietstocht langs de Eyserbosweg bij Eys, 70 km rondrit" },
  { id: "vaalserberg", name: "Vaalserberg", country: "NL", place: "Vaals", lengthM: 2500, avgPct: 4, maxPct: 8, elevationM: 90, surface: "asfalt", seizoen: "hele jaar — in de winter soms glad", note: "Het hoogste punt van Nederland (322 m) met drielandenpunt bovenop.", prompt: "Rondrit naar de Vaalserberg en het drielandenpunt, 65 km" },
  { id: "bemelerberg", name: "Bemelerberg", country: "NL", place: "Bemelen", lengthM: 650, avgPct: 5, maxPct: 9, elevationM: 35, surface: "asfalt", seizoen: "hele jaar — in de winter soms glad", note: "Korte klim tussen de witte wallen van de Bemelerberg: ideaal als opwarmer.", prompt: "Rit door het Bemelerheuvelland over de Bemelerberg, 55 km" },

  { id: "muur-geraardsbergen", name: "Muur van Geraardsbergen", country: "BE", place: "Geraardsbergen", lengthM: 475, avgPct: 9.7, maxPct: 16, elevationM: 45, surface: "kassei", seizoen: "hele jaar — kasseien het best bij droog weer", note: "De Muur van de Ronde: kassei, kapel en een steile muur die Vlaanderen definieert.", prompt: "Motorrit naar de Muur van Geraardsbergen en door de Vlaamse Ardennen, 120 km" },
  { id: "koppenberg", name: "Koppenberg", country: "BE", place: "Oudenaarde", lengthM: 600, avgPct: 11.6, maxPct: 22, elevationM: 64, surface: "kassei", seizoen: "hele jaar — kasseien het best bij droog weer", note: "De beruchtste kasseiklim van de Ronde: tot 22% over losse stenen.", prompt: "Ronde van Vlaanderen-rit over de Koppenberg en Paterberg vanaf Oudenaarde, 100 km" },
  { id: "paterberg", name: "Paterberg", country: "BE", place: "Kluisbergen", lengthM: 360, avgPct: 12.9, maxPct: 20, elevationM: 46, surface: "kassei", seizoen: "hele jaar — kasseien het best bij droog weer", note: "Korte, explosieve kasseiklim (gem. bijna 13%) in de Ronde van Vlaanderen.", prompt: "Vlaamse Ardennen-motorrit met de Paterberg en de Oude Kwaremont, 110 km" },
  { id: "la-redoute", name: "La Redoute", country: "BE", place: "Aywaille", lengthM: 1700, avgPct: 7.4, maxPct: 17, elevationM: 120, surface: "asfalt", seizoen: "hele jaar — in de winter kan sneeuw liggen", note: "De beslissende klim van Luik-Bastenaken-Luik: steilste stuk op de plated sections.", prompt: "Ardennen-motorrit over La Redoute bij Aywaille, 140 km" },
  { id: "col-du-rosier", name: "Col du Rosier", country: "BE", place: "Spa → Francorchamps", lengthM: 4400, avgPct: 5, maxPct: 9, elevationM: 215, surface: "asfalt", seizoen: "hele jaar — in de winter kan sneeuw liggen", note: "De langste beklimming van Wallonië, richting de streek van Spa-Francorchamps.", prompt: "Rit door de Ardennen over de Col du Rosier richting Spa, 150 km" },
  { id: "baraque-fraiture", name: "Baraque de Fraiture", country: "BE", place: "Vielsalm", lengthM: 3500, avgPct: 4.5, maxPct: 8, elevationM: 160, surface: "asfalt", seizoen: "hele jaar — in de winter kan sneeuw liggen", note: "Hoogste punt van de Belgische wegen (652 m) — in de winter sneeuwzeker.", prompt: "Rit naar de Baraque de Fraiture, hoogste punt van België, 160 km" },

  { id: "schauinsland", name: "Schauinsland", country: "DE", place: "Freiburg im Breisgau", lengthM: 11500, avgPct: 6.6, maxPct: 12, elevationM: 760, surface: "asfalt", seizoen: "hele jaar — sneeuw mogelijk in de winter", note: "Legendarische Zwarte Woud-klim (11,5 km): het doel van elke Zuid-Duitse klimrit.", prompt: "Zwarte Woud-motorrit over de Schauinsland bij Freiburg, 200 km" },
  { id: "alpe-huez", name: "Alpe d'Huez", country: "FR", place: "Bourg d'Oisans", lengthM: 13800, avgPct: 8.1, maxPct: 13, elevationM: 1135, surface: "asfalt", seizoen: "hele jaar — de weg naar het skigebied wordt sneeuwvrij gehouden", note: "De beroemdste klim ter wereld: 21 genummerde haarspelden, gemiddeld 8,1% over 13,8 km.", prompt: "Motorrit door de Franse Alpen met de Alpe d'Huez en de Col du Galibier, 180 km" },
  { id: "galibier", name: "Col du Galibier", country: "FR", place: "Valloire", lengthM: 17000, avgPct: 6.9, maxPct: 10.5, elevationM: 1185, surface: "asfalt", seizoen: "ca. juni–okt (wintergesloten)", note: "Mythische Tour-col op 2642 m; de tunnel dateert uit 1891, de topweg van 1976.", prompt: "Alpenrit over de Col du Galibier vanaf Valloire en door de Maurienne, 200 km" },
  { id: "tourmalet", name: "Col du Tourmalet", country: "FR", place: "Sainte-Marie-de-Campan", lengthM: 17200, avgPct: 7.4, maxPct: 10.2, elevationM: 1268, surface: "asfalt", seizoen: "ca. eind mei–okt (wintergesloten)", note: "De meest bereden col van de Tour (top 2115 m), met het Lacquet-plateau als beloning.", prompt: "Pyreneeën- of Alpenmix: rit over de Col du Tourmalet vanaf Sainte-Marie-de-Campan, 160 km" },
  { id: "izoard", name: "Col d'Izoard", country: "FR", place: "Briançon", lengthM: 14100, avgPct: 7.1, maxPct: 9.5, elevationM: 1001, surface: "asfalt", seizoen: "ca. mei–okt (wintergesloten)", note: "Casse Déserte boven de boomgrens: maanlandschap en Roubaix-herinneringen van Coppi en Bobet.", prompt: "Rit vanaf Briançon over de Col d'Izoard, 150 km" },
  { id: "stelvio", name: "Passo dello Stelvio", country: "IT", place: "Prato allo Stelvio", lengthM: 24700, avgPct: 7.1, maxPct: 12, elevationM: 1848, surface: "asfalt", seizoen: "ca. mei–nov, weer-afhankelijk (wintergesloten)", note: "48 haarspelden naar 2757 m vanaf Prato — de heilige graal voor elke motorrijder (zomer geopend).", prompt: "Motorweekend Stelvio: de zuidzijde vanaf Prato en terug over de Umbrailpas, 220 km" },
  { id: "mortirolo", name: "Mortirolo", country: "IT", place: "Mazzo in Valtellina", lengthM: 12400, avgPct: 10.4, maxPct: 18, elevationM: 1300, surface: "asfalt", seizoen: "ca. apr–okt (wintergesloten)", note: "Brutale klim uit de Giro (gem. 10,4%); het monument van Marco Pantani staat op de top.", prompt: "Fiets- of motorrit over de Mortirolo en door de Valtellina, 140 km" },
  { id: "furkapass", name: "Furkapass", country: "CH", place: "Andermatt", lengthM: 12800, avgPct: 7.7, maxPct: 11, elevationM: 949, surface: "asfalt", seizoen: "ca. jun–okt (wintergesloten; in de winter autotrein door de tunnel)", note: "James Bond-haarspelden (Goldfinger) naar 2436 m; sluit aan op Grimsel en Susten voor de drie-passen-rit.", prompt: "Zwitserse drie-passenrit: Furka, Grimsel en Susten vanuit Andermatt, 190 km" },
  { id: "grossglockner", name: "Grossglockner Hochalpenstrasse", country: "AT", place: "Ferleiten", lengthM: 22000, avgPct: 7, maxPct: 12, elevationM: 1500, surface: "asfalt", seizoen: "ca. mei–begin nov (tolweg, wintergesloten)", note: "Oostenrijks hoogalpijnen meesterwerk naar 2504 m (tolweg, marmotten en gletsjerzicht).", prompt: "Oostenrijk-rit over de Grossglockner Hochalpenstrasse, 180 km, tolweg" },
  { id: "timmelsjoch", name: "Timmelsjoch", country: "AT", place: "Ötztal", lengthM: 29000, avgPct: 7.1, maxPct: 13, elevationM: 2029, surface: "asfalt", seizoen: "ca. jun–okt (tolweg, wintergesloten)", note: "29 km naar 2509 m aan de Italiaanse grens (tolweg); het mooiste hoogtemuseum staat langs de weg.", prompt: "Alpenrit over het Timmelsjoch vanaf het Ötztal naar Zuid-Tirol, 210 km, tolweg" },
  { id: "madeleine", name: "Col de la Madeleine", country: "FR", place: "La Chambre", lengthM: 15300, avgPct: 7.3, maxPct: 10, elevationM: 1120, surface: "asfalt", seizoen: "ca. mei–okt (wintergesloten)", note: "Klassieker tussen Maurienne en Tarentaise met uitzicht op de Belledonne-kam.", prompt: "Alpenrit over de Col de la Madeleine en de Col de l'Iseran, 200 km" },

  { id: "oude-kwaremont", name: "Oude Kwaremont", country: "BE", place: "Kluisbergen", lengthM: 2200, avgPct: 4.2, maxPct: 11, elevationM: 93, surface: "kassei", seizoen: "hele jaar — kasseien het best bij droog weer", note: "2600 m totale klim, waarvan 1000 m Vlaamse kassei: de langste kasseistrook van de Ronde.", prompt: "Ronde van Vlaanderen-rit over de Oude Kwaremont en Koppenberg, 110 km" },
  { id: "taaienberg", name: "Taaienberg", country: "BE", place: "Munkzwalm", lengthM: 800, avgPct: 6.2, maxPct: 13, elevationM: 50, surface: "kassei", seizoen: "hele jaar — kasseien het best bij droog weer", note: "De favoriete aanvalsheuvel van de Ronde: Boonen en Cancellara maakten hier geschiedenis.", prompt: "Vlaamse Ardennen-rit met de Taaienberg en de Muur van Geraardsbergen, 100 km" },
  { id: "kruisberg", name: "Kruisberg", country: "BE", place: "Ronse", lengthM: 2400, avgPct: 4.8, maxPct: 9, elevationM: 110, surface: "asfalt", seizoen: "hele jaar — kasseien het best bij droog weer", note: "Asfalten beklimming bij Ronse, vaste gast tussen Kwaremont en Paterberg in de Ronde.", prompt: "Ronde van Vlaanderen-motorroute met de Kruisberg en de Oude Kwaremont, 120 km" },
  { id: "feldberg", name: "Feldberg (Schwarzwald)", country: "DE", place: "Todtnau", lengthM: 9200, avgPct: 6, maxPct: 10, elevationM: 570, surface: "asfalt", seizoen: "hele jaar — sneeuw mogelijk in de winter", note: "Naar het dak van het Zwarte Woud (1277 m); Schwarzwaldhochstraße sluit aan.", prompt: "Rit over de Feldberg en de Schwarzwaldhochstraße, 220 km" },
];
