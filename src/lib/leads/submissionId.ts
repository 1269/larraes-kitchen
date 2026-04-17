// Source: CONTEXT D-19 (LK-XXXXXX format — authoritative) + RESEARCH §Code Examples "Making a submission ID" + PATTERNS §submissionId.ts.
import { ulid } from "ulid";

/** Extract the last 6 characters of a ULID and format as `LK-XXXXXX` (uppercase Crockford-base32). */
export function shortOf(ulidString: string): string {
  return `LK-${ulidString.slice(-6).toUpperCase()}`;
}

/**
 * Generate a fresh ULID and its short `LK-XXXXXX` display form.
 * The full 26-char ULID persists in Sheets column C (sortable, collision-safe);
 * the 6-char short form is what the user sees on the confirmation screen + emails.
 */
export function makeSubmissionId(): { ulid: string; submissionId: string } {
  const full = ulid();
  return { ulid: full, submissionId: shortOf(full) };
}
