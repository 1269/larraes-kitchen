---
phase: 03-inquiry-wizard-lead-pipeline
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 55
files_reviewed_list:
  - .env.example
  - package.json
  - playwright.config.ts
  - scripts/check-turnstile-keys.sh
  - src/actions/submitInquiry.ts
  - src/actions/index.ts
  - src/components/Nav.astro
  - src/components/NavController.tsx
  - src/components/sections/ContactSection.astro
  - src/components/sections/HeroSection.astro
  - src/components/sections/PackagesSection.astro
  - src/components/ui/dialog.tsx
  - src/components/ui/form.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/components/ui/radio-group.tsx
  - src/components/ui/textarea.tsx
  - src/components/wizard/ConfirmationView.tsx
  - src/components/wizard/DirtyDismissGuard.tsx
  - src/components/wizard/hooks/useDebouncedValue.ts
  - src/components/wizard/hooks/useUrlSync.ts
  - src/components/wizard/hooks/useWizardAnalytics.ts
  - src/components/wizard/hooks/useWizardPersistence.ts
  - src/components/wizard/ProgressIndicator.tsx
  - src/components/wizard/steps/Step1EventType.tsx
  - src/components/wizard/steps/Step2GuestsDate.tsx
  - src/components/wizard/steps/Step3Package.tsx
  - src/components/wizard/steps/Step4Contact.tsx
  - src/components/wizard/StickyEstimateBar.tsx
  - src/components/wizard/validation/eventDate.ts
  - src/components/wizard/WizardDialog.astro
  - src/components/wizard/WizardIsland.tsx
  - src/env.d.ts
  - src/layouts/BaseLayout.astro
  - src/lib/email/send.ts
  - src/lib/email/templates/LeadConfirmation.tsx
  - src/lib/email/templates/LeadNotification.tsx
  - src/lib/forms/zodResolver.ts
  - src/lib/leads/botGates.ts
  - src/lib/leads/GoogleSheetsAdapter.ts
  - src/lib/leads/InMemoryLeadStore.ts
  - src/lib/leads/LeadStore.ts
  - src/lib/leads/rateLimit.ts
  - src/lib/leads/store.ts
  - src/lib/leads/submissionId.ts
  - src/lib/pricing/estimate.ts
  - src/lib/schemas/lead.ts
  - src/lib/serviceArea.ts
  - src/lib/spam/turnstile.ts
  - src/pages/api/cron/retry-email.ts
  - src/pages/api/webhooks/resend.ts
  - src/pages/index.astro
  - vercel.json
  - vitest.config.ts
findings:
  critical: 4
  warning: 6
  info: 5
  total: 15
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-16
**Depth:** standard
**Files Reviewed:** 55
**Status:** issues_found

## Summary

This phase delivers the entire inquiry-to-lead pipeline: the 4-step wizard React island, Astro Action server handler, Google Sheets persistence, Resend email fan-out, retry cron, and Resend delivery webhook. The architecture is sound — store-first ordering is correct, HMAC verification uses `timingSafeEqual`, the decoy success path is implemented, PII is kept out of most analytics and log calls. However, four issues rise to Critical: an information leak in the `safeText` formula-injection guard that misses non-`=` formula prefixes; a timing-oracle gap in the rate-limit rejection path; a silent lead-loss risk in the `markEmailRetry` webhook path where a `store.markEmailRetry` failure swallows both the error and returns 200; and a missing check that allows the CRON_SECRET comparison to succeed vacuously when the env var is unset in dev. Six warnings are noted including formula-injection coverage gaps, `onSubmit` missing from `useCallback` deps, and session-storage snapshot not being cleared on cron retry success.

---

## Critical Issues

### CR-01: Formula injection guard misses `+`, `-`, `@`, and tab prefixes

**File:** `src/lib/leads/GoogleSheetsAdapter.ts:26-29`

**Issue:** `safeText` only prefixes values that start with `=`. Google Sheets (and LibreOffice Calc) treat cells starting with `+`, `-`, `@`, and a leading tab character as formula triggers in some configurations, particularly when a human later changes the column format from "Plain text" to "Automatic". The comment in the code acknowledges this is a "belt-and-suspenders" secondary defence against a manual format flip, but the primary guard (`valueInputOption: "RAW"`) is the one that actually stops execution today. The secondary guard is still worth fixing to be complete, because a human admin manually reformatting a column to "Automatic" after the fact could cause injected `+`/`-`/`@` cells to execute.

**Fix:**
```typescript
const safeText = (s: string | null | undefined): string => {
  if (!s) return "";
  // Prefix any cell-formula trigger character. = is the primary trigger;
  // +, -, @, and \t are secondary triggers in Automatic-formatted columns.
  return /^[=+\-@\t]/.test(s) ? `'${s}` : s;
};
```

---

### CR-02: Rate-limit rejection is timing-distinguishable from real success (timing oracle)

**File:** `src/actions/submitInquiry.ts:69-72` and `src/lib/leads/rateLimit.ts:42-63`

**Issue:** The review prompt flags bot-reject paths must be indistinguishable in both response shape AND response timing. The three silent-decoy gates (honeypot, min-time, URL heuristics) correctly execute before any I/O, so they return almost immediately. The Turnstile gate correctly reaches the network (equal latency to a real submission). However, the rate-limit rejection at step 5 (lines 69-72 of `submitInquiry.ts`) also returns extremely quickly — it only does a `countRateLimitHits` read, then throws `TOO_MANY_REQUESTS` without performing the `recordRateLimitHit` write, the idempotency lookup, the `getCollection` call, the `store.append`, or the email fan-out. A sophisticated attacker timing responses can detect the rate-limit gate is firing (sub-10ms vs. normal ~200-500ms flow) and adjust their submission cadence to stay under the cap while still flooding valid (but non-persisted) requests past Turnstile.

More importantly: `TOO_MANY_REQUESTS` is **not** a decoy-200 — it's an explicit `ActionError` that the client maps to `setAlert("rate_limit")`, which shows a visible error. This is by design per the plan (`rate_limited` is explicitly surfaced). So the timing issue is a secondary concern. The real correctness concern is that returning `TOO_MANY_REQUESTS` (a non-200 status code) is distinguishable from the silent-decoy 200 path. A bot that submits repeatedly can tell when it trips rate-limiting vs. the honeypot/min-time gates. This is architecturally intentional per the plan comment, but it means the rate-limit gate does not satisfy the same "silent decoy" contract the other bot gates satisfy.

**If the intent is to also silence rate-limit rejections from bots:** Return `decoySuccess()` for rate-limit hits rather than throwing `TOO_MANY_REQUESTS`. If the intent is to surface rate-limiting to real users (the current approach, legitimate), this is not a bug — but document the divergence from the SPAM-01/03/04 decoy contract in the code comment so future authors don't accidentally unify the error paths.

**Fix (document-only if intentional, or code change if silent-decoy is desired):**
```typescript
// Option A: make rate-limit also a silent decoy (uniform timing + shape)
const rl = await rateLimitCheck(store, ipHash);
if (!rl.allowed) return decoySuccess();

// Option B (current behavior — keep, but add clarifying comment):
// NOTE: TOO_MANY_REQUESTS is intentionally distinguishable from the silent-decoy
// bot gates. Real users see a "try again" message; bots can detect the gate but
// cannot bypass it (the cap is hard). This is an accepted trade-off per plan D-18.
```

---

### CR-03: CRON_SECRET check succeeds vacuously when env var is unset

**File:** `src/pages/api/cron/retry-email.ts:30-36`

**Issue:** The bearer token check is:
```typescript
const expected = `Bearer ${import.meta.env.CRON_SECRET}`;
if (!auth || auth !== expected) { ... }
```

When `CRON_SECRET` is undefined (not set in the environment), `import.meta.env.CRON_SECRET` is `undefined`, and the template literal produces the string `"Bearer undefined"`. If a caller sends the header `Authorization: Bearer undefined`, the check passes and the cron endpoint runs with no authentication. This is a real attack surface in a misconfigured dev or staging environment where `CRON_SECRET` is missing from `.env`.

The guard should fail-closed when the secret is not set:

**Fix:**
```typescript
export const GET: APIRoute = async ({ request }) => {
  const cronSecret = import.meta.env.CRON_SECRET;
  if (!cronSecret) {
    // Fail-closed: if the secret is not configured, refuse all requests.
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (!auth || auth !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  // ...rest of handler
};
```

---

### CR-04: Webhook `markEmailRetry` failure silently returns 200, Resend stops retrying

**File:** `src/pages/api/webhooks/resend.ts:123-135`

**Issue:** When `store.markEmailRetry` throws (e.g., Sheets API quota exceeded, network error), the error is logged but the endpoint still returns `{ ok: true, handled: true }` with status 200. Resend interprets 200 as a successful acknowledgment and **will not retry the webhook**. The delivery status update is permanently lost. Since the webhook's job is to update email status columns from "pending" to "sent"/"failed", a silent failure here means the retry cron will continue to re-send emails that were already delivered (Resend marked them delivered, but the store still shows "pending"), causing duplicate emails to Larrae and to the inquirer.

This is different from the intentional "non-fatal" pattern in `submitInquiry.ts` (where the cron will self-heal) — here the cron cannot self-heal because the webhook is the *only* channel that receives delivery confirmation events. The cron looks at `retryCount < 3` and re-fires. After the 3rd retry, the lead is abandoned even if email actually delivered.

**Fix:** Return a 500 on store failure so Resend retries the webhook delivery:
```typescript
try {
  await store.markEmailRetry(submissionId, which, status);
} catch (err) {
  console.error("resend_webhook_update_failed", {
    submissionId,
    reason: String(err),
  });
  // Return 500 so Resend retries this webhook event.
  return new Response(JSON.stringify({ error: "store_error" }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });
}
```

---

## Warnings

### WR-01: `safeText` not applied to `email`, `phone`, `howHeard` fields written to Sheets

**File:** `src/lib/leads/GoogleSheetsAdapter.ts:32-59`

**Issue:** `leadRecordToRow` applies `safeText()` to `name` (K), `eventAddress` (O), `eventCity` (P), `notes` (Q), and `userAgent` (X). However, `email` (L), `phone` (M), and `howHeard` (R) are written raw. While Zod validation constrains `email` to valid email format and `phone` to length 7-32, and the primary `valueInputOption: "RAW"` guard is in place, these fields are free-text in principle and a determined attacker could potentially construct a phone value like `+1-800-FORMULA`. Belt-and-suspenders would be to apply `safeText` to all string fields.

**Fix:**
```typescript
r.email,      // L — consider: safeText(r.email)
r.phone,      // M — consider: safeText(r.phone)
// ...
r.howHeard,   // R — consider: safeText(r.howHeard)
```
Given `valueInputOption: "RAW"` is the load-bearing guard, this is a warning rather than critical. But the inconsistency in applying `safeText` only to some fields is a maintenance hazard.

---

### WR-02: `onSubmit` useCallback has empty dependency array but captures no stable references

**File:** `src/components/wizard/WizardIsland.tsx:271-340`

**Issue:** `onSubmit` is wrapped in `useCallback(async (values) => { ... }, [])`. The callback body uses `setIsSubmitting`, `setAlert`, `setSubmissionId`, `setFinalEstimate`, `setMode`, and `wizardAnalytics`. React's `useState` setters are stable by contract, and `wizardAnalytics` is a module-level object, so these are fine. However the callback also does a dynamic `import("astro:actions")` and calls `clearSnapshot()` — both of which are also stable. The empty deps array is therefore technically correct in this case, but Biome/ESLint's `react-hooks/exhaustive-deps` would flag this because it doesn't know that setter references are stable. More critically: if `site.email` (passed in via `Props`) were ever needed in this callback for fallback alerting, it would be captured stale. The current code does not use `site` in `onSubmit`, but `Step4Contact` uses `site.email` for alert copy — that is passed via the component tree, not through `onSubmit`. No actual bug today, but the pattern invites future stale-closure issues.

**Fix:** Add explicit `[]` comment explaining why deps are intentionally empty, or list the stable refs explicitly:
```typescript
const onSubmit = useCallback(
  async (values: LeadInput) => { /* ... */ },
  // Deps intentionally empty: all accessed values are stable (useState setters,
  // module-level analytics object, clearSnapshot utility).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [],
);
```

---

### WR-03: `eventDate` validation only runs client-side via `onBlur`; server-side Zod schema accepts any `YYYY-MM-DD`

**File:** `src/components/wizard/steps/Step2GuestsDate.tsx:140-155` and `src/lib/schemas/lead.ts:10`

**Issue:** The server-side `leadSchema` validates `eventDate` only as a regex matching `YYYY-MM-DD`. It does not re-enforce lead time or blackout dates. The `validateEventDate` function (with lead-time and blackout checks) runs only in the client `onBlur` handler. This means a bot that bypasses the client and submits a past date or blackout date directly to the Astro Action will have it persisted. The plan comment `// T-03-17 mitigation: step-boundary validation is UX only; Plan 05 Action re-parses the same leadSchema server-side (LEAD-01)` acknowledges this but the Action re-parse only checks format, not business rules.

This is a data quality issue rather than a security issue (lead still gets stored, Larrae just sees a past date), but for blackout dates it could create confusion where a persisted lead expects service on a date the business cannot provide.

**Fix (recommended):** Pass `leadTimeDays` and `blackoutDates` into the Action (or keep them server-side in a config module) and add a Zod `.superRefine` on `eventDate`:
```typescript
// In leadSchema or in submitInquiryHandler after step 7:
const dateError = validateEventDate(input.eventDate, {
  leadTimeDays: SITE_LEAD_TIME_DAYS,
  blackoutDates: SITE_BLACKOUT_DATES,
});
if (dateError) {
  throw new ActionError({ code: "BAD_REQUEST", message: dateError });
}
```

---

### WR-04: `GoogleSheetsAdapter.countRateLimitHits` reads all rows on every request; no header-row guard

**File:** `src/lib/leads/GoogleSheetsAdapter.ts:224-232`

**Issue:** `countRateLimitHits` fetches the entire `RateLimit!A:C` range and filters in memory. Unlike `readAllLeadRows()` (which slices off the header row with `LEADS_HEADER_ROW_COUNT`), the rate-limit read has no header row guard. If the RateLimit tab has a header row (which is common for human-readable spreadsheets), the first row's data would be `["ip_hash", "timestamp_ms", "action"]` — `Number("timestamp_ms")` is `NaN`, which is `>= cutoff` is `false`, so the header row is silently ignored by the `>=` comparison. This is accidentally safe, but only because `NaN >= number` is always `false`. The code should be explicit rather than relying on this floating-point behavior. Additionally: if the sheet is large (thousands of rate-limit rows), this fetch will become slow and could add meaningful latency to every submission.

**Fix:**
```typescript
// Skip the first row if it looks like a header (non-numeric timestamp)
const rows = (res.data.values ?? []) as (string | number | null | undefined)[][];
const dataRows = rows.filter(r => {
  const ts = Number(r[1] ?? 0);
  return Number.isFinite(ts) && ts > 0; // excludes header rows
});
return dataRows.filter(
  (r) => String(r[0] ?? "") === ipHash && Number(r[1] ?? 0) >= cutoff,
).length;
```

---

### WR-05: Decoy submissions are included in `makeSubmissionId()` collision space

**File:** `src/actions/submitInquiry.ts:39-42`

**Issue:** `decoySuccess()` calls `makeSubmissionId()`, consuming a fresh ULID for every bot request. The `LK-XXXXXX` short form uses only the last 6 Crockford-base32 characters of a 26-character ULID (32^6 = ~1 billion combinations). Under high bot pressure, decoy IDs are generated at high volume and never stored — so the IDs are not tracked for collision avoidance. A legitimate user submission could theoretically produce the same `LK-XXXXXX` as a previously-issued decoy. The probability is very low at this traffic scale, but since this is the user-visible reference ID shown on the confirmation screen and in emails, a collision would confuse Larrae. The full 26-char ULID (stored in column C) is collision-safe; the 6-char short form is not deduplicated across decoys.

**Fix:** No code change required for v1 scale — the collision probability at catering-website volume is negligible. Recommend adding a comment noting this trade-off:
```typescript
// NOTE: decoy IDs are not persisted, so short-form collisions with real IDs
// are theoretically possible under sustained bot pressure. At expected traffic
// (< 100 real submissions/month), the 32^6 space makes this negligible.
```

---

### WR-06: `RESEND_WEBHOOK_SECRET` absence in `verifySignature` returns `false` silently, all webhooks rejected

**File:** `src/pages/api/webhooks/resend.ts:44-45`

**Issue:** If `RESEND_WEBHOOK_SECRET` is not set (e.g., misconfigured staging environment), `verifySignature` returns `false` and all incoming webhook events are rejected with 401. This means every Resend delivery/bounce event is permanently dropped (Resend will retry a few times, then stop). The endpoint returns 401 without logging why, so the operator would see unexplained 401s in Vercel logs without a clear indication that the env var is missing.

This is the correct fail-closed behavior for security, but it should log a diagnostic:

**Fix:**
```typescript
const secret = import.meta.env.RESEND_WEBHOOK_SECRET;
if (!secret) {
  // biome-ignore lint/suspicious/noConsole: server-side config error log
  console.error("resend_webhook_secret_missing");
  return false;
}
```

---

## Info

### IN-01: `useDebouncedValue` uses `window.setTimeout` instead of `globalThis.setTimeout`

**File:** `src/components/wizard/hooks/useDebouncedValue.ts:11-12`

**Issue:** The hook references `window.setTimeout` and `window.clearTimeout` directly. In a vitest/jsdom test environment `window` is available, but in a server-side rendering context `window` is not defined. The hook has no SSR guard (`typeof window !== "undefined"`). The comment notes this is a client-only hook (it uses `useState`/`useEffect`), and Astro's `client:load` directive ensures it only runs in the browser — but any future usage of this hook in a non-`client:load` island would throw.

**Fix:**
```typescript
const id = setTimeout(() => setDebounced(value), delayMs); // use globalThis.setTimeout
return () => clearTimeout(id);
```

---

### IN-02: `leadSchema` honeypot field allows `z.string().max(0)` which Zod v4 may not infer correctly

**File:** `src/lib/schemas/lead.ts:33`

**Issue:** `honeypot: z.string().max(0)` is a valid schema — an empty string passes, any non-empty value fails. However, the Zod v4 `z.string().max(0)` type inference produces `string` (not `""` literal), so there's no type-level guarantee that `honeypot` is always `""`. The `checkHoneypot` function in `botGates.ts` checks `!input.honeypot || input.honeypot.length === 0`, which is equivalent but slightly redundant (`length === 0` implies falsy for strings). This is a minor style nit — the schema and the check are both correct.

---

### IN-03: `store.ts` singleton is never reset between serverless function cold starts

**File:** `src/lib/leads/store.ts:9`

**Issue:** The module-level `let instance: LeadStore | null = null` singleton pattern works correctly within a single Node process but may behave unexpectedly across Vercel serverless function invocations if the function is reused (warm invocations share the module). For `GoogleSheetsAdapter`, this is fine (the adapter is stateless after construction). For `InMemoryLeadStore` (dev fallback), data accumulates across warm invocations but is wiped on cold starts — which is expected and documented. No bug, but worth noting for future operators.

---

### IN-04: `package.json` pins `@hookform/resolvers@^3.10.0` but the zodResolver shim targets v3 behavior

**File:** `package.json:29`, `src/lib/forms/zodResolver.ts:1-12`

**Issue:** The shim in `zodResolver.ts` explicitly documents it patches the v3 resolver's `Array.isArray(err.errors)` check. The comment correctly says "Once the project migrates to `@hookform/resolvers@5`, delete this file." The `package.json` pins `^3.10.0`, meaning a `pnpm update` could bump to v4.x (a semver-major-compatible range only covers within the major), so v5 is blocked. This is safe for now, but the `^3` range means v3.x updates will apply automatically. If a v3.x patch release changes the `errors` property behavior again, the shim could double-patch. Mark the shim with a version gate check as a reminder.

---

### IN-05: `ContactSection.astro` uses raw `mapImagePath` string without existency check

**File:** `src/components/sections/ContactSection.astro:14-15`

**Issue:** `const mapImagePath = "/images/service-area-map.jpg"` is passed to `<Picture src={mapImagePath}>`. Astro's `<Picture>` component with a remote/public string path bypasses the build-time asset pipeline and does not verify the file exists at build time. The comment acknowledges the image "may be absent in placeholder era." If the file is absent at runtime, the `<img>` will render a broken image. This is a pre-existing accepted placeholder state, not a security or data-loss issue. Flagged as info for tracking.

---

_Reviewed: 2026-04-16_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
