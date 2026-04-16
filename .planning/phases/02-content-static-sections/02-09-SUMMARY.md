---
phase: 02-content-static-sections
plan: 09
subsystem: ui
tags: [astro, content-collections, ssg, vercel-adapter, prerender, composition, react-island, hydration]

# Dependency graph
requires:
  - phase: 02-content-static-sections/02-01
    provides: "BaseLayout.astro HTML shell + site.md NAP source + Fontsource wiring"
  - phase: 02-content-static-sections/02-02
    provides: "HeroSection.astro + hero.md content entry"
  - phase: 02-content-static-sections/02-03
    provides: "AboutSection.astro + about.md + 11 menu markdown files + 3 package tier files"
  - phase: 02-content-static-sections/02-04
    provides: "GallerySection.astro + 15 gallery entries (GAL-01 count)"
  - phase: 02-content-static-sections/02-05
    provides: "Nav.astro + Footer.astro — BaseLayout TODO(02-05) markers uncommented"
  - phase: 02-content-static-sections/02-06
    provides: "HeroSection hero.priceChip as authored string (not computed from packages)"
  - phase: 02-content-static-sections/02-07
    provides: "MenuSection.astro + MenuTabs.tsx island + PackagesSection.astro"
  - phase: 02-content-static-sections/02-08
    provides: "TestimonialsSection.astro + FaqSection.astro + ContactSection.astro"
provides:
  - "src/pages/index.astro — single-page composition wiring all 8 sections in LAYT-04 order inside BaseLayout"
  - "SSG contract: `export const prerender = true` pins home route as static at build time (Vercel adapter is `output: 'server'`)"
  - "Collection query pattern at page root — single-entry via getEntry() + multi-entry via getCollection().sort((a,b) => a.data.order - b.data.order)"
  - "Defensive runtime guard: `throw new Error(...)` if required single-entry collection (site/hero/about) is missing — Zod catches at build, guard catches at runtime"
  - "Phase 2 phase goal achieved: visitor landing on `/` scrolls through 8 sections in LAYT-04 order end-to-end"
affects:
  - "Phase 3 (wizard) — #inquiry anchor lives on the home route; wizard mounts against index.astro section composition"
  - "Phase 4 (SEO) — JSON-LD + meta tags will extend BaseLayout; home route composition is the single canonical page"
  - "Phase 4 (perf/a11y) — Lighthouse runs against this composition as the single-page target"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-page composition: one route (`src/pages/index.astro`) renders all sections; anchored nav via section `id` props matches Nav anchor links (#hero, #about, #menu, #packages, #gallery, #testimonials, #faq, #contact)"
    - "SSG flag on marketing routes when Vercel adapter is in SSR mode — `export const prerender = true` prevents per-request SSR of static content (PATTERNS anti-pattern #12)"
    - "Collection query ordering: multi-entry collections MUST `.sort((a, b) => a.data.order - b.data.order)` before mapping — Astro returns filesystem order, not authored order (PATTERNS anti-pattern #9)"
    - "Props shape contract: sections receive `.data`-unwrapped objects, not raw CollectionEntry objects — consistent across all 8 sections for testability"
    - "Interactive islands hydrate on `client:load`, not `client:visible`, when the island returns `null` — IntersectionObserver needs a rendered surface; null-returning controllers must hydrate eagerly"

key-files:
  created:
    - ".planning/phases/02-content-static-sections/02-09-SUMMARY.md"
  modified:
    - "src/pages/index.astro (replaced Phase 1 placeholder with full 8-section composition)"
    - "src/components/sections/MenuSection.astro (changed MenuTabs hydration directive: client:visible → client:load)"

key-decisions:
  - "Composition uses PATTERNS.md target pattern verbatim — 8 section components in LAYT-04 order inside <BaseLayout site={site.data}>"
  - "`export const prerender = true` is mandatory since astro.config has the Vercel adapter in SSR mode; without it every request would re-render the static home page"
  - "Defensive runtime throw on missing site/hero/about — Zod validates at build but a manually-deleted content file between builds would give a cryptic undefined error without the guard"
  - "Menu tabs island promoted to `client:load` (was `client:visible`) after UAT — null-returning controllers have no visible surface for the IntersectionObserver to detect, so visibility-triggered hydration never fires. This corrects the directive choice made in plan 02-07"
  - "UAT image-placeholder expectation honored: broken-image icons in the MenuSection hero + GallerySection tiles are known-OK per the plan's 'Known-OK in this Phase 2 preview' list (asset authoring is scope for a later phase)"

patterns-established:
  - "Single-page composition at src/pages/index.astro: getEntry + getCollection + sort + .map((x) => x.data) into section components — reusable pattern if future routes ever compose the same sections (e.g., /preview/partial)"
  - "SSG pinning via `export const prerender = true` at the top of the route frontmatter — marketing routes always pin SSG when any other route in the app is SSR"
  - "Hydration directive sanity rule: `client:load` for null-returning controllers; `client:visible` only for islands that render DOM"

requirements-completed: [LAYT-01, LAYT-04, LAYT-05]

# Metrics
duration: "~90 min (including human UAT checkpoint pause)"
completed: 2026-04-16
---

# Phase 02 Plan 09: Content + Static Sections Composition Summary

**src/pages/index.astro composes all 8 sections (Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact) inside BaseLayout with SSG prerender, sorted multi-entry collections, and a defensive runtime guard — Phase 2 phase goal "visitor lands on / and scrolls through 8 sections in order" achieved, UAT approved after a single hydration-directive fix.**

## Performance

- **Duration:** ~90 min wall clock (most of it the UAT checkpoint pause)
- **Started:** 2026-04-16T09:30:00Z (approx, Task 1 begin)
- **Completed:** 2026-04-16T09:45:00Z (approx, UAT approved + fix verified)
- **Tasks:** 2 / 2 (Task 1 = compose, Task 2 = human-verified UAT checkpoint — status: **approved after 1 UAT fix**)
- **Files modified:** 2 (src/pages/index.astro, src/components/sections/MenuSection.astro)

## Accomplishments

- **Single-page composition live.** `src/pages/index.astro` imports and renders all 8 section components in LAYT-04 order inside `<BaseLayout site={site.data}>`, with `export const prerender = true` pinning SSG, single-entry collections loaded via `getEntry()`, and multi-entry collections sorted by `order` before `.map(x => x.data)` into props.
- **Human UAT approved.** The user walked the full Phase 2 experience end-to-end (nav transparent→solid transition, section scroll order, menu tab cycling, gallery lightbox, FAQ accordion, package CTAs, mobile drawer, keyboard nav) and approved after a single hydration-directive fix was applied to MenuSection.astro.
- **Menu tab click bug discovered + fixed at UAT.** `MenuTabs` returns `null` — `client:visible` gave the IntersectionObserver no rendered surface to detect, so the tab click handlers never attached. Flipped to `client:load` (one-line change at `src/components/sections/MenuSection.astro:145`). User re-tested and confirmed the fix.
- **Self-check passing.** `pnpm astro check` = 0 errors / 0 warnings / 4 hints (pre-existing Zod deprecation hints in `src/lib/schemas/site.ts` from plan 02-01's deferred-items, out of scope for this plan). `pnpm test` = 4 passed / 1 skipped.

## Task Commits

Each task was committed atomically:

1. **Task 1: Compose index.astro with all 8 sections in LAYT-04 order** — `88c5936` (feat)
2. **Task 2 (UAT fix): Hydrate MenuTabs on load to restore tab clicks** — `67117d9` (fix)

**Plan metadata (SUMMARY.md):** `[SUMMARY commit hash assigned after commit]` (docs)

_Note: Task 2 is a human-verify checkpoint, not a code-producing task. The `67117d9` commit captures the discrete UAT-driven fix as a deviation (Rule 1 — Bug), not a task output per se._

## Files Created/Modified

### Modified

- `src/pages/index.astro` — Replaced the Phase 1 placeholder (which had inline Fontsource imports + global.css import) with the LAYT-04 target pattern:
  - `export const prerender = true`
  - `getEntry("site"|"hero"|"about", ...)` for the 3 single-entry collections
  - `getCollection("menu"|"packages"|"testimonials"|"faq"|"gallery").sort(...)` for the 5 multi-entry collections
  - Defensive `throw new Error(...)` if site/hero/about is missing
  - `<BaseLayout site={site.data}>` wrapping all 8 sections in LAYT-04 order with matching Nav anchor `id` props
- `src/components/sections/MenuSection.astro` — Single-line change: `<MenuTabs client:visible />` → `<MenuTabs client:load />` (L145). Cross-plan correction of the hydration directive chosen in plan 02-07.

## Decisions Made

- **Use the PATTERNS.md target pattern verbatim** for index.astro — the plan's `<interfaces>` block lifted it directly; implementing it as specified keeps future plans' assumptions stable (Phase 3 wizard reads the same composition contract).
- **`export const prerender = true` is non-negotiable** — `astro.config` uses the Vercel adapter in SSR mode, so without the flag every home-route request would SSR a fully static page (T-02-31).
- **Defensive `throw new Error(...)` kept** — redundant against Zod at build time, but protects against the narrow case where a content file is deleted between builds (e.g., manually via git checkout) and gives a readable error instead of an `undefined.data` crash.
- **Hydration directive flipped at UAT.** MenuTabs is a null-returning React island; `client:visible` requires a rendered surface for the IntersectionObserver, which it does not have. `client:load` is the correct directive for controllers that manipulate already-rendered DOM from useEffect. This corrects the directive choice made in 02-07 (see "Cross-Plan Note" below).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] MenuTabs never hydrated with `client:visible` (tab clicks broken)**
- **Found during:** Task 2 (human UAT checkpoint)
- **User report:** "The menu tabs are not clickable, so clicking on proteins, sides, and desserts doesn't change anything. Besides that looking good for now."
- **Root cause:** `MenuTabs.tsx` returns `null` — it only attaches click/keydown handlers via `useEffect` to pre-rendered DOM nodes keyed by `data-menu-tablist`/`data-menu-tab`/`data-menu-panel` attributes. With no rendered output, `client:visible`'s IntersectionObserver had no surface to detect, so the island never hydrated and the effect never ran.
- **Fix:** Changed `<MenuTabs client:visible />` → `<MenuTabs client:load />` in `src/components/sections/MenuSection.astro:145`. `client:load` hydrates immediately on page load, running the effect regardless of visibility.
- **Verification:** User re-tested live against the dev server and confirmed tab clicks + arrow-key cycling work. User replied "approved".
- **Committed in:** `67117d9` (discrete fix commit — NOT amended onto Task 1 since the root-cause file is in plan 02-07's scope, not plan 02-09's).

---

**Total deviations:** 1 auto-fixed (1 bug — Rule 1, discovered at UAT)
**Impact on plan:** Minimal. The fix is a one-word directive change; no scope creep, no re-architecture. The bug itself originated in plan 02-07 (MenuTabs hydration choice) and surfaced only when end-to-end composition enabled real user interaction for the first time.

## UAT Checkpoint Verification

The human UAT checkpoint defined 11 verification items. All were walked through live by the user:

| # | Item | Status |
|---|------|--------|
| 1 | Dev server up; sticky nav visible with wordmark + 7 anchor links + "Get a Quote" CTA | **Verified** |
| 2 | Hero fills 100vh with scrim, price chip, headline, subheadline, green pill CTA | **Verified** |
| 3 | Nav transitions TRANSPARENT → SOLID as hero scrolls out of view; active link gets green underline | **Verified** |
| 4 | All 8 sections in LAYT-04 order: Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact | **Verified** |
| 5 | Menu tab clicks + Arrow key cycling | **Verified after fix** (original report failed; re-verified after `client:load` patch) |
| 6 | Gallery image click opens lightbox, Escape closes, ← / → navigates, "View the full gallery (15)" reveal / "Show less" collapse | **Verified** |
| 7 | FAQ `<details>` open/close with chevron rotate | **Verified** |
| 8 | Package CTAs update URL to `/#inquiry?tier=small|medium|large` (no wizard yet — no-op anchor expected) | **Verified** |
| 9 | Footer Instagram icon opens in new tab | **Verified** |
| 10 | Mobile drawer: hamburger opens drawer, Escape closes, focus returns | **Verified** |
| 11 | No critical Lighthouse accessibility violations (full audit deferred to Phase 4) | **Verified (no critical violations)** |

**Known-OK per the plan's UAT scope boundary:**
- Broken image icons in MenuSection category hero + GallerySection tiles — `public/images/...` is not yet seeded (asset authoring is scope for a later phase; `<Image>` consumers handle missing sources gracefully).
- `#inquiry` anchor CTAs go to a no-op anchor — the wizard mounts in Phase 3.
- Privacy / Terms footer links go to `#` — Phase 5 scope.

## Cross-Plan Note (for verifier awareness)

The UAT surfaced a **component-level bug originating in plan 02-07** (MenuTabs hydration choice). Plan 02-07's SUMMARY explicitly records `client:visible` as a decision: _"client:visible for MenuTabs — menu lives below About/Hero, so deferring hydration until the section scrolls into view keeps initial JS budget lean. client:load would be anti-pattern (UI-SPEC §Island Hydration Strategy)."_

That reasoning is sound **for islands that render DOM** — the IntersectionObserver attaches to the rendered element. For controllers that return `null` and only operate via `useEffect` on pre-rendered Astro DOM, `client:visible` is silently broken because there is no observer target. The correct directive for null-returning controllers is `client:load` (or the island should render its own hidden sentinel element, but that adds accidental DOM for no user-visible benefit).

Recommended follow-up (not in scope for this plan):
- Capture this rule in UI-SPEC §Island Hydration Strategy so future plans don't repeat the pattern.
- If any other null-returning islands ship later (e.g., a future analytics controller), apply the same directive.

## Known Stubs

None introduced by this plan. The plan only composes already-built sections; all data is sourced from 8 validated content collections. Image placeholders are documented as Known-OK per the plan's own UAT scope boundary, not as implementation stubs.

## Issues Encountered

- **UAT surfaced the MenuTabs hydration bug** (documented as the Rule 1 deviation above). Resolution: one-line directive change, user re-verified.

## User Setup Required

None. This plan is pure composition + one hydration-directive correction. No env vars, external services, or dashboard configuration changed.

## Threat Flags

None. The composition introduces no new network endpoints, auth paths, or trust boundaries beyond what was already analyzed in each source plan's threat model. `T-02-30` (missing content file → undefined error) is mitigated by the defensive `throw new Error(...)` guard. `T-02-31` (SSR of static marketing page) is mitigated by `export const prerender = true` (acceptance-criterion-checked).

## Next Phase Readiness

- **Phase 3 (wizard) is unblocked.** `/` composition is live; `#inquiry?tier={small|medium|large}` deep-link anchors fire correctly from package CTAs. Wizard mounts against the same route and parses `location.hash` for pre-selection.
- **Phase 4 (SEO + perf/a11y) is unblocked.** Single canonical route for JSON-LD emission + Lighthouse audit. `BaseLayout` is the JSON-LD injection point. `prerender = true` means all Core Web Vitals measurements reflect the actual static output.
- **Image asset authoring remains the one open content-authoring task** — `public/images/{hero,menu,packages,gallery,testimonials}/...` are not seeded. Section components handle missing sources gracefully, so asset seeding is independent of this plan's acceptance.

## Self-Check: PASSED

**File existence:**
- FOUND: `src/pages/index.astro` (8-section composition, prerender = true)
- FOUND: `src/components/sections/MenuSection.astro` (client:load patch)
- FOUND: `.planning/phases/02-content-static-sections/02-09-SUMMARY.md` (this file)

**Commits in git log:**
- FOUND: `88c5936` (Task 1 — feat(02-09): compose home route with 8 sections in LAYT-04 order)
- FOUND: `67117d9` (Task 2 UAT fix — fix(02-09): hydrate MenuTabs on load to restore tab clicks)

**Validation:**
- `pnpm astro check` — 0 errors / 0 warnings / 4 hints (pre-existing Zod deprecations in src/lib/schemas/site.ts, out of scope per plan 02-01 deferred-items)
- `pnpm test` — 4 passed / 1 skipped
- `git status --short` — clean before SUMMARY commit
- All 8 section imports present: HeroSection, AboutSection, MenuSection, PackagesSection, GallerySection, TestimonialsSection, FaqSection, ContactSection
- `export const prerender = true` present: PASS
- Multi-entry sort pattern present (5 occurrences of `.sort((a, b) => a.data.order - b.data.order)`): PASS
- Font imports NOT in index.astro (moved to BaseLayout per 02-01): PASS
- All 8 section `id` props match Nav anchors (#hero, #about, #menu, #packages, #gallery, #testimonials, #faq, #contact): PASS

---
*Phase: 02-content-static-sections*
*Completed: 2026-04-16*
