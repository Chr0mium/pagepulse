const cache = new Map();

const CACHE_TTL_MS =
  (Number(process.env.CACHE_TTL_SECONDS) || 300) * 1000;

export function getCachedAudit(key) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedAudit(key, data) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}