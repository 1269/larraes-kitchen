---
phase: 03-inquiry-wizard-lead-pipeline
plan: 05
subsystem: server
tags: [astro-actions, resend, react-email, turnstile, cloudflare-siteverify, promise-allsettled, silent-decoy, lead-12-tags, store-first, 9-step-pipeline]

requires:
  - phase: 01-foundation
    provides: leadSchema, estimate(), env typings (RESEND_API_KEY / RESEND_FROM_EMAIL / TURNSTILE_SECRET_KEY / PUBLIC_TURNSTILE_SITE_KEY)
  - phase: 03-inquiry-wizard-lead-pipeline/03-04
    provides: LeadStore contract, InMemoryLeadStore, botGates (pure classifiers), rateLimit composition, makeSubmissionId, getLeadStore factory
provides:
  - submitInquiry Astro Action + submitInquiryHandler (9-step store-first pipeline)
  - src/actions/index.ts `server` barrel required by Astro 6 Actions runtime
  - verifyTurnstile() siteverify client — never throws, returns success:false + error-codes on any failure
  - LeadNotification React Email template — action-first Larrae layout per D-16
  - LeadConfirmation React Email template — warm heritage voice per D-17
  - sendLeadNotification + sendLeadConfirmation Resend wrappers emitting LEAD-12 correlation tags on BOTH sends
  - tests/unit/stubs/astro-actions.ts + tests/unit/stubs/astro-content.ts — Vite virtual-module aliases for vitest
affects: [03-06-email-retry-cron, 05-launch-readiness (production env provisioning)]

tech-stack:
  added: []  # resend + @react-email/components + @react-email/render already installed in Phase 1
  patterns:
    - "Handler extraction for testability: `export async function submitInquiryHandler(input, context)` + `export const submitInquiry = defineAction({...handler: submitInquiryHandler})`. Lets vitest drive the pipeline directly without spinning up Astro runtime."
    - "Silent-decoy return shape: `{ submissionId, estimate: null }` indistinguishable from real success. Never persists; never emails."
    - "Virtual-module vitest aliases: `astro:actions` → `tests/unit/stubs/astro-actions.ts`, `astro:content` → `tests/unit/stubs/astro-content.ts`. `vi.mock()` then overrides behavior inside specific tests."
    - "PII-safe server logging: every error log includes ONLY the submissionId + `String(reason)`. Never name/email/phone/notes."
    - "LEAD-12 tag contract: `tags: [{ name: 'submission_id', value: record.submissionId }, { name: 'which', value: 'notify' | 'confirm' }]` on every Resend send — grep-coupled with the Plan 06 webhook reader."

key-files:
  created:
    - src/actions/submitInquiry.ts
    - src/actions/index.ts
    - src/actions/__tests__/submitInquiry.test.ts
    - src/lib/spam/turnstile.ts
    - src/lib/spam/__tests__/turnstile.test.ts
    - src/lib/email/send.ts
    - src/lib/email/templates/LeadNotification.tsx
    - src/lib/email/templates/LeadConfirmation.tsx
    - src/lib/email/__tests__/LeadNotification.test.tsx
    - src/lib/email/__tests__/LeadConfirmation.test.tsx
    - tests/unit/stubs/astro-actions.ts
    - tests/unit/stubs/astro-content.ts
  modified:
    - src/components/wizard/WizardIsland.tsx (Task 3 — removed LK-PLACE stub fallback)
    - vitest.config.ts (added astro:actions + astro:content aliases)

key-decisions:
  - "The Resend client is lazy-instantiated via `getResend()` and cached in module scope. `resetResendClientForTests()` exposed as a test-only escape hatch in case a future test needs to re-stub the API key. This keeps `new Resend(key)` off the import-time code path so tests that never touch sends don't need to stub `RESEND_API_KEY`."
  - "Turnstile client NEVER throws. Every failure mode (missing secret, HTTP non-OK, network error, Cloudflare-reported failure) resolves to `{ success: false, 'error-codes': [...] }`. Contract: the Action alone decides whether to throw `ActionError({ code: 'FORBIDDEN' })` — keeps error mapping centralized."
  - "Silent-decoy runs AFTER the Zod input parse succeeds. Astro's `defineAction({ input: leadSchema })` re-parses server-side before the handler executes; a malformed input (e.g., missing `turnstileToken`) throws `BAD_REQUEST` before our pipeline begins. Only well-formed-but-bot-flavored inputs reach `decoySuccess()`."
  - "Handler dynamically imports `@/lib/spam/turnstile` to satisfy `vi.mock('@/lib/spam/turnstile', ...)` in the integration test. Static top-level import would capture the real module before the test's mock registration."
  - "`updateEmailStatuses` error is non-fatal — caught and logged but the Action still returns success. Rationale: the lead record and emails are the committed artifacts; the status column is a tracking aid consumed by Plan 06's retry cron, which recomputes pending state from scratch each run."
  - "React SSR inserts `<!-- -->` comments between adjacent text nodes in rendered HTML. Template tests strip comments before substring-matching (`html.replace(/<!--[^]*?-->/g, '')`) rather than asserting on the raw output — preserves readability without coupling to React's internal rendering behavior."

patterns-established:
  - "9-step pipeline ordering: honeypot → minTime → urlHeuristics → turnstile → rateLimit → idempotency → estimate → store.append → Promise.allSettled emails. Plan 06 cron does NOT re-enter this pipeline; it only consumes `findPendingEmails` + `markEmailRetry`."
  - "Virtual-module stubs in `tests/unit/stubs/*.ts` — any future code that imports `astro:*` virtual modules gets automatic vitest resolution. Add new stubs + vitest.config.ts aliases as needed."
  - "Email template tests use `@react-email/render` + comment-stripping substring checks rather than snapshot tests — resilient to React renderer updates while still catching content regressions."
  - "LEAD-12 tag contract is a grep-enforced boundary. Future refactors of send.ts MUST preserve the literal strings `submission_id`, `which`, `notify`, `confirm` — verified by Plan 05 acceptance criteria `awk/grep` gates AND by Plan 06's webhook reader that does literal key access."

requirements-completed:
  - LEAD-01  # Zod re-parse server-side via defineAction({ input: leadSchema })
  - LEAD-02  # Turnstile server-verify before store or email
  - LEAD-03  # rate-limit 5/10min per hashed IP (composed from Plan 04 primitives)
  - LEAD-04  # idempotency via client UUID + store.findByIdempotencyKey
  - LEAD-05  # store before email — append awaited before Promise.allSettled
  - LEAD-07  # LeadRecord carries all 24 columns (computed + captured at Action)
  - LEAD-08  # Larrae notification email via sendLeadNotification
  - LEAD-09  # Inquirer confirmation email via sendLeadConfirmation
  - LEAD-10  # Email failures → status columns updated, lead record persists
  - LEAD-12  # Correlation tags {submission_id, which} on every Resend send
  - SPAM-01  # Honeypot silent-rejected with decoy 200
  - SPAM-02  # Turnstile widget verified server-side
  - SPAM-03  # Min-time threshold enforced server-side
  - SPAM-04  # URL-in-notes heuristic silent-rejected
  - SPAM-05  # site.email fallback surfaced via D-18 error alerts (client rendering shipped in Plan 03)
  - WIZ-12   # Submission confirmation returns real submissionId (stub LK-PLACE removed)
  - EST-01   # Estimate recomputed server-side from getCollection('packages')
  - EST-02   # Package data sourced exclusively from content collection — no hardcoded pricing

duration: 8min
completed: 2026-04-17
---

# Phase 03 Plan 05: submitInquiry Astro Action, React Email Templates, Turnstile Client Summary

**Server-side pipeline for the inquiry wizard: 9-step store-first Astro Action that silently decoys three bot gates, verifies Turnstile with Cloudflare, enforces rate-limit + idempotency, re-computes the estimate from the authoritative Content Collection, appends the lead record BEFORE fanning out Resend notify + confirmation emails via `Promise.allSettled`, and tags every outbound send with `{submission_id, which}` for Plan 06 webhook correlation. Wizard's placeholder `LK-PLACE` submit stub retired — real submission IDs flow end-to-end.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-17T01:24:51Z
- **Completed:** 2026-04-17T01:33:31Z
- **Tasks:** 3 (Task 1 + 2 TDD RED→GREEN; Task 3 refactor)
- **Files created:** 12 (6 source + 5 test + 1 vitest stub pair)
- **Files modified:** 2 (WizardIsland.tsx, vitest.config.ts)
- **Tests added:** 33 (16 Task 1 + 12 Task 2 + 5 existing template assertions re-verified)
- **Total test suite:** 162 passing across 18 files

## Full Pipeline Trace

```
POST /form-handler/submitInquiry  (FormData from WizardIsland)
  │
  ├─ Astro Action defineAction({ accept:'form', input:leadSchema })
  │    ├─ Zod re-parse (LEAD-01) — malformed → BAD_REQUEST (before handler runs)
  │    └─ handler(parsedInput, { clientAddress, request })
  │         │
  │         ├─ 1. checkHoneypot(input)          ── fail → decoySuccess() (200 with fake LK-XXXXXX, NOT stored)
  │         ├─ 2. checkMinTime(input)           ── fail → decoySuccess()
  │         ├─ 3. checkUrlHeuristics(input)     ── fail → decoySuccess()
  │         ├─ 4. verifyTurnstile(token, ip, idem) ── fail → throw ActionError FORBIDDEN
  │         ├─ 5. rateLimitCheck(store, hashIp(ip)) ── over cap → throw ActionError TOO_MANY_REQUESTS
  │         ├─ 6. store.findByIdempotencyKey(idem) ── hit → return prior { submissionId, estimate }
  │         ├─ 7. estimate({ guests, packageId, packages: getCollection('packages') })
  │         ├─ 8. store.append(record)          ── throws → throw ActionError INTERNAL_SERVER_ERROR
  │         ├─ 9. Promise.allSettled([
  │         │       sendLeadNotification(record),  → tags: [submission_id, which:notify]
  │         │       sendLeadConfirmation(record),  → tags: [submission_id, which:confirm]
  │         │    ])
  │         ├─    store.updateEmailStatuses(submissionId, { notify, confirm })
  │         └─    return { submissionId, estimate }
  │
  └─ Wizard onSubmit receives { data, error }
       ├─ error + isInputError(error) → setAlert('server'),  analytics.submitFailure('validation')
       ├─ error.code === 'FORBIDDEN'        → setAlert('turnstile'),   analytics.submitFailure('turnstile')
       ├─ error.code === 'TOO_MANY_REQUESTS' → setAlert('rate_limit'), analytics.submitFailure('rate_limit')
       ├─ error (INTERNAL)                   → setAlert('server'),     analytics.submitFailure('server_error')
       └─ data → setSubmissionId, setFinalEstimate, setMode('confirmation'), clearSnapshot
```

## Error → Client Alert Mapping (D-18)

| Server outcome | ActionError.code | Wizard setAlert | Client copy source | Mailto fallback |
|----------------|------------------|-----------------|--------------------|-----------------|
| Zod validation fail | `BAD_REQUEST` (astro built-in) + `isInputError()` true | `server` | UI-SPEC §Submission failure (generic) | yes (`site.email`) |
| Turnstile fail | `FORBIDDEN` | `turnstile` | UI-SPEC — "Having trouble verifying you're human..." | yes |
| Rate-limit hit | `TOO_MANY_REQUESTS` | `rate_limit` | UI-SPEC — "Too many attempts — please wait a few minutes..." | yes |
| Store append fail | `INTERNAL_SERVER_ERROR` | `server` | UI-SPEC — "Something went wrong on our end..." | yes |
| Email send fail | — (no throw; lead persists, statuses flipped) | n/a (success path) | Plan 06 cron retries | n/a |
| Bot gate tripped | — (returns 200 with decoy LK) | n/a (confirmation shown) | D-18 silent-reject: no tell to attacker | n/a |

## Email Template Render Fidelity

**LeadNotification (to Larrae):**
- Subject (locked, in `send.ts`): `New quote: {name} · {eventType} · {guestCount} guests · {date}`
- Eyebrow: `NEW QUOTE` (#B8621B uppercase)
- `<h1>` name in Lovelace/Playfair Display (#1C1B19)
- Tap-to-call phone: `<a href="tel:{digits}">{formatPhone(digits)}</a>` in primary green (#2E4A2F)
- Mailto email: same treatment
- Event summary inline: `{eventType} · {guestCount} guests · {date}`
- Playfair serif italic estimate: `Estimated $330–$420` OR `Estimated Custom quote — Larrae to follow up`
- Detail block: eyebrow `Detail` + notes/address/howHeard/contactMethod rows
- Monospace submission ID: `Reference: LK-XXXXXX`
- Footer: "From the Larrae's Kitchen site"
- `replyTo: record.email` — Larrae's reply goes straight to the inquirer

**LeadConfirmation (to inquirer):**
- Subject (locked, in `send.ts`): `We got your request — thanks, {firstName}`
- Eyebrow: `REQUEST RECEIVED`
- `<h1>` heading: `Thanks, {firstName} — your request is in.`
- Verbatim heritage opener (UI-SPEC locked): `We cook like family, and we treat every inquiry the same way.`
- 24-hour response expectation + spam-check reminder
- "What you told us" recap: event type / guests / date / package / estimate
- Monospace reference ID
- Mailto-link close: `Questions? Reply here or email {larraeEmail}.`
- `replyTo: larraeEmail` — inquirer's reply routes to Larrae

## Tag Emission Contract (B4 fix — LEAD-12)

| Send function | Tag array emitted |
|---------------|------------------|
| `sendLeadNotification(record)` | `[{ name: "submission_id", value: record.submissionId }, { name: "which", value: "notify" }]` |
| `sendLeadConfirmation(record)` | `[{ name: "submission_id", value: record.submissionId }, { name: "which", value: "confirm" }]` |

Plan 06 (`src/pages/api/webhooks/resend.ts`) will read `event.data.tags.submission_id` and `event.data.tags.which` to route delivery/bounce events back to the correct lead row + status column. **Do NOT rename the keys. Do NOT change the literal `notify` / `confirm` values.** These are verified by acceptance-criteria `awk`/`grep` gates in this plan.

## Integration Test Coverage Summary

12 submitInquiry scenarios (`src/actions/__tests__/submitInquiry.test.ts`):

| # | Scenario | Asserts |
|---|----------|---------|
| 1 | Happy path | row appended, both emails sent, estimate {330,420} returned |
| 2 | Honeypot filled | decoy 200, no store, no email |
| 3 | Min-time violation | decoy 200, no store, no email |
| 4 | URL-in-notes | decoy 200, no store, no email |
| 5 | Turnstile fail | `ActionError{code:'FORBIDDEN'}` thrown, no store |
| 6 | Rate-limit exceeded | `ActionError{code:'TOO_MANY_REQUESTS'}` thrown, no store |
| 7 | Idempotent replay | same submissionId, one row, one email per send type |
| 8 | Notify fails | notify='failed', confirm='sent', lead persists, Action returns success |
| 9 | Both emails fail | both statuses='failed', lead persists, Action returns success |
| 10 | Server-stamped estimate | {500,650} for 25 guests × medium (trusted only from server) |
| 11 | IP hash | 64-char hex digest stored, raw IP never persisted |
| 12 | User-agent capture | `record.userAgent` = request header value |

5 Turnstile client scenarios + 5 LeadNotification + 6 LeadConfirmation template scenarios.

## Preview Environment Provisioning Checklist

Before the first live preview submission works end-to-end, set these on Vercel Preview:

- [ ] `RESEND_API_KEY` — sandbox key from Resend Dashboard → API Keys (scope: Preview only for now)
- [ ] `RESEND_FROM_EMAIL` — placeholder `onboarding@resend.dev` until Phase 5 domain auth
- [ ] `PUBLIC_TURNSTILE_SITE_KEY` — test key `1x00000000000000000000AA` for Preview
- [ ] `TURNSTILE_SECRET_KEY` — test key `1x0000000000000000000000000000000AA` for Preview
- [ ] `GOOGLE_SHEETS_CREDENTIALS_JSON` — per `docs/sheets-setup.md` (Plan 04 runbook)
- [ ] `GOOGLE_SHEETS_LEAD_SHEET_ID` — same
- [ ] `CRON_SECRET` — any 32+ char random string (Plan 06 consumes)
- [ ] `RESEND_WEBHOOK_SECRET` — Resend webhook HMAC secret (Plan 06 consumes)

Without Resend + Turnstile keys, happy-path submissions will fail with `INTERNAL_SERVER_ERROR` (Resend client throws on missing key) or `FORBIDDEN` (Turnstile missing-input-secret). Without Google Sheets keys, dev mode silently falls back to `InMemoryLeadStore` (leads are lost on restart but the flow is exercisable).

## Plan 06 Wire-Up Note

Plan 06 (email retry cron + Resend webhook) consumes this plan's outputs:

```typescript
// src/pages/api/cron/retry-emails.ts (Plan 06)
import { getLeadStore } from "@/lib/leads/store";
import { sendLeadNotification, sendLeadConfirmation } from "@/lib/email/send";

const store = getLeadStore();
const pending = await store.findPendingEmails({ maxRetries: 3, minAgeMs: 60 * 60 * 1000 });
for (const record of pending) {
  if (record.notifyEmailStatus === "pending") {
    try { await sendLeadNotification(record); await store.markEmailRetry(record.submissionId, "notify", "sent"); }
    catch { await store.markEmailRetry(record.submissionId, "notify", "failed"); }
  }
  // same for confirm...
}

// src/pages/api/webhooks/resend.ts (Plan 06)
const submissionId = event.data?.tags?.submission_id;   // ← contract from send.ts
const which = event.data?.tags?.which;                   // ← "notify" | "confirm"
// verify HMAC, then update the correct status column
```

## Task Commits

Each task followed its appropriate cycle (TDD for Task 1 + 2, straight refactor for Task 3):

1. **Task 1 RED — failing tests for Turnstile + templates** — `74df353` (test)
2. **Task 1 GREEN — turnstile.ts + templates + send.ts with LEAD-12 tags** — `5029223` (feat)
3. **Task 2 RED — failing integration test for 9-step pipeline** — `516aad3` (test)
4. **Task 2 GREEN — submitInquiry.ts + index.ts + vitest virtual-module aliases** — `a0c4fba` (feat)
5. **Task 3 — remove LK-PLACE stub from WizardIsland** — `57cdf68` (refactor)

_(Plan metadata commit follows after SUMMARY writes.)_

## Files Created/Modified

### Source
- `src/actions/submitInquiry.ts` — 9-step pipeline, `submitInquiryHandler` extracted for testing.
- `src/actions/index.ts` — Astro 6 Actions barrel with `export const server = { submitInquiry }`.
- `src/lib/spam/turnstile.ts` — `verifyTurnstile(token, ip, idempotencyKey)` — never throws.
- `src/lib/email/send.ts` — `sendLeadNotification` + `sendLeadConfirmation`, both with LEAD-12 tags.
- `src/lib/email/templates/LeadNotification.tsx` — action-first Larrae email (D-16).
- `src/lib/email/templates/LeadConfirmation.tsx` — warm heritage confirmation (D-17).

### Tests
- `src/actions/__tests__/submitInquiry.test.ts` — 12 integration scenarios.
- `src/lib/spam/__tests__/turnstile.test.ts` — 5 siteverify-client scenarios.
- `src/lib/email/__tests__/LeadNotification.test.tsx` — 5 template render checks.
- `src/lib/email/__tests__/LeadConfirmation.test.tsx` — 6 template render checks.

### Test infrastructure
- `tests/unit/stubs/astro-actions.ts` — vitest virtual-module stub.
- `tests/unit/stubs/astro-content.ts` — vitest virtual-module stub.
- `vitest.config.ts` — added `resolve.alias` entries for the two virtual modules.

### Modified
- `src/components/wizard/WizardIsland.tsx` — removed the try/catch `LK-PLACE` fallback + the stale `submitInquiry not yet wired` early-throw. `onSubmit` now calls the real Action directly and maps errors to alerts per D-18.

## Decisions Made

- **Handler extraction over Astro runtime shimming.** Exposing `submitInquiryHandler` alongside `submitInquiry` lets vitest drive the pipeline with a vanilla `{clientAddress, request}` object. The Astro-level re-parse still happens on the real surface — tests just skip that layer by passing already-parsed `LeadInput` directly.
- **Virtual-module aliases instead of `server.deps.inline` / custom Vite plugin.** Two two-line stub files + two `resolve.alias` entries is the minimum surface area to unblock Vite's import-analysis. No new dependencies; no opaque magic.
- **Decoy success returns `estimate: null` always.** Matches the shape of real success for the custom-quote path; any client doing strict equality on `estimate` won't branch differently between a decoy and a legitimate custom-quote response. No information leak.
- **Dynamic import of `@/lib/spam/turnstile` inside the handler.** A top-level static import would freeze the module reference before vitest's `vi.mock('@/lib/spam/turnstile', ...)` call resolves. Dynamic import keeps the mock swappable per test.
- **Non-fatal `updateEmailStatuses` errors.** If the status-column update fails, we log and continue. Rationale: Plan 06's cron recomputes pending state on every run; a one-time update failure self-heals on the next cycle, so failing the Action would only add user-facing pain for no integrity gain.
- **Comment-stripped substring assertions in email template tests.** React SSR inserts `<!-- -->` between adjacent text nodes; snapshot-testing would couple to that formatting. Stripping comments pre-assert keeps tests readable AND resilient to React renderer changes.

## Deviations from Plan

**None — plan executed as written, with two necessary test-infrastructure additions automatically applied under Rule 3 (blocking build issues fixed inline):**

1. **[Rule 3 — Blocking issue] Virtual-module vitest stubs.** The plan's Task 2 test file imports `astro:actions` and `astro:content` via `vi.mock()`, but Vite's import-analysis resolves module specifiers BEFORE vitest's mock registration runs. Without stub files + `resolve.alias` entries, vitest cannot even load the test module. Added `tests/unit/stubs/astro-actions.ts` (exports `ActionError`, `defineAction`, `isInputError`), `tests/unit/stubs/astro-content.ts` (exports `getCollection`, `getEntry`), and two entries to `vitest.config.ts` `resolve.alias`. This pattern is reusable for any future test that touches Astro virtual modules.

2. **[Rule 1 — Test assertion precision] React SSR comment markers.** Two template test cases initially failed with `expected HTML to contain 'Thanks, Ethan'` because React SSR interleaves `<!-- -->` between adjacent text/expression nodes (`Thanks, <!-- -->Ethan<!-- --> — your request is in.`). Fixed by stripping comments with `html.replace(/<!--[^]*?-->/g, '')` before the substring match. Test semantics preserved; dependency on internal React renderer formatting removed.

**Total deviations:** 2 (both infrastructure-level, fully within Rule 3 / Rule 1 scope)
**Impact on plan:** Zero scope creep; test harness strengthened for future plans.

## Issues Encountered

- **Node engine warning.** The worktree is on Node 23.8 vs. the project requirement `>=22.12 <23`. Warning only — tests and build pass. Out of scope for this plan (will be revisited in Phase 5 launch readiness).
- **Vercel build warning: `file: lines` unknown CSS property.** Appears in Tailwind v4 generated output — pre-existing from prior phases, unrelated to this plan's work. Out of scope (Rule: pre-existing warnings deferred).

## Known Stubs

None. The Plan 03 Task 2 `LK-PLACE` stub is the last placeholder in the wizard pipeline and was retired in Task 3 of this plan. Every code path now flows through the real Action.

## Self-Check: PASSED

**Claimed files exist on disk:**
- `src/actions/submitInquiry.ts` — FOUND
- `src/actions/index.ts` — FOUND
- `src/actions/__tests__/submitInquiry.test.ts` — FOUND
- `src/lib/spam/turnstile.ts` — FOUND
- `src/lib/spam/__tests__/turnstile.test.ts` — FOUND
- `src/lib/email/send.ts` — FOUND
- `src/lib/email/templates/LeadNotification.tsx` — FOUND
- `src/lib/email/templates/LeadConfirmation.tsx` — FOUND
- `src/lib/email/__tests__/LeadNotification.test.tsx` — FOUND
- `src/lib/email/__tests__/LeadConfirmation.test.tsx` — FOUND
- `tests/unit/stubs/astro-actions.ts` — FOUND
- `tests/unit/stubs/astro-content.ts` — FOUND

**Claimed commit hashes exist in git log:**
- `74df353` (Task 1 RED) — FOUND
- `5029223` (Task 1 GREEN) — FOUND
- `516aad3` (Task 2 RED) — FOUND
- `a0c4fba` (Task 2 GREEN) — FOUND
- `57cdf68` (Task 3) — FOUND

**Acceptance gates:**
- `grep LK-PLACE src/components/wizard/WizardIsland.tsx` → 0 hits ✓
- `awk .../grep submission_id` inside `sendLeadNotification` → 1 hit ✓
- `awk .../grep submission_id` inside `sendLeadConfirmation` → 1 hit ✓
- `awk .../grep '"notify"'` inside `sendLeadNotification` → 2 hits (value + comment) ✓
- `awk .../grep '"confirm"'` inside `sendLeadConfirmation` → 2 hits (value + comment) ✓
- `pnpm astro check` → 0 errors, 0 warnings, 7 hints ✓
- `pnpm test` → 162/162 passing across 18 files ✓
- `pnpm build` → succeeds (Vercel serverless bundle emitted) ✓

---
*Phase: 03-inquiry-wizard-lead-pipeline*
*Completed: 2026-04-17*
