/**
 * In-process cache for public GET JSON during SSR.
 * The Node server keeps this for a minute so repeat trek-page renders skip the API.
 */

type CacheEntry = { expires: number; status: number; body: unknown };

const store = new Map<string, CacheEntry>();
const OK_TTL_MS = 60_000;
const MISS_TTL_MS = 15_000;

export interface CachedJson {
  ok: boolean;
  status: number;
  body: unknown;
}

export async function cachedJson(url: string, ttlMs = OK_TTL_MS): Promise<CachedJson> {
  const now = Date.now();
  const hit = store.get(url);
  if (hit && hit.expires > now) {
    return { ok: hit.status >= 200 && hit.status < 300, status: hit.status, body: hit.body };
  }

  const response = await fetch(url);
  const body = await response.json().catch(() => null);
  if (response.ok || response.status === 404) {
    store.set(url, {
      expires: now + (response.ok ? ttlMs : MISS_TTL_MS),
      status: response.status,
      body,
    });
  }
  return { ok: response.ok, status: response.status, body };
}
