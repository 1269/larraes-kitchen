// Source: Plan 03-05 Task 1 — Resend wrapper for lead notification + inquirer confirmation.
// RESEARCH §Pattern 8 (Resend + React Email + tags) + CONTEXT D-16/D-17 + LEAD-08/09/12.
//
// CRITICAL DOWNSTREAM CONTRACT (LEAD-12):
// The `tags` array on each resend.emails.send() call is the contract Plan 06's
// Resend webhook (src/pages/api/webhooks/resend.ts) reads to correlate
// delivery/bounce events back to the correct LeadStore row + email-status column.
// The webhook reads:
//   event.data.tags.submission_id  ← routes to the correct lead row
//   event.data.tags.which          ← "notify" | "confirm" — updates the right column
// DO NOT rename keys. DO NOT change the "notify"/"confirm" literal values. DO NOT
// merge the two sends without preserving distinct tag arrays.
import { render } from "@react-email/render";
import { getEntry } from "astro:content";
import { Resend } from "resend";
import LeadConfirmation from "./templates/LeadConfirmation";
import LeadNotification from "./templates/LeadNotification";
import type { LeadRecord } from "@/lib/leads/LeadStore";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (resendClient) return resendClient;
  const key = import.meta.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is required");
  resendClient = new Resend(key);
  return resendClient;
}

/** Test-only helper — resets the cached Resend client so env stubs take effect. */
export function resetResendClientForTests(): void {
  resendClient = null;
}

async function getLarraeEmail(): Promise<string> {
  const site = await getEntry("site", "site");
  return site?.data.email ?? "";
}

/**
 * LEAD-08 — send the action-first notification email to Larrae.
 * Subject format LOCKED per UI-SPEC §Email copy:
 *   `New quote: {name} · {eventType} · {guestCount} guests · {date}`
 *
 * LEAD-12 tag contract (consumed by Plan 06 webhook):
 *   tags: [
 *     { name: "submission_id", value: record.submissionId },
 *     { name: "which", value: "notify" },
 *   ]
 *
 * Throws on Resend SDK failure — the Action wraps this call in
 * `Promise.allSettled` so a failure here does NOT abort the confirmation send
 * and the lead record persists regardless (LEAD-05, LEAD-10).
 */
export async function sendLeadNotification(record: LeadRecord): Promise<void> {
  const [html, larraeEmail] = await Promise.all([
    render(LeadNotification({ record })),
    getLarraeEmail(),
  ]);
  const subject = `New quote: ${record.name} · ${record.eventType} · ${record.guestCount} guests · ${record.eventDate}`;
  await getResend().emails.send({
    from: import.meta.env.RESEND_FROM_EMAIL,
    to: larraeEmail,
    replyTo: record.email,
    subject,
    html,
    // LEAD-12 correlation tags — consumed by src/pages/api/webhooks/resend.ts (Plan 06).
    // Do NOT rename keys. Do NOT change "notify" value. Downstream webhook is grep-coupled.
    tags: [
      { name: "submission_id", value: record.submissionId },
      { name: "which", value: "notify" },
    ],
  });
}

/**
 * LEAD-09 — send the warm heritage confirmation email to the inquirer.
 * Subject format LOCKED per UI-SPEC §Email copy:
 *   `We got your request — thanks, {firstName}`
 *
 * LEAD-12 tag contract (consumed by Plan 06 webhook):
 *   tags: [
 *     { name: "submission_id", value: record.submissionId },
 *     { name: "which", value: "confirm" },
 *   ]
 *
 * Throws on Resend SDK failure — the Action wraps this call in
 * `Promise.allSettled` so the notification send and lead record persist
 * regardless (LEAD-05, LEAD-10).
 */
export async function sendLeadConfirmation(record: LeadRecord): Promise<void> {
  const larraeEmail = await getLarraeEmail();
  const html = await render(LeadConfirmation({ record, larraeEmail }));
  const firstName = record.name.split(/\s+/)[0] ?? record.name;
  const subject = `We got your request — thanks, ${firstName}`;
  await getResend().emails.send({
    from: import.meta.env.RESEND_FROM_EMAIL,
    to: record.email,
    replyTo: larraeEmail,
    subject,
    html,
    // LEAD-12 correlation tags — consumed by src/pages/api/webhooks/resend.ts (Plan 06).
    // Do NOT rename keys. Do NOT change "confirm" value. Downstream webhook is grep-coupled.
    tags: [
      { name: "submission_id", value: record.submissionId },
      { name: "which", value: "confirm" },
    ],
  });
}
