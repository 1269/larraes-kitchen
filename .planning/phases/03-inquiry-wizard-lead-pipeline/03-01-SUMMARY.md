---
phase: 03-inquiry-wizard-lead-pipeline
plan: 01
subsystem: foundation-primitives
tags: [zod, pricing, validation, env-vars, turnstile, vitest, tdd, astro, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "estimate() typed stub at src/lib/pricing/estimate.ts; packageSchema/packages content collection; empty src/lib/schemas/ ready for siblings; env.d.ts with initial Phase 1 env vars"
  - phase: 02-content-static-sections
    provides: "authored src/content/packages/{small,medium,large}.md with the pricing data the estimator computes against"
provides:
  - "leadSchema (Zod 4) — shared client+server validation contract with every required/optional Step 1-4 field plus bot gates (honeypot, wizardMountedAt, idempotencyKey, turnstileToken)"
  - "LeadInput type (z.infer<typeof leadSchema>) — authoritative TS shape for downstream RHF resolver and Astro Action input"
  - "Real estimate() pricing function replacing Phase 1 throw-stub — $10-rounded ranges, D-11 soft-override within tier system, D-12 custom-quote null path"
  - "tierForGuests() helper exported for Step 3 recommended-tier UI (Plan 03)"
  - "resolveServiceAreaCity() + BENICIA_SERVICE_AREA_ZIPS — WIZ-11 ZIP soft-check for Step 2 city pre-fill"
  - "Updated env contract: PUBLIC_TURNSTILE_SITE_KEY (renamed for client-bundle exposure), CRON_SECRET (LEAD-11), RESEND_WEBHOOK_SECRET (LEAD-12)"
  - "exhaustive Vitest boundary table (9/10/11, 20/21, 30/31, 75/76) + 1..200 integer sweep covering EST-05/EST-06"
affects: ["03-02 (Turnstile client/server wiring)", "03-03 (Wizard island form resolver)", "03-05 (Astro Action server-side re-validation + final-estimate stamping)", "03-06 (E2E Turnstile/spam tests)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared Zod schema consumed by both tiers (single source of truth)"
    - "Pure-function pricing module passed package data as argument (no module-scoped I/O)"
    - "Static ZIP lookup with regex guard + frozen exported map for downstream consumers"
    - "TDD RED→GREEN cycle: test-first commits followed by implementation commits per task"

key-files:
  created:
    - "src/lib/schemas/lead.ts"
    - "src/lib/schemas/lead.test.ts"
    - "src/lib/serviceArea.ts"
    - "src/lib/serviceArea.test.ts"
  modified:
    - "src/lib/pricing/estimate.ts"
    - "src/lib/pricing/estimate.test.ts"
    - "src/env.d.ts"
    - ".env.example"

key-decisions:
  - "Out-of-range guest counts (g<10 or g>75) return null from estimate() — the custom-quote path (D-12) is taken by the caller, not baked into the pricing function"
  - "Explicit packageId override (D-11) is honored only WITHIN the tier system — e.g. 15 guests + 'large' returns a range (small-tier coverage), but 9 guests + 'small' returns null (no tier covers 9)"
  - "leadSchema.notes allows URLs through untrimmed (no sanitization) because the Plan 04 Google Sheets adapter's RAW valueInputOption is the sole gate against formula injection (T-03-05)"
  - "TURNSTILE_SITE_KEY renamed to PUBLIC_TURNSTILE_SITE_KEY — Astro 6 only inlines PUBLIC_-prefixed env vars into the client bundle; the Turnstile widget needs it client-side"
  - "honeypot field named `honeypot` (matches plan spec) rather than `website` used in RESEARCH.md Pattern 1 draft — plan is the source of truth"

patterns-established:
  - "TDD-per-task: RED commit (test(...)) followed by GREEN commit (feat(...)) — enforces the test-first discipline for pure modules"
  - "Biome format-on-commit: run `pnpm biome check --write` after adding files to normalize to the project's style before commit"

requirements-completed: [EST-01, EST-02, EST-03, EST-05, EST-06, EST-08, WIZ-10, WIZ-11, LEAD-01, LEAD-07, SPAM-01, SPAM-03, SPAM-04]

# Metrics
duration: 8min
completed: 2026-04-17
---

# Phase 3 Plan 01: Foundation Primitives Summary

**Shared leadSchema (Zod 4) + real estimate() pricing math replacing the Phase 1 throw-stub + Benicia-adjacent ZIP lookup + env contract fix (PUBLIC_TURNSTILE_SITE_KEY rename, CRON_SECRET/RESEND_WEBHOOK_SECRET added) — the foundation every downstream Phase 3 plan consumes.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-17T00:53:24Z
- **Completed:** 2026-04-17T01:01:23Z
- **Tasks:** 2
- **Files modified:** 4 (created) + 4 (modified)

## Accomplishments

- `leadSchema` is now the single Zod contract consumed by both the client RHF resolver (Plan 03) and the server Astro Action (Plan 05) — no drift, no dual-maintenance.
- `estimate()` is a real pure function returning `{min,max}` $10-rounded ranges with exhaustive 1..200 sweep + boundary table (9/10/11, 20/21, 30/31, 75/76). The Phase 1 throw-stub is gone.
- `resolveServiceAreaCity()` ships 22 Benicia-adjacent ZIPs for Step 2 city pre-fill; unknown ZIPs return null so the caller can render the "we may need to travel" soft-check (WIZ-11).
- Env contract now exposes `PUBLIC_TURNSTILE_SITE_KEY` to the client bundle (Astro 6 inlining requirement), plus `CRON_SECRET` and `RESEND_WEBHOOK_SECRET` placeholders for Plans 05/06.
- Full TDD cycle: 2 RED commits (failing tests) + 2 GREEN commits (implementations) — the RED/GREEN gate order is visible in git log.

## Task Commits

Each task followed the RED → GREEN TDD cycle with atomic commits:

1. **Task 1 RED: failing tests for leadSchema** — `0a72f45` (test)
2. **Task 1 GREEN: implement leadSchema + extend env contract** — `ecd93e0` (feat)
3. **Task 2 RED: failing tests for estimate() + resolveServiceAreaCity()** — `304f351` (test)
4. **Task 2 GREEN: implement estimate() pricing math + serviceArea ZIP lookup** — `a7812a7` (feat)

_Orchestrator will create the final docs/metadata commit after wave merge._

## Files Created/Modified

**Created:**
- `src/lib/schemas/lead.ts` — Zod 4 `leadSchema` + `LeadInput` type
- `src/lib/schemas/lead.test.ts` — 19 behavior cases covering every `<behavior>` assertion in the plan
- `src/lib/serviceArea.ts` — 22-ZIP Benicia-adjacent map, `resolveServiceAreaCity()` + frozen `BENICIA_SERVICE_AREA_ZIPS` export
- `src/lib/serviceArea.test.ts` — 8 tests covering canonical/adjacent/out-of-area/invalid-input + frozen-map invariant

**Modified:**
- `src/lib/pricing/estimate.ts` — replaced `throw` body with pure `round10` / `tierForGuests` / `estimate` implementation; widened `packageId` to `PackageData["id"] | "custom"`
- `src/lib/pricing/estimate.test.ts` — replaced scaffold with 8 `tierForGuests` cases + full boundary table (9 rows via `it.each`) + exhaustive 1..200 sweep
- `src/env.d.ts` — renamed `TURNSTILE_SITE_KEY` → `PUBLIC_TURNSTILE_SITE_KEY`; added `CRON_SECRET`, `RESEND_WEBHOOK_SECRET`
- `.env.example` — mirror env.d.ts changes with empty placeholders + clarifying comments

## Verification Evidence

- `pnpm vitest run` → **4 files passed, 57 tests passed, 0 failed**
  - `src/lib/format.test.ts` (4 pre-existing tests)
  - `src/lib/schemas/lead.test.ts` (19 tests)
  - `src/lib/pricing/estimate.test.ts` (25 tests — 8 tierForGuests + 8 scenarios + 9 boundary rows + 1 exhaustive sweep)
  - `src/lib/serviceArea.test.ts` (8 tests)
- `pnpm astro check` → **0 errors, 0 warnings, 5 hints** (pre-existing deprecation hints in `site.ts`)
- `pnpm biome check` → clean on all touched files after auto-formatting
- `grep -rE "\bTURNSTILE_SITE_KEY\b" src/` with non-PUBLIC filter → no matches (rename is complete)

## Interface Contracts for Downstream Plans

**`leadSchema` / `LeadInput`** (`src/lib/schemas/lead.ts`):
- Plan 03 (Wizard island): `useForm<LeadInput>({ resolver: zodResolver(leadSchema), mode: "onBlur" })`
- Plan 05 (Astro Action): `defineAction({ accept: "form", input: leadSchema, handler: ... })`
- Same schema re-parses both tiers; server re-parse is the T-03-01 tampering mitigation.

**`estimate` / `EstimateInput` / `EstimateRange`** (`src/lib/pricing/estimate.ts`):
- Plan 03 (StickyEstimateBar): call `estimate({ guests, packageId, packages })` on debounced `useWatch` values; fall back to "Custom quote — Larrae will follow up" when null.
- Plan 05 (Action handler): re-call with `(await getCollection('packages')).map(e => e.data)` to stamp the authoritative final range on the lead row before email fan-out.

**`resolveServiceAreaCity`** (`src/lib/serviceArea.ts`):
- Plan 03 (Step 2 ZIP input): call on blur; if city resolves, pre-fill Step 4 `eventCity`; else render the "not sure? just ask" fallback (WIZ-11).

**`tierForGuests`** (`src/lib/pricing/estimate.ts`):
- Plan 03 (Step 3): derive the "Recommended for N guests" badge and auto-select the matching tier on Step 3 entry (D-11).

## Notes for Plan 03 (Wizard Island)

- Use `crypto.randomUUID()` for `idempotencyKey` — the schema validates a v4 UUID.
- Stamp `wizardMountedAt = Date.now()` in `useEffect` on first mount; `z.coerce.number()` tolerates the string-encoded form value that comes back through FormData serialization.
- `honeypot` field is a hidden `<input name="honeypot" value="" aria-hidden="true" tabIndex={-1}>` — the schema's `z.string().max(0)` rejects any content a bot auto-fills.
- The hidden `turnstileToken` comes from Plan 02's Turnstile widget callback — attach it to the form before submit.

## Notes for Plan 05 (Astro Action Handler)

- Import `leadSchema` and pass as the Action `input` — Astro coerces `FormData` → object → `leadSchema.parse` automatically; validation failures flow back as `isInputError(err)` with `err.fields.<field>`.
- After the schema passes, re-run `estimate({ guests: input.guestCount, packageId: input.packageId, packages })` with the server-side `getCollection('packages').map(e => e.data)` to stamp `finalEstimate` on the lead row (LEAD-07) — never trust a client-supplied price.
- The `honeypot`, `wizardMountedAt`, and `idempotencyKey` fields are schema-validated by `input: leadSchema` already; the Action handler still applies the SPAM-01/03 heuristics on the parsed values.

## Decisions Made

- **Tier-system coverage gate:** `estimate()` returns null outside the union of all tier ranges (g<10 or g>75) even when the caller supplies an explicit `packageId`. This reconciles the plan's D-11 soft-override ("honor user choice") with the boundary table's `[9, "small", null]` and `[76, "large", null]` expectations — D-11 applies only *within* the tier system; outside it, the custom-quote path (D-12) takes over.
- **Honeypot field naming:** Plan's spec (`honeypot`) took precedence over RESEARCH.md Pattern 1's `website` draft. Plan is the execution source of truth.
- **ZIP map contents:** Seeded 22 Benicia-adjacent ZIPs covering Benicia, Vallejo, Fairfield, Suisun City, Richmond/El Sobrante, Martinez, Pittsburg, Antioch, Concord, Pleasant Hill, Walnut Creek — the Phase 3 "confidently serve" footprint. Larrae can expand the map via a markdown/PR follow-up post-launch without code changes to callers.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Boundary-table semantics in `estimate()` implementation**
- **Found during:** Task 2 GREEN (test run after initial implementation)
- **Issue:** Initial `estimate()` implementation honored explicit `packageId` *always* — so `estimate({guests: 9, packageId: "small"})` returned `{min: 200, max: 250}` instead of the plan's expected `null`. The plan's boundary table (`[9, "small", null]`, `[76, "large", null]`) and the 1..200 sweep (`if (g < 10 || g > 75) expect(result).toBeNull()`) both required strict tier-coverage gating.
- **Fix:** Added `if (!tierForGuests(guests, packages)) return null` gate before the explicit-packageId lookup. This preserves D-11 within the tier system (15 guests + large → range) while enforcing tier-coverage outside it (9 + small → null).
- **Files modified:** `src/lib/pricing/estimate.ts`
- **Verification:** All 25 estimate tests pass including the 3 previously-failing boundary cases.
- **Committed in:** `a7812a7` (Task 2 GREEN commit)

**2. [Rule 3 - Blocking] `noUncheckedIndexedAccess` error in lead.test.ts**
- **Found during:** `pnpm astro check` after Task 1 RED commit
- **Issue:** `result.error.issues[0].path` violated the `noUncheckedIndexedAccess: true` strict TS flag (index access on possibly-undefined tuple).
- **Fix:** Assigned `const firstIssue = result.error.issues[0]` and used `firstIssue?.path` optional chaining.
- **Files modified:** `src/lib/schemas/lead.test.ts`
- **Verification:** `pnpm astro check` exits 0.
- **Committed in:** `ecd93e0` (Task 1 GREEN commit — packaged with the implementation since the test file belonged to the same gate).

**3. [Rule 3 - Blocking] Missing node_modules in fresh worktree**
- **Found during:** First `pnpm vitest run`
- **Issue:** Parallel worktree was created without running `pnpm install`; `vitest` binary and `zod` runtime were unavailable.
- **Fix:** Ran `pnpm install --prefer-offline` once at the start of execution. No `package.json` or `pnpm-lock.yaml` modified.
- **Files modified:** none (install populated `node_modules/` only, which is gitignored)
- **Verification:** `pnpm vitest run` + `pnpm astro check` both execute.
- **Committed in:** n/a (no source changes)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All three were necessary for correctness or ability to run verifications. No scope creep — plan's tasks, files, and acceptance criteria executed as written.

## Issues Encountered

- **Node 23 runtime warning:** Astro pins Node `>=22.12.0 <23`; the worktree environment runs Node 23.8.0. All commands still execute; Astro + Vitest produce only an `Unsupported engine` warning, not a failure. Recommend CI pins Node 22 LTS to match the engine field, but this is out of scope for Plan 01.

## User Setup Required

None — no external service configuration is gated by this plan. `CRON_SECRET` and `RESEND_WEBHOOK_SECRET` are declared in env.d.ts/.env.example but their value population is deferred to Plans 05/06 / Phase 5 launch prep.

## Self-Check

- File `src/lib/schemas/lead.ts` — verified present
- File `src/lib/schemas/lead.test.ts` — verified present
- File `src/lib/serviceArea.ts` — verified present
- File `src/lib/serviceArea.test.ts` — verified present
- File `src/lib/pricing/estimate.ts` — verified modified (throw removed, tierForGuests + round10 + real estimate body)
- File `src/lib/pricing/estimate.test.ts` — verified modified (boundary table + 1..200 sweep)
- File `src/env.d.ts` — verified PUBLIC_TURNSTILE_SITE_KEY + CRON_SECRET + RESEND_WEBHOOK_SECRET present
- File `.env.example` — verified ^PUBLIC_TURNSTILE_SITE_KEY=, ^CRON_SECRET=, ^RESEND_WEBHOOK_SECRET= present
- Commits `0a72f45`, `ecd93e0`, `304f351`, `a7812a7` — verified in git log

## Self-Check: PASSED

All claims verified. Files exist, commits are in `git log`, tests pass, type-check passes.

## Next Phase Readiness

- Plans 02, 03, 05, 06 can all consume the primitives shipped here without additional Phase 3 dependencies.
- No blockers.
- Plan 03 (wizard island) is the next highest-value consumer — its Step 2 `<input inputmode="numeric">` debounced `useWatch` → `estimate()` → sticky bar is the entire live-price loop, and it now has a real pricing function to drive it.

---
*Phase: 03-inquiry-wizard-lead-pipeline*
*Completed: 2026-04-17*
