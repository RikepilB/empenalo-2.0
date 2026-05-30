import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const { upstashUrl, upstashToken } = serverEnv();
  redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;
  return redis;
}

// In-memory fallback bucket (local dev). Resets per cold start — that's why
// production must set Upstash env vars.
type Bucket = { tokens: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export async function rateLimit(
  key: string,
  maxTokens: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const r = getRedis();
  if (r) {
    const limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(maxTokens, `${windowSeconds} s`),
      prefix: "rl",
    });
    const res = await limiter.limit(key);
    return { allowed: res.success, remaining: res.remaining };
  }

  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { tokens: maxTokens - 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxTokens - 1 };
  }
  if (existing.tokens <= 0) return { allowed: false, remaining: 0 };
  existing.tokens -= 1;
  return { allowed: true, remaining: existing.tokens };
}

export function rateLimitByUser(
  action: string,
  userId: string,
  maxTokens: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  return rateLimit(`${action}:${userId}`, maxTokens, windowSeconds);
}
