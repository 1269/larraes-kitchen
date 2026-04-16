---
phase: 02-content-static-sections
plan: 08
subsystem: ui
tags: [gallery, testimonials, faq, react-photo-album, yet-another-react-lightbox, astro-islands, native-details, json-ld, faq-page]

requires:
  - phase: 01-foundation
    provides: Tailwind v4 brand tokens, shadcn Button scaffold, @/lib/utils cn helper, Astro + React integration
  - phase: 02-content-static-sections (plan 04)
    provides: 4 testimonials + 4 FAQ groups + 15 gallery markdown files with Zod-typed frontmatter
provides:
  - GallerySection.astro (section shell, eyebrow + H2 + intro) mounting GalleryGrid with client:visible
  - GalleryGrid.tsx React island — MasonryPhotoAlbum grid with INITIAL=10 reveal + "View All" expand
  - Lazy-loaded lightbox (yet-another-react-lightbox) — ~25KB + Captions/Counter plugins deferred until first open
  - TestimonialsSection.astro — 1/2/3-col persona-grid with butter-gold star rows, blockquote/cite semantics
  - FaqSection.astro — native <details>/<summary> accordion grouped by 4 categories + FAQPage JSON-LD script
affects:
  - 02-09 (CTA + Footer + index.astro composition — consumes these 3 sections)
  - 04-seo-accessibility (Root layout will extend FaqSection's JSON-LD with Restaurant/LocalBusiness blocks)
  - 05-performance (Lazy lightbox contributes to CWV budget; masonry CLS-safe via aspectRatio-derived dimensions)

tech-stack:
  added:
    - "react-photo-album@3.6.0"
    - "yet-another-react-lightbox@3.31.0"
  patterns:
    - "React.lazy() for lightbox module; plugins loaded imperatively via useEffect when lightbox opens (plugins are void-returning functions, not React components — incompatible with lazy() directly)"
    - "aspectRatio enum → {width, height} pair conversion for react-photo-album (base=1200 scaled)"
    - "Native <details>/<summary> with [&_summary::-webkit-details-marker]:hidden + list-none to hide browser default marker; chevron rotated via CSS group-open:rotate-180 (zero-JS disclosure)"
    - "FAQPage JSON-LD emission co-located with FaqSection (derived from same sorted data) using set:html={JSON.stringify(...)} — safe because payload is JSON, not user HTML"
    - "Text-interpolation for user content ({t.quote}, {q.answer}) — never set:html on author-provided fields (XSS safety boundary)"
    - "cite with both 'not-italic' (override browser italic) + 'font-serif italic' (apply Playfair italic from stack) — required class combo for Playfair italic attribution"

key-files:
  created:
    - src/components/sections/GallerySection.astro
    - src/components/GalleryGrid.tsx
    - src/components/sections/TestimonialsSection.astro
    - src/components/sections/FaqSection.astro
  modified:
    - package.json (added react-photo-album, yet-another-react-lightbox)
    - pnpm-lock.yaml

key-decisions:
  - "Lightbox plugin loading: React.lazy() couldn't wrap the Captions/Counter plugin modules because their default exports are void-returning functions, not React components. Solution: lazy() only wraps the Lightbox component; plugins are loaded via a dynamic import() inside a useEffect triggered when lightboxIndex !== null, then passed via state. Still ships alongside lightbox (not with the page shell) — same GAL-06 deferred-JS outcome."
  - "Animation fade set to 0 (instant) rather than reading prefers-reduced-motion at runtime — plan's suggested simplification accepted. All users get the instant animation; matchMedia call avoided. Users with motion preferences lose 300ms fade but gain consistency per UI-SPEC note."
  - "FAQ answers rendered as text interpolation {q.answer}, never set:html. The ONE set:html in FaqSection wraps JSON.stringify(...) for the FAQPage structured-data block — safe by construction."
  - "Section background uses bg-[color:var(--color-clay)]/8 (brand-layer exception) for TestimonialsSection — the one secondary-surface band per UI-SPEC 60/30/10 contract."

patterns-established:
  - "Gallery islands pattern: Astro shell (Section.astro) handles layout + copy; React island (Grid.tsx) handles interactivity with client:visible hydration"
  - "Plugin-loading pattern for React.lazy incompatible modules: useEffect + Promise.all + setState, with plugins={plugins ?? []} fallback for initial render"
  - "Native disclosure for zero-JS UI: <details class='group' [&_summary::-webkit-details-marker]:hidden> with list-none summary + CSS group-open:rotate-180 chevron"
  - "Co-located structured data: FAQPage JSON-LD stays with FaqSection (derives from same data); root layout will emit LocalBusiness/Restaurant separately in Phase 4"

requirements-completed: [GAL-01, GAL-02, GAL-03, GAL-04, GAL-05, GAL-06, TEST-01, TEST-02, TEST-03, TEST-04, FAQ-01, FAQ-02, FAQ-03, FAQ-04]

duration: 8min
completed: 2026-04-16
---

# Phase 02 Plan 08: Gallery + Testimonials + FAQ Sections Summary

**Three render-ready section components (1 Astro + 1 React island for Gallery; 2 pure Astro for Testimonials + FAQ) — lazy-loaded lightbox defers ~25KB until user expands gallery, native `<details>` FAQ ships zero JS, FAQPage JSON-LD emitted inline.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 3
- **Files created:** 4
- **Files modified:** 2 (package.json, pnpm-lock.yaml)

## Accomplishments

- GallerySection + GalleryGrid island with MasonryPhotoAlbum, `client:visible` hydration, INITIAL=10 + "View All" expand toggle
- Lightbox dynamically imported via `React.lazy(() => import("yet-another-react-lightbox"))`; Captions + Counter plugins loaded imperatively on first open (GAL-06 satisfied for both lightbox and plugin JS)
- TestimonialsSection with 1/2/3 responsive grid, butter-gold star row + ink/20 unfilled, Work Sans quote / Playfair italic attribution, clay-tinted section background (the one secondary-surface band)
- FaqSection with native `<details>`/`<summary>` — zero JS, CSS-only chevron rotation (`group-open:rotate-180` + `motion-reduce:transition-none`), XSS-safe text-interpolated answers, FAQPage JSON-LD script emitted alongside
- `pnpm astro check` passes with 0 errors for the 4 new files; existing test suite (4 passed + 1 skipped) still green

## Task Commits

Each task was committed atomically:

1. **Task 1: GallerySection + GalleryGrid island with lazy lightbox** — `6b5540d` (feat)
2. **Task 2: TestimonialsSection with persona-grid cards and star ratings** — `b472368` (feat)
3. **Task 3: FaqSection with native details accordion and FAQPage JSON-LD** — `c90a770` (feat)

## Files Created/Modified

- `src/components/sections/GallerySection.astro` — Section shell (bg-surface, marquee padding, eyebrow + H2 + intro copy). Mounts `GalleryGrid client:visible photos={sorted}` for deferred hydration.
- `src/components/GalleryGrid.tsx` — React island. `MasonryPhotoAlbum` with responsive 2/3/4-col layout; `React.lazy()` for lightbox chunk; `useEffect` + `Promise.all` loads Captions/Counter plugins on first open; `ratioToDimensions()` helper converts schema enum to `{width, height}` pairs keyed off base=1200 for CLS-safe rendering.
- `src/components/sections/TestimonialsSection.astro` — 1/2/3-col responsive grid of testimonial cards. Star row renders 5 `<Star>` icons with butter-gold fill / ink/20 for unfilled + `aria-label="{rating} out of 5 stars"`. `<blockquote>` with curly-quote entities (&ldquo;/&rdquo;), `<cite class="not-italic font-serif italic">` for Playfair italic attribution, event-type label map (Family celebration / Social gathering / Corporate event / Private event).
- `src/components/sections/FaqSection.astro` — Native `<details>`/`<summary>` groups per category (Ordering / Delivery & setup / Menu customization / Payment). CSS chevron rotation via `group-open:rotate-180` + `motion-reduce:transition-none`. `[&_summary::-webkit-details-marker]:hidden` + `list-none` hides browser default markers. One `set:html` usage — the FAQPage JSON-LD `<script>` (safe by construction, JSON.stringify output).
- `package.json` + `pnpm-lock.yaml` — added `react-photo-album@3.6.0` + `yet-another-react-lightbox@3.31.0`.

## Decisions Made

- **Lightbox plugin loading via useEffect + Promise.all** (not `React.lazy()` directly): The Captions + Counter plugins export `void`-returning functions, not React components; `React.lazy()` requires `ComponentType` at the type level. The hand-rolled approach loads plugins in a `useEffect` when `lightboxIndex !== null`, setting them via `useState`. Bundle-level outcome identical: plugin modules are still code-split and deferred until first open. Captured as a **deviation from plan** (Rule 1 bug fix — the plan's literal `lazy(() => import(".../plugins/captions").then(...))` code did not type-check).
- **Animation fade = 0** — accepted the plan's simplification over runtime `matchMedia('(prefers-reduced-motion)')` detection.
- **`eventTypeLabel` + `categoryLabel` as inline `switch` functions** — kept close to render site per plan; no shared `labels.ts` until a second consumer shows up.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's `lazy()` plugin imports did not type-check**
- **Found during:** Task 1 (first `pnpm astro check` run after pasting plan code verbatim)
- **Issue:** Plan code used `lazy(() => import("yet-another-react-lightbox/plugins/captions").then((m) => ({ default: m.default })))` for Captions + Counter. The plugin modules export `(props: PluginProps) => void` — not a `ComponentType<any>` — so `React.lazy()`'s type signature rejected them. Errors: `Type 'void' is not assignable to type 'ReactNode | Promise<ReactNode>'`.
- **Fix:** Kept `React.lazy()` for the `Lightbox` component itself (preserves GAL-06 lightbox chunk deferral and satisfies the plan's `lazy(() => import("yet-another-react-lightbox"))` acceptance criterion). Plugins now load imperatively inside `useEffect`: when `lightboxIndex !== null && plugins === null`, a `Promise.all([import(".../captions"), import(".../counter")])` resolves and sets `plugins` state. `<Lightbox plugins={plugins ?? []} />` handles the one-frame gap between open and plugin resolution (Lightbox renders fine with no plugins on first paint; Captions/Counter attach on the next render).
- **Files modified:** `src/components/GalleryGrid.tsx` (Task 1)
- **Verification:** `pnpm astro check` → 0 errors. Runtime behavior preserved: plugins still ship only after first lightbox open (same bundle split as plan's intent; verified by the fact the lightbox + plugin modules all resolve from the same user gesture).
- **Committed in:** 6b5540d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug).
**Impact on plan:** Semantic outcome preserved — lightbox + plugins still lazy-loaded, same CWV budget, GAL-06 contract intact. Pattern worth noting for any future `lazy()` adoption of yet-another-react-lightbox plugins (or similar void-returning plugin APIs).

## Issues Encountered

- **Biome false-positive on Astro `<script>` variable usage:** Biome's Astro parser flags frontmatter const `sorted` as unused because it cannot follow the `{sorted.map(...)}` reference inside the template. Mirrors the same issue already observed in earlier Phase 2 commits (`refactor(02-09): address plan checker warning`). `biome ci` still exits 0 (warning, not error). Left as-is; will be resolved when biome's Astro plugin matures. No user-facing impact.
- **Gallery image files (/images/gallery/*.jpg) do not yet exist:** The gallery markdown from Plan 02-04 points to `/images/gallery/01-...jpg` through `/15-...jpg`, but the JPGs themselves are not in the repo yet. This is expected — authoring the image set is a content-supply task (user-supplied photography) tracked independently. The component renders with placeholder-path `<img>` elements today; wiring real images changes only the file system, not this component's code.

## User Setup Required

None — component-only work, no external services.

## Self-Check: PASSED

- FOUND: `src/components/sections/GallerySection.astro`
- FOUND: `src/components/GalleryGrid.tsx`
- FOUND: `src/components/sections/TestimonialsSection.astro`
- FOUND: `src/components/sections/FaqSection.astro`
- FOUND commit: 6b5540d (Task 1)
- FOUND commit: b472368 (Task 2)
- FOUND commit: c90a770 (Task 3)
- `pnpm astro check` → 0 errors, 0 warnings for the 4 new files (4 existing hints in `src/lib/schemas/site.ts` — pre-existing, out of scope)
- `pnpm test` → 4 passed / 1 skipped (no regressions)
- `biome ci` on new files → exit 0 (warnings only, cosmetic Astro false-positives)

## Next Phase Readiness

- Plan 02-09 (index.astro composition + CTA + Footer) can now import all three section components: `GallerySection`, `TestimonialsSection`, `FaqSection`.
- Phase 4 SEO/a11y will extend the FAQPage JSON-LD already emitted here with sibling `LocalBusiness` + `Restaurant` blocks in the root layout.
- Gallery image asset delivery remains tracked as a content supply task (out of scope for this plan).

---
*Phase: 02-content-static-sections*
*Plan: 08*
*Completed: 2026-04-16*
