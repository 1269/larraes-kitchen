# Project Research Summary

**Project:** Larrae's Kitchen — authentic soul food catering marketing site (Benicia, CA)
**Domain:** Photography-heavy, markdown-driven, single-page catering marketing site with multi-step inquiry wizard and live price estimate
**Researched:** 2026-04-15
**Confidence:** HIGH

---

## Executive Summary

Larrae's Kitchen is a content-led, single-page marketing site whose entire job is to convert Benicia-area residential, social, and corporate hosts into booked catering events via a four-step inquiry wizard with a live price estimate. The shape is unusually clear: one long scroll, one form, one primary CTA, markdown-in-repo content edited by an AI agent through GitHub PRs, and a tight deliverability/lead-capture pipeline behind it. Every technical choice below is in service of three things — mobile LCP on a photo-heavy page, making the wizard trustworthy, and ensuring the first real lead actually reaches Larrae's inbox.

The recommended stack is **Astro 6 + React islands + Tailwind v4 + shadcn/ui + Astro Content Collections (Zod) + React Hook Form + Astro Actions + Resend/React Email + Cloudflare Turnstile + Vercel**. Astro's islands architecture ships the least JavaScript by default — a real conversion-adjacent advantage on a photography-dominant single-page site — and its native Content Collections with Zod frontmatter schemas make the AI-agent-via-GitHub content workflow safe by construction (invalid frontmatter fails CI before merge). The Architecture research output was drafted in Next.js 15 terms because it ran in parallel with Stack research and defaulted; every architectural recommendation in that document translates cleanly to Astro (islands instead of RSC, Astro Actions instead of Server Actions, `astro:assets` instead of `next/image`, Astro Content Collections instead of the Content Collections package) and has been restated in Astro terms below. **Astro is the choice; Next.js is not a live alternative here.**

The critical risks are well-understood and have mechanical mitigations: silent lead loss (domain auth + stored-record fallback + synthetic daily submit), live-estimate drift from Larrae's real quotes (single source of truth in `content/packages/*.md`, range-only display), package tier gap at 31–49 guests (a real gap in PROJECT.md that Larrae must resolve before the wizard is built), content edits breaking the build (Zod validation as a CI-blocking status check), photography ballooning LCP (image-size CI budget, `<Image>`-everywhere), and NAP drift across site/schema/Google Business Profile (single canonical `site.md`). Two decisions remain open and need Larrae's input before roadmap: **lead storage (Turso vs Google Sheets)**, a workflow-preference call that is reversible via the `LeadStore` interface; and the **31–49 guest pricing gap**, a business decision with three clean options. Three operational prerequisites also need confirmation (photography readiness, sending-from domain status, real testimonial availability) because any of them can become critical-path for launch.

## Key Findings

### Recommended Stack

**Astro-first.** The site is ~95% static content and ~5% interactive (the wizard + gallery lightbox). Astro ships zero JavaScript by default and hydrates only the islands that need it — ideal for this brief's photography-heavy, mobile-first, LCP-sensitive profile. v1 run cost is $0/month across the full stack.

**Core technologies:**

| Layer | Technology | Why |
|-------|-----------|-----|
| Meta-framework | **Astro 6** (Node 22.12+) | Islands architecture; best-in-class Content Layer; stable Astro Actions; native MDX + Zod frontmatter. HIGH confidence. |
| UI islands | **React 19.2** | Powers the one interactive surface (wizard). Rest of the site is static Astro components. |
| Styling | **Tailwind v4.2 + shadcn/ui** (Tailwind v4 track) | CSS-first `@theme`, Oxide engine, Radix-based accessible primitives (accordion, dialog, form) copied into the repo. |
| Content | **Astro Content Collections + Zod** | Typed markdown; frontmatter schemas in `content.config.ts`; invalid edits fail CI. Plain MDX only where rich inline formatting is earned (testimonials, FAQ answers). |
| Form state | **React Hook Form 7 + @hookform/resolvers + Zod** | Uncontrolled-by-default; pairs cleanly with live estimate (watch single fields); shared Zod schema client + server. |
| Form submission | **Astro Action** (`defineAction` with `accept: 'form'`) | Native server-side handler; Zod input validation; Turnstile verify + rate limit + store + email inside one serverless function. *(Architecture wrote this as "Next.js Server Action" — same mental model, Astro primitive is the implementation.)* |
| Email | **Resend + React Email 5** | Free tier covers v1 forever (<100 emails/mo); JSX templates; first-class DKIM setup. |
| Spam protection | **Honeypot + Cloudflare Turnstile + IP rate limit** | Invisible in most cases, privacy-respecting, CWV-friendly. Layered defense per PITFALLS H7. |
| Lead storage | **OPEN DECISION** — Turso (libSQL) vs Google Sheets API | See Open Decisions; `LeadStore` interface makes the choice reversible. |
| Images | **`astro:assets` `<Image>`/`<Picture>`** (+ optional `@unpic/astro`) | AVIF/WebP, srcset, blur placeholders native. Originals live under `public/images/` in-repo. *(Architecture used `next/image` + `plaiceholder`; Astro's built-ins cover both.)* |
| Gallery | `yet-another-react-lightbox` + `react-photo-album` (dynamically imported) | ~10KB lightbox, keyboard nav, loads only when Gallery island hydrates. |
| SEO | Hand-authored JSON-LD (Restaurant + LocalBusiness + FAQPage combined in single `@graph`) + `@astrojs/sitemap` + `schema-dts` dev types | One canonical block in root layout, validated with Google Rich Results Test. |
| Analytics | **Vercel Analytics + Speed Insights** (Plausible as 60-day swap) | Cookieless, no consent banner required, CWV measured at the edge. |
| Hosting | **Vercel** (Hobby tier) | First-class Astro 6 adapter; preview deploys per PR for AI-agent content review. Cloudflare Pages is a post-acquisition watch item, not a v1 switch. |
| Dev tooling | **Biome 2.3+**, **pnpm 9**, **TypeScript strict**, **Vitest 4**, **Playwright 1.5x**, **Husky + lint-staged** | Fast, boring, deterministic. |

**Astro terminology translations (for anyone reading ARCHITECTURE.md directly):**

| ARCHITECTURE.md (Next-flavored) | Astro equivalent used here |
|---|---|
| RSC / App Router page | `.astro` page composing static sections |
| Server Action (`"use server"`) | Astro Action (`defineAction` in `src/actions/`) |
| `next/image` + `plaiceholder` | `astro:assets` `<Image>` + built-in blur |
| `@content-collections/core` | Astro's native Content Collections (glob loader) |
| Vercel KV rate limiter | Upstash Redis via Astro Action, or in-memory for v1 (single region) |
| `app/sitemap.ts` | `@astrojs/sitemap` integration |

### Expected Features

Structured from FEATURES.md around how each item moves Cynthia (family), Ethan (social), or Emma (corporate) toward the wizard submit.

**Must-have (table stakes, v1 launch):**

*Structural*
- Single-page scroll: Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact (in that order)
- Sticky top nav with persistent "Get a Quote" CTA
- Mobile-first responsive, LCP < 2.5s
- WCAG 2.1 AA throughout (keyboard nav, contrast, reduced motion, semantic HTML, alt text)

*Sections*
- Hero: single cinematic food image + one-line value prop + single primary CTA + "from $15/person" price chip
- About: 150–250 word heritage narrative + chef portrait + "Benicia's only soul food specialist" positioning
- Menu: Proteins / Sides / Desserts with dish name + 1-line description + dietary indicators + per-dish or per-category photography
- Packages: Three cards (Small / Medium / Large) with per-person ranges, inclusions, "Most Popular" on Medium, deep-link CTA into wizard with tier pre-selected
- Gallery: 15–25 curated images, masonry with explicit aspect ratios, accessible lightbox, alt text per image
- Testimonials: 3–6 static (no carousel) with name + event type + quote + stars, one per persona segment
- FAQ: Accordion grouped Ordering / Delivery / Menu Customization / Payment, with FAQPage JSON-LD
- Contact: Phone (`tel:`), email (`mailto:`), service-area text list, response-time expectation, static service-area map image

*Wizard (the core conversion)*
- 4 steps: Event Type → Guests & Date → Package → Contact (contact is last, not first)
- Progress indicator, back/forward with state preservation, refresh-safe via sessionStorage + URL step param
- Live price estimate as a **range** ("Estimated $432–$528") sticky beside the form
- Date picker with lead-time enforcement + markdown-configurable blackout dates
- ZIP / service-area soft gate with "not sure? just ask" fallback
- Step-boundary validation (not end-of-form)
- Mobile-optimized inputs (numeric keypad for guest count, native date picker, large tap targets)
- Confirmation state with submission ID (not a redirect)
- Honeypot + Turnstile + rate limit + idempotency key
- Email to Larrae + lead-confirmation email to inquirer + stored record

*SEO / Infra*
- Combined Restaurant + LocalBusiness + FAQPage JSON-LD
- Canonical NAP aligned with Google Business Profile character-for-character
- og:image, page title, meta description
- Analytics + funnel events (wizard_start → wizard_step_complete → wizard_submit_success)

**Should-have (differentiators — ship if cheap, defer if not):**

- Starting-from price chip in hero (explicit, low cost, high conversion signal)
- Serif italic dish names (Playfair/Lovelace) — Sweetgreen editorial discipline; zero engineering cost
- "Most Popular" badge on Medium tier (documented middle-tier selection lift)
- Packages-card CTA that deep-links into wizard with tier pre-selected
- Caption overlay on gallery ("Family birthday — 18 guests, Medium package") — specific social proof
- Lead-confirmation email to the inquirer (biggest trust signal for catering leads per FEATURES + ARCHITECTURE)

**Defer (explicit v1.x / v2+ — don't build):**

- Online ordering / payment processing (off-scope per PROJECT.md)
- Customer account portal / OAuth (no accounts exist to log into)
- Live chat / WhatsApp / SMS widget (operational load without lead lift)
- Video content of any kind (production cost, page weight)
- Blog / content marketing (markdown schema leaves room; v2)
- Headless CMS (Sanity, Contentful, etc.) — explicitly replaced by markdown-in-repo + GitHub AI agent
- Location-specific landing pages (conflicts with single-page architecture)
- Instagram embed until account has ≥20 quality posts (empty embed is worse than none)
- Press/partnership logo strip until real coverage exists (faking it hurts trust)
- Abandoned-cart recovery email (v1.x once baseline conversion is measurable)
- Save-and-resume email link (v1.x)
- Smart wizard step-skipping for out-of-tier guest counts (v1.x)
- Real-time availability calendar (requires backend scheduling Larrae doesn't have)
- Aggregate review rating widget (brittle live; stale hardcoded)
- Accessibility overlay widgets (AccessiBe, UserWay — documented not to achieve compliance)
- Hero carousel / autoplay video hero (both cut conversion)
- À la carte per-item menu pricing, PDF menu download, full allergen matrix, menu search
- Interactive Google Maps embed (use static image instead)

### Architecture Approach

The pattern is **static Astro shell + two client islands** (wizard, gallery lightbox) with **build-time content compilation** and a **single serverless Action** for submissions. Content is authored as markdown in `src/content/` with Zod frontmatter schemas that both drive TypeScript types at call sites and serve as CI-blocking validation on every PR. The single page composes 8 sections from typed content accessors; navigation is CSS anchors (no router). The wizard owns a `useReducer` finite-state machine (no Zustand/Jotai needed for a 5-step form) with sessionStorage persistence and `?step=` URL sync so refresh and browser-back don't lose state. The live estimate is a pure function (`estimate(guests, packageId, packages)`) shared between client and server, imported by both the wizard UI and the Astro Action so the email/stored record match what the user saw. Submissions go **store-first, email-second** with degradation tracking: if Resend hiccups, the lead is already persisted and a daily cron retries.

**Major components:**

1. **Content Layer** — Astro Content Collections + Zod schemas per collection (menu, packages, testimonials, faq, gallery, site). Validates at build; breaks CI, not production.
2. **Page Shell** — Single `src/pages/index.astro` composing sections from typed accessors; global `<SiteJsonLd>` in root layout.
3. **Section Components** — One `.astro` file per section; all static except Gallery (shell + client lightbox island) and Inquiry (shell + client wizard island).
4. **Wizard Island** — Single React component tree under `src/components/wizard/` with step sub-components, `state.ts` reducer, `EstimateBadge`. React Hook Form + Zod per-step + global on submit.
5. **Pricing Engine** — `src/lib/pricing.ts` pure function, shared client/server, sourced from `content/packages/*.md`. **Single source of truth.**
6. **Submit Action** — `src/actions/submit-lead.ts` → Zod re-validate → Turnstile verify → rate-limit → idempotency check → `leadStore.save()` → Resend notification + confirmation → return `{ ok, leadId }`.
7. **Lead Store Adapter** — `src/lib/leads/` with `LeadStore` interface and one implementation (sheets-store or turso-store, per Open Decision). Swappable without touching the Action.
8. **Spam Guard** — Honeypot field + server-side Turnstile verification + IP rate limit (5/10min) + minimum time-on-form + URL-in-notes heuristic.
9. **SEO Layer** — `src/lib/seo.ts` builders for combined Restaurant/LocalBusiness/FAQPage JSON-LD, single canonical `site.md` for NAP, `@astrojs/sitemap`.
10. **Image Pipeline** — `astro:assets` `<Image>` everywhere; originals in `public/images/` ≤ 2500px / ≤ 500KB; built-in blur placeholders; CI rejects oversized files.
11. **Observability** — Vercel Analytics (custom funnel events per wizard step) + Speed Insights + Sentry at 10% prod sampling.

### Critical Pitfalls

From PITFALLS.md — the six Critical items plus top three High, each with the mitigation baked into the phase plan below.

1. **Silent lead loss (C1)** — Email bounces/spam-filters/DKIM misconfig leaves Larrae unaware a lead arrived. *Mitigation:* SPF + DKIM + DMARC on send domain (mail-tester score 9+), store-before-email ordering, confirmation email to inquirer with submission ID, daily synthetic submission, Resend delivery webhooks to Sentry. Phase 3 + Phase 5.
2. **Live estimate diverges from final quote (C2)** — User sees $1,760, Larrae quotes $2,340, lead feels bait-and-switched. *Mitigation:* Single source of truth in `content/packages/*.md` consumed by one pure `calculateEstimate()`; always display as a range with "Final quote confirmed by Larrae" as primary UI (same font size as the number); snapshot-test the calculator against a boundary matrix. Phase 2 + Phase 3.
3. **Package tier boundary ambiguity (C3)** — 31–49 guest gap is real in PROJECT.md; user enters 35 → $0/NaN/crash. *Mitigation:* **Resolve with Larrae before coding** (see Open Decisions); codify `min_guests`/`max_guests` in package frontmatter; unit test asserts every integer 1–200 maps to exactly one tier or a well-defined custom fallback; boundary tests (±1 around each edge). Gated on Open Decision before Phase 3.
4. **Content edit breaks production build (C4)** — AI agent introduces malformed frontmatter; PR merges; deploy fails or deploys a silent content hole. *Mitigation:* Zod schemas in Content Collections are CI-blocking on every PR; `pnpm content:validate` as a required status check; branch protection on `main` requires human approval; agent never has push access to `main`; Vercel preview on every PR. Phase 1.
5. **NAP inconsistency site ↔ schema ↔ GBP (C5)** — Three slightly different business-name strings dilutes local SEO. *Mitigation:* Single `content/site.md` as canonical NAP, consumed by footer + JSON-LD + contact section; GBP audited and copy-pasted character-for-character before launch; Google Rich Results Test green on staging. Phase 2 (site.md schema) + Phase 5 (GBP audit).
6. **Launch without a real lead-pipeline smoke test (C6)** — First real inquiry hits an untested edge case; lost lead on day one. *Mitigation:* T-72h smoke-test matrix (iPhone Safari, Android Chrome, desktop Chrome/Safari × 3 inquiries each including special chars and tier boundaries); Larrae personally receives and replies to every test lead; post-deploy synthetic submission in CI; documented rollback command. Phase 5.
7. **Hero/food photography ships as 4MB originals (H1)** — Mobile LCP balloons past 2.5s, CWV fails, bounce spikes. *Mitigation:* CI budget blocks any file in `public/images/` over 600KB; `astro:assets` everywhere with explicit `sizes`; exactly one `priority` image per page (the hero); gallery uses `loading="lazy"` with aspect-ratio reserved. Phase 1 (CI budget) + Phase 2 (imagery language).
8. **Wizard state loss on refresh/back (H3)** — User fills step 3, taps back, returns to step 1 empty, rage-quits. *Mitigation:* Persist state to sessionStorage on every change; restore on mount; `?step=N` URL sync so browser back/forward navigates steps; `beforeunload` warning only when real data is entered; explicit smoke-test for each step's refresh + back behavior. Phase 3.
9. **Bot-storm / CAPTCHA over-block on launch day (H7)** — Form hammered by scrapers or real users on VPN/privacy browsers blocked by Turnstile. *Mitigation:* Layered defense (honeypot + Turnstile `managed` mode + server-side rate limit + time-on-form minimum); CI fails if production build uses Turnstile test keys; monitor Turnstile Challenge Solve Rate (alert if < 85%); email fallback ("Having trouble? Email us…"). Phase 3.

## Implications for Roadmap

Five phases at **Standard** granularity (matches the project config). Phases 2 and 3 carry the critical-path weight; Phase 1 is foundation; Phases 4 and 5 are polish + launch discipline. **Hard dependency: Phase 3 (wizard) depends on Phase 2 (content) — do not parallelize.** The wizard's live estimate sources pricing from `content/packages/*.md`, which must be schema-complete and authored before the estimate can be wired.

### Phase 1: Foundation
**Rationale:** Every later phase depends on the content pipeline being validated, the image budget being enforced, and branch protection being live before the AI agent starts opening PRs. Skipping this and retrofitting it later costs 3–5x.
**Delivers:** Astro 6 + React 19 + Tailwind v4 + shadcn/ui scaffold; design tokens (palette, typography) in `@theme`; Content Collection schemas (Zod) for site/hero/about/menu/packages/testimonials/faq/gallery; CI pipeline (typecheck, Biome, content:validate, image-budget check, Playwright smoke stub); Vercel project + preview deploys; branch protection on `main` + CODEOWNERS; env var scaffolding (Preview vs Production separated).
**Addresses:** Structural prerequisites + infrastructure pitfall mitigations (C4, H1, H8).
**Avoids:** C4 (schema drift breaking build), H1 (photography LCP), H8 (agent pushing to main).

### Phase 2: Content + Static Sections
**Rationale:** All static sections can be built in parallel from authored markdown once schemas are live. Crucially, this phase produces the pricing data the wizard consumes, so it must precede Phase 3.
**Delivers:** Fully rendered Hero, About, Menu, Packages, Gallery, Testimonials, FAQ, Contact sections wired to Content Collections; canonical `site.md` (NAP, service area, hours, social); sticky nav with anchor navigation; responsive layout at three breakpoints; image art direction for hero (mobile vs desktop crops); blur placeholders throughout; text-over-image contrast treatment (scrim/gradient) on hero.
**Uses:** `astro:assets` `<Image>`, Tailwind v4 tokens from Phase 1, shadcn/ui accordion (FAQ) + dialog (gallery lightbox trigger).
**Implements:** Content Layer, Page Shell, Section Components, Image Pipeline.
**Avoids:** H9 (text-over-image contrast failure), H10 (photography-heavy page with no crawlable text), C5 groundwork (single canonical site.md).

### Phase 3: Inquiry Wizard + Lead Pipeline
**Rationale:** The conversion engine. Self-contained (client island + one server Action + one storage integration + one email integration) but genuinely the highest-risk surface. Depends on Phase 2's packages content for pricing.
**Delivers:** 4-step wizard island with React Hook Form + Zod; live estimate range bound to `content/packages/*.md`; sessionStorage + URL step persistence; date picker with lead-time and blackout dates; ZIP soft-gate; step-boundary validation; confirmation screen with submission ID; honeypot + Turnstile + IP rate limit + idempotency; Astro Action orchestrating Zod re-validate → Turnstile verify → rate-limit → store-first → Resend notification + confirmation → degradation tracking; React Email templates (LeadNotification to Larrae, LeadConfirmation to inquirer); lead storage implementation (per Open Decision); funnel analytics events wired.
**Uses:** Astro Actions, Resend, React Email, the chosen lead store, Cloudflare Turnstile, Vercel Analytics.
**Implements:** Wizard Island, Pricing Engine (shared), Submit Action, Lead Store Adapter, Spam Guard, Observability funnel.
**Avoids:** C1 (silent lead loss via store-first + confirmation email), C2 (estimate drift via single-source-of-truth pricing), C3 (tier boundaries — *pre-gated on Open Decision*), H3 (state loss on refresh), H6 (duplicate submits via idempotency), H7 (bot-storm via layered defense), H4 (no funnel visibility).

### Phase 4: SEO + Polish
**Rationale:** Everything shippable works; this phase makes it discoverable and passes the non-functional bars the Launch Definition demands (CWV, a11y, local SEO). Cheap to defer here rather than pad into Phase 2/3.
**Delivers:** Combined Restaurant + LocalBusiness + FAQPage JSON-LD validated via Google Rich Results Test; `@astrojs/sitemap` + robots; page-level og:image/title/description; accessibility audit (axe-core/Lighthouse CI + manual keyboard + screen-reader spot-check); CWV pass verified via Speed Insights (LCP < 2.5s mobile, CLS < 0.1, INP < 200ms); image-budget CI tightened; content-side crawlable-text audit (H10); `prefers-reduced-motion` respected on lightbox transitions and estimate updates.
**Avoids:** H2 (gallery jank from missing aspect-ratios), H5 (share-link metadata — accept single-page OG + document share-route fallback for v1.x), A11y pitfalls generally, residual LCP issues.

### Phase 5: Launch Prep
**Rationale:** The Launch Definition is "live AND drives the first real booking" — not "design complete." Pitfall C6 specifically targets this gap. Real testimonials, real DKIM, real GBP alignment, real smoke tests on real devices.
**Delivers:** Production Resend domain with SPF/DKIM/DMARC (mail-tester ≥ 9/10); production Turnstile keys (CI asserts non-test keys in production builds); GBP audited and canonical NAP aligned character-for-character; real testimonials replacing any placeholders; privacy notice / data-handling copy; T-72h smoke-test matrix executed (iPhone Safari / Android Chrome / desktop × 3 inquiries including special-char and tier-boundary cases) with Larrae personally receiving and replying to every test lead; production smoke on cellular (not office Wi-Fi); launch-day dashboard (store count + delivery webhooks + Turnstile CSR); daily synthetic submission cron; rollback command documented.
**Avoids:** C1 (DKIM misconfig → silent loss), C5 (NAP drift), C6 (untested edge cases on launch day), H7 (test keys shipped to prod).

### Phase Ordering Rationale

- **1 → 2:** Schemas + CI must exist before content is authored or agent PRs land. Image budget must be enforced before photography lands in the repo.
- **2 → 3:** Wizard's live estimate sources from `content/packages/*.md`; packages data must be final (including the 31–49 resolution) before estimate logic is testable. Wizard's ZIP gate sources from `site.md` service area.
- **3 → 4:** Wizard behavior must be finalized before CWV/accessibility audits are meaningful (the wizard is the largest interactive surface and dominates INP).
- **4 → 5:** SEO + a11y state must be stable before the real smoke test matrix and GBP alignment, because launch discipline depends on what's being launched not changing underneath it.
- **Accessibility is a per-phase constraint, not a phase** — baked into Phases 1 (semantic primitives via shadcn/ui), 2 (contrast treatment, alt text), 3 (keyboard traps in wizard/lightbox, focus management), 4 (audit).

### Research Flags

Phases likely to benefit from `/gsd-research-phase` during planning:

- **Phase 3 (Wizard + Lead Pipeline):** Date-picker UX implementation (lead-time + blackout dates via markdown; library choice given shadcn/ui's evolving date picker), Turnstile integration for Astro Actions specifically (less-documented than for Next.js), idempotency storage pattern at v1 scale (in-memory vs Upstash), final Turso-vs-Sheets implementation once decision is made. **Highest research value of any phase.**
- **Phase 4 (SEO + Polish):** Exact JSON-LD `@graph` shape for a catering-only (no storefront) soul food business — `Restaurant` vs `FoodEstablishment` + `Caterer` additionalType is a judgment call with some open debate in the schema.org community; Google Rich Results Test is the arbiter.

Phases with well-documented patterns (skip research):

- **Phase 1 (Foundation):** Astro 6 + Tailwind v4 + shadcn/ui scaffold is well-trodden per Stack research; GitHub Actions content validation is a standard pattern.
- **Phase 2 (Content + Static Sections):** Astro Content Collections + static section composition is the canonical Astro use case.
- **Phase 5 (Launch Prep):** Checklist-driven, not research-driven.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Astro 6 + React islands + Tailwind v4 + shadcn/ui triangulated across official docs and 2026-current comparison sources; all versions pinned to released majors; single MEDIUM item (lead storage) is a workflow preference, not a technical unknown. |
| Features | HIGH for table stakes + anti-features; MEDIUM for soul-food-specific benchmarks | Catering conversion patterns have strong multi-source agreement; the soul-food category specifically has thin competitor evidence (most sites are dated), so differentiation hinges on editorial execution rather than benchmarked patterns. |
| Architecture | HIGH for component topology, rendering model, submission flow, spam layering, SEO layer; MEDIUM for lead storage *(by design — it's an open decision)* | Original document was Next.js-flavored; translations to Astro are straightforward because the patterns (islands, server action, content collections, shared Zod schema, store-before-email) are framework-agnostic or have direct Astro analogues. |
| Pitfalls | HIGH on technical pitfalls; MEDIUM on brand/design; MEDIUM on AI-agent workflow | Critical and High tiers are well-grounded in current docs and post-mortem literature; mitigations are concrete. |

**Overall confidence:** HIGH

### Gaps to Address

These should be resolved before or during requirements definition — not at phase planning time — because each has a scope-shaping effect. See Open Decisions below for details.

- Package tier gap (31–49 guests) — pricing decision.
- Lead storage choice — Turso vs Google Sheets, workflow preference.
- Photography readiness — current library vs shoot scheduling.
- Email sending-domain status — DKIM setup from zero vs audit.
- Real testimonials — collected vs collection-as-Phase-5-task.

## Open Decisions (need Larrae's input before requirements/roadmap)

### 1. Package tier gap at 31–49 guests **(business decision, blocking Phase 3)**

PROJECT.md defines Small 10–20, Medium 21–30, Large 50–75. An event for 35 guests has no tier to map to — the pricing calculator would return $0/NaN without a policy. Must be resolved before wizard is built.

Options:
- **A. Widen Medium to 21–49.** Fewer tiers, simpler calculator. Pricing range may need to stretch.
- **B. Add a fourth tier (31–49).** Most faithful to current pricing; adds a card and schema entry.
- **C. Widen Large to 31–75.** Medium stays 21–30; Large's $15–18/person may not fit 31-guest events cleanly.

*Larrae owns the pricing model — awaiting her choice.*

### 2. Lead storage: Turso vs Google Sheets **(workflow preference, reversible)**

Stack recommends Turso (technical fit, free tier). Architecture recommends Google Sheets (Larrae views leads in a familiar tool on her phone, no admin UI needed). `LeadStore` interface makes the choice reversible — swapping later touches one file.

Options:
- **Turso (libSQL)** — Cleaner DX, no OAuth setup; requires a tiny `/admin` view (v1.5) if Larrae wants to browse.
- **Google Sheets** — Bookmarked sheet on phone = immediate visibility + free CRM (mark called/booked/lost). Setup needs a service-account JSON.

*Larrae's call — which does she prefer on her phone on Sunday night?*

### 3. Photography readiness **(operational prerequisite, scope-shaping Phase 2)**

- Does Larrae have a current photo library with ≥ 1 strong hero image, per-dish or per-category menu shots, and 15–25 event/gallery images?
- If not: when can a shoot happen, and is there a photographer already engaged?
- Interim: launch with stock, or scaffold with placeholders that the AI agent swaps post-shoot?

### 4. Sending-from domain + email authentication **(operational prerequisite, Phase 3/5 timing)**

- What domain will transactional email send from (e.g., `hello@larraeskitchen.com`)?
- Is that domain registered and DNS-accessible today?
- Any existing email service (Google Workspace) already authenticated on it that we need to coexist with?

Pre-existing auth → Phase 5 is a half-day audit. Starting from zero → add 2–5 days for DNS propagation and Resend verification.

### 5. Real testimonials for launch **(content prerequisite, Phase 5)**

- Does Larrae have 3+ past clients who would provide a named testimonial (family / social / corporate)?
- If not: does Phase 5 include a testimonial-collection task (outreach + photo permissions + sign-off), and what's the expected turnaround?
- Fallback: launch with fewer than 3 if one persona segment is genuinely unrepresented, rather than inventing one.

## Cost Summary (v1 launch)

| Item | Monthly cost |
|------|--------------|
| Vercel hosting (Hobby) | $0 |
| Resend (free tier, 3k emails/mo) | $0 |
| Lead storage (Turso free tier **or** Google Sheets) | $0 |
| Cloudflare Turnstile | $0 |
| Vercel Analytics + Speed Insights | $0 |
| Sentry (Developer) | $0 |
| **Total run cost at v1** | **$0/month** |

Not listed (out-of-scope infra): domain registration (~$15/year), Google Workspace email for Larrae (~$6/month).

---
*Research completed: 2026-04-15*
*Ready for requirements and roadmap: pending 5 Open Decisions*
