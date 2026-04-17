---
phase: 03-inquiry-wizard-lead-pipeline
fixed_at: 2026-04-16T03:23:00Z
review_path: .planning/phases/03-inquiry-wizard-lead-pipeline/03-REVIEW.md
iteration: 1
fix_scope: critical_warning
findings_in_scope: 10
fixed: 10
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-04-16T03:23:00Z
**Source review:** `.planning/phases/03-inquiry-wizard-lead-pipeline/03-REVIEW.md`
**Iteration:** 1
**Fix scope:** critical_warning (CR-* + WR-* only; IN-* skipped by scope)

**Summary:**
- Findings in scope: 10 (4 Critical + 6 Warning)
- Fixed: 10
- Skipped: 0

**Final verification:**
- `pnpm test` — 177 tests passed across 20 files
- `pnpm astro check` — 0 errors, 0 warnings (101 files)
- `pnpm build` — complete, no errors

## Fixed Issues

### CR-01: Formula-injection guard misses `+`, `-`, `@`, and tab prefixes

**Files modified:** `src/lib/leads/GoogleSheetsAdapter.ts`
**Commit:** `f7f0f4f`
**Applied fix:** Replaced `s.startsWith("=")` with `/^[=+\-@\t]/.test(s)` in `safeText`. Updated the docstring to enumerate the full trigger set (`=`, `+`, `-`, `@`, `\t`). Preserves the belt-and-suspenders role alongside the primary `valueInputOption: "RAW"` guard.

### CR-02: Rate-limit rejection timing-distinguishable from decoy gates

**Files modified:** `src/actions/submitInquiry.ts`
**Commit:** `8796d00`
**Applied fix:** Per the review note and VERIFICATION.md (marked `accepted_design_tradeoff`), added an in-code comment documenting the intentional divergence from the silent-decoy contract. No behavior change — the comment explains that real users are intentionally shown a "rate_limit" alert per CONTEXT D-18, and warns future authors not to unify the path with `decoySuccess()` without reopening the UX decision.

### CR-03: CRON_SECRET check succeeds vacuously when env var is unset

**Files modified:** `src/pages/api/cron/retry-email.ts`
**Commit:** `2825547`
**Applied fix:** Added an early fail-closed return 401 before the bearer-token comparison when `import.meta.env.CRON_SECRET` is falsy. Removes the "Bearer undefined" bypass in misconfigured dev/staging environments. The existing 6 cron auth tests continue to pass (they stub `CRON_SECRET` in `beforeEach`).

### CR-04: Webhook `markEmailRetry` failure silently returns 200

**Files modified:** `src/pages/api/webhooks/resend.ts`
**Commit:** `a5b0508`
**Applied fix:** On `store.markEmailRetry` catch, return `{ error: "store_error" }` with status 500 instead of the previous 200/ok. Resend now retries the webhook until the store recovers, preventing permanent loss of delivery-status updates. Diagnostic comment explains why 500 is correct here (Resend uses 5xx to trigger its retry loop). Existing 7 webhook tests continue to pass — the happy-path/tag-missing assertions still hit the 200 branch.

### WR-01: `safeText` not applied to `email`, `phone`, `howHeard`

**Files modified:** `src/lib/leads/GoogleSheetsAdapter.ts`
**Commit:** `f7f0f4f` (bundled with CR-01 since both touch the same file)
**Applied fix:** Wrapped `r.email` (L), `r.phone` (M), and `r.howHeard` (R) in `safeText()` in `leadRecordToRow`. Added comments explaining the rationale. `r.zip` remains raw — it's regex-constrained to `^\d{5}$` so no formula prefix is possible. Behavior is identical for well-formed data; only an adversarial bypass path produces a different result.

### WR-02: `onSubmit` useCallback empty dependency array undocumented

**Files modified:** `src/components/wizard/WizardIsland.tsx`
**Commit:** `00372ba`
**Applied fix:** Added an explanatory comment block above the empty `[]` in the `onSubmit` useCallback, enumerating each stable identifier (useState setters, module-level `wizardAnalytics`, module-level `clearSnapshot`, stable dynamic import) and warning future authors that a Props-derived value (e.g., `site.email`) would need to be added explicitly to avoid stale-closure bugs. Also added a `biome-ignore` on a pre-existing `useExhaustiveDependencies` warning for the step-change focus `useEffect` — the rule flagged `currentStep` as unnecessary but the effect semantically MUST re-fire on step change to move focus (the body reads `headingRef.current` via ref, not `currentStep`). Documented reasoning inline.

### WR-03: Server-side schema missing lead-time + blackout validation

**Files modified:** `src/lib/schemas/lead.ts`, `src/actions/submitInquiry.ts`, `src/actions/__tests__/submitInquiry.test.ts`
**Commit:** `8796d00`
**Applied fix:** Chose the smaller-blast-radius option — added a `validateLeadBusinessRules` helper in `lead.ts` that delegates to the existing `validateEventDate` function rather than extending the schema with a factory or superRefine. The Action calls this helper after rate-limit / before idempotency, loading the `site` entry via `getEntry("site", "site")` and throwing `BAD_REQUEST` with the UI-SPEC-locked error string on violation. Leaves `leadSchema` unchanged so client/server schema parity is preserved. Added two integration tests (`submitInquiry.test.ts`): one for blackout-date bypass (posts `2026-12-25`), one for past-date bypass (posts `2020-01-01`). Updated the existing `getEntry` mock to return `leadTimeDays: 7` and `blackoutDates: ["2026-12-25"]` so all pre-existing happy-path tests continue to pass. Full suite: 177 green (was 173; +2 new tests, +2 existing tests' mock expectations updated in place).

### WR-04: `countRateLimitHits` relies on `NaN >= cutoff` for implicit header filter

**Files modified:** `src/lib/leads/GoogleSheetsAdapter.ts`
**Commit:** `f7f0f4f` (bundled with CR-01 / WR-01)
**Applied fix:** Added explicit `dataRows` filter that drops rows whose `r[1]` (timestamp column) is not a finite positive number before the ipHash+cutoff match. Behavior change is semantic only (no observable difference for real data); makes the header-row exclusion explicit rather than depending on `NaN` comparison quirks.

### WR-05: Decoy short-form IDs share namespace with real IDs

**Files modified:** `src/actions/submitInquiry.ts`
**Commit:** `8796d00` (bundled with CR-02 / WR-03 since all three touch submitInquiry.ts)
**Applied fix:** Added a long-form docstring block on `decoySuccess()` documenting the 32^6 short-form namespace trade-off — noting that decoy IDs are not persisted, that the full 26-char ULID in column C remains collision-safe regardless, and that at expected catering traffic (< 100 real submissions/month) birthday-paradox collisions on the LK-XXXXXX short form are negligible. No code change per review recommendation.

### WR-06: Missing `RESEND_WEBHOOK_SECRET` returns `false` silently

**Files modified:** `src/pages/api/webhooks/resend.ts`
**Commit:** `a5b0508` (bundled with CR-04)
**Applied fix:** Added `console.error("resend_webhook_secret_missing")` inside `verifySignature` when `secret` is falsy, before returning `false`. Preserves fail-closed behavior (still returns 401 to the caller) but surfaces the misconfiguration to Vercel / Sentry log streams so operators notice.

## Commits

| Commit | Findings | Files |
|--------|----------|-------|
| `f7f0f4f` | CR-01, WR-01, WR-04 | `src/lib/leads/GoogleSheetsAdapter.ts` |
| `8796d00` | CR-02, WR-03, WR-05 | `src/actions/submitInquiry.ts`, `src/lib/schemas/lead.ts`, `src/actions/__tests__/submitInquiry.test.ts` |
| `2825547` | CR-03 | `src/pages/api/cron/retry-email.ts` |
| `a5b0508` | CR-04, WR-06 | `src/pages/api/webhooks/resend.ts` |
| `00372ba` | WR-02 | `src/components/wizard/WizardIsland.tsx` |

---

_Fixed: 2026-04-16T03:23:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
