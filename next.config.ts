import type { NextConfig } from "next";

/**
 * Beveiligingsheaders. Bewust géén X-Frame-Options / frame-ancestors: de app
 * wordt in previews en demo's in een iframe getoond, en de kaart embedt zelf
 * ook een Google Maps-iframe.
 *
 * geolocation blijft toegestaan voor de eigen origin — de wizard gebruikt
 * "vanaf mijn locatie". De rest zetten we uit.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // moderne formaten eerst: scherper bij kleinere bestanden
    formats: ["image/avif", "image/webp"],
  },
  // verklapt onnodig welke server erachter zit
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // de service worker mag niet blijven hangen na een deploy
        source: "/sw.js",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
