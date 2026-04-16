---
phase: 02-content-static-sections
reviewed: 2026-04-16T16:48:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - package.json
  - src/components/Footer.astro
  - src/components/GalleryGrid.tsx
  - src/components/MenuTabs.tsx
  - src/components/Nav.astro
  - src/components/NavController.tsx
  - src/components/sections/AboutSection.astro
  - src/components/sections/ContactSection.astro
  - src/components/sections/FaqSection.astro
  - src/components/sections/GallerySection.astro
  - src/components/sections/HeroSection.astro
  - src/components/sections/MenuSection.astro
  - src/components/sections/PackagesSection.astro
  - src/components/sections/TestimonialsSection.astro
  - src/layouts/BaseLayout.astro
  - src/lib/format.test.ts
  - src/lib/format.ts
  - src/pages/index.astro
findings:
  critical: 0
  warning: 6
  info: 8
  total: 14
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-04-16T16:48:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Overall the Phase 2 implementation is tight and idiomatic. Island hydration directives are chosen correctly for the `return null`-vs-render distinction that caused a prior silent bug (MenuTabs is `client:load`; GalleryGrid renders content so `client:visible` is safe; NavController is `client:load` because it wires above-the-fold IO observers). Astro `<Picture>` usage is correct (AVIF/WebP, `fetchpriority="high"` only on the hero LCP). External links have `rel="noopener noreferrer"`. Zod schemas cover the content-collection boundary cleanly, and `formatPhone` is well-tested.

Findings are concentrated in four areas: (1) an unhandled promise rejection + stale-setState risk in the lightbox plugin loader, (2) a JSON-LD escaping gap in the FAQ structured data, (3) a Tailwind utility conflict that silently breaks the intended testimonial cite italicization, and (4) several minor a11y polish items (roving tabindex on the menu tablist, ARIA boolean serialization, placeholder footer links that scroll the page). No critical security or data-loss issues were found.

## Warnings

### WR-01: Unhandled promise rejection + stale setState in lightbox plugin loader

**File:** `src/components/GalleryGrid.tsx:40-49`
**Issue:** `Promise.all([import(...), import(...)]).then(...)` has no `.catch()` handler. If either dynamic `import()` fails (network blip, CDN hiccup, chunk-load error after a deploy), the promise rejects unobserved — the user sees a lightbox open with no captions/counter plugins and no diagnostic. Additionally, if the user closes the lightbox or the parent unmounts `GalleryGrid` before `then` fires, `setPlugins(...)` runs on an unmounted component. React 19 no longer warns about this, but the state update is still wasted work and can mask real bugs in tests.
**Fix:**
```tsx
useEffect(() => {
  if (lightboxIndex === null || plugins !== null) return;
  let cancelled = false;
  Promise.all([
    import("yet-another-react-lightbox/plugins/captions"),
    import("yet-another-react-lightbox/plugins/counter"),
  ])
    .then(([captions, counter]) => {
      if (cancelled) return;
      setPlugins([captions.default, counter.default]);
    })
    .catch((err) => {
      if (cancelled) return;
      console.error("Failed to load lightbox plugins", err);
      setPlugins([]); // render lightbox without plugins rather than spinning forever
    });
  return () => {
    cancelled = true;
  };
}, [lightboxIndex, plugins]);
```

### WR-02: JSON-LD `</script>` escape missing in FAQ structured data

**File:** `src/components/sections/FaqSection.astro:76-80`
**Issue:** `set:html={JSON.stringify(faqJsonLd)}` interpolates JSON directly inside a `<script type="application/ld+json">` tag. `JSON.stringify` escapes quotes and backslashes but does *not* escape the string `</script>`, which terminates the script element parsing regardless of the JSON-string quoting. Today's FAQ content is safe, but AI agents and humans edit `src/content/faq/*.md` freely — a single FAQ answer containing the literal text `</script>` (e.g., a question "What does `</script>` mean in HTML?") would break the page and open an XSS vector. This is a standard inline-JSON hardening step.
**Fix:**
```astro
---
// ...existing code...
const faqJsonLd = { /* ... */ };
const faqJsonLdSafe = JSON.stringify(faqJsonLd).replace(/</g, "\\u003c");
---
<script type="application/ld+json" is:inline set:html={faqJsonLdSafe} />
```
`\u003c` is a valid JSON-string representation of `<` and is parsed back to `<` by any JSON-LD consumer, while preventing the HTML parser from seeing `</script>` inside the embedded string.

### WR-03: Unscoped `querySelectorAll` in MenuTabs couples to global DOM

**File:** `src/components/MenuTabs.tsx:8`
**Issue:** `document.querySelectorAll<HTMLElement>("[data-menu-panel]")` selects from the whole document. The page currently has exactly one menu tablist so it works, but if a second menu region (e.g., a simplified menu callout elsewhere on the page, a future preview component) ever adds `data-menu-panel` elements, clicking a tab will toggle panels outside its own tablist. The tabs themselves are already correctly scoped under `tablist` via line 7 — panels should be scoped the same way.
**Fix:**
```ts
const tablist = document.querySelector<HTMLElement>("[data-menu-tablist]");
if (!tablist) return;
// Walk to a shared parent so the panels query stays local to this menu section
const root = tablist.closest("section") ?? document;
const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>("[data-menu-tab]"));
const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-menu-panel]"));
```

### WR-04: Footer legal placeholder links scroll page to top

**File:** `src/components/Footer.astro:150-151`
**Issue:** `<a href="#" data-pending="true">` — clicking Privacy or Terms scrolls the user to the top of the page (the browser default for `href="#"`), abandoning their footer-scroll position silently. The `data-pending="true"` attribute has no behavior attached. Because the footer is visible on first mobile scroll-through, this is a real (if minor) UX regression the launch-readiness review will catch.
**Fix:** Use a non-navigating element until the routes exist:
```astro
<span class="text-body-sm text-surface/40" aria-disabled="true">Privacy</span>
<span class="text-body-sm text-surface/40" aria-disabled="true">Terms</span>
```
Or wire them to real (possibly one-liner) pages in Phase 2 wrap-up.

### WR-05: Tailwind utility conflict cancels italic on testimonial cite

**File:** `src/components/sections/TestimonialsSection.astro:56`
**Issue:** `class="not-italic font-serif italic text-body-md text-ink"` declares both `not-italic` (`font-style: normal`) and `italic` (`font-style: italic`). In Tailwind v4 these are sibling utilities with equal specificity, and the generated CSS order (grouped by utility family, alphabetical within the group) puts `not-italic` *after* `italic` — so `not-italic` wins and the client name renders non-italic despite the apparent intent and the `font-serif` pairing. The UI-SPEC locks the client name as italic serif.
**Fix:** Drop `not-italic`:
```astro
<cite class="font-serif italic text-body-md text-ink">{t.clientName}</cite>
```
If the original intent was to override the default italic rendering of `<cite>` (browsers italicize `<cite>` by default) *and* then re-apply italic via Tailwind, simply keep `italic` — it wins against the UA default via utility specificity.

### WR-06: Build-time risk from hardcoded service-area map path

**File:** `src/components/sections/ContactSection.astro:15, 80-91`
**Issue:** `mapImagePath = "/images/service-area-map.jpg"` is passed into `<Picture>`. Astro's image service will throw at build time if the file is missing or served from `public/` without proper remote-image configuration. The inline comment acknowledges the image "may be absent in placeholder era," but the current code will fail `pnpm build` in that case. The placeholder-coming-soon pattern used in `AboutSection.astro:40-62` (conditional render with a graceful fallback) is the established project convention and should be mirrored here.
**Fix:** Move the path into `site.md` (so the content editor can add/remove it) and conditionally render:
```astro
{site.serviceAreaMap ? (
  <Picture
    src={site.serviceAreaMap}
    alt={`Map showing our service area: ${site.address.city} and surrounding Bay Area cities.`}
    /* ...existing props... */
  />
) : (
  <div class="aspect-[4/3] w-full bg-clay/20 flex items-center justify-center rounded-lg">
    <span class="text-body-sm text-ink/60">Service-area map coming soon</span>
  </div>
)}
```
Update `siteSchema` with an optional `serviceAreaMap: z.string().optional()`.

## Info

### IN-01: Non-standard `#top` fragment in Nav wordmark

**File:** `src/components/Nav.astro:28`
**Issue:** `<a href="#top">` — there is no element with `id="top"` in the DOM. Browsers honor `#top` as a special keyword that scrolls to the page top, but some accessibility linters (axe, Wave) flag it as a broken fragment. The hero section is `id="hero"` and the main element is `id="main"`.
**Fix:** `href="#hero"` (matches the nav IntersectionObserver target in NavController.tsx:19) or `href="#main"` (matches the skip-link target in BaseLayout.astro:34).

### IN-02: Missing `tabindex="-1"` on inactive menu tabs (roving tabindex)

**File:** `src/components/MenuTabs.tsx:10-25` / `src/components/sections/MenuSection.astro:60-77`
**Issue:** The WAI-ARIA Authoring Practices "Tabs with Automatic Activation" pattern uses *roving tabindex*: the selected tab has `tabindex="0"`, all others have `tabindex="-1"`, and arrow keys move focus *and* selection. Currently every tab is focusable via Tab, which means a keyboard user must Tab through three stops instead of one. Arrow-key handling is implemented correctly; only the tabindex is missing.
**Fix:** In `MenuSection.astro`, render `tabindex={i === 0 ? 0 : -1}` on each tab button, and in `MenuTabs.tsx` `activate()` set the active tab's `tabindex="0"` and others' `tabindex="-1"`.

### IN-03: Lucide icons rendered with attribute-only `aria-hidden`

**File:** `src/components/NavController.tsx:134, 168`
**Issue:** `<X className="size-6" aria-hidden />` and `<Menu className="size-6" aria-hidden />` — JSX serializes the boolean `aria-hidden` as the string `""`. The ARIA spec requires `aria-hidden` to have the explicit value `"true"` (or `"false"`); an empty string is treated as the default value, which is "undefined" (neither true nor false). Most screen readers handle this gracefully, but it is not spec-compliant. All other icons in the codebase use `aria-hidden="true"`.
**Fix:** `<X className="size-6" aria-hidden="true" />` in both locations (and optionally elsewhere for consistency).

### IN-04: Focus-trap focusable selector is brittle

**File:** `src/components/NavController.tsx:100-102`
**Issue:** The Tab-trap selector `a[href], button, [tabindex]:not([tabindex="-1"])` misses `input`, `select`, `textarea`, `[contenteditable]`, and `summary` elements. Today's drawer contains only anchors and buttons so it works, but if a future change adds (e.g.) a search input or a disclosure inside the drawer, Tab will escape the trap into the background.
**Fix:** Adopt a more complete selector, e.g.:
```ts
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');
```

### IN-05: Type-assertion cast in GalleryGrid aspect-ratio parser

**File:** `src/components/GalleryGrid.tsx:29`
**Issue:** `r.split(":").map(Number) as [number, number]` uses an `as` assertion to satisfy the tuple return. Given the `AspectRatio` enum all values are `W:H`, this is safe at runtime — but under `noUncheckedIndexedAccess` (CLAUDE.md mandates it) the assertion sidesteps type-narrowing. A Zod-style parse or explicit destructure-then-validate keeps the invariant enforced.
**Fix:**
```ts
const [w, h] = r.split(":");
if (!w || !h) throw new Error(`Invalid aspect ratio: ${r}`);
const ratioW = Number(w);
const ratioH = Number(h);
```

### IN-06: Sequential `await` on content collection reads

**File:** `src/pages/index.astro:15-22`
**Issue:** Eight `await` statements run sequentially when they're fully independent. `Promise.all` parallelises the reads — on a build machine this is one or two hundred ms at most, but the pattern propagates to future sections.
**Fix:**
```astro
const [site, hero, about, menu, packages, testimonials, faqGroups, gallery] = await Promise.all([
  getEntry("site", "site"),
  getEntry("hero", "hero"),
  getEntry("about", "about"),
  getCollection("menu"),
  getCollection("packages"),
  getCollection("testimonials"),
  getCollection("faq"),
  getCollection("gallery"),
]);
// then .sort() the collection arrays as before
```

### IN-07: Redundant guard on GalleryGrid lightbox `open` prop

**File:** `src/components/GalleryGrid.tsx:96-106`
**Issue:** The `<Lightbox>` is mounted only when `lightboxIndex !== null` (line 96), then receives `open={lightboxIndex !== null}` (line 99). The inner guard is always `true` at render time. Minor — just noise.
**Fix:** `open={true}` or simply drop the prop if it defaults to `true` when the component is mounted (check `yet-another-react-lightbox` API — `open` is required, so keep it but hard-code `true`).

### IN-08: `<Picture>` hero image — `sizes="100vw"` + mobile-first widths

**File:** `src/components/sections/HeroSection.astro:22-28`
**Issue:** Not a bug — a note for the PERF-04 follow-up. With `widths={[640, 960, 1280, 1920, 2560]}` and `sizes="100vw"`, a mid-range desktop (1440px viewport, 2x DPR) will request the 2560 variant. That's correct for sharpness but heavy. Consider adding a `1440` width and a `(min-width: 1440px) 1440px, 100vw` sizes hint once real device analytics are in Vercel Speed Insights.

---

_Reviewed: 2026-04-16T16:48:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
