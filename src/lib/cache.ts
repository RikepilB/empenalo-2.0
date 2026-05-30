import "server-only";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";

// Upstash when configured (survives serverless cold starts), in-memory otherwise
// (local dev). The in-memory path is the one sanctioned fallback — infra only.
let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const { upstashUrl, upstashToken } = serverEnv();
  redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;
  return redis;
}

type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<unknown>>();

export const cache = {
  async get<T>(key: string): Promise<T | undefined> {
    const r = getRedis();
    if (r) return (await r.get<T>(key)) ?? undefined;
    const e = store.get(key) as Entry<T> | undefined;
    if (!e) return undefined;
    if (e.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return e.value;
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const r = getRedis();
    if (r) {
      await r.set(key, value, { ex: ttlSeconds });
      return;
    }
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async del(key: string): Promise<void> {
    const r = getRedis();
    if (r) {
      await r.del(key);
      return;
    }
    store.delete(key);
  },
};

// Cache-aside helper. Convention: keys are namespaced `emp:{resource}:{id}`.
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== undefined) return hit;
  const value = await fetcher();
  await cache.set(key, value, ttlSeconds);
  return value;
}
