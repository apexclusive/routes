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
const VERSION = "v44";
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
            if (response.ok && response.type === "basic") {
              const copy = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Paginanavigatie: netwerk eerst, exact dezelfde pagina als offline-fallback.
  // Schrijf een subpagina nooit onder `/` weg — anders kon een bezoek aan
  // /kalender de offline homepage per ongeluk vervangen.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Querylinks kunnen routeplannen, campagnecodes of billing-status
          // bevatten. Bewaar die URL's niet blijvend in de Cache API.
          if (!url.search && response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const exact = await caches.match(request);
          if (exact) return exact;
          // Voor querylinks (zoals ?plan=) mag de statische pagina-variant dienen.
          const withoutQuery = await caches.match(url.pathname);
          if (withoutQuery) return withoutQuery;
          return (await caches.match("/")) || Response.error();
        })
    );
  }
});
