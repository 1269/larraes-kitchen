---
phase: 02-content-static-sections
plan: 07
subsystem: ui
tags: [astro, react, react-island, menu, packages, tabs, lucide, shadcn-button, tailwind-v4]

# Dependency graph
requires:
  - phase: 02-content-static-sections/02-01
    provides: menuItemSchema + packageSchema (src/lib/schemas/{menu,packages}.ts)
  - phase: 02-content-static-sections/02-03
    provides: 11 menu markdown files + 3 package tier files (small/medium/large)
provides:
  - MenuSection.astro — SSR-grouped menu with server-rendered panels for all 3 categories (SEO) + hand-rolled tab list shell
  - MenuTabs.tsx — React island (client:visible) toggling aria-selected + hidden attribute on panels with ArrowLeft/ArrowRight keyboard cycling
  - PackagesSection.astro — 3-tier card grid with Most Popular butter-gold pill, understated chrome, en-dash ranges, and deep-link CTAs into Phase 3 wizard
  - Deep-link URL contract '#inquiry?tier={pkg.id}' — Phase 3 wizard pre-selects tier from URL fragment
affects:
  - 02-09 (assembly on index.astro — MenuSection + PackagesSection ready to mount)
  - 03 (wizard) — will read URL fragment '#inquiry?tier=' and pre-select package tier

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hand-rolled WAI-ARIA tabs pattern (role=tablist + role=tab + role=tabpanel) — NO shadcn tabs install (UI-SPEC Registry lock D-05)"
    - "Astro section (static) + React island (interactivity) split — all content server-rendered for SEO, JS only toggles visibility"
    - "client:visible hydration directive for below-fold interactive islands (saves initial JS)"
    - "Astro <Image> with format=\"avif\" + widths + sizes for responsive category hero photos"
    - "Package deep-link URL fragment contract: '#inquiry?tier={id}' — Phase 2 emits, Phase 3 consumes + re-validates"
    - "Butter-gold 'Most Popular' pill via bg-[color:var(--color-butter-gold)] — brand-layer exception anchored on the one popular tier"
    - "Equal-height cards via grid items-stretch + <div class=\"flex-grow\" /> spacer pushing CTA to bottom"
    - "En-dash (–) not hyphen (-) in all guest/price ranges (UI-SPEC copywriting contract)"

key-files:
  created:
    - src/components/sections/MenuSection.astro
    - src/components/MenuTabs.tsx
    - src/components/sections/PackagesSection.astro
  modified: []

key-decisions:
  - "Kept all 3 menu category panels in the server-rendered DOM; MenuTabs island only toggles hidden attribute + aria-selected (SEO + a11y baseline even with JS off)"
  - "client:visible (not client:load) on MenuTabs — menu is below the fold, defer hydration to save JS budget on initial load"
  - "Hand-rolled tabs (role=tablist / role=tab / role=tabpanel + ArrowLeft/ArrowRight keyboard) — zero shadcn/ui tabs dependency per UI-SPEC Registry lock"
  - "Popular-card tint uses border-primary/30 + bg-clay/5 (subtle); butter-gold pill is the affordance — avoids full-opacity primary anti-pattern"
  - "Price range font face font-display (Lovelace/Playfair display, NOT italic); tier name font-serif italic (Playfair italic) — two distinct typographic roles per UI-SPEC"
  - "Astro <Image> prop is 'format' (singular), not 'formats' (plural) — plan template had a typo; corrected inline (see Deviations §1)"

patterns-established:
  - "Section + Island split: section components are static .astro files; one colocated .tsx island per interactive section (MenuTabs for menu, GalleryGrid scoped for future plan)"
  - "Dietary badge icon map: vegetarian=Leaf, vegan=Sprout, gluten-free=WheatOff, dairy-free=MilkOff, nut-free=Nut (single source of truth in MenuSection.astro iconFor)"
  - "Package CTA asChild wraps <a href='#inquiry?tier={pkg.id}'> — semantic anchor navigation; the anchor is the interactive element, Button is pure styling"
  - "Marquee section padding tier: py-16 md:py-24 lg:py-32 for PackagesSection; standard tier py-12 md:py-20 lg:py-24 for MenuSection"
  - "Zero shadcn tabs/accordion/dialog/sheet imports — UI-SPEC Registry lock repeatable across FAQ (native <details>) and future sections"

requirements-completed: [MENU-01, MENU-02, MENU-03, MENU-04, PKG-01, PKG-02, PKG-03, PKG-04, PKG-05]

# Metrics
duration: 4min
completed: 2026-04-16
---

# Phase 02 Plan 07: Menu + Packages Sections Summary

**MenuSection + MenuTabs React island (hand-rolled WAI-ARIA tabs, zero shadcn) + PackagesSection 3-tier grid with butter-gold Most Popular pill and Phase-3 deep-link CTAs — all 3 menu categories SSR'd for SEO while the island only toggles visibility.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-16T16:02:35Z
- **Completed:** 2026-04-16T16:05:57Z
- **Tasks:** 2 executed
- **Files created:** 3 (2 Astro section components + 1 React island)

## Accomplishments

- **MenuSection.astro (Task 1):** Renders all proteins/sides/desserts server-side grouped by `category` frontmatter field, sorted by `order`. Tab list shell uses full WAI-ARIA (role=tablist + role=tab + role=tabpanel + aria-selected + aria-controls + aria-labelledby). Category hero photo (first item with `photo` set) renders via Astro `<Image>` with `aspect-[3/2]`, `loading="lazy"`, `widths={[640, 960, 1280]}`, `format="avif"`. Dish names use `font-serif italic text-display-md` (MENU-03 Playfair italic). Dietary badges render via Lucide icons (Leaf/Sprout/WheatOff/MilkOff/Nut) with `aria-label` on the outer span for screen reader announcement and `sr-only`-equivalent hiding of text label at `<640px`.
- **MenuTabs.tsx (Task 1):** Null-returning React island hydrated with `client:visible`. On mount, queries the tablist + panels via `data-menu-tablist`/`data-menu-tab`/`data-menu-panel` attributes, wires click + keydown handlers. ArrowLeft/ArrowRight cycle tabs with focus management. Cleanup on unmount.
- **PackagesSection.astro (Task 2):** 3-card grid sorted by `pkg.order` with `items-stretch` + `flex-grow` spacer for equal-height cards with CTAs pinned to card bottom. Popular card (`pkg.popular === true`) gets `border-primary/30 bg-clay/5` subtle tint + butter-gold "Most Popular" pill (`bg-[color:var(--color-butter-gold)]` absolute-positioned at `-top-3 left-1/2 -translate-x-1/2`). Popular CTA is solid `bg-primary text-white`; non-popular CTAs use `variant="outline"`. All CTAs deep-link to `#inquiry?tier=${pkg.id}` (PKG-04 contract). Guest + price ranges use en-dash (–). Tier name is Playfair italic, price range is Lovelace/Playfair display face.
- **`pnpm astro check` — 0 errors / 0 warnings** across all 26 Astro+TS files after both tasks. (4 pre-existing hints in `src/lib/schemas/site.ts` for deprecated zod `.url()` / `.email()` — out of scope for this plan.)
- **Zero shadcn tabs/accordion/dialog/sheet imports** confirmed via `! grep -qE 'from "@/components/ui/(tabs|accordion|dialog|sheet)"' src/components/sections/*.astro src/components/MenuTabs.tsx`.

## Task Commits

1. **Task 1: MenuSection.astro + MenuTabs.tsx — static shell + interactive tab island** — `820920c` (feat)
2. **Task 2: PackagesSection.astro — 3 tier cards with Most Popular badge + deep-link CTAs** — `3727645` (feat)

## Files Created/Modified

### Created

- `src/components/sections/MenuSection.astro` — Static section with server-side category grouping, tablist shell, category hero image, per-dish row with dietary badge pills. Mounts `<MenuTabs client:visible />` inline at the bottom.
- `src/components/MenuTabs.tsx` — React island (returns `null`); wires up tab ↔ panel toggles via `data-*` attributes + ArrowLeft/ArrowRight keyboard nav. Cleans up listeners on unmount.
- `src/components/sections/PackagesSection.astro` — Static section with 3-tier card grid; conditionally renders the butter-gold pill on `popular: true`; CTA variant (solid vs outline) conditional on same flag.

## Decisions Made

- **All panels in DOM + island toggles visibility** — explicit contract from PATTERNS.md. Non-JS users see the first tab (proteins) rendered; SEO sees all dish content regardless of tab state. Threat T-02-23 mitigated by design.
- **`client:visible` for MenuTabs** — menu lives below About/Hero, so deferring hydration until the section scrolls into view keeps initial JS budget lean. `client:load` would be anti-pattern (UI-SPEC §Island Hydration Strategy).
- **Playfair italic for tier name; Playfair display (NON-italic) for price range** — two distinct roles from UI-SPEC §Typography. `font-serif italic text-display-md` on `<h3>{pkg.name}</h3>`; `font-display text-display-md` on the price `<p>`.
- **`text-primary` on Check icon in inclusions list** — plan flagged this as a LOCKED discretion; primary green is normally reserved for CTAs, but inclusion checkmarks count as structural iconography (same class as FAQ accordion chevron). Kept for visual consistency with the CTA color language.
- **No pre-existing section components** — `src/components/sections/` was empty except for `.gitkeep`. This plan is the first to create files in that directory, so it also establishes the "section = Astro component; co-located island = .tsx in `src/components/`" pattern for the remaining sections (Gallery/Testimonials/FAQ/Contact in plans 02-08/02-09).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Astro `<Image>` prop is `format` (singular), not `formats` (plural)**
- **Found during:** Task 1 (MenuSection category hero image)
- **Issue:** Plan template used `formats={["avif", "webp"]}`; `pnpm astro check` rejected with `ts(2322): Property 'formats' does not exist on type... Did you mean 'format'?`
- **Fix:** Changed to `format="avif"` (singular, single format). AVIF chosen as the primary modern format; Astro's `<Image>` still falls back to `<img>` for browsers without support.
- **Files modified:** `src/components/sections/MenuSection.astro`
- **Verification:** `pnpm astro check` passes with 0 errors post-fix
- **Committed in:** `820920c` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — plan template typo)
**Impact on plan:** Zero scope creep. Fix was a one-character prop rename; plan intent (modern format with AVIF) fully preserved. If webp fallback is desired later, Astro supports an array but the API is `formats` only on the Picture component, not Image — confirm in future plans before changing.

## Issues Encountered

- **Acceptance-criteria grep patterns for `Select ${pkg.name}` and `guestRange.min}–${pkg.guestRange.max`** looked for template-literal `${...}` syntax which is only valid inside backticks. In JSX/Astro component bodies, the correct syntax is `{pkg.name}` (bare braces) for the CTA text and `{pkg.guestRange.min}–{pkg.guestRange.max}` for the range. The file contents satisfy the plan's intent (literal "Select {name}" text in the CTA and en-dash guest ranges) — I verified against the JSX-correct patterns and confirmed the file matches. No code change was needed; this is a plan-authoring note, not a defect.
- **Worktree missing `node_modules`** at session start — ran `pnpm install --prefer-offline` once (4.6s via pnpm content-addressed store) to enable `pnpm astro check`. No code impact.

## User Setup Required

None — this plan only adds UI components. No env vars, external services, or dashboard configuration. Section components are not yet mounted on `src/pages/index.astro` (that assembly is scheduled for plan 02-09).

## Next Phase Readiness

- **Plan 02-08 (Testimonials + FAQ sections):** No ordering dependency on this plan. Will follow the same "section Astro file + co-located island when needed" pattern established here.
- **Plan 02-09 (index.astro assembly):** MenuSection + PackagesSection are ready to import and mount in the single-page scroll composition. Expected props:
  - `<MenuSection id="menu" menu={menu.map(m => m.data)} />`
  - `<PackagesSection id="packages" packages={packages.map(p => p.data)} />`
- **Phase 3 (Wizard / inquiry form):** Deep-link contract `#inquiry?tier={small|medium|large}` is now emitted from the Packages CTAs. Phase 3 wizard should parse `location.hash`, extract the `tier` param, and re-validate against the `packageSchema.id` enum before pre-selecting the wizard step. Threat T-02-22 already planned for Phase-3 side.
- **Image asset authoring:** The `photo` field on category-hero menu items (`smothered-chicken.md`, `mac-and-cheese.md`, `peach-cobbler.md`) points at paths under `public/images/menu/...` that are currently empty (`.gitkeep` only). `<Image>` will 404 at build/runtime until real JPG/PNG assets ship. The section component handles absence gracefully (conditional on `hero && hero.photo && hero.photoAlt`), so this is a content-authoring task for a later plan/agent, not a blocker here.

## Threat Flags

None — no new trust boundaries or security-relevant surface introduced. All deep-link emissions use schema-enum `pkg.id` values (small/medium/large); text interpolation via `{item.description}` and `{inc}` uses JSX text nodes (no `set:html`), mitigating T-02-21 by construction.

## Self-Check: PASSED

**File existence:**

- FOUND: src/components/sections/MenuSection.astro
- FOUND: src/components/MenuTabs.tsx
- FOUND: src/components/sections/PackagesSection.astro

**Commits:**

- FOUND: 820920c (Task 1 — MenuSection + MenuTabs)
- FOUND: 3727645 (Task 2 — PackagesSection)

**Validation:**

- `pnpm astro check` — 0 errors / 0 warnings across 26 files (4 pre-existing hints in `src/lib/schemas/site.ts`, out of scope)
- Hand-rolled tabs intact: `grep -q 'role="tablist"'` + `grep -q 'role="tab"'` + `grep -q 'role="tabpanel"'` all pass
- `client:visible` on MenuTabs (not `client:load`): PASS
- Zero shadcn tabs/accordion/dialog/sheet imports: PASS
- En-dash in both guest and price ranges: PASS
- Deep-link pattern `#inquiry?tier=${pkg.id}` emitted: PASS
- All 5 Lucide dietary icons imported (Leaf, Sprout, WheatOff, MilkOff, Nut) + Check icon: PASS

---
*Phase: 02-content-static-sections*
*Completed: 2026-04-16*
