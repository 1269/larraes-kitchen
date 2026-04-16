---
phase: 02-content-static-sections
plan: 02
subsystem: content
tags: [astro, content-collections, zod, markdown, yaml, hero, about, copywriting]

requires:
  - phase: 01-foundation
    provides: heroSchema, aboutSchema, content collection loader config, Astro 6 + Zod setup
provides:
  - Hero content entry (HERO-01..04): headline, subheadline, CTA text, price chip, image path, image alt
  - About content entry (ABOUT-01..03): 161-word heritage narrative, positioning tagline, chef portrait placeholder
  - Locked copywriting contract values referenced by plan 02-06 (HeroSection) and 02-07 (AboutSection)
affects:
  - 02-06 HeroSection component (consumes hero.md via getEntry)
  - 02-07 AboutSection component (consumes about.md; splits narrative on \n\n into <p>)
  - 02-03 packages plan (Large tier pricePerPerson.min MUST equal $18 to keep hero priceChip truthful)
  - Plan checker plan-02-02 (validates both files against schemas)

tech-stack:
  added: []
  patterns:
    - "YAML block literal (`|`) for multi-paragraph narrative content; component splits on \\n\\n at render time"
    - "Copywriting locks pinned in content frontmatter (ctaText, positioning) so design iterations do not drift from UI-SPEC"
    - "Image paths reference /images/{collection}/ in public/ — actual image files deferred to post-launch AI-agent swap workflow"

key-files:
  created:
    - src/content/hero/hero.md
    - src/content/about/about.md
  modified: []

key-decisions:
  - "priceChip string 'From $18 per person' locked against Large tier pricePerPerson.min floor — creates implicit contract plan 02-03 must honor"
  - "Heritage narrative authored inline in YAML block literal rather than markdown body so Zod .min(150).max(2500) validates against the canonical narrative string"
  - "Chef portrait placeholder path declared with descriptive alt even though the JPG is absent at v1 — ensures AboutSection renders the image slot instead of the empty-state branch"

patterns-established:
  - "Single-entry content collections (hero, about): one .md file per collection, filename matches collection name, frontmatter carries all rendered data"
  - "Copywriting contract locks: strings whose exact wording matters (CTA, positioning, price chip) live in content files, not in component JSX, so edits do not require touching code"
  - "Placeholder-first imagery: commit image paths pointing to public/images/{section}/ before real photography arrives; AI agent swaps the JPG via markdown PR post-shoot without touching components"

requirements-completed: [CONT-08, CONT-09, HERO-01, HERO-02, HERO-03, HERO-04, ABOUT-01, ABOUT-02, ABOUT-03]

duration: 2m 12s
completed: 2026-04-16
---

# Phase 02 Plan 02: Hero + About Content Entries Summary

**Authored hero.md (cinematic headline, subheadline, locked CTA, $18 price chip, placeholder image path) and about.md (161-word heritage narrative in YAML block literal, "Benicia's only soul food specialist." positioning, chef portrait placeholder) — both passing heroSchema and aboutSchema on `astro sync`.**

## Performance

- **Duration:** 2m 12s
- **Started:** 2026-04-16T15:51:44Z
- **Completed:** 2026-04-16T15:53:56Z
- **Tasks:** 2 (both auto, no checkpoints)
- **Files created:** 2

## Accomplishments

- Hero content entry locks the first-impression copywriting contract: headline "Soul food that shows up.", CTA "Start your quote", price chip "From $18 per person" — all schema-valid and ready for plan 02-06 HeroSection rendering.
- About content entry delivers the "Benicia's only soul food specialist." positioning plus a three-paragraph heritage narrative (161 words, 1006 chars) that the AboutSection will render as `<p>` tags by splitting on `\n\n+`.
- Both single-entry collections now validated end-to-end by `pnpm astro sync`; FND-05 CI gate remains green for the hero/about slice.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author hero.md** — `a681437` (feat)
2. **Task 2: Author about.md** — `0d4790a` (feat)

_Note: Task 2's inline word-count extension (Rule 1 correctness tweak) was folded into the same commit `0d4790a` before staging — see Deviations below._

## Files Created/Modified

- `src/content/hero/hero.md` — Hero collection single entry (HERO-01..04 data): headline, subheadline, ctaText, priceChip, heroImage, heroImageAlt.
- `src/content/about/about.md` — About collection single entry (ABOUT-01..03 data): heritageNarrative (YAML block literal, 3 paragraphs, 161 words, 1006 chars), positioning, chefPortrait placeholder, chefPortraitAlt.

## Decisions Made

- **Plaintext ASCII quotation marks throughout** — avoided smart quotes per plan anti-pattern; em-dashes (—) retained as the plan allowed.
- **`chefPortrait` + `chefPortraitAlt` both populated at v1** — even though the real JPG is not yet placed in `public/images/about/`, declaring the path now ensures AboutSection takes the image-present code branch (per UI-SPEC § 3), and the AI agent can swap the image file post-shoot without touching content or components.
- **Narrative extended from 147 to 161 words** — kept inside the plan's aspirational 150–250 word window, even though Zod's minimum is char-based (150) and was already satisfied at 147 words / 913 chars. See Rule 1 deviation below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing node_modules before `astro sync`**
- **Found during:** Task 1 (first `pnpm astro sync` invocation)
- **Issue:** Worktree was reset to the plan's base commit (2ef5639) which predates `pnpm install`. `astro` binary not on PATH — blocked all schema validation and acceptance-criteria checks.
- **Fix:** Ran `pnpm install` to restore `node_modules`. `pnpm-lock.yaml` unchanged (deterministic install from existing lockfile), so no staged file changes needed.
- **Files modified:** `node_modules/` only (gitignored — no commit impact).
- **Verification:** `pnpm astro sync` now executes and synchronizes all content collections without error.
- **Committed in:** N/A (gitignored install; not a content change).

**2. [Rule 1 - Bug] Narrative extended from 147 words to 161 words to satisfy plan action-block range**
- **Found during:** Task 2 post-verification word count.
- **Issue:** Initial narrative was 147 words. Schema `.min(150)` validates *chars* (narrative had 913 chars, passing), but the plan's action block said "150–250 words" as an author-intent target. 147 words sat 3 below that intent floor.
- **Fix:** Added three modifier phrases to the middle paragraph ("isn't fusion", "slow-braised", "seasoned by memory", "on a Sunday afternoon") preserving the existing voice. New word count: 161. New char count: 1006 (still well under 2500 ceiling).
- **Files modified:** `src/content/about/about.md`
- **Verification:** `awk + wc -w` reports 161 words (≥150 target); `pnpm astro sync` re-runs clean; all Task 2 acceptance-criteria greps still pass.
- **Committed in:** `0d4790a` (folded into the single Task 2 commit before staging).

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 correctness)
**Impact on plan:** Both deviations necessary to meet plan intent. The dependency install is a worktree-environment concern unrelated to plan substance. The narrative extension satisfies the plan's stated 150–250 word target while remaining well inside schema bounds. No scope creep.

## Issues Encountered

- `astro sync` emits `[WARN] [glob-loader] No files found matching "**/*.md"` for the other six collections (packages, menu, testimonials, faq, gallery, site) because their content files are authored in sibling plans in this same wave. This is expected parallel-wave behavior — warnings do not fail the build and will disappear as each sibling plan's files land in the merged branch.

## Threat Model Status

The plan's threat register was honored in full:

- **T-02-04 (priceChip drift):** $18 floor locked in hero.md; mitigation is content-review discipline plus (future) Phase 4 build-time assertion cross-checking against packages/large.md.
- **T-02-05 (narrative PII):** Narrative is public marketing copy by design; accepted.
- **T-02-06 (narrative under 150 chars bypass):** Mitigated — 1006 chars written, Zod `.min(150)` enforced by `pnpm astro sync` in CI.

No new threat surface introduced — both files are author-input markdown rendered as plain text by Astro components (no `set:html`, no user input, no network boundary).

## User Setup Required

None — this plan ships content-only changes. No environment variables, no external services.

## Next Phase Readiness

- **Ready for plan 02-06 (HeroSection):** hero.md is schema-valid; all locked strings match UI-SPEC contract; `/images/hero/hero.jpg` placeholder path in place for AI-agent photography swap.
- **Ready for plan 02-07 (AboutSection):** about.md is schema-valid; narrative shape (`\n\n`-separated paragraphs inside YAML `|`) matches the component's splitting contract; chef portrait placeholder declared so the image-present render branch is exercised from day one.
- **Concern for plan 02-03 (packages):** priceChip "$18 per person" creates an implicit contract — packages/large.md `pricePerPerson.min` MUST equal 18 for the hero chip to remain truthful. The plan checker should catch a mismatch.

## Self-Check: PASSED

**Files:**
- FOUND: src/content/hero/hero.md
- FOUND: src/content/about/about.md

**Commits:**
- FOUND: a681437 (Task 1 — hero.md)
- FOUND: 0d4790a (Task 2 — about.md)

---
*Phase: 02-content-static-sections*
*Plan: 02*
*Completed: 2026-04-16*
