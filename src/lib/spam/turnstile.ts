// Source: Plan 03-05 Task 1 — Cloudflare Turnstile server-verify client.
// RESEARCH §Pattern 9 (siteverify POST + idempotency_key) + LEAD-02 + SPAM-02.
// Contract: this function NEVER throws — every failure mode resolves to
// `{ success: false, "error-codes": [...] }` so the caller (submitInquiry
// Action) decides whether to map to ActionError FORBIDDEN or silently drop.
export interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  challenge_ts?: string;
  action?: string;
  cdata?: string;
}

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-verifies a Turnstile token with Cloudflare.
 *
 * @param token - The widget-issued token from the client form
 * @param ip - The client IP (used by Cloudflare for binding)
 * @param idempotencyKey - Allows the same token to be re-verified safely
 *   across retries (Cloudflare caches the verdict for short windows)
 */
export async function verifyTurnstile(
  token: string,
  ip: string,
  idempotencyKey: string,
): Promise<TurnstileResponse> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: false, "error-codes": ["missing-input-secret"] };

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
    idempotency_key: idempotencyKey,
  });

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return { success: false, "error-codes": [`http-${res.status}`] };
    return (await res.json()) as TurnstileResponse;
  } catch {
    return { success: false, "error-codes": ["network-error"] };
  }
}
