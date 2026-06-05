import { redis } from "../config/redis";

export interface QuotaSnapshot {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string; // ISO timestamp for the start of the next UTC day
}

/** YYYY-MM-DD in UTC — the bucket that all callers in the same day share. */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Seconds remaining until the next UTC midnight, plus a 1h buffer for clock skew. */
function ttlSeconds() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.max(60, Math.floor((next.getTime() - now.getTime()) / 1000) + 3600);
}

function nextResetIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}

const k = (namespace: string, ownerId: string) => `quota:${namespace}:${ownerId}:${todayKey()}`;

/** Read the current counter without incrementing it. */
export async function peekDailyQuota(
  namespace: string,
  ownerId: string,
  limit: number
): Promise<QuotaSnapshot> {
  const used = Number((await redis.get(k(namespace, ownerId))) ?? 0);
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: nextResetIso(),
  };
}

/**
 * Atomically increment the daily counter. If the new value exceeds the limit,
 * roll the counter back and return { allowed: false } so the caller can 429.
 */
export async function consumeDailyQuota(
  namespace: string,
  ownerId: string,
  limit: number
): Promise<{ allowed: boolean; snapshot: QuotaSnapshot }> {
  const key = k(namespace, ownerId);
  const used = await redis.incr(key);
  // Set the TTL on the very first increment so the counter expires at next UTC midnight.
  if (used === 1) await redis.expire(key, ttlSeconds());

  if (used > limit) {
    // Roll back — caller did not actually consume the slot.
    await redis.decr(key);
    return {
      allowed: false,
      snapshot: { used: limit, limit, remaining: 0, resetAt: nextResetIso() },
    };
  }
  return {
    allowed: true,
    snapshot: { used, limit, remaining: limit - used, resetAt: nextResetIso() },
  };
}
