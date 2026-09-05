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
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  },
];

function plausibleOrigin(): string {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || "https://plausible.io/js/script.js"
    ).origin;
  } catch {
    return "https://plausible.io";
  }
}

const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${plausibleOrigin()}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://server.arcgisonline.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${plausibleOrigin()}${isDev ? " ws: wss:" : ""}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

securityHeaders.push({ key: "Content-Security-Policy", value: csp });

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
        source: "/",
        has: [{ type: "query", key: "plan" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        has: [{ type: "query", key: "billing" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
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
