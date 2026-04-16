# Architecture Research

**Domain:** Markdown-driven, photography-heavy, single-page catering marketing site with multi-step wizard inquiry, live price estimate, transactional email, and stored lead records.
**Researched:** 2026-04-15
**Confidence:** HIGH (well-trodden Next.js + Vercel + Resend pattern; the only MEDIUM-confidence area is lead storage choice, which is a business-preference question more than a technical one)

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                  BROWSER                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  Single-page scroll (one route)                                       │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌───────┐ ┌──────┐ ┌────┐    │    │
│  │  │ Hero │ │About │ │ Menu │ │Packages│ │Gallery│ │Testi.│ │FAQ │    │    │
│  │  └──────┘ └──────┘ └──────┘ └────────┘ └───────┘ └──────┘ └────┘    │    │
│  │                           ↓                                           │    │
│  │                  ┌────────────────────┐                               │    │
│  │                  │ Inquiry Wizard     │ (client island)               │    │
│  │                  │ + Live Estimate    │                               │    │
│  │                  └─────────┬──────────┘                               │    │
│  └────────────────────────────┼───────────────────────────────────────────┘   │
└───────────────────────────────┼───────────────────────────────────────────────┘
                                │ POST (Server Action)
                                ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL EDGE / NODE                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 15 App Router                                │  │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │  │
│  │  │ RSC page     │   │ Server Action│   │ Route Handler│               │  │
│  │  │ (assembles   │   │ submitLead() │   │ /sitemap.xml │               │  │
│  │  │  sections    │   │              │   │ /robots.txt  │               │  │
│  │  │  from MD)    │   │              │   │              │               │  │
│  │  └──────┬───────┘   └──────┬───────┘   └──────────────┘               │  │
│  │         │                  │                                           │  │
│  │  ┌──────┴───────┐   ┌──────┴──────────────────────────┐               │  │
│  │  │ Content      │   │ Services (lib/)                  │               │  │
│  │  │ Collections  │   │ ┌────────┐ ┌─────────┐ ┌──────┐ │               │  │
│  │  │ (build-time  │   │ │ estimate│ │ email   │ │ leads│ │               │  │
│  │  │  compile MD) │   │ │ .ts     │ │ .ts     │ │ .ts  │ │               │  │
│  │  └──────┬───────┘   │ └────────┘ └────┬────┘ └───┬──┘ │               │  │
│  └─────────┼──────────────────────────────┼──────────┼───┘                  │
└────────────┼──────────────────────────────┼──────────┼──────────────────────┘
             │                              │          │
             ↓                              ↓          ↓
   ┌──────────────────┐         ┌──────────────┐  ┌───────────────────┐
   │ content/*.md     │         │ Resend API   │  │ Lead store        │
   │ (git repo)       │         │ + React      │  │ (see §6 — pluggable│
   │ + public/images/ │         │   Email      │  │  interface)       │
   └──────────────────┘         └──────────────┘  └───────────────────┘
             ↑
             │ PR
   ┌──────────────────┐
   │ AI agent +       │
   │ GitHub + Vercel  │
   │ preview deploys  │
   └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Content Layer** | Parse, validate, type, serve markdown to the app | Content Collections + Zod schemas + MDX (optional) |
| **Page Shell** | Single RSC page composing sections, global layout, SEO head | `app/page.tsx` (RSC) |
| **Section Components** | Render one section from typed content | RSC by default; client only when needed (gallery, wizard) |
| **Wizard Island** | Multi-step form state, progressive disclosure, live estimate | Client Component (`"use client"`) |
| **Pricing Engine** | Pure function: `(guests, packageTier, addons) → estimate` | `lib/pricing.ts`, shared client + server |
| **Submit Action** | Validate → email → store → return result | Server Action (`"use server"`) |
| **Email Service** | Render React Email template, call Resend | `lib/email.ts` |
| **Lead Store Adapter** | Persist lead record (pluggable backend) | `lib/leads/*` with interface + one implementation |
| **Spam Guard** | Honeypot + Turnstile verification + simple IP rate limit | `lib/spam.ts` (verifies Turnstile token) |
| **SEO Layer** | Metadata, JSON-LD (LocalBusiness, Restaurant, FAQ), sitemap | `lib/seo.ts` + `app/sitemap.ts` + component-level `<JsonLd>` |
| **Image Pipeline** | Next `<Image>` optimization, placeholder generation, lightbox | `next/image` + `plaiceholder` (build-time LQIP) |
| **Observability** | Analytics, error tracking, funnel events | Vercel Analytics + Sentry + custom funnel events |

---

## 2. Content Layer

### 2.1 Why Content Collections (not Contentlayer)

Contentlayer is **effectively unmaintained** (sponsor acquired by Netlify, stagnant repo). The drop-in successor is **Content Collections** — actively maintained, App Router / RSC compatible, Zod-native. This is the right choice for a 2026 greenfield.

If stack research picks a framework other than Next.js (e.g., Astro), the directory layout below is portable; only the compiler changes (Astro has first-class Content Collections built in).

### 2.2 Directory structure

```
content/
├── site.md                        # global config: NAP, hours, nav, social, service area
├── hero.md                        # hero headline, subhead, CTA, image
├── about.md                       # chef heritage narrative, about image
├── packages/
│   ├── small.md                   # 10–20 guests, pricing range
│   ├── medium.md                  # 21–30 guests
│   └── large.md                   # 50–75 guests
├── menu/
│   ├── proteins/
│   │   ├── smothered-chicken.md
│   │   ├── fried-fish.md
│   │   ├── brisket.md
│   │   ├── bbq-ribs.md
│   │   └── eggplant-parm.md
│   ├── sides/
│   │   ├── collard-greens.md
│   │   ├── mac-and-cheese.md
│   │   ├── candied-yams.md
│   │   ├── black-eyed-peas.md
│   │   └── cornbread.md
│   └── desserts/
│       ├── peach-cobbler.md
│       ├── banana-pudding.md
│       └── sweet-potato-pie.md
├── testimonials/
│   ├── cynthia-family.md
│   ├── ethan-social.md
│   └── emma-corporate.md
├── faq/
│   ├── ordering.md                # one file per group, each with an items[] array
│   ├── delivery.md
│   ├── menu-customization.md
│   └── payment.md
└── gallery/
    └── gallery.md                 # ordered list of image refs + captions + alt

public/images/
├── hero/
├── about/
├── menu/
├── gallery/
└── og/                            # social share cards

content.config.ts                  # Content Collections schemas (Zod)
```

### 2.3 Frontmatter schemas (Zod)

```typescript
// content.config.ts (excerpt)
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const menuItem = defineCollection({
  name: "menuItem",
  directory: "content/menu",
  include: "**/*.md",
  schema: z.object({
    name: z.string(),
    category: z.enum(["protein", "side", "dessert"]),
    description: z.string().max(280),
    dietary: z.array(z.enum(["vegetarian", "vegan", "gf", "df", "contains-pork"])).default([]),
    featured: z.boolean().default(false),
    image: z.string().optional(),       // /images/menu/...
    imageAlt: z.string().optional(),
    order: z.number().default(999),     // display sort
  }),
});

const pkg = defineCollection({
  name: "package",
  directory: "content/packages",
  include: "*.md",
  schema: z.object({
    id: z.enum(["small", "medium", "large"]),
    name: z.string(),
    guestRange: z.object({ min: z.number(), max: z.number() }),
    pricePerPerson: z.object({ min: z.number(), max: z.number() }),
    includes: z.array(z.string()),        // bullets
    popular: z.boolean().default(false),
    order: z.number(),
  }),
});

const testimonial = defineCollection({
  name: "testimonial",
  directory: "content/testimonials",
  include: "*.md",
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),                     // "Family host", "Corporate planner"
    segment: z.enum(["residential", "social", "corporate"]),
    eventDate: z.string().optional(),
    image: z.string().optional(),
    order: z.number().default(999),
  }),
});

const faqGroup = defineCollection({
  name: "faqGroup",
  directory: "content/faq",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    order: z.number(),
    items: z.array(z.object({
      q: z.string(),
      a: z.string(),                      // markdown allowed (rendered)
    })),
  }),
});

const site = defineCollection({
  name: "site",
  directory: "content",
  include: "site.md",
  schema: z.object({
    business: z.object({
      name: z.string(),
      legalName: z.string().optional(),
      tagline: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.object({
        locality: z.string(),             // "Benicia"
        region: z.string(),               // "CA"
        postalCode: z.string().optional(),
        country: z.string().default("US"),
      }),
      serviceArea: z.array(z.string()),   // ["Benicia", "Vallejo", "Martinez", ...]
      hours: z.array(z.object({
        day: z.enum(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]),
        opens: z.string(),
        closes: z.string(),
      })).optional(),
    }),
    social: z.object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      google: z.string().url().optional(),
    }),
    seo: z.object({
      ogImage: z.string(),
      ogTitle: z.string(),
      ogDescription: z.string(),
    }),
  }),
});
```

**Why Zod here, explicitly:** validation failures become **CI-blocking build errors**. An AI agent PR with a broken schema never reaches production. This is the single biggest defense against unattended content editing.

### 2.4 Build-time vs request-time

| Data | When | Why |
|------|------|-----|
| All content collections | Build time | Static; no reason to fetch per request |
| Rendered page HTML | Build time (SSG) | Marketing site, identical for every visitor |
| Wizard state | Request time (client only) | Ephemeral, never server-persisted pre-submit |
| Price estimate | Request time (client only, pure function) | No network |
| Submit | Request time (Server Action) | Needs server for email/store + secrets |

**No ISR needed.** Full rebuild on content change is < 30s on Vercel for a site of this size. Preview deployments per PR give instant WYSIWYG.

### 2.5 AI-agent editing flow (GitHub)

```
[AI agent]  ──(1)──▶  git branch + commit markdown changes
     │
     ▼
(2) Open PR on GitHub
     │
     ▼
(3) GitHub Actions CI:
     • typecheck
     • content schema validation (Content Collections compile)
     • lint
     • build
     • Playwright smoke (home renders, wizard submits to mock)
     │
     ▼
(4) Vercel preview deployment  ──▶  Larrae / reviewer opens preview URL
     │                                         │
     │                                         ▼
     │                                   Review content live
     │                                         │
     ▼                                         ▼
(5) PR merged to main  ──────────────▶  Vercel production deploy
```

Agent should never push to `main` directly; `main` is protected. Every content change is a PR + preview. CI schema validation is the safety net.

---

## 3. Rendering Model

**Decision: SSG for the page, client islands for interactive bits.**

| Section | Rendering | Notes |
|---------|-----------|-------|
| Hero | RSC, SSG | Primary CTA is a link to `#inquiry` anchor |
| About | RSC, SSG | Pure content |
| Menu | RSC, SSG | Filter/group on server from typed collection |
| Packages | RSC, SSG | Server-rendered cards; "Get quote" links to `#inquiry` with pre-selected tier |
| Gallery | RSC shell + client lightbox island | Image grid static; lightbox hydrates on interact |
| Testimonials | RSC, SSG | |
| FAQ | RSC shell + `<details>` for accordion (no JS) | `<details>`/`<summary>` gives free accordion with zero JS |
| Contact / Wizard | Client island | Entire wizard is one client component tree |

**Single-page composition pattern:**

```tsx
// app/page.tsx (RSC)
export default async function HomePage() {
  const site = await getSite();
  const hero = await getHero();
  const about = await getAbout();
  const packages = await getPackages();        // sorted
  const menu = await getMenuByCategory();      // grouped
  const testimonials = await getTestimonials();
  const faqGroups = await getFaqGroups();
  const gallery = await getGallery();

  return (
    <>
      <SiteJsonLd site={site} faqGroups={faqGroups} />
      <Nav />
      <main>
        <HeroSection id="hero" data={hero} />
        <AboutSection id="about" data={about} />
        <MenuSection id="menu" data={menu} />
        <PackagesSection id="packages" data={packages} />
        <GallerySection id="gallery" data={gallery} />
        <TestimonialsSection id="testimonials" data={testimonials} />
        <FaqSection id="faq" data={faqGroups} />
        <InquirySection id="inquiry" packages={packages} />  {/* wraps the client wizard */}
      </main>
      <Footer site={site} />
    </>
  );
}
```

**Navigation = anchors.** No client-side router needed. Smooth scroll via CSS `scroll-behavior: smooth` with `scroll-margin-top` on each section for fixed-nav offset.

---

## 4. Form Architecture

### 4.1 Wizard state model

Single client component owning a finite state machine of steps. Recommended shape:

```typescript
type WizardStep = "event-type" | "guests-date" | "package" | "details" | "review";

type WizardState = {
  step: WizardStep;
  eventType?: "residential" | "social" | "corporate";
  guestCount?: number;
  eventDate?: string;           // ISO
  packageId?: "small" | "medium" | "large";
  addons?: string[];
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  // submission
  status: "idle" | "submitting" | "ok" | "error";
  error?: string;
};
```

**State library: none needed.** `useReducer` is sufficient. Don't reach for Zustand/Jotai for a 5-step form.

**URL sync:** push `?step=package` via `window.history.replaceState` on step change. Enables back-button, shareable deep links, and analytics attribution without a full router swap. Do **not** use Next's `router.push` — it will trigger RSC re-fetch.

**Progressive disclosure:** each step validates its own slice with Zod before advancing. Global Zod schema validates on submit.

```typescript
// lib/inquiry-schema.ts (shared client + server)
export const inquirySchema = z.object({
  eventType: z.enum(["residential", "social", "corporate"]),
  guestCount: z.number().int().min(10).max(200),
  eventDate: z.string().refine(isFutureISODate),
  packageId: z.enum(["small", "medium", "large"]),
  addons: z.array(z.string()).default([]),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().max(1000).optional(),
  // anti-spam
  honeypot: z.string().max(0),              // must be empty
  turnstileToken: z.string().min(1),
});
```

### 4.2 Live price estimate

**Pure function, no network, no state library:**

```typescript
// lib/pricing.ts  (shared client + server)
export function estimate(input: {
  guestCount: number;
  packageId: "small" | "medium" | "large";
  packages: Package[];                       // passed from content
}): { low: number; high: number; perPerson: { low: number; high: number } } {
  const pkg = input.packages.find(p => p.id === input.packageId);
  if (!pkg) return { low: 0, high: 0, perPerson: { low: 0, high: 0 } };
  return {
    perPerson: pkg.pricePerPerson,
    low:  input.guestCount * pkg.pricePerPerson.min,
    high: input.guestCount * pkg.pricePerPerson.max,
  };
}
```

Package tier config is **sourced from markdown** (`content/packages/*.md`) and **passed into the wizard via props from the RSC parent**. The pricing function is pure and identical on server (for re-validation) and client (for live UI).

**Display:** "Estimated total: $480 – $600" with a "Final quote confirmed by Larrae" disclaimer.

### 4.3 Submission flow

```
[Wizard client]
    │ 1. User clicks Submit on Review step
    │    - client-side Zod validates
    │    - collect Turnstile token
    ▼
submitLead(formData)                              ◀── Server Action ("use server")
    │ 2. Server re-validates with Zod             (NEVER trust the client)
    │ 3. Verify Turnstile token with Cloudflare   (spam gate)
    │ 4. Rate-limit by IP (simple in-memory + KV) (abuse gate)
    │ 5. Compute server-side estimate             (so email/record match logic)
    │ 6. Try: store lead   ──► leadStore.save()   (fire first; if fails, bail)
    │ 7. Try: send email   ──► emailService.send()(if fails, mark record degraded)
    │ 8. Return { ok, leadId } OR { ok:false, reason }
    ▼
[Wizard client]
    - Advance to "success" step (inline, not redirect) with confirmation message
    - On error: keep user on review step, surface message, allow retry
```

**Ordering rationale:** store first, then email. If email fails but store succeeded, Larrae can still see the lead in the store and CI/cron can retry the email. If we emailed first and the store failed, we'd have a notification with no persistent record.

**Retry semantics:**
- Client retries once automatically on network error, then shows a manual "Try again" button.
- Server Action is **idempotent by request id** — include a client-generated UUID in the form data; store checks for dupes within 10 minutes.

### 4.4 Spam mitigation stack

| Layer | Tool | Role |
|-------|------|------|
| Honeypot | Hidden input `honeypot` with `tabindex=-1` + `aria-hidden` | Catches dumb bots |
| Challenge | Cloudflare Turnstile (free, invisible, privacy-respecting) | Catches most bots without captcha friction |
| Rate limit | IP-keyed, 5 submits / 10 min | Uses Vercel KV or Upstash Redis |
| Content checks | Reject obvious link spam in `notes` (regex: more than 2 URLs) | Cheap last line |

**Why Turnstile over reCAPTCHA:** no Google branding, no third-party cookie, free, minimal privacy impact. reCAPTCHA v3 is the fallback if Turnstile coverage in a given region becomes a problem.

---

## 5. Email Pipeline

### 5.1 Provider

**Resend** as primary. Rationale:
- React Email is first-class (templates are real React components — matches the rest of the stack)
- Generous free tier (3k emails/mo, 100/day) — dwarfs inquiry volume for v1
- Vercel integration sets env vars in one click
- Simple DKIM/SPF setup

Alternative if Resend is unacceptable: **Postmark** (better deliverability rep, more expensive; recommended only if Resend delivery rates disappoint in smoke tests).

### 5.2 Emails sent

| Email | Trigger | Recipient | Purpose |
|-------|---------|-----------|---------|
| **Lead notification** | Every submit | Larrae | Rich summary (name, event type, date, guests, package, estimate, notes) + `mailto:` reply |
| **Lead confirmation** | Every submit | The inquirer | Sets expectations ("Larrae will respond within 24h"), echoes what they submitted, signals legitimacy |

**Recommendation: ship both.** The confirmation email is the single biggest trust signal you can give a catering lead — it's the difference between "did my form go through?" anxiety and "they got it, she'll call." It also reduces "did you get my inquiry?" follow-up emails.

### 5.3 Templates

`emails/` directory, React Email components:

```
emails/
├── LeadNotification.tsx          # to Larrae
├── LeadConfirmation.tsx          # to inquirer
└── _shared/
    ├── Layout.tsx
    └── Brand.tsx
```

Render to HTML at request time with `@react-email/render`. Both emails get plaintext fallbacks (auto-generated).

### 5.4 Failure handling

```
storeLeadResult = await leadStore.save(lead)
if (!storeLeadResult.ok) return { ok:false, reason:"store" }     // bail entire request

try {
  await emailService.send(toLarrae)
} catch (err) {
  // do NOT fail the user's submission — the lead is already stored
  await leadStore.markEmailDegraded(storeLeadResult.id, err)
  // fire Sentry alert; Larrae gets a cron-delivered digest of degraded leads
}

try {
  await emailService.send(toInquirer)
} catch (err) {
  // non-fatal, not worth retrying inline
  await leadStore.markConfirmationDegraded(storeLeadResult.id, err)
}

return { ok:true, leadId: storeLeadResult.id }
```

A **daily cron** (Vercel Cron) scans for degraded records < 24h old and retries. After 24h it sends Larrae a digest email: "3 leads came in but I couldn't email you about them — here they are."

---

## 6. Lead Storage

This is the **only MEDIUM-confidence decision**. The right answer depends on how Larrae will actually work with leads.

### 6.1 Decision matrix

| Option | Owner-viewable | Dev ergonomics | Reliability | Setup cost | Recommendation |
|--------|---------------|----------------|-------------|------------|----------------|
| **Google Sheets (via API)** | Excellent — she already uses Google | Decent — sheets API is verbose but stable | Rock-solid | 30 min | **Top pick for v1** |
| **Airtable** | Excellent — polished UI, filters, views, phone apps | Excellent — typed REST API | Rock-solid | 45 min | Strong alt; paid tier at scale |
| **Neon (Postgres)** | None without admin UI | Excellent | Excellent (free tier) | 1 hr (incl. admin UI) | Best if Larrae won't touch it |
| **Turso (SQLite)** | None without admin UI | Excellent | Excellent | 1 hr | Same tradeoff as Neon |
| **Supabase** | OK — has a built-in table editor, but it's a dev tool | Excellent | Excellent | 1 hr | Overkill for v1 |
| **Plain file (git-committed)** | None | Awful (race conditions, PII in git) | Bad | — | **Do not do this** |
| **Email-only, no store** | She sees leads in inbox | Trivial | Email deliverability = single point of failure | 0 | **Rejected** — constraint says stored |

### 6.2 Recommendation: **Google Sheets as the primary store, behind a `LeadStore` interface**

**Rationale:**
1. Larrae sees every lead in a tool she already uses on her phone.
2. She can filter, sort, mark as "called / booked / lost" by editing a column — free CRM.
3. Zero login friction ("how do I see my leads?" has the answer: "open this sheet").
4. If volume spikes past ~10k leads, swap the backend behind the interface without changing the Server Action.

**The interface:**
```typescript
// lib/leads/types.ts
export type Lead = { /* schema below */ };
export type LeadId = string;

export interface LeadStore {
  save(lead: Omit<Lead, "id"|"createdAt">): Promise<{ ok:true; id:LeadId } | { ok:false; error:string }>;
  markEmailDegraded(id: LeadId, error: unknown): Promise<void>;
  markConfirmationDegraded(id: LeadId, error: unknown): Promise<void>;
  listDegraded(sinceHoursAgo: number): Promise<Lead[]>;
}

// lib/leads/sheets-store.ts    ← v1 implementation
// lib/leads/neon-store.ts       ← upgrade path if/when needed
```

### 6.3 Schema (whichever backend)

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | Server-generated |
| `createdAt` | ISO timestamp | Server clock |
| `eventType` | enum | residential / social / corporate |
| `guestCount` | int | 10–200 |
| `eventDate` | ISO date | Event, not submission |
| `packageId` | enum | small / medium / large |
| `estimateLow` | int cents | Server-computed |
| `estimateHigh` | int cents | Server-computed |
| `name` | string | |
| `email` | string | |
| `phone` | string? | Optional |
| `notes` | string? | Up to 1000 chars |
| `addons` | string[] | |
| `source` | string | `referer` header or `utm_source` |
| `userAgent` | string | For spam forensics |
| `ip` | string | Last-octet-masked |
| `status` | enum | `new`, `email_degraded`, `confirmation_degraded`, `contacted`, `booked`, `lost` — owner-editable |
| `ownerNotes` | string | Larrae's column, app never touches after insert |

Indexes (when on Postgres): `createdAt DESC`, `status`, `email`.

### 6.4 How Larrae views leads

**v1:** Open the Google Sheet (bookmarked on phone). That is the product. No admin UI to build.

**v2 (if needed):** A password-protected `/admin` route that reads the same `LeadStore` and adds filters + status transitions. Deferred — do not build in v1.

---

## 7. Image Pipeline

### 7.1 Where images live

**Committed to the repo under `public/images/`**, served via Next `<Image>`. Rationale:
- One artifact. No separate CDN to manage, no orphaned-image sync problem.
- AI-agent workflow stays in-repo (agent can reference `/images/menu/brisket.jpg` same way it references markdown).
- Vercel's image optimizer gives AVIF/WebP at the edge automatically.

**Size budget:** keep originals ≤ 2500px on longest side, ≤ 500 KB. Enforce via CI check (fail the build if `public/images/**` contains files > 600 KB).

### 7.2 Responsive / art-directed loading

Use `<Image>` with `sizes` attribute tuned to layout:

```tsx
<Image
  src={item.image}
  alt={item.imageAlt}
  width={1600} height={1000}
  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
  placeholder="blur"
  blurDataURL={item.blurDataURL}
  className="..."
/>
```

**Art direction** (different crop for mobile hero vs desktop hero): use CSS `object-position` first. Only fall back to `<picture>` with separate mobile/desktop sources if the hero actually needs different crops — likely yes for the hero.

### 7.3 Format strategy

Next's image optimizer emits AVIF with WebP fallback automatically. Originals can be JPG; the pipeline produces AVIF/WebP.

Exception: **gallery masonry grid** — static images that never resize. Pre-optimize once with `@squoosh/lib` at build time to avoid the per-request optimizer cost.

### 7.4 Gallery workflow for non-technical owner

Options, from best to worst for Larrae:

1. **Agent-assisted upload (recommended).** Larrae drops photos into a shared folder; AI agent resizes, renames, commits, opens PR with `content/gallery/gallery.md` updated. Preview URL for approval.
2. **Cloudinary folder, referenced by URL.** Larrae uploads via Cloudinary's UI; the markdown file references Cloudinary URLs. Keeps her out of git entirely, but adds a vendor.
3. **Direct git via GitHub web UI.** Only viable if she's comfortable with drag-and-drop upload in a browser. Lots of caterers are not.

**Pick option 1.** It fits the AI-agent-as-CMS constraint from `PROJECT.md` and avoids a new vendor.

### 7.5 Placeholder generation

Use **`plaiceholder`** at build time to generate 10-byte base64 LQIP blurs for every content image. These are injected into the MDX frontmatter at compile time so the client gets a blurred preview with zero runtime cost. Critical for the photography-heavy hero not to flash unstyled.

---

## 8. SEO Layer

### 8.1 JSON-LD injection

Single-page site → single JSON-LD block in `<head>`, containing:

- **LocalBusiness** / **Restaurant** (the latter is more specific; Restaurant extends LocalBusiness)
- **FAQPage** (populated from `content/faq/*.md`)

```tsx
// components/SiteJsonLd.tsx
export function SiteJsonLd({ site, faqGroups }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Restaurant", "LocalBusiness"],
        "@id": `${site.url}#business`,
        name: site.business.name,
        servesCuisine: "Soul Food",
        priceRange: "$$",
        address: { "@type": "PostalAddress", ...site.business.address },
        areaServed: site.business.serviceArea.map(a => ({ "@type": "City", name: a })),
        telephone: site.business.phone,
        email: site.business.email,
        sameAs: Object.values(site.social).filter(Boolean),
        openingHoursSpecification: site.business.hours?.map(h => ({ ... })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqGroups.flatMap(g => g.items).map(item => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
```

**Validate with** Google Rich Results Test as a manual smoke step before production launch.

### 8.2 Sitemap + robots

`app/sitemap.ts` and `app/robots.ts` — Next 15 native support. Sitemap has one entry (`/`) plus anchors aren't indexed separately. This is fine.

### 8.3 Metadata (per "section" — really per share context)

Single route, so `metadata` is defined once. But OG tags per anchor-shared link aren't possible without per-URL uniqueness — accept this. The tradeoff of single-page.

**Mitigation:** if a future need emerges, add lightweight `/share/menu`, `/share/packages` routes that redirect to `/#menu` with distinct OG tags. Not v1.

---

## 9. Observability

| Concern | Tool | Wiring |
|---------|------|--------|
| **Traffic analytics** | Vercel Analytics (privacy-respecting, cookieless) | One env var |
| **Core Web Vitals** | Vercel Speed Insights | One env var |
| **Error tracking** | Sentry | `@sentry/nextjs`, sample at 10% in prod |
| **Funnel tracking** | Vercel Analytics custom events | `track("wizard_step", { step, eventType })` |

**Funnel events to fire:**
```
wizard_start           — user focuses first field
wizard_step_complete   — on each step advance, with {step, ms_on_step}
wizard_estimate_shown  — first time estimate appears
wizard_submit_attempt
wizard_submit_success  — with {packageId, guestCount}
wizard_submit_error    — with {reason}
wizard_abandon         — beforeunload with partial state
```

**Privacy:** Vercel Analytics is GDPR/CCPA-safe without a cookie banner (doesn't set cookies). Do not add GA4; it forces a cookie banner.

---

## 10. Build/Deploy Pipeline

### 10.1 Environments

| Env | Trigger | URL |
|-----|---------|-----|
| **Preview** | Every PR | `*.vercel.app` per-branch |
| **Production** | Merge to `main` | Custom domain |

### 10.2 CI (GitHub Actions, gated on PR)

```yaml
# .github/workflows/ci.yml (concept)
jobs:
  quality:
    - typecheck (tsc --noEmit)
    - lint (eslint)
    - content validate (content-collections compile --check)
    - unit tests (vitest) — pricing fn, schema, adapters
    - build (next build)
    - image budget check (no file in public/images > 600KB)
  smoke:
    - playwright: home renders, all anchors present, wizard submits to mock endpoint
```

CI must pass before Vercel preview is marked "ready for review."

### 10.3 Env vars

| Var | Scope | Purpose |
|-----|-------|---------|
| `RESEND_API_KEY` | Production + Preview | Email |
| `LEAD_NOTIFICATION_TO` | Production + Preview | Larrae's inbox |
| `TURNSTILE_SECRET_KEY` | Production + Preview | Spam verify |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | All | Client widget |
| `SHEETS_SERVICE_ACCOUNT_JSON` | Production + Preview | Lead store auth |
| `SHEETS_SPREADSHEET_ID` | Production + Preview | Target sheet |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Production + Preview | Rate limit + idempotency |
| `SENTRY_DSN` | Production only | Error tracking |
| `SENTRY_AUTH_TOKEN` | CI | Source map upload |

**Preview environment MUST use a test spreadsheet** (different `SHEETS_SPREADSHEET_ID`) and a dev-mode Resend API key that routes all mail to a catch-all dev inbox — not Larrae's inbox. Otherwise, every PR spams her.

---

## 11. Recommended Project Structure

```
.
├── app/
│   ├── page.tsx                    # single-page composition (RSC)
│   ├── layout.tsx                  # html/body, fonts, analytics
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── globals.css
│   └── actions/
│       └── submit-lead.ts          # "use server" — the Server Action
├── components/
│   ├── sections/
│   │   ├── Hero.tsx                # RSC
│   │   ├── About.tsx               # RSC
│   │   ├── Menu.tsx                # RSC
│   │   ├── Packages.tsx            # RSC
│   │   ├── Gallery.tsx             # RSC shell
│   │   ├── GalleryLightbox.tsx     # "use client"
│   │   ├── Testimonials.tsx        # RSC
│   │   ├── Faq.tsx                 # RSC (uses <details>)
│   │   └── Inquiry.tsx             # RSC shell, renders Wizard island
│   ├── wizard/
│   │   ├── Wizard.tsx              # "use client" — root
│   │   ├── steps/
│   │   │   ├── EventTypeStep.tsx
│   │   │   ├── GuestsDateStep.tsx
│   │   │   ├── PackageStep.tsx
│   │   │   ├── DetailsStep.tsx
│   │   │   └── ReviewStep.tsx
│   │   ├── EstimateBadge.tsx
│   │   └── state.ts                # reducer + types
│   ├── Nav.tsx
│   ├── Footer.tsx
│   └── SiteJsonLd.tsx
├── lib/
│   ├── content.ts                  # typed accessors over Content Collections
│   ├── pricing.ts                  # pure estimate function (shared)
│   ├── inquiry-schema.ts           # Zod schema (shared)
│   ├── email.ts                    # Resend + React Email
│   ├── spam.ts                     # Turnstile verify + rate limit
│   ├── seo.ts                      # JSON-LD builders
│   └── leads/
│       ├── types.ts                # LeadStore interface, Lead type
│       ├── sheets-store.ts         # v1 impl
│       └── index.ts                # factory picks impl from env
├── emails/
│   ├── LeadNotification.tsx        # to Larrae
│   ├── LeadConfirmation.tsx        # to inquirer
│   └── _shared/
├── content/                        # (see §2.2)
├── public/
│   └── images/                     # (see §7)
├── tests/
│   ├── unit/                       # pricing, schema, adapters
│   └── e2e/                        # Playwright smoke
├── content.config.ts               # Content Collections schemas
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── .github/workflows/ci.yml
```

### Structure rationale

- **`app/` stays thin** — only route-level concerns. Sections live in `components/sections/`.
- **`lib/` is framework-agnostic** where possible — `pricing.ts` and `inquiry-schema.ts` are shared client+server; `leads/` is behind an interface; `email.ts` depends only on Resend.
- **`emails/` sits at root, not in `lib/`** — React Email expects this and has tooling (preview server) that reads from `./emails`.
- **`content/` at root** — not in `src/` — because it's a first-class asset, not code.
- **`components/wizard/` is isolated** — the biggest client-side surface lives in one place; easy to audit bundle impact.

---

## 12. Architectural Patterns

### Pattern 1: RSC shell + Client islands

**What:** The page is Server Components by default. Only interactive bits (wizard, lightbox) are Client Components, isolated into their own leaf trees.
**When:** Marketing sites with mostly static content and small pockets of interactivity.
**Trade-off:** Requires care at the boundary — you can't pass functions or class instances from RSC to Client. Use plain data.

### Pattern 2: Content Collections over dynamic imports

**What:** Define schemas, compile markdown at build, import typed data like any other module.
**When:** Content is known at build time and changes trigger redeploys (always true here).
**Trade-off:** Every content change = new deploy. Acceptable because Vercel previews are fast and changes are human-scale (not hundreds/day).

### Pattern 3: Pluggable `LeadStore` interface

**What:** Define an interface; inject implementation based on env. Start with Sheets, migrate to Postgres without touching the Server Action.
**When:** Storage choice has real user-facing implications (Larrae's workflow) and may evolve.
**Trade-off:** One extra file of indirection. Cheap insurance.

### Pattern 4: Shared Zod schema (client + server)

**What:** One `inquirySchema` used by client for progressive validation and by server for final validation.
**When:** Always, for any form with a server endpoint.
**Trade-off:** None. This is just correct.

### Pattern 5: Store-before-email with degradation tracking

**What:** Persist the lead before attempting email. Track partial failures. Retry degraded records via cron.
**When:** When losing a lead is worse than delaying a notification.
**Trade-off:** Slightly more code vs "fire and forget." Worth it — losing a Benicia wedding lead because Resend hiccupped is a business-level incident.

---

## 13. Data Flows

### 13.1 Content → Page

```
content/**/*.md
    │
    ▼
Content Collections compiler (build time)
    │ Zod validation — build fails on bad frontmatter
    ▼
.content-collections/generated/
    │ typed JS modules
    ▼
lib/content.ts (typed accessors: getMenu, getPackages, ...)
    │
    ▼
app/page.tsx (RSC)
    │ awaits accessors, passes data as props
    ▼
components/sections/* (RSC)
    │ server-render HTML
    ▼
Browser (static HTML + hydrated islands)
```

### 13.2 Form submission

```
User types/clicks in Wizard (client)
    │ useReducer updates local state
    │ URL: ?step=package   (replaceState)
    ▼
EstimateBadge re-renders (client, pure fn)
    │
    ▼ (on submit)
Zod validate client-side
    │
    ▼
Server Action submitLead(formData)           [use server]
    ├─▶ Zod re-validate
    ├─▶ Turnstile verify
    ├─▶ Rate limit check (KV)
    ├─▶ Idempotency check (KV, 10-min window by requestId)
    ├─▶ Compute server estimate (pricing.ts)
    ├─▶ leadStore.save()                     ──▶ Google Sheets API
    │     │
    │     └─▶ returns {id}
    ├─▶ emailService.send(toLarrae)          ──▶ Resend
    │     │ (non-blocking for user success)
    ├─▶ emailService.send(toInquirer)        ──▶ Resend
    └─▶ return {ok:true, leadId}
    │
    ▼
Wizard shows success step
    │ fires wizard_submit_success analytics event
    ▼
User sees confirmation with what-happens-next
```

### 13.3 Image pipeline (build time)

```
Developer/agent adds public/images/menu/brisket.jpg
    │
    ▼
Content markdown references "/images/menu/brisket.jpg"
    │
    ▼
plaiceholder (build) ──▶ generates blurDataURL
    │                    stored in compiled content
    ▼
Next build produces static HTML with <Image>
    │
    ▼
Request time: Vercel image optimizer serves
              AVIF (Chrome/Edge/modern Safari)
              WebP (fallback)
              JPG (legacy)
    │
    ▼
Browser paints blurDataURL immediately, swaps on load
```

### 13.4 AI agent content edit

```
Agent task: "Add banana pudding to desserts"
    │
    ▼
Agent writes content/menu/desserts/banana-pudding.md
    │ matches schema (has name, category, description, order, image)
    ▼
Agent git commit on feature branch, push, open PR
    │
    ▼
GitHub Actions CI
    ├─▶ Content Collections validates frontmatter (Zod)
    ├─▶ typecheck, lint, build
    └─▶ Playwright smoke (menu section renders new item)
    │
    ▼ (if all pass)
Vercel posts preview URL to PR
    │
    ▼
Human (Larrae or reviewer) opens preview, approves
    │
    ▼
Merge → production deploy
```

---

## 14. Scaling Considerations

This is a catering site for one small business. Realistic traffic: hundreds to low thousands of visitors/day at peak, dozens of inquiries/week.

| Scale | Adjustments |
|-------|-------------|
| **0–1k visits/day** (baseline) | Everything above is fine. No changes needed. |
| **1k–10k visits/day** (virality, press) | Still fine. Vercel free/hobby tier may hit limits — upgrade to Pro. Image optimizer bandwidth is the likely first cost line. |
| **Sustained 10k+/day** | Move gallery images to a pre-optimized CDN (Cloudinary or bunny.net) to cut optimizer bills. Still no architectural change. |

**What breaks first (realistic):** Vercel's image optimization quota on a Pro plan, if the site gets a local news feature. Mitigation above.

**What does NOT break first:** The lead store. Google Sheets handles thousands of rows without issue; Larrae's call capacity maxes out long before the store does.

---

## 15. Anti-Patterns (specific to this project)

### Anti-Pattern 1: Treating markdown as if it were a CMS

**What people do:** Let content drift out of schema ("this one package doesn't have a `pricePerPerson` field, we'll just special-case it in the component").
**Why wrong:** The point of Zod schemas is to keep the AI agent honest. Every special case defeats that.
**Instead:** Extend the schema, then edit the content. CI fails the old content until it conforms.

### Anti-Pattern 2: Making the wizard a multi-route flow

**What people do:** `/inquiry/step-1`, `/inquiry/step-2` as real pages.
**Why wrong:** Each step becomes an SSR round-trip, loses form state without a store, breaks the "single page scroll" constraint.
**Instead:** One client component, `useReducer`, `?step=` in URL via `replaceState`.

### Anti-Pattern 3: Committing images without a size budget

**What people do:** Drop 8MB hero photos from a DSLR straight into `public/images/`.
**Why wrong:** Blows out Core Web Vitals even with the optimizer; bloats the repo.
**Instead:** CI check fails the build if any `public/images/` file is > 600KB; agent/docs enforce resize-before-commit.

### Anti-Pattern 4: Storing the lead only in email

**What people do:** "Resend sends to Larrae, she'll see it, done."
**Why wrong:** Email gets lost, filtered as spam, drowned in inbox. Research requirements explicitly call for stored record.
**Instead:** Store first, email second, degrade gracefully.

### Anti-Pattern 5: Client-side price estimate without server re-computation

**What people do:** Trust the estimate the client submits.
**Why wrong:** Anyone can tamper with the form and put "$0 estimate" in the lead record.
**Instead:** Server recomputes from `guestCount` + `packageId` using the same pure fn. Store the server's number.

### Anti-Pattern 6: Putting the wizard in RSC and hydrating the whole page

**What people do:** Make the page a Client Component to "simplify."
**Why wrong:** Ships all the section content as client JS. Kills the image-heavy site's bundle budget.
**Instead:** Page stays RSC. Only `<Wizard>` subtree is `"use client"`.

### Anti-Pattern 7: Per-submission email-first with no idempotency

**What people do:** User double-clicks Submit; two leads created, two emails sent.
**Why wrong:** Noisy for Larrae, inflates analytics, looks unprofessional.
**Instead:** Client generates a `requestId` (UUID) on wizard mount; server deduplicates within 10 minutes.

---

## 16. Integration Points

### External services

| Service | Integration | Gotchas |
|---------|-------------|---------|
| **Resend** | REST via `resend` npm SDK, called from Server Action | Verify domain before launch; set SPF/DKIM |
| **Cloudflare Turnstile** | `<Turnstile siteKey={...}/>` client widget; server POST to `/siteverify` | Dev/preview and prod need different site keys |
| **Google Sheets API** | Service account JWT; `googleapis` SDK | Share sheet with service account email; rate limits ~100 req/100s |
| **Vercel KV** (Upstash) | REST from Server Action | Free tier sufficient for rate limit + idempotency |
| **Sentry** | `@sentry/nextjs` wizard | Upload source maps in CI; set `tracesSampleRate: 0.1` |
| **Vercel Analytics** | Auto-instrumented | Zero-config, but custom events need `track()` calls |

### Internal boundaries

| Boundary | Contract | Notes |
|----------|----------|-------|
| **RSC ↔ Client** | Plain serializable data only | No functions, classes, Dates without serialization |
| **Server Action ↔ LeadStore** | `LeadStore` interface | Swap implementations via env |
| **Server Action ↔ EmailService** | `send(kind, data)` async | Failures logged, not thrown out of Action |
| **Wizard ↔ Pricing** | Pure function import from `lib/pricing.ts` | Identical on client and server |
| **Wizard ↔ Content** | Wizard receives `packages[]` as props from RSC parent | No direct content import in client code |

---

## 17. Build Order Implications

Read this as the **skeleton-first build order**. Every item below assumes the stack (Next.js 15 or equivalent, Tailwind, Content Collections, Resend) is chosen and scaffolded.

### Wave 0 — Foundation (must come first; blocks everything)

1. **Repo scaffold** — Next.js 15, Tailwind, TypeScript, ESLint, Prettier
2. **Design tokens** — colors (warm palette + green primary), fonts (Playfair/Lovelace + Work Sans), spacing scale
3. **Layout shell** — `app/layout.tsx`, global CSS, base typography
4. **Content Collections setup** — `content.config.ts` with one minimal schema (e.g. `site`) to prove the pipeline compiles and imports
5. **CI pipeline** — typecheck, lint, content validate, build on PR

**Dependency:** nothing. This is the starting block. Everything below requires this.

### Wave 1 — Parallelizable after Wave 0

These can all be built simultaneously by different tracks once the foundation exists:

| Track | What |
|-------|------|
| **A. Content schemas** | All remaining Zod schemas (menu, packages, testimonials, faq, gallery, hero, about) + seed content |
| **B. Static sections** | Hero, About, Menu, Packages, Testimonials, FAQ components — RSC, rendering from content |
| **C. Image pipeline** | Image budget CI check, plaiceholder integration, sample images committed |
| **D. SEO foundation** | Metadata, JSON-LD builder (skeleton), sitemap, robots |

All four consume Wave 0. None depends on another within Wave 1. A and B are coupled at the seams (B imports A's types), but can be built against stubs and integrated.

### Wave 2 — Depends on Wave 1 A + B

5. **Gallery section** — depends on gallery content (A) and image pipeline (C)
6. **Nav + smooth scroll + anchor offset handling** — depends on sections (B) existing to link to
7. **Refined JSON-LD** — depends on FAQ content being real (A) to populate FAQPage schema

### Wave 3 — Inquiry system (the risky part)

Build the wizard **only after** Packages (B) exists because the wizard reads packages as props.

| Order | Step | Why this order |
|-------|------|----------------|
| 8 | **Shared Zod schema** (`inquirySchema`) + **pricing fn** (`pricing.ts`) with unit tests | Pure code; foundation for client + server |
| 9 | **Wizard UI** (multi-step, state reducer, progressive validation, live estimate) | Uses 8 + packages from Wave 1 |
| 10 | **Spam guard lib** (Turnstile verify, KV rate limit + idempotency) | Required before any real submit endpoint |
| 11 | **`LeadStore` interface + Sheets implementation** | Independent of wizard, can be built in parallel with 9 |
| 12 | **Email service + React Email templates** (both emails) | Independent of wizard, can be built in parallel with 9 |
| 13 | **`submitLead` Server Action** wiring 8+10+11+12 together | Last — it's glue |
| 14 | **End-to-end wizard → action → sheet + two emails** smoke test | Playwright against preview |

Items 11 and 12 **can parallelize** with 9 because they expose clean interfaces. Item 13 is the integration point and must come after 8–12.

### Wave 4 — Polish

15. **Gallery lightbox** client island
16. **Animations / scroll reveals** (restraint: respect `prefers-reduced-motion`)
17. **Observability wiring** (Sentry, Vercel Analytics custom events on wizard)
18. **Accessibility audit pass** — axe in CI, manual screen-reader run, focus traps in wizard
19. **Core Web Vitals audit** — Lighthouse, real-device test

### Wave 5 — Launch readiness

20. **Production email domain verification** (SPF/DKIM)
21. **Turnstile prod keys**, **Sheets prod target**, **prod Sentry DSN**
22. **JSON-LD validation** via Google Rich Results Test
23. **Analytics event QA** (fire each funnel event, confirm receipt)
24. **Staging-with-real-lead dry run** (Larrae submits from her phone, confirms email + sheet row)
25. **DNS cutover + production deploy**

### Critical dependencies summary

```
Wave 0 (foundation)
  ├─▶ Wave 1 A (content schemas)
  │     └─▶ Wave 1 B (static sections)
  │           ├─▶ Wave 2 (gallery, nav, JSON-LD)
  │           └─▶ Wave 3 #9 (wizard UI needs packages)
  ├─▶ Wave 1 C (image pipeline)
  │     └─▶ Wave 2 #5 (gallery)
  └─▶ Wave 1 D (SEO foundation)
        └─▶ Wave 2 #7 (refined JSON-LD)

Wave 3:
  #8 (schema + pricing)  ──┐
  #9 (wizard)        ◀─────┘
  #10 (spam)         ──┐
  #11 (lead store)   ──┤──▶ #13 (Server Action)  ──▶ #14 (E2E)
  #12 (email)        ──┘

Wave 4 → Wave 5 are sequential polish, then launch.
```

### What must be first (strictly)

1. Design tokens + layout shell — everything renders inside this
2. Content schema for `site` + `package` — wizard and multiple sections depend on these
3. Pricing function — wizard won't render meaningfully without it
4. CI content validation — the whole AI-agent-editing premise depends on this working from day one

### What must be last (strictly)

1. Production DNS cutover
2. Production email domain verification (requires the prod domain to exist)
3. Real analytics events wired to the prod dashboard
4. Accessibility and Core Web Vitals audits (audit the final composition, not components in isolation)

### What can parallelize aggressively

- All content authoring vs all component development (schemas are the contract)
- Lead store vs email service vs wizard UI (all meet at the Server Action)
- SEO foundation vs static sections (different files, no conflict)

---

## 18. Sources

- [Content Collections vs Contentlayer — Dub migration post](https://dub.co/blog/content-collections) — HIGH (primary source for Content Collections recommendation)
- [Next.js Forms guide (official)](https://nextjs.org/docs/app/guides/forms) — HIGH
- [Next.js Server Actions docs (official)](https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations) — HIGH
- [Resend + Next.js integration (official)](https://resend.com/nextjs) — HIGH
- [React Email + Resend 2026 guide](https://securestartkit.com/blog/how-to-send-emails-in-next-js-with-react-email-and-resend-2026-guide) — MEDIUM
- [Cloudflare Turnstile documentation](https://developers.cloudflare.com/turnstile/) — HIGH
- [Google Sheets API v4 — row append](https://developers.google.com/sheets/api/guides/values) — HIGH
- [Neon vs Turso 2026 comparison](https://medium.com/better-dev-nextjs-react/serverless-databases-in-2026-neon-vs-turso-vs-planetscale-the-real-story-513d951dcc9e) — MEDIUM (context for deferred DB alternative)
- [Schema.org Restaurant type](https://schema.org/Restaurant) — HIGH
- [Schema.org LocalBusiness type](https://schema.org/LocalBusiness) — HIGH
- [Schema.org FAQPage type](https://schema.org/FAQPage) — HIGH
- [plaiceholder docs](https://plaiceholder.co/docs) — HIGH
- [Vercel Image Optimization](https://vercel.com/docs/image-optimization) — HIGH
- [Vercel Analytics (privacy-respecting, cookieless)](https://vercel.com/docs/analytics) — HIGH

---

*Architecture research for: markdown-driven single-page catering marketing site with wizard inquiry + live estimate + stored leads + email notifications*
*Researched: 2026-04-15*
