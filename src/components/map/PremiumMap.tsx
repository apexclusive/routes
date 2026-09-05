"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Coordinates, Waypoint, GeoJSON } from "@/types";
import { RoutePoi, poiIcon } from "@/lib/pois";
import {
  fallbackMapStyle,
  MAP_TILE_SOURCES,
  type MapStyle,
  type MapTileSource,
} from "@/lib/maptiles";

interface PremiumMapProps {
  waypoints: Waypoint[];
  routeGeometry?: GeoJSON.LineString;
  onMapClick?: (coords: Coordinates) => void;
  onWaypointDrag?: (waypoint: Waypoint, coords: Coordinates) => void;
  interactive?: boolean;
  /** kaartstijl: donker (standaard), satelliet of topografisch met hoogtelijnen */
  mapStyle?: MapStyle;
  className?: string;
  /**
   * Punt waar de kaart naartoe vliegt, met een korte pulse. De `key` maakt
   * herhaald aanklikken van hetzelfde punt mogelijk.
   */
  focusPoint?: { coordinates: Coordinates; key: number } | null;
  /** Navigatie-ankers van een geïmporteerde route: genummerde stipjes. */
  anchors?: Coordinates[];
  /** POI's langs de route (tankstation/laadpaal): emoji-markers met popup. */
  pois?: RoutePoi[];
  /** Demo-rit: rijdende marker (rotatie in graden) die de camera volgt. */
  rideMarker?: { lat: number; lng: number; bearing: number; active: boolean } | null;
}

function createTileLayer(source: MapTileSource): L.TileLayer {
  return L.tileLayer(source.url, {
    maxZoom: source.maxZoom,
    attribution: source.attribution,
    className: source.className,
    crossOrigin: true,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


/**
 * Leaflet tekent op canvas/SVG buiten de CSS-cascade om, dus daar moeten we
 * de themakleur zelf uitlezen in plaats van een var() mee te geven.
 */
function themaKleur(naam: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(naam).trim();
  return v || fallback;
}

export default function PremiumMap({
  waypoints,
  routeGeometry,
  onMapClick,
  onWaypointDrag,
  interactive = true,
  mapStyle = "dark",
  className = "",
  focusPoint = null,
  anchors,
  pois,
  rideMarker = null,
}: PremiumMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeCasingRef = useRef<L.Polyline | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const anchorLayerRef = useRef<L.LayerGroup | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const focusMarkerRef = useRef<L.Marker | null>(null);
  const rideMarkerRef = useRef<L.Marker | null>(null);
  const rideFollowRef = useRef(0); // laatste camera-update (throttle)
  const lastFitKeyRef = useRef<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // altijd-verse callbacks: voorkomt stale closures in de eenmalige map-init
  const onMapClickRef = useRef(onMapClick);
  const onWaypointDragRef = useRef(onWaypointDrag);
  const interactiveRef = useRef(interactive);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onWaypointDragRef.current = onWaypointDrag;
    interactiveRef.current = interactive;
  });

  const createCustomIcon = (index: number, isEndpoint: boolean) => {
    const accent = themaKleur("--accent", "#ffe600");
    const color = isEndpoint ? (index === 0 ? accent : themaKleur("--text-strong", "#ffffff")) : accent;
    const size = isEndpoint ? 16 : 13;

    return L.divIcon({
      className: "custom-map-marker",
      html: `
        <div class="relative">
          <div class="absolute -inset-2 rounded-full blur-md animate-pulse" style="background: ${
            isEndpoint
              ? index === 0
                ? "radial-gradient(circle, rgba(255,230,0,.45), transparent 70%)"
                : "radial-gradient(circle, rgba(255,255,255,.45), transparent 70%)"
              : "radial-gradient(circle, rgba(255,230,0,.35), transparent 70%)"
          }"></div>
          <div class="relative rounded-full border-2 border-white shadow-lg" style="background-color: ${color}; width: ${size}px; height: ${size}px;"></div>
          ${!isEndpoint ? `<div class="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" style="animation-duration: 2s;"></div>` : ""}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // init
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [50.85, 5.7],
      zoom: 8,
      zoomControl: false,
      attributionControl: false, // we voegen zelf één control toe (geen duplicaten)
    });

    tileLayerRef.current = createTileLayer(MAP_TILE_SOURCES.dark).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (interactiveRef.current && onMapClickRef.current) {
        onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;
    setIsLoaded(true);

    // houd de kaart correct wanneer de container van formaat verandert
    // (bv. als de chat-sidebar in-/uitklapt)
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setIsLoaded(false);
    };
  }, []);

  // kaartstijl-wissel + automatische fallback als een tegelprovider blokkeert
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    const layer = createTileLayer(MAP_TILE_SOURCES[mapStyle]).addTo(map);
    tileLayerRef.current = layer;

    // Na vier echte netwerkfouten schakelen we naar een tweede, leesbare
    // ArcGIS-laag. De oude CARTO-bron komt nergens meer in de keten voor.
    let errors = 0;
    const onTileError = () => {
      errors += 1;
      if (errors < 4 || tileLayerRef.current !== layer) return;

      map.removeLayer(layer);
      const fallback = MAP_TILE_SOURCES[fallbackMapStyle(mapStyle)];
      tileLayerRef.current = createTileLayer(fallback).addTo(map);
    };
    layer.on("tileerror", onTileError);

    // Route (overlayPane) en markers (markerPane) renderen vanzelf boven de
    // tilePane; ook na een fallback blijft de gele route dus zichtbaar.
    return () => {
      layer.off("tileerror", onTileError);
    };
  }, [mapStyle, isLoaded]);

  // route geometry (donkere casing + gele lijn erbovenop)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (routeCasingRef.current) {
      map.removeLayer(routeCasingRef.current);
      routeCasingRef.current = null;
    }
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeGeometry && routeGeometry.coordinates.length > 1) {
      const latLngs: L.LatLngExpression[] = routeGeometry.coordinates.map(
        (c: GeoJSON.Position) => [c[1], c[0]]
      );

      routeCasingRef.current = L.polyline(latLngs, {
        color: "#050507",
        weight: 9,
        opacity: 0.75,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routeLayerRef.current = L.polyline(latLngs, {
        color: themaKleur("--accent", "#ffe600"),
        weight: 5,
        opacity: 0.98,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
    }
  }, [routeGeometry, isLoaded]);

  // markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current.clear();

    waypoints.forEach((waypoint, index) => {
      const isEndpoint = index === 0 || index === waypoints.length - 1;
      const marker = L.marker([waypoint.coordinates.lat, waypoint.coordinates.lng], {
        icon: createCustomIcon(index, isEndpoint),
        draggable: interactive && onWaypointDrag !== undefined,
      });

      marker.bindPopup(
        `<div class="p-1"><div class="font-semibold text-slate-900">${index + 1}. ${escapeHtml(
          waypoint.name
        )}</div>${
          waypoint.description
            ? `<div class="text-xs text-slate-500 mt-1">${escapeHtml(waypoint.description)}</div>`
            : ""
        }</div>`,
        { className: "custom-popup" }
      );

      marker.on("dragend", (e) => {
        const target = e.target as L.Marker;
        const p = target.getLatLng();
        if (interactiveRef.current && onWaypointDragRef.current) {
          onWaypointDragRef.current(waypoint, { lat: p.lat, lng: p.lng });
        }
      });

      marker.addTo(map);
      markersRef.current.set(waypoint.id, marker);
    });
  }, [waypoints, interactive, onWaypointDrag, isLoaded]);

  // navigatie-ankers: genummerde stipjes op de routelijn
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (anchorLayerRef.current) {
      map.removeLayer(anchorLayerRef.current);
      anchorLayerRef.current = null;
    }
    if (!anchors || anchors.length === 0) return;

    const group = L.layerGroup();
    anchors.forEach((c, i) => {
      // start en eind hebben al een gewone marker
      if (i === 0 || i === anchors.length - 1) return;
      const icon = L.divIcon({
        className: "apex-anchor-marker",
        html: `<div class="apex-anchor">${i}</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([c.lat, c.lng], { icon, interactive: true, keyboard: false })
        .bindTooltip(`Navigatie-anker ${i}`, { direction: "top", offset: [0, -8] })
        .addTo(group);
    });

    group.addTo(map);
    anchorLayerRef.current = group;
  }, [anchors, isLoaded]);

  // POI's langs de route (tankstations/laadpalen)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (poiLayerRef.current) {
      map.removeLayer(poiLayerRef.current);
      poiLayerRef.current = null;
    }
    if (!pois || pois.length === 0) return;

    const group = L.layerGroup();
    pois.forEach((poi) => {
      const icon = L.divIcon({
        className: "apex-poi-marker",
        html: `<div class="apex-poi">${poiIcon(poi.kind)}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([poi.lat, poi.lng], { icon, keyboard: false })
        .bindPopup(
          `<div class="p-1"><div class="font-semibold text-slate-900">${escapeHtml(
            poi.name
          )}</div><div class="text-xs text-slate-500 mt-0.5">${poiIcon(
            poi.kind
          )} ${poi.distanceM} m van de route</div></div>`,
          { className: "custom-popup" }
        )
        .addTo(group);
    });

    group.addTo(map);
    poiLayerRef.current = group;
  }, [pois, isLoaded]);

  // routebeschrijving → kaart: naar de aangeklikte afslag vliegen
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded || !focusPoint) return;

    const { lat, lng } = focusPoint.coordinates;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.8 });

    if (focusMarkerRef.current) {
      map.removeLayer(focusMarkerRef.current);
      focusMarkerRef.current = null;
    }

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "apex-focus-marker",
        html: `<div class="apex-focus"><span></span></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(map);
    focusMarkerRef.current = marker;

    // de pulse is een aanwijzing, geen blijvende laag
    const timer = window.setTimeout(() => {
      if (focusMarkerRef.current === marker) {
        map.removeLayer(marker);
        focusMarkerRef.current = null;
      }
    }, 4000);

    return () => {
      window.clearTimeout(timer);
      if (focusMarkerRef.current === marker) {
        map.removeLayer(marker);
        focusMarkerRef.current = null;
      }
    };
  }, [focusPoint, isLoaded]);

  // auto-fit: alléén wanneer de route-eindpunten veranderen (niet bij het
  // verslepen van een marker, want dan wil de gebruiker de viewport houden)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    const fitKey = `${waypoints.length}:${waypoints[0]?.id ?? "-"}:${
      waypoints[waypoints.length - 1]?.id ?? "-"
    }`;
    if (fitKey === lastFitKeyRef.current) return;
    lastFitKeyRef.current = fitKey;

    if (routeLayerRef.current) {
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
    } else if (waypoints.length > 0) {
      const coords = waypoints.map(
        (w) => [w.coordinates.lat, w.coordinates.lng] as L.LatLngExpression
      );
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
    }
  }, [waypoints, routeGeometry, isLoaded]);

  // demo-rit: rijdende marker + camera die hem volgt (ge-throttled)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (!rideMarker || !rideMarker.active) {
      if (rideMarkerRef.current) {
        map.removeLayer(rideMarkerRef.current);
        rideMarkerRef.current = null;
      }
      return;
    }

    const html = `<div class="apex-ride-dot"><span class="apex-ride-arrow" style="transform: rotate(${rideMarker.bearing}deg)">▲</span></div>`;
    if (!rideMarkerRef.current) {
      rideMarkerRef.current = L.marker([rideMarker.lat, rideMarker.lng], {
        icon: L.divIcon({
          className: "custom-map-marker",
          html,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      rideMarkerRef.current.setLatLng([rideMarker.lat, rideMarker.lng]);
      const el = rideMarkerRef.current.getElement()?.querySelector(".apex-ride-arrow");
      if (el) (el as HTMLElement).style.transform = `rotate(${rideMarker.bearing}deg)`;
    }

    // camera volgt ~3× per seconde: soepel genoeg, licht op de cpu
    const now = performance.now();
    if (now - rideFollowRef.current > 350) {
      rideFollowRef.current = now;
      map.setView([rideMarker.lat, rideMarker.lng], map.getZoom(), { animate: false });
    }
  }, [rideMarker, isLoaded]);

  return (
    <div className={`${className} isolate`}>
      <div ref={mapRef} className="w-full h-full" />

      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Kaart laden...</p>
          </div>
        </div>
      )}

      {waypoints.length > 0 && (
        <div className="absolute top-4 left-4 glass rounded px-3 py-2 shadow-xl relative z-[600]">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-slate-900" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-slate-900" />
              <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-900" />
            </div>
            <span className="text-sm text-white font-medium">
              {waypoints.length} punten
            </span>
          </div>
        </div>
      )}

      {interactive && waypoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none relative z-[600]">
          <div className="glass rounded p-6 text-center max-w-sm pointer-events-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Klik om toe te voegen</h3>
            <p className="text-sm text-slate-400">
              Klik op de kaart om routepunten toe te voegen, of typ hieronder wat je
              wilt rijden
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
