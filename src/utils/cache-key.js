export function createCacheKey(url) {
  const normalized = new URL(url.toString());

  normalized.hash = "";

  return normalized.toString();
}