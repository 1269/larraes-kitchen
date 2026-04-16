# Requirements: Larrae's Kitchen

**Defined:** 2026-04-15
**Core Value:** Convert visitors into booked events by making Benicia's only authentic soul food caterer feel both culturally rooted and effortlessly professional — photography-led storytelling paired with a frictionless quote flow.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FND-01**: Astro 6 + React 19 + Tailwind v4 + shadcn/ui scaffold builds and deploys successfully
- [ ] **FND-02**: Design tokens for the full warm palette (Deep Amber, Warm Cream, Greens, Iron Black, Southern Red, Butter Gold, Clay) defined in Tailwind v4 `@theme`
- [ ] **FND-03**: Typography tokens (Lovelace/Playfair Display display, Work Sans body) loaded and usable as utility classes
- [ ] **FND-04**: Astro Content Collections with Zod frontmatter schemas defined for site, hero, about, menu, packages, testimonials, faq, gallery
- [ ] **FND-05**: CI pipeline runs typecheck, Biome lint, content schema validation, image-size budget check, and Playwright smoke stub on every PR
- [ ] **FND-06**: GitHub branch protection on main with required status checks and CODEOWNERS
- [ ] **FND-07**: Vercel project connected; preview deploys created automatically per PR
- [ ] **FND-08**: Env var scaffolding separates Preview and Production environments
- [ ] **FND-09**: Image size CI budget rejects any file in `public/images/` over 600KB

### Content Schema & Authoring

- [ ] **CONT-01**: Canonical `site.md` with NAP (name/address/phone), service area, hours, and social links — single source of truth
- [ ] **CONT-02**: Package markdown files include `min_guests`, `max_guests`, `per_person_min`, `per_person_max`, `inclusions`, `is_popular` fields
- [ ] **CONT-03**: Package tiers defined as Small (10–20), Medium (21–30), Large (31–75) per resolved pricing decision
- [ ] **CONT-04**: Menu markdown files organized by Proteins / Sides / Desserts with dish name, description, dietary indicators, optional photo
- [ ] **CONT-05**: Testimonial markdown schema with name, event type, quote, star rating — placeholder set included for v1 launch
- [ ] **CONT-06**: FAQ markdown organized by category (Ordering, Delivery, Menu Customization, Payment) with question and answer
- [ ] **CONT-07**: Gallery markdown with image path, alt text, caption, aspect ratio
- [ ] **CONT-08**: Hero content editable as markdown (headline, subheadline, CTA text, price-chip copy)
- [ ] **CONT-09**: Invalid content frontmatter fails CI with a clear error message (blocking PRs)

### Layout & Navigation

- [ ] **LAYT-01**: Single-page scroll architecture — all sections on one route (`/`)
- [ ] **LAYT-02**: Sticky top nav with Larrae's Kitchen wordmark, section anchor links, and persistent "Get a Quote" CTA
- [ ] **LAYT-03**: Mobile-first responsive layout across mobile (≤640px), tablet (≤1024px), desktop breakpoints
- [ ] **LAYT-04**: Section order: Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact
- [ ] **LAYT-05**: Anchor navigation works without router; browser back/forward behaves correctly
- [ ] **LAYT-06**: Reduced-motion preference respected across all animations

### Hero Section

- [ ] **HERO-01**: Hero displays single cinematic food photograph (placeholder-friendly; AI agent can swap later)
- [ ] **HERO-02**: One-line value proposition ("Authentic Soul Food Catering in Benicia" or equivalent)
- [ ] **HERO-03**: Single primary CTA button in brand green with pill shape, linking to wizard
- [ ] **HERO-04**: "From $X/person" price chip visible in hero
- [ ] **HERO-05**: Text-over-image contrast passes WCAG AA (scrim/gradient treatment)

### About Section

- [ ] **ABOUT-01**: 150–250 word heritage narrative editable as markdown
- [ ] **ABOUT-02**: Chef portrait placeholder with alt text (swappable post-shoot)
- [ ] **ABOUT-03**: Positioning statement: "Benicia's only soul food specialist"

### Menu Section

- [ ] **MENU-01**: Menu rendered from Content Collection by category (Proteins, Sides, Desserts)
- [ ] **MENU-02**: Each dish shows name, 1-line description, dietary indicators (vegetarian, dairy-free, etc.)
- [ ] **MENU-03**: Dish names styled in italic serif (Playfair/Lovelace) per Sweetgreen-inspired editorial discipline
- [ ] **MENU-04**: Per-dish or per-category photography supported (optional in schema)

### Packages Section

- [ ] **PKG-01**: Three package cards rendered from Content Collection: Small, Medium, Large
- [ ] **PKG-02**: Each card shows tier name, guest range, per-person price range, inclusions list
- [ ] **PKG-03**: "Most Popular" badge on Medium tier
- [ ] **PKG-04**: Each card has a CTA button that deep-links into the wizard with tier pre-selected
- [ ] **PKG-05**: Card chrome stays understated (cream background, subtle border) — photography carries visual weight

### Gallery Section

- [ ] **GAL-01**: Gallery rendered from Content Collection (15–25 curated placeholder images for v1 launch)
- [ ] **GAL-02**: Masonry grid layout with explicit aspect ratios to prevent CLS
- [ ] **GAL-03**: Lazy loading applied to all gallery images
- [ ] **GAL-04**: Accessible lightbox opens on click/tap, keyboard-navigable, dismissible via Escape
- [ ] **GAL-05**: Each image has descriptive alt text and optional caption overlay
- [ ] **GAL-06**: Lightbox is a client-hydrated island — loads only when gallery is in view

### Testimonials Section

- [ ] **TEST-01**: 3–6 static testimonials rendered from Content Collection (no carousel)
- [ ] **TEST-02**: Each testimonial shows client name, event type, quote, star rating
- [ ] **TEST-03**: Launch with placeholder testimonials; AI agent swaps real ones in via markdown PRs post-launch
- [ ] **TEST-04**: Grid layout covers all three persona segments (family, social, corporate) where possible

### FAQ Section

- [ ] **FAQ-01**: FAQ rendered as accordion grouped by category
- [ ] **FAQ-02**: Native `<details>`/`<summary>` or shadcn/ui Accordion with zero-JS fallback
- [ ] **FAQ-03**: FAQPage JSON-LD structured data emitted for rich results
- [ ] **FAQ-04**: Each question is keyboard-accessible and screen-reader-announced

### Contact Section

- [ ] **CONTACT-01**: Phone number rendered as `tel:` link from canonical site.md
- [ ] **CONTACT-02**: Email rendered as `mailto:` link from canonical site.md
- [ ] **CONTACT-03**: Service-area listed as text (not interactive map)
- [ ] **CONTACT-04**: Response-time expectation stated ("We respond within 24 hours")
- [ ] **CONTACT-05**: Static service-area map image (no interactive embed)

### Inquiry Wizard

- [ ] **WIZ-01**: 4-step wizard as client-hydrated React island: Step 1 Event Type → Step 2 Guests & Date → Step 3 Package → Step 4 Contact
- [ ] **WIZ-02**: Progress indicator showing current step (1 of 4, 2 of 4, etc.)
- [ ] **WIZ-03**: Step-boundary validation — user cannot advance past a step with invalid/missing required fields
- [ ] **WIZ-04**: Wizard state persists to sessionStorage on every change; restores on refresh
- [ ] **WIZ-05**: `?step=N` URL parameter kept in sync; browser back/forward navigates steps without losing state
- [ ] **WIZ-06**: `beforeunload` warning only when the user has entered real data
- [ ] **WIZ-07**: Mobile inputs use correct keyboard types (numeric for guest count, native date picker)
- [ ] **WIZ-08**: Touch targets are minimum 44×44px throughout
- [ ] **WIZ-09**: Tier can be pre-selected via URL parameter (from Packages section deep-link)
- [ ] **WIZ-10**: Date picker enforces lead-time (configurable in site.md) and blackout dates (configurable in site.md)
- [ ] **WIZ-11**: Optional ZIP field performs a soft service-area check with "not sure? just ask" fallback
- [ ] **WIZ-12**: Submission confirmation screen displays submission ID (not a redirect)
- [ ] **WIZ-13**: Wizard is fully keyboard-navigable with logical focus order and visible focus indicators
- [ ] **WIZ-14**: Step transitions respect `prefers-reduced-motion`

### Live Price Estimate

- [ ] **EST-01**: Price estimate calculator is a pure function shared between client wizard and server Action
- [ ] **EST-02**: Estimate sources package tier, min/max per-person pricing exclusively from `content/packages/*.md` frontmatter — single source of truth
- [ ] **EST-03**: Estimate displays as a range ("Estimated $432–$528") — never a single binding number
- [ ] **EST-04**: "Final quote confirmed by Larrae" shown with same visual weight as the number
- [ ] **EST-05**: Every integer guest count from 1 to 200 maps to exactly one package tier or a defined fallback (unit-tested)
- [ ] **EST-06**: Boundary tests pass for ±1 around every tier edge (9, 10, 11, 20, 21, 30, 31, 75, 76)
- [ ] **EST-07**: Estimate updates live as guests / package selection change, with debouncing for large inputs
- [ ] **EST-08**: Out-of-range guest counts (e.g., over 200, under 10) show a "contact for custom quote" message instead of a broken estimate

### Lead Submission Pipeline

- [ ] **LEAD-01**: Submission flows through an Astro Action that re-validates input with Zod (server-side)
- [ ] **LEAD-02**: Cloudflare Turnstile verification happens server-side before any lead storage or email
- [ ] **LEAD-03**: IP-based rate limit (5 submissions per 10 minutes) applied server-side
- [ ] **LEAD-04**: Client-generated idempotency key prevents duplicate submissions on flaky networks
- [ ] **LEAD-05**: Lead is stored **before** email send (store-first ordering prevents silent loss)
- [ ] **LEAD-06**: Lead storage implemented against `LeadStore` interface with Google Sheets adapter
- [ ] **LEAD-07**: Stored record includes full submission, timestamp, IP (hashed), submission ID, final estimate shown to user
- [ ] **LEAD-08**: Notification email sent to Larrae via Resend using React Email template (LeadNotification)
- [ ] **LEAD-09**: Confirmation email sent to inquirer via Resend using React Email template (LeadConfirmation) with submission ID
- [ ] **LEAD-10**: Email send failures tracked but do not lose the lead (stored record is authoritative)
- [ ] **LEAD-11**: Daily cron retries any lead where email delivery is marked failed
- [ ] **LEAD-12**: Resend delivery webhook events logged to observability layer

### Spam Protection

- [ ] **SPAM-01**: Hidden honeypot field rejects bot submissions silently
- [ ] **SPAM-02**: Cloudflare Turnstile widget renders on the final wizard step
- [ ] **SPAM-03**: Minimum time-on-form threshold (e.g., 5 seconds) rejects instant submissions
- [ ] **SPAM-04**: URL-in-notes heuristic rejects submissions with suspicious URL patterns in free-text fields
- [ ] **SPAM-05**: Email fallback message visible ("Having trouble? Email us directly")
- [ ] **SPAM-06**: CI asserts that production builds do not contain Turnstile test keys

### SEO

- [ ] **SEO-01**: Combined Restaurant + LocalBusiness + FAQPage JSON-LD emitted as a single `@graph` block in the root layout
- [ ] **SEO-02**: Structured data passes Google Rich Results Test
- [ ] **SEO-03**: NAP in JSON-LD matches `content/site.md` character-for-character
- [ ] **SEO-04**: `@astrojs/sitemap` generates sitemap.xml at build time
- [ ] **SEO-05**: `robots.txt` configured for production indexing
- [ ] **SEO-06**: Page-level metadata (title, description, og:image, og:title, og:description, canonical URL) set in layout
- [ ] **SEO-07**: Page includes sufficient crawlable body text alongside photography

### Accessibility

- [ ] **A11Y-01**: All interactive elements keyboard-navigable with visible focus indicators
- [ ] **A11Y-02**: Color contrast passes WCAG 2.1 AA for all text (body, headings, UI, text-over-image)
- [ ] **A11Y-03**: Wizard steps announced to screen readers with proper ARIA roles/labels
- [ ] **A11Y-04**: All images include meaningful alt text or `alt=""` for decorative images
- [ ] **A11Y-05**: Form validation errors announced via ARIA live regions
- [ ] **A11Y-06**: `prefers-reduced-motion` disables non-essential animations (lightbox transitions, estimate flashes)
- [ ] **A11Y-07**: Axe-core or Lighthouse accessibility audit passes with zero critical violations
- [ ] **A11Y-08**: Manual keyboard walkthrough completes entire site flow including wizard submit

### Performance (Core Web Vitals)

- [ ] **PERF-01**: Mobile LCP < 2.5s on production (verified via Vercel Speed Insights)
- [ ] **PERF-02**: CLS < 0.1 on all sections (aspect ratios reserved for all images)
- [ ] **PERF-03**: INP < 200ms for wizard interactions
- [ ] **PERF-04**: Exactly one `priority` image per page (the hero) — all others lazy-loaded
- [ ] **PERF-05**: AVIF with WebP fallback served via `astro:assets`
- [ ] **PERF-06**: Blur placeholders on all content images

### Observability

- [ ] **OBS-01**: Vercel Analytics installed with funnel events (wizard_start, wizard_step_complete, wizard_submit_success, wizard_submit_failure)
- [ ] **OBS-02**: Vercel Speed Insights installed for CWV tracking
- [ ] **OBS-03**: Sentry installed at 10% production sampling for error monitoring
- [ ] **OBS-04**: Resend delivery events piped to Sentry (or equivalent log) for lead pipeline monitoring

### Launch Readiness

- [ ] **LAUN-01**: Production Resend domain configured with SPF + DKIM + DMARC (mail-tester.com score ≥ 9/10)
- [ ] **LAUN-02**: Production Turnstile keys active; CI blocks deploys using test keys
- [ ] **LAUN-03**: Google Business Profile audited; NAP matches site character-for-character
- [ ] **LAUN-04**: Privacy notice / data-handling copy present and linked from footer
- [ ] **LAUN-05**: T-72h smoke test matrix executed (iPhone Safari, Android Chrome, desktop Chrome/Safari) with 3 real submissions each covering special chars and tier-boundary cases
- [ ] **LAUN-06**: Larrae personally receives and replies to every test lead during smoke test
- [ ] **LAUN-07**: Daily synthetic submission cron runs in production to detect silent lead loss
- [ ] **LAUN-08**: Rollback command documented and verified
- [ ] **LAUN-09**: Production domain and email connected at end of Phase 5 (was deferred with placeholders during development)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Conversion

- **V2-CONV-01**: Abandoned-cart recovery email when wizard is abandoned partway through
- **V2-CONV-02**: Save-and-resume email link for partially completed wizards
- **V2-CONV-03**: Smart wizard step-skipping for out-of-tier guest counts (routes to custom quote flow)
- **V2-CONV-04**: Real-time availability calendar once Larrae has backend scheduling

### Content Expansion

- **V2-CONT-01**: Blog / content marketing section (soul food heritage stories, event planning tips)
- **V2-CONT-02**: Instagram embed feed (once account has 20+ quality posts)
- **V2-CONT-03**: Press / partnership logo strip (once real coverage exists)
- **V2-CONT-04**: Real testimonials replacing placeholders (may happen earlier via AI-agent content PRs)

### Admin & Operations

- **V2-OPS-01**: Lightweight admin UI for browsing leads (if Larrae outgrows Google Sheets)
- **V2-OPS-02**: Location-specific landing pages for surrounding service areas
- **V2-OPS-03**: Email marketing integration (Mailchimp/ConvertKit) for newsletter signups

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Online ordering / payment processing | Off-scope per PROJECT.md; Larrae handles payments through her existing workflow |
| Customer account portal / login | No account system exists for v1 to log into; defer indefinitely |
| OAuth / social login | No account system; nothing to authenticate into |
| Headless CMS (Sanity, Contentful, Payload, Strapi) | Replaced by markdown-in-repo + AI agent via GitHub; adding one duplicates the workflow |
| Live chat / WhatsApp / SMS widget | Operational load without staff to respond; adds no lead lift at v1 |
| Video content (hero video, background video, embedded video) | Production cost + page weight; photography carries v1 |
| Native mobile app | Web-first; mobile browser is sufficient |
| Multi-page site architecture | Single-page scroll is the intentional form per original UX intent |
| Location-specific landing pages | Conflicts with single-page architecture; deferred to v2+ |
| Interactive Google Maps embed | Use static service-area image instead — avoids third-party cookies, improves CWV |
| PDF menu download | Replaced by live markdown menu section |
| Full allergen / nutrition matrix | Dietary indicators sufficient for v1; full matrix is v2+ |
| À la carte per-item menu pricing | Package-tier pricing is the model; per-item pricing confuses the wizard |
| Menu search functionality | Menu fits on one scroll section; search is unnecessary |
| Hero carousel / autoplay video hero | Documented conversion killer; single image + CTA is the pattern |
| Testimonials carousel (auto-rotating) | Accessibility + performance cost; static grid is the pattern |
| Aggregate review rating widget (auto-fetched from Google/Yelp) | Brittle live + stale hardcoded; defer until operational need |
| Accessibility overlay widgets (AccessiBe, UserWay) | Documented not to achieve compliance; real semantic HTML is the answer |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01..09 | Phase 1 | Pending |
| CONT-01..09 | Phase 2 | Pending |
| LAYT-01..06 | Phase 2 | Pending |
| HERO-01..05 | Phase 2 | Pending |
| ABOUT-01..03 | Phase 2 | Pending |
| MENU-01..04 | Phase 2 | Pending |
| PKG-01..05 | Phase 2 | Pending |
| GAL-01..06 | Phase 2 | Pending |
| TEST-01..04 | Phase 2 | Pending |
| FAQ-01..04 | Phase 2 | Pending |
| CONTACT-01..05 | Phase 2 | Pending |
| WIZ-01..14 | Phase 3 | Pending |
| EST-01..08 | Phase 3 | Pending |
| LEAD-01..12 | Phase 3 | Pending |
| SPAM-01..06 | Phase 3 | Pending |
| SEO-01..07 | Phase 4 | Pending |
| A11Y-01..08 | Phase 4 | Pending |
| PERF-01..06 | Phase 4 | Pending |
| OBS-01..04 | Phase 4 | Pending |
| LAUN-01..09 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 134 total
- Mapped to phases: 134
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after initial definition*
