export type MapStyle = "dark" | "satellite" | "topo";

export interface MapTileSource {
  url: string;
  attribution: string;
  maxZoom: number;
  className?: string;
}

const STREET_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, USGS, Intermap, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, GIS User Community';

const TOPO_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const IMAGERY_ATTRIBUTION =
  'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Vantor, Earthstar Geographics, GIS User Community';

/**
 * Centrale kaartconfiguratie voor zowel de homepage als de planner.
 *
 * De publieke CARTO-rasterlaag is bewust verwijderd: die kan een HTTP 200-tegel
 * met “API KEY REQUIRED” teruggeven, waardoor Leaflet geen tileerror ziet. De
 * openbare ArcGIS MapServer-tegels hieronder leveren echte 256px-kaarttegels
 * zonder een sleutel in browsercode. De donkere stijl ontstaat lokaal met CSS.
 */
export const MAP_TILE_SOURCES: Record<MapStyle, MapTileSource> = {
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: STREET_ATTRIBUTION,
    maxZoom: 19,
    className: "apex-dark-tiles",
  },
  topo: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: TOPO_ATTRIBUTION,
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: IMAGERY_ATTRIBUTION,
    maxZoom: 19,
  },
};

/** Een leesbare kaart als vangnet, zonder terug te vallen op de defecte bron. */
export function fallbackMapStyle(style: MapStyle): MapStyle {
  return style === "topo" ? "dark" : "topo";
}
