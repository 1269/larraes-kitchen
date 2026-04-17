// Source: Plan 03-06 Task 1 — LEAD-12 Resend delivery webhook.
// RESEARCH §Pitfall 8 (HMAC timingSafeEqual) + §LEAD-12 observability.
//
// Correlation contract (read-side of the grep-coupled boundary established in
// Plan 05's src/lib/email/send.ts):
//
//   event.data.tags.submission_id   → routes to the LeadStore row.
//   event.data.tags.which           → "notify" | "confirm" — picks the column.
//
// Plan 05 emits BOTH tags on every send. If the tags are missing (forwarding
// from a test helper, a deprecated event type, etc.), the webhook still returns
// 200 (so Resend stops retrying) but logs `resend_webhook_missing_tags` — no
// store mutation. The handler is grep-enforced via Plan 06 acceptance criteria.
//
// T-03-43 / T-03-44 mitigation: HMAC SHA-256 of the raw body (read via
// request.text() — never JSON-parsed first) compared with crypto.timingSafeEqual.
// Attacker would need RESEND_WEBHOOK_SECRET to forge a valid signature; any byte
// tampered in the body invalidates the HMAC.
//
// T-03-45 mitigation: errors return generic `{ error: "invalid_signature" | "invalid_json" }`;
// never echo the body.
export const prerender = false;

import { createHmac, timingSafeEqual } from "node:crypto";
import type { APIRoute } from "astro";
import type { EmailStatus } from "@/lib/leads/LeadStore";
import { getLeadStore } from "@/lib/leads/store";

interface ResendEventData {
  email_id?: string;
  to?: string[];
  subject?: string;
  tags?: Record<string, string>;
}

interface ResendEvent {
  type: string;
  data?: ResendEventData;
  created_at?: string;
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const secret = import.meta.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // WR-06: diagnostic log for misconfigured environments. Without this,
    // operators see unexplained 401s in Vercel logs with no hint that the
    // env var is missing. Still fail-closed — we return false below.
    console.error("resend_webhook_secret_missing");
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Header format may be bare hex OR "sha256=<hex>"; accept both.
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  // hex->Buffer throws on odd length or non-hex chars; guard.
  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(expected, "hex");
    b = Buffer.from(provided, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function resolveStatus(eventType: string): EmailStatus | null {
  if (eventType === "email.delivered" || eventType === "email.sent") return "sent";
  if (
    eventType === "email.bounced" ||
    eventType === "email.complained" ||
    eventType === "email.delivery_delayed"
  ) {
    return "failed";
  }
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  // MUST read the raw body first — JSON.parse + re-stringify would mutate
  // whitespace/key order and break the HMAC check.
  const raw = await request.text();
  const signatureHeader =
    request.headers.get("x-resend-signature") ?? request.headers.get("resend-signature");

  if (!verifySignature(raw, signatureHeader)) {
    return new Response(JSON.stringify({ error: "invalid_signature" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Correlation tags emitted by Plan 05 send.ts. Do NOT rename keys.
  const submissionId = event.data?.tags?.submission_id;
  const which = event.data?.tags?.which;
  if (!submissionId || (which !== "notify" && which !== "confirm")) {
    console.warn("resend_webhook_missing_tags", { type: event.type });
    return new Response(JSON.stringify({ ok: true, handled: false }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const status = resolveStatus(event.type);
  if (!status) {
    // Event types we don't act on (open/click/sent-ack variants). Acknowledge.
    return new Response(JSON.stringify({ ok: true, handled: false }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getLeadStore();
  try {
    await store.markEmailRetry(submissionId, which, status);
  } catch (err) {
    console.error("resend_webhook_update_failed", {
      submissionId,
      reason: String(err),
    });
    // CR-04: Return 500 so Resend retries the webhook. Previously this path
    // returned 200, which Resend treats as a successful ACK — permanently
    // dropping the delivery-status update. A dropped update makes the retry
    // cron think the email is still pending and re-send it, causing duplicate
    // emails to the chef and/or the inquirer. Returning 500 keeps Resend's
    // built-in webhook retry loop alive until the store comes back online.
    return new Response(JSON.stringify({ error: "store_error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, handled: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
