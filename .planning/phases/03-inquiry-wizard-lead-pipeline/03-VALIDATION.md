---
phase: 3
slug: inquiry-wizard-lead-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Seeded from `03-RESEARCH.md` — `## Validation Architecture`. Planner will expand per-task verify maps.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unit), Playwright (E2E), React Email preview (visual), tsc/biome (static) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` (Wave 0 installs — no test infra yet in repo) |
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

*Planner fills this in during plan generation. Every task must map to a Vitest unit, Playwright scenario, or schema/static-analysis check per the RESEARCH.md Validation Architecture.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | — | — | — | — | — | — | — | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Per RESEARCH.md §Validation Architecture — Wave 0 gap list:

- [ ] `vitest.config.ts` + `pnpm add -D vitest @vitest/coverage-v8 @testing-library/react jsdom` — framework install
- [ ] `playwright.config.ts` + `pnpm add -D @playwright/test` + `pnpm exec playwright install chromium webkit` — E2E install
- [ ] `tests/unit/setup.ts` — jsdom + RHF + Zod shared fixtures
- [ ] `tests/unit/estimate.test.ts` — 1..200 guest sweep at all tier boundaries (EST-01..EST-08)
- [ ] `tests/unit/leadSchema.test.ts` — Zod parse / reject cases (LEAD-03..LEAD-05)
- [ ] `tests/unit/wizardState.test.ts` — sessionStorage + URL param hydration (WIZ-08..WIZ-11)
- [ ] `tests/unit/spamHeuristics.test.ts` — honeypot, time-floor, URL-in-notes (SPAM-02..SPAM-06)
- [ ] `tests/unit/emails/*.test.tsx` — React Email render snapshots (LEAD-07..LEAD-09)
- [ ] `tests/e2e/wizard-happy-path.spec.ts` — mobile viewport, full 4-step flow (WIZ-01..WIZ-07, WIZ-13)
- [ ] `tests/e2e/wizard-refresh-back-deeplink.spec.ts` — state persistence (WIZ-08, WIZ-09, WIZ-11)
- [ ] `tests/e2e/wizard-validation.spec.ts` — per-step field errors (WIZ-04, WIZ-12)
- [ ] `tests/e2e/submission-store-first.spec.ts` — email fail → lead still stored (LEAD-01, LEAD-02, LEAD-06)
- [ ] `tests/e2e/submission-idempotency.spec.ts` — duplicate submit within 60s (LEAD-10, LEAD-11)
- [ ] `tests/e2e/submission-confirmation.spec.ts` — submission ID on confirmation screen (WIZ-14)
- [ ] `tests/e2e/spam-turnstile.spec.ts` — Turnstile test token bypass + failure silent reject (SPAM-01)
- [ ] `tests/e2e/spam-heuristics.spec.ts` — honeypot / instant-submit silent reject returning generic 200 (SPAM-02..SPAM-06)
- [ ] `tests/fixtures/leads.ts` — factory for Zod-valid and bot-pattern leads
- [ ] `tests/fixtures/turso.ts` — in-memory libSQL for unit tests, named DB for E2E
- [ ] `tests/fixtures/turnstile.ts` — test site key + dummy verify response
- [ ] `scripts/test-emails.ts` — React Email preview runner (`pnpm email:dev`)
- [ ] `.github/workflows/ci.yml` — typecheck + biome + vitest + playwright (Wave 0 may defer CI to Phase 4)
- [ ] `src/env.d.ts` rename `TURNSTILE_SITE_KEY` → `PUBLIC_TURNSTILE_SITE_KEY` (client-exposed)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real Turnstile widget renders on mobile Safari | SPAM-01 | Third-party iframe + Turnstile enterprise limits prevent reliable automation on real keys | Load wizard on iOS Safari, reach step 4, confirm Turnstile challenge renders invisibly (no checkbox) and submission proceeds |
| Larrae receives formatted notification email | LEAD-07 | Deliverability to her real inbox depends on DNS propagation & inbox rules | After CI-green, trigger one live submission on preview deploy; verify email arrives in Larrae's inbox with correct formatting |
| Inquirer confirmation email renders correctly across Gmail / iOS Mail / Outlook | LEAD-08 | Email client rendering variance requires human inspection | Send confirmation to test inboxes (Gmail web + iOS Mail + Outlook web); capture screenshots |
| Vercel Cron retry fires and hits the retry endpoint on schedule | LEAD-12 | Cron scheduling is infra-side; simulated locally is not equivalent | 24h after deploy, check Vercel dashboard → Cron logs → confirm daily hit + retry success when a lead has null email timestamp |
| Funnel events appear in Vercel Analytics dashboard | WIZ-13 | Analytics pipeline is external; custom events only visible after ingest | Complete one wizard flow on preview; 5 minutes later check Vercel Analytics → Custom Events → confirm `wizard_*` events with expected properties |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags (CI runs `--run`, not `--watch`)
- [ ] Feedback latency < 45s (unit) / < 180s (full)
- [ ] `nyquist_compliant: true` set in frontmatter after planner fills per-task map

**Approval:** pending
