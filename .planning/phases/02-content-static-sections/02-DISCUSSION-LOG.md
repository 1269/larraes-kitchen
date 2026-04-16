# Phase 2: Content & Static Sections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 02-content-static-sections
**Areas discussed:** Hero treatment, Menu presentation, Gallery & lightbox, Navigation & scroll

---

## Hero Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Full-bleed cinematic | Photo spans edge-to-edge, full viewport height. Text + CTA float over image with gradient scrim. | ✓ |
| Contained with cream surround | Photo within a bounded frame on warm-cream background. Text outside image. | |
| Split layout | Photo on one side, text on the other. Clean editorial, avoids contrast issues. | |

**User's choice:** Full-bleed cinematic
**Notes:** Maximum visual impact, matches Sweetgreen editorial feel

| Option | Description | Selected |
|--------|-------------|----------|
| Center-aligned overlay | Headline, subheadline, CTA, price chip centered over photo. Bottom gradient scrim. | ✓ |
| Bottom-left editorial | Text anchored to lower-left with heavier gradient. | |
| Bottom full-width bar | Solid/semi-transparent bar across bottom. Guaranteed AA contrast. | |

**User's choice:** Center-aligned overlay
**Notes:** Clean, focused — one clear focal point

| Option | Description | Selected |
|--------|-------------|----------|
| Pill badge above CTA | Small pill-shaped badge (butter-gold bg, iron-black text) above the CTA button. | ✓ |
| Inline with subheadline | Price woven into subheadline text. No separate visual element. | |
| Floating corner badge | Small badge pinned to a corner of the hero. | |

**User's choice:** Pill badge above CTA
**Notes:** Subtle but visible, sets price expectation without competing with headline

| Option | Description | Selected |
|--------|-------------|----------|
| Full viewport height (100vh) | Hero fills 100vh on mobile too. Photo crops to taller aspect ratio. | ✓ |
| Compressed (60-70vh) | Hero takes ~65% of viewport. Content below peeks into view. | |
| You decide | Let Claude pick based on placeholder photo cropping. | |

**User's choice:** Full viewport height (100vh)
**Notes:** Immersive first impression, user must scroll to see content

---

## Menu Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed sections | Three horizontal tabs (Proteins, Sides, Desserts). One category at a time. | ✓ |
| All categories stacked | All three visible at once, stacked vertically. Longer scroll. | |
| Horizontal scroll per category | Each category as a horizontal scrollable row. | |

**User's choice:** Tabbed sections
**Notes:** Compact, familiar restaurant-menu UX

| Option | Description | Selected |
|--------|-------------|----------|
| Clean list | Each dish as a row: Playfair italic name, description, dietary icons. No cards/photos. | ✓ |
| Photo cards grid | Each dish as a card with photo. 2-col mobile, 3-col desktop. | |
| You decide | Let Claude pick based on placeholder data. | |

**User's choice:** Clean list
**Notes:** Elegant restaurant-menu feel, matches editorial discipline

| Option | Description | Selected |
|--------|-------------|----------|
| One hero image per category | Single atmospheric photo at top of each tab. 3 photos total. | ✓ |
| No section photos | Pure text menu. Photography lives in Gallery. | |
| Per-dish optional photos | Show when available, degrade to text-only when missing. | |

**User's choice:** One hero image per category
**Notes:** Sets mood without requiring per-dish photography, placeholder-friendly

| Option | Description | Selected |
|--------|-------------|----------|
| Small icon badges | Tiny colored icons/pills next to dish name (leaf, crossed milk, etc.). | ✓ |
| Text tags | Written labels like "V" or "DF" in muted color. | |
| Legend at section top | Icons explained in legend bar; dishes show only the icon. | |

**User's choice:** Small icon badges
**Notes:** Visual and scannable without cluttering elegant list layout

---

## Gallery & Lightbox

| Option | Description | Selected |
|--------|-------------|----------|
| Show 8-12 images | Curated initial view. "View all" button loads the rest. | ✓ |
| Show all 15-25 images | Full gallery visible immediately. No extra click. | |
| Show 4-6 with prominent "See more" | Teaser grid with clear CTA to expand. | |

**User's choice:** Show 8-12 images
**Notes:** Curated highlight reel keeps scroll section tight

| Option | Description | Selected |
|--------|-------------|----------|
| Natural aspect ratios | Each image keeps original proportions. Organic masonry feel. | ✓ |
| Uniform cropped squares | All images 1:1 for Instagram-style grid. | |
| Mixed with constraints | Natural but clamped to a range (no extreme outliers). | |

**User's choice:** Natural aspect ratios
**Notes:** Editorial variety, react-photo-album handles natively

| Option | Description | Selected |
|--------|-------------|----------|
| Photo + caption + counter | Fullscreen with caption overlay and "3 of 12" counter. Keyboard nav. | ✓ |
| Photo only, minimal chrome | Just photo on dark backdrop with close button. | |
| Photo + caption + thumbnails | Full lightbox with thumbnail strip for quick jumping. | |

**User's choice:** Photo + caption + counter
**Notes:** Clean and focused; yet-another-react-lightbox supports out of the box

---

## Navigation & Scroll

| Option | Description | Selected |
|--------|-------------|----------|
| Transparent → solid on scroll | Starts transparent over hero, transitions to solid warm-cream past hero. | ✓ |
| Always solid | Always warm-cream with dark text, even over hero. | |
| Shrink on scroll | Starts tall, shrinks to compact bar on scroll. | |

**User's choice:** Transparent → solid on scroll
**Notes:** Immersive hero with functional nav after scrolling

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger → slide-in drawer | Full-height drawer from right with all links + CTA. | ✓ |
| Bottom sheet | Slides up from bottom as half-screen sheet. | |
| Inline expand | Links toggle below header bar, pushing content down. | |

**User's choice:** Hamburger → slide-in drawer
**Notes:** Familiar pattern, plenty of room for 8 section links + CTA

| Option | Description | Selected |
|--------|-------------|----------|
| Underline active link | Green underline on currently visible section's nav link. IntersectionObserver. | ✓ |
| Subtle bold text only | Active link gets bolder weight, no color/underline. | |
| No active highlighting | Static nav links, no scroll-position indication. | |

**User's choice:** Underline active link
**Notes:** Gives sense of place on long single-page scroll

| Option | Description | Selected |
|--------|-------------|----------|
| Smooth scroll | CSS scroll-behavior: smooth. Respects prefers-reduced-motion (LAYT-06). | ✓ |
| Instant jump | Snaps instantly to section. No animation. | |
| You decide | Let Claude pick. | |

**User's choice:** Smooth scroll
**Notes:** Native CSS, no JS needed. Falls back to instant jump for reduced-motion preference.

---

## Claude's Discretion

- Packages card styling (understated chrome, "Most Popular" badge)
- Testimonials grid layout (static grid, 3 persona segments)
- FAQ accordion implementation (native details/summary vs shadcn)
- About section layout (heritage narrative + chef portrait)
- Contact section layout (NAP, static map)
- Placeholder photography strategy
- Footer content and layout
- Section spacing and whitespace rhythm
- Responsive breakpoint behavior per section

## Deferred Ideas

None — discussion stayed within phase scope
