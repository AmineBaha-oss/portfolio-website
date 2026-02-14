/**
 * In-memory rate limiter for public API endpoints.
 * Limits requests per identifier (e.g. IP) per time window to block spam.
 */

const store = new Map<string, number[]>();

/** Window in milliseconds (e.g. 15 minutes) */
const WINDOW_MS = 15 * 60 * 1000;

/** Max requests per window per identifier */
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Prune old entries from the store to avoid unbounded growth.
 * Keeps only the last 1000 keys and removes expired timestamps.
 */
function prune(key: string): void {
  const timestamps = store.get(key);
  if (!timestamps) return;
  const now = Date.now();
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);
  if (valid.length === 0) {
    store.delete(key);
  } else {
    store.set(key, valid);
  }
}

/**
 * Check if the request is allowed under the rate limit.
 * @param identifier - Unique key (e.g. IP address + endpoint name)
 * @returns Object with allowed: boolean and retryAfterSeconds (if limited)
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  prune(identifier);

  const timestamps = store.get(identifier) ?? [];
  const inWindow = timestamps.filter((t) => now - t < WINDOW_MS);

  if (inWindow.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestInWindow = Math.min(...inWindow);
    const retryAfterSeconds = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  inWindow.push(now);
  store.set(identifier, inWindow);
  return { allowed: true };
}

/**
 * Get client identifier from request (IP). Uses x-forwarded-for, x-real-ip, or a fallback.
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
