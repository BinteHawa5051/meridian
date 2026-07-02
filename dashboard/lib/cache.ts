/**
 * Simple in-process TTL cache for API route responses.
 * Avoids repeated DB hits for the same query within the TTL window.
 * Survives across requests in the same Node.js process.
 */

interface CacheEntry {
  data:      unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
  return entry.data as T;
}

export function cacheSet(key: string, data: unknown, ttlMs: number) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** Fetch with cache — runs queryFn only on cache miss */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  queryFn: () => Promise<T>,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;
  const result = await queryFn();
  cacheSet(key, result, ttlMs);
  return result;
}
