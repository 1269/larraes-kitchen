// Source: PATTERNS §store.ts factory + RESEARCH §Pattern 6 + CONTEXT §LeadStore interface carried forward.
// Singleton factory that returns the correct LeadStore implementation based on environment configuration.
// Production REQUIRES GOOGLE_SHEETS_CREDENTIALS_JSON + GOOGLE_SHEETS_LEAD_SHEET_ID; dev falls back to
// InMemoryLeadStore so contributors without a provisioned Sheet can still run the site locally.
import { GoogleSheetsAdapter } from "./GoogleSheetsAdapter";
import { InMemoryLeadStore } from "./InMemoryLeadStore";
import type { LeadStore } from "./LeadStore";

let instance: LeadStore | null = null;

/**
 * Returns the process-wide singleton LeadStore.
 *
 * - In production (`NODE_ENV === 'production'`), both GOOGLE_SHEETS_CREDENTIALS_JSON and
 *   GOOGLE_SHEETS_LEAD_SHEET_ID MUST be set or this throws. This is intentional: a
 *   production deploy silently falling back to an in-memory store would lose every lead
 *   on the next cold start.
 * - In dev/test, missing credentials fall back to InMemoryLeadStore (useful for contributors
 *   without Sheets access and for Plan 05 Action integration tests).
 */
export function getLeadStore(): LeadStore {
  if (instance) return instance;

  const credentials = import.meta.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
  const sheetId = import.meta.env.GOOGLE_SHEETS_LEAD_SHEET_ID;

  if (credentials && sheetId) {
    instance = new GoogleSheetsAdapter(credentials, sheetId);
    return instance;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "GOOGLE_SHEETS_CREDENTIALS_JSON and GOOGLE_SHEETS_LEAD_SHEET_ID are required in production",
    );
  }

  instance = new InMemoryLeadStore();
  return instance;
}

/**
 * Test-only helper: clear the singleton so each test gets a fresh store, or inject a
 * pre-seeded override. Plan 05 integration tests use this to substitute an
 * InMemoryLeadStore instance with known fixtures.
 */
export function resetLeadStoreForTests(override?: LeadStore): void {
  instance = override ?? null;
}
