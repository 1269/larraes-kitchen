# Pitfalls Research

**Domain:** Photography-led single-page catering marketing site with multi-step inquiry wizard, markdown-in-repo content, and AI-agent-via-GitHub editing
**Researched:** 2026-04-15
**Confidence:** HIGH on technical pitfalls (Next.js image/CWV, schema, CCPA, wizard UX — verified against current docs and community post-mortems). MEDIUM on brand/design pitfalls (inherently judgment-driven). MEDIUM on AI-agent workflow (newer pattern, less consolidated post-mortem literature).

---

## How to Read This Document

Pitfalls are organized by severity, then by axis. Each pitfall follows this shape:

- **Warning signs** — how to detect early during build or via monitoring
- **Prevention** — concrete, actionable step
- **Phase** — likely roadmap phase (Content Pipeline, Design System, Form/Wizard, Lead Pipeline, SEO, Launch Prep, Deployment)
- **Severity** — Critical / High / Medium / Low

Phase labels used:
- **Foundation** — stack, deploy, content pipeline scaffolding
- **Design System** — tokens, typography, components, imagery language
- **Content Pipeline** — markdown schemas, validation, image handling
- **Build-Out** — section components, gallery, menu, packages, FAQ
- **Form/Wizard** — multi-step inquiry + live estimate UI
- **Lead Pipeline** — email, storage, dedupe, confirmations
- **SEO** — schema, GBP, metadata, sitemap
- **A11y/Perf** — CWV budget, WCAG 2.1 AA, audits
- **Launch Prep** — smoke tests, GBP alignment, monitoring

---

## Critical Pitfalls (would silently sink the project)

### C1. Silent lead loss — email delivery fails and no one notices

**What goes wrong:** Wizard submits, user sees success, but the notification email to Larrae never arrives (transactional provider bounces, spam-filters, DKIM misconfig, daily quota hit). The stored record exists but Larrae has no habit of checking it, so the lead sits unread for days or is lost entirely.

**Why it happens:** One-channel delivery without fallback. No monitoring on the delivery provider. Email-from-domain not authenticated (SPF/DKIM/DMARC) so Gmail silently junks it. Developer tested once on launch day and never again.

**Warning signs:**
- Submission volume in stored records doesn't match email count in Larrae's inbox
- Resend/Postmark/SendGrid webhook delivery rate < 99%
- Zero "spam" / "promotions" tab checks in the first week
- No synthetic daily test submission

**Prevention:**
1. Authenticate the sending domain (SPF + DKIM + DMARC) before launch — verify with `mail-tester.com` (target score 9/10+).
2. Belt-and-suspenders: email + stored record + a second channel (SMS via Twilio OR a Slack/Discord webhook to a channel Larrae actually checks on phone).
3. Listen to the email provider's webhook (`email.bounced`, `email.delivery_delayed`) and log failures loudly (PagerDuty/Sentry alert, not just console).
4. Scheduled synthetic submission: a Vercel cron / GitHub Action that submits a flagged test lead daily and alerts if the delivery webhook doesn't fire within N minutes.
5. On the confirmation screen, show the lead their submission ID and tell them "if you don't hear back in 24 hours, text this number" — gives the user a recovery path that doesn't depend on our infrastructure.

**Phase:** Lead Pipeline, Launch Prep (monitoring + synthetic)
**Severity:** Critical

---

### C2. Live estimate diverges materially from final quote → trust damage

**What goes wrong:** Wizard shows "Estimated: $1,760" for 88 guests at the medium tier. Larrae replies with a quote of $2,340 because delivery, setup, service fees, or a dietary upcharge weren't in the estimate. Lead feels bait-and-switched; best case they negotiate down hard, worst case they ghost and leave a bad review.

**Why it happens:** Estimate logic diverged from real pricing (two sources of truth — the YAML in the packages file vs. whatever Larrae mentally adds). Fees, minimums, travel, and dietary upcharges not modeled. Disclaimer language too weak to set expectations. Tier boundaries handled ambiguously (see C3).

**Warning signs:**
- Estimate and first-quote email never match in testing
- Pricing config lives in more than one file
- "Disclaimer" is a single gray 10px line users never read
- Larrae's first 3 replies all correct the number

**Prevention:**
1. **Single source of truth:** `content/packages/*.md` frontmatter holds per-person pricing, minimum guests, fees. The display component and the estimate calculation both import the same module — there is one function `calculateEstimate(pkgSlug, guests, extras)` used everywhere.
2. **Model all the real fees:** delivery fee, service/setup fee, and a configurable "outside-Benicia mileage" surcharge must all be in the package frontmatter and the calculator.
3. **Always show the estimate as a *range* and a *starting from*,** e.g. "Starts at $1,760 — final quote includes delivery and any dietary customizations." Never show a precise single number as if binding.
4. **Disclaimer is primary UI, not fine print:** a persistent "Estimate only — final quote within 1 business day" line next to the number, same font size as the number.
5. Snapshot-test the calculator with a table of known inputs/outputs. Include edge cases from C3.

**Phase:** Form/Wizard, Content Pipeline
**Severity:** Critical

---

### C3. Package tier boundary ambiguity (what happens at 20 guests?)

**What goes wrong:** Small is 10–20, Medium is 21–30, Large is 50–75. User enters 20 → which tier? User enters 31–49 → no tier at all, wizard shows $0 or NaN or crashes. User enters 9 → below minimum; is it blocked, upsold, or silently accepted?

**Why it happens:** Business rules written in prose ("10–20 guests") get literally translated to code (`guests <= 20 ? small : medium`) without anyone sanity-checking the gaps and overlaps. The 31–49 gap is a real hole in the current package definition in PROJECT.md.

**Warning signs:**
- QA table of boundary values (9, 10, 20, 21, 30, 31, 49, 50, 75, 76) has any row that shows `$0`, `NaN`, `undefined`, or "please contact us" without explanation
- No minimum/maximum enforcement in the numeric input
- The package data file uses inclusive ranges but the code uses exclusive

**Prevention:**
1. **Resolve the package range gap with Larrae before coding:** confirm whether 31–49 rolls up to Medium, down to Large, or is handled as a "custom" quote path. PROJECT.md has a real gap here — surface it in the design/content phase, not during build.
2. **Codify ranges explicitly** in `packages/*.md` as `min_guests` / `max_guests`, not a prose "10-20" string.
3. **No tier gaps, no tier overlaps.** A unit test asserts that for every integer from 1 to 200, exactly one tier matches (or a well-defined "custom quote" fallback fires).
4. **Numeric input has min/max/step** and the wizard disables "Next" with a clear inline message ("We cater 10+ guests — for smaller parties, email us directly at …").
5. **Boundary tests:** every tier min and max, ±1, are in the test suite.

**Phase:** Content Pipeline (schema), Form/Wizard (enforcement)
**Severity:** Critical

---

### C4. Content edit breaks production build (markdown schema drift)

**What goes wrong:** The AI agent edits `content/menu/smothered-chicken.md` and introduces malformed frontmatter (missing required field, wrong type, indentation error) OR changes a file name referenced elsewhere. The PR merges because nothing catches it. The next Vercel deploy fails, or worse, deploys with a silent content hole (empty menu section).

**Why it happens:** Markdown-in-repo workflows skip validation. TypeScript can't type-check YAML directly. Build-time errors are caught but runtime content hydration errors aren't. PR review is visual and an agent-authored PR looks fine.

**Warning signs:**
- No schema file alongside the content directory
- `npm run build` passes even after a field is deleted from a content file
- PR CI has no "validate content" step separate from build
- Image references (`hero: /images/chicken.jpg`) don't resolve and nobody notices until staging

**Prevention:**
1. **Zod schemas per content type** (`menu`, `packages`, `testimonials`, `faq`, `gallery`), enforced either via Astro Content Collections or a custom validate script (`velite`, `zod-matter`, or `remark-lint-frontmatter-schema`).
2. **Required CI job** on every PR: `pnpm content:validate` — typechecks frontmatter, verifies image references resolve to a real file, verifies slugs are unique, verifies enum fields (dietary tags, tier names) are in the allowed set.
3. **Make it a blocking GitHub status check** on `main`. PRs cannot merge red, including agent-authored ones.
4. **Preview deploys on every PR** (Vercel default). Reviewer eyeballs the preview before merging.
5. **Agent-authored PR template** includes a checklist and enforces assigning a human reviewer. Agent never has push access to `main`.

**Phase:** Content Pipeline, Foundation (CI)
**Severity:** Critical

---

### C5. NAP inconsistency between site, schema, and Google Business Profile

**What goes wrong:** Site footer says "Larrae's Kitchen, 123 Main St", JSON-LD schema says "Larrae's Kitchen Catering, 123 Main Street", GBP says "Larrae's Soul Food Kitchen, 123 Main St. Suite B". Google can't confidently unify the entity, local pack ranking suffers, rich results don't fire, trust signal degrades.

**Why it happens:** Developer writes schema by hand from memory. Footer address is copy-pasted from an old doc. GBP was set up years ago with a slightly different name. Nobody owns the "canonical NAP" check.

**Warning signs:**
- Three different string renderings of the business name appear anywhere on the site or its metadata
- GBP listing hasn't been audited in the last 90 days
- Google Rich Results Test shows "warnings" on LocalBusiness / Restaurant
- Address formatting inconsistent ("St." vs "Street", "Suite B" vs "Ste B")

**Prevention:**
1. **Create `content/business.md` or `config/business.ts`** as the single canonical source for name, address, phone, hours, service area. Footer, schema, and contact section all pull from it.
2. **Use `Restaurant` schema type**, not generic `LocalBusiness` — it's the more specific subtype and provides clearer signals. If Larrae's Kitchen is catering-only (no storefront dining), `FoodEstablishment` + `Caterer` additionalType is also defensible.
3. **Audit GBP once before launch and once after** — copy-paste name, address, and phone character-for-character from GBP into the canonical config.
4. **Run Google Rich Results Test on staging** before go-live; fix every warning, not just errors.
5. **Include hours, `servesCuisine: "Soul Food"`, `areaServed: { @type: "City", name: "Benicia, CA" }`** to avoid "limited info" SERP treatment.

**Phase:** SEO, Launch Prep
**Severity:** Critical

---

### C6. Launch without a real lead-pipeline smoke test

**What goes wrong:** Site goes live. First real inquiry comes in. It hits an edge case nobody tested (Gmail dumps it to promotions, storage table has a column mismatch, confirmation page crashes on mobile Safari, emoji in the name field breaks the email subject). Lead is lost, Larrae is rightfully upset, trust in the new site is damaged on day one.

**Why it happens:** "It works on my machine" + "we tested it once last Tuesday" + deploy-day adrenaline. Dev submissions during build aren't realistic (same browser, same IP, clean cookies).

**Warning signs:**
- No written smoke-test plan 48 hours before launch
- The last end-to-end submission was from the developer's laptop, not a real phone
- Larrae has not personally received and replied to a test lead
- No synthetic monitoring configured (see C1)

**Prevention:**
1. **Pre-launch smoke test matrix** (T-72h): iPhone Safari, Android Chrome, desktop Chrome, desktop Safari. Three test inquiries per device — one happy path, one with special characters (é, 🎉, apostrophes, long strings), one at a tier boundary. Larrae must personally see and reply to each one.
2. **Production smoke test post-deploy** from a device on cellular data (not office Wi-Fi, not VPN) — this tests real-world Turnstile/CAPTCHA behavior.
3. **Launch-day lead monitoring dashboard**: stored record count + email delivery webhooks + Turnstile challenge rate visible at a glance.
4. **Rollback plan**: know the exact command/URL to roll back to the previous Vercel deploy in under 2 minutes.

**Phase:** Launch Prep
**Severity:** Critical

---

## High Pitfalls (would significantly degrade the site without being obvious)

### H1. Hero/food photography ships as 4MB originals

**What goes wrong:** Photographer delivers 5-10 MB JPEGs. They land in `/public/images/` verbatim. Mobile LCP on 4G is 6+ seconds. CWV fails, SEO suffers, bounce rate on the hero spikes, Vercel bandwidth bill balloons. Site "looks amazing" on designer's wi-fi and "loads forever" on real users' phones.

**Why it happens:** Next.js devs assume `<Image>` magically fixes everything. It doesn't — it serves optimized variants, but the source asset is still downloaded once for the build cache (or served from `/public` unchanged for non-Next-Image usage). Gallery sections that use `<img>` or CSS backgrounds bypass optimization entirely.

**Warning signs:**
- `/public/images/` has any file over 500KB
- Lighthouse mobile LCP > 2.5s
- Network tab shows `.jpg` files over 300KB going over the wire
- Gallery uses background-image or raw `<img>`
- No `sizes` attribute on any Image component

**Prevention:**
1. **Enforce an image pipeline:** source images sized down to 2560px max dimension, 80% quality, AVIF+WebP output via `next/image` (or `astro:assets` / `@unpic/astro`).
2. **Every `<Image>` has explicit `width`/`height` or `fill` with a sized parent** — prevents CLS.
3. **Every `<Image>` has `sizes` prop** when responsive; missing `sizes` defaults to `100vw` and ships the largest variant to all devices.
4. **Exactly one `priority` (or Next.js 16+ `preload`) per page** — the hero. Extras eat LCP budget by 400–1200ms.
5. **Gallery uses `loading="lazy"`**, but the first 1-2 above-the-fold thumbnails don't — they also need explicit dimensions.
6. **CI budget:** Lighthouse CI (or Vercel Speed Insights) on PR blocks merges if LCP > 2.5s mobile or CLS > 0.1.
7. **Quality 85–90 is fine for photography** — don't pick 75 and visibly degrade food shots. Photography is the entire brand; the extra bytes are worth it, but only in the optimized variant.

**Phase:** A11y/Perf, Design System (imagery language), Build-Out (gallery)
**Severity:** High

---

### H2. Masonry gallery jank and lightbox hydration cost

**What goes wrong:** Masonry grid relayouts on every image load → massive CLS. Lightbox is a heavyweight JS component (lightGallery, PhotoSwipe) that hydrates on first page load, blocking main thread and tanking INP. User taps an image, modal takes 400ms to open on a mid-tier phone.

**Why it happens:** Default masonry libraries don't know image dimensions upfront. Lightbox libraries are often imported synchronously in a top-level layout.

**Warning signs:**
- CLS > 0.1 specifically on the gallery section
- INP > 200ms on image taps
- Bundle analyzer shows `photoswipe` / `lightgallery` in the main chunk
- Gallery images jumping around on load

**Prevention:**
1. **CSS-only masonry via `column-count` / CSS Grid with explicit aspect-ratios** — no JS layout calc. Every image's aspect ratio is stored in its content frontmatter (`aspect: "4/3"`) and used as CSS `aspect-ratio` so the cell reserves space before the image loads.
2. **Lightbox is dynamically imported** and only mounted on first click. Use `next/dynamic({ ssr: false })` or equivalent. Target < 30KB gzipped for the lightbox.
3. **Prefer a lightweight lightbox** (`yet-another-react-lightbox` ~10KB, or a hand-rolled 50-line implementation with `<dialog>`) over PhotoSwipe (~35KB+) unless advanced features are needed.
4. **Lightbox is keyboard-navigable** (Esc, ←, →) and focus-trapped — this is also an a11y requirement (see A1).

**Phase:** Build-Out (gallery), A11y/Perf
**Severity:** High

---

### H3. Wizard state loss on refresh/back button

**What goes wrong:** User fills step 3, accidentally refreshes or backgrounds the tab, or taps the browser back button → returns to step 1 with empty fields. Rage-quits.

**Why it happens:** Wizard state in component-local React state only. No persistence. No URL-driven step navigation. Developer tests the happy path, never the "I got interrupted" path.

**Warning signs:**
- Refresh in dev tools loses state
- Browser back button exits the site instead of going to previous step
- URL doesn't change between steps

**Prevention:**
1. **Persist wizard state to `sessionStorage`** (or `localStorage` with an expiry timestamp). Restore on mount. Clear on successful submit.
2. **Step is reflected in the URL hash or query param** (`#step=2` or `?step=2`) so back/forward buttons navigate between steps, not away from the site.
3. **Warn before leaving mid-wizard** via `beforeunload` when there's unsaved data (use sparingly — only when user has entered real info).
4. **Test the refresh/back flow explicitly** on every step transition. Add to the smoke test matrix (C6).

**Phase:** Form/Wizard
**Severity:** High

---

### H4. No wizard abandonment analytics — can't see where drop-off happens

**What goes wrong:** Conversion is the whole point of the site. If 70% of users drop at step 3, nobody knows. "It's not converting" is the only signal, and there's no data to diagnose.

**Why it happens:** Analytics instrumented at submit only, not per-step. Or instrumented but no funnel view configured. Or event names drift over time so the funnel breaks.

**Warning signs:**
- Only `wizard_submitted` event exists
- Analytics provider doesn't have a funnel configured
- No event for `wizard_started`, `wizard_step_completed`, `wizard_abandoned`

**Prevention:**
1. **Fire a typed event at every step transition**: `wizard_step_viewed` with `{ step, event_type, guests }`, `wizard_step_completed`, `wizard_step_errored` (with field).
2. **Use a privacy-respecting analytics layer** (Plausible, Fathom, PostHog self-hosted, or Vercel Analytics) — mentioned for CCPA compliance (S2).
3. **Build the funnel view before launch.** Step 1 → Step 2 → Step 3 → Step 4 → Submitted. Target: step-to-step completion > 70%; end-to-end > 25%.
4. **Label steps consistently in a shared constant** — never type strings inline or funnel breaks when copy changes.

**Phase:** Form/Wizard, Launch Prep
**Severity:** High

---

### H5. Share links to sections lose context (share-link metadata)

**What goes wrong:** User loves the Large package, shares `larraeskitchen.com/#packages-large`. Recipient sees a generic site preview card ("Larrae's Kitchen — authentic soul food catering") because OG tags are page-level, not section-level. Conversion loss.

**Why it happens:** Single-page architecture has one `<head>`. Fragment navigation doesn't trigger a new OG preview. Developer didn't plan for shareable anchors.

**Warning signs:**
- Every Facebook/iMessage/Slack preview of any section link looks identical
- No share buttons next to individual package cards or testimonials
- Testing shared links in iMessage shows generic preview only

**Prevention:**
1. **Accept that OG is page-level** in a single-page app and design around it — one strong site-level OG image (the hero food shot) that's strong enough to sell any section.
2. **For high-value shareable items (packages)**, create lightweight per-item routes (`/packages/medium`) that render a minimal page with section-specific OG tags, then redirect or deep-link to `/#packages-medium` on the main page. Next.js dynamic routes handle this cleanly.
3. **Anchor IDs are stable and content-authored** (not auto-generated from heading text that might change). Put them in the content frontmatter.
4. **Scroll-margin-top on anchor targets** so they don't hide behind the sticky nav.
5. **`copy link` button on each package/testimonial card** — explicit share UX beats hoping browsers generate good previews.

**Phase:** SEO, Build-Out, Design System (nav behavior)
**Severity:** High

---

### H6. Duplicate/double-submit leads from flaky networks

**What goes wrong:** User on spotty cellular hits submit, spinner hangs, they tap again. Two identical leads arrive. Larrae emails both. Lead thinks the duplicate is a second inquiry confirmation and replies twice. Embarrassing.

**Why it happens:** Submit button not disabled on click. No idempotency key. No network-aware retry logic. No client-side dedupe window.

**Warning signs:**
- Submit button is clickable after first tap
- No loading state / disabled state during submission
- Storage has pairs of near-identical records seconds apart
- No `Idempotency-Key` header or equivalent

**Prevention:**
1. **Disable submit button** the moment it's clicked; show a spinner; only re-enable on error.
2. **Generate an idempotency key** (UUID) client-side when the wizard is first mounted; send with the submission. Server rejects duplicates with the same key in a 5-minute window.
3. **Server dedupe**: if an identical email+phone arrives within 60 seconds, treat as a retry and return the same success response.
4. **Confirmation page includes a submission ID** so the user has something concrete showing their submission succeeded once.
5. **Test on throttled 3G** in browser dev tools before launch.

**Phase:** Form/Wizard, Lead Pipeline
**Severity:** High

---

### H7. Bot-storm on launch day / spam-gutted form

**What goes wrong:** Form goes live, gets hammered by scraper bots within 24-72 hours. Larrae's inbox fills with fake leads. Real leads get lost. Storage limits breached. Or the inverse: Turnstile is over-tuned and blocks real users on privacy-focused browsers.

**Why it happens:** No rate limiting. CAPTCHA misconfigured (dev keys left in production, `managed` mode set too aggressive). No honeypot field. Email provider's spam defenses not configured.

**Warning signs:**
- Submissions per hour > 10 from the same IP
- `User-Agent: python-requests` or empty in submission headers
- Real users reporting "the form won't let me submit"
- Turnstile Challenge Solve Rate below 85% (legitimate users being blocked)

**Prevention:**
1. **Layered defense, not single CAPTCHA:**
   - Honeypot field (invisible `website_url` or similar), rejects any submission that fills it
   - Cloudflare Turnstile in `managed` mode (less aggressive than `invisible` for edge browsers) — Turnstile has known false-positive issues with VPN users, hotel Wi-Fi, and privacy-focused browsers, so it shouldn't be the only line of defense
   - Server-side rate limit: 5 submissions per IP per hour, 20 per /24 subnet
   - Minimum time-on-form check (reject submissions in < 3 seconds)
2. **Never use test/dev CAPTCHA keys in production** — a common shipping mistake. Keys are environment-specific; CI should fail if `NEXT_PUBLIC_TURNSTILE_KEY` matches the public test key on a production build.
3. **Monitor Turnstile CSR** (challenge solve rate) — if it drops below 85%, you're blocking real users.
4. **Privacy-focused / accessibility-tool users**: include an email fallback ("Having trouble? Email us at…") that bypasses CAPTCHA for users who can't complete it.
5. **Alerting on submission spikes** — a 10x jump in submissions per hour should page.

**Phase:** Lead Pipeline, Launch Prep
**Severity:** High

---

### H8. Agent pushes to main / preview deploy diverges from production

**What goes wrong:** AI agent has push access to `main` or is configured to auto-merge its own PRs. Agent introduces subtly broken frontmatter that passes lint but renders badly. Deploy goes live with no human seeing it. Or: preview deploy uses different env vars than production (Turnstile test key, different email endpoint), so preview "works" but production doesn't.

**Why it happens:** Convenience. "The agent is good enough to trust." Env vars set in one Vercel environment but not the other. Developer tests on preview and assumes production is equivalent.

**Warning signs:**
- GitHub branch protection on `main` allows bypass for any actor
- CODEOWNERS file missing or empty
- Vercel environment variables show entries in "Preview" but not "Production" (or vice versa)
- Agent's last 10 PRs all have zero review comments
- No smoke test in CI after production deploy

**Prevention:**
1. **Branch protection on `main`**: require PR, require 1 human approval, require all checks passing, disallow force push, disallow admin bypass.
2. **Agent commits to a branch, opens PR, tags a human.** Agent does not have `admin` or `maintain` role on the repo — only `write` on feature branches.
3. **Env vars are identical across preview and production** for anything the wizard touches (email endpoint, storage endpoint, Turnstile key), with one documented exception: the Turnstile key which should differ between preview (test key) and production (real key). This exception is noted and tested.
4. **Post-deploy smoke test in CI**: after a production deploy, run a minimal synthetic submission against the live URL and fail the deploy if it doesn't complete end-to-end.
5. **CODEOWNERS file** requires human review on `/content/**` AND `/src/**` changes.

**Phase:** Foundation (CI/CD), Content Pipeline
**Severity:** High

---

### H9. Photography with text overlays fails contrast

**What goes wrong:** The hero is a gorgeous dark food photo with cream-colored headline "Soul Food, Catered." It looks beautiful on the designer's monitor. On a bright outdoor screen, or over a lighter part of the photo, the contrast fails WCAG AA and text becomes unreadable.

**Why it happens:** Designers check contrast on a single-color background, not against varying pixel values of a photograph. "It looks fine" is not an audit.

**Warning signs:**
- Text sits directly on a photograph with no treatment
- No scrim/overlay between the photo and the text
- Accessibility audit flags hero as low-contrast
- Photo crops differently on mobile, exposing a light background section under the text

**Prevention:**
1. **Always treat text-over-image** with one of: a solid scrim (`background: rgba(0,0,0,0.45)`), a gradient mask (darker at text anchor), a blurred text background, or a solid colored band.
2. **Contrast checked against the worst-case pixel** in the text bounding box, not the average.
3. **Responsive art direction:** different crops per breakpoint so the dark-behind-text region is preserved on mobile. Use `<picture>` with `<source media>` or Next's Image art-direction pattern.
4. **Automated contrast audit** via `axe-core` / `pa11y` in CI.
5. **Avoid brand color text on brand color imagery** without a surface between them — green text on a green-dominant dish photo is the worst case.

**Phase:** Design System, A11y/Perf
**Severity:** High

---

### H10. Photography-heavy page with no crawlable text

**What goes wrong:** Hero is a photo. About section is a photo with a chef quote baked into the image. Gallery is all photos. Google crawls and sees five paragraphs of actual text on the entire page. "Limited info" in SERPs, no long-tail keyword coverage, no ranking for "soul food catering Benicia."

**Why it happens:** Visual designers prioritize imagery. Text in images feels editorial. Nobody audits the "view source" equivalent.

**Warning signs:**
- Disable images in browser → page is mostly blank
- Lighthouse SEO score below 95
- Word count of rendered body text < 400
- Heading structure has `<h1>` then nothing else

**Prevention:**
1. **Rule: no text in images** for any text a search engine should read — text in images is for decoration only (menu item names baked into a plate shot, e.g.).
2. **Text-first content model**: write the About, menu descriptions, package descriptions, FAQ, testimonials as text first, then photograph alongside. Never photograph a chef quote card.
3. **Minimum word count budget per section** in content schema: About ≥ 150 words, each package ≥ 80 words, each FAQ ≥ 40 words.
4. **Alt text is not decoration** — it's a crawlable signal. Alt text must describe the dish and the context ("Cast-iron smothered chicken with gravy, plated family-style"), not be "food photo" or empty.
5. **Heading hierarchy**: one `<h1>` (brand tagline), `<h2>` per section, `<h3>` per package/dish. Semantic structure feeds both SEO and screen readers.

**Phase:** SEO, Content Pipeline, Design System
**Severity:** High

---

## Medium Pitfalls

### M1. CCPA/CPRA compliance — over or under-doing it

**What goes wrong:** Either (a) the site is non-compliant because no privacy notice mentions what's collected from leads and how long it's kept, or (b) the developer over-engineers a full consent banner flow for a small business that doesn't cross the CPRA thresholds and tanks conversion.

**Why it happens:** Developer defaults to "better safe than sorry" full consent UX without checking thresholds, OR ignores California compliance entirely assuming small-business exemption.

**Factual basis:** CPRA applies to for-profit businesses meeting one of: ≥100,000 CA consumers/households data, ≥$25M gross revenue, or ≥50% revenue from selling PI. A small catering business almost certainly does not cross any threshold — so full CPRA obligations don't apply. But reasonable transparency is still expected and is cheap.

**Warning signs:**
- No privacy page or it's a copy-pasted generic template
- No retention period defined for stored leads
- Cookie banner blocking conversion for legitimate visitors
- PII stored indefinitely

**Prevention:**
1. **Short, plain-language privacy notice** linked in footer and under the wizard submit button: what's collected (name, email, phone, event details), why (to respond to your inquiry), how long (N months), whom it's shared with (nobody), how to request deletion (email address).
2. **Explicit retention window in the stored records schema**: every record has a `purge_after` timestamp (e.g., 18 months after last contact). Run a monthly cron that purges expired records.
3. **No third-party trackers unless necessary.** If only using a first-party analytics service with no ad pixel, a cookie banner is likely not required — but confirm with a brief legal review or with a current DPIA template.
4. **If ever adding Google Ads / Meta Pixel**, revisit compliance — pixels trigger "selling/sharing" under CPRA's broad definition and require consent UI.
5. **Log the privacy notice version** shown at submission time with the lead record so you can prove what was disclosed.

**Phase:** Lead Pipeline, Launch Prep
**Severity:** Medium

---

### M2. Sticky nav + anchor links produce broken scroll landings

**What goes wrong:** User clicks "Menu" in the nav. Page scrolls to `#menu`, but the sticky nav bar hides the top of the menu section, so the visible content starts mid-heading. Feels broken.

**Why it happens:** `scroll-margin-top` not set. Smooth-scroll JS uses `scrollIntoView()` with default behavior. Nav height changes between breakpoints and the offset isn't reactive.

**Warning signs:**
- Section headings are cut off after anchor-click
- Back/forward between anchor positions lands inconsistently
- Heading visible on desktop but hidden behind nav on mobile

**Prevention:**
1. Every section heading has `scroll-margin-top: var(--nav-height)` set in CSS.
2. `--nav-height` is a CSS custom property that changes at the same breakpoints the nav does.
3. Prefer browser-native `scroll-behavior: smooth` over a JS scroll library unless the library adds specific value.
4. Test anchor navigation from every entry point: direct URL load, nav click, share-link paste, back button.

**Phase:** Design System (nav), Build-Out
**Severity:** Medium

---

### M3. Scroll-spy performance hit on long pages

**What goes wrong:** Nav highlights the current section as the user scrolls. Implemented with a scroll event listener that runs `getBoundingClientRect()` on every section on every scroll tick. On a photography-heavy page, scroll stutters on mid-range Android devices.

**Why it happens:** Default implementation patterns on Stack Overflow use scroll listeners. Nobody measures.

**Warning signs:**
- INP above 200ms during scroll
- Long tasks > 50ms during scroll in dev tools
- Fan on laptop spins during casual scroll testing

**Prevention:**
1. **Use `IntersectionObserver`**, not scroll listeners. One observer, one callback per intersection change, no per-frame work.
2. `threshold: [0, 0.3, 0.7]` with `rootMargin: '-20% 0px -60% 0px'` picks the "active" section cleanly.
3. If a scroll listener is truly needed for anything, wrap it in `requestAnimationFrame` and passive listener.
4. Measure with WebPageTest or Chrome DevTools Performance tab on a 4x CPU throttle; INP should stay < 200ms while scrolling.

**Phase:** Build-Out, A11y/Perf
**Severity:** Medium

---

### M4. Wizard doesn't announce steps to screen readers

**What goes wrong:** Screen-reader user taps "Next" → nothing happens audibly. They don't know the page advanced. They tab into step 2 fields blind.

**Why it happens:** Devs build wizards as React components and forget that a visual transition isn't an audible one.

**Warning signs:**
- No `aria-live` region in the wizard
- Step change only re-renders content; no announcement
- Focus doesn't move to the new step's first field
- VoiceOver / NVDA testing never performed

**Prevention:**
1. **Move focus** to the new step's heading or first field on step change. Use a `ref` and `.focus()` in `useEffect`.
2. **Announce step transitions** via an `aria-live="polite"` region: "Step 2 of 4: Event details."
3. **Progress indicator is a real `<ol>`** with completed steps marked `aria-current="step"` on the active item.
4. **Error messages use `aria-describedby`** on the invalid field, and inline errors are linked to inputs via `aria-invalid` + the id.
5. **Test with VoiceOver on iOS and NVDA on Windows** before launch. Include in smoke test matrix.

**Phase:** Form/Wizard, A11y/Perf
**Severity:** Medium

---

### M5. Mobile keyboard covers the focused input

**What goes wrong:** User taps into the "phone number" field on step 3. iOS keyboard slides up and covers the field plus the error message below it. User types blind or panics.

**Why it happens:** `scrollIntoView` not called on focus. `input` is positioned at the bottom of the viewport with `position: sticky` CTA also overlapping.

**Warning signs:**
- Keyboard slides up and the focused field is off-screen
- `position: sticky` submit bar overlaps the field
- Field errors appear below the field and are cut off

**Prevention:**
1. On `focus` of every input, call `element.scrollIntoView({ block: 'center', behavior: 'smooth' })`.
2. Avoid sticky submit bars during mid-wizard — only at the final review/confirm step. A sticky bar at the bottom of a wizard step is almost always a trap.
3. Use correct `inputmode` / `type`: `type="tel"` for phone, `type="email"` for email, `inputmode="numeric"` for guest count. Correct keyboard appears automatically, fewer keystrokes.
4. Test on real iOS Safari and Android Chrome — emulators lie about keyboard behavior.

**Phase:** Form/Wizard, A11y/Perf
**Severity:** Medium

---

### M6. Touch targets too small on package/menu cards

**What goes wrong:** Package card has a 32×32 "Select" button. Mobile users thumb-tap and miss half the time. Or the whole card isn't tappable and users don't realize the tiny link is the CTA.

**Why it happens:** Design system scale tested on desktop, mobile sizes not separately audited.

**Warning signs:**
- Any interactive target under 44×44 CSS pixels
- Card heading is a link but the card body isn't clickable
- Analytics shows high click-rate on nearby non-CTA elements

**Prevention:**
1. **Minimum 44×44 CSS pixels** for every tappable control (iOS HIG guideline; WCAG 2.5.5 recommends 44×44).
2. **Whole-card click-through** pattern when the card's primary action is "learn more" — wrap the card in `<a>` with the card title inside; pseudo-element `::after { inset: 0 }` makes the whole card tappable without wrapping everything in a link (keeps semantics clean).
3. **Don't sacrifice spacing** to cram cards onto a mobile screen — 16px gap minimum between tappable targets.

**Phase:** Design System, Build-Out
**Severity:** Medium

---

### M7. Auto-rotating testimonials without pause control

**What goes wrong:** Testimonials carousel auto-advances every 5 seconds. Screen-reader users hear half a testimonial before it changes. Users trying to read a long quote get interrupted. WCAG 2.2.2 violation.

**Why it happens:** Default settings on carousel libraries auto-rotate. "It feels dynamic" to the designer.

**Warning signs:**
- Testimonials change without user input
- No pause button
- No dots/arrows to manually navigate

**Prevention:**
1. **Prefer no auto-rotation.** Static grid of 2-3 testimonials with a "see more" link is calmer and accessible by default.
2. **If rotating, provide pause + manual navigation.** Auto-rotation must respect `prefers-reduced-motion` — pause entirely when the user has that set.
3. **Pause on hover and on focus** (keyboard user lands on the carousel → it stops).
4. **Minimum 10s per slide** if you must auto-rotate, and always pause after user interaction.

**Phase:** Build-Out, A11y/Perf
**Severity:** Medium

---

### M8. Color-only state indicators in form validation

**What goes wrong:** Invalid input field gets a red border. That's it. Colorblind users see no difference. Screen-reader users hear nothing.

**Why it happens:** Red-for-error is a universal convention that's never "universal."

**Warning signs:**
- Error state conveyed only by border color
- No icon, no text, no ARIA
- `aria-invalid` not set on the input

**Prevention:**
1. **Error state has: icon + text + color + ARIA**, not color alone.
2. `aria-invalid="true"` on the input, `aria-describedby` pointing at the error message ID.
3. Error message text is in the field's locale, not English-only (if the site ever expands).
4. Success state (green check) is optional, but the same rules apply if used.

**Phase:** Design System (form components), Form/Wizard
**Severity:** Medium

---

### M9. "Modern editorial" sanitizes the soul out of the brand

**What goes wrong:** In pursuit of Sweetgreen polish, the site becomes tasteful-but-generic. Food shots look like stock. Whitespace-forward editorial rhythm reads as "catering chain" instead of "our family recipes." The Benicia-only-soul-food-specialist positioning evaporates into visual neutrality.

**Why it happens:** Reference imagery (Sweetgreen) is a salad chain. Applying its structural language verbatim to soul food washes out the cultural and family dimensions that are the actual differentiator.

**Warning signs:**
- Food photography has white backgrounds and minimal garnish
- No hands, no cast iron, no family-style serving shots
- About section reads as a resumé, not a story
- The site could be re-skinned for a Mediterranean caterer by changing two images

**Prevention:**
1. **Codify a photography brief** before shooting: cast iron, hands in frame, family-style abundance, warm overhead light, natural counter surfaces, garnish that looks assembled not styled. Reject stock-feeling shots.
2. **Heritage in copy, not just image captions.** About section leads with a personal story (grandmother, kitchen, first catered event), not with credentials. Name dishes after people or traditions where it's true.
3. **Brand review checkpoint at the end of Design System** phase: "If you put this screenshot next to a Sweetgreen screenshot with the logos removed, are they distinguishable?" If no, iterate.
4. **Retain warm palette dominance:** the cream+amber+deep-green mix on the page surface-area should weight toward amber/cream on content sections, not cream-only. Green as CTA/nav, not as dominant surface.
5. **Usability-test the About section** with someone who doesn't know soul food — do they come away understanding why this is specifically *soul food catering in Benicia*, not just generic catering?

**Phase:** Design System, Content Pipeline
**Severity:** Medium

---

### M10. Kitsch creep on heritage storytelling

**What goes wrong:** Overcorrecting from M9, the site leans hard into "authentic" signifiers: handwritten fonts, distressed textures, quilted wallpaper everywhere, "Grandma's recipe" in quotes on every card. Reads as cosplay, not heritage. Alienates corporate clients (one of three target personas).

**Why it happens:** Designers reach for genre signifiers when they don't trust the food photography to carry the story.

**Warning signs:**
- More than one "Grandma" reference on the page
- Distressed / hand-drawn decorative elements beyond sparing accent use
- Quilted patterns as page-wide backgrounds (PROJECT.md explicitly retires this — don't reintroduce)
- Cursive/script fonts used for body or secondary text (not just display accents)
- Corporate persona (Emma) test feedback is "this doesn't feel like something I'd book for a company event"

**Prevention:**
1. **One layer of heritage at a time:** food photography OR typography accent OR copy texture — not all three on the same section.
2. **Quilted pattern rule (from PROJECT.md):** sparingly, only as small accent, never as page or section background.
3. **Corporate persona check in content review:** does the page still read as professional catering Emma could expense? If it feels too folksy in any section, pull back one layer.
4. **Script fonts for display accents only** (dish names, tab labels as noted in PROJECT.md). Never headlines, never body.

**Phase:** Design System, Content Pipeline
**Severity:** Medium

---

### M11. Menu customization expectations (vegan/gluten-free) set vaguely

**What goes wrong:** Menu page shows dietary indicators (V, GF, DF). User assumes every dish can be made any way. Inquiry comes in requesting "the mac and cheese but vegan and gluten-free" — not actually possible. Either Larrae disappoints them or scrambles to accommodate.

**Why it happens:** Dietary indicators treated as a filter UX rather than a fact about each specific dish.

**Warning signs:**
- Dietary tags shown as "options" rather than as properties of a prepared dish
- No FAQ item addressing customization limits
- Inquiry wizard doesn't ask about dietary needs until the last step (too late to surface constraints)

**Prevention:**
1. **Per-dish dietary tags in menu frontmatter** (`diet: [vegetarian, gluten-free-available]`) distinguish "is" from "can be on request."
2. **FAQ explicitly addresses** what's customizable vs. what's a fixed recipe.
3. **Wizard asks about dietary restrictions in step 2** (not buried in a free-text field at the end) so the estimate can flag "+$X/person for full vegan menu" honestly.
4. **Content team (Larrae) reviews dietary tags every menu update** — a schema validation rule can enforce that every dish has at least one tag, even if it's "standard."

**Phase:** Content Pipeline, Form/Wizard
**Severity:** Medium

---

## Low Pitfalls

### L1. FAQ accordion closes on mobile when user taps wrong area

**What goes wrong:** Accordion hit area is just the chevron icon, not the whole row. User taps the question text → nothing happens. Gives up.

**Warning signs:** Accordion click handler scoped to icon only. Cursor pointer only on the icon.

**Prevention:** Accordion trigger is the whole `<button>` wrapping the question + icon. Icon is decorative (`aria-hidden`). Use native `<details>`/`<summary>` unless custom animation is required — free a11y and behavior.

**Phase:** Build-Out, Design System
**Severity:** Low

---

### L2. Merge conflicts on parallel content edits

**What goes wrong:** Larrae edits `content/packages/medium.md` via agent at the same time as a developer edits pricing. Merge conflict. Whichever gets committed last wins, and that might be the wrong one.

**Warning signs:** Two people/agents editing the same file without coordination. No locking, no awareness.

**Prevention:**
1. One content file = one owner or one session. Don't split package pricing across multiple files.
2. Keep content files **small and granular** — one dish, one testimonial, one FAQ per file. Reduces conflict surface to near-zero.
3. Agent writes a descriptive PR title so humans can see what's being changed before a parallel PR is opened.

**Phase:** Content Pipeline
**Severity:** Low

---

### L3. Social share image not 1.91:1 (breaks Facebook/LinkedIn preview)

**What goes wrong:** OG image is square or tall; LinkedIn/Facebook crop awkwardly; preview looks amateurish.

**Warning signs:** OG image file is not 1200×630. No preview test.

**Prevention:**
1. OG image exactly 1200×630 (1.91:1), < 300KB, text-legible at 600×314 thumbnail.
2. Test with Facebook Sharing Debugger, LinkedIn Post Inspector, Twitter Card Validator before launch.

**Phase:** SEO, Launch Prep
**Severity:** Low

---

### L4. No 404 / error page for content-not-found states

**What goes wrong:** User lands on a URL that doesn't exist (if any per-item routes are added — see H5). Gets the framework default. Looks unbranded.

**Prevention:** Custom 404 with brand palette, a single food hero, and a clear "back to home" CTA.

**Phase:** Build-Out
**Severity:** Low

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode pricing in the wizard component instead of reading from package frontmatter | Ship wizard in a day | Pricing drift between display and calculator (C2) | **Never** — single source of truth is Critical |
| Inline food photos via `<img>` because `<Image>` is "complicated" | No need to set width/height | CWV failure, bandwidth cost, CLS spikes (H1) | **Never** — this is the entire performance story |
| Use placeholder lorem-ipsum for testimonials at launch | Design looks complete | Launch without social proof, credibility gap | Only in pre-launch staging; **never** on production |
| Skip frontmatter schema validation because "the agent is careful" | Setup time saved | First agent mistake breaks production (C4) | **Never** — this is the linchpin of the whole content model |
| Ship without synthetic submission monitoring | No extra tooling to set up | Silent lead loss (C1) undetected for days | **Never** — cost is too asymmetric |
| Auto-rotating carousel because the library defaults to it | Looks dynamic | WCAG violation, reading interruption (M7) | Only with pause controls, `prefers-reduced-motion` respect, and 10s+ intervals |
| One big `content/site.md` instead of per-item files | Fewer files | Merge conflicts (L2), harder agent edits, larger diffs | Acceptable for truly global config (business NAP in one file) |
| Skip scroll-margin-top and accept "close enough" anchor landings | Saves 20 minutes | Every anchor click feels broken (M2) | **Never** — it's a one-line fix |
| Use Google Fonts without subsetting for Lovelace + Playfair + Work Sans | Easy setup | 200KB+ of font files, FOIT/FOUT, LCP regression | Only if self-hosted via `next/font` with subsetting + `font-display: swap` |
| Ship the launch without a Google Business Profile audit | Moves faster to launch | NAP inconsistency (C5), local SEO ceiling capped | **Never** — GBP alignment is prerequisite to launch |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Transactional email (Resend / Postmark / SendGrid) | Sending from an unauthenticated domain; email lands in spam | Set SPF + DKIM + DMARC before first send; test with `mail-tester.com`; verify-score > 9/10 |
| Cloudflare Turnstile | Using the sitekey test value in production | Environment-specific keys, CI check that prod build doesn't contain `1x000...` test key; monitor challenge solve rate; see H7 |
| Vercel image optimization | Leaving the default cache headers short, re-optimizing on every cold edge | Set `minimumCacheTTL` (default is 60s, recommend 31536000 for static photography); remote patterns configured for any CDN-sourced imagery |
| Google Business Profile | Name/address/phone differs from site | Canonical business config file (C5); audit GBP pre-launch and post-launch |
| JSON-LD LocalBusiness / Restaurant | Using generic `LocalBusiness` when `Restaurant` or `FoodEstablishment` + `Caterer` additionalType is more specific | Use the most specific schema type that applies; include `servesCuisine: "Soul Food"`, `areaServed`, `priceRange`, `openingHoursSpecification`; validate with Rich Results Test |
| Stored lead records (DB or simple append-only log) | No retention policy; PII kept indefinitely | Schema includes `purge_after` field; monthly cron purges expired records (M1) |
| GitHub Actions CI for content validation | Validation runs but isn't a required check | Mark the content-validate workflow as required in branch protection (C4, H8) |
| Vercel Preview vs. Production env vars | Dev values bleed into production (wrong email endpoint, test CAPTCHA key) | Env var parity audit pre-launch; CI step that verifies critical env vars are non-test values in production builds (H8) |
| Next.js `<Image>` with remote photos | Missing `remotePatterns` config; build succeeds but images don't optimize | Explicit `images.remotePatterns` in `next.config.js`; local-first sourcing preferred for food photography control |
| Analytics (Plausible / Fathom / PostHog / Vercel) | Funnel events named inconsistently across steps | Shared constants file for event names; typed event fire helper; funnel configured in analytics UI before launch (H4) |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero image not preloaded (or multiple images preloaded) | LCP > 2.5s mobile; or LCP regresses after "optimization" | Exactly one `priority` / `preload` per page — the hero. No more. | Any real traffic on mobile |
| Food photo gallery with no `aspect-ratio` reservation | Visible reflow as images load; CLS > 0.1 | Store aspect ratio in frontmatter; CSS `aspect-ratio` on the card reserves space before load | Any page load on slow network |
| Missing `sizes` on responsive Images | Mobile device downloading desktop-size images; wasted bandwidth | Always set `sizes` (e.g., `sizes="(max-width: 640px) 100vw, 50vw"`) | On mobile; on metered connections |
| Lightbox loaded on initial render | INP > 200ms on image tap; bundle bloat | `next/dynamic` for the lightbox; only mount on click (H2) | On mid-tier Android and older iPhones immediately |
| `<Image fill>` without relative parent | Images render 0×0 or overflow; 60-70% of post-migration CLS spikes | Always pair `fill` with a sized, positioned parent; or prefer explicit width/height | Immediately on any breakpoint |
| Scroll-spy with scroll listeners instead of IntersectionObserver | Scroll stutter on long pages, fan spin-up on laptops | IntersectionObserver with rootMargin — one observer, no per-frame work (M3) | On photography-heavy pages past ~5 sections |
| Font loading: 3 font families × 4 weights × 2 styles with no subsetting | 300KB+ of fonts; FOIT; LCP regression | Self-host via `next/font`; subset to Latin; `font-display: swap`; limit to 2 weights per family | On first visit, always |
| Analytics + Turnstile + third-party loaded in `<head>` | TBT > 300ms; INP regression | Load analytics with `afterInteractive`; Turnstile widget loaded only on wizard section via Intersection Observer | On slower devices from first wizard interaction |
| Auto-rotating carousel with layout thrashing | CLS spikes every N seconds; reading interrupted | Prefer static grid; if rotating, fixed-height container, no layout change per slide (M7) | Always |
| No cache headers on static assets / on `/_next/image` | Every visit re-fetches optimized variants; bandwidth bill climbs | Long `cache-control` on static, `immutable` where applicable; Vercel defaults are good if not overridden | At ~1000 visits/day |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Email endpoint accepts any origin | Spam submissions from scripted origins | Verify CSRF token or origin; honeypot field; server-side rate limit (H7) |
| Turnstile secret exposed as `NEXT_PUBLIC_` | Bypasses protection entirely | Secret key is server-only; only sitekey is public; lint rule to block `NEXT_PUBLIC_TURNSTILE_SECRET` |
| Storing email+phone in a public-readable log/DB | PII breach | Storage behind authenticated endpoint only; no public read access; encrypted at rest |
| Logging full submission bodies to a public log drain (Vercel Logs, Axiom, etc.) | PII leak to whoever has log access | Redact PII before logging; log only submission ID + lead-source for debugging |
| Reflecting form values into the success page unsanitized | XSS if values rendered as HTML | Always render as text; if showing a name, sanitize; prefer "Thanks! We'll be in touch." without echoing PII back |
| Running any user input through `eval`, `new Function`, or `dangerouslySetInnerHTML` | XSS | Never. For rich text, use a vetted library and sanitize. Markdown renderer must escape HTML by default |
| Committing `.env.local` with email API keys | Credential leak | `.gitignore` it; pre-commit hook via `gitleaks` or similar; rotate keys immediately if leaked |
| Unbounded free-text field | Stored log / inbox stuffed with spam novels | Per-field length limits (e.g., 2000 chars message, 100 chars name); reject above limit with clear error |
| GitHub secret `GITHUB_TOKEN` with broader scope than needed for agent workflow | Agent token can do more than it should | Least-privilege PAT; scope to `contents:write` on this repo only; rotate on a schedule |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Wizard progress indicator shows "Step 2 of ?" | User doesn't know how much further; raises abandonment | Show total steps from the start ("Step 2 of 4"); honest count even if final step is optional |
| "Required" fields marked only with asterisk | Colorblind / low-vision users miss it | Asterisk + text "required" in label; `required` attribute on input; `aria-required="true"` |
| Phone field accepts only US format without hint | International caterers or non-typical formatters fail validation | Accept any format; normalize server-side with `libphonenumber`; show placeholder `(415) 555-0100` |
| Date picker forbids past dates but allows 10+ years in the future | Booking 2036 wedding is not realistic; often a typo | Constrain to reasonable window (today + 14 days minimum lead time, today + 18 months max); clear error on boundary |
| Submit button text is "Submit" | Generic, cold | Specific: "Send my inquiry" / "Get my quote" — reinforces the action |
| Confirmation page is "Thanks!" and no next step | User doesn't know what happens next | "Thanks — here's what happens next: 1) Larrae will reply within 24 hours to [email]. 2) She may follow up by phone at [number]. 3) If you don't hear back, text [number] and reference [submission ID]." |
| Package comparison forces user to scroll between cards | Hard to compare tiers | Side-by-side comparison on desktop; carousel with peek-through on mobile; feature matrix row-by-row below |
| Menu page has no way to ask "can you do X?" | Users abandon if their specific dish/diet isn't listed | FAQ accordion addressing customization; wizard includes dietary field with free-text follow-up (M11) |
| Testimonials without context (name, event type, date) | Feel generic, possibly fake | Real name (first + last initial), event type ("Corporate launch, 60 guests"), date/season ("Spring 2025") — matches the three target personas |
| Photography with no alt text or decorative-only alt | Screen-reader users get "image, image, image" | Meaningful alt describing the dish + context; decorative backgrounds marked `role="presentation"` or `alt=""` |

---

## "Looks Done But Isn't" Checklist

- [ ] **Hero section:** Often missing `priority`/`preload` on the LCP image, `sizes` attribute, explicit dimensions, contrast scrim for text — verify with Lighthouse mobile, axe-core, and a real phone on cellular
- [ ] **Menu section:** Often missing per-dish dietary tags, alt text, word-count minimums — verify each dish card renders with a description ≥ 40 words and alt text ≥ 8 words
- [ ] **Package cards:** Often missing explicit tier ranges with no gaps, min-guest enforcement, fee model — verify with C3 boundary test table
- [ ] **Gallery:** Often missing aspect-ratio reservations, lazy-loading, keyboard-accessible lightbox, alt text — verify CLS on gallery section < 0.1, tab-navigate the gallery end-to-end
- [ ] **Wizard:** Often missing sessionStorage persistence, URL step param, focus management on step change, ARIA live announcements, idempotency key, progress indicator — verify refresh-mid-wizard preserves state, VoiceOver reads step transitions, double-click submit produces one record
- [ ] **Live estimate:** Often missing fee components, disclaimer as primary UI (not fine print), range framing — verify estimate and first-reply quote match on a sample of 5 inputs including boundaries
- [ ] **Lead pipeline:** Often missing SPF/DKIM/DMARC, backup delivery channel, dedupe, confirmation page with submission ID, synthetic monitoring — verify mail-tester score ≥ 9/10, a duplicate submission produces one record, a test lead reaches Larrae's inbox (not spam)
- [ ] **FAQ:** Often missing full-row tap target, keyboard navigation, semantic markup — verify `<details>` / accordion works with Tab + Enter
- [ ] **Footer:** Often missing canonical NAP, links to privacy notice, GBP link, copyright — verify name/address/phone match schema and GBP exactly
- [ ] **LocalBusiness / Restaurant schema:** Often missing `servesCuisine`, `areaServed`, `priceRange`, `openingHoursSpecification`, or using generic `LocalBusiness` — verify with Google Rich Results Test, no warnings
- [ ] **CCPA notice:** Often missing retention period, data categories list, deletion request method — verify plain-language privacy page linked from footer AND wizard submit
- [ ] **OG/Twitter metadata:** Often missing correct dimensions (1200×630), site-level hero, business name — verify with FB Sharing Debugger + LinkedIn Post Inspector
- [ ] **Analytics:** Often missing step-level funnel events, privacy-respecting configuration — verify a submission creates `wizard_started` → `wizard_step_completed × N` → `wizard_submitted` in order
- [ ] **Spam defense:** Often missing honeypot, rate limit, Turnstile not in test mode — verify production build has real Turnstile key, rate limit returns 429 on 6th submission from same IP/hour, honeypot rejects scripted fill
- [ ] **A11y:** Often missing focus-visible styles, heading hierarchy, reduced-motion respect, color-not-only-state — verify axe-core clean, VoiceOver and keyboard-only walkthrough of the entire page
- [ ] **Performance budget:** Often missing CI enforcement — verify Lighthouse CI (or equivalent) on PR blocks regressions past LCP 2.5s / CLS 0.1 / INP 200ms mobile
- [ ] **Content validation:** Often missing frontmatter Zod schema, image-reference check, unique-slug check — verify `pnpm content:validate` is a required status check on `main`
- [ ] **Launch:** Often missing GBP audit, real testimonials (not placeholders), phone that's answered, end-to-end smoke test — verify each of the four before go-live

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| C1. Silent lead loss in production | HIGH | (1) Roll back to previous deploy if the issue is code-level. (2) Manually export stored records and cross-reference with Larrae's inbox to identify missed leads. (3) Reach out to missed leads within 24 hours with apology + fast response. (4) Add SMS/Slack fallback before next deploy. (5) Post-mortem with Larrae. |
| C2. Estimate diverges from quote for live leads | HIGH (trust) | (1) Add a prominent "estimate only" banner immediately. (2) Audit and unify the pricing source. (3) Reach out personally to any lead who received a mismatched number. (4) Consider a small discount to restore trust. |
| C4. Content edit breaks production build | LOW | (1) Roll back the offending PR via Vercel → previous deploy. (2) Fix the frontmatter in a follow-up PR. (3) Add the missing schema rule so it can't recur. |
| C5. NAP inconsistency discovered post-launch | MEDIUM | (1) Pick the canonical NAP (match GBP usually). (2) Update site + schema to match in one PR. (3) Update GBP if that's the outlier. (4) Allow 2-4 weeks for Google to re-crawl; resubmit sitemap. |
| C6. Launch-day issue with lead pipeline | HIGH | (1) Temporarily replace wizard CTA with a mailto: or tel: link. (2) Investigate + fix. (3) Restore wizard. (4) Synthetic monitoring from next launch. |
| H1. Images blowing CWV budget post-launch | MEDIUM | (1) Run image audit (find > 500KB files in `/public`). (2) Re-export at correct dimensions + quality. (3) Ensure all are going through `<Image>`. (4) Add PR CI budget. |
| H3. Wizard state loss complaint from user | LOW | (1) Add sessionStorage persistence in next patch release. (2) Reach out to reporting user with direct email path. |
| H4. No funnel data for a week post-launch | LOW | (1) Instrument step events immediately. (2) Accept the first week as blind. (3) Funnel data starts accruing from instrumentation date. |
| H7. Bot storm mid-launch | MEDIUM | (1) Lower the rate-limit ceiling temporarily (e.g., 2/IP/hour). (2) Enable Turnstile in "interactive" mode. (3) Check logs to identify attack pattern. (4) IP-block if coordinated. (5) Restore normal settings after 48 hours. |
| H8. Agent pushed directly to main | MEDIUM | (1) Lock down branch protection. (2) Revert the commit if it broke anything. (3) Audit the agent's recent commits. (4) Move agent to PR-only flow. |
| M1. CCPA complaint from user | MEDIUM | (1) Acknowledge + fulfill the deletion request within 45 days. (2) Document the incident. (3) Tighten privacy notice if gap identified. |
| M9. Brand feels generic post-launch | HIGH (design re-do) | (1) Don't panic-rebrand. (2) Do a small, targeted photography re-shoot focused on hands/cast iron/abundance. (3) Add heritage story depth to About without restructuring the page. |
| M11. Customer expected a customization that isn't possible | LOW | (1) Larrae handles case-by-case. (2) Update FAQ with the clarifying language. (3) Add a field to wizard to flag the case earlier. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| C1. Silent lead loss | Lead Pipeline, Launch Prep | Synthetic daily submission alert fires within 5 minutes on failure; mail-tester.com ≥ 9/10 |
| C2. Estimate / quote divergence | Content Pipeline, Form/Wizard | Snapshot test: estimator output == displayed price for 10 sample inputs; single `calculateEstimate()` module imported by both display and wizard |
| C3. Package tier boundary ambiguity | Content Pipeline, Form/Wizard | Unit test: for each integer 1–200, exactly one tier (or explicit "custom quote" path) matches; all boundary values tested |
| C4. Content breaks production build | Content Pipeline, Foundation | `pnpm content:validate` is a required GitHub status check; PR with broken frontmatter fails CI in test repo |
| C5. NAP inconsistency | SEO, Launch Prep | Grep for business name/address/phone in codebase returns only config-file-sourced values; Rich Results Test clean; GBP character-for-character match in config |
| C6. Launch without smoke test | Launch Prep | Written smoke test plan signed off T-72h; 3 test devices × 3 scenarios × Larrae-received-email confirmed |
| H1. Photography blowing performance | A11y/Perf, Design System, Build-Out | Lighthouse CI budget enforced on PR (mobile LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms); no image in `/public` > 500KB |
| H2. Gallery jank / lightbox cost | Build-Out, A11y/Perf | Bundle analyzer shows lightbox not in main chunk; CLS on gallery section < 0.1; INP on tap < 200ms on 4x CPU throttle |
| H3. Wizard state loss | Form/Wizard | Refresh-mid-wizard test in smoke matrix; URL reflects current step; back button navigates steps |
| H4. No wizard analytics | Form/Wizard, Launch Prep | Funnel configured in analytics UI pre-launch; test submission shows all step events in order |
| H5. Share-link metadata | SEO, Build-Out, Design System | Site-level OG validates in FB/LinkedIn/Twitter validators; per-package routes (if built) have per-item OG |
| H6. Double-submit leads | Form/Wizard, Lead Pipeline | Idempotency key implemented; double-click produces one record in test |
| H7. Bot storm / CAPTCHA misconfigured | Lead Pipeline, Launch Prep | Turnstile CSR > 85% monitored; rate limit returns 429 on 6th submission; honeypot blocks scripted submission |
| H8. Agent pushes to main / env drift | Foundation, Content Pipeline | Branch protection active; env parity audit pre-launch; post-deploy synthetic passes |
| H9. Text-over-image contrast | Design System, A11y/Perf | axe-core passes on every section; contrast audited against worst-case pixel; responsive crops preserve scrim |
| H10. No crawlable text | SEO, Content Pipeline, Design System | Word count per section meets budget; Lighthouse SEO ≥ 95; heading hierarchy clean |
| M1. CCPA / retention | Lead Pipeline, Launch Prep | Privacy notice reviewed; retention cron purges test records; notice linked from footer + wizard |
| M2. Sticky nav scroll landing | Design System, Build-Out | Manual test from every nav link; heading visible after click on every breakpoint |
| M3. Scroll-spy performance | Build-Out, A11y/Perf | IntersectionObserver used (not scroll listener); INP < 200ms on scroll with 4x CPU throttle |
| M4. Wizard a11y announcements | Form/Wizard, A11y/Perf | VoiceOver (iOS) + NVDA (Win) walkthrough in smoke matrix; aria-live region present |
| M5. Mobile keyboard coverage | Form/Wizard, A11y/Perf | Real iPhone + Android test of every wizard step input |
| M6. Touch targets too small | Design System, Build-Out | Every interactive element ≥ 44×44 CSS px; axe-core and manual audit |
| M7. Auto-rotating testimonials | Build-Out, A11y/Perf | Static testimonials preferred; if rotating, pause + manual nav + reduced-motion respect verified |
| M8. Color-only state indicators | Design System, Form/Wizard | Error state includes icon + text + ARIA, not color alone; axe-core color-contrast rule clean |
| M9. Brand sanitization | Design System, Content Pipeline | Side-by-side test with Sweetgreen screenshot: distinguishable without logos |
| M10. Heritage kitsch creep | Design System, Content Pipeline | Corporate-persona review of final design; quilted pattern usage limited per PROJECT.md; script fonts are display-only |
| M11. Menu customization vague | Content Pipeline, Form/Wizard | Per-dish dietary tags in schema; FAQ addresses limits; wizard has dietary step in step 2 |
| L1. FAQ tap target | Build-Out, Design System | Whole-row click target on every accordion |
| L2. Content merge conflicts | Content Pipeline | One item per file; descriptive PR titles |
| L3. OG image format | SEO, Launch Prep | 1200×630, tested in all three validators |
| L4. No 404 page | Build-Out | Custom 404 present and branded |

---

## Sources

- [Next.js Image Component: Performance and CWV in Practice (Pagepro)](https://pagepro.co/blog/nextjs-image-component-performance-cwv/) — LCP preloading thresholds, CLS from `fill` misuse, quality recommendations for photography (HIGH confidence, recent)
- [Next.js Core Web Vitals 2026 (shubhamjha.com)](https://shubhamjha.com/blog/core-web-vitals-nextjs-optimization) — priority deprecation in Next.js 16, preload patterns (HIGH confidence)
- [Next.js Image Optimization (DebugBear)](https://www.debugbear.com/blog/nextjs-image-optimization) — `sizes` attribute behavior, `remotePatterns` config (HIGH confidence)
- [Next.js `<Image>` API docs](https://nextjs.org/docs/app/api-reference/components/image) — authoritative reference (HIGH confidence)
- [Local Business Schema: The Complete Guide 2026 (theStacc)](https://thestacc.com/blog/local-business-schema/) — Restaurant vs. generic LocalBusiness, subtypes (MEDIUM confidence, confirmed against Schema.org)
- [NAP Consistency in 2026 (Jasmine Directory)](https://www.jasminedirectory.com/blog/nap-consistency-explained-why-your-directory-listings-must-match-in-2026/) — character-for-character match requirement (MEDIUM confidence)
- [Schema + GBP (VP Marketing)](https://vpmarketinggroup.com/2026/03/31/schema-gbp-the-fastest-way-to-help-google-and-ai-understand-your-business-2/) — GBP alignment patterns (MEDIUM confidence)
- [Multi-Step Form Best Practices (Reform.app)](https://www.reform.app/blog/7-tips-for-multi-step-form-validation) — validation patterns, abandonment data (MEDIUM confidence)
- [58 Form Design Best Practices 2026 (Venture Harbour)](https://ventureharbour.com/form-design-best-practices/) — mobile keyboard, native input types (MEDIUM confidence)
- [NN/Group: 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) — step disclosure patterns (HIGH confidence, authoritative UX research source)
- [California AG CCPA page](https://oag.ca.gov/privacy/ccpa) — authoritative CCPA reference (HIGH confidence)
- [Transcend: CCPA vs CPRA 2026](https://transcend.io/blog/cpra-vs-ccpa) — thresholds and obligations (MEDIUM confidence)
- [Jackson Lewis: CCPA 2026 FAQs](https://www.jacksonlewis.com/insights/navigating-california-consumer-privacy-act-30-essential-faqs-covered-businesses-including-clarifying-regulations-effective-1126) — 1/1/26 regulatory updates (HIGH confidence, law firm analysis)
- [Drata: CCPA Compliance Checklist 2026](https://drata.com/blog/ccpa-compliance-checklist-2026) — retention patterns (MEDIUM confidence)
- [Cloudflare Turnstile product docs](https://www.cloudflare.com/application-services/products/turnstile/) — authoritative (HIGH confidence)
- [Friendly Captcha: Cloudflare CAPTCHA Alternatives 2026](https://friendlycaptcha.com/insights/cloudflare-captcha-alternative/) — false positive patterns (MEDIUM confidence)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — schema validation patterns (HIGH confidence)
- [zod-matter (GitHub)](https://github.com/HiDeoo/zod-matter) — frontmatter + Zod validation reference (HIGH confidence)
- [remark-lint-frontmatter-schema (GitHub)](https://github.com/JulianCataldo/remark-lint-frontmatter-schema) — CI validation via remark (MEDIUM confidence)
- [velite (GitHub)](https://github.com/zce/velite) — alternative Zod+markdown tool (MEDIUM confidence)
- WCAG 2.1 AA, 2.5.5 target size, 2.2.2 pause/stop/hide — spec references (HIGH confidence)
- iOS HIG minimum 44×44 tap target — platform guideline (HIGH confidence)
- PROJECT.md — internal source on retired quilted wallpaper, palette intent, package pricing tiers, Sweetgreen-as-structural-reference-only (HIGH confidence, project canon)

---

*Pitfalls research for: Larrae's Kitchen (photography-led single-page catering site with markdown-in-repo content, multi-step wizard, AI-agent editing workflow)*
*Researched: 2026-04-15*
