// Source: LEAD-03 + RESEARCH §Rate Limit Strategy (Sheets-backed accepted for v1) + §Pitfall 4 (Vercel IP header handling) + PATTERNS §rateLimit.ts.
import { createHash } from "node:crypto";
import type { LeadStore, RateLimitHit } from "./LeadStore";

/** Maximum submissions allowed inside the rolling window (LEAD-03). */
export const RATE_LIMIT_MAX = 5;

/** Rolling-window length in ms (10 minutes per LEAD-03). */
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Project-wide salt. Not a secret (SHA-256 of a salted IP doesn't require confidentiality —
 * the salt just breaks rainbow-table attacks and prevents the hash from being correlatable
 * across unrelated projects using the same IP hashing approach).
 */
const SALT = "lk-rate-limit-v1-salt";

/**
 * Deterministic salted SHA-256 of an IP address. Empty strings are hashed too (no throw) —
 * unknown/missing IPs bucket under a single hash so they are collectively rate-limited.
 * Raw IP is never stored anywhere — only the 64-char hex digest from here.
 */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex");
}

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  windowMs: number;
}

/**
 * LEAD-03 rolling-window rate-limit check. Uses the LeadStore-backed RateLimit tab.
 *
 * - When under the cap: appends a hit row AND returns `allowed: true` (the hit is the request we're permitting).
 * - When at-or-over the cap: does NOT append a hit row; returns `allowed: false`. Caller should
 *   throw `TOO_MANY_REQUESTS`. Not recording the rejection prevents attackers from burning
 *   tab rows with deliberately-blocked requests.
 */
export async function rateLimitCheck(
  store: LeadStore,
  ipHash: string,
  now: number = Date.now(),
): Promise<RateLimitResult> {
  const current = await store.countRateLimitHits(ipHash, RATE_LIMIT_WINDOW_MS);
  if (current >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      current,
      limit: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    };
  }
  const hit: RateLimitHit = { ipHash, timestampMs: now, action: "submit" };
  await store.recordRateLimitHit(hit);
  return {
    allowed: true,
    current: current + 1,
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  };
}
