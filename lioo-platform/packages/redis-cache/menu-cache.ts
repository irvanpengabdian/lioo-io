import { getRedis } from './client';

const KEY_PREFIX = 'lioo:publicMenu:v1';

export function publicMenuCacheKey(tenantId: string): string {
  return `${KEY_PREFIX}:${tenantId}`;
}

export function getPublicMenuCacheTtlSeconds(): number {
  const raw = process.env.PUBLIC_MENU_CACHE_TTL_SECONDS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 30 && n <= 86_400) return n;
  }
  return 300;
}

export async function getCachedPublicMenuJson(tenantId: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const v = await redis.get<string>(publicMenuCacheKey(tenantId));
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

export async function setCachedPublicMenuJson(
  tenantId: string,
  json: string,
  ttlSeconds?: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const ex = ttlSeconds ?? getPublicMenuCacheTtlSeconds();
  try {
    await redis.set(publicMenuCacheKey(tenantId), json, { ex });
  } catch {
    /* cache best-effort */
  }
}

export async function invalidatePublicMenuCache(tenantId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(publicMenuCacheKey(tenantId));
  } catch {
    /* best-effort */
  }
}
