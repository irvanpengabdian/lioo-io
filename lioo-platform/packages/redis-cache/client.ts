import { Redis } from '@upstash/redis';

const g = globalThis as unknown as {
  __liooUpstashRedis?: Redis | null;
  __liooUpstashRedisInited?: boolean;
};

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Klien Upstash; null jika env tidak lengkap (fallback tanpa Redis). */
export function getRedis(): Redis | null {
  if (g.__liooUpstashRedisInited) return g.__liooUpstashRedis ?? null;
  g.__liooUpstashRedisInited = true;
  g.__liooUpstashRedis = createRedis();
  return g.__liooUpstashRedis;
}
