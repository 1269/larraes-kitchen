---
phase: 02-content-static-sections
plan: 05
subsystem: ui

tags: [astro, react, nav, footer, intersection-observer, accessibility, focus-trap, aria, drawer, base-layout, lucide, svg]

# Dependency graph
requires:
  - phase: 02-content-static-sections
    plan: 01
    provides: "BaseLayout.astro HTML shell with TODO(02-05) markers, SiteData type, formatPhone() utility, shadcn Button, site.md NAP"
provides:
  - "Nav.astro sticky primary navigation (aria-label=Primary, 7 desktop anchor links, pill CTA, mobile hamburger trigger)"
  - "NavController.tsx React island (client:load) — two IntersectionObservers (hero→transparent/solid, sections→active link), mobile drawer with focus trap + body scroll-lock + Escape close"
  - "Footer.astro two-band layout — surface top band (NAP echo + explore + connect + hours) + ink bottom strip (copyright + Privacy/Terms pending-page stubs)"
  - "BaseLayout.astro with Nav + Footer wired around <main>; TODO(02-05) forward references resolved"
affects:
  - "02-02 Hero — #hero anchor target drives Nav state machine (transparent↔solid)"
  - "02-03/04/06/07/08 sections — #menu/#packages/#gallery/#about/#testimonials/#faq/#contact anchors drive Nav active-link highlight"
  - "02-09 Index refactor — all sections now render inside BaseLayout chrome"
  - "03 Wizard — #inquiry is the Nav CTA target + drawer CTA target"
  - "04 SEO — Nav aria-label=Primary is the canonical landmark for screen readers"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IntersectionObserver-only nav state (zero scroll listeners per D-14) — threshold 0.1 for hero→nav-state, threshold 0.4 + rootMargin -80px for section→active-link"
    - "data-attribute-driven CSS state — island toggles nav[data-nav-state] and [data-section-link][data-active] so CSS handles styling, minimal re-render cost"
    - "Mobile drawer accessibility triad — role=dialog + aria-modal=true + focus trap (Tab/Shift+Tab cycle, Escape close + restore focus to hamburger) + body scroll-lock (cleaned up on unmount)"
    - "Inline brand SVG fallback — lucide-react v1 dropped brand marks; authored viewBox-24 stroke glyphs inline so build stays green without bumping shared dependency"
    - "Single-source NAP echo — Footer pulls every field from site prop; grep-verified no hardcoded address/phone to enforce C5 single-source rule"
    - "Forward-reference resolution — BaseLayout imports moved from TODO(02-05) comments to live lines; pattern scales to future wave handoffs"

key-files:
  created:
    - "src/components/Nav.astro"
    - "src/components/NavController.tsx"
    - "src/components/Footer.astro"
    - ".planning/phases/02-content-static-sections/02-05-SUMMARY.md"
  modified:
    - "src/layouts/BaseLayout.astro"

key-decisions:
  - "Inline SVG for social icons instead of bumping lucide-react — the installed lucide-react@1.8.0 dropped Instagram/Facebook/Globe brand marks (trademark policy); bumping the package risks breaking other wave-2 agents. Inline stroke SVGs preserve the UI-SPEC § 10 icon trio with zero dependency churn (Rule 3 deviation)."
  - "client:load on NavController (not client:idle) — users deep-linking to #faq or #contact need the IO logic active before the first paint so nav state is correct on arrival; PATTERNS.md documents this explicitly."
  - "setAttribute('aria-current','location') via effect instead of JSX prop — the active link lives in the Astro shell (SSR), not inside the React island; keeping active-state sync in the island's useEffect preserves server-rendered HTML as the source of truth for crawlers."
  - "Privacy/Terms href='#' + data-pending='true' — LAUN-04 (Phase 5) owns those pages; CI cannot block on missing files today, so the data-pending marker provides a machine-readable handoff."

patterns-established:
  - "Nav/Footer islands read site prop from BaseLayout — any future consumer shell must follow the same prop-drilling contract (no useStore/useContext for global site data)"
  - "Two-IO nav pattern — hero observation for chrome state + section observation for active link. Other sticky-surface components (e.g., sticky CTA bar in 03) should follow the IO-only rule"
  - "Focus trap idiom — queryselect focusable (a[href], button, [tabindex]:not([tabindex=-1])) + Tab/Shift+Tab cycle + Escape to close + restore focus to trigger. Reusable for modals in 03 Wizard and 06 Gallery lightbox"
  - "Brand icon SVG fallback — viewBox=24, stroke=currentColor, stroke-width=2, round caps/joins — matches lucide visual language so icons blend with other lucide imports"

requirements-completed: [LAYT-02, LAYT-05, LAYT-06]

# Metrics
duration: ~5 min
completed: 2026-04-16
---

# Phase 2 Plan 5: Nav + Footer + BaseLayout Wire-Up Summary

Sticky primary nav with IntersectionObserver-driven state (transparent↔solid + active section underline) and a two-band footer that echoes every NAP field from site.md — delivered with a focus-trapped mobile drawer and zero scroll listeners, then wired into BaseLayout to close the Wave-1 forward reference.

## Performance

- **Duration:** ~4m 34s
- **Started:** 2026-04-16T16:01:15Z
- **Ended:** 2026-04-16T16:05:49Z
- **Tasks:** 3 (3 commits)
- **Files touched:** 4 (3 created, 1 modified)

## Accomplishments

### Task 1 — Nav.astro + NavController.tsx
- **Commit:** `31b6d81`
- Static Astro shell renders sticky `<nav aria-label="Primary">` with wordmark (site.name), 7 desktop anchor links (menu/packages/gallery/about/testimonials/faq/contact), pill "Get a Quote" CTA, and hydration mount for NavController.
- NavController (`client:load`) wires up:
  - **IO #1** on `#hero` (threshold [0, 0.1, 0.5, 1]) → toggles `data-nav-state` between `transparent` and `solid`. Default `transparent` is authored in the shell so SSR output matches initial state.
  - **IO #2** on all 7 section IDs (threshold 0.4, rootMargin `-80px 0px 0px 0px` to offset the sticky nav height) → sets `data-active="true"` + `aria-current="location"` on the matching `[data-section-link]`.
  - Mobile drawer (`role="dialog"` + `aria-modal="true"`) with Tab/Shift+Tab focus cycle, Escape close that restores focus to the hamburger, body scroll-lock + unmount cleanup, and backdrop tap-to-close.
- Hamburger is `min-h-[44px] min-w-[44px]` (WCAG touch target).
- All transitions carry `motion-reduce:transition-none` (LAYT-06).
- Zero scroll listeners — grep-verified.

### Task 2 — Footer.astro
- **Commit:** `b8d227f`
- Two-band layout:
  - **Top band** (`bg-surface py-12 md:py-16`) — 3-column grid: (1) wordmark + address + `formatPhone(site.phone)` + email, (2) Explore links, (3) Connect icons + Hours list.
  - **Bottom strip** (`bg-ink py-6`) — dynamic `©${new Date().getFullYear()} ${site.name}` + Privacy/Terms with `data-pending="true"`.
- Every NAP field pulls from the `site` prop: `site.name`, `site.address.{street,city,region,postalCode}`, `site.phone`, `site.email`, `site.hours[]`, `site.social.{instagram,facebook,google}`. Grep proves no hardcoded "Benicia, CA" or raw 10-digit phone strings (C5 prevention).
- `<address>` carries `not-italic` (overrides browser's italic default so Work Sans roman renders).
- Social links: `target="_blank"` + `rel="noopener noreferrer"` (T-02-14 tabnabbing mitigation); 44×44 touch targets; conditional rendering per `site.social.{key}`.

### Task 3 — BaseLayout wire-up
- **Commit:** `576700c`
- Replaced two `TODO(02-05):` import comments with live imports (`Nav` + `Footer`).
- Replaced two `{/* TODO(02-05): ... */}` JSX comments with `<Nav site={site} />` (above `<main>`) and `<Footer site={site} />` (below `</main>`).
- Skip link, `<main id="main">` landmark, Fontsource imports, and smooth-scroll+reduced-motion `<style is:global>` all preserved from plan 02-01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 – Blocking Dependency] Substituted inline SVGs for lucide-react brand icons**
- **Found during:** Task 2 (Footer.astro initial build)
- **Issue:** `pnpm astro check` reported `Module '"lucide-react"' has no exported member 'Instagram'` and `... 'Facebook'`. Installed version is `lucide-react@1.8.0`; in v1 Lucide dropped brand marks (Instagram, Facebook, Twitter, etc.) per their trademark policy. `Globe` exists but the trio needed was incomplete.
- **Fix:** Removed the `lucide-react` import from Footer.astro and authored three inline stroke SVGs (Instagram, Facebook, Google/Globe) using Lucide's viewBox-24 / stroke=currentColor / stroke-width=2 / round caps+joins conventions so they blend visually with other lucide-react usage (Menu/X in NavController). Each SVG is `aria-hidden="true"`; the parent `<a>` carries the accessible label.
- **Why not upgrade the package instead:** Other Wave-2 agents may already import `lucide-react` at the pinned version; bumping a shared dependency mid-wave is out of scope for this plan and would have produced lockfile churn merging back to main. Inline SVG is zero-risk and preserves the UI-SPEC icon trio exactly.
- **Files modified:** `src/components/Footer.astro` (removed `import { Facebook, Globe, Instagram } from "lucide-react"`; added three inline `<svg>` blocks).
- **Commit:** `b8d227f` (commit message calls out the Rule 3 deviation).

### Auth Gates
None.

## Threat Mitigations Applied

Cross-check against the plan's `<threat_model>`:

| Threat ID | Status | How mitigated in this plan |
|-----------|--------|----------------------------|
| T-02-14 Social link tabnabbing | Mitigated | Every `<a target="_blank">` in Footer.astro includes `rel="noopener noreferrer"` — grep-verified. |
| T-02-15 Stuck body scroll after drawer unmount | Mitigated | NavController's drawer `useEffect` returns a cleanup function that sets `document.body.style.overflow = ""`, guaranteeing release on unmount even if the component is torn down while open. |
| T-02-16 Malicious social URL | Accepted | NAP is authored by repo owner; unchanged by this plan. |
| T-02-17 Drawer ARIA state disclosure | Accepted | ARIA state is intentional UX; no sensitive data. |

No new threat surface introduced beyond what the plan's threat model accounts for.

## Known Stubs

- **Privacy / Terms footer links** — authored with `href="#" data-pending="true"` per UI-SPEC § 10 fallback. These are deliberately stubbed; LAUN-04 in Phase 5 will ship the actual `/privacy` and `/terms` pages. Documented as intentional in the plan.

No UI-data stubs (no `="not available"`, no empty arrays flowing to render — all footer data flows from the real `site` prop).

## Self-Check: PASSED

### Files exist
- `src/components/Nav.astro` → FOUND
- `src/components/NavController.tsx` → FOUND
- `src/components/Footer.astro` → FOUND
- `src/layouts/BaseLayout.astro` → FOUND (modified, no TODO markers remain)

### Commits exist
- `31b6d81` → FOUND (Task 1: Nav shell + NavController island)
- `b8d227f` → FOUND (Task 2: Footer with single-source NAP)
- `576700c` → FOUND (Task 3: wire Nav + Footer into BaseLayout)

### Plan-level verification
- `pnpm astro check` → 0 errors, 0 warnings, 4 hints (hints pre-existing in src/lib/schemas/site.ts, out of scope)
- `pnpm build` → succeeded (Vercel server + client + sitemap built)

### Success criteria
- LAYT-02 sticky nav: PASS (Nav.astro fixed top-0 with wordmark + links + persistent CTA)
- LAYT-05 browser-native anchors: PASS (`<a href="#section">` only — no client router)
- LAYT-06 reduced-motion: PASS (`motion-reduce:transition-none` on all animated elements; inherited scroll-behavior fallback in BaseLayout)
- C5 single-source NAP: PASS (grep-verified Footer has no hardcoded phone/address strings)
