# Phase 2: Content & Static Sections - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Author canonical markdown content (especially the packages pricing that Phase 3 consumes) and render all eight static sections of the single-page scroll — Hero, About, Menu, Packages, Gallery, Testimonials, FAQ, Contact — with the photography pipeline, responsive layout, and sticky navigation in place. No interactive features (wizard, form submission, lead pipeline) are built here.

</domain>

<decisions>
## Implementation Decisions

### Hero Treatment
- **D-01:** Full-bleed cinematic hero — food photo spans edge-to-edge, full viewport height on desktop and mobile (100vh). Photo crops via `object-fit: cover` for different aspect ratios.
- **D-02:** Center-aligned text overlay — headline, subheadline, CTA, and price chip centered vertically and horizontally over the photo. Bottom gradient scrim ensures WCAG AA contrast (HERO-05).
- **D-03:** Price chip as pill badge above CTA — small pill-shaped badge (butter-gold background, iron-black text) sitting just above the green CTA button. Sets price expectation without competing with the headline.
- **D-04:** Full 100vh on mobile — hero fills the full viewport on all devices. Content below is revealed only by scrolling. Maximizes cinematic first impression.

### Menu Presentation
- **D-05:** Tabbed category navigation — three horizontal tabs (Proteins | Sides | Desserts) at the top of the menu section. Clicking a tab shows that category. Keeps the section compact; user sees one category at a time.
- **D-06:** Clean list layout for dishes — each dish as a row with Playfair italic name on the left, 1-line description below, dietary icons on the right. No cards or per-dish photos. Elegant restaurant-menu feel matching editorial discipline.
- **D-07:** One hero image per category tab — a single atmospheric photo at the top of each category (e.g., cast-iron skillet for Proteins). 3 photos total, placeholder-friendly.
- **D-08:** Small icon badges for dietary indicators — tiny colored icon pills next to each dish name (leaf for vegetarian, crossed-out milk for dairy-free, etc.). Visual and scannable without cluttering the list.

### Gallery & Lightbox
- **D-09:** Show 8-12 images initially with "View All" button — curated initial grid conveying variety (table settings, plated food, events). "View all" loads the remaining images. Keeps the scroll section tight.
- **D-10:** Natural aspect ratios in masonry grid — each image keeps its original proportions. react-photo-album handles this natively. Aspect ratio declared in frontmatter (GAL-02) to prevent CLS.
- **D-11:** Lightbox with photo + caption + counter — fullscreen photo with optional caption overlay at bottom and "3 of 12" counter. Keyboard navigation (arrows, Escape). yet-another-react-lightbox provides this out of the box.

### Navigation & Scroll
- **D-12:** Transparent-to-solid nav on scroll — nav starts transparent over the hero (white text/logo), transitions to solid warm-cream background with dark text once user scrolls past the hero. Matches the full-bleed cinematic hero.
- **D-13:** Hamburger slide-in drawer on mobile — classic hamburger icon opens a full-height drawer from the right with all 8 section anchor links + "Get a Quote" CTA. Closes on link tap or outside click.
- **D-14:** Active section underline in nav — as the user scrolls, the nav link for the currently visible section gets a green underline. Uses IntersectionObserver (no scroll listener jank). Gives a sense of place on the long single-page scroll.
- **D-15:** Smooth scroll with reduced-motion fallback — CSS `scroll-behavior: smooth` on the html element. Clicking a nav link smoothly animates to the section. Falls back to instant jump when `prefers-reduced-motion` is set (LAYT-06).

### Claude's Discretion
- Packages card styling (understated chrome per PKG-05, "Most Popular" badge on Medium per PKG-03)
- Testimonials grid layout (static grid covering all 3 persona segments per TEST-04)
- FAQ accordion implementation (native `<details>/<summary>` vs shadcn Accordion per FAQ-02)
- About section layout (heritage narrative + chef portrait placement per ABOUT-01..03)
- Contact section layout (NAP from site.md, static service-area map image per CONTACT-01..05)
- Placeholder photography sourcing strategy (stock images for v1 launch)
- Footer content and layout
- Section spacing and whitespace rhythm between the 8 sections
- Responsive breakpoint behavior for each section (mobile ≤640px, tablet ≤1024px, desktop)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack & Architecture
- `.planning/research/STACK.md` — Definitive stack with version pins; includes react-photo-album, yet-another-react-lightbox, shadcn/ui component strategy
- `.planning/research/ARCHITECTURE.md` — Source layout, content collection patterns, component structure
- `.planning/research/FEATURES.md` — Feature catalog with phase mapping

### Project Constraints
- `.planning/PROJECT.md` — Core value, brand palette, typography (Lovelace/Playfair/Work Sans), Sweetgreen editorial rhythm (structural only), warm soul food palette non-negotiable
- `.planning/REQUIREMENTS.md` §"Content Schema & Authoring" — CONT-01 through CONT-09
- `.planning/REQUIREMENTS.md` §"Layout & Navigation" — LAYT-01 through LAYT-06
- `.planning/REQUIREMENTS.md` §"Hero Section" — HERO-01 through HERO-05
- `.planning/REQUIREMENTS.md` §"About Section" — ABOUT-01 through ABOUT-03
- `.planning/REQUIREMENTS.md` §"Menu Section" — MENU-01 through MENU-04
- `.planning/REQUIREMENTS.md` §"Packages Section" — PKG-01 through PKG-05
- `.planning/REQUIREMENTS.md` §"Gallery Section" — GAL-01 through GAL-06
- `.planning/REQUIREMENTS.md` §"Testimonials Section" — TEST-01 through TEST-04
- `.planning/REQUIREMENTS.md` §"FAQ Section" — FAQ-01 through FAQ-04
- `.planning/REQUIREMENTS.md` §"Contact Section" — CONTACT-01 through CONTACT-05

### Phase 1 Foundation
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design tokens (D-01..D-04), schema locations (D-05), repo skeleton (D-07), shadcn Button only (D-08), editorial typography scale
- `.planning/research/PITFALLS.md` — Known traps including image-budget rationale, hero text-over-image contrast

### State
- `.planning/STATE.md` — Resolved decisions: package tiers (10–20 / 21–30 / 31–75), placeholder photography for v1, placeholder testimonials

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **shadcn Button** (`src/components/ui/button.tsx`): Pre-installed in Phase 1; use for hero CTA, package card CTAs, gallery "View All" button, and nav "Get a Quote" CTA
- **Design tokens** (`src/styles/global.css`): Full brand palette (deep-amber, warm-cream, greens-deep/mid, iron-black, southern-red, butter-gold, clay) + semantic layer (primary, surface, accent, ink) + editorial type scale (display-xl through eyebrow)
- **Zod schemas** (`src/lib/schemas/*.ts`): All 8 content type schemas defined — site, hero, about, menu, packages, testimonials, faq, gallery
- **Content Collections** (`src/content.config.ts`): All 8 collections configured with glob loaders pointing to `src/content/{type}/`

### Established Patterns
- **Two-layer tokens**: Components reference semantic tokens (`text-ink`, `bg-surface`, `border-accent`), not raw brand names
- **Editorial type scale**: Named tokens (`text-display-xl`, `text-display-lg`, `text-display-md`, `text-body-lg/md/sm`, `text-eyebrow`) enforce typographic discipline
- **Self-hosted fonts**: Fontsource for Playfair Display + Work Sans; Lovelace via manual `@font-face` from `/public/fonts/`
- **Astro Content Collections with Zod**: All content is typed markdown; `astro sync` validates schemas in CI

### Integration Points
- **`src/pages/index.astro`**: Currently a placeholder; Phase 2 composes all 8 section components here in order (LAYT-04)
- **`src/content/` directories**: Empty but scaffolded; Phase 2 authors the actual `.md` files
- **`src/components/sections/`**: Empty directory ready for section components (HeroSection, AboutSection, etc.)
- **Package schema** (`src/lib/schemas/packages.ts`): Defines `guestRange`, `pricePerPerson`, `includes`, `popular`, `order` — Phase 3's wizard consumes this data

</code_context>

<specifics>
## Specific Ideas

- Hero should feel cinematic and immersive — the food photo IS the first impression, text floats over it, not beside it
- Menu should feel like a real restaurant menu — clean typography-led list, not a web app card grid. Playfair italic for dish names per MENU-03
- Gallery should feel curated, not exhaustive — show a highlight reel initially, let interested visitors expand
- Nav transparent-to-solid transition creates a seamless hero-to-content experience — hero photo has no visible chrome interrupting it
- Price chip in butter-gold creates a warm visual callout that doesn't compete with the green CTA

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-content-static-sections*
*Context gathered: 2026-04-15*
