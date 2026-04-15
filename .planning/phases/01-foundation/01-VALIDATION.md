---
phase: 1
slug: foundation
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-15
updated: 2026-04-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `01-RESEARCH.md` § "Validation Architecture".
> Task IDs populated from the 7 PLAN.md files.

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

- **After every task commit:** `pnpm exec biome check --write` (lefthook pre-commit, fast feedback — installed in Wave 5)
- **After every plan wave:** `pnpm exec astro sync && pnpm exec astro check && pnpm exec vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green on `main`; adversarial checks for FND-06 + FND-09 completed
- **Max feedback latency:** ~5 s per commit, ~75 s per wave

---

## Per-Task Verification Map

Task IDs keyed to the 7 PLAN.md files. Format: `{plan}.{task}`.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1.1 | 01-01-PLAN | 1 | FND-01 | — | Astro 6 scaffold + pnpm/Node pins; dev server serves `/` with brand word | smoke (curl) + build | `pnpm install --frozen-lockfile && pnpm dev → curl localhost:4321 → grep larrae` | ✅ created in-task | ⬜ pending |
| 2.1 | 01-02-PLAN | 2 | FND-01 | — | Integrations + Vercel adapter wired; `pnpm build` succeeds with output:'server' | unit (grep) + build | `grep -q 'output: "server"' astro.config.mjs && pnpm build` | ✅ in-task | ⬜ pending |
| 2.2 | 01-02-PLAN | 2 | FND-08 | — | `.env.example` + `src/env.d.ts` agree on 8 var names | unit (parse+diff) | `diff <(grep -oE '^[A-Z][A-Z_]+' .env.example) <(grep -oE 'readonly [A-Z_]+' src/env.d.ts)` | ✅ in-task | ⬜ pending |
| 3.1 | 01-03-PLAN | 3 | FND-02, FND-03 | — | Tailwind v4 tokens compile to CSS custom properties; Fontsource self-hosted | build + grep | `pnpm build && grep -rq "color-deep-amber" dist/ \|\| .vercel/output/static/` | ✅ in-task | ⬜ pending |
| 3.2 | 01-03-PLAN | 3 | FND-01 | — | shadcn initialized w/ Tailwind v4 track; Button installed; `@/` path alias resolves | typecheck + build | `pnpm exec astro check && pnpm build` | ✅ in-task | ⬜ pending |
| 3.3 | 01-03-PLAN | 3 | FND-02, FND-03 | — | Visual: brand green on cream; no Google Fonts requests | human-verify checkpoint | DevTools Network tab inspection | — | ⬜ pending |
| 4.1 | 01-04-PLAN | 4 | FND-04 | — | 8 Zod schemas export schema + inferred type; pricing stub exports `estimate`/types | unit (file exist + grep) | `grep 'export const .*Schema' src/lib/schemas/*.ts \| wc -l` == 8 | ✅ in-task | ⬜ pending |
| 4.2 | 01-04-PLAN | 4 | FND-04 | — | `content.config.ts` registers 8 collections; `astro sync` exits 0 with empty dirs | content-schema | `pnpm exec astro sync` | ✅ in-task | ⬜ pending |
| 5.1 | 01-05-PLAN | 5 | FND-01, FND-05 | — | Biome + Vitest + Playwright + lefthook installed; smoke asserts `/` returns 200 + brand word | lint + unit + smoke | `pnpm exec biome check . && pnpm exec vitest run && pnpm exec playwright test` | ✅ in-task (creates smoke spec) | ⬜ pending |
| 6.1 | 01-06-PLAN | 6 | FND-05, FND-06, FND-09 | — | CI workflows exist w/ exact job IDs; image-budget script adversarially verified | unit (grep) + adversarial | `grep -q 'typecheck:' ci.yml && dd 700KB → bash scripts/check-image-budget.sh → non-zero` | ✅ in-task | ⬜ pending |
| 7.2 | 01-07-PLAN | 7 | FND-06 | — | CODEOWNERS has real maintainer username | unit (grep) | `! grep -q MAINTAINER-USERNAME .github/CODEOWNERS` | ✅ in-task | ⬜ pending |
| 7.4 | 01-07-PLAN | 7 | FND-08 | — | Vercel Preview + Production both have 8 env var placeholders | meta (CLI) | `diff <(grep ^[A-Z] .env.example) <(vercel env ls preview)` and same for production | — (Vercel side) | ⬜ pending |
| 7.6 | 01-07-PLAN | 7 | FND-06 | — | `main` branch protection: 6 contexts + CODEOWNERS + force-push denied; adversarial push rejected | meta-CI + adversarial push | `gh api branches/main/protection .required_status_checks.contexts` + `git push origin main` must fail | — (GitHub side) | ⬜ pending |
| 7.1, 7.3, 7.5, 7.7 | 01-07-PLAN | 7 | FND-06, FND-07 | — | External facts gathered; `vercel link`; scratch PR opens + green CI + preview URL; merge through protection → production deploy | human-verify checkpoints | Human observation + `gh pr view` + Vercel dashboard | — (external) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Coverage Verification — all 9 FND-XX requirements appear in at least one plan's `requirements` field

| Req | Covered By Plan(s) |
|-----|--------------------|
| FND-01 | 01, 02, 03, 05 |
| FND-02 | 03 |
| FND-03 | 03 |
| FND-04 | 04 |
| FND-05 | 05, 06 |
| FND-06 | 06, 07 |
| FND-07 | 07 |
| FND-08 | 02, 07 |
| FND-09 | 06 |

✅ All 9 requirements covered.

---

## Wave 0 Requirements

Each Wave-0 gap is addressed in-phase — these files are created by the plan that needs them BEFORE the wave that runs them:

- [x] `vitest.config.ts` — created in Task 5.1 (Wave 5)
- [x] `tests/smoke.spec.ts` — created in Task 5.1 (Wave 5)
- [x] `playwright.config.ts` — created in Task 5.1 (Wave 5)
- [x] `biome.json` — created in Task 5.1 (Wave 5)
- [x] `scripts/check-image-budget.sh` — created in Task 6.1 (Wave 6)
- [x] All 8 content directories `.gitkeep` — created in Task 4.2 (Wave 4)
- [x] `pnpm exec playwright install --with-deps chromium` — executed in Task 5.1 (Wave 5)
- [x] `pnpm exec lefthook install` — executed in Task 5.1 (Wave 5)
- [ ] `src/lib/schemas/<domain>.test.ts` malformed-data tests — **DEFERRED to Phase 2** per RESEARCH § Wave 0 Gaps line 1093 "Can land in Phase 2 if Wave 0 gets over-scoped". `content-sync` job in CI (Task 6.1) provides the same schema-validation signal for real content PRs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel preview URL appears on PR | FND-07 | Depends on GitHub↔Vercel integration which can't be CI-asserted from inside the repo | Task 7.5: open a scratch PR, confirm Vercel bot comments with preview URL within 3 min, confirm URL renders `/` |
| Direct push to `main` rejected | FND-06 (adversarial) | Branch protection assertion needs an attempted-push side effect | Task 7.6: from a scratch local branch, `git push origin HEAD:main`; assert push rejected with branch-protection error |
| Vercel env vars registered in both environments | FND-08 | CLI side, not in repo | Task 7.4: `vercel env ls preview` and `vercel env ls production` — both list all 8 var names from `.env.example` |
| Visual design verification (brand green, warm cream, no Google Fonts) | FND-02, FND-03 | Browser-rendered pixel inspection | Task 3.3: DevTools Network tab + computed style check |
| Maintainer GitHub username, Vercel account, repo full name | FND-06, FND-07 | Facts outside the repo | Task 7.1: collected from maintainer before Task 7.2/7.3/7.6 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify OR are checkpoint tasks documented in Manual-Only Verifications
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (checkpoint-heavy Wave 7 is the exception — documented above)
- [x] Wave 0 covers all MISSING references (schemas test-module deferred to Phase 2 with CI replacement signal)
- [x] No watch-mode flags
- [x] Feedback latency < 75s per wave
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned — sign-off happens after Phase 1 executes and VERIFICATION.md is produced.
