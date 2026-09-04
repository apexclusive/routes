"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Live kaartpaneel voor de landing: donkere OSM-tegels met een geanimeerde
 * demoroute (Mergelland-vorm) als vloeiende beweging-stippellijn. Niet
 * interactief — de echte kaart wacht in de app.
 */

// Mergelland- vorm: Maastricht → Eijsden → Slenaken → Gulpen → Valkenburg → terug
const PLACES: [number, number][] = [
  [50.8511, 5.6909],
  [50.8132, 5.7256],
  [50.7781, 5.7219],
  [50.7553, 5.833],
  [50.813, 5.8893],
  [50.8644, 5.833],
  [50.8511, 5.6909],
];

/** Catmull-Rom-spline door de plaatsen: organisch kronkelende lus. */
function smoothPath(points: [number, number][], segments = 12): [number, number][] {
  const n = points.length;
  const out: [number, number][] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    for (let t = 0; t < segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;
      out.push([
        0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * s +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3),
        0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * s +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3),
      ]);
    }
  }
  out.push(points[n - 1]);
  return out;
}

export default function LandingMap({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [50.81, 5.78],
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    L.control
      .attribution({ position: "bottomright", prefix: false })
      .addTo(map);

    const path = smoothPath(PLACES);
    const latLngs = path.map((p) => [p[0], p[1]]) as L.LatLngExpression[];

    // onderlaag: zachte donkere casing
    L.polyline(latLngs, {
      color: "#050507",
      weight: 10,
      opacity: 0.8,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // geanimeerde gele route (marcherende streepjes = beweging)
    L.polyline(latLngs, {
      color: "#ffe600",
      weight: 4.5,
      opacity: 0.98,
      lineCap: "round",
      lineJoin: "round",
      className: "apex-demo-route",
    }).addTo(map);

    // start/eind-marker
    const dot = (label: string) =>
      L.divIcon({
        className: "custom-map-marker",
        html: `<div class="apex-demo-dot">${label}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
    L.marker(PLACES[0], { icon: dot("A"), interactive: false, keyboard: false }).addTo(map);
    L.marker(
      { lat: PLACES[4][0], lng: PLACES[4][1] },
      { icon: dot("B"), interactive: false, keyboard: false }
    ).addTo(map);

    map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
