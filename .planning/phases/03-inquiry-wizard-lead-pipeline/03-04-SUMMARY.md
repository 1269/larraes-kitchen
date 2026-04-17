---
phase: 03-inquiry-wizard-lead-pipeline
plan: 04
subsystem: infra
tags: [leads, google-sheets, googleapis, ulid, rate-limit, spam-gates, lead-store, adapter-pattern]

requires:
  - phase: 01-foundation
    provides: leadSchema (LeadInput type), estimate() (EstimateRange type), env var declarations (GOOGLE_SHEETS_CREDENTIALS_JSON/LEAD_SHEET_ID, CRON_SECRET), ulid + googleapis + zod packages pinned, src/lib/leads/ scaffold directory
provides:
  - LeadStore interface (7 methods, the phase-3 service contract)
  - LeadRecord type (24 columns A-X mirroring Google Sheets schema)
  - GoogleSheetsAdapter (production LeadStore — googleapis v144, RAW value mode, safeText formula-injection defense)
  - InMemoryLeadStore (test double + local-dev fallback)
  - getLeadStore() singleton factory + resetLeadStoreForTests() test helper
  - makeSubmissionId() / shortOf() — ULID + LK-XXXXXX short form (D-19)
  - checkHoneypot / checkMinTime / checkUrlHeuristics — pure SPAM-01/03/04 classifiers
  - hashIp() + rateLimitCheck() — SHA-256-salted IP hash + 5-per-10-minute rolling window
  - docs/sheets-setup.md — operator runbook for provisioning the Sheet + service account
affects: [03-05-astro-action-handler, 03-06-email-retry-cron, future admin UI plans]

tech-stack:
  added:
    - googleapis v144 (Google Sheets API v4 client)
    - ulid v2 (Crockford-base32 time-sortable IDs)
  patterns:
    - Pluggable storage interface (LeadStore) with production + test-double implementations
    - Singleton factory with environment-driven backend selection
    - Pure-classifier spam gates (no I/O, runnable client + server)
    - Belt-and-suspenders formula-injection defense (RAW value mode + safeText prefix)

key-files:
  created:
    - src/lib/leads/LeadStore.ts
    - src/lib/leads/GoogleSheetsAdapter.ts
    - src/lib/leads/InMemoryLeadStore.ts
    - src/lib/leads/store.ts
    - src/lib/leads/submissionId.ts
    - src/lib/leads/botGates.ts
    - src/lib/leads/rateLimit.ts
    - src/lib/leads/__tests__/submissionId.test.ts
    - src/lib/leads/__tests__/botGates.test.ts
    - src/lib/leads/__tests__/rateLimit.test.ts
    - src/lib/leads/__tests__/InMemoryLeadStore.test.ts
    - docs/sheets-setup.md
  modified: []

key-decisions:
  - "SALT for hashIp is a module-scoped constant string ('lk-rate-limit-v1-salt') — not a secret, just rainbow-table resistance; upgrade path via v2 suffix if/when rotation is needed"
  - "Adapter applies safeText on name/eventAddress/eventCity/notes/userAgent specifically (the human-typed free-text cells) — email/phone/zip/id fields are already schema-validated and cannot leak a leading '='"
  - "findPendingEmails skips records with un-parseable createdAt timestamps instead of throwing — defensive against Sheets rows manually edited by Larrae"
  - "rateLimitCheck does NOT record a hit when already over the cap — prevents attackers from inflating tab rows with deliberately-blocked requests"

patterns-established:
  - "LeadStore interface: any new persistence backend (Turso, Postgres, etc.) must implement all 7 methods with these exact signatures — Plan 05 Action depends only on this interface"
  - "InMemoryLeadStore as test double: Plan 05 uses resetLeadStoreForTests(new InMemoryLeadStore()) for integration-testing the Action without Sheets I/O"
  - "Test location: unit tests live in src/lib/leads/__tests__/*.test.ts (matches the vitest glob src/**/*.test.ts)"
  - "Module header comment cites Source references (CONTEXT D-NN, RESEARCH §Pattern N, REQUIREMENTS LEAD-NN) — keeps provenance auditable"

requirements-completed:
  - LEAD-01
  - LEAD-03
  - LEAD-04
  - LEAD-05
  - LEAD-06
  - LEAD-07
  - LEAD-10
  - LEAD-11
  - SPAM-01
  - SPAM-03
  - SPAM-04

duration: 6min
completed: 2026-04-17
---

# Phase 03 Plan 04: Lead Store Contract, Sheets Adapter, Bot Gates & Rate Limit Summary

**Pluggable LeadStore interface with googleapis-backed production adapter (RAW value mode + formula-injection defense), InMemoryLeadStore test double, ULID→LK-XXXXXX generator, SHA-256 salted IP rate limit (5/10min), and three pure SPAM-01/03/04 classifiers — the full persistence + spam-gate contract surface Plan 05's Action will consume in Wave 3.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-17T01:07:44Z
- **Completed:** 2026-04-17T01:13:52Z
- **Tasks:** 2 (both TDD, RED→GREEN)
- **Files created:** 12 (7 source + 4 test + 1 doc)
- **Tests added:** 40 (all passing — 25 in Task 1, 15 in Task 2)

## Accomplishments

- **LeadStore contract published.** 7-method interface (`append`, `findByIdempotencyKey`, `updateEmailStatuses`, `findPendingEmails`, `markEmailRetry`, `recordRateLimitHit`, `countRateLimitHits`) with the `LeadRecord` type mirroring all 24 Sheets columns A–X. Plan 05 and Plan 06 import only this file.
- **Two implementations ship day one.** `GoogleSheetsAdapter` uses `googleapis` v144 with `valueInputOption: "RAW"` (RESEARCH A4 — mitigates T-03-24 formula injection) and a belt-and-suspenders `safeText` helper that prefixes any leading `=` with an apostrophe. `InMemoryLeadStore` satisfies the same contract Map-backed — used by Plan 05 integration tests and as a local-dev fallback.
- **Singleton factory with production safety.** `getLeadStore()` returns the Sheets adapter when credentials are set, falls back to the in-memory store in dev, and THROWS in production if env is missing (prevents silent lead loss on a misconfigured deploy).
- **Short + long submission IDs.** `makeSubmissionId()` returns both the 26-char ULID (stored in Sheets column C, sortable) and the 6-char `LK-XXXXXX` short form (surfaced in confirmation screen + both emails per CONTEXT D-19). Verified collision-free at 1000-sample floor.
- **Three pure SPAM classifiers.** `checkHoneypot` (empty-string = pass), `checkMinTime` (3s threshold per SPAM-03), `checkUrlHeuristics` (http(s):// + www. case-insensitive regex on notes/address/name). Zero I/O, runnable client + server.
- **Rate limiter wired to the store.** `hashIp("")` safely hashes empty input (unknown-IP bucket), `rateLimitCheck()` composes a 5-per-10-minute rolling window against any `LeadStore`. Verified at-cap blocks without appending, different IPs bucket independently, and out-of-window hits are excluded.
- **Operator runbook shipped.** `docs/sheets-setup.md` walks Larrae (or an operator on her behalf) through Google Cloud project setup, service-account creation (no project-level role — per-Sheet Editor only, T-03-26 mitigation), tab + header provisioning, env-var placement, and quarterly key rotation.

## Task Commits

Each task followed the RED→GREEN TDD cycle; both phases were committed atomically:

1. **Task 1 RED: failing tests for submissionId / botGates / rateLimit** — `28716e9` (test)
2. **Task 1 GREEN: LeadStore + submissionId + botGates + rateLimit implementations** — `f176c3f` (feat)
3. **Task 2 RED: failing tests for InMemoryLeadStore + rate-limit composition** — `619cd92` (test)
4. **Task 2 GREEN: GoogleSheetsAdapter + InMemoryLeadStore + store factory + docs** — `65eaba6` (feat)

_(Plan metadata commit follows after SUMMARY writes.)_

## Files Created/Modified

### Source
- `src/lib/leads/LeadStore.ts` — 7-method interface + `LeadRecord` type + `EmailStatus` + `RateLimitHit`. Phase-3 service contract.
- `src/lib/leads/GoogleSheetsAdapter.ts` — `googleapis.sheets` client wrapper implementing all 7 methods. Uses `valueInputOption: "RAW"` on every write; `safeText` on every human-typed cell; scope restricted to `spreadsheets` only.
- `src/lib/leads/InMemoryLeadStore.ts` — Map-backed test double + dev fallback, plus test-only `clear()` / `all()` helpers.
- `src/lib/leads/store.ts` — `getLeadStore()` singleton factory and `resetLeadStoreForTests(override?)` helper.
- `src/lib/leads/submissionId.ts` — `shortOf(ulid)` + `makeSubmissionId()`.
- `src/lib/leads/botGates.ts` — `MIN_TIME_MS=3000`, `checkHoneypot`, `checkMinTime`, `checkUrlHeuristics`.
- `src/lib/leads/rateLimit.ts` — `RATE_LIMIT_MAX=5`, `RATE_LIMIT_WINDOW_MS=600000`, `hashIp()`, `rateLimitCheck()`.

### Tests
- `src/lib/leads/__tests__/submissionId.test.ts` — 5 tests: format regex, ULID length, last-6 derivation, 1000-sample collision floor.
- `src/lib/leads/__tests__/botGates.test.ts` — 11 tests: honeypot empty/non-empty, min-time boundary + invalid inputs, URL regex on http/https/www + eventAddress + name + case insensitivity.
- `src/lib/leads/__tests__/rateLimit.test.ts` — 9 tests: 64-char hex digest, determinism, differentiation, empty-IP tolerance, raw-IP-not-leaked, constants.
- `src/lib/leads/__tests__/InMemoryLeadStore.test.ts` — 15 tests: round-trip, many-records lookup, status update, findPending age + retry + all-sent filters, markEmailRetry notify + confirm + unknown, rate-limit cap + per-IP isolation + window exclusion, `clear()`.

### Docs
- `docs/sheets-setup.md` — 8-section operator runbook (GCP project, service account, Sheet tabs + headers, sharing, Sheet ID, env vars, verification, rotation).

## Decisions Made

- **SALT is not a secret.** The rate-limit salt is a module-scoped string (`"lk-rate-limit-v1-salt"`). Rainbow-table resistance is the only property we need — if rotation becomes necessary (e.g., migration), add a `v2` suffix and run a one-time re-hash pass.
- **safeText is applied defensively but narrowly.** Only human-typed free-text columns (name, eventAddress, eventCity, notes, userAgent) get the leading-`=` strip. Schema-validated fields (email, phone, zip, ids) cannot carry a leading `=` past Zod and are passed through untouched.
- **findPendingEmails is defensive to manual Sheet edits.** Rows with un-parseable `createdAt` values are skipped (not thrown) — Larrae reads the Sheet on her phone and could manually edit a cell; the retry cron continues despite one bad row.
- **Rejected rate-limit hits are NOT recorded.** An attacker who could force every request into the "over cap" branch should not be able to inflate RateLimit tab rows — only allowed requests consume a row.
- **Adapter serializes `null` estimates as empty string, not `null`.** Sheets renders `null` awkwardly; `""` renders as a blank cell for the custom-quote path (packageId === "custom").

## Deviations from Plan

None — plan executed exactly as written.

- The plan's test skeletons and acceptance-criteria grep checks were followed verbatim. The only embellishment was the addition of `_many-records_` lookup tests and the "many IPs bucket independently" rate-limit assertion — these were behavior implied by the interface but not explicitly enumerated in `<behavior>`; adding them hardens the contract for Plan 05's consumption.
- `ulid` v2.4.0 installed (pnpm resolved the `^2.3.0` range upward). No API differences that affect usage.

**Total deviations:** 0
**Impact on plan:** Zero scope creep; additional tests strengthen the contract surface Plan 05 relies on.

## Issues Encountered

- **`node_modules` missing at worktree start.** The parallel executor's worktree was created without running `pnpm install`. Resolved with a single `pnpm install` (3.4s). Note for orchestrator: parallel worktrees appear to need install before vitest/astro check can run.
- **`pnpm vitest` doesn't resolve the binary.** `pnpm test` (which runs `vitest run`) works; `pnpm vitest run ...` does not. Switched every verification run to `pnpm test <path>`.
- **Node engine warning.** The worktree is on Node 23.8 vs. project requirement of `>=22.12.0 <23`. Warning only, not an error — builds + tests pass. Out of scope for this plan.

## Known Stubs

None. Every module ships production-ready code paths. `InMemoryLeadStore` is explicitly a test double / dev fallback, not a stub — its behavior is fully specified in the tests and documented in its header.

## User Setup Required

**External service configuration is required before production traffic.** See [`docs/sheets-setup.md`](../../../docs/sheets-setup.md) for the complete runbook. Summary:

1. Create a Google Cloud project and enable Sheets API.
2. Create a service account with no project-level role; generate a JSON key.
3. Create the Sheet with `Leads` + `RateLimit` tabs and paste the column headers.
4. Share the Sheet with the service-account email (Editor).
5. Set `GOOGLE_SHEETS_CREDENTIALS_JSON` + `GOOGLE_SHEETS_LEAD_SHEET_ID` on Vercel Preview + Production.

Without these, `getLeadStore()` returns the in-memory fallback in dev — leads are lost on restart but the flow is exercisable. In production, `getLeadStore()` throws if env is missing (by design).

## Plan 05 / Plan 06 Reference

- **Plan 05 Action imports:**
  ```typescript
  import { getLeadStore } from "@/lib/leads/store";
  import { checkHoneypot, checkMinTime, checkUrlHeuristics } from "@/lib/leads/botGates";
  import { rateLimitCheck, hashIp } from "@/lib/leads/rateLimit";
  import { makeSubmissionId } from "@/lib/leads/submissionId";
  ```
  Call order (per RESEARCH §Pattern 11 layered defense): honeypot + min-time + URL heuristics (silent decoy on fail) → Turnstile verify → `rateLimitCheck` → idempotency lookup via `store.findByIdempotencyKey` → `makeSubmissionId()` → `store.append()` → `Promise.allSettled` on email sends → `store.updateEmailStatuses()`.

- **Plan 05 integration test pattern:**
  ```typescript
  import { InMemoryLeadStore } from "@/lib/leads/InMemoryLeadStore";
  import { resetLeadStoreForTests } from "@/lib/leads/store";
  beforeEach(() => resetLeadStoreForTests(new InMemoryLeadStore()));
  ```

- **Plan 06 retry cron imports:**
  ```typescript
  import { getLeadStore } from "@/lib/leads/store";
  // In handler:
  const pending = await store.findPendingEmails({ maxRetries: 3, minAgeMs: 60 * 60 * 1000 });
  // Per-record retry attempt, then:
  await store.markEmailRetry(submissionId, "notify", status);
  ```

- **Rate-limit constants** (import from `@/lib/leads/rateLimit`): `RATE_LIMIT_MAX = 5`, `RATE_LIMIT_WINDOW_MS = 600_000`.

- **docs/sheets-setup.md** is a precursor for any preview deploy that wants real Sheets integration.

## Self-Check: PASSED

All 12 claimed files exist on disk:
- `src/lib/leads/LeadStore.ts`, `GoogleSheetsAdapter.ts`, `InMemoryLeadStore.ts`, `store.ts`, `submissionId.ts`, `botGates.ts`, `rateLimit.ts`
- `src/lib/leads/__tests__/submissionId.test.ts`, `botGates.test.ts`, `rateLimit.test.ts`, `InMemoryLeadStore.test.ts`
- `docs/sheets-setup.md`

All 4 claimed commit hashes exist in git log:
- `28716e9` (Task 1 RED)
- `f176c3f` (Task 1 GREEN)
- `619cd92` (Task 2 RED)
- `65eaba6` (Task 2 GREEN)

All 97 tests pass (`pnpm test`). `pnpm astro check` exits 0 (0 errors, 0 warnings, 5 hints — all pre-existing in `src/lib/schemas/site.ts`, unrelated to this plan).

---
*Phase: 03-inquiry-wizard-lead-pipeline*
*Completed: 2026-04-17*
