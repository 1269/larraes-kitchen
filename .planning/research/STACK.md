# Stack Research

**Domain:** Photography-heavy, markdown-driven single-page marketing site (local catering, lead-gen)
**Researched:** 2026-04-15
**Overall confidence:** HIGH

---

## TL;DR — The Recommended Stack

**Astro 6 + React islands + Tailwind v4 + shadcn/ui + Content Collections (local markdown) + React Hook Form + Astro Actions + Resend/React Email + Turso (libSQL) + Cloudflare Turnstile + Vercel hosting + Biome + pnpm + Playwright + Vitest.**

The thesis: this is a content-led, photography-heavy, single-page, single-form site. Astro's islands architecture ships the least JavaScript by default (critical for LCP on a photo-first page), its Content Layer is the best typed markdown pipeline on the market, and a small React island handles the one interactive piece (the wizard). Next.js 16 is the strong runner-up and would be the right call if the team already has Next.js muscle memory — but for a brand-new build matching this brief, Astro wins on page weight, content ergonomics, and simplicity.

---

## Recommended Stack

### Core Technologies

| Technology | Version (pinned major) | Purpose | Why Recommended |
|------------|------------------------|---------|-----------------|
| **Astro** | 6.0 (released 2026-03-10, stable) | Meta-framework | Islands architecture = minimal JS shipped by default. Best-in-class Content Layer API for typed markdown/MDX. First-class MDX + Zod frontmatter schemas. Stable Astro Actions for server-side form handling. Confidence: **HIGH**. |
| **React** | 19.2 | UI library for the one interactive island (wizard) | Stable React 19 with `useActionState` / `useFormStatus` — the modern form primitive. Used only for the wizard island; rest of the site is static Astro components. |
| **Tailwind CSS** | 4.2 (v4.2.0 shipped 2026-02-18) | Styling | CSS-first config via `@theme` — design tokens declared in CSS, no JS config file. Oxide engine = 5x full / 100x incremental build speed. Works natively with Astro 6 and shadcn/ui. |
| **shadcn/ui** | Latest (Tailwind v4 / React 19 track) | Accessible component primitives | Not a "library" — copy-in Radix-based components you own. Ships with Tailwind v4 support. Best foundation for the wizard form, accordion (FAQ), dialog (lightbox trigger), and nav pieces. Avoids runtime lock-in. |
| **TypeScript** | 5.6+ | Type safety | `strict: true`, `noUncheckedIndexedAccess: true`. Zod at runtime boundary (frontmatter schemas, form validation, API responses). |
| **Node.js** | 22 LTS (>= 22.12) | Runtime | Astro 6 requires Node 22.12+. |
| **pnpm** | 9.x | Package manager | Correctness + disk efficiency (75% less than npm). Stable, boring, deterministic. Bun is faster but adds compatibility risk for a small project that doesn't need the speed. |

### Content Pipeline

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro Content Layer (glob loader)** | built-in to Astro 6 | Typed markdown/MDX collections | Zod schemas define frontmatter shape, full TS inference at call sites, 5x faster markdown / 2x faster MDX builds vs Astro 4. AI-agent friendly: plain `.md` files, predictable directory structure, schema visible in `content.config.ts`. |
| **MDX (@astrojs/mdx)** | latest compatible with Astro 6 | For testimonials / FAQ sections that may want inline emphasis / links | Use MDX only where rich inline formatting helps; plain markdown everywhere else to keep the AI-agent schema clean. |
| **Remark/Rehype plugins** | as-needed | `remark-gfm`, `rehype-external-links`, `rehype-slug` | Standard markdown pipeline — tables (for menu), auto-linked headings for scroll anchors. |

### Forms & Interactivity

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **React Hook Form** | 7.x (latest) | Wizard form state | Uncontrolled-by-default = fast re-renders, pairs cleanly with the live price estimate (watch a single field, not the whole form). Most widely adopted, best debugging / DX. |
| **Zod** | 3.x (or 4 if stable) | Schema validation (shared client+server) | Same schema validates form input and Astro Action payload. Also powers content collection frontmatter schemas. |
| **@hookform/resolvers** | latest | Wire Zod into RHF | Standard integration. |
| **Astro Actions** | built-in to Astro 6 | Server-side form handler | `defineAction` with `accept: 'form'` + Zod input. Replaces a separate API route. Runs server-side on Vercel as a serverless function. |

### Email & Lead Storage

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Resend** | latest SDK | Transactional email to Larrae | Best DX for this use case. React Email is first-party. Free tier: 3,000 emails/mo (catering inquiries will be <100/mo — fits forever). Pro $20/mo only if needed later. Deliverability is good; Postmark is better but overkill at this volume. |
| **React Email** | 5.x | Email template authoring | JSX components → email-safe HTML, dark mode, Tailwind support. Compose the lead-notification email the same way the rest of the site is built. |
| **Turso (libSQL)** | latest client | Lead record storage | Free tier: 5 GB storage, 500M row reads/mo (enormous for this use case). SQLite-based = trivial schema, zero-ops. `@libsql/client` works in serverless/edge runtimes. If Larrae needs a UI to view leads, a tiny password-protected `/admin` route backed by the same DB is v1.5 work — cheaper than maintaining a Google Sheets sync. |

**Alternative lead-storage path considered:** Google Sheets via API gives Larrae a native UI for free. Chosen Turso instead because (a) OAuth + service account setup is fragile, (b) schema migrations are painful, (c) Turso's free tier + a simple admin view is the better long-term play. Keep Sheets as Plan B if Larrae pushes back on "yet another login."

### Images

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro `<Image>` / `<Picture>`** | built-in | Responsive image optimization | Automatic AVIF/WebP, srcset, blur placeholders. Works with the Sharp service locally, hands off to Vercel's image CDN in production. |
| **@unpic/astro** | latest | (Optional) Drop-in replacement image service | Auto-detects Vercel and uses its image CDN; generates placeholders (dominant color / blurhash / low-res). Use only if Astro's default output needs more control — default is fine for v1. |
| **Sharp** | 0.33+ | Underlying image processor | Transitive via Astro. |

### Gallery / Lightbox

| Library | Version | Purpose |
|---------|---------|---------|
| **yet-another-react-lightbox** | 3.x | Accessible fullscreen lightbox | Keyboard nav, captions, plugin system (zoom, counter, thumbnails). React 19 compatible. |
| **react-photo-album** | 3.x | Masonry / rows / columns photo layout | Pairs with yet-another-react-lightbox via documented integration example. Responsive, no layout jank. |

Both load only when the Gallery island hydrates — zero cost to hero/about/menu performance budgets.

### Spam Protection

| Technology | Purpose | Why Recommended |
|------------|---------|-----------------|
| **Cloudflare Turnstile** | Invisible CAPTCHA on the wizard submit | Free forever, invisible in most cases (no UX tax), privacy-preserving, Astro-friendly integration via an iframe widget + server-side token verification inside the Astro Action. hCaptcha is an alternative but its visible challenges hurt mobile conversion — unacceptable for a lead-gen wizard. |

### SEO & Structured Data

| Technology | Purpose |
|------------|---------|
| **Astro built-in `<head>` composition** | Per-page metadata, canonical, OG tags — defined per content collection entry via frontmatter + a layout. |
| **JSON-LD (hand-authored)** | `LocalBusiness` + `Restaurant` + `Menu` + `FAQPage` schema emitted in a single `<script type="application/ld+json">` in the root layout. No library needed — schemas are stable, hand-authored JSON is auditable. |
| **@astrojs/sitemap** | Generates sitemap.xml at build | Standard Astro integration. |
| **schema-dts** (optional dev dependency) | TypeScript types for JSON-LD | Catches schema typos at compile time. |

### Analytics & Monitoring

| Technology | Purpose | Why Recommended |
|------------|---------|-----------------|
| **Vercel Analytics + Vercel Speed Insights** | Pageviews + Core Web Vitals | Free tier covers this traffic volume. Zero-config on Vercel. Privacy-respecting (no cookies, aggregate only). Covers the "Core Web Vitals pass" constraint with real-user data. |
| **Sentry** | Error monitoring (form submissions especially) | Free dev plan ample for this scale. Tracks Astro Action failures and client-side errors. Set up from day one so the first booking isn't blocked by an invisible bug. |

Plausible is a fine alternative if the team wants analytics independent of the hosting provider — $9/mo self-hosted or $19/mo hosted. Start with Vercel Analytics; swap to Plausible only if insights are too shallow.

### Deployment

| Platform | Purpose | Why Recommended |
|----------|---------|-----------------|
| **Vercel** | Production hosting, preview deploys, serverless functions for Astro Actions | Astro 6 supports Vercel first-class. Preview deploys on every PR = AI-agent content edits get a real URL to review before merge. Image CDN is built in. Generous hobby tier; Pro ($20/mo) only if traffic/features require it. |

Cloudflare Pages (Workers) is the strategic long-term alternative given the Cloudflare → Astro acquisition (Jan 2026) — Astro 6's dev server runs on workerd, so local = production parity is best-in-class on CF. Defer that move until there's a concrete reason (edge latency, cost at scale, Workers-specific features). Vercel is the path of least resistance today.

### Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | 4.x | Unit tests for the price calculator, Zod schemas, email template rendering. Browser mode is stable in v4 if component tests are needed later. |
| **Playwright** | 1.5x | E2E: full wizard flow (happy path + validation errors + Turnstile bypass in test env), Lighthouse CI check on home page. |

Minimum viable test suite: one Playwright spec walking the wizard end to end + Vitest tests on the price function + Zod schemas. Ship the rest when pain shows up.

### Dev Tooling

| Tool | Purpose | Notes |
|------|---------|-------|
| **Biome** | 2.3+ | Linter + formatter | One binary, one config, ~20x faster than ESLint+Prettier. Astro has a recommended Biome config. Covers ~80% of ESLint rules; the remaining 20% (React Hooks rules, Next-specific — N/A here since we're on Astro) are not load-bearing for this project. |
| **TypeScript strict** | — | `strict: true`, `noUncheckedIndexedAccess: true` | Non-negotiable. |
| **Husky + lint-staged** | latest | Pre-commit hooks | Run Biome on staged files. |
| **GitHub Actions** | — | CI: typecheck, biome check, vitest, playwright against preview deploy | Triggered on PR. Preview URL posted back to PR so the AI content agent can review before merge. |

---

## Installation

```bash
# Core — Astro + React 19 + Tailwind v4 + MDX
pnpm create astro@latest larraes-kitchen -- --template minimal --typescript strict
cd larraes-kitchen
pnpm astro add react mdx tailwind sitemap vercel

# Forms + validation
pnpm add react-hook-form @hookform/resolvers zod

# Content / images
pnpm add @unpic/astro
pnpm add -D schema-dts

# Email
pnpm add resend
pnpm add @react-email/components @react-email/render

# Lead storage
pnpm add @libsql/client

# Spam protection (server verification only; Turnstile widget is a script tag)
# No package needed — call https://challenges.cloudflare.com/turnstile/v0/siteverify via fetch

# Gallery
pnpm add yet-another-react-lightbox react-photo-album

# Analytics + monitoring
pnpm add @vercel/analytics @vercel/speed-insights
pnpm add @sentry/astro @sentry/node

# Dev
pnpm add -D @biomejs/biome
pnpm add -D vitest @vitest/browser-playwright
pnpm add -D @playwright/test
pnpm add -D husky lint-staged
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Astro 6** | Next.js 16 App Router | If the team has strong Next.js fluency, needs React Server Components for dynamic personalization, or foresees expanding into a multi-page app with auth. Penalty: more JS shipped by default — a real cost on a photo-heavy mobile page. |
| Astro 6 | Remix / React Router 7 | If the team values standard-web-APIs-first framework design and plans heavier server-rendered dynamism. Not worth the switch for a mostly-static marketing site. |
| Astro 6 | SvelteKit | If the team knows Svelte and wants a fully-reactive content site. Great framework; loses on ecosystem breadth (shadcn/ui, React Hook Form, React Email all assume React). |
| **Astro Content Collections** | Contentlayer | Do not choose. Contentlayer is effectively abandoned (1 day/month maintenance). Major projects (Dub) have migrated off. |
| Astro Content Collections | Velite | If you're locked into Next.js. Velite is the best Contentlayer successor in the Next.js world. Irrelevant for Astro. |
| Astro Content Collections | fumadocs-mdx | If building a docs site. Overkill for a marketing site. |
| **React Hook Form** | TanStack Form | Pick TanStack if you need framework-agnostic forms, per-field async validation with independent triggers, or if the app grows into highly dynamic wizard schemas. For a 4-step fixed-shape form with a price calculator, RHF is simpler and more documented. |
| React Hook Form | Conform | Pick Conform if the form is primarily server-rendered with minimal client interactivity. The live price estimate pushes toward a client-side store, so RHF fits better. |
| **Tailwind v4** | Vanilla CSS + CSS Modules | If the team dislikes utility-first CSS. Tailwind v4's CSS-first config blurs the line anyway (`@theme`). Stay with Tailwind for ecosystem alignment (shadcn/ui). |
| **shadcn/ui** | Park UI | If you prefer Ark UI primitives over Radix. Park UI is good; shadcn has the larger ecosystem and broader Tailwind v4 support. |
| shadcn/ui | Plain Tailwind components | Fine for very simple pieces, but the wizard (multi-step, focus management, error handling), accordion (FAQ), and dialog (lightbox) benefit from Radix's a11y primitives. |
| **Resend** | Postmark | Pick Postmark if deliverability is mission-critical and the team is willing to pay $15/mo minimum. For <100 transactional emails/month going to one inbox (Larrae), Resend's free tier + React Email DX wins. |
| Resend | SendGrid | Do not choose for this scale — heavier SDK, worse DX, aimed at marketing blast use cases. |
| **Turso** | Neon (Postgres) | Pick Neon if the data model grows relational (multiple related tables with joins, transactions across tables). For a flat `leads` table, SQLite via Turso is simpler, cheaper, faster. |
| Turso | Supabase | Pick Supabase if you also want auth + storage + realtime out of the box. Overkill for v1; revisit if a customer portal is later scoped. |
| Turso | Google Sheets API | Pick Sheets only if Larrae strongly prefers editing leads in Sheets over a simple admin page. Adds OAuth setup + rate-limit headaches. |
| **Cloudflare Turnstile** | hCaptcha | Pick hCaptcha only if the site suffers sophisticated bot attacks that Turnstile can't stop. Very unlikely for this traffic profile. |
| **Vercel Analytics** | Plausible / Umami | Pick Plausible ($9/mo self-hosted) if you want hosting independence or richer segmentation. Umami if you're comfortable self-hosting. |
| **Vercel hosting** | Cloudflare Pages/Workers | Pick Cloudflare if you want tightest Astro-runtime integration post-acquisition, edge-first deploys, or cheaper egress at scale. Defer the move; no concrete advantage at launch volume. |
| Vercel | Netlify | Netlify is fine. Vercel has slightly tighter Astro integration today. |
| **Biome** | ESLint + Prettier | Pick ESLint if you need framework-specific plugins (e.g., `eslint-plugin-next`). Not needed for Astro + React islands at this scope. |
| **pnpm** | Bun | Pick Bun if you value raw install speed and the team tolerates occasional native-module compatibility issues. pnpm is the safer 2026 default for production. |
| pnpm | npm | npm works. pnpm's content-addressed store saves disk and prevents phantom-dependency bugs. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Any headless CMS (Sanity, Contentful, Payload, Strapi, Storyblok)** | Explicitly rejected in PROJECT.md. Adds runtime cost, vendor lock-in, and blocks the AI-agent-via-GitHub content workflow. | Astro Content Collections with markdown-in-repo. |
| **Contentlayer** | Effectively unmaintained (1 day/month of work). Projects have actively migrated off. | Astro Content Collections (native in Astro 6). |
| **Next.js 14 / Pages Router** | End-of-life direction. If Next.js is chosen, use 16 App Router. | Astro 6 (preferred), or Next.js 16 App Router as alternative. |
| **Google reCAPTCHA** | Privacy-hostile, hurts Core Web Vitals, degraded UX on mobile. | Cloudflare Turnstile. |
| **Formspree / Getform / Netlify Forms** | Convenient but hides the form logic from the codebase and doesn't support the live-price-estimate UX. | Astro Actions + own handler. |
| **Google Analytics 4** | Privacy/compliance risk (GDPR, CCPA), cookie banner required, slow. | Vercel Analytics or Plausible. |
| **Raw `<img>` with manual srcset** | Misses AVIF, blur placeholders, lazy loading best practices. | Astro `<Image>` / `<Picture>`. |
| **MDX for every content type** | Overkill for menu items / package specs — invites inline React in data that should stay data. | Plain markdown + YAML frontmatter for structured content; MDX only where inline rich text is actually needed. |
| **Tailwind v3 `tailwind.config.js` pattern** | v4's CSS-first `@theme` is the current idiom; config files are legacy. | `@theme` in a global CSS file. |

---

## Hard-Constraint Cross-Check

- [x] **Markdown-in-repo (no CMS)** — Astro Content Collections, plain `.md` files under `src/content/{menu,packages,testimonials,faqs}/`.
- [x] **AI-agent-editable via GitHub** — Zod frontmatter schemas in `src/content.config.ts` are the canonical contract; directory structure is predictable; PRs trigger Vercel preview deploys for review.
- [x] **Single-page scroll** — One route (`src/pages/index.astro`) composing sections from content collections; anchored navigation via `rehype-slug`.
- [x] **Multi-step wizard w/ live price** — React island using React Hook Form; `watch()` on guests + tier drives a pure `estimate(guests, tier)` function.
- [x] **Lead delivery: email + stored record** — Astro Action → Turnstile verify → Zod validate → Resend + Turso insert in parallel.
- [x] **Mobile-first, WCAG 2.1 AA, CWV pass** — Astro's minimal JS + Tailwind + Radix primitives (shadcn/ui) + `<Image>` AVIF/WebP + Vercel Speed Insights.
- [x] **Local SEO (LocalBusiness/Restaurant JSON-LD)** — Hand-authored JSON-LD in root layout, typed with `schema-dts`.
- [x] **Serverless CI/CD-friendly** — Vercel: PR preview deploys, Astro Actions run as serverless functions.

---

## Cost Implications (v1 Launch)

| Item | Free tier covers launch? | Monthly cost at v1 | Notes |
|------|--------------------------|---------------------|-------|
| Vercel hosting | Yes (Hobby) | $0 | Upgrade to Pro ($20/mo) only if commercial-use policy becomes an issue or traffic spikes. |
| Resend | Yes (3k emails/mo) | $0 | Move to Pro ($20/mo) if transactional volume grows past 3k — extremely unlikely v1. |
| Turso | Yes (5 GB, 500M reads) | $0 | Essentially forever-free at this scale. |
| Cloudflare Turnstile | Always free | $0 | — |
| Vercel Analytics | Yes (included free tier) | $0 | — |
| Sentry | Yes (Developer) | $0 | 5k errors/mo free; swap if exceeded. |
| **Total v1 run cost** | — | **$0** | Optional $9/mo Plausible or $20/mo Vercel Pro later. |

Domain registration + Google Workspace email for Larrae (~$6/mo) are out-of-scope infra costs not listed above.

---

## Confidence Levels

| Decision | Confidence | Decision criteria if LOWER |
|----------|------------|----------------------------|
| **Meta-framework: Astro 6** | HIGH | Would flip to Next.js 16 only if the team has strong Next.js muscle memory and zero Astro experience, or if post-v1 roadmap needs auth + dashboard. |
| **Tailwind v4** | HIGH | Stable, mature, fully supported by shadcn/ui and Astro 6. |
| **shadcn/ui** | HIGH | Correct fit for accessibility primitives; no ongoing dependency risk (copy-in pattern). |
| **React Hook Form** | HIGH | Proven, well-documented, fits the wizard + live-estimate pattern cleanly. |
| **Content Collections (Astro native)** | HIGH | Native to Astro 6, Zod-typed, 2x-5x faster than alternatives, AI-agent-friendly by design. |
| **Cloudflare Turnstile** | HIGH | Free + invisible + CWV-friendly beats every alternative for this traffic. |
| **Resend + React Email** | HIGH | Free tier covers launch; DX is the best in class. |
| **Turso for lead storage** | MEDIUM | If Larrae strongly prefers editing leads in Google Sheets (non-technical accessibility), flip to Sheets API. Decision criteria: does Larrae need read access without building a simple admin view? If yes → Sheets. If okay with a passwordless magic-link admin page → Turso. |
| **Vercel hosting** | MEDIUM | Solid today. May revisit Cloudflare Pages once the Astro→Cloudflare integration is fully paved (late 2026). Decision criteria: does Workers runtime parity in development materially reduce bugs? Not v1's problem. |
| **Vercel Analytics vs Plausible** | MEDIUM | Start Vercel; evaluate after 60 days of real traffic. Decision criteria: are the Vercel insights deep enough to tune conversion? If no → Plausible. |
| **Biome vs ESLint** | MEDIUM | Biome covers 80% of rules; missing rules (React Hooks, framework-specific) are not relevant to an Astro-first codebase. Decision criteria: does the team hit a specific rule gap? Add ESLint alongside or fall back. |
| **pnpm vs Bun** | MEDIUM | pnpm is the safer default. Decision criteria: does install speed become a developer-experience bottleneck? Unlikely at this scope. |
| **Next.js 16 as runner-up** | MEDIUM | Documented as the fallback if Astro turns out to be a poor fit for any discovered requirement. |

---

## Stack Patterns by Variant

**If v2 adds a customer portal / repeat-client login:**
- Keep Astro for marketing; add an auth-protected app behind `/portal` using Supabase (replaces Turso) + Astro server-rendered routes.
- Because: SQLite is pleasant for leads but joining leads → bookings → invoices grows relational fast.

**If content volume explodes (blog, recipe archive):**
- Stay on Astro Content Collections — they scale to thousands of entries fine.
- Consider splitting `blog` into its own collection loader with on-demand rendering if build times exceed 60s.

**If Larrae outgrows editing via AI agent and wants direct UI:**
- Add [CloudCannon](https://cloudcannon.com/) or [TinaCMS](https://tina.io/) as a Git-backed visual editor over the same markdown files. Preserves the markdown-in-repo constraint while giving a non-technical editing surface.

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Astro 6.0+ | React 19.2, Tailwind 4.x, Node 22.12+ | Hard floor on Node 22.12 — upgrade local dev environments accordingly. |
| shadcn/ui (Tailwind v4 track) | Tailwind 4.x, React 19 | Use the Tailwind v4 docs at `ui.shadcn.com/docs/tailwind-v4`; older v3 examples will not work unmodified. |
| React Hook Form 7 | React 19 | Confirmed stable; `useActionState` interop works when wiring RHF's `handleSubmit` to Astro Actions. |
| React Email 5 | Tailwind 4 (via `@react-email/tailwind`), React 19 | Dark mode preview and new components included. |
| @astrojs/vercel | Astro 6 | Use the latest adapter; image CDN auto-configured. |
| @libsql/client | Node 22, Vercel serverless | Works on Vercel Functions. Avoid Edge runtime until/unless verified for your use. |

---

## Sources

### Frameworks & runtimes
- [Astro 6.0 release (2026-03-10)](https://astro.build/blog/astro-6/) — HIGH confidence
- [Astro 6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/) — HIGH
- [What's new in Astro — March 2026](https://astro.build/blog/whats-new-march-2026/) — HIGH
- [Cloudflare acquires Astro (2026-01-16)](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/) — HIGH
- [Astro in 2026: Why it's beating Next.js for content sites](https://dev.to/polliog/astro-in-2026-why-its-beating-nextjs-for-content-sites-and-what-cloudflares-acquisition-means-6kl) — MEDIUM
- [Next.js 16 release notes](https://nextjs.org/blog/next-16) — HIGH
- [Next.js 16 changelog / endoflife.date](https://endoflife.date/nextjs) — HIGH
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — HIGH
- [Astro Actions](https://docs.astro.build/en/guides/actions/) — HIGH
- [Astro @astrojs/react integration](https://docs.astro.build/en/guides/integrations-guide/react/) — HIGH

### Styling
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — HIGH
- [Tailwind CSS 4.2 (2026-02-18, InfoQ)](https://www.infoq.com/news/2026/04/tailwind-css-4-2-webpack/) — HIGH
- [Tailwind v4 migration guide (2026)](https://dev.to/pockit_tools/tailwind-css-v4-migration-guide-everything-that-changed-and-how-to-upgrade-2026-5d4) — MEDIUM
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — HIGH
- [shadcn/ui Next.js 15 + React 19](https://ui.shadcn.com/docs/react-19) — HIGH

### Content pipeline
- [Contentlayer abandonment analysis (Wisp CMS)](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — MEDIUM
- [Dub migrating Contentlayer → Content Collections](https://dub.co/blog/content-collections) — HIGH
- [Fumadocs MDX roadmap](https://www.fumadocs.dev/blog/fumadocs-mdx-road-map) — HIGH

### Forms
- [TanStack Form vs React Hook Form (LogRocket)](https://blog.logrocket.com/tanstack-form-vs-react-hook-form/) — MEDIUM
- [Choosing a React form library in 2026 (Formisch)](https://formisch.dev/blog/react-form-library-comparison/) — MEDIUM
- [TanStack Form official comparison](https://tanstack.com/form/latest/docs/comparison) — HIGH

### Email
- [React Email 5.0](https://resend.com/blog/react-email-5) — HIGH
- [Resend vs Postmark comparison (Knock benchmarks)](https://knock.app/email-api-benchmarks/compare/postmark-vs-resend) — MEDIUM
- [Email API pricing April 2026](https://www.buildmvpfast.com/api-costs/email) — MEDIUM

### Database
- [Neon vs Supabase vs Turso 2026 (PkgPulse)](https://www.pkgpulse.com/blog/neon-vs-supabase-vs-turso-2026) — MEDIUM
- [6 Best Serverless SQL Databases 2026](https://www.devtoolsacademy.com/blog/serverless-sql-databases/) — MEDIUM
- [Turso free-tier and pricing](https://www.buildmvpfast.com/alternatives/turso) — MEDIUM

### Images & gallery
- [Next.js Image component reference](https://nextjs.org/docs/app/api-reference/components/image) — HIGH (relevant for comparison context)
- [Astro Images guide](https://docs.astro.build/en/guides/images/) — HIGH
- [Unpic Astro image service](https://unpic.pics/img/astro/) — HIGH
- [Yet Another React Lightbox docs](https://yet-another-react-lightbox.com/) — HIGH
- [React Photo Album lightbox integration](https://react-photo-album.com/examples/lightbox) — HIGH

### Spam / analytics
- [Cloudflare Turnstile](https://www.cloudflare.com/application-services/products/turnstile/) — HIGH
- [hCaptcha vs Turnstile 2026 (Websyro)](https://www.websyro.com/blogs/hcaptcha-vs-cloudflare-turnstile-2026-comparison) — MEDIUM
- [Privacy-compliant analytics 2026 (Mitzu)](https://mitzu.io/post/best-privacy-compliant-analytics-tools-for-2026/) — MEDIUM
- [Plausible vs Umami (Vemetric)](https://vemetric.com/blog/plausible-vs-umami) — MEDIUM

### Testing / tooling
- [Vitest Browser Mode](https://vitest.dev/guide/browser/) — HIGH
- [Biome vs ESLint + Prettier 2026 (PkgPulse)](https://www.pkgpulse.com/blog/biome-vs-eslint-prettier-linting-2026) — MEDIUM
- [Biome migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/) — HIGH
- [pnpm vs Bun vs npm 2026 (PkgPulse)](https://www.pkgpulse.com/blog/pnpm-vs-bun-vs-npm-2026) — MEDIUM

---

*Stack research for: photography-heavy, markdown-driven single-page catering marketing site*
*Researched: 2026-04-15*
