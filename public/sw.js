/**
 * Service worker voor Apex Routes.
 *
 * Bewust minimaal: de app haalt alles live op (kaarttegels, routing), dus
 * agressief cachen zou vooral verouderde routes opleveren. Wat we wél doen:
 *
 *  - de app-shell beschikbaar houden als het netwerk wegvalt;
 *  - door Next.js gehashte assets (/_next/static) cache-first serveren, die
 *    veranderen nooit onder dezelfde URL;
 *  - API-calls en kaarttegels nooit cachen — die horen vers te zijn.
 */
const VERSION = "v42";
const SHELL_CACHE = `apex-shell-${VERSION}`;
const ASSET_CACHE = `apex-assets-${VERSION}`;

const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

// directe overname als de pagina erom vraagt (update-kill-switch)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // tegels, OSRM, Nominatim
  if (url.pathname.startsWith("/api/")) return; // altijd vers

  // gehashte build-assets: veranderen nooit, dus direct uit de cache
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // paginanavigatie: netwerk eerst, cache als vangnet bij geen verbinding
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/").then((hit) => hit || Response.error()))
    );
  }
});
