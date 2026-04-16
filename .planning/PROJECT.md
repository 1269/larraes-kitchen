# Larrae's Kitchen

## What This Is

Larrae's Kitchen is an authentic soul food catering business based in Benicia, CA, serving residential events, social gatherings, and corporate functions from 10 to 75+ guests. This project builds the marketing website and inquiry flow — a single-page experience that leads with food photography, tells the chef's heritage story, and converts visitors into booked events through a multi-step quote wizard with live price estimates.

## Core Value

Convert visitors into booked events by making Benicia's only authentic soul food caterer feel both culturally rooted and effortlessly professional — photography-led storytelling paired with a frictionless quote flow that sets price expectations before the first reply.

## Requirements

### Validated

- [x] Single-page scroll site with Hero, About, Menu, Packages, Gallery, Testimonials, FAQ, Contact sections — *Validated in Phase 2: content-static-sections (build passes, 8 sections composed in LAYT-04 order, UAT approved)*
- [x] Photography-led hero with cinematic soul food imagery and single primary CTA — *Validated in Phase 2 (HeroSection + hero.md single-entry collection)*
- [x] About section foregrounding chef heritage and "only soul food specialist in Benicia" positioning — *Validated in Phase 2 (AboutSection + about.md 161-word heritage narrative)*
- [x] Menu section organized by Proteins, Sides, Desserts with dietary indicators — *Validated in Phase 2 (MenuSection + MenuTabs island, 11 items, Lucide dietary icons)*
- [x] Three tiered catering packages (Small 10–20, Medium 21–30, Large 31–75) with transparent per-person pricing — *Validated in Phase 2 (packages/*.md with STATE.md-locked guest ranges; Large 31–75 per roadmap vs original 50–75)*
- [x] Gallery of past catering events (masonry grid + lightbox) — *Validated in Phase 2 (GallerySection + GalleryGrid React.lazy lightbox; 15 entries with explicit aspect ratios for CLS prevention)*
- [x] Testimonials from residential, social host, and corporate clients — *Validated in Phase 2 (4 testimonials covering family/social/corporate personas per TEST-04)*
- [x] FAQ accordion grouped by ordering, delivery, menu customization, payment — *Validated in Phase 2 (FaqSection using native <details>/<summary> for zero-JS; FAQPage JSON-LD emitted)*
- [x] Markdown-based content pipeline (menu items, packages, testimonials, FAQs editable as repo markdown files) — *Validated in Phase 2 (Astro Content Collections with Zod frontmatter schemas; 56 content files authored)*
- [x] Content schema compatible with an AI agent editing via GitHub — *Validated in Phase 2 (canonical site.md NAP single source; AI-editable paths)*

### Active

- [ ] Multi-step inquiry wizard: event type → guests/date → package → contact details
- [ ] Live price estimate updating as user fills the wizard (guests × package tier)
- [ ] Lead delivery: formatted email to Larrae + stored record for follow-up tracking
- [ ] Mobile-first responsive design, WCAG 2.1 AA accessible
- [ ] Local SEO foundations (LocalBusiness/Restaurant structured data, Google Business Profile alignment)
- [ ] Production deployment with analytics and form spam protection

### Out of Scope

- Online ordering / payment processing — v1 converts through the inquiry flow; payments happen off-site via Larrae's existing process
- Customer account portal — repeat-client login is a v2+ concern, not needed to prove the model
- Real-time chat / live support — email follow-up is the channel; adds operational load without clear lead lift
- Native mobile app — web-first, mobile browser is sufficient
- OAuth / social login — no account system exists to log into in v1
- Blog / content marketing system — deferred to v2 once the site proves lead flow; markdown schema will leave room for it
- Video content — photography carries v1; video production cost and page weight not justified yet
- Headless CMS (Sanity, Contentful, etc.) — replaced by markdown-in-repo + GitHub AI agent workflow
- Multi-page site architecture — single-page scroll is the chosen form

## Context

**Project history:** Original PRD, UX strategy brief, and UI design system were produced May 2025, then the project went on 10-month hiatus. Non-technical discovery (personas, positioning, market research, package tiers, menu direction) is preserved from those documents. This refresh updates the design inspiration and technical stack without re-doing discovery.

**Preserved from original discovery:**
- Three target personas: Family Celebration Cynthia (residential, 10–20 guests), Social Host Ethan (social, 20–30 guests), Corporate Planner Emma (corporate, 50–75 guests)
- Package pricing model: $18–22/person (small), $16–20/person (medium), $15–18/person (large)
- Menu direction: proteins (smothered chicken, fish, brisket, BBQ ribs, vegetarian eggplant), sides (collard greens, five-cheese mac, candied sweet potatoes, black-eyed peas, cornbread), desserts (peach cobbler, banana pudding, sweet potato pie)
- Market positioning: the only catering business in Benicia emphasizing soul food as primary offering
- Cultural heritage storytelling as a core differentiator, not a decoration

**Design inspiration (Sweetgreen — structural only):**
- Editorial rhythm, generous whitespace, photography-led hierarchy
- Cream-dominant backgrounds with deep green as primary nav/CTA color
- Clean sans for UI with serif italic accents for tab labels and dish names
- Pill-shaped primary CTAs, understated card chrome, "Order now →" style secondary links
- Soul-food warmth is preserved through food photography (cast iron, hands in frame, family-style abundance), existing warm palette retained in full, and heritage typography (Lovelace / Playfair Display). Quilted-pattern wallpaper retired from the old system; subtle quilted accents may still appear sparingly.

**Content workflow:** Markdown files stored in the repo serve as the CMS. An AI agent interfacing with GitHub will manage content updates. Content schema must be legible and editable by that agent — clean frontmatter, predictable file structure, no CMS lock-in.

**Lead flow expectation:** Multi-step wizard is chosen over single smart form because research indicated higher completion rates for guided flows on catering sites, and because the live-estimate feature pairs naturally with stepwise disclosure.

## Constraints

- **Tech stack**: Modern, researched — open to recommendation. Must support markdown-based content, image optimization, server-side form handling, structured data. (Research phase will propose specific versions.)
- **Content management**: Markdown-in-repo, no headless CMS. AI-agent-editable via GitHub.
- **Hosting/deploy**: Serverless, CI/CD-friendly (Vercel leading candidate unless research redirects).
- **Performance**: Core Web Vitals pass on mobile — photography-heavy site, image optimization is load-bearing.
- **Accessibility**: WCAG 2.1 AA.
- **SEO**: Local SEO critical — LocalBusiness/Restaurant schema, service-area signals for Benicia.
- **Brand palette**: Warm soul food palette retained (Deep Amber, Warm Cream, Greens, Iron Black, Southern Red, Butter Gold, Clay). Green promoted to primary accent; amber stays prominent.
- **Typography**: Lovelace / Playfair Display (display) + Work Sans (body) retained from original system.
- **Structure**: Single-page scroll (SPA-style) — not multi-page.
- **Launch definition**: Site is live AND drives the first real booking (not just design-complete).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-page scroll (not multi-page) | Preserves original UX intent; content volume fits one page; simpler to ship and maintain | — Pending |
| Warm palette retained, green promoted over amber as primary | Sweetgreen influence on layout rhythm, not palette; soul food warmth non-negotiable | — Pending |
| Multi-step wizard for inquiry form | Higher completion than single form; pairs with live estimate; guides less-technical users | — Pending |
| Live price estimate in the form | Sets expectations, reduces tire-kickers, differentiates from competitors who quote blind | — Pending |
| Markdown-in-repo content (no Sanity) | AI agent will edit via GitHub; removes CMS cost, vendor lock-in, and runtime dependency | — Pending |
| Stack selection deferred to research phase | 10-month hiatus means 2025 stack assumptions (Next 14, Sanity) need fresh evaluation | — Pending |
| Email + stored log for leads | Email gets Larrae moving immediately; stored record enables follow-up tracking without full CRM | — Pending |
| Retire quilted-wallpaper textures, keep quilted accents | Sweetgreen editorial discipline; decoration carried by photography + typography, not surface pattern | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after Phase 2 completion (content & static sections — 9/9 plans, 56 content files, 8 section components, UAT approved)*
