---
phase: 02-content-static-sections
plan: 03
subsystem: content
tags: [astro, content-collections, zod, markdown, menu, packages]

# Dependency graph
requires:
  - phase: 02-content-static-sections/02-01
    provides: menuItemSchema (src/lib/schemas/menu.ts), packageSchema (src/lib/schemas/packages.ts), content collection config
provides:
  - 11 menu item markdown files (4 proteins, 4 sides, 3 desserts) schema-valid under menuItemSchema
  - 3 package tier markdown files (small/medium/large) schema-valid under packageSchema
  - Category hero photos assigned at order=1 for each menu category (UI-SPEC §4 LOCKED render)
  - Canonical pricing source-of-truth for Phase 3 wizard estimator (EST-02)
  - Large.pricePerPerson.min=18 sets the hero priceChip "From $18 per person" floor (cross-refs 02-02 hero.md)
affects:
  - 02-04 (gallery / testimonials authoring — sibling content collections)
  - 02-05 (MenuSection.astro + MenuTabs.tsx will consume menu collection, grouped by category)
  - 02-06 (PackagesSection.astro will consume packages collection, sorted by order)
  - 03 (wizard estimator reads pricePerPerson & guestRange per tier — EST-02 single source of truth)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Markdown-in-repo with Zod-typed frontmatter (no CMS)
    - Category field inside menu frontmatter is authoritative for grouping; subdirectory is organizational
    - Category hero image = first item with `photo:` set (UI-SPEC §4 LOCKED)
    - Single-source-of-truth pricing: hero priceChip floor = min(packages.pricePerPerson.min)

key-files:
  created:
    - src/content/menu/proteins/smothered-chicken.md (category hero)
    - src/content/menu/proteins/oxtails.md
    - src/content/menu/proteins/catfish.md
    - src/content/menu/proteins/pulled-pork.md
    - src/content/menu/sides/mac-and-cheese.md (category hero)
    - src/content/menu/sides/collard-greens.md
    - src/content/menu/sides/candied-yams.md
    - src/content/menu/sides/cornbread.md
    - src/content/menu/desserts/peach-cobbler.md (category hero)
    - src/content/menu/desserts/sweet-potato-pie.md
    - src/content/menu/desserts/banana-pudding.md
    - src/content/packages/small.md
    - src/content/packages/medium.md
    - src/content/packages/large.md
  modified: []

key-decisions:
  - Large.pricePerPerson.min locked at 18 to match hero priceChip 'From $18 per person'
  - Medium is the only popular tier; single-popular invariant enforced by manual review (schema allows multiple)
  - Per-dish photos kept OUT of non-hero menu items so category hero anchors the visual (photos can be added in later plans without schema changes)

patterns-established:
  - 'Menu category grouping: frontmatter `category` field is authoritative; subdirectory is organizational convenience'
  - 'Category hero image: give exactly one item per category `photo` + `photoAlt` at order=1'
  - 'Package tier sort: `order` 1/2/3 ascending by size (small < medium < large)'
  - 'Single-source-of-truth pricing: hero priceChip floor is derived from large.pricePerPerson.min (not hard-coded elsewhere)'

requirements-completed: [CONT-02, CONT-03, CONT-04, CONT-09, MENU-01, MENU-02, MENU-04, PKG-01, PKG-02, PKG-03]

# Metrics
duration: 5min
completed: 2026-04-16
---

# Phase 02 Plan 03: Menu & Packages Content Summary

**14 schema-valid markdown files: 11 menu dishes (4 proteins, 4 sides, 3 desserts) plus 3 package tiers with STATE.md-locked guest ranges and the $18-per-person hero price floor on Large.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-16T08:51:00Z
- **Completed:** 2026-04-16T08:54:00Z
- **Tasks:** 2 executed
- **Files created:** 14 (11 menu + 3 packages)

## Accomplishments

- 11 menu item markdown files authored across 3 categories with unique `order` per category and subdirectory-matching `category` field
- Category hero photo + photoAlt assigned at order=1 for proteins (smothered-chicken), sides (mac-and-cheese), desserts (peach-cobbler) — satisfies UI-SPEC §4 LOCKED render
- 3 package tier files authored with STATE.md-locked guest ranges: Small 10–20, Medium 21–30, Large 31–75
- Exactly one package (Medium) has `popular: true` — single "Most Popular" invariant upheld
- Large.pricePerPerson.min = 18 matches hero priceChip "From $18 per person" — single-source-of-truth pricing pattern established for Phase 3 wizard estimator
- All 14 files pass `pnpm astro sync` Zod validation with zero errors

## Task Commits

1. **Task 1: Author 11 menu item markdown files across 3 categories** — `4b24448` (feat)
2. **Task 2: Author 3 package tier markdown files (Small / Medium / Large)** — `a266a67` (feat)

## Files Created/Modified

### Menu items (11)

- `src/content/menu/proteins/smothered-chicken.md` — Smothered Chicken, gluten-free, **category hero** (order 1)
- `src/content/menu/proteins/oxtails.md` — Braised Oxtails, gluten-free/dairy-free (order 2)
- `src/content/menu/proteins/catfish.md` — Cornmeal-Crusted Catfish, dairy-free/nut-free (order 3)
- `src/content/menu/proteins/pulled-pork.md` — Low-and-Slow Pulled Pork, gluten-free/dairy-free (order 4)
- `src/content/menu/sides/mac-and-cheese.md` — Three-Cheese Baked Mac, vegetarian, **category hero** (order 1)
- `src/content/menu/sides/collard-greens.md` — Smoked-Turkey Collards, gluten-free/dairy-free (order 2)
- `src/content/menu/sides/candied-yams.md` — Candied Yams, vegetarian/gluten-free (order 3)
- `src/content/menu/sides/cornbread.md` — Honey Buttermilk Cornbread, vegetarian/nut-free (order 4)
- `src/content/menu/desserts/peach-cobbler.md` — Georgia Peach Cobbler, vegetarian/nut-free, **category hero** (order 1)
- `src/content/menu/desserts/sweet-potato-pie.md` — Sweet Potato Pie, vegetarian/nut-free (order 2)
- `src/content/menu/desserts/banana-pudding.md` — Banana Pudding, vegetarian (order 3)

### Package tiers (3)

- `src/content/packages/small.md` — id=small, 10–20 guests, $22–28/person, 4 includes, popular=false, order=1
- `src/content/packages/medium.md` — id=medium, 21–30 guests, $20–26/person, 5 includes, **popular=true**, order=2
- `src/content/packages/large.md` — id=large, 31–75 guests, **$18**–24/person, 6 includes, popular=false, order=3

## Decisions Made

- **Large.pricePerPerson.min = 18** — locks the hero `priceChip` "From $18 per person" floor. Any future change to Large's minimum per-person must also update `src/content/hero/hero.md` priceChip (threat T-02-07). Documented as a Phase-4 build-time assertion candidate.
- **Exactly one popular tier (Medium)** — Zod does not enforce this (threat T-02-08). Upheld by code review; Phase 4 can add a build-script assertion.
- **Per-dish photos deferred** — only category-hero items carry `photo`; non-hero dishes omit it. Keeps v1 visual rhythm tight (3 hero photos anchor the menu section) and allows the content workflow to drop in real dish photos later via schema-unchanged PRs.
- **`category` frontmatter is authoritative** — matches subdirectory in every file (all 11 pass `grep -L 'category: "<subdir>"'` check). Prevents the mismatch anti-pattern flagged in PATTERNS.md §menu.

## Deviations from Plan

**Process deviation only, no code deviation.** When first writing the files I used the `/Users/jashia/Documents/1_Projects/larraes-kitchen/src/content/...` path (main repo root) instead of the worktree path. I detected this via `git status` returning empty and `astro sync` reporting empty menu collection, then cleaned up the stray files from the main repo and rewrote them under the worktree path. No committed artifacts were affected; the worktree history is clean.

No Rule 1/2/3 auto-fixes were required. Plan executed exactly as written — all frontmatter values, guest ranges, pricing ranges, `popular` flag placement, `order` sequencing, and `dietary` enum values match the plan's `<action>` blocks verbatim.

---

**Total deviations:** 0 code deviations (1 process correction on worktree path)
**Impact on plan:** None — final repo state matches the plan's 14-file spec.

## Issues Encountered

None during task execution. The one-time worktree-path mistake was self-corrected before any commit.

## User Setup Required

None — this plan only adds markdown content. No env vars, external services, or dashboard configuration.

## Next Phase Readiness

- **Plan 02-04 (gallery / testimonials):** Independent sibling content authoring; no ordering dependency.
- **Plan 02-05 (MenuSection + MenuTabs):** Ready to consume `getCollection("menu")`, grouped by `category`, sorted by `order` per category. Category hero rendering contract has its photo anchor at order=1 in each category.
- **Plan 02-06 (PackagesSection):** Ready to consume `getCollection("packages")`, sorted by `order`. Medium card renders the "Most Popular" badge.
- **Phase 3 (wizard / estimator):** `pricePerPerson.{min,max}` and `guestRange.{min,max}` are now the single source of truth. Live estimate = `guests × pricePerPerson`; display range = `$min–$max` en-dash.
- **Hero priceChip consistency:** Large.pricePerPerson.min = 18 confirmed to match the hero.md priceChip "From $18 per person" (threat T-02-07 mitigated).

## Self-Check: PASSED

**File existence:**

- FOUND: src/content/menu/proteins/smothered-chicken.md
- FOUND: src/content/menu/proteins/oxtails.md
- FOUND: src/content/menu/proteins/catfish.md
- FOUND: src/content/menu/proteins/pulled-pork.md
- FOUND: src/content/menu/sides/mac-and-cheese.md
- FOUND: src/content/menu/sides/collard-greens.md
- FOUND: src/content/menu/sides/candied-yams.md
- FOUND: src/content/menu/sides/cornbread.md
- FOUND: src/content/menu/desserts/peach-cobbler.md
- FOUND: src/content/menu/desserts/sweet-potato-pie.md
- FOUND: src/content/menu/desserts/banana-pudding.md
- FOUND: src/content/packages/small.md
- FOUND: src/content/packages/medium.md
- FOUND: src/content/packages/large.md

**Commits:**

- FOUND: 4b24448 (Task 1 — 11 menu files)
- FOUND: a266a67 (Task 2 — 3 package tiers)

**Validation:**

- `pnpm astro sync` exits 0 with no menu-collection or package-collection Zod errors.

---
*Phase: 02-content-static-sections*
*Completed: 2026-04-16*
