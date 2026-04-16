# Phase 2: Content & Static Sections - Pattern Map

**Mapped:** 2026-04-15
**Files analyzed:** 29 (new) + 2 (modified)
**Analogs found:** 31 / 31 — **greenfield repo, contracts come from Zod schemas + UI-SPEC, not existing code analogs**

> **Greenfield note.** There are no existing section components, content files, or React islands in this repo to copy from. The nearest-existing analogs for Phase 2 files are **contracts, not implementations**:
> - **Zod schemas** in `src/lib/schemas/*.ts` are the AUTHORITATIVE shape for every markdown content file and the TypeScript shape of every component prop.
> - **UI-SPEC** (`.planning/phases/02-content-static-sections/02-UI-SPEC.md`) is the AUTHORITATIVE visual/structural contract for every component.
> - **shadcn Button** (`src/components/ui/button.tsx`) is the only pre-installed component and the ONLY analog for "how we write a React component in this repo" (tokens, `cn()`, `radix-ui` slot pattern, `data-slot` hook).
>
> For each file below, the pattern map cites **(a) the Zod schema that locks its shape** and **(b) the UI-SPEC section that locks its render**. The planner MUST read both before writing code.

---

## File Classification

### Modified files (2)

| File | Role | Data Flow | Reason for touch |
|------|------|-----------|------------------|
| `src/pages/index.astro` | composition / route | request-response (SSG) | Wipe placeholder body; compose all 8 sections + Nav + Footer in LAYT-04 order, pull collection data via `getCollection()` / `getEntry()`. |
| `src/layouts/BaseLayout.astro` | layout | request-response (SSG) | **New file** inside modified directory (currently only `.gitkeep`). Holds `<html>/<head>/<body>`, Fontsource imports, global CSS import, `<Nav />` + `<Footer />` slots, skip link, `scroll-padding-top`, `scroll-behavior: smooth` + reduced-motion fallback. |

### New content files (20)

| File | Role | Data Flow | Schema Contract | Match Quality |
|------|------|-----------|-----------------|---------------|
| `src/content/site/site.md` | content entry | build-time parse | `siteSchema` → `src/lib/schemas/site.ts` | exact (schema-driven) |
| `src/content/hero/hero.md` | content entry | build-time parse | `heroSchema` → `src/lib/schemas/hero.ts` | exact |
| `src/content/about/about.md` | content entry | build-time parse | `aboutSchema` → `src/lib/schemas/about.ts` | exact |
| `src/content/menu/proteins/*.md` (≥3 items) | content entry | build-time parse | `menuItemSchema` (`category: "proteins"`) | exact |
| `src/content/menu/sides/*.md` (≥3 items) | content entry | build-time parse | `menuItemSchema` (`category: "sides"`) | exact |
| `src/content/menu/desserts/*.md` (≥2 items) | content entry | build-time parse | `menuItemSchema` (`category: "desserts"`) | exact |
| `src/content/packages/small.md` | content entry | build-time parse | `packageSchema` (`id: "small"`, `guestRange: 10..20`) | exact |
| `src/content/packages/medium.md` | content entry | build-time parse | `packageSchema` (`id: "medium"`, `popular: true`, `guestRange: 21..30`) | exact |
| `src/content/packages/large.md` | content entry | build-time parse | `packageSchema` (`id: "large"`, `guestRange: 31..75`) | exact |
| `src/content/testimonials/*.md` (≥3 entries, one per `eventType` of family/social/corporate) | content entry | build-time parse | `testimonialSchema` | exact |
| `src/content/faq/ordering.md` | content entry | build-time parse | `faqGroupSchema` (`category: "ordering"`) | exact |
| `src/content/faq/delivery.md` | content entry | build-time parse | `faqGroupSchema` (`category: "delivery"`) | exact |
| `src/content/faq/menu-customization.md` | content entry | build-time parse | `faqGroupSchema` (`category: "menu-customization"`) | exact |
| `src/content/faq/payment.md` | content entry | build-time parse | `faqGroupSchema` (`category: "payment"`) | exact |
| `src/content/gallery/*.md` (≥10 entries) | content entry | build-time parse | `gallerySchema` | exact |

### New Astro section components (8)

| File | Role | Data Flow | Primary Contract | Match Quality |
|------|------|-----------|------------------|---------------|
| `src/components/sections/HeroSection.astro` | section (static) | SSG render | UI-SPEC §2 + `heroSchema` | greenfield — schema-driven |
| `src/components/sections/AboutSection.astro` | section (static) | SSG render | UI-SPEC §3 + `aboutSchema` | greenfield |
| `src/components/sections/MenuSection.astro` | section (static shell) | SSG render + mounts `MenuTabs` island | UI-SPEC §4 + `menuItemSchema` (grouped by `category`) | greenfield |
| `src/components/sections/PackagesSection.astro` | section (static) | SSG render | UI-SPEC §5 + `packageSchema` (sorted by `order`) | greenfield |
| `src/components/sections/GallerySection.astro` | section (static shell) | SSG render + mounts `GalleryGrid` island | UI-SPEC §6 + `gallerySchema` | greenfield |
| `src/components/sections/TestimonialsSection.astro` | section (static) | SSG render | UI-SPEC §7 + `testimonialSchema` | greenfield |
| `src/components/sections/FaqSection.astro` | section (static, zero-JS) | SSG render with native `<details>/<summary>` | UI-SPEC §8 + `faqGroupSchema` (4 category groups in order) | greenfield |
| `src/components/sections/ContactSection.astro` | section (static) | SSG render | UI-SPEC §9 + `siteSchema` | greenfield |

### New nav + footer (3)

| File | Role | Data Flow | Primary Contract | Match Quality |
|------|------|-----------|------------------|---------------|
| `src/components/Nav.astro` | nav shell (static) | SSG render, mounts `NavController` island | UI-SPEC §1 + D-12..D-14 | greenfield |
| `src/components/NavController.tsx` | React island | event-driven (IntersectionObserver, drawer state) | UI-SPEC §1 state machine + D-13 mobile drawer | greenfield |
| `src/components/Footer.astro` | footer (static) | SSG render | UI-SPEC §10 + `siteSchema` | greenfield |

### New React islands (2)

| File | Role | Data Flow | Primary Contract | Match Quality |
|------|------|-----------|------------------|---------------|
| `src/components/MenuTabs.tsx` | React island (interactivity) | event-driven (tab state, arrow-key nav, fade transitions) | UI-SPEC §4 tabs + D-05 | greenfield |
| `src/components/GalleryGrid.tsx` | React island (wraps `react-photo-album` + `yet-another-react-lightbox`) | event-driven (expand state, lightbox open/close, keyboard nav) | UI-SPEC §6 + D-09..D-11 | greenfield |

### New utility (1)

| File | Role | Data Flow | Primary Contract | Match Quality |
|------|------|-----------|------------------|---------------|
| `src/lib/format.ts` | utility | pure function | UI-SPEC §Copywriting Contract `formatPhone()` (3-line function mapping `5105550123` → `(510) 555-0123`) | greenfield |

---

## Pattern Assignments

For every file the pattern is driven by **(schema × UI-SPEC)** — not by prior code. Every assignment below cites both.

---

### `src/content/site/site.md` (content entry, CRUD-at-build)

**Schema contract:** `src/lib/schemas/site.ts` lines 3-32

```typescript
export const siteSchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string().default("US"),
  }),
  phone: z.string(),
  email: z.string().email(),
  serviceArea: z.array(z.string()).min(1),
  hours: z.array(z.object({ days, open, close })),
  social: z.object({ instagram?, facebook?, google? }).default({}),
  leadTimeDays: z.number().int().positive().default(7),
  blackoutDates: z.array(z.string()).default([]),
  responseTime: z.string().default("We respond within 24 hours"),
});
```

**Content loader path:** `src/content.config.ts` line 13-16 — `base: "./src/content/site", pattern: "**/*.md"`. File MUST live at `src/content/site/site.md` (or any `.md` under `src/content/site/`). Collection is keyed by file slug.

**Frontmatter shape pattern:**
```markdown
---
name: "Larrae's Kitchen"
address:
  street: "<street>"
  city: "Benicia"
  region: "CA"
  postalCode: "94510"
phone: "5105550123"   # digits only — formatPhone() styles on display
email: "hello@larraeskitchen.com"
serviceArea:
  - "Benicia"
  - "Vallejo"
  - "Martinez"
  - "Concord"
hours:
  - days: "Mon–Fri"
    open: "09:00"
    close: "18:00"
social:
  instagram: "https://instagram.com/..."
leadTimeDays: 7
responseTime: "We respond within 24 hours"
---
```

**Consumer references (so copy-paste edits stay consistent):**
- Nav wordmark ← `site.name`
- Contact phone/email/service area ← `site.phone / site.email / site.serviceArea` (UI-SPEC §9)
- Footer NAP echo ← `site.address / site.phone / site.email / site.hours / site.social` (UI-SPEC §10)
- JSON-LD (Phase 4) ← entire record

**Anti-patterns to reject:**
- Copy-pasting phone/address into Nav/Footer components (C5 — source of truth is `site.md` only; LAYT-04 success criterion).
- Formatting phone in the markdown (`(510) 555-0123`) — belongs in `formatPhone()` display utility.

---

### `src/content/hero/hero.md` (content entry)

**Schema:** `src/lib/schemas/hero.ts` lines 3-10

```typescript
export const heroSchema = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  ctaText: z.string(),
  priceChip: z.string(),
  heroImage: z.string(),      // /images/hero/<file>.jpg
  heroImageAlt: z.string(),
});
```

**Frontmatter pattern:**
```markdown
---
headline: "Soul food that shows up."
subheadline: "Authentic catering for Benicia events — from backyard gatherings to boardroom lunches."
ctaText: "Start your quote"       # UI-SPEC §Copywriting recommends this exact string
priceChip: "From $18 per person"  # NOTE: $18 must match min across packages — computed in Phase 2 QA, not hardcoded blindly
heroImage: "/images/hero/hero.jpg"
heroImageAlt: "Golden cast-iron skillet of smothered chicken on a linen tablecloth."
---
```

**Image delivery pattern (UI-SPEC §2 + §Image Treatment Rules):**
- Path: `/images/hero/hero.jpg` — file lives at `public/images/hero/hero.jpg`
- Budget: <600 KB (FND-09, CI gate)
- Astro `<Image>` with `priority`, `widths=[640,960,1280,1920,2560]`, `sizes="100vw"`, `format=["avif","webp"]`
- EXACTLY ONE `priority` image per page (PERF-04) — this is it

**Anti-patterns:**
- Multiple `priority` images (violates PERF-04).
- Missing `heroImageAlt` (schema required; build fails).
- Hardcoding "$18" in a component when packages might change — always read from `packageSchema.pricePerPerson.min` across all packages.

---

### `src/content/about/about.md` (content entry)

**Schema:** `src/lib/schemas/about.ts` lines 3-8

```typescript
export const aboutSchema = z.object({
  heritageNarrative: z.string().min(150).max(2500),  // 150-char floor = narrative, not bio blurb
  positioning: z.string(),
  chefPortrait: z.string().optional(),
  chefPortraitAlt: z.string().optional(),
});
```

**Frontmatter + body pattern:** `heritageNarrative` is a long string — the schema puts it in frontmatter, not markdown body. Phase 2 author MUST escape newlines (`\n\n`) or use YAML block literal `|`. Alternative: move to body + schema change (OUT OF SCOPE Phase 2 — schema is locked).

```markdown
---
heritageNarrative: |
  Larrae grew up in [her grandmother's kitchen in Louisiana], where…
  (two-three paragraphs, 150–2500 chars)
positioning: "Benicia's only soul food specialist."
chefPortrait: "/images/about/chef-portrait.jpg"
chefPortraitAlt: "Chef Larrae standing at her kitchen counter, smiling."
---
```

**Consumer render contract:** UI-SPEC §3. Narrative paragraphs split on `\n\n` and wrapped in `<p class="text-body-lg leading-[1.7]">`. If `chefPortrait` is absent, render empty-state placeholder (UI-SPEC §3 "Empty state").

**Anti-patterns:**
- Narrative <150 chars (schema fails at build; CI blocks merge — this is the intent).
- Using MDX for this file — schema uses plain string, not markdown content body. `@astrojs/mdx` is installed but this field does NOT flow through the MDX pipeline.

---

### `src/content/menu/{proteins,sides,desserts}/*.md` (content entries, one per dish)

**Schema:** `src/lib/schemas/menu.ts` lines 3-13

```typescript
export const menuItemSchema = z.object({
  name: z.string(),
  category: z.enum(["proteins", "sides", "desserts"]),
  description: z.string(),
  dietary: z.array(z.enum(["vegetarian","vegan","gluten-free","dairy-free","nut-free"])).default([]),
  photo: z.string().optional(),
  photoAlt: z.string().optional(),
  order: z.number().int(),
});
```

**Directory convention:** The `category` field is authoritative for grouping; the subdirectory `proteins/sides/desserts` is organizational but the component groups by `category` field, NOT by path. Authors MUST still put the file in the matching subdir to keep the repo navigable, AND set `category` correctly. Lint suggestion: a script could enforce `dirname(path) === category`, but not required Phase 2.

**Frontmatter pattern (one file per dish):**
```markdown
---
name: "Smothered Chicken"
category: "proteins"
description: "Slow-cooked bone-in chicken with caramelized onion gravy."
dietary: ["gluten-free"]   # empty array okay; omit for default []
photo: "/images/menu/proteins/smothered-chicken.jpg"   # optional; category hero uses first item with photo
photoAlt: "Cast-iron skillet of smothered chicken in rich gravy."
order: 1
---
```

**Counts (UI-SPEC §4 content):**
- Proteins: ≥3 items (recommend 4–5 for variety)
- Sides: ≥3 items (recommend 4–5)
- Desserts: ≥2 items (recommend 3)
- Total: ≥10 items for meaningful menu section

**Category hero image rule (UI-SPEC §4 LOCKED):** First item per category with `photo` set becomes the category hero. If none has a photo → category hero image is omitted (graceful empty state).

**Anti-patterns:**
- Setting `photo` without `photoAlt` — schema allows this (both are optional individually) but UI-SPEC §Alt Text Rules REQUIRES `photoAlt` if `photo` is present. Enforce in code review.
- Non-integer `order` (schema fails).
- Mismatched `category` vs subdir (confusing for humans; not technically broken).

---

### `src/content/packages/{small,medium,large}.md` (content entries, exactly 3)

**Schema:** `src/lib/schemas/packages.ts` lines 4-22

```typescript
export const packageSchema = z.object({
  id: z.enum(["small", "medium", "large"]),
  name: z.string(),
  guestRange: z.object({ min, max }).refine(r => r.min <= r.max),
  pricePerPerson: z.object({ min, max }).refine(r => r.min <= r.max),
  includes: z.array(z.string()).min(1),
  popular: z.boolean().default(false),
  order: z.number().int(),
});
```

**Tier locked values (STATE.md resolved + CONTEXT):**
| File | id | name | guestRange | popular | order |
|------|----|----|--------|---------|-------|
| `small.md` | `"small"` | `"Small"` | `{min:10, max:20}` | `false` | `1` |
| `medium.md` | `"medium"` | `"Medium"` | `{min:21, max:30}` | `true` | `2` |
| `large.md` | `"large"` | `"Large"` | `{min:31, max:75}` | `false` | `3` |

**Price ranges** are Claude's discretion at content authoring — recommend:
- Small: `{min: 22, max: 28}` (premium per-person at low volume)
- Medium: `{min: 20, max: 26}`
- Large: `{min: 18, max: 24}` → sets the "From $18" hero price chip floor

**Consumer references (CRITICAL — Phase 3 depends on this data):**
- UI-SPEC §5 PackagesSection renders tier cards
- Phase 3 wizard imports `packageSchema` for form validation + estimate
- `estimate()` function reads `pricePerPerson` per tier
- Hero price chip min = `Math.min(...allPackages.map(p => p.pricePerPerson.min))` computed at build time

**Anti-patterns:**
- `popular: true` on more than one tier (multiple "Most Popular" badges; CI won't catch — code review must).
- Non-sequential `order` (e.g., 1, 3, 5) — not broken but visually surprising.
- `min > max` (schema `.refine()` fails at build).

---

### `src/content/testimonials/*.md` (content entries, ≥3)

**Schema:** `src/lib/schemas/testimonials.ts` lines 3-9

```typescript
export const testimonialSchema = z.object({
  clientName: z.string(),
  eventType: z.enum(["family", "social", "corporate", "other"]),
  quote: z.string(),
  rating: z.number().int().min(1).max(5),
  order: z.number().int(),
});
```

**Persona coverage (TEST-04):** ≥3 testimonials with at least one each of `family`, `social`, `corporate`.

**Frontmatter pattern:**
```markdown
---
clientName: "Cynthia R."
eventType: "family"
quote: "Larrae catered our daughter's baby shower for 22 people and somehow made it feel like a family reunion."
rating: 5
order: 1
---
```

**Event type → label map (UI-SPEC §7):**
- `family` → "Family celebration"
- `social` → "Social gathering"
- `corporate` → "Corporate event"
- `other` → "Private event"

**Placeholder posture (STATE.md):** v1 launches with placeholder testimonials; they render identically to real ones. No visual "stub" treatment.

**Anti-patterns:**
- Non-integer rating (schema fails).
- Quote with literal curly quotes (`"` `"`) — store plain double-quotes; component adds typographic quotes on render.

---

### `src/content/faq/{ordering,delivery,menu-customization,payment}.md` (exactly 4 files)

**Schema:** `src/lib/schemas/faq.ts` lines 3-14

```typescript
export const faqGroupSchema = z.object({
  category: z.enum(["ordering", "delivery", "menu-customization", "payment"]),
  order: z.number().int(),
  questions: z.array(z.object({ question, answer })).min(1),
});
```

**File ↔ category mapping (LOCKED):**
| File | category | order |
|------|----------|-------|
| `ordering.md` | `"ordering"` | 1 |
| `delivery.md` | `"delivery"` | 2 |
| `menu-customization.md` | `"menu-customization"` | 3 |
| `payment.md` | `"payment"` | 4 |

**Frontmatter pattern:**
```markdown
---
category: "ordering"
order: 1
questions:
  - question: "How far in advance should I book?"
    answer: "We recommend at least 7 days for most events, 14+ for parties over 40."
  - question: "Can I adjust guest count after booking?"
    answer: "Yes, up to 72 hours before the event."
---
```

**Render contract:** UI-SPEC §8 — native `<details>/<summary>`, zero-JS fallback (FAQ-02), chevron rotates via CSS `group-open:rotate-180`.

**Category label map (UI-SPEC §8):**
- `ordering` → "Ordering"
- `delivery` → "Delivery & setup"
- `menu-customization` → "Menu customization"
- `payment` → "Payment"

**Anti-patterns:**
- Using shadcn Accordion — UI-SPEC §Registry Safety LOCKS: "Do NOT install accordion."
- Plain markdown `answer` getting rich HTML in the render — Phase 2 renders as plain text / simple Astro `set:html` from processed markdown ONLY if we wire remark; simpler: plain text with no markdown.
- Empty `questions` array (schema `.min(1)` fails).

---

### `src/content/gallery/*.md` (content entries, ≥10)

**Schema:** `src/lib/schemas/gallery.ts` lines 3-9

```typescript
export const gallerySchema = z.object({
  image: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  aspectRatio: z.enum(["1:1","4:3","3:2","16:9","3:4","2:3","9:16"]),
  order: z.number().int(),
});
```

**Frontmatter pattern (one file per image):**
```markdown
---
image: "/images/gallery/table-setting-01.jpg"
alt: "Long farmhouse table set for 20, dishes of smothered chicken and greens."
caption: "Family reunion, Benicia — July 2025"   # optional
aspectRatio: "3:2"
order: 1
---
```

**Count:** ≥10 for meaningful masonry grid. UI-SPEC §6 LOCKS initial reveal at 10 with "View All" expanding the rest.

**Aspect ratio discipline (GAL-02, CLS = 0):** The schema `aspectRatio` reserves grid space before image loads. Authors MUST declare the aspect that matches the actual file. Mismatches cause CLS.

**Anti-patterns:**
- Missing `alt` (schema fails).
- `aspectRatio: "2:3"` on an actually-landscape photo (CLS on load — not schema-caught, requires human review).
- Empty `caption: ""` instead of omitting — prefer omission; caption rendered conditionally.

---

### `src/pages/index.astro` (route composition, MODIFIED)

**Current content:** placeholder body with a single `<h1>`.

**Target pattern (UI-SPEC §Section Order + ARCHITECTURE §3):**

```astro
---
import { getCollection, getEntry } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import HeroSection from "@/components/sections/HeroSection.astro";
import AboutSection from "@/components/sections/AboutSection.astro";
import MenuSection from "@/components/sections/MenuSection.astro";
import PackagesSection from "@/components/sections/PackagesSection.astro";
import GallerySection from "@/components/sections/GallerySection.astro";
import TestimonialsSection from "@/components/sections/TestimonialsSection.astro";
import FaqSection from "@/components/sections/FaqSection.astro";
import ContactSection from "@/components/sections/ContactSection.astro";

export const prerender = true;   // SSG

const site = await getEntry("site", "site");          // single-entry collection
const hero = await getEntry("hero", "hero");
const about = await getEntry("about", "about");
const menu = (await getCollection("menu")).sort((a, b) => a.data.order - b.data.order);
const packages = (await getCollection("packages")).sort((a, b) => a.data.order - b.data.order);
const testimonials = (await getCollection("testimonials")).sort((a, b) => a.data.order - b.data.order);
const faqGroups = (await getCollection("faq")).sort((a, b) => a.data.order - b.data.order);
const gallery = (await getCollection("gallery")).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout site={site.data}>
  <HeroSection id="hero" hero={hero.data} packages={packages.map(p => p.data)} />
  <AboutSection id="about" about={about.data} />
  <MenuSection id="menu" menu={menu.map(m => m.data)} />
  <PackagesSection id="packages" packages={packages.map(p => p.data)} />
  <GallerySection id="gallery" gallery={gallery.map(g => g.data)} />
  <TestimonialsSection id="testimonials" testimonials={testimonials.map(t => t.data)} />
  <FaqSection id="faq" faqGroups={faqGroups.map(f => f.data)} />
  <ContactSection id="contact" site={site.data} />
</BaseLayout>
```

**Critical:**
- `prerender = true` — this page is SSG, not server-rendered. The `output: 'server'` adapter still prerenders any route that sets this flag (needed so Phase 3 Actions can run alongside SSG pages).
- `priceChip` computation: if the hero's priceChip uses "From $X" pattern, compute `$X = Math.min(...packages.map(p => p.data.pricePerPerson.min))` here and pass to `<HeroSection>` OR keep as authored string in `hero.md` and trust the author (simpler; UI-SPEC leaves this open).
- Keep font imports in `BaseLayout.astro` NOT here (current `index.astro` has them; migrate).

**Anti-patterns:**
- Forgetting `.sort()` on collections — Astro returns unsorted; every collection except `site`/`hero`/`about` MUST be sorted by `order`.
- Rendering fonts + global CSS directly in `index.astro` instead of `BaseLayout.astro` — if Phase 3 adds more routes, duplication causes FOUT.
- Omitting `prerender = true` — the Vercel adapter would SSR every request (wasteful and slow).

---

### `src/layouts/BaseLayout.astro` (layout, NEW)

**No analog in repo.** Builds from the current `index.astro` `<head>` block + UI-SPEC globals.

**Target pattern:**

```astro
---
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/600.css";
import "../styles/global.css";
import Nav from "@/components/Nav.astro";
import Footer from "@/components/Footer.astro";

interface Props {
  site: import("@/lib/schemas/site").SiteData;
  title?: string;
  description?: string;
}
const { site, title = site.name, description } = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <style is:global>
      html { scroll-behavior: smooth; scroll-padding-top: 80px; }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
      }
    </style>
  </head>
  <body class="bg-surface text-ink font-sans">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-ink focus:border focus:border-primary focus:rounded-sm">
      Skip to content
    </a>
    <Nav site={site} />
    <main id="main">
      <slot />
    </main>
    <Footer site={site} />
  </body>
</html>
```

**Key contracts:**
- Skip link (UI-SPEC §Accessibility → Skip link) BEFORE nav.
- `<main id="main">` wraps all sections (skip link target).
- `scroll-padding-top: 80px` accounts for sticky nav height on anchor jumps.
- `scroll-behavior: smooth` + `prefers-reduced-motion` fallback (D-15, LAYT-06).
- **Do NOT load Fontsource italic 400 CSS only if you use italic anywhere** — menu dish names are Playfair italic (MENU-03), so `400-italic.css` is REQUIRED. Current `index.astro` omits it; BaseLayout MUST add it.
- Font weights: exactly 400 + 600 Work Sans, 400 + 400-italic Playfair, 400 Lovelace (UI-SPEC §Weight inventory). No 500, 700, or other weights ship.

**Anti-patterns:**
- Adding more font weights "just in case" — explicit contract is 2 weights only.
- Forgetting `400-italic.css` for Playfair — menu dish names will fall back to synthetic italic (ugly).
- Declaring design tokens here — they're in `global.css @theme`; this file just imports.

---

### `src/components/Nav.astro` (nav shell + island mount)

**Schema / spec contract:**
- UI-SPEC §1 (component spec) — states, breakpoints, a11y
- D-12..D-14 (transparent→solid, drawer, active underline)

**Nearest code analog:** shadcn `Button` at `src/components/ui/button.tsx` line 7-8 shows the `cn()` + `cva` + `radix-ui` pattern — reuse `cn()` and the Button component for the CTA.

**Target pattern:**

```astro
---
import { Button } from "@/components/ui/button";
import NavController from "./NavController.tsx";

interface Props {
  site: import("@/lib/schemas/site").SiteData;
}
const { site } = Astro.props;

const links = [
  { href: "#menu", label: "Menu" },
  { href: "#packages", label: "Packages" },
  { href: "#gallery", label: "Gallery" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];
---
<nav aria-label="Primary" class="fixed top-0 inset-x-0 z-40" data-nav-state="transparent">
  <!-- Static shell: wordmark, link list, CTA -->
  <!-- Classes toggled by NavController island via data-nav-state attribute -->
  <div class="h-16 md:h-20 px-5 md:px-8 flex items-center justify-between">
    <a href="#top" class="font-display text-xl md:text-2xl nav-text-color">{site.name}</a>
    <ul class="hidden lg:flex items-center gap-6">
      {links.map(l => (
        <li>
          <a href={l.href}
             class="text-body-sm font-semibold uppercase tracking-[0.08em] nav-link-color"
             data-section-link={l.href.slice(1)}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
    <div class="flex items-center gap-3">
      <Button size="lg" class="hidden lg:inline-flex rounded-full px-6 bg-primary text-white" data-slot="button">
        <a href="#inquiry">Get a Quote</a>
      </Button>
      <!-- Hamburger button handled by NavController -->
    </div>
  </div>
  <NavController client:load links={links} siteName={site.name} />
</nav>
```

**Hydration directive rationale:** `client:load` — drawer open/close and IntersectionObserver need to be live on first paint (otherwise nav is stuck transparent when user lands below hero via hash). `client:idle` would miss users who arrive at `/#faq` directly.

**Anti-patterns:**
- Putting the IntersectionObserver logic inline in a `<script>` — a React island is cleaner and already in the stack. But: for an even lighter footprint, a vanilla `<script>` in Nav.astro is acceptable (D-14 allows "IntersectionObserver, no scroll listeners" — framework is unspecified). UI-SPEC calls for React state → use React island.
- Using `position: sticky` instead of `fixed` — the transparent-over-hero effect requires `fixed` so content can scroll under it.
- `z-index` collisions — nav MUST sit above hero scrim (`z-40`) but below modal/drawer backdrop if it renders above (drawer is `z-50`).

---

### `src/components/NavController.tsx` (React island)

**No code analog.** Closest reference is the shadcn Button's React component pattern (`button.tsx` lines 44-65).

**Target pattern skeleton:**

```tsx
"use client";
// NOTE: In Astro, "use client" is unnecessary — the client:load directive handles it.
// Omit the directive.
import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  links: { href: string; label: string }[];
  siteName: string;
}

export default function NavController({ links, siteName }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navState, setNavState] = useState<"transparent" | "solid">("transparent");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // IntersectionObserver 1: hero visibility → nav state
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setNavState(entry.intersectionRatio > 0.1 ? "transparent" : "solid"),
      { threshold: [0, 0.1, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // IntersectionObserver 2: active section highlight (D-14)
  useEffect(() => {
    const sections = links.map(l => document.getElementById(l.href.slice(1))).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { threshold: 0.4, rootMargin: "-80px 0px 0px 0px" },
    );
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [links]);

  // Sync navState to parent <nav> via data attribute (so Nav.astro CSS can style based on it)
  useEffect(() => {
    const nav = document.querySelector('nav[aria-label="Primary"]');
    nav?.setAttribute("data-nav-state", navState);
  }, [navState]);

  // Body scroll-lock when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // ... render hamburger + drawer
}
```

**Pattern notes:**
- Two IntersectionObservers, not scroll listeners (D-14 rationale).
- `data-nav-state` attribute drives the CSS color/background swap on the parent `<nav>` — keeps presentation out of the island, minimal JS.
- Focus trap inside drawer: use a `useEffect` that tabs cycle among drawer items; on `Escape`, close + return focus to hamburger (UI-SPEC §1 Accessibility).
- Active section sync: set `aria-current="location"` on the active link (not className alone — a11y).

**Anti-patterns:**
- Using scroll event listener (`window.addEventListener("scroll", …)`) — janky on mobile, violates D-14.
- Omitting focus trap inside drawer — a11y failure.
- Forgetting to release body scroll-lock on unmount — persists across navigation (not an issue on single-page site, but good hygiene).
- `client:only="react"` — no SSR'd fallback; nav flashes on hydration. Use `client:load` so Astro SSRs the shell and React hydrates the interactivity.

---

### `src/components/Footer.astro`

**Contract:** UI-SPEC §10 + `siteSchema`.

**Target pattern:** Two-band layout:
1. **Top band** (`bg-surface py-12 md:py-16`): 3-col grid — NAP (left), Explore links (middle), Connect (right, social icons + hours).
2. **Bottom strip** (`bg-ink py-6`): copyright + legal links.

**NAP source (CRITICAL — C5/LAYT-04):** Every address/phone/email field MUST pull from the `site` prop. No hardcoded strings in the component.

**Utility:** Use `src/lib/format.ts` `formatPhone()` for display.

**Anti-patterns:**
- Copy-pasting `"Larrae's Kitchen"` — wordmark comes from `site.name`.
- Missing `not-italic` on `<address>` — default browser styles italicize `<address>`; we want Work Sans roman.
- Linking `/privacy` / `/terms` to pages that don't exist + no `data-pending` attribute → CI link-check (if added later) may fail.

---

### `src/components/sections/HeroSection.astro`

**Contract:** UI-SPEC §2 + `heroSchema`.

**Props signature:**
```astro
---
interface Props {
  id: string;
  hero: import("@/lib/schemas/hero").HeroData;
  packages?: import("@/lib/schemas/packages").PackageData[];   // optional; only if priceChip is computed
}
---
```

**Key render pieces:**
- `<section id={id} class="relative h-screen min-h-[640px] w-full overflow-hidden">`
- Astro `<Image>` with `priority` — import from `astro:assets`
- Scrim overlay with `aria-hidden="true"`
- Content block: `flex h-full flex-col items-center justify-end pb-20 text-center text-white px-5`
- Price chip (butter-gold pill), headline (`text-display-xl`), subheadline (`text-body-lg/90`), CTA (Button with `asChild` + `<a href="#inquiry">`)

**One-priority-image rule:** This is the ONLY `priority` image on the page. If MenuSection's category heroes or other sections add `priority` by mistake, Lighthouse LCP regresses.

**Anti-patterns:**
- Rendering raw `<img>` — Astro's `<Image>` is required for AVIF/WebP + srcset.
- Using Tailwind `h-screen` without `min-h-[640px]` — super-tall browsers (2K monitors) push CTA below the fold.
- Placing scrim ABOVE content (`z-index`) — covers the text, defeats the purpose.
- Omitting `sr-only` fallback or using `alt=""` — schema forbids empty alt.

---

### `src/components/sections/AboutSection.astro`

**Contract:** UI-SPEC §3 + `aboutSchema`.

**Key pieces:**
- Eyebrow → H2 → positioning (amber semibold) → narrative paragraphs.
- Paragraph split: `about.heritageNarrative.split(/\n\n+/).map(p => <p>…)`.
- Portrait: Astro `<Image>` 4:5 aspect; empty-state placeholder if absent.

**Anti-patterns:**
- Rendering narrative as single `<p>` (reads like a wall of text).
- Forgetting the empty-state for missing `chefPortrait` (renders broken image icon).

---

### `src/components/sections/MenuSection.astro` + `src/components/MenuTabs.tsx`

**Contract:** UI-SPEC §4 + `menuItemSchema`. D-05..D-08.

**Architecture split:**
- `MenuSection.astro` — static shell: section header, renders ALL dishes grouped by category, marks each group with `data-category` attribute. Server-side grouping so SEO sees all content.
- `MenuTabs.tsx` — React island, `client:visible`, hydrates only when the section scrolls into view. Toggles `aria-selected` on tab buttons and `hidden` attribute on `<div data-category="...">` panels.

**Hydration directive rationale:** `client:visible` — menu is below the fold; there's no reason to hydrate before user scrolls to it. Saves JS on initial load.

**Grouping pattern:**
```astro
---
const menu: MenuItem[] = Astro.props.menu;
const categories = ["proteins", "sides", "desserts"] as const;
const grouped = Object.fromEntries(
  categories.map(cat => [cat, menu.filter(m => m.category === cat).sort((a,b) => a.order - b.order)])
);
---
```

**Category hero image (UI-SPEC §4 LOCKED):** First item in category with `photo` set → render as category hero via `aspect-[3/2] max-w-2xl mx-auto rounded-sm`.

**Tabs pattern (hand-rolled, UI-SPEC §Registry Safety Do NOT install shadcn tabs):**
- `role="tablist"`, each tab button `role="tab"` + `aria-selected` + `aria-controls`
- Panels `role="tabpanel"` + `aria-labelledby`
- Keyboard: left/right arrows cycle tabs (standard WAI-ARIA tabs pattern)

**Dish row render (per item):**
```astro
<div class="grid grid-cols-[1fr_auto] gap-6 items-baseline py-4 border-b border-ink/8 last:border-b-0">
  <div>
    <h3 class="font-serif italic text-display-md text-ink">{item.name}</h3>
    <p class="mt-1 text-body-md text-ink/70">{item.description}</p>
  </div>
  <ul class="flex gap-2 flex-wrap justify-end">
    {item.dietary.map(d => <DietaryBadge tag={d} />)}
  </ul>
</div>
```

**Dietary badge icon map (UI-SPEC §4):**
| Tag | Lucide Icon | Label |
|-----|-------------|-------|
| `vegetarian` | `Leaf` | "Veg" |
| `vegan` | `Sprout` | "Vegan" |
| `gluten-free` | `WheatOff` | "GF" |
| `dairy-free` | `MilkOff` | "DF" |
| `nut-free` | `Nut` (crossed via CSS) | "NF" |

**Anti-patterns:**
- Installing shadcn `tabs` primitive — violates UI-SPEC Registry Safety LOCK.
- `client:load` on MenuTabs — hydrates too early (menu is below fold).
- Server-hiding non-active category panels via `display:none` — breaks SEO (all menu items should be in DOM even if visually hidden).
- Using `<h3>` italic size for desc instead of name — breaks MENU-03 requirement.

---

### `src/components/sections/PackagesSection.astro`

**Contract:** UI-SPEC §5 + `packageSchema`.

**Key pieces per card:**
- Outer: `relative flex flex-col rounded-lg border border-ink/10 bg-surface p-6 md:p-8` (+ `border-primary/30 bg-clay/5` on `.popular`).
- "Most Popular" badge (butter-gold pill, `-top-3 -translate-x-1/2`) only on `pkg.popular === true`.
- Tier name (Playfair italic `text-display-md`), guest range (small caps), price range (display font), `<div class="h-px bg-ink/10 my-6">` divider, inclusions list (Lucide `Check` icon + text), CTA.
- CTAs:
  - Popular (Medium): `<Button size="lg" asChild class="rounded-full w-full bg-primary text-white mt-8"><a href={`#inquiry?tier=${pkg.id}`}>Select {pkg.name}</a></Button>`
  - Non-popular: same but `variant="outline"` + border-primary styles.
- Grid `grid grid-cols-1 md:grid-cols-3 items-stretch` keeps heights equal.
- `flex-grow` spacer before CTA pushes CTAs to card bottom.

**Price format:** `${pkg.pricePerPerson.min}–${pkg.pricePerPerson.max}` — en dash, not hyphen (UI-SPEC §Copywriting rules).

**Anti-patterns:**
- Using hyphen instead of en dash in price/guest ranges.
- `border-primary` full-opacity on popular card — UI-SPEC says `/30` (subtle); full opacity is loud.
- Missing `flex-grow` spacer → CTAs align at bottom only by accident; use explicit spacer.

---

### `src/components/sections/GallerySection.astro` + `src/components/GalleryGrid.tsx`

**Contract:** UI-SPEC §6 + `gallerySchema`. D-09..D-11.

**Architecture split:**
- `GallerySection.astro` — section header + mounts `<GalleryGrid client:visible photos={...} />`.
- `GalleryGrid.tsx` — React island wrapping `react-photo-album` (masonry) + `yet-another-react-lightbox`.

**Hydration rationale:** `client:visible` — gallery libs are the heaviest JS on the page; defer until user scrolls. GAL-06 mandates this.

**Photos shape (for react-photo-album):**
```typescript
const photos = gallery.map(g => ({
  src: g.image,        // or thumbnail variant
  width: parseRatio(g.aspectRatio).w,
  height: parseRatio(g.aspectRatio).h,
  alt: g.alt,
  caption: g.caption,
  original: g.image,   // full-size for lightbox
}));
```

Where `parseRatio("3:2") → { w: 3, h: 2 }` — tiny helper in `GalleryGrid.tsx` or reuse `src/lib/format.ts`.

**Initial reveal (D-09, UI-SPEC §6 LOCKED at 10):**
```tsx
const INITIAL = 10;
const [showAll, setShowAll] = useState(false);
const visible = showAll ? photos : photos.slice(0, INITIAL);
```

**Lightbox plugins:** `Captions`, `Counter`, `Keyboard` (default). Dynamic import so it's not in the initial chunk:
```tsx
const Lightbox = lazy(() => import("yet-another-react-lightbox"));
const Captions = lazy(() => import("yet-another-react-lightbox/plugins/captions"));
```

**react-photo-album usage (UI-SPEC §6):**
```tsx
<MasonryPhotoAlbum
  photos={visible}
  columns={breakpoints => breakpoints < 640 ? 2 : breakpoints < 1024 ? 3 : 4}
  spacing={{ default: 16, md: 24 }}
  onClick={({ index }) => setLightboxIndex(index)}
/>
```

**Anti-patterns:**
- Loading `yet-another-react-lightbox` statically — ships ~25 KB to users who never open it. Use `React.lazy` + `Suspense`.
- `client:load` instead of `client:visible` — same penalty.
- Using `<img>` inside custom renderer without aspect-ratio CSS — CLS = bad; react-photo-album handles this natively when width/height are passed.
- Missing `alt` on any photo — schema requires it; never fall back to `""`.

---

### `src/components/sections/TestimonialsSection.astro`

**Contract:** UI-SPEC §7 + `testimonialSchema`.

**Key pieces:**
- Background `bg-[color:var(--color-clay)]/8` — the one secondary tint band.
- Card: stars row (5 `<Star size={16} fill="currentColor" />` from Lucide, dimmed to `text-ink/20` for unfilled), `<blockquote>` (Work Sans, NOT italic), `<footer>` with `<cite>` (Playfair italic) + event-type label (Work Sans semibold uppercase).

**Event type label map:** See testimonials schema section above.

**Star component inline pattern:**
```astro
<div class="flex gap-1 text-[color:var(--color-butter-gold)]" aria-label={`${rating} out of 5 stars`}>
  {[1,2,3,4,5].map(i => (
    <Star size={16} fill="currentColor" class={i > rating ? "text-ink/20" : ""} aria-hidden="true" />
  ))}
</div>
```

**Anti-patterns:**
- Italicizing the quote body — UI-SPEC reserves Playfair italic for the attribution, not the quote.
- Missing `aria-label` on stars row — SR users hear 5 decorative SVGs with no meaning.

---

### `src/components/sections/FaqSection.astro`

**Contract:** UI-SPEC §8 + `faqGroupSchema`. FAQ-02 ZERO-JS.

**Native `<details>` pattern (UI-SPEC §8 code block):**
```astro
<details class="group py-4 [&_summary::-webkit-details-marker]:hidden">
  <summary class="flex items-center justify-between gap-4 cursor-pointer list-none min-h-[44px] text-body-lg text-ink font-semibold focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 rounded-sm">
    <span>{q.question}</span>
    <ChevronDown class="size-5 shrink-0 text-ink/60 transition-transform duration-200 group-open:rotate-180 group-open:text-primary motion-reduce:transition-none" />
  </summary>
  <div class="mt-3 max-w-none text-body-md text-ink/80 leading-[1.65]">
    {q.answer}
  </div>
</details>
```

**Group structure:** 4 categories in schema order (ordering → delivery → menu-customization → payment) with category labels as `<h3 class="font-serif italic text-display-md">`.

**Anti-patterns:**
- Installing shadcn `accordion` — violates Registry Safety LOCK + FAQ-02 zero-JS requirement.
- Using `<div>` with JS click handlers instead of native `<details>` — 0 KB JS vs. library overhead.
- Rendering `q.answer` with `set:html` without remark pipeline — if answer contains `<` it could XSS; for Phase 2 treat answer as plain text only. (Phase 4 can add markdown rendering + sanitization.)

---

### `src/components/sections/ContactSection.astro`

**Contract:** UI-SPEC §9 + `siteSchema`.

**Key pieces:**
- 2-col grid: details (left) + map image (right).
- Phone link: `<a href={\`tel:${site.phone}\`}>{formatPhone(site.phone)}</a>` — raw digits in `href`, formatted display.
- Email link: `<a href={\`mailto:${site.email}\`}>{site.email}</a>`.
- Service area: `site.serviceArea.join(" · ")` — middle-dot separator (UI-SPEC §Copywriting).
- Response time: `site.responseTime`.
- Secondary CTA: Button → `#inquiry`.
- Map image: Astro `<Image>` at `/images/service-area-map.jpg`, aspect 4:3, fallback to placeholder with `MapPin` icon if file missing.

**Anti-patterns:**
- Using hyphen instead of middle-dot in service area list.
- Hardcoding phone in `href="tel:..."` — use `site.phone`.
- Missing `rel="noopener noreferrer"` on external social links in Footer (not Contact, but same concern).

---

### `src/lib/format.ts` (utility, NEW)

**Contract:** UI-SPEC §Copywriting — "Phone format: `(510) 555-0123` (US standard). Hosting `site.phone` uses raw `5105550123`, formatted on display via a pure utility in `src/lib/format.ts` (create during Phase 2 — 3-line function)."

**Target pattern:**
```typescript
/** Format a 10-digit US phone string (e.g., "5105550123") as "(510) 555-0123". */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 10) return digits;   // graceful fallback
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
```

Co-located test `src/lib/format.test.ts` recommended (vitest) — covers 10-digit, 11-digit with country code, non-digit input, empty string.

**Anti-patterns:**
- Throwing on malformed input — component would crash; graceful fallback is better.
- Accepting pre-formatted input and no-oping — defeats the purpose; always normalize.

---

## Shared Patterns

### Token Usage Contract (applies to ALL components)

**Source:** Phase 1 D-01, UI-SPEC §Color.

**Semantic-first rule:** Components reference `text-ink`, `bg-surface`, `border-accent`, `text-primary` — NEVER `text-iron-black`, `bg-warm-cream`, etc.

**Brand-layer exceptions (explicit list — only these):**
- `bg-[color:var(--color-butter-gold)]` — hero price chip, "Most Popular" badge
- `bg-[color:var(--color-clay)]/8` — Testimonials section background
- `text-[color:var(--color-butter-gold)]` — testimonial rating stars

Anything else reading raw brand names is a bug; surface it in code review.

**Apply to:** All 11 new components.

---

### Typography Scale Contract

**Source:** `src/styles/global.css` `@theme` lines 39-48; UI-SPEC §Typography.

**Closed set of 7 named tokens — no ad-hoc sizes:**

| Token | Role |
|-------|------|
| `text-display-xl` | Hero H1 only |
| `text-display-lg` | Section H2 (all 7 sections) |
| `text-display-md` | Menu dish names (Playfair italic), package tier names, phone/email displays, FAQ category labels |
| `text-body-lg` | Hero subhead, About narrative, testimonial quote |
| `text-body-md` | Default — menu descriptions, FAQ answers, package inclusions, contact details |
| `text-body-sm` | Nav links, meta, footer, price chip label |
| `text-eyebrow` | Section eyebrows (uppercase tracking-[0.12em]) |

**Forbidden:** `text-[Npx]`, `text-2xl`, `text-base`, etc. CI rule to ban arbitrary `text-[…]` in `src/components/**` is a good Phase 2 polish item (noted in UI-SPEC §Typography).

**Apply to:** All section components + Nav + Footer.

---

### Font Family Application Rules

**Source:** UI-SPEC §Typography "Font-family application rules (LOCKED)".

| Where | Family utility |
|-------|----------------|
| Hero H1 | `font-display` (Lovelace → Playfair fallback) |
| Section H2 | `font-display` |
| Menu dish names | `font-serif italic` (Playfair italic) |
| Package tier names | `font-serif italic` |
| Testimonial attribution `<cite>` | `font-serif italic` |
| Phone/email display in Contact | `font-serif italic` |
| FAQ category label `<h3>` | `font-serif italic` |
| Everything else (body, nav, buttons, eyebrows, CTAs, FAQ q/a) | `font-sans` (Work Sans) |

**Apply to:** All 8 section components + Nav + Footer.

**Anti-pattern:** Using `font-serif` (non-italic) — Phase 2 uses italic-only serif application. Non-italic Playfair is not in the loaded subset.

---

### Image Pipeline Contract

**Source:** UI-SPEC §Image Treatment Rules.

**Always use Astro `<Image>` from `astro:assets`.** Never raw `<img>`.

**Per-image budget (FND-09 CI gate, <600 KB):**
| Image | Budget | Priority |
|-------|--------|----------|
| Hero | <600 KB | `priority` (ONLY one per page) |
| Chef portrait | <200 KB | lazy |
| Menu category hero (×3) | <180 KB | lazy |
| Menu per-dish (optional) | <80 KB | lazy |
| Gallery thumbnails | <250 KB each | lazy |
| Service-area map | <120 KB | lazy |

**Widths / sizes pattern per image type:** See UI-SPEC §Image Treatment Rules table.

**Alt text rule (A11Y-04, schema-enforced):** Every image has non-empty, meaningful alt. Decorative overlays use `aria-hidden="true"`.

**Apply to:** Hero, About, MenuSection (category heroes + optional dish photos), Gallery, Contact.

---

### Accessibility Contracts

**Source:** UI-SPEC §Accessibility Contracts. Apply to ALL interactive elements.

| Concern | Pattern |
|---------|---------|
| **Focus ring** | `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4` (or `focus-visible:ring` from shadcn Button) |
| **Hero over-photo focus** | `outline-white` instead of `outline-primary` for contrast |
| **Touch target** | `min-h-[44px]` + equivalent width on all tap targets (hamburger, nav links in drawer, FAQ summaries, gallery thumbs, social icons, CTAs) |
| **Skip link** | In BaseLayout, before Nav, `sr-only focus:not-sr-only` pattern |
| **Heading hierarchy** | One `<h1>` (hero). Section `<h2>`. Subsections `<h3>` (menu categories, package tier names, FAQ category labels). |
| **Landmarks** | `<nav aria-label="Primary">`, `<main id="main">`, `<footer>` |
| **Reduced motion** | `motion-safe:animate-*`, `motion-reduce:transition-none`, `@media (prefers-reduced-motion: reduce)` fallbacks in global CSS |
| **`<details>` native semantics** | FAQ keyboard/SR handling is free from the browser — don't add ARIA that duplicates |

**Apply to:** Every component that accepts keyboard focus.

---

### Island Hydration Strategy

**Rule of thumb:**
| Component | Directive | Rationale |
|-----------|-----------|-----------|
| `NavController` | `client:load` | User may arrive at `#faq` → nav needs active-section + transparent-state logic immediately |
| `MenuTabs` | `client:visible` | Below fold; defer |
| `GalleryGrid` | `client:visible` | Heaviest JS on page (photo-album + lightbox); must defer |

**Anti-patterns:**
- `client:only="react"` on any of these — loses SSR shell, content invisible until hydration.
- `client:load` on MenuTabs or GalleryGrid — wastes LCP budget on below-fold interactivity.

---

### Content Collection Query Pattern

**Source:** `src/content.config.ts` + Astro 6 docs.

**Single-entry collections** (`site`, `hero`, `about`):
```typescript
const entry = await getEntry("site", "site");   // file at src/content/site/site.md
if (!entry) throw new Error("site.md missing");
const data = entry.data;
```

**Multi-entry collections** (`menu`, `packages`, `testimonials`, `faq`, `gallery`):
```typescript
const entries = await getCollection("packages");
const sorted = entries.sort((a, b) => a.data.order - b.data.order);
const data = sorted.map(e => e.data);
```

**Apply to:** `src/pages/index.astro` and anywhere else collection data is loaded.

**Anti-pattern:** Forgetting to `.sort()` — Astro returns entries in filesystem order (usually alphabetical). Always sort by `order`.

---

## Anti-Pattern Summary (common pitfalls across Phase 2)

1. **Hydration directives on static components.** Only three islands should hydrate: `NavController`, `MenuTabs`, `GalleryGrid`. Section components are static Astro — no `client:*`.
2. **Multiple `priority` images.** Only `HeroSection` has `priority`. Category heroes, gallery, portraits all use `loading="lazy"`.
3. **Raw brand token usage in components.** Use semantic tokens. Exceptions are explicit list in Shared Patterns.
4. **Ad-hoc typography sizes (`text-[Npx]`).** Use the 7-token editorial scale.
5. **Copy-pasted NAP.** All address/phone/email comes from `site.md` via collections.
6. **Installing banned shadcn primitives.** Locked list: `tabs`, `accordion`, `dialog`, `sheet` (see UI-SPEC §Registry Safety).
7. **Using scroll listeners instead of IntersectionObserver.** Nav state + active section MUST use IO (D-14 rationale: jank).
8. **Missing reduced-motion fallbacks.** Smooth scroll, drawer transition, menu tab fade, gallery reveal, FAQ chevron rotation — all need `motion-reduce:` or `@media (prefers-reduced-motion: reduce)` handling.
9. **Forgetting to sort multi-entry collections.** Always `.sort((a,b) => a.data.order - b.data.order)`.
10. **Rendering `q.answer` / `about.heritageNarrative` with `set:html` without sanitization.** Phase 2 treats these as plain text. Markdown rendering is Phase 4.
11. **Emitting JSON-LD in Phase 2 components.** JSON-LD is Phase 4's job (UI-SPEC §FAQ note). Phase 2 components do NOT emit `<script type="application/ld+json">`.
12. **Missing `prerender = true` in `index.astro`.** Astro adapter is `server` mode (Phase 1 D-14); without this flag, the index route SSRs on every request.
13. **Loading Fontsource `400-italic.css` missing.** Menu dish names fall back to synthetic italic (rendered ugly). Add `@fontsource/playfair-display/400-italic.css` to BaseLayout.
14. **Using `<img>` instead of Astro `<Image>`.** Loses AVIF/WebP, blur placeholder, responsive srcset — regresses CWV.
15. **Gallery lightbox statically imported.** Use `React.lazy` — saves ~25 KB on users who never open it.

---

## No Analog Found

Every Phase 2 file has a schema + UI-SPEC contract. **No files are in the "flying blind" bucket.** The greenfield nature means zero local code analogs, but 100% contractual coverage via:
- 8 Zod schemas (`src/lib/schemas/*.ts`)
- 10 component specs (UI-SPEC §1–10)
- 15 design decisions (CONTEXT D-01..D-15)

The planner should treat **schema + UI-SPEC as the analog**.

---

## Metadata

**Analog search scope:** `src/components/**`, `src/layouts/**`, `src/pages/**`, `src/content/**`, `src/lib/**`
**Files scanned:** 10 (schemas: 8, button: 1, index: 1, content.config: 1, global.css: 1)
**Reference docs consumed:** CONTEXT.md (Phase 1 + Phase 2), UI-SPEC.md (all 1000+ lines), STACK.md, ARCHITECTURE.md
**Pattern extraction date:** 2026-04-15
