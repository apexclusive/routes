/**
 * Bestandsherkenning voor route-import (GPX, KML, TCX, GeoJSON, FIT).
 * Bewust alias-vrij gehouden zodat ook node --test erbij kan.
 */

/** Bestandstypes die geïmporteerd kunnen worden (voor <input accept> en checks). */
export const ROUTE_FILE_EXTENSIONS = [
  ".gpx",
  ".kml",
  ".tcx",
  ".geojson",
  ".json",
  ".xml",
  ".fit",
];

export function isRouteFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return ROUTE_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
