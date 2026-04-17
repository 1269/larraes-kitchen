// Source: Plan 03-06 Task 1 — LEAD-11 daily retry cron.
// RESEARCH §Pattern 10 (Vercel Cron retry skeleton) + PATTERNS §retry-email.ts.
//
// Flow (Vercel Cron fires at 09:00 UTC daily — schedule lives in vercel.json):
//   1. Verify `Authorization: Bearer ${CRON_SECRET}` — 401 on any mismatch.
//   2. Ask the LeadStore for leads with a pending email status AND retryCount < 3
//      AND createdAt older than 1 hour (MIN_AGE_MS — don't hammer fresh failures
//      that may self-heal on the next Resend push).
//   3. For each pending lead, retry notify and/or confirm sends; bump retry_count
//      via `markEmailRetry` in both success and failure paths.
//   4. Return `{ scanned, sent, failed }` JSON for observability.
//
// PII-safe logging: every error log includes ONLY submissionId + String(reason).
// Never name/email/phone/notes — downstream logs (Vercel, Sentry) must stay clean.
//
// T-03-42 mitigation: Bearer token check uses exact string compare. Missing header
// → 401; wrong token → 401. Secret lives in non-PUBLIC_ env var (not inlined into
// any client bundle).
export const prerender = false;

import type { APIRoute } from "astro";
import { sendLeadConfirmation, sendLeadNotification } from "@/lib/email/send";
import { getLeadStore } from "@/lib/leads/store";

const MAX_RETRIES = 3;
const MIN_AGE_MS = 60 * 60 * 1000; // 1 hour

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`;
  if (!auth || auth !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getLeadStore();
  const pending = await store.findPendingEmails({
    maxRetries: MAX_RETRIES,
    minAgeMs: MIN_AGE_MS,
  });
  let sent = 0;
  let failed = 0;

  for (const lead of pending) {
    if (lead.notifyEmailStatus === "pending") {
      try {
        await sendLeadNotification(lead);
        await store.markEmailRetry(lead.submissionId, "notify", "sent");
        sent += 1;
      } catch (err) {
        await store.markEmailRetry(lead.submissionId, "notify", "failed");
        failed += 1;
        console.error("retry_notify_failed", {
          submissionId: lead.submissionId,
          reason: String(err),
        });
      }
    }
    if (lead.confirmEmailStatus === "pending") {
      try {
        await sendLeadConfirmation(lead);
        await store.markEmailRetry(lead.submissionId, "confirm", "sent");
        sent += 1;
      } catch (err) {
        await store.markEmailRetry(lead.submissionId, "confirm", "failed");
        failed += 1;
        console.error("retry_confirm_failed", {
          submissionId: lead.submissionId,
          reason: String(err),
        });
      }
    }
  }

  return new Response(JSON.stringify({ scanned: pending.length, sent, failed }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
