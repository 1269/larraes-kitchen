---
phase: 3
slug: inquiry-wizard-lead-pipeline
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-16
updated: 2026-04-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Seeded from `03-RESEARCH.md` — `## Validation Architecture`. Updated 2026-04-16 to populate the per-task verification map and satisfy B2 (Nyquist compliance) after the Plan 03 Task 2 split into Task 2a (components) + Task 2b (entry-point retargets).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unit), Playwright (E2E), React Email preview (visual), tsc/biome (static) |
| **Config file** | `vitest.config.ts` (created by Plan 03 Task 1), `playwright.config.ts` (extended by Plan 06 Task 2) |
| **Quick run command** | `pnpm test` (Vitest, scoped to changed files via `--changed`) |
| **Full suite command** | `pnpm test:ci && pnpm test:e2e` |
| **Estimated runtime** | ~45s unit (target), ~3 min E2E (target) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test` (fast unit subset)
- **After every plan wave:** Run `pnpm test:ci` (full Vitest)
- **Before `/gsd-verify-work`:** Full Vitest + Playwright E2E must be green
- **Max feedback latency:** 45 seconds (unit) / 180 seconds (full)

---

## Per-Task Verification Map

One row per task across all 6 plans. Tasks ordered by wave, then plan, then task number. Every code-producing task has an automated verify command; setup/retarget tasks verify via `astro check && build`. Wave-0 dependency column flags tasks that depend on scaffolding created in an earlier task (infra bootstrap).

| Task ID | Plan | Wave | Requirements | Threat Ref | Secure Behavior | Test Type | Automated Command | Wave-0 Dep |
|---------|------|------|--------------|------------|-----------------|-----------|-------------------|------------|
| 03-01-T1 | 01 | 1 | LEAD-01, LEAD-04, LEAD-07, SPAM-01, SPAM-03, SPAM-04, WIZ-10, WIZ-11 | T-03-01, T-03-04, T-03-06 | Zod parses/rejects lead input at Action boundary; oversized strings bounded; UUID idempotency key | Unit (Vitest) | `pnpm vitest run src/lib/schemas/lead.test.ts` | — (self-contained) |
| 03-01-T2 | 01 | 1 | EST-01, EST-02, EST-03, EST-05, EST-06, EST-08, WIZ-11 | T-03-03 | Deterministic pricing across 1..200 sweep; single-source formula; custom-quote path | Unit (Vitest) | `pnpm vitest run src/lib/pricing/estimate.test.ts src/lib/serviceArea.test.ts` | — (self-contained) |
| 03-02-T1 | 02 | 1 | WIZ-01, WIZ-07, WIZ-13, WIZ-14, SPAM-02 | T-03-08, T-03-13 | shadcn primitives installed + Radix import normalized; supply-chain pinned | Static (tsc) | `pnpm astro check` | — |
| 03-02-T2 | 02 | 1 | SPAM-06, OBS-01, WIZ-08 | T-03-09, T-03-11 | Turnstile test-key gate active; Vercel Analytics ingestion mounted | Static (script) | `bash scripts/check-turnstile-keys.sh dist && pnpm astro check` | Requires `pnpm build` to create `dist/` first (self-bootstraps via webServer or CI build step) |
| 03-03-T1 | 03 | 2 | WIZ-04, WIZ-05, WIZ-09, WIZ-10, OBS-01 | T-03-14, T-03-15, T-03-16 | sessionStorage + URL sync + analytics PII discipline + date/lead-time validation | Unit (Vitest) | `pnpm vitest run src/components/wizard/__tests__/useWizardPersistence.test.tsx src/components/wizard/__tests__/useUrlSync.test.tsx src/components/wizard/__tests__/eventDate.test.ts` | Creates `vitest.config.ts` + `tests/unit/setup.ts` — Wave 0 infra producer |
| 03-03-T2a | 03 | 2 | WIZ-01, WIZ-02, WIZ-03, WIZ-06, WIZ-07, WIZ-08, WIZ-10, WIZ-11, WIZ-12, WIZ-13, WIZ-14, EST-03, EST-04, EST-07, EST-08, SPAM-02 | T-03-17, T-03-20, T-03-21, T-03-22 | Wizard components render; EST-04 equal-visual-weight enforced; honeypot hidden; focus trap | Unit (Vitest) + Static | `pnpm vitest run src/components/wizard/__tests__/StickyEstimateBar.test.tsx src/components/wizard/__tests__/ProgressIndicator.test.tsx src/components/wizard/__tests__/DirtyDismissGuard.test.tsx && pnpm astro check` | Depends on 03-03-T1 (vitest config) |
| 03-03-T2b | 03 | 2 | WIZ-01, WIZ-02 | T-03-15 | All 5 entry points dispatch `wizard:open` CustomEvent; no PII in CustomEvent detail | Static (build) | `pnpm astro check && pnpm build` | Depends on 03-03-T2a (WizardIsland must listen for `wizard:open` before triggers fire) |
| 03-03-T3 | 03 | 2 | EST-03, EST-04, EST-07, EST-08 | T-03-22 | StickyEstimateBar hidden/range/custom branches verified; EST-04 token assertion | Unit (Vitest) | `pnpm vitest run src/components/wizard/__tests__/StickyEstimateBar.test.tsx` | Depends on 03-03-T1 (vitest config) + 03-03-T2a (component) |
| 03-04-T1 | 04 | 2 | LEAD-03, LEAD-04, SPAM-01, SPAM-03, SPAM-04 | T-03-29 | Submission ID format; bot classifiers pure; IP hashing deterministic + salted | Unit (Vitest) | `pnpm vitest run src/lib/leads/__tests__/submissionId.test.ts src/lib/leads/__tests__/botGates.test.ts src/lib/leads/__tests__/rateLimit.test.ts` | Depends on 03-03-T1 (vitest config) |
| 03-04-T2 | 04 | 2 | LEAD-01, LEAD-05, LEAD-06, LEAD-07, LEAD-10, LEAD-11 | T-03-24, T-03-25, T-03-26, T-03-30 | Sheets adapter RAW-mode safe; InMemoryLeadStore satisfies contract; factory env-gated | Unit (Vitest) + Static | `pnpm vitest run src/lib/leads/__tests__/InMemoryLeadStore.test.ts && pnpm astro check` | Depends on 03-03-T1 (vitest config) |
| 03-05-T1 | 05 | 3 | LEAD-02, LEAD-08, LEAD-09, LEAD-12 | T-03-33, T-03-37, T-03-40 | Turnstile no-throw error paths; email templates render; **LEAD-12 tags emitted on both send calls** (B4) | Unit (Vitest) | `pnpm vitest run src/lib/spam/__tests__/turnstile.test.ts src/lib/email/__tests__/LeadNotification.test.tsx src/lib/email/__tests__/LeadConfirmation.test.tsx` | Depends on 03-03-T1 (vitest config) |
| 03-05-T2 | 05 | 3 | LEAD-01..10, SPAM-01..05, WIZ-12, EST-01, EST-02 | T-03-32..T-03-41 | Full 9-step pipeline; store-first ordering; decoy 200 on all 3 silent gates | Integration (Vitest) | `pnpm vitest run src/actions/__tests__/submitInquiry.test.ts` | Depends on 03-04-T1+T2 (LeadStore), 03-05-T1 (turnstile + email), 03-01-T1+T2 (schema + estimate) |
| 03-05-T3 | 05 | 3 | WIZ-12 | T-03-17 | Stub removal verified at build time; placeholder `LK-PLACE` absent | Static (build + full suite) | `pnpm astro check && pnpm build && pnpm vitest run` | Depends on 03-05-T2 (Action defined) |
| 03-06-T1 | 06 | 4 | LEAD-10, LEAD-11, LEAD-12 | T-03-42, T-03-43, T-03-44, T-03-45, T-03-47 | Cron bearer auth; webhook HMAC timing-safe; tag correlation from Plan 05 | Unit (Vitest) | `pnpm vitest run src/pages/api/cron/__tests__/retry-email.test.ts src/pages/api/webhooks/__tests__/resend.test.ts` | Depends on 03-04 (LeadStore), 03-05-T1 (tag emission) |
| 03-06-T2 | 06 | 4 | WIZ-01..05, WIZ-09, WIZ-12, WIZ-13, SPAM-01, SPAM-05, SPAM-06 | T-03-48, T-03-49 | Full browser journey green; **Turnstile test keys process-scoped only** (B5); **LK-PLACE absence asserted** (W2) | E2E (Playwright) | `pnpm exec playwright test --project=chromium-desktop tests/e2e/wizard-happy-path.spec.ts tests/e2e/wizard-silent-bot.spec.ts` | Depends on all prior plans shipping their artifacts |

**Sampling continuity check (Nyquist):** Tasks are ordered by wave within the map. Scanning for 3 consecutive tasks without an `<automated>` verify command: none. Every task above has a concrete automated command. ✅

---

## Wave 0 Requirements

Per RESEARCH.md §Validation Architecture — Wave 0 gap list. Status updated 2026-04-16 to reflect the actual distribution across Phase 3 plans. Tasks in Plan 03 Task 1 create the Vitest scaffolding; subsequent plans ride on that infra.

- [x] `vitest.config.ts` + `pnpm add -D @testing-library/react @testing-library/user-event jsdom happy-dom` — framework install — **03-03-T1**
- [x] `playwright.config.ts` extended with webServer + mobile profile + process-scoped Turnstile test-key env (SPAM-06 isolation) — **03-06-T2** (base config installed in Phase 1)
- [x] `tests/unit/setup.ts` — jsdom + RHF + Zod shared fixtures — **03-03-T1**
- [x] `src/lib/pricing/estimate.test.ts` — 1..200 guest sweep at all tier boundaries (EST-01..EST-08) — **03-01-T2** (replaces earlier "tests/unit/estimate.test.ts" placeholder; same contract)
- [x] `src/lib/schemas/lead.test.ts` — Zod parse / reject cases (LEAD-01, LEAD-04, SPAM-01..04) — **03-01-T1**
- [x] `src/components/wizard/__tests__/useWizardPersistence.test.tsx` + `useUrlSync.test.tsx` — sessionStorage + URL param hydration (WIZ-04, WIZ-05, WIZ-09, WIZ-10) — **03-03-T1**
- [x] `src/lib/leads/__tests__/botGates.test.ts` — honeypot, time-floor, URL-in-notes (SPAM-01, SPAM-03, SPAM-04) — **03-04-T1**
- [x] `src/lib/email/__tests__/LeadNotification.test.tsx` + `LeadConfirmation.test.tsx` — React Email render snapshots (LEAD-08, LEAD-09) — **03-05-T1**
- [x] `tests/e2e/wizard-happy-path.spec.ts` — mobile viewport, full 4-step flow (WIZ-01..07, WIZ-13); includes W2 `LK-PLACE` negative assertion — **03-06-T2**
- [x] `tests/e2e/wizard-refresh-deeplink.spec.ts` — state persistence (WIZ-04, WIZ-05, WIZ-09) — **03-06-T2**
- [x] `src/components/wizard/__tests__/StickyEstimateBar.test.tsx` — per-step field + EST-04 equal-visual-weight contract — **03-03-T3**
- [x] `src/actions/__tests__/submitInquiry.test.ts` — email fail → lead still stored (LEAD-01, LEAD-02, LEAD-05, LEAD-10) — **03-05-T2**
- [x] `src/actions/__tests__/submitInquiry.test.ts` — duplicate submit within 60s via idempotency key (LEAD-04) — **03-05-T2** (same spec file, idempotency test case)
- [x] `tests/e2e/wizard-happy-path.spec.ts` — submission ID on confirmation screen (WIZ-12) — **03-06-T2**
- [x] `src/lib/spam/__tests__/turnstile.test.ts` — Turnstile fail silent reject coverage (SPAM-02, LEAD-02) — **03-05-T1**
- [x] `tests/e2e/wizard-silent-bot.spec.ts` — honeypot / URL-in-notes silent reject returning generic 200 (SPAM-01, SPAM-04, SPAM-05) — **03-06-T2**
- [x] Test fixtures — inlined per-spec via `baseInput()` / `fixture()` factories (`src/actions/__tests__/submitInquiry.test.ts`, `src/lib/leads/__tests__/InMemoryLeadStore.test.ts`, `src/pages/api/cron/__tests__/retry-email.test.ts`)
- [x] `src/lib/leads/InMemoryLeadStore.ts` — in-memory LeadStore for unit tests; `resetLeadStoreForTests()` singleton reset — **03-04-T2** (replaces "tests/fixtures/turso.ts" from earlier design — Sheets-backed, not Turso; same role)
- [x] Turnstile test-key fixtures injected via `playwright.config.ts` `webServer.env` — **03-06-T2** (B5 isolation — no file-based fixtures that would leak into `.env`)
- [ ] `scripts/test-emails.ts` — React Email preview runner (`pnpm email:dev`) — **DEFERRED to Phase 4** (not a shipping blocker; Vitest template tests cover render fidelity)
- [ ] `.github/workflows/ci.yml` — typecheck + biome + vitest + playwright + SPAM-06 gate — **DEFERRED to Phase 4** per Plan 02 Task 2 note ("CI workflow edits are out of scope for Phase 3")
- [x] `src/env.d.ts` rename `TURNSTILE_SITE_KEY` → `PUBLIC_TURNSTILE_SITE_KEY` (client-exposed) + add `CRON_SECRET`, `RESEND_WEBHOOK_SECRET` — **03-01-T1**
- [x] `scripts/check-turnstile-keys.sh` — SPAM-06 CI gate — **03-02-T2**

**Deferred items are NOT shipping blockers.** Both carry-overs (email preview runner, GitHub Actions workflow) are Phase 4 responsibilities and tracked there. All RESEARCH.md-mandated Vitest + Playwright Wave 0 coverage ships within Phase 3.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real Turnstile widget renders on mobile Safari | SPAM-02 | Third-party iframe + Turnstile enterprise limits prevent reliable automation on real keys | Load wizard on iOS Safari, reach step 4, confirm Turnstile challenge renders invisibly (no checkbox) and submission proceeds |
| Larrae receives formatted notification email | LEAD-08 | Deliverability to her real inbox depends on DNS propagation & inbox rules | After CI-green, trigger one live submission on preview deploy; verify email arrives in Larrae's inbox with correct formatting |
| Inquirer confirmation email renders correctly across Gmail / iOS Mail / Outlook | LEAD-09 | Email client rendering variance requires human inspection | Send confirmation to test inboxes (Gmail web + iOS Mail + Outlook web); capture screenshots |
| Vercel Cron retry fires and hits the retry endpoint on schedule | LEAD-11 | Cron scheduling is infra-side; simulated locally is not equivalent | 24h after deploy, check Vercel dashboard → Cron logs → confirm daily hit + retry success when a lead has pending email status |
| Resend webhook correlation round-trip | LEAD-12 | Requires a real Resend event (bounce/delivery) to be posted to the deployed webhook | After first real submission, check Sheets `notify_email_status` / `confirm_email_status` columns transition from `sent` → (eventually) `sent` confirmed by webhook; force a bounce by using an invalid destination once to verify `failed` transition |
| Funnel events appear in Vercel Analytics dashboard | OBS-01 | Analytics pipeline is external; custom events only visible after ingest | Complete one wizard flow on preview; 5 minutes later check Vercel Analytics → Custom Events → confirm `wizard_*` events with expected properties |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (per-task map above)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (deferrals to Phase 4 explicitly documented)
- [x] No watch-mode flags (CI runs `--run`, not `--watch`)
- [x] Feedback latency < 45s (unit) / < 180s (full)
- [x] `nyquist_compliant: true` set in frontmatter — per-task map complete, all tasks have automated commands, no 3-consecutive-gap
- [x] `wave_0_complete: true` set in frontmatter — all RESEARCH.md-mandated Wave 0 infra is scheduled in Plan 03 Task 1 (Vitest/jsdom) or Plan 06 Task 2 (Playwright extension); explicit deferrals documented

**Approval:** planner-revised 2026-04-16
