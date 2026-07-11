// ── Simple in-memory rate limiter (token-bucket style) ───────────
// Keyed by client identifier (IP). Note: serverless instances have
// independent memory, so this complements — not replaces — Netlify's
// edge rate limiting. Limits are generous so real shoppers never hit them.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup to avoid unbounded growth within a warm instance.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

/**
 * Returns whether a request identified by `key` is within `limit` requests
 * per `windowMs`. Call once per request.
 */
export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 10_000,
  now: number = Date.now()
): RateLimitResult {
  sweep(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, limit, resetAt };
  }
  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    limit,
    resetAt: existing.resetAt,
  };
}

/** Extract a best-effort client IP from request headers. */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-nf-client-connection-ip") || headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Test helper: clear all buckets. */
export function _resetRateLimiter() {
  buckets.clear();
  lastSweep = 0;
}
