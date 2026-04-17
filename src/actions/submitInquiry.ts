// Source: Plan 03-05 Task 2 — the server-side inquiry pipeline.
// RESEARCH §Pattern 2 (Astro Action skeleton) + §Pattern 11 (silent decoy) +
// CONTEXT D-18 (error UX — ActionError code → client alert mapping) +
// LEAD-01..05/07/10 + SPAM-01..04 + EST-01/02.
//
// Nine-step pipeline — ORDER IS LOAD-BEARING:
//   1. Honeypot (silent decoy on fill)
//   2. Min-time (silent decoy under 3s)
//   3. URL-in-notes heuristic (silent decoy on match)
//   4. Turnstile server-verify (FORBIDDEN on fail)
//   5. Rate-limit check (TOO_MANY_REQUESTS on cap)
//   6. Idempotency lookup (return prior submissionId if hit)
//   7. Server-stamped estimate (EST-01 — computed from getCollection('packages'))
//   8. Store-first append (LEAD-05 — sheet row persists BEFORE any email send)
//   9. Promise.allSettled email fan-out (LEAD-10 — either failure does NOT
//      abort the other; lead record persists; status columns updated after)
import { ActionError, defineAction } from "astro:actions";
import { getCollection, getEntry } from "astro:content";
import { sendLeadConfirmation, sendLeadNotification } from "@/lib/email/send";
import { checkHoneypot, checkMinTime, checkUrlHeuristics } from "@/lib/leads/botGates";
import type { LeadRecord } from "@/lib/leads/LeadStore";
import { hashIp, rateLimitCheck } from "@/lib/leads/rateLimit";
import { getLeadStore } from "@/lib/leads/store";
import { makeSubmissionId } from "@/lib/leads/submissionId";
import { type EstimateRange, estimate } from "@/lib/pricing/estimate";
import { type LeadInput, leadSchema, validateLeadBusinessRules } from "@/lib/schemas/lead";

export interface SubmitInquiryResult {
  submissionId: string;
  estimate: EstimateRange | null;
}

/**
 * CONTEXT D-18 silent-reject contract. Bot-tripped submissions return a decoy
 * 200 with a fresh LK-XXXXXX that is NEVER persisted to the store and NEVER
 * triggers an email send — indistinguishable from real success to the bot, so
 * attackers cannot tell which gate fired or retry differently.
 *
 * WR-05 namespace accounting note: decoy IDs share the 32^6 (~1.07B) short-form
 * LK-XXXXXX space with real IDs but are never persisted, so a real submission
 * could in theory collide with a previously-issued decoy short-form. The full
 * 26-char ULID in column C remains collision-safe regardless. At expected
 * catering traffic (< 100 real submissions/month), birthday-paradox collisions
 * on the short form are negligible — we accept this trade-off for v1 rather
 * than deduplicating against an ephemeral decoy store.
 */
function decoySuccess(): SubmitInquiryResult {
  const { submissionId } = makeSubmissionId();
  return { submissionId, estimate: null };
}

/** Handler extracted for testability — invoked directly by vitest integration tests. */
export async function submitInquiryHandler(
  input: LeadInput,
  context: { clientAddress?: string; request: Request },
): Promise<SubmitInquiryResult> {
  const ip = context.clientAddress ?? "unknown";
  const userAgent = context.request.headers.get("user-agent") ?? "";

  // 1–3. Silent bot gates — FAST, no I/O, no tell to attacker (SPAM-01, SPAM-03, SPAM-04).
  if (!checkHoneypot(input)) return decoySuccess();
  if (!checkMinTime(input)) return decoySuccess();
  if (!checkUrlHeuristics(input)) return decoySuccess();

  // 4. Turnstile server-verify (LEAD-02, SPAM-02).
  // verifyTurnstile never throws — returns {success:false, error-codes:[...]} on any failure.
  const { verifyTurnstile } = await import("@/lib/spam/turnstile");
  const turnstile = await verifyTurnstile(input.turnstileToken, ip, input.idempotencyKey);
  if (!turnstile.success) {
    throw new ActionError({ code: "FORBIDDEN", message: "turnstile_failed" });
  }

  const store = getLeadStore();
  const ipHash = hashIp(ip);

  // 5. Rate-limit check (LEAD-03). Under cap → records a hit + allows; at cap → no hit, reject.
  //
  // CR-02 (accepted_design_tradeoff): TOO_MANY_REQUESTS is INTENTIONALLY distinguishable
  // from the silent-decoy bot gates above (honeypot/min-time/URL heuristics return
  // decoySuccess()). The plan decision (CONTEXT D-18) surfaces rate-limiting to real
  // users via the "rate_limit" alert so they know to try again later, rather than
  // silently dropping legitimate repeat submissions. A sophisticated attacker can
  // detect this gate fires, but cannot bypass it — the cap is hard and the hit is
  // not recorded on the reject path (see rateLimitCheck), so quota is preserved.
  // Do NOT unify this path with decoySuccess() without reopening the D-18 UX decision.
  const rl = await rateLimitCheck(store, ipHash);
  if (!rl.allowed) {
    throw new ActionError({ code: "TOO_MANY_REQUESTS", message: "rate_limited" });
  }

  // 5b. Server-side business-rule validation for eventDate (WR-03).
  //     The client runs the same validateEventDate() on blur; this covers the
  //     bot-bypass path where the client is skipped and the Action is posted
  //     directly. Format is already enforced by leadSchema; this adds the
  //     lead-time + blackout-date checks that require site config.
  const siteEntry = await getEntry("site", "site");
  const siteData = siteEntry?.data;
  if (siteData) {
    const dateError = validateLeadBusinessRules(
      { eventDate: input.eventDate },
      {
        leadTimeDays: siteData.leadTimeDays,
        blackoutDates: siteData.blackoutDates,
        email: siteData.email,
      },
    );
    if (dateError) {
      throw new ActionError({ code: "BAD_REQUEST", message: dateError });
    }
  }

  // 6. Idempotency (LEAD-04) — replay of the same request returns the prior record,
  //    SKIPS store append and SKIPS email fan-out.
  const prior = await store.findByIdempotencyKey(input.idempotencyKey);
  if (prior) {
    return {
      submissionId: prior.submissionId,
      estimate:
        prior.finalEstimateMin != null && prior.finalEstimateMax != null
          ? { min: prior.finalEstimateMin, max: prior.finalEstimateMax }
          : null,
    };
  }

  // 7. Compute server-stamped estimate (EST-01, EST-02) from authoritative package data.
  //    Client-supplied estimate is never trusted — we re-run the same pure function
  //    against the same Content Collection entries that built the site.
  const packagesCollection = await getCollection("packages");
  const packages = packagesCollection.map((e) => e.data);
  const range = estimate({
    guests: input.guestCount,
    packageId: input.packageId,
    packages,
  });

  // 8. Store-first append (LEAD-05). This MUST succeed before any email is sent;
  //    if the append throws we surface INTERNAL_SERVER_ERROR and NO email is sent.
  const { ulid, submissionId } = makeSubmissionId();
  const record: LeadRecord = {
    createdAt: new Date().toISOString(),
    submissionId,
    ulid,
    idempotencyKey: input.idempotencyKey,
    eventType: input.eventType,
    guestCount: input.guestCount,
    eventDate: input.eventDate,
    packageId: input.packageId,
    finalEstimateMin: range?.min ?? null,
    finalEstimateMax: range?.max ?? null,
    name: input.name,
    email: input.email,
    phone: input.phone,
    zip: input.zip ?? "",
    eventAddress: input.eventAddress ?? "",
    eventCity: input.eventCity ?? "",
    notes: input.notes ?? "",
    howHeard: input.howHeard ?? "",
    contactMethod: input.contactMethod,
    ipHash,
    notifyEmailStatus: "pending",
    confirmEmailStatus: "pending",
    retryCount: 0,
    userAgent,
  };

  try {
    await store.append(record);
  } catch (err) {
    // PII-safe log — only the submissionId and error reason string.
    // biome-ignore lint/suspicious/noConsole: server-side error log is intentional
    console.error("lead_store_append_failed", {
      submissionId,
      reason: String(err),
    });
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "store_failed",
    });
  }

  // 9. Email fan-out with Promise.allSettled (LEAD-10). Neither failure aborts the
  //    other; the lead record is already persisted so email failures leave the
  //    retry cron (Plan 06) a clean row to work with via findPendingEmails.
  const [notifyResult, confirmResult] = await Promise.allSettled([
    sendLeadNotification(record),
    sendLeadConfirmation(record),
  ]);
  const statuses = {
    notify: notifyResult.status === "fulfilled" ? ("sent" as const) : ("failed" as const),
    confirm: confirmResult.status === "fulfilled" ? ("sent" as const) : ("failed" as const),
  };

  try {
    await store.updateEmailStatuses(submissionId, statuses);
  } catch (err) {
    // Non-fatal — Plan 06 cron will recompute pending state on the next pass.
    // biome-ignore lint/suspicious/noConsole: server-side error log is intentional
    console.error("email_status_update_failed", {
      submissionId,
      reason: String(err),
    });
  }

  // PII-safe failure logs — only submissionId + reason string, no email/phone/name.
  if (notifyResult.status === "rejected") {
    // biome-ignore lint/suspicious/noConsole: server-side error log is intentional
    console.error("notify_email_failed", {
      submissionId,
      reason: String(notifyResult.reason),
    });
  }
  if (confirmResult.status === "rejected") {
    // biome-ignore lint/suspicious/noConsole: server-side error log is intentional
    console.error("confirm_email_failed", {
      submissionId,
      reason: String(confirmResult.reason),
    });
  }

  return { submissionId, estimate: range };
}

/** The Astro Action export — Zod input re-parses server-side (LEAD-01). */
export const submitInquiry = defineAction({
  accept: "form",
  input: leadSchema,
  handler: submitInquiryHandler,
});
