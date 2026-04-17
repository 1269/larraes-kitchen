// Source: CONTEXT (LeadStore interface carried forward) + RESEARCH §Pattern 7 (Sheets schema) + REQUIREMENTS LEAD-05/06/10/11 + PATTERNS §LeadStore.ts.
// Canonical template for the pluggable lead persistence contract. Any backend (Sheets today, Turso tomorrow,
// InMemory for tests) MUST implement this interface exactly.
import type { LeadInput } from "@/lib/schemas/lead";

export type EmailStatus = "pending" | "sent" | "failed";

/**
 * The persisted shape of a lead. Mirrors the Google Sheets column schema
 * declared in RESEARCH §Pattern 7 (columns A–X). Storage adapters serialize
 * this 1:1 — the column letter in each comment is load-bearing.
 */
export interface LeadRecord {
  createdAt: string; // A — ISO-8601 UTC server timestamp
  submissionId: string; // B — LK-XXXXXX short form (user-facing)
  ulid: string; // C — 26-char Crockford-base32 ULID (sortable, collision-safe)
  idempotencyKey: string; // D — client-generated UUID for dedupe (LEAD-04)
  eventType: LeadInput["eventType"]; // E — family | social | corporate
  guestCount: number; // F
  eventDate: string; // G — YYYY-MM-DD
  packageId: LeadInput["packageId"]; // H — small | medium | large | custom
  finalEstimateMin: number | null; // I — $10-rounded min; null for custom-quote path
  finalEstimateMax: number | null; // J — $10-rounded max; null for custom-quote path
  name: string; // K
  email: string; // L
  phone: string; // M
  zip: string; // N — optional; "" when absent
  eventAddress: string; // O — free text (street)
  eventCity: string; // P
  notes: string; // Q — max 2000 chars; RAW-appended to Sheets to disable formula execution (RESEARCH A4)
  howHeard: string; // R — google | instagram | word-of-mouth | other | ""
  contactMethod: LeadInput["contactMethod"]; // S — email | phone | text
  ipHash: string; // T — SHA-256(salt + ip), 64-char hex (raw IP never stored)
  notifyEmailStatus: EmailStatus; // U — Larrae notification email state (LEAD-10)
  confirmEmailStatus: EmailStatus; // V — inquirer confirmation email state (LEAD-10)
  retryCount: number; // W — cron retry attempt counter (LEAD-11)
  userAgent: string; // X — for debugging bot vs. human distinction
}

/** A single append row on the RateLimit tab (LEAD-03 rolling window). */
export interface RateLimitHit {
  ipHash: string;
  timestampMs: number;
  action: "submit";
}

/**
 * Pluggable lead persistence contract. `GoogleSheetsAdapter` is the production impl;
 * `InMemoryLeadStore` is the test double + local-dev fallback. Both MUST satisfy this
 * interface exactly — no extra public methods that the Action would come to depend on.
 */
export interface LeadStore {
  /** LEAD-05 store-before-email. Appends the record and returns it unchanged. */
  append(record: LeadRecord): Promise<LeadRecord>;

  /** LEAD-04 idempotency lookup — returns an earlier record if the key already exists, else null. */
  findByIdempotencyKey(key: string): Promise<LeadRecord | null>;

  /** LEAD-10 email status update — called after `Promise.allSettled` on Resend sends resolves. */
  updateEmailStatuses(
    submissionId: string,
    statuses: { notify: EmailStatus; confirm: EmailStatus },
  ): Promise<void>;

  /** LEAD-11 retry cron helper — returns records with any 'pending' email status older than minAgeMs and under maxRetries. */
  findPendingEmails(opts: { maxRetries: number; minAgeMs: number }): Promise<LeadRecord[]>;

  /** LEAD-11 retry outcome — bumps retry_count and sets the specified email-status column. */
  markEmailRetry(
    submissionId: string,
    which: "notify" | "confirm",
    status: EmailStatus,
  ): Promise<void>;

  /** LEAD-03 rate-limit append — records a hit on the RateLimit tab. */
  recordRateLimitHit(hit: RateLimitHit): Promise<void>;

  /** LEAD-03 rate-limit read — counts hits for this ipHash inside the rolling window. */
  countRateLimitHits(ipHash: string, windowMs: number): Promise<number>;
}
