/**
 * Server-side hulp voor upstream-diensten (Nominatim / OSRM).
 *
 * - In-memory cache met TTL: herhaalde zoekopdrachten raken de upstream niet
 *   nogmaals (Nominatim-policy: max ~1 request/seconde).
 * - Eenvoudige serialiserende limiter voor de publieke Nominatim-instantie,
 *   zodat een drukke pagina niet op een blok stuit.
 * - Caps op geheugengebruik (max. 500 entries, FIFO-evictie).
 */

interface CacheEntry {
  expiresAt: number;
  payload: unknown;
}

const globalStore = globalThis as typeof globalThis & {
  __apexUpstreamCache?: Map<string, CacheEntry>;
  __apexNominatimQueue?: Promise<unknown>;
  __apexNominatimLastCall?: number;
};

const cache: Map<string, CacheEntry> =
  globalStore.__apexUpstreamCache ?? new Map();
globalStore.__apexUpstreamCache = cache;

const MAX_ENTRIES = 500;
const NOMINATIM_MIN_INTERVAL_MS = 1100;
/** Upstream-timeout: een hangende verbinding mag nooit een request vasthouden. */
const DEFAULT_TIMEOUT_MS = 8000;

function withTimeout(init: RequestInit, timeoutMs?: number): RequestInit {
  if (init.signal) return init;
  return { ...init, signal: AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS) };
}

function cacheGet(key: string): unknown | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.payload;
}

function cacheSet(key: string, payload: unknown, ttlMs: number): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { expiresAt: Date.now() + ttlMs, payload });
}

export async function cachedJson<T = unknown>(
  key: string,
  url: string,
  init: RequestInit,
  ttlMs: number,
  timeoutMs?: number
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const cached = cacheGet(key);
  if (cached !== undefined) {
    return { ok: true, status: 200, data: cached as T };
  }

  try {
    const res = await fetch(url, withTimeout(init, timeoutMs));
    if (!res.ok) {
      return { ok: false, status: res.status, data: null };
    }
    const data = (await res.json()) as T;
    cacheSet(key, data, ttlMs);
    return { ok: true, status: 200, data };
  } catch {
    return { ok: false, status: 502, data: null };
  }
}

/**
 * Nominatim-call die netjes in de wachtrij staat: alle calls via deze functie
 * worden geserialiseerd met minimaal 1,1 s tussenruimte (per server-instantie).
 */
export async function nominatimJson<T = unknown>(
  url: string,
  headers: Record<string, string>,
  ttlMs: number,
  timeoutMs?: number
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const cached = cacheGet(url);
  if (cached !== undefined) return { ok: true, status: 200, data: cached as T };

  const store = globalStore;
  const previous = store.__apexNominatimQueue ?? Promise.resolve();
  const job = previous.catch(() => undefined).then(async () => {
    const wait =
      NOMINATIM_MIN_INTERVAL_MS - (Date.now() - (store.__apexNominatimLastCall ?? 0));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    store.__apexNominatimLastCall = Date.now();
    try {
      const res = await fetch(url, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });
      if (!res.ok) return { ok: false, status: res.status, data: null };
      const data = (await res.json()) as T;
      cacheSet(url, data, ttlMs);
      return { ok: true, status: 200, data };
    } catch {
      return { ok: false, status: 502, data: null };
    }
  });

  store.__apexNominatimQueue = job.catch(() => undefined);
  return job;
}
