# Roadmap: Larrae's Kitchen

## Overview

Five phases move Larrae's Kitchen from empty repo to first real booking. Phase 1 lays the Astro 6 + React 19 + Tailwind v4 scaffold, design tokens, Zod content schemas, and CI/branch-protection so the AI-agent-via-GitHub content workflow is safe by construction. Phase 2 authors canonical markdown and renders every static section (Hero through Contact) — critically including the `content/packages/*.md` pricing data that Phase 3 depends on. Phase 3 builds the conversion engine: the 4-step wizard island, shared pricing function, spam-layered Astro Action, Resend email pipeline, and lead storage. Phase 4 tightens the non-functional bars the Launch Definition demands — SEO/JSON-LD, accessibility audit, Core Web Vitals, observability. Phase 5 is launch discipline: DKIM, Turnstile production keys, GBP alignment, T-72h smoke test matrix, and the first real booking.

**Granularity:** Standard (5 phases)
**Phases 2 → 3:** Hard dependency (wizard estimate sources pricing from Phase 2's package markdown — not parallelizable)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5): Planned milestone work
- Decimal phases (2.1, 3.1): Reserved for urgent insertions

- [ ] **Phase 1: Foundation** - Astro 6 + React 19 + Tailwind v4 + shadcn/ui scaffold, content schemas, CI, Vercel, branch protection
- [ ] **Phase 2: Content & Static Sections** - Canonical site.md, all 8 sections rendered from typed Content Collections with photography pipeline
- [ ] **Phase 3: Inquiry Wizard & Lead Pipeline** - 4-step wizard island, live estimate, Astro Action, Resend email, spam defense, lead storage
- [ ] **Phase 4: SEO, Accessibility & Performance** - JSON-LD, sitemap, a11y audit, CWV verification, observability
- [ ] **Phase 5: Launch Prep** - Production email auth, GBP alignment, smoke-test matrix, rollback, first real booking

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the technical foundation — scaffold, design tokens, content schemas, and CI/deploy plumbing — so every later phase can author content and ship code safely against a validated pipeline.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08, FND-09
**Success Criteria** (what must be TRUE):
  1. A fresh `git clone` builds and deploys to a Vercel preview URL on every PR without manual intervention
  2. Opening a PR with malformed markdown frontmatter fails CI with a clear Zod validation error before it can merge
  3. Attempting to commit a `public/images/` file larger than 600KB fails CI with a budget-exceeded message
  4. `main` is protected — direct pushes are rejected, and the branch requires passing status checks plus CODEOWNERS review
  5. Warm palette and typography tokens are consumable as Tailwind utility classes in any `.astro` or `.tsx` file
**Key risks addressed**: C4 (content edit breaks production build), H1 (photography LCP regression), H8 (agent pushing to main unreviewed)
**Plans**: 7 plans
  - [x] 01-01-PLAN.md — Wipe stale scaffold, init Astro 6 minimal template, pin Node 22 + pnpm 9
  - [x] 01-02-PLAN.md — Install framework integrations (react/mdx/sitemap/vercel), configure output:'server', register env var schema
  - [x] 01-03-PLAN.md — Install Tailwind v4 + shadcn/ui + Fontsource + Lovelace; author brand/semantic/typography tokens in `@theme`
  - [x] 01-04-PLAN.md — Author 8 Zod schemas, pricing stub, Content Collections config, and `.gitkeep` directory skeleton
  - [x] 01-05-PLAN.md — Install dev tooling (Biome, Vitest, Playwright, lefthook) and author smoke test
  - [x] 01-06-PLAN.md — Author CI workflows, CODEOWNERS, image-budget script, branch-protection script
  - [x] 01-07-PLAN.md — Run `vercel link`, register env vars, verify preview URL, lock `main` branch protection
**UI hint**: no

### Phase 2: Content & Static Sections
**Goal**: Author canonical markdown content (especially the packages pricing that Phase 3 consumes) and render all eight static sections of the single-page scroll — Hero, About, Menu, Packages, Gallery, Testimonials, FAQ, Contact — with the photography pipeline, responsive layout, and sticky navigation in place.
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, LAYT-01, LAYT-02, LAYT-03, LAYT-04, LAYT-05, LAYT-06, HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, ABOUT-01, ABOUT-02, ABOUT-03, MENU-01, MENU-02, MENU-03, MENU-04, PKG-01, PKG-02, PKG-03, PKG-04, PKG-05, GAL-01, GAL-02, GAL-03, GAL-04, GAL-05, GAL-06, TEST-01, TEST-02, TEST-03, TEST-04, FAQ-01, FAQ-02, FAQ-03, FAQ-04, CONTACT-01, CONTACT-02, CONTACT-03, CONTACT-04, CONTACT-05
**Success Criteria** (what must be TRUE):
  1. A visitor landing on `/` scrolls through Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact in order on mobile, tablet, and desktop
  2. The sticky nav follows the user with a persistent "Get a Quote" CTA, and anchor links jump cleanly without a client router
  3. Every dish, package, testimonial, FAQ entry, and gallery image is sourced from a Content Collection — editing a markdown file and reloading the preview changes the page
  4. Packages display Small (10–20), Medium (21–30), Large (31–75) tiers with "Most Popular" on Medium, each card deep-linking into the wizard with tier pre-selected
  5. The Gallery masonry grid renders without layout shift, reserves aspect ratios, and opens a keyboard-accessible lightbox on click
  6. NAP (name/address/phone) appears identically in Contact, footer, and anywhere else it surfaces — sourced from a single canonical `site.md`
**Key risks addressed**: C5 groundwork (single canonical `site.md` for NAP), H9 (hero text-over-image contrast failure), H10 (photography-heavy page with no crawlable text), H1 (photography LCP via `astro:assets` everywhere)
**Plans**: 9 plans
  - [x] 02-01-PLAN.md — site.md + formatPhone util + BaseLayout.astro scaffold
  - [x] 02-02-PLAN.md — hero.md + about.md content authoring
  - [x] 02-03-PLAN.md — menu items (11 files) + package tiers (Small/Medium/Large)
  - [x] 02-04-PLAN.md — testimonials + FAQ groups + gallery entries content
  - [ ] 02-05-PLAN.md — Nav.astro + NavController.tsx island + Footer.astro (wires into BaseLayout)
  - [ ] 02-06-PLAN.md — Hero, About, Contact section components
  - [ ] 02-07-PLAN.md — Menu section + MenuTabs island + Packages section
  - [ ] 02-08-PLAN.md — Gallery section + GalleryGrid island + Testimonials + FAQ sections
  - [ ] 02-09-PLAN.md — Compose index.astro (LAYT-04 order) + human UAT checkpoint
**UI hint**: yes

### Phase 3: Inquiry Wizard & Lead Pipeline
**Goal**: Build the conversion engine — the 4-step inquiry wizard with live price estimate — and the server-side lead pipeline that stores, notifies, and confirms every submission with layered spam defense, so the site can turn a visitor into a booked event without silent failures.
**Depends on**: Phase 2 (wizard's live estimate sources pricing exclusively from `content/packages/*.md`, which must be authored and schema-validated before the calculator can be wired or tested)
**Requirements**: WIZ-01, WIZ-02, WIZ-03, WIZ-04, WIZ-05, WIZ-06, WIZ-07, WIZ-08, WIZ-09, WIZ-10, WIZ-11, WIZ-12, WIZ-13, WIZ-14, EST-01, EST-02, EST-03, EST-04, EST-05, EST-06, EST-07, EST-08, LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, LEAD-08, LEAD-09, LEAD-10, LEAD-11, LEAD-12, SPAM-01, SPAM-02, SPAM-03, SPAM-04, SPAM-05, SPAM-06
**Success Criteria** (what must be TRUE):
  1. A user can complete the wizard Event Type → Guests & Date → Package → Contact on mobile, watch the estimate update live as a range, submit, and land on a confirmation screen showing their submission ID
  2. Refreshing the page mid-wizard, tapping browser back, or deep-linking with `?step=3&tier=medium` preserves or restores state correctly — no lost data
  3. On successful submission, Larrae receives a formatted notification email AND the inquirer receives a confirmation email with the same submission ID, even when one email provider hiccups (lead is already stored)
  4. A submitted lead always appears in the lead store before any email is sent — if email delivery fails, the record remains and a daily cron retries
  5. Bot submissions (honeypot-tripped, Turnstile-failed, instant-submit, URL-in-notes) are rejected silently without generating lead records or emails
  6. Every integer guest count from 1 to 200 either produces a valid estimate range matching the displayed packages OR shows the "contact for custom quote" fallback — unit-tested at every tier boundary
  7. Funnel events (wizard_start, wizard_step_complete, wizard_submit_success/failure) appear in Vercel Analytics
**Key risks addressed**: C1 (silent lead loss via store-first + confirmation email), C2 (estimate drift via single-source-of-truth pricing + range display), C3 (tier boundaries — gated on Open Decision resolution before coding), H3 (state loss on refresh), H6 (duplicate submits via idempotency), H7 (bot-storm via layered defense), H4 (no funnel visibility)
**Plans**: TBD
**UI hint**: yes

### Phase 4: SEO, Accessibility & Performance
**Goal**: Make the site discoverable and verifiably pass the non-functional bars the Launch Definition demands — local SEO structured data, WCAG 2.1 AA accessibility, Core Web Vitals on mobile, and production observability — against a behaviorally-complete site.
**Depends on**: Phase 3 (wizard is the largest interactive surface and dominates INP; CWV and a11y audits are only meaningful once wizard behavior is finalized)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, A11Y-08, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, OBS-01, OBS-02, OBS-03, OBS-04
**Success Criteria** (what must be TRUE):
  1. Google Rich Results Test passes cleanly on the deployed preview for the combined Restaurant + LocalBusiness + FAQPage `@graph` block, with NAP matching `site.md` character-for-character
  2. An axe-core/Lighthouse accessibility audit reports zero critical violations, and a manual keyboard-only walkthrough completes the entire site flow including the wizard submit
  3. Production Vercel Speed Insights show mobile LCP < 2.5s, CLS < 0.1, and wizard INP < 200ms for real user sessions
  4. `sitemap.xml` and `robots.txt` are present, accurate, and reachable on the production domain
  5. Sentry receives errors at 10% production sampling, and Resend delivery webhooks land in the observability layer so silent email failures become visible
**Key risks addressed**: H2 (gallery jank from missing aspect ratios), H5 (share-link metadata — accept single-page OG for v1.x), residual LCP regressions, accessibility pitfalls generally
**Plans**: TBD
**UI hint**: no

### Phase 5: Launch Prep
**Goal**: Execute the launch discipline that turns "design complete" into "first real booking" — production email authentication, Google Business Profile alignment, a real-device smoke-test matrix with Larrae personally replying to every test lead, synthetic monitoring, and a documented rollback.
**Depends on**: Phase 4 (SEO, a11y, and CWV state must be stable before the real smoke-test matrix and GBP alignment — launch discipline depends on what's being launched not changing underneath it)
**Requirements**: LAUN-01, LAUN-02, LAUN-03, LAUN-04, LAUN-05, LAUN-06, LAUN-07, LAUN-08, LAUN-09
**Success Criteria** (what must be TRUE):
  1. `mail-tester.com` scores the production Resend send-from domain ≥ 9/10 with SPF, DKIM, and DMARC all passing
  2. Google Business Profile NAP matches `content/site.md` character-for-character — verified by side-by-side comparison
  3. The T-72h smoke-test matrix is executed: iPhone Safari, Android Chrome, desktop Chrome/Safari × 3 inquiries each (including special-char and tier-boundary cases) — Larrae personally receives and replies to every test lead
  4. A daily synthetic submission cron runs in production and alerts on silent lead loss
  5. Production Turnstile keys are active, CI blocks any deploy using test keys, and the rollback command is documented and verified
**Key risks addressed**: C1 (DKIM misconfig → silent loss), C5 (NAP drift across site ↔ schema ↔ GBP), C6 (launch without a real lead-pipeline smoke test), H7 (Turnstile test keys shipped to production)
**Plans**: TBD
**UI hint**: no

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Content & Static Sections | 0/TBD | Not started | - |
| 3. Inquiry Wizard & Lead Pipeline | 0/TBD | Not started | - |
| 4. SEO, Accessibility & Performance | 0/TBD | Not started | - |
| 5. Launch Prep | 0/TBD | Not started | - |

---
*Roadmap created: 2026-04-15*
*Granularity: standard | Parallelization: true (but Phases 2 → 3 are serialized)*
