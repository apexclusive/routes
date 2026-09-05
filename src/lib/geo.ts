/**
 * Geografische helpers voor de klim- en ritdata.
 *
 * De klimbibliotheek heeft coördinaten van elke top. Daarmee kunnen we
 * onderlinge afstanden uitrekenen, buren voorstellen ("welke cols liggen op
 * dezelfde dag te combineren?") en clusters vinden. Puur en alias-vrij zodat
 * alles buiten de browser te testen is.
 */

export interface Punt {
  lat: number;
  lon: number;
}

const AARDSTRAAL_KM = 6371;

function radialen(graden: number): number {
  return (graden * Math.PI) / 180;
}

/**
 * Hemelsbrede afstand tussen twee punten in kilometers (haversine).
 * Nauwkeurig genoeg voor "ligt dit in de buurt" — het is expliciet geen
 * routeafstand over de weg.
 */
export function afstandKm(a: Punt, b: Punt): number {
  const dLat = radialen(b.lat - a.lat);
  const dLon = radialen(b.lon - a.lon);
  const lat1 = radialen(a.lat);
  const lat2 = radialen(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * AARDSTRAAL_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Hemelsbrede afstand omgerekend naar een realistischere wegafstand.
 * In bergachtig terrein is de weg altijd langer dan de vogelvlucht; een
 * kronkelfactor van 1,4 is de gangbare vuistregel voor pasweggebied.
 */
export function wegAfstandKm(a: Punt, b: Punt, kronkelfactor = 1.4): number {
  return afstandKm(a, b) * kronkelfactor;
}

/** Sorteert kandidaten op afstand tot een punt en geeft de dichtstbijzijnde terug. */
export function dichtstbij<T extends Punt>(
  vanaf: Punt,
  kandidaten: T[],
  opties: { max?: number; binnenKm?: number } = {}
): { item: T; km: number }[] {
  const { max = 6, binnenKm = Number.POSITIVE_INFINITY } = opties;
  return kandidaten
    .map((item) => ({ item, km: afstandKm(vanaf, item) }))
    .filter((r) => r.km > 0.01 && r.km <= binnenKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, max);
}

/** Middelpunt van een reeks punten (voor kaartweergave en clusters). */
export function middelpunt(punten: Punt[]): Punt {
  if (punten.length === 0) return { lat: 0, lon: 0 };
  const som = punten.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }),
    { lat: 0, lon: 0 }
  );
  return { lat: som.lat / punten.length, lon: som.lon / punten.length };
}

/** Kleinste rechthoek om een reeks punten heen. */
export function boundingBox(punten: Punt[]): {
  noord: number;
  zuid: number;
  oost: number;
  west: number;
} | null {
  if (punten.length === 0) return null;
  return punten.reduce(
    (b, p) => ({
      noord: Math.max(b.noord, p.lat),
      zuid: Math.min(b.zuid, p.lat),
      oost: Math.max(b.oost, p.lon),
      west: Math.min(b.west, p.lon),
    }),
    { noord: -90, zuid: 90, oost: -180, west: 180 }
  );
}

/**
 * Nederlandse omschrijving van een afstand — "op 12 km" leest prettiger dan
 * een kaal getal, en onder de kilometer schakelen we over op meters.
 */
export function afstandLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

/**
 * Groepeert punten die binnen `straalKm` van elkaar liggen tot clusters.
 * Eenvoudige greedy-clustering: genoeg om "de Dolomieten" van "Zuid-Limburg"
 * te scheiden zonder een volledige k-means-implementatie.
 */
export function clusters<T extends Punt>(items: T[], straalKm: number): T[][] {
  const over = [...items];
  const uit: T[][] = [];
  while (over.length > 0) {
    const zaad = over.shift() as T;
    const groep = [zaad];
    for (let i = over.length - 1; i >= 0; i -= 1) {
      if (afstandKm(zaad, over[i]) <= straalKm) {
        groep.unshift(over[i]);
        over.splice(i, 1);
      }
    }
    uit.push(groep);
  }
  return uit.sort((a, b) => b.length - a.length);
}
