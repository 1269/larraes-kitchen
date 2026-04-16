---
phase: 01-foundation
plan: 05
subsystem: dev-tooling
tags: [biome, vitest, playwright, lefthook, smoke-test, d-09, d-12, fnd-01, fnd-05]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 03
    provides: "Tailwind v4 + brand tokens + global.css; base layout renders brand word"
  - phase: 01-foundation
    plan: 04
    provides: "zod schemas + content.config.ts + pricing stub + estimate.test.ts scaffold awaiting Vitest"
provides:
  - "Biome 2.4.12 installed; biome.json authored (Biome 2.4 migrated config — files.includes array with ! exclusions, assist.actions.source.organizeImports)"
  - "Vitest 4.1.4 installed; vitest.config.ts owns src/**/*.test.ts + tests/**/*.test.ts; excludes tests/smoke.spec.ts so Playwright owns *.spec.ts"
  - "@playwright/test 1.59.1 installed with Chromium 1217 browser binary; playwright.config.ts boots Astro dev server on :4321"
  - "tests/smoke.spec.ts — FND-01 canonical smoke: `/` returns 200 and body matches `/larrae/i`"
  - "lefthook 2.1.5 installed; lefthook.yml runs `pnpm exec biome check --write --staged` with `stage_fixed: true`"
  - "pre-commit hook installed at $(git rev-parse --git-common-dir)/hooks/pre-commit (shared across worktrees)"
  - "package.json scripts: lint, lint:fix, test, test:e2e, check:images (check:images stub — Wave 6 creates the bash script)"
  - "schema-dts 2.0.0 pre-installed (dev-only) per RESEARCH Phase-Deferred exception — Phase 4 JSON-LD types ready without re-install"
affects: [01-06, 01-07, 02-*, 03-*]

# Tech tracking
tech-stack:
  added:
    - "@biomejs/biome@2.4.12"
    - "vitest@4.1.4"
    - "@playwright/test@1.59.1"
    - "lefthook@2.1.5"
    - "schema-dts@2.0.0"
  patterns:
    - "Vitest owns `*.test.ts`, Playwright owns `*.spec.ts` — vitest.config.ts `exclude: [tests/smoke.spec.ts, tests/e2e/**]` enforces the boundary at runtime"
    - "Playwright webServer wraps `pnpm dev` so smoke tests are hermetic: CI starts a fresh server (reuseExistingServer: false via CI env), dev reuses an already-running one"
    - "Biome 2.4 config shape: `files.includes` (array with `!` exclusions), `assist.actions.source.organizeImports: \"on\"` — migrated automatically via `pnpm exec biome migrate --write`"
    - "lefthook pre-commit runs Biome only on staged files (`{staged_files}` token + `--staged` flag + `stage_fixed: true`) — CI remains source of truth for full-repo lint (D-12)"

key-files:
  created:
    - "biome.json"
    - "vitest.config.ts"
    - "playwright.config.ts"
    - "tests/smoke.spec.ts"
    - "lefthook.yml"
  modified:
    - "package.json (+5 dev deps, +5 scripts)"
    - "pnpm-lock.yaml"

key-decisions:
  - "Biome resolved to 2.4.12 (current latest on npm), not 2.3 as RESEARCH templated. Used `pnpm exec biome migrate --write` to convert the RESEARCH template (`files.include` + `organizeImports: { enabled: true }`) to the 2.4 shape (`files.includes` with `!` exclusions + `assist.actions.source.organizeImports: \"on\"`). Zero functional difference — same globs, same lint rules, same formatter settings."
  - "`.astro` Biome Astro recipe override NOT needed. Running `pnpm exec biome check src/pages/index.astro` parsed cleanly on first try (A4 assumption holds on Biome 2.4.12)."
  - "lefthook installed with `--force` because `core.hooksPath` is set locally in this worktree (normal for git worktrees that share the common `.git` dir). Hooks land at `$(git rev-parse --git-common-dir)/hooks/pre-commit`, which serves all worktrees for this repo. Plan's acceptance criterion `test -f .git/hooks/pre-commit` resolves via the shared common-dir."
  - "Biome exits non-zero on `pnpm exec biome check .` (14 errors, 6 warnings) — all style/format findings in Wave 2/3/4 source files (`button.tsx` import sort, `schemas/*.ts` formatter width, `utils.ts` import sort, `global.css` Tailwind-specific at-rules). NOT crashes, NOT broken parsing of .astro. Per plan: 'May report style fixes needed — that's fine (not a hard fail). MUST NOT crash.' — accepted as-is. Wave 6 CI will use `biome ci .` as required status check; pre-existing style drift will be cleaned up before Wave 6 lands or fixed incrementally as lefthook auto-applies on next commit to each file."
  - "Did NOT add Husky/lint-staged (plan explicit Do Not), no pre-commit typecheck (D-12 says too slow), no firefox/webkit (Phase 1 chromium-only per RESEARCH line 202), no custom lint rules (D-12 recommended-only)."

patterns-established:
  - "Dual test-runner contract: Vitest `*.test.ts` + Playwright `*.spec.ts` enforced via vitest.config.ts `exclude` — next phases that add E2E scenarios write `.spec.ts`, unit tests write `.test.ts`, and neither runner crosses the line"
  - "Playwright `webServer.command: pnpm dev` pattern — smoke + future E2E tests self-boot the Astro dev server; CI caches Chromium 1217 at `~/Library/Caches/ms-playwright/chromium-1217` (darwin) or `~/.cache/ms-playwright` (linux)"
  - "Local pre-commit feedback loop via lefthook: staged files only, parallel execution, Biome auto-writes and re-stages fixes — per D-12, CI remains the blocking source of truth"

requirements-completed: [FND-01, FND-05]

# Metrics
duration: ~8 min
completed: 2026-04-15
---

# Phase 01 Plan 05: Dev Tooling Spine (Biome + Vitest + Playwright + lefthook) Summary

**Biome 2.4.12, Vitest 4.1.4, Playwright 1.59.1 (with Chromium 1217), lefthook 2.1.5, and schema-dts 2.0.0 installed; canonical configs authored; FND-01 smoke test passes in 6.5s against a booted Astro dev server; lefthook pre-commit runs Biome on staged files only.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-15T17:43:00Z (worktree spawn)
- **Completed:** 2026-04-15T17:51:00Z
- **Tasks:** 1 / 1
- **Commits:** `aed5033`
- **Files created:** 5 (biome.json, vitest.config.ts, playwright.config.ts, tests/smoke.spec.ts, lefthook.yml)
- **Files modified:** 2 (package.json, pnpm-lock.yaml)

## Task Commits

1. **Task 5.1: Install Biome + Vitest + Playwright + lefthook, author configs** — `aed5033` (chore)

## Installed Versions

```
@biomejs/biome    2.4.12
vitest            4.1.4
@playwright/test  1.59.1
lefthook          2.1.5
schema-dts        2.0.0
```

Playwright browser binaries cached at `~/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64` (darwin arm64 local) — CI Ubuntu runners will cache the linux equivalent.

## Accomplishments

- Installed the full Phase 1 dev-tooling spine: Biome (lint + format), Vitest (unit), Playwright (E2E smoke), lefthook (pre-commit), schema-dts (dev-only JSON-LD types pre-staged for Phase 4)
- `biome.json` authored at the Biome 2.4 canonical shape — `files.includes` array with `!` exclusions, `linter.rules.recommended: true`, 2-space indent, 100-column line width, `assist.actions.source.organizeImports: "on"`
- `vitest.config.ts` explicitly excludes `tests/smoke.spec.ts` so Vitest never tries to run Playwright specs (different runners, different assertion APIs)
- `playwright.config.ts` wires the Astro dev server via `webServer.command: "pnpm dev"`, `baseURL: "http://localhost:4321"`, 2 retries on CI / 0 local, chromium-only project (firefox/webkit deferred to Phase 4 per plan)
- `tests/smoke.spec.ts` asserts the FND-01 contract: `/` returns 200 AND body contains `/larrae/i` — this test is the signal Wave 6 CI will rely on for the `smoke` required status check
- `lefthook.yml` pre-commit: `pnpm exec biome check --write --staged --no-errors-on-unmatched {staged_files}` with `stage_fixed: true` — auto-fixes style drift on commit, re-stages the fixed version, keeps the commit clean
- `pnpm exec lefthook install --force` installed the hook at the shared common-dir (`.git/hooks/pre-commit`) — works across worktrees because every worktree shares `git rev-parse --git-common-dir`
- `package.json` scripts added: `lint` (biome check .), `lint:fix` (biome check --write .), `test` (vitest run), `test:e2e` (playwright test), `check:images` (Wave 6 creates the bash script — script line is a stub pointer for now)
- `pnpm exec vitest run` → exit 0, 1 skipped (matches the `estimate.test.ts` `it.skip` scaffold from Wave 4)
- `pnpm exec playwright test` → exit 0, 1 passed in 6.5s end-to-end (548ms test + Astro dev boot), no retries fired locally
- `pnpm build` still exits 0 — `/index.html` prerenders, Vercel function bundle emits

## Biome `.astro` Override

**Not required.** Running `pnpm exec biome check src/pages/index.astro` parsed cleanly on the first try. Assumption A4 (RESEARCH § Assumptions Log) holds on Biome 2.4.12 — first-party `.astro` parsing works out of the box, no additional `overrides` stanza needed in `biome.json`.

## Playwright Run Duration + Retries

```
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/smoke.spec.ts:3:1 › home page returns 200 and renders brand word (548ms)

  1 passed (6.5s)
```

- Test execution: **548 ms**
- Total run (Astro dev boot + test + teardown): **6.5 s**
- Retries fired locally: **0** (CI config sets `retries: 2` — not exercised locally)

## lefthook Install Confirmation

```
$ pnpm exec lefthook install --force
│  core.hooksPath is set locally to '/Users/jashia/Documents/1_Projects/larraes-kitchen/.git/hooks'
│  Installing hooks anyway in '/Users/jashia/Documents/1_Projects/larraes-kitchen/.git/hooks'
sync hooks: ✔️ (pre-commit)
```

The `--force` flag was required because `core.hooksPath` is set locally (standard behavior in git worktrees that share the common `.git` dir). The installed hook lives at the common-dir path and serves all worktrees of this repo.

Head of `.git/hooks/pre-commit` (resolved via common-dir):

```sh
#!/bin/sh

if [ "$LEFTHOOK_VERBOSE" = "1" -o "$LEFTHOOK_VERBOSE" = "true" ]; then
  set -x
fi
```

## Biome Findings (Pre-existing, Out of Scope)

`pnpm exec biome check .` reports 14 errors + 6 warnings on files authored in Waves 2–4 **before** Biome existed in the toolchain:

| File | Category | Action |
|------|----------|--------|
| `biome.json` | `lint/suspicious/useBiomeIgnoreFolder` × 5 | Cosmetic — Biome suggests `.biomeignore` instead of `!` entries; either form is valid |
| `src/components/ui/button.tsx` | `lint/style/useImportType` + format (import-sort) | Auto-fixable via `biome check --write`; lefthook will apply on next commit to this file |
| `src/lib/schemas/{faq,menu,packages,site}.ts` | format (line-width / quote style) | Auto-fixable; will resolve on next Wave-2 touch |
| `src/lib/utils.ts` | format (import-sort) | Auto-fixable |
| `src/styles/global.css` | `Tailwind-specific syntax is disabled` (×4) + parse error on `@theme` | Known Biome limitation — `@theme` and related Tailwind v4 at-rules are not recognized by Biome's CSS parser. Documented under "Known Limitations" below. |

**NOT fixed in this plan** per SCOPE BOUNDARY (plan 01-05 scope is "install tooling + author configs", not "clean up style drift from prior waves"). Wave 6 CI uses `biome ci .` as a required status check — style drift will either be auto-fixed by lefthook as each file is next committed, or cleaned up as a Wave 6 preflight fix-up commit.

**Did NOT crash on any .astro file.** Acceptance criterion "MUST NOT crash" holds.

## Known Limitations

- **`global.css` Biome parse error:** Tailwind v4's `@theme`, `@custom-variant`, and `@utility` at-rules aren't recognized by Biome's CSS parser (Biome 2.4). `global.css` produces a `Tailwind-specific syntax is disabled` error in `biome check`. Two forward paths: (a) add `"css": { "parser": { "cssModules": false } }` override and/or exclude `src/styles/global.css` from Biome's CSS parser when a Biome release adds Tailwind v4 support; (b) accept the error and exclude `global.css` via `biome.json` `files.includes` (preferred if the error becomes noisy). **Current state:** no exclusion added — the error is visible and Wave 6 CI will surface it; resolution deferred to a planned Wave 6 or Phase 2 cleanup pass.
- **pnpm engine warning** — `WARN Unsupported engine: wanted: {"node":">=22.12.0 <23"} (current: {"node":"v23.8.0"…})`. Persistent across all Phase 1 waves; not actionable at the plan level.
- **Vercel adapter Node 23 warning** — `[@astrojs/vercel] The local Node.js version (23) is not supported…`. Same as every Phase 1 wave; CI runs on a supported version.

## Decisions Made

- **Biome 2.4.12 (latest) accepted over RESEARCH's 2.3.0 template.** `pnpm add -D @biomejs/biome` resolved to the current latest on the dist-tag. The RESEARCH template (2.3 shape) doesn't validate against 2.4 schema — ran `pnpm exec biome migrate --write` to convert `files.include → files.includes` with `!` exclusions and `organizeImports → assist.actions.source.organizeImports`. Same semantics, different config names.
- **No `.astro` override stanza.** Probe command `pnpm exec biome check src/pages/index.astro` succeeded on first run. Assumption A4 holds on 2.4.12.
- **lefthook installed at common `.git/hooks` path (not worktree-local).** Worktrees share a common git directory; `lefthook install --force` bypasses the `core.hooksPath` safety hint and installs into `$(git rev-parse --git-common-dir)/hooks`. The pre-commit hook fires on every commit from every worktree. No per-worktree isolation needed.
- **Biome non-zero exit accepted as "style findings, not crash".** Per plan language: "May report style fixes needed — that's fine (not a hard fail). MUST NOT crash." Pre-existing wave 2-4 style drift not fixed in this plan per scope boundary.
- **Playwright Chromium only.** Firefox/WebKit deferred to Phase 4 per RESEARCH line 202 and plan explicit Do-Not.
- **schema-dts installed here (Phase 1), not Phase 4.** Per RESEARCH Phase-Deferred exception; zero cost to install now, saves Phase 4 re-install churn.

## Deviations from Plan

**None substantive.** The only delta worth noting:

- **Biome config migrated to 2.4 shape.** Plan text shows the 2.3 template; installed version is 2.4.12. Ran `pnpm exec biome migrate --write` to produce the shape Biome 2.4 validates against. Same rules, same formatter, same assist behavior — config keys renamed only. Documented under "Decisions Made".
- **lefthook `--force` flag used.** Plan shows `pnpm exec lefthook install` without `--force`. In worktrees, lefthook detects that `core.hooksPath` is set locally and refuses without `--force`. Used `--force` with explicit confirmation — this is the documented lefthook behavior for worktree-based repos. No functional change to the hook behavior.

## Issues Encountered

- **Biome 2.3 → 2.4 config migration required.** Resolved in 3 seconds via `pnpm exec biome migrate --write`. No manual edit of `biome.json` needed.
- **lefthook refused `install` without `--force` due to `core.hooksPath`.** Resolved by using `--force`. Standard behavior in worktree-based repos; lefthook installs the hook at the common-dir path, which serves all worktrees.
- **Biome surfaces style drift from waves 2–4.** Out of scope for plan 01-05; deferred to Wave 6 or Phase 2 cleanup as described above.

## User Setup Required

None. No external service, secret, or dashboard step added. Playwright Chromium binary downloads automatically (already cached on this machine; CI will cache on first run of Wave 6's workflow).

## Next Wave Readiness

- **Ready for Wave 6 (CI workflow):** `biome check`, `vitest run`, `playwright test`, `astro sync`, `astro check` (after Wave 6 adds `@astrojs/check`) are all operational locally. Wave 6 will compose them into `.github/workflows/ci.yml` as required status checks. CI cache paths:
  * Biome binary — resolved via pnpm store, no extra caching needed
  * Vitest — no browser binaries, no caching needed
  * Playwright — `~/.cache/ms-playwright` on linux runners (cache-key: Playwright version + OS)
  * lefthook — not run in CI (CI is source of truth per D-12)
- **Ready for Wave 7 (branch protection + Vercel):** no tooling blockers; Wave 7 depends on Wave 6's workflow existing.
- **Ready for Phase 2 (content authoring):** Biome will auto-format markdown frontmatter quotes; Vitest schema tests can be added under `src/lib/schemas/<domain>.test.ts` as Wave 0 gap RESEARCH line 1096 identified.
- **Ready for Phase 3 (wizard + Action):** `estimate.test.ts` `it.skip` scaffold will flip to real tests when Phase 3 implements `estimate()`. Vitest is wired and ready.

## Threat Flags

None. No new network endpoints, auth paths, file-access patterns, or schema changes at trust boundaries introduced. This plan adds dev-tooling dependencies only; no runtime code changes, no user input handling.

## TDD Gate Compliance

Plan frontmatter sets `type: execute`, single task with no `tdd="true"` attribute. No TDD RED→GREEN gate required. The smoke test file (`tests/smoke.spec.ts`) is a Playwright E2E assertion, not a Vitest unit test — and it lands alongside the tooling that runs it in one atomic commit, which is the correct shape for a tooling-scaffold plan.

## Self-Check: PASSED

Verified against every acceptance criterion plus commit existence:

- ✅ `package.json` devDependencies include: `@biomejs/biome@2.4.12`, `vitest@4.1.4`, `@playwright/test@1.59.1`, `lefthook@2.1.5`, `schema-dts@2.0.0`
- ✅ `biome.json` exists with `"$schema": "https://biomejs.dev/schemas/2.4.12/schema.json"` (matches installed major.minor.patch)
- ✅ `biome.json` `files.includes` globs cover `*.astro` (via `**/src/**/*.{ts,tsx,js,jsx,astro,json,css}`)
- ✅ `vitest.config.ts` exports default config; `exclude` list contains `tests/smoke.spec.ts`
- ✅ `playwright.config.ts` has `webServer.command: "pnpm dev"`, `baseURL: "http://localhost:4321"`, chromium project
- ✅ `tests/smoke.spec.ts` exists with `page.goto("/")`, `expect(response?.status()).toBe(200)`, `toContainText(/larrae/i)`
- ✅ `lefthook.yml` has `pre-commit.commands.biome` with `run:` invoking `biome check --write --staged`
- ✅ `.git/hooks/pre-commit` exists (resolved via `git rev-parse --git-common-dir`)
- ✅ `package.json` scripts include: `lint`, `lint:fix`, `test`, `test:e2e`, `check:images`
- ✅ `pnpm exec biome check .` runs without crash (style-only findings in pre-existing wave 2-4 files)
- ✅ `pnpm exec vitest run` exits 0 (1 skipped)
- ✅ `pnpm exec playwright test` exits 0 (1 passed, 6.5s total)
- ✅ `pnpm build` still exits 0 (prerender + function bundle)
- ✅ Commit `aed5033` (Task 5.1) present in `git log --oneline`
- ✅ No unexpected file deletions in the commit (`git diff --diff-filter=D --name-only HEAD~1 HEAD` → empty)

---
*Phase: 01-foundation*
*Plan: 05*
*Completed: 2026-04-15*
