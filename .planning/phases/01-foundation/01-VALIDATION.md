---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `01-RESEARCH.md` § "Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (unit) + Playwright 1.5x (E2E smoke) + `astro check` (typecheck) + `astro sync` (content schema) + `scripts/check-image-budget.sh` (image budget) + Biome 2.3+ (lint/format) |
| **Config files** | `vitest.config.ts`, `playwright.config.ts`, `biome.json`, `tsconfig.json`, `src/content.config.ts`, `scripts/check-image-budget.sh` |
| **Quick run command** | `pnpm exec biome check . && pnpm exec astro sync` |
| **Full suite command** | `pnpm exec biome ci . && pnpm exec astro sync && pnpm exec astro check && bash scripts/check-image-budget.sh && pnpm exec vitest run && pnpm exec playwright test` |
| **Estimated runtime** | ~45–75 seconds full suite on cold cache; ~5 seconds quick |

---

## Sampling Rate

- **After every task commit:** `pnpm exec biome check --write` (lefthook pre-commit, fast feedback)
- **After every plan wave:** `pnpm exec astro sync && pnpm exec astro check && pnpm exec vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green on `main`; adversarial checks for FND-06 + FND-09 completed
- **Max feedback latency:** ~5 s per commit, ~75 s per wave

---

## Per-Task Verification Map

> Filled in by the planner once PLAN.md task IDs exist. Skeleton mirrors the requirement→test map in RESEARCH.md.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _TBD_ | _TBD_ | 1 | FND-01 | — | Site scaffolds, builds, `/` returns 200 | smoke | `pnpm exec playwright test tests/smoke.spec.ts` | ❌ W0 (Wave 5) | ⬜ pending |
| _TBD_ | _TBD_ | 3 | FND-02 | — | Tokens compile to CSS custom properties | unit + smoke | `pnpm build && grep -q "color-deep-amber" dist/**/*.css` | ❌ W0 (Wave 3) | ⬜ pending |
| _TBD_ | _TBD_ | 3 | FND-03 | — | Self-hosted fonts resolve; no Google Fonts request | smoke | Playwright network assertion | ❌ W0 (Wave 5) | ⬜ pending |
| _TBD_ | _TBD_ | 4 | FND-04 | — | 8 collections defined; `astro sync` enforces Zod | content-schema + unit | `pnpm exec astro sync && pnpm exec vitest run src/lib/schemas` | ❌ W0 (Wave 4) | ⬜ pending |
| _TBD_ | _TBD_ | 6 | FND-05 | — | CI runs every required check; blocks merge on failure | meta-CI | Adversarial PR with deliberate failures | ❌ W0 (Wave 6) | ⬜ pending |
| _TBD_ | _TBD_ | 7 | FND-06 | — | `main` protected, status checks + CODEOWNERS enforced | meta-CI | `gh api repos/:owner/:repo/branches/main/protection` + push attempt | ❌ W0 (Wave 7) | ⬜ pending |
| _TBD_ | _TBD_ | 7 | FND-07 | — | Vercel preview URL on every PR | manual (observable) | Open PR; observe Vercel bot comment with preview URL | ❌ W0 (Wave 7) | ⬜ pending |
| _TBD_ | _TBD_ | 7 | FND-08 | — | `.env.example` + Vercel Preview/Production both list 8 vars | unit (parse) + meta (CLI) | `grep -c "^[A-Z]" .env.example` == 8 AND `vercel env ls` matches | ❌ W0 (Wave 7) | ⬜ pending |
| _TBD_ | _TBD_ | 6 | FND-09 | — | 700KB image under `public/images/` fails CI | smoke (adversarial) | Adversarial scratch branch, observe `image-budget` job red | ❌ W0 (Wave 6) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — not created by `pnpm create astro`; add in Wave 1
- [ ] `tests/smoke.spec.ts` — Playwright smoke test (Wave 5)
- [ ] `playwright.config.ts` — Playwright config + Astro dev server integration (Wave 5)
- [ ] `biome.json` — Biome config (Wave 5)
- [ ] `src/lib/schemas/<domain>.test.ts` — happy-path + malformed-data Vitest tests for each schema (recommended; can defer to Phase 2 if Wave 0 over-scopes)
- [ ] `scripts/check-image-budget.sh` — image budget script (Wave 6)
- [ ] One `.gitkeep` or `_placeholder.md` per content directory so `astro sync` traverses (Wave 4)
- [ ] Framework install: `pnpm exec playwright install --with-deps chromium` in CI cache (Wave 5)
- [ ] Framework install: `pnpm exec lefthook install` — local-only, documented in README

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel preview URL appears on PR | FND-07 | Depends on GitHub↔Vercel integration which can't be CI-asserted | Open a scratch PR; confirm Vercel bot comments with preview URL within 3 min; open URL and confirm `/` renders |
| Direct push to `main` rejected | FND-06 (adversarial) | Branch protection assertion needs an attempted-push side effect | From a scratch local branch, `git push origin HEAD:main`; assert push rejected with branch-protection error |
| Vercel env vars registered in both environments | FND-08 | CLI side, not in repo | `vercel env ls preview` and `vercel env ls production` — both list all 8 var names from `.env.example` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 75s
- [ ] `nyquist_compliant: true` set in frontmatter (planner sets after task IDs filled in)

**Approval:** pending
