// Source: CONTEXT D-08 (native date picker + lead-time/blackout inline validation)
// + WIZ-10 + UI-SPEC §Field validation error strings (lines 204-207, verbatim).
// Date math uses UTC components to avoid local-timezone drift (RESEARCH §Pitfall 6).
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Add `days` to a YYYY-MM-DD string using UTC arithmetic (no timezone drift). */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export interface ValidateEventDateOpts {
  leadTimeDays: number;
  blackoutDates: readonly string[];
  /** Optional — defaults to today (UTC). Override in tests for determinism. */
  todayIso?: string;
  /** Optional — site email for the blackout-error mailto suffix. */
  siteEmail?: string;
}

/**
 * Validate an event-date string against site lead-time + blackout rules.
 * Returns `null` when valid, or a locked UI-SPEC error string when invalid.
 *
 * Error strings (UI-SPEC §Field validation error strings):
 * - format fail  → "Use YYYY-MM-DD date format"
 * - past date    → "Please pick a date in the future."
 * - lead-time    → "We need at least {N} days lead time. Try {date} or later."
 * - blackout     → "We're closed on {date}. Pick another day or email us at {email}."
 */
export function validateEventDate(
  value: string,
  opts: ValidateEventDateOpts,
): string | null {
  const today = opts.todayIso ?? new Date().toISOString().slice(0, 10);
  if (!DATE_RE.test(value)) return "Use YYYY-MM-DD date format";
  if (value <= today) return "Please pick a date in the future.";

  const minDate = addDays(today, opts.leadTimeDays);
  if (value < minDate) {
    return `We need at least ${opts.leadTimeDays} days lead time. Try ${minDate} or later.`;
  }
  if (opts.blackoutDates.includes(value)) {
    const emailSuffix = opts.siteEmail ? ` or email us at ${opts.siteEmail}` : "";
    return `We're closed on ${value}. Pick another day${emailSuffix}.`;
  }
  return null;
}
