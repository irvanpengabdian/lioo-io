import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function redisFromEnv(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function parsePositiveInt(envKey: string, fallback: number): number {
  const raw = process.env[envKey]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const g = globalThis as unknown as {
  __liooRlPage?: Ratelimit | null;
  __liooRlPageInited?: boolean;
  __liooRlApi?: Ratelimit | null;
  __liooRlApiInited?: boolean;
};

/**
 * Rate limit untuk halaman & server actions di bawah /o/* dan /t/*.
 * Default: 120 req / menit per IP (sliding window).
 */
export function getPortalPageRatelimit(): Ratelimit | null {
  if (g.__liooRlPageInited) return g.__liooRlPage ?? null;
  g.__liooRlPageInited = true;
  const redis = redisFromEnv();
  if (!redis) {
    g.__liooRlPage = null;
    return null;
  }
  const max = parsePositiveInt('PORTAL_RATE_LIMIT_PAGE_PER_MIN', 120);
  g.__liooRlPage = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, '60 s'),
    prefix: 'rl:lioo:portal:page',
    analytics: false,
  });
  return g.__liooRlPage;
}

/**
 * Rate limit untuk API publik pelanggan (/api/customer/*).
 * Default: 40 req / menit per IP.
 */
export function getPortalApiRatelimit(): Ratelimit | null {
  if (g.__liooRlApiInited) return g.__liooRlApi ?? null;
  g.__liooRlApiInited = true;
  const redis = redisFromEnv();
  if (!redis) {
    g.__liooRlApi = null;
    return null;
  }
  const max = parsePositiveInt('PORTAL_RATE_LIMIT_API_PER_MIN', 40);
  g.__liooRlApi = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, '60 s'),
    prefix: 'rl:lioo:portal:api',
    analytics: false,
  });
  return g.__liooRlApi;
}
