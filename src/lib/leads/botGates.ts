// Source: RESEARCH §Pattern 11 (layered spam defense — pure classifiers) + CONTEXT D-18 (decoy success on bot trip) + SPAM-01/03/04 + PATTERNS §botGates.ts.
// All three helpers are pure and run on both client (pre-submit pre-check) and server (authoritative reject).

/** Minimum time in ms between wizard mount and submit — below = instant-submit bot (SPAM-03). */
export const MIN_TIME_MS = 3000;

/** SPAM-01 honeypot check. Returns true when the field is empty (legit user); false when filled (bot). */
export function checkHoneypot(input: { honeypot: string }): boolean {
  return !input.honeypot || input.honeypot.length === 0;
}

/**
 * SPAM-03 min-time check. Returns true when the form was open >= MIN_TIME_MS
 * before submit; false for instant submits. Invalid/unset `wizardMountedAt`
 * returns false (fail-closed — an unseeded form is suspicious).
 */
export function checkMinTime(
  input: { wizardMountedAt: number },
  now: number = Date.now(),
): boolean {
  if (!Number.isFinite(input.wizardMountedAt) || input.wizardMountedAt <= 0) return false;
  return now - input.wizardMountedAt >= MIN_TIME_MS;
}

const URL_PATTERNS: readonly RegExp[] = [/https?:\/\//i, /www\.[a-z0-9]/i];

/**
 * SPAM-04 URL-in-notes heuristic. Scans the free-text fields that inquirers fill
 * (notes, eventAddress, name) for URL-like patterns. Returns true when no patterns
 * match (legit); false when any match (likely spam).
 *
 * Note: false positives are acceptable per D-18 — bot-tripped submissions look like
 * success to the bot, so a rare misclassification silently drops a legit lead. The
 * email-fallback UX copy on the error surface catches the remainder.
 */
export function checkUrlHeuristics(input: {
  notes?: string;
  eventAddress?: string;
  name?: string;
}): boolean {
  const haystacks = [input.notes ?? "", input.eventAddress ?? "", input.name ?? ""];
  for (const text of haystacks) {
    for (const pat of URL_PATTERNS) {
      if (pat.test(text)) return false;
    }
  }
  return true;
}
