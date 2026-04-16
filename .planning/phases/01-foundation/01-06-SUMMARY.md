---
phase: 01-foundation
plan: 06
subsystem: ci-and-branch-protection
tags: [ci, github-actions, codeowners, branch-protection, image-budget, pitfall-5, d-09, d-10, d-11, d-16, fnd-05, fnd-06, fnd-09]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 05
    provides: "Dev-tooling spine (Biome, Vitest, Playwright, lefthook) + package.json scripts including check:images stub"
provides:
  - ".github/workflows/ci.yml — 6-job GitHub Actions workflow (install, typecheck, biome-check, content-sync, image-budget, smoke)"
  - ".github/workflows/pr-title.yml — Conventional Commits PR title enforcement via amannn/action-semantic-pull-request@v6"
  - ".github/CODEOWNERS — single-owner v1 placeholder (@MAINTAINER-USERNAME) for Wave 7 substitution"
  - "scripts/check-image-budget.sh — executable 600KB-per-image gate (FND-09); adversarially verified"
  - "scripts/setup-branch-protection.sh — executable, auditable gh api recipe whose contexts array matches ci.yml job IDs byte-for-byte; Wave 7 executes it after first green CI"
affects: [01-07, 02-*, 03-*, 04-*, 05-*]

# Tech tracking
tech-stack:
  added:
    - "actions/checkout@v4"
    - "pnpm/action-setup@v4"
    - "actions/setup-node@v4"
    - "actions/cache@v4"
    - "amannn/action-semantic-pull-request@v6"
  patterns:
    - "Required status check contexts (byte-for-byte): typecheck, biome-check, content-sync, image-budget, smoke, pr-title — enforced by Pitfall 5 parity check between ci.yml job IDs and setup-branch-protection.sh contexts array"
    - "Install job fans out to 5 downstream jobs via needs: install — shared pnpm install --frozen-lockfile + Node 22 cache: pnpm"
    - "Playwright CI pattern: actions/cache@v4 against ~/.cache/ms-playwright, pnpm exec playwright install --with-deps chromium, then pnpm exec playwright test"
    - "Image-budget gate is a pure bash script (no Node dependency) — portable across BSD (macOS dev) and GNU (Linux CI) find; uses wc -c for byte-accurate comparison"
    - "Branch-protection recipe committed as a replayable shell script (not just ad-hoc gh api commands) — provides audit trail + one-click re-apply if settings drift"

key-files:
  created:
    - ".github/workflows/ci.yml"
    - ".github/workflows/pr-title.yml"
    - ".github/CODEOWNERS"
    - "scripts/check-image-budget.sh"
    - "scripts/setup-branch-protection.sh"
  modified: []

key-decisions:
  - "Lifted ci.yml, pr-title.yml, CODEOWNERS, check-image-budget.sh, and setup-branch-protection.sh byte-for-byte from RESEARCH § Code Examples — no local edits, no 'improvements'. Pitfall 5 (required-check context drift) specifically flags any renaming of job IDs; the safest posture is verbatim reproduction."
  - "Did NOT activate branch protection in this wave. The plan explicitly defers `./scripts/setup-branch-protection.sh` execution to Wave 7 after the first green CI run on a scratch PR, because GitHub requires check contexts to exist before they can be required."
  - "CODEOWNERS keeps the `@MAINTAINER-USERNAME` placeholder — Wave 7 substitutes the real GitHub username once Vercel + GitHub repo are linked (Open Question #3 in RESEARCH lines 1030-1033)."
  - "Parity verification uses structured awk (under `jobs:` stanza only), not flat grep — the initial grep-based verification regex false-positive'd on the top-level `push:` key under `on:`. The tightened awk parser confirms ci.yml job IDs (minus install) ∪ {pr-title} == setup-branch-protection.sh contexts, byte-for-byte."
  - "Adversarial image-budget test used `dd if=/dev/zero` to create a deterministic 700KB fixture — confirmed the script exits non-zero on oversize, exits 0 after cleanup."

patterns-established:
  - "Two-tier CI contract: install once, fan out to 5 parallel check jobs. Each job re-runs `pnpm install --frozen-lockfile` against the pnpm cache (fast on warm cache, correct under all conditions — avoids cross-job cache-pollution races)."
  - "Script executability tracked in git (`100755`) — both bash scripts commit with executable bit set so CI + dev workflows don't need a `chmod +x` preflight"
  - "Workflow YAML uses 2-space indent and no `;` on compound `with:` maps (e.g., `with: { version: 9 }`) consistent with RESEARCH canonical templates — next phase additions should lift the same house style"

requirements-completed: [FND-05, FND-06, FND-09]

# Metrics
duration: ~2 min
completed: 2026-04-15
---

# Phase 01 Plan 06: CI Workflows + Branch Protection Scaffold Summary

**Landed `.github/workflows/ci.yml` (6 jobs: install, typecheck, biome-check, content-sync, image-budget, smoke), `.github/workflows/pr-title.yml` (Conventional Commits via amannn/action-semantic-pull-request@v6), `.github/CODEOWNERS` (placeholder), `scripts/check-image-budget.sh` (FND-09 600KB gate — adversarially verified), and `scripts/setup-branch-protection.sh` (replayable `gh api` recipe). Pitfall 5 avoided: ci.yml job IDs + `pr-title` match the contexts array byte-for-byte. Branch protection activates in Wave 7 after first green CI.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-15T17:53:41Z
- **Completed:** 2026-04-15T17:55:13Z
- **Tasks:** 1 / 1
- **Commits:** `b1f4454`
- **Files created:** 5 (ci.yml, pr-title.yml, CODEOWNERS, check-image-budget.sh, setup-branch-protection.sh)
- **Files modified:** 0

## Task Commits

1. **Task 6.1: Author ci.yml, pr-title.yml, CODEOWNERS, image-budget script, branch-protection script** — `b1f4454` (chore)

## Workflow + Script Files

| Path | Role | Notes |
|------|------|-------|
| `.github/workflows/ci.yml` | GitHub Actions — 6 jobs | Job IDs: `install`, `typecheck`, `biome-check`, `content-sync`, `image-budget`, `smoke` (all lowercase-hyphenated per Pitfall 5) |
| `.github/workflows/pr-title.yml` | PR title gate | `amannn/action-semantic-pull-request@v6`; runs on `pull_request_target` |
| `.github/CODEOWNERS` | Code ownership | Single line `*   @MAINTAINER-USERNAME` — Wave 7 fills in real username |
| `scripts/check-image-budget.sh` | 600KB image gate (executable) | Portable bash (BSD + GNU find); uses `wc -c` per file; `BUDGET_BYTES=$((600 * 1024))` |
| `scripts/setup-branch-protection.sh` | `gh api` recipe (executable) | `contexts`: typecheck, biome-check, content-sync, image-budget, smoke, pr-title. Sets `require_code_owner_reviews: true`, `required_approving_review_count: 1`, `allow_force_pushes: false`, `allow_deletions: false`, `enforce_admins: false` |

## Adversarial Image-Budget Test Result

```
=== Happy path: empty public/images/ (only .gitkeep) ===
✓ All images under 600KB budget.

=== Adversarial: dd if=/dev/zero of=public/images/test-too-big.jpg bs=1024 count=700 ===
ERROR: 1 image(s) exceed the 600KB budget:
  - public/images/test-too-big.jpg (700 KB)

Fix: re-export at ≤2560px with quality 80–90 via squoosh/ImageOptim.
EXIT_CODE=1
✓ budget script correctly rejected 700KB file

=== Cleanup + re-run ===
✓ All images under 600KB budget.
```

Both the empty-tree success path and the 700KB oversize rejection path exit with the expected codes. Script is CI-ready.

## Pitfall 5 Parity Verification

Required byte-for-byte match: **ci.yml job IDs (minus `install`) ∪ `{pr-title}` == setup-branch-protection.sh `contexts` array**.

```
=== ci.yml jobs under `jobs:` (excluding install) ===
biome-check
content-sync
image-budget
smoke
typecheck

=== setup-branch-protection.sh contexts ===
biome-check
content-sync
image-budget
pr-title
smoke
typecheck

=== ci.yml jobs ∪ {pr-title} ===
biome-check
content-sync
image-budget
pr-title
smoke
typecheck

=== diff ===
(empty)
OK: byte-for-byte parity holds
```

No drift. Every required check context exists as a real job ID, and no required context is missing. Wave 7's `gh api -X PUT` call will match the GitHub Actions run contexts exactly.

## Workflows Do Not Execute in This Wave

Per plan's explicit Do-Not list: `./scripts/setup-branch-protection.sh` is NOT run in Wave 6. GitHub requires the status-check contexts to exist (i.e., a CI run must have completed on a PR or push) before they can be required. The workflow files land in this commit; Wave 7 opens a scratch PR, lets CI go green, then runs the branch-protection script against the now-existing contexts.

## Decisions Made

- **Verbatim reproduction from RESEARCH § Code Examples.** Pitfall 5 explicitly warns against any renaming — the only safe posture is byte-for-byte lift. All 5 files match RESEARCH lines 636-668, 681-765, 772-790, 827-832, 926-960.
- **Parity verification upgraded from grep to awk.** The naive `grep -E '^  [a-z-]+:$'` approach false-positive'd on `  push:` under the top-level `on:` key (same 2-space indent as jobs). Replaced with awk stanza-scoped parser that walks from `^jobs:` until the next top-level key. Confirmed parity.
- **CODEOWNERS placeholder retained.** Wave 7 (not Wave 6) has the real GitHub username context (after Vercel + repo linking). Premature substitution would couple two waves.
- **No additional CI jobs.** Plan's Do-Not list is explicit: no coverage job, no bundle-size job (those are advisory per D-09). Five required-status-check jobs + pr-title = 6 gates total.
- **`scripts/` directory committed with executable bit set (100755).** Both bash scripts persist the executable mode in git so CI and dev workflows can invoke them without a preflight chmod.

## Deviations from Plan

**None substantive.** One minor delta worth noting:

- **Parity verification command from the plan emitted a false positive.** The plan's step 8 uses `grep -E '^  [a-z-]+:$' .github/workflows/ci.yml`, which matches the `push:` key under `on:` because it shares the 2-space indent with top-level job names. Switched to a stanza-scoped awk parser (only scan lines between `^jobs:` and the next top-level key). This is a verification-command-only delta; the CI file itself matches the canonical template exactly. Documented here so the next wave's adjacent verification scripts use the corrected form.

## Issues Encountered

- **Verification regex false-positive.** Described above under Deviations. Resolved in-session; no impact on committed files.

## User Setup Required

None in Wave 6. Wave 7 requires the repo owner to:

1. Confirm the GitHub username to replace `@MAINTAINER-USERNAME` in `.github/CODEOWNERS`.
2. Ensure `gh auth login` has write access to the repo (needed for `scripts/setup-branch-protection.sh`).
3. Open a scratch PR to trigger the first CI run so contexts exist before branch protection is applied.

## Next Wave Readiness

- **Ready for Wave 7 (branch protection + Vercel link + scratch PR):** all 5 workflow/script files exist at their canonical paths with correct executable bits. Wave 7's sequence is: (a) link Vercel, (b) open scratch PR to trigger CI, (c) verify all 6 required contexts (typecheck, biome-check, content-sync, image-budget, smoke, pr-title) appear green, (d) substitute `@MAINTAINER-USERNAME` in CODEOWNERS, (e) run `./scripts/setup-branch-protection.sh`.
- **Ready for Phase 2..5 PRs:** Any PR opened after Wave 7 activation will be gated by the 6 required checks. Phase 2 content edits that violate Zod frontmatter schemas will fail the `content-sync` job (Zod validation via `astro sync`). Phase 3 wizard PRs that introduce 601KB+ hero imagery will fail `image-budget`. Phase 4 A11y + SEO PRs that crash smoke page will fail `smoke`.

## Threat Flags

None. This plan adds CI infrastructure files only — no network endpoints, no auth paths, no schema changes at trust boundaries, no user-input handling. The `pr-title` workflow uses `pull_request_target` with `permissions: pull-requests: read` (minimum privilege; cannot execute PR code on the base repo). The `setup-branch-protection.sh` script requires manual `gh` auth to run — no embedded credentials.

## TDD Gate Compliance

Plan frontmatter sets `type: execute`, single task with no `tdd="true"` attribute. No TDD RED→GREEN gate required. The adversarial image-budget test is an inline shell check (create 700KB file → run script → assert non-zero exit → delete file), performed at verification time, not persisted as a test fixture.

## Self-Check: PASSED

Verified against every acceptance criterion plus commit existence:

- ✅ `.github/workflows/ci.yml` exists (FOUND)
- ✅ `.github/workflows/pr-title.yml` exists (FOUND)
- ✅ `.github/CODEOWNERS` exists (FOUND)
- ✅ `scripts/check-image-budget.sh` exists and is executable (FOUND, 100755)
- ✅ `scripts/setup-branch-protection.sh` exists and is executable (FOUND, 100755)
- ✅ ci.yml contains job IDs: `typecheck`, `biome-check`, `content-sync`, `image-budget`, `smoke` (grep -qE passed for each)
- ✅ `typecheck` job runs `astro sync` before `astro check` (grep -q 'astro sync' && grep -q 'astro check' passed)
- ✅ `biome-check` job runs `biome ci` (grep -q 'biome ci' passed)
- ✅ `image-budget` job runs `bash scripts/check-image-budget.sh` (grep -q passed)
- ✅ `smoke` job runs `playwright test` (grep -q passed)
- ✅ pr-title.yml uses `amannn/action-semantic-pull-request@v6` (grep -q passed)
- ✅ CODEOWNERS contains `MAINTAINER-USERNAME` (grep -q passed)
- ✅ check-image-budget.sh contains `BUDGET_BYTES` and `600 * 1024` (grep -q passed for both)
- ✅ setup-branch-protection.sh contexts include: `typecheck`, `biome-check`, `content-sync`, `image-budget`, `smoke`, `pr-title` (grep -q passed for each)
- ✅ setup-branch-protection.sh sets `require_code_owner_reviews` and `allow_force_pushes` (grep -q passed)
- ✅ Byte-for-byte parity: ci.yml jobs (minus install) ∪ `{pr-title}` == setup-branch-protection.sh contexts (awk-based diff returned empty)
- ✅ `pnpm check:images` on empty `public/images/` prints `✓ All images under 600KB budget.` and exits 0
- ✅ Adversarial: 700KB fixture → script exits 1 with `ERROR: 1 image(s) exceed the 600KB budget`
- ✅ Post-adversarial cleanup: re-run exits 0
- ✅ Commit `b1f4454` (Task 6.1) present in `git log --oneline`
- ✅ No unexpected file deletions (`git diff --diff-filter=D --name-only HEAD~1 HEAD` → empty)

---
*Phase: 01-foundation*
*Plan: 06*
*Completed: 2026-04-15*
