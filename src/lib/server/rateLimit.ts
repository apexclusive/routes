/**
 * Kleine server-side misbruikrem voor kostbare of mailende endpoints.
 * In serverless is dit per warme instantie (dus geen vervanging voor een
 * gedeelde Redis-limiter), maar het stopt bursts en bots zonder dependency.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const globalStore = globalThis as typeof globalThis & {
  __apexRateLimits?: Map<string, Bucket>;
};

const buckets = globalStore.__apexRateLimits ?? new Map<string, Bucket>();
globalStore.__apexRateLimits = buckets;
const MAX_BUCKETS = 5_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindow = Math.max(1_000, Math.floor(windowMs));
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + safeWindow };
  }
  bucket.count += 1;
  buckets.set(key, bucket);

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now || buckets.size > MAX_BUCKETS) buckets.delete(bucketKey);
      if (buckets.size <= MAX_BUCKETS) break;
    }
  }

  return {
    allowed: bucket.count <= safeLimit,
    remaining: Math.max(0, safeLimit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/** Eerste proxy-IP; valt terug op een stabiele anonieme sleutel. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip")?.trim();
  return (forwarded || real || "anonymous").slice(0, 80);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1_000)),
  };
}
