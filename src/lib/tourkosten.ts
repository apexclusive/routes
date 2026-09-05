/**
 * Kostenraming voor een meerdaagse tour.
 *
 * "Een georganiseerde reis kost 4650 euro" is een abstract getal. Pas als je
 * ernaast zet wat het jou concreet kost — hotel, brandstof, tol — wordt het
 * verschil echt. Dat maakt deze rekenmodule het overtuigendste onderdeel van
 * een tourpagina, en meteen de aanleiding om het hotel te boeken.
 *
 * Alle bedragen zijn ramingen, geen offertes. Bronnen en peildatum staan in
 * BRON hieronder zodat we ze bij elke ronde kunnen herijken.
 */

import type { EventCountry } from "./calendar.ts";
import { TOURS, tourKm, type Tour } from "./tours.ts";

export const BRON =
  "Brandstofprijzen: Europese Commissie Weekly Oil Bulletin via fuel-prices.eu en independer.nl (peildatum september 2026). Hotelprijzen: gemiddelde 3-sterrenkamer voor twee personen op Booking.com in het naseizoen.";

/** Euro 95 per liter, per land. Bewust het landgemiddelde: bergdorpen zijn duurder, snelwegen ook. */
export const BENZINE_EUR_PER_LITER: Record<EventCountry, number> = {
  NL: 2.33,
  BE: 1.86,
  DE: 2.12,
  FR: 2.04,
  IT: 2.02,
  AT: 1.78,
  CH: 2.08,
  LU: 1.75,
};

export type Voertuig = "motor" | "auto" | "fiets";

/** Verbruik in liter per 100 km. Bergpassen kosten meer dan de fabrieksopgave. */
export const VERBRUIK_L_PER_100KM: Record<Voertuig, number> = {
  motor: 5.5,
  auto: 8.0,
  fiets: 0,
};

/**
 * Gemiddelde prijs van een tweepersoonskamer per nacht in het basiskamp.
 * Sleutel is de plaatsnaam zoals in tours.ts, zodat een nieuwe tour meteen
 * opvalt in de test als hier een raming ontbreekt.
 */
export const HOTEL_EUR_PER_NACHT: Record<string, number> = {
  Arabba: 150,
  Bormio: 170,
  "Zell am See": 145,
  Andermatt: 180,
  Valkenburg: 115,
  "La Roche-en-Ardenne": 95,
};

export interface Raming {
  /** hotelkosten voor de hele groep, alle nachten samen */
  hotelEur: number;
  /** brandstof voor alle dagritten samen, per voertuig */
  brandstofEur: number;
  /** tol en vignetten, eenmalig */
  tolEur: number;
  /** hotel + brandstof + tol */
  totaalEur: number;
  /** totaal gedeeld door het aantal personen */
  perPersoonEur: number;
  /** wat je bespaart t.o.v. een georganiseerde reis, per persoon */
  besparingPerPersoonEur: number;
  /** liters brandstof voor de hele tour */
  liters: number;
}

export interface RamingInvoer {
  personen: number;
  voertuig: Voertuig;
  /** eigen hotelprijs per nacht; anders de raming voor het basiskamp */
  hotelPerNachtEur?: number;
}

/** Tol en vignetten per tour, in euro voor de hele reis. */
export function tolKostenEur(t: Tour): number {
  let som = 0;
  // Grossglockner: dagtol voor de motor
  if (t.kosten.some((k) => /grossglockner/i.test(k))) som += 30;
  // Oostenrijks vignet (10-daags digitaal)
  if (t.country === "AT") som += 12;
  // Zwitsers jaarvignet, CHF 40
  if (t.country === "CH") som += 43;
  return som;
}

/**
 * Twee personen delen één kamer; bij een oneven aantal is er een kamer
 * waar iemand alleen slaapt. Dat is precies hoe een hotel het rekent.
 */
export function kamers(personen: number): number {
  return Math.ceil(Math.max(1, personen) / 2);
}

export function raamKosten(t: Tour, invoer: RamingInvoer): Raming {
  const personen = Math.max(1, Math.round(invoer.personen));
  const perNacht = invoer.hotelPerNachtEur ?? HOTEL_EUR_PER_NACHT[t.basiskamp] ?? 130;
  const hotelEur = Math.round(perNacht * t.nachten * kamers(personen));

  const km = tourKm(t);
  const liters = (km * VERBRUIK_L_PER_100KM[invoer.voertuig]) / 100;
  const prijs = BENZINE_EUR_PER_LITER[t.country] ?? 2.0;
  // motorrijders komen meestal met één machine per persoon, auto's delen
  const voertuigen = invoer.voertuig === "motor" ? personen : 1;
  const brandstofEur = Math.round(liters * prijs * voertuigen);

  const tolEur = tolKostenEur(t) * (invoer.voertuig === "fiets" ? 0 : voertuigen);
  const totaalEur = hotelEur + brandstofEur + tolEur;
  const perPersoonEur = Math.round(totaalEur / personen);

  return {
    hotelEur,
    brandstofEur,
    tolEur,
    totaalEur,
    perPersoonEur,
    besparingPerPersoonEur: Math.max(0, t.georganiseerdVanafEur - perPersoonEur),
    liters: Math.round(liters * voertuigen),
  };
}

/** Euro's netjes in het Nederlands, zonder centen. */
export function euro(bedrag: number): string {
  return `€${Math.round(bedrag).toLocaleString("nl-NL")}`;
}

/** Standaardraming (2 personen, motor) voor gebruik in metadata en tests. */
export function standaardRaming(t: Tour): Raming {
  return raamKosten(t, { personen: 2, voertuig: "motor" });
}

/** Alle tours met hun standaardbesparing, hoogste eerst. */
export function grootsteBesparingen(tours: Tour[] = TOURS) {
  return tours
    .map((t) => ({ tour: t, raming: standaardRaming(t) }))
    .sort((a, b) => b.raming.besparingPerPersoonEur - a.raming.besparingPerPersoonEur);
}
