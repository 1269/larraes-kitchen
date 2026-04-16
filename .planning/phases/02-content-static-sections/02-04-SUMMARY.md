---
phase: 02-content-static-sections
plan: 04
subsystem: content
tags: [testimonials, faq, gallery, markdown, zod, astro-content-collections]

requires:
  - phase: 01-foundation
    provides: Astro Content Collection loaders + Zod schemas (testimonials, faq, gallery)
provides:
  - 4 testimonial markdown files covering family / social / corporate / other personas
  - 4 FAQ category groups (ordering / delivery / menu-customization / payment) with 4 questions each
  - 15 gallery markdown entries with explicit aspectRatio + alt text for CLS-prevented masonry
affects:
  - 02-07 (About + Heritage section consumes hero/about collections, not this plan's data)
  - 02-08 (Testimonials + FAQ + Gallery section components render these collections)
  - 03-inquiry-wizard (FAQ surface complements wizard pre-submit reassurance)
  - 04-seo-accessibility (FAQ-03 FAQPage JSON-LD draws from these 4 faq files)

tech-stack:
  added: []
  patterns:
    - "Content Collection file-per-entry pattern for testimonials and gallery"
    - "Content Collection file-per-category pattern for FAQ (filename ↔ category enum locked)"
    - "aspectRatio frontmatter enum surface (7 ratios) for react-photo-album CLS guarantee"
    - "Plain-text FAQ answers (no markdown, no angle brackets) — Phase 2 zero-JS render contract"
    - "Placeholder-with-real-posture for testimonials: reads as real, swapped via markdown PR post-launch"

key-files:
  created:
    - src/content/testimonials/cynthia-r.md
    - src/content/testimonials/marcus-t.md
    - src/content/testimonials/hartford-bank.md
    - src/content/testimonials/jen-m.md
    - src/content/faq/ordering.md
    - src/content/faq/delivery.md
    - src/content/faq/menu-customization.md
    - src/content/faq/payment.md
    - src/content/gallery/01-table-setting.md
    - src/content/gallery/02-smothered-chicken-platter.md
    - src/content/gallery/03-family-reunion.md
    - src/content/gallery/04-mac-and-cheese-skillet.md
    - src/content/gallery/05-candied-yams.md
    - src/content/gallery/06-corporate-buffet.md
    - src/content/gallery/07-peach-cobbler.md
    - src/content/gallery/08-backyard-celebration.md
    - src/content/gallery/09-collard-greens.md
    - src/content/gallery/10-chef-prep.md
    - src/content/gallery/11-sweet-tea-pitchers.md
    - src/content/gallery/12-dessert-spread.md
    - src/content/gallery/13-sweet-potato-pie.md
    - src/content/gallery/14-family-portrait.md
    - src/content/gallery/15-plated-dinner.md
  modified: []

key-decisions:
  - "Testimonial placeholders read as real testimonials (no 'stub' visual treatment); AI agent swaps real ones via markdown PRs post-launch per STATE.md decision"
  - "All 4 testimonials rated 5/5 — launch placeholders; diversity lives in eventType/voice, not rating"
  - "FAQ answers use plain-ASCII prose (e.g., '60 to 90 minutes', '15 to 20 percent') to stay safe for Phase 2 plain-text render and avoid any markdown/HTML adjacency"
  - "Gallery mixes 6 distinct aspect ratios (1:1, 4:3, 3:2, 16:9, 3:4, 2:3) — portraits + landscapes + squares — for natural masonry layout vs uniform grid"
  - "Gallery authored at exactly 15 (GAL-01 floor) to exercise the View-All expand (UI-SPEC LOCKS initial 10)"

patterns-established:
  - "Testimonial persona coverage gate: at least one each of family / social / corporate eventType (TEST-04) satisfied by keeping order 1=family, 2=social, 3=corporate, 4=other"
  - "FAQ LOCKED file↔category 1:1 mapping enforced by filename — no category field drift possible at author time"
  - "Gallery slug prefix N-<slug>.md for glob ordering alignment with frontmatter order N"

requirements-completed: [CONT-05, CONT-06, CONT-07, CONT-09, TEST-01, TEST-02, TEST-03, TEST-04, FAQ-01, FAQ-04, GAL-01, GAL-02, GAL-05]

duration: 4min
completed: 2026-04-16
---

# Phase 02 Plan 04: Social Proof & Informational Content Summary

**23 schema-valid markdown files authored (4 testimonials + 4 FAQ categories + 15 gallery entries) — all three Astro Content Collections now pass `astro sync` with full persona coverage and CLS-prevention aspect ratios.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-16T15:51:57Z
- **Completed:** 2026-04-16T15:55:49Z
- **Tasks:** 3/3
- **Files created:** 23

## Accomplishments

- 4 testimonials cover the family / social / corporate / other eventType enum completely (TEST-04 persona coverage satisfied).
- 4 FAQ files map 1:1 to the schema-locked category enum, each with 4 well-above-minimum question/answer pairs.
- 15 gallery entries hit the GAL-01 launch floor with a diverse mix of 6 aspect ratios for natural masonry + CLS=0.
- `pnpm astro sync` runs clean with no Zod errors on testimonials, faq, or gallery collections.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author 4 testimonials covering family/social/corporate/other personas** — `80a9278` (feat)
2. **Task 2: Author 4 FAQ category groups** — `7d03c00` (feat)
3. **Task 3: Author 15 gallery image entries with explicit aspect ratios** — `241e8fc` (feat)

## Files Created/Modified

### Testimonials (4 files)
- `src/content/testimonials/cynthia-r.md` — family persona, baby shower for 22
- `src/content/testimonials/marcus-t.md` — social persona, 40th birthday for 35
- `src/content/testimonials/hartford-bank.md` — corporate persona, Vallejo office lunch
- `src/content/testimonials/jen-m.md` — other persona, 12-person allergy-aware dinner

### FAQ (4 files)
- `src/content/faq/ordering.md` — booking lead time, guest-count changes, minimum, reservation flow
- `src/content/faq/delivery.md` — service area, setup/breakdown, on-site duration, early delivery
- `src/content/faq/menu-customization.md` — dietary, item swaps, tastings, regional specialties
- `src/content/faq/payment.md` — deposit/balance, methods, gratuity, cancellation

### Gallery (15 files)
- `src/content/gallery/01-table-setting.md` (4:3) — family reunion table setting
- `src/content/gallery/02-smothered-chicken-platter.md` (1:1) — hero dish overhead
- `src/content/gallery/03-family-reunion.md` (3:2) — three-generation reunion plating scene
- `src/content/gallery/04-mac-and-cheese-skillet.md` (1:1) — golden mac & cheese in cast iron
- `src/content/gallery/05-candied-yams.md` (4:3) — brown-butter candied yams
- `src/content/gallery/06-corporate-buffet.md` (3:2) — East Bay client lunch buffet
- `src/content/gallery/07-peach-cobbler.md` (1:1) — individual peach cobbler with ice cream
- `src/content/gallery/08-backyard-celebration.md` (16:9) — golden-hour backyard dinner
- `src/content/gallery/09-collard-greens.md` (3:4) — vertical braised collards
- `src/content/gallery/10-chef-prep.md` (3:4) — chef prep portrait
- `src/content/gallery/11-sweet-tea-pitchers.md` (2:3) — sweet tea pitchers
- `src/content/gallery/12-dessert-spread.md` (16:9) — 60-person event dessert spread
- `src/content/gallery/13-sweet-potato-pie.md` (1:1) — sweet potato pie with lattice crust
- `src/content/gallery/14-family-portrait.md` (3:2) — three-generation backyard toast
- `src/content/gallery/15-plated-dinner.md` (4:3) — plated catfish + collards + cornbread

## Decisions Made

- **Testimonial ratings uniformly 5/5** — launch placeholders should not invent artificial variance; real testimonials will arrive post-launch via AI-agent markdown PRs per STATE.md.
- **FAQ answer prose uses plain ASCII ranges** (`60 to 90 minutes`, `15 to 20 percent`) instead of en-dash/percent glyphs — defensive against any downstream plain-text/HTML edge cases in Phase 2's zero-JS FAQ render.
- **Gallery authored at exactly 15 entries** — hits GAL-01 floor precisely so the "View All" expand (UI-SPEC LOCKS initial 10) is exercised by 5 hidden entries from day one.
- **eventType ordering 1..4 = family, social, corporate, other** — makes persona coverage visually obvious to the AI content agent editing these files later.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed pnpm dependencies in fresh worktree**
- **Found during:** Task 1 verification (`pnpm astro sync`)
- **Issue:** Worktree was spawned without `node_modules`; `astro` binary not on PATH, blocking all collection validation.
- **Fix:** Ran `pnpm install` (244 direct deps; astro 6.1.6 + react 19.2.5 + tailwind 4.2.2 + zod 4.3.6 resolved). No lockfile change from the main worktree.
- **Files modified:** `node_modules/` (not tracked)
- **Verification:** Subsequent `pnpm astro sync` succeeded with no Zod errors.
- **Committed in:** Not committed — `node_modules` is gitignored; install is an environment setup step.

**2. [Rule 1 - Bug] Rewrote 4 testimonial files in correct worktree path**
- **Found during:** Task 1 verification (`ls src/content/testimonials/` returned empty inside worktree)
- **Issue:** Initial `Write` tool calls for testimonials used the non-worktree path (`/Users/jashia/Documents/1_Projects/larraes-kitchen/src/content/testimonials/…`) instead of the worktree path (`/Users/jashia/Documents/1_Projects/larraes-kitchen/.claude/worktrees/agent-a73bcf80/src/content/testimonials/…`). Files landed in the main repo, not this branch's worktree.
- **Fix:** Deleted the 4 stray files from the main repo's `src/content/testimonials/` directory, then re-issued the 4 `Write` calls with absolute worktree paths. All subsequent Task 2 + Task 3 writes used absolute worktree paths defensively.
- **Files modified:** 4 testimonial files (re-created at correct path); 4 orphan files removed from main repo working tree (not committed anywhere).
- **Verification:** `git status` clean on main worktree; `git log` in this worktree shows testimonials committed (`80a9278`).
- **Committed in:** `80a9278` (Task 1 commit, files at correct path)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both deviations were operational (environment + path), not content or schema. All 23 authored files match the PLAN.md byte-for-byte for frontmatter; only the filesystem landing spot was corrected. No scope change.

## Issues Encountered

None beyond the auto-fixed deviations above. Every frontmatter value validated on the first Zod pass.

## User Setup Required

None — no external service configuration required for static markdown content. AI content agent will swap testimonials, gallery images, and FAQ answers post-launch via GitHub PRs (per STATE.md's resolved decisions).

## Next Phase Readiness

- **Plan 02-07 (About + Hero section assembly)** unaffected by this plan — consumes different collections.
- **Plan 02-08 (TestimonialsSection, FaqSection, GallerySection components)** now has complete content data to render against: 4 testimonials, 4 FAQ groups, 15 gallery entries. aspectRatio enum values are ready for parse into `{w, h}` for react-photo-album.
- **Phase 04 FAQ-03 (FAQPage JSON-LD)** has 16 question/answer pairs ready to emit.
- **Post-launch AI-agent content workflow** — file structures are predictable (`{category}.md` for FAQ, `{slug}.md` for testimonials, `{NN}-{slug}.md` for gallery) and frontmatter schemas are visible at `src/lib/schemas/`. An AI agent editing via GitHub PR has everything it needs to swap copy without reading component source.

## Self-Check

Verification of claims in this SUMMARY (run after authoring):

**Files claimed created (23) — all exist:**
- 4/4 testimonial files present
- 4/4 FAQ files present
- 15/15 gallery files present

**Commits claimed — all present in `git log`:**
- `80a9278` — feat(02-04): testimonials
- `7d03c00` — feat(02-04): FAQ
- `241e8fc` — feat(02-04): gallery

**Schema validation — `pnpm astro sync` exits 0 with no Zod errors on testimonials, faq, or gallery collections.**

## Self-Check: PASSED

---
*Phase: 02-content-static-sections*
*Completed: 2026-04-16*
