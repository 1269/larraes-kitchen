# Phase 3: Inquiry Wizard & Lead Pipeline - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the conversion engine — a 4-step React island wizard (Event Type → Guests & Date → Package → Contact) with a live price estimate bound to `content/packages/*.md`, and the server-side Astro Action that re-validates input, verifies Turnstile, enforces rate-limit + idempotency, stores the lead via the `LeadStore` (Google Sheets adapter), and triggers both a Larrae notification email and an inquirer confirmation email through Resend + React Email. Spam defense layered across honeypot / min-time / URL-in-notes / Turnstile. No SEO structured-data, no a11y audit, no CWV work, no production email authentication (Phase 4 / Phase 5). Photography remains placeholder (Phase 2 decision carried forward).

</domain>

<decisions>
## Implementation Decisions

### Wizard Surface & Entry
- **D-01:** Wizard renders as a full-screen modal via **shadcn Dialog** — takes over the viewport with a dimmed backdrop over the home page. Dialog primitive provides focus trap, Escape handling, and ARIA roles for A11Y-03. Opens from Hero CTA (HERO-03), nav "Get a Quote" (LAYT-02), and Package card CTAs (PKG-04). Install `shadcn@latest add dialog` in Phase 3 (not yet present; Phase 1 D-08 only installed Button).
- **D-02:** Package card deep-links carry tier forward but land on **Step 1 with tier stored** — the user still walks through Event Type, Guests & Date before seeing the pre-selected tier on Step 3. Preserves complete funnel data (Event Type + Guest Count are always captured for every lead); an estimate needs a guest count to be meaningful. URL form: `/?step=1&tier=medium`.
- **D-03:** Dismiss behavior is **dirty-aware**. Clean modal (no user input) closes instantly on X, Escape, or backdrop click. Dirty modal triggers an inline confirmation inside the Dialog: *"Leave the quote wizard? Your progress is saved on this device."* with `[Keep editing]` / `[Close]`. sessionStorage retains state in both paths (WIZ-04) — confirmation exists to reinforce that the user can return, not to block them.
- **D-04:** URL sync uses **`pushState` query params**. Opening the modal pushes `/?step=1`; each step advance pushes a new history entry (`/?step=2`, `/?step=3`, `/?step=4`). Browser Back moves to previous step; Back from Step 1 closes the modal and lands on `/`. Closing via X or backdrop also pushes `/`. Tier pre-selection combines: `/?step=3&tier=medium`. Matches WIZ-05 natively and is SPA-standard.

### Step 1: Event Type
- **D-05:** Step 1 presents **three persona tiles**: Family / Social / Corporate. Visual tiles (icon + short descriptor, e.g. "Family — intimate gatherings, 10–20 people") arranged for tap-scale on mobile. Mirrors the three personas already in PROJECT.md (Family Celebration Cynthia, Social Host Ethan, Corporate Planner Emma). Mobile-fast: one tap completes the step.
- **D-06:** Event Type is **purely informational**. Stored on the lead record, surfaced in Larrae's notification email subject + body (D-15), captured as a `wizard_start` analytics param (per OBS-01 hook). It does NOT filter package visibility, change pricing, reorder tiers, gate lead-time, or alter blackout dates. Tier selection logic (D-10) depends only on guest count, avoiding two conflicting recommendation systems.

### Step 2: Guests & Date
- **D-07:** Guest count uses **quick-pick chips + editable number field**. Four tappable chips — `10–20`, `21–30`, `31–50`, `50+` — auto-fill a sensible midpoint (15 / 25 / 40 / 75). Below, an editable `<input inputmode="numeric">` (WIZ-07) for the precise count. Chips double as a soft preview of which tier the user will land on. 44×44 touch targets (WIZ-08).
- **D-08:** Date picker is **native `<input type="date">`** with inline validation on blur/submit. Below the input, a preview hint sourced from `content/site.md`: *"We typically need X days lead time. Blackout dates: [list]."* (X = `site.leadTimeDays`, list = `site.blackoutDates`.) Invalid picks show an inline error with a suggested alternate date (WIZ-10). Native picker keeps the mobile UX platform-idiomatic (WIZ-07) and adds zero bundle cost — blackouts are visualized as text because the list is small.
- **D-09:** Optional ZIP field (WIZ-11) pre-fills the Event-address city on Step 4 when the soft service-area check resolves to a known city. Soft check means: out-of-area ZIPs do NOT block submission — show *"We may need to travel — Larrae will confirm."* and continue. Matches the "not sure? just ask" fallback in WIZ-11.

### Estimate Math & Tier Logic
- **D-10:** Estimate formula = `guests × pricePerPerson.min` → `guests × pricePerPerson.max`, each end of the range rounded to the nearest **$10**. Implementation lives at `src/lib/pricing/estimate.ts` (Phase 1 stub exists at D-06 there). Returns `{min: number, max: number} | { kind: 'custom' }`. Display format: `"Estimated $500–$650"` with `"Final quote confirmed by Larrae"` shown at equal visual weight (EST-03/04). All package data sourced exclusively from `content/packages/*.md` (EST-02) — no hardcoded pricing anywhere in client or server code. Unit tests cover every integer guest count 1–200 at tier boundaries 9/10/11, 20/21, 30/31, 75/76 (EST-05/06).
- **D-11:** Step 3 **auto-selects the matching tier** and allows override. When Step 3 opens, the tier matching the guest count (Small 10–20, Medium 21–30, Large 31–75) is pre-selected with a *"Recommended for N guests"* badge. All three cards visible. User can tap to override; a mismatched pick (e.g., 15 guests → Small tier OK but 15 guests → Large tier) shows an inline soft note — *"Small fits up to 20 — double-check your guest count"* — but does NOT block progression. Respects user agency.
- **D-12:** Out-of-range guest counts (< 10 or > 75, or > 200 hard cap) route to a **custom-quote path**, still converting to a lead. Step 2 shows inline warning — *"Our minimum is 10 guests."* / *"Groups over 75 get a custom quote."* — with the Next button active. Step 3 replaces the three package cards with a single "Custom quote" card (no price, describes what a custom quote includes), auto-selected. Step 4 is unchanged. Estimate bar shows *"Custom quote — Larrae will follow up"* instead of a numeric range. These are real leads, just higher-touch.
- **D-13:** Live estimate renders as a **sticky bottom bar inside the modal**. Hidden until a valid guest count exists (avoids "$0–$0" on Step 1). Updates live with debounce (~250ms) as guest count or tier change (EST-07). Visible on Steps 2, 3, and 4. Shows `"Estimated $500–$650 · Final quote confirmed by Larrae"`. The final range displayed at submit-time is captured and stored on the lead record (LEAD-07) and echoed in the notification email and confirmation email + screen.

### Step 4: Contact Fields
- **D-14:** Step 4 required fields: **Name, Email, Phone**. Optional fields, all in scope for v1:
  - **Event address / delivery location** — street + city (ZIP from Step 2 pre-fills city when resolvable)
  - **"Anything special?"** — free-text textarea for dietary restrictions, venue details, special requests
  - **"How did you hear about us?"** — select: Google / Instagram / Word of mouth / Other
  - **Preferred contact method** — radio: Email / Phone / Text
  
  Optional fields clearly labeled. Free-text fields feed into SPAM-04 URL-in-notes heuristic. Required fields trigger step-boundary validation per WIZ-03.

### Confirmation Screen (Post-Submit)
- **D-15:** On successful submit, the wizard replaces its form content with a **recap + submission ID + next-steps** confirmation screen (no redirect per WIZ-12). Copy:
  - Heading: *"Thanks, [Name] — your request is in."*
  - Event summary: date, guest count, tier name, estimated range (the exact range captured at submit-time, not recalculated)
  - Submission ID prominently: *"Reference: LK-4Q7P3B"*
  - Next steps: *"Larrae will reply within 24 hours. Check spam just in case."*
  - Primary action: `[Back to site]` button (closes modal, returns to `/`)
  
  Warm and specific. Reinforces the heritage brand moment and gives the user something to reference if the email is slow.

### Emails
- **D-16:** **Larrae's notification email** is action-first (LEAD-08). React Email template named `LeadNotification`.
  - Subject: `"New quote: [Name] · [Event type] · [Guest count] guests · [Date]"`
  - Top of body: action block — name, phone as `tel:` tap-to-call link, email as `mailto:` link, event date, event type, estimated range. Designed for Larrae reading on her phone and replying within minutes.
  - Below action block: full submission detail — free-text notes, event address, how-heard, preferred contact method, ZIP, submission ID, server timestamp.
  - Signature line: *"From the Larrae's Kitchen site"*.
  - React Email + Tailwind-for-email for dark-mode handling and brand continuity.

- **D-17:** **Inquirer's confirmation email** uses warm heritage voice (LEAD-09). React Email template named `LeadConfirmation`.
  - Subject: `"We got your request — thanks, [Name]"`
  - Opening line: short warm framing (*"We cook like family, and we treat every inquiry the same way."* — exact copy authored in Phase 3).
  - Body: recap of submitted event (type, date, guest count, tier, estimated range), 24-hour response expectation, submission ID (the short `LK-XXXXXX` form), and a plain mailto reply CTA at the bottom.
  - Mirrors the on-site confirmation screen so the user sees consistent messaging across surfaces.
  - React Email + Tailwind-for-email, dark-mode supported.

### Error UX
- **D-18:** Submission failures show **specific-cause messages with email fallback** (SPAM-05). Inline red alert block above the Step 4 submit button:
  - Turnstile fail → *"Having trouble verifying you're human. Please try again or email us directly: [email from site.md]"*
  - Rate limit (LEAD-03 hit) → *"Too many attempts — please wait a few minutes, or email us directly."*
  - Server error (5xx) → *"Something went wrong on our end — please try again, or email us directly."*
  
  Each message links to a `mailto:` built from `site.email`. On failure: no submission ID is generated, the lead record is NOT written, and sessionStorage retains the form so the user can retry. **SPAM-01..04 bot-tripped rejections** (honeypot filled, URL-in-notes, instant-submit under threshold) return a generic 200 success response with a decoy submission ID pattern that is never persisted — no tell to the bot, no lead, no email.

### Submission ID Format
- **D-19:** Submission IDs use the form **`LK-XXXXXX`** where `XXXXXX` is a 6-character uppercase suffix derived from a ULID (base32, e.g., `LK-4Q7P3B`). Short enough to read aloud on a phone call, unique at expected lead volume (< 10,000 v1). The **full ULID is stored in a separate Google Sheets column** for time-sortability and collision safety; the short `LK-XXXXXX` is what surfaces on the confirmation screen, in both emails, and in any user-facing contexts.

### Claude's Discretion
- Exact visual styling of tiles, chips, cards, sticky bar within the shadcn + two-layer token system
- Precise animation timings for modal enter/exit, sticky bar appearance, and step transitions (all respect `prefers-reduced-motion` per WIZ-14)
- Specific focus-management order within each step (A11Y-03 says "proper ARIA roles/labels" — implementation choice)
- Google Sheets column names and order (within the LEAD-07 data set: full submission, timestamp, IP hash, submission ID, final estimate)
- Exact copy wording for every micro-message (inline hints, error strings, empty states) — principles set above, specifics during authoring
- Whether to install shadcn `Form` + react-hook-form `<Form>` wrapper vs. hand-wire RHF directly — pick the most maintainable
- Wizard island bundle-split strategy (lazy-load on first Dialog open vs. prefetch on hero intersection) — Phase 4 CWV work may revisit
- Cron schedule specifics for LEAD-11 retry (time of day, retry count, backoff)
- Exact debounce timing for estimate updates (EST-07) — feel-based tune
- Whether to render the `wizard_submit_success/failure` analytics event client-side or via Action response — either satisfies OBS-01

### Folded Todos
None — `gsd-tools todo match-phase 3` returned zero matches.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements (the acceptance contract)
- `.planning/REQUIREMENTS.md` §"Inquiry Wizard" — WIZ-01 through WIZ-14 (4-step structure, persistence, URL sync, mobile inputs, lead-time/blackout, ZIP soft-check, confirmation screen, keyboard nav, reduced-motion)
- `.planning/REQUIREMENTS.md` §"Live Price Estimate" — EST-01 through EST-08 (pure shared function, single-source from packages/*.md, range display, boundary tests, debounce, out-of-range fallback)
- `.planning/REQUIREMENTS.md` §"Lead Submission Pipeline" — LEAD-01 through LEAD-12 (Astro Action, Zod re-validation, Turnstile server-verify, rate limit, idempotency, store-before-email, Google Sheets adapter, Resend templates, retry cron, delivery webhooks)
- `.planning/REQUIREMENTS.md` §"Spam Protection" — SPAM-01 through SPAM-06 (honeypot, Turnstile widget, min-time threshold, URL-in-notes heuristic, email fallback, CI test-key check)
- `.planning/REQUIREMENTS.md` §"Out of Scope" — explicit v1 exclusions (abandoned-cart, save-and-resume, real-time availability — all v2)

### Phase Goal & Success Criteria
- `.planning/ROADMAP.md` §"Phase 3: Inquiry Wizard & Lead Pipeline" — goal, 7 success criteria, risks addressed (C1, C2, C3, H3, H6, H7, H4), Phase 2 dependency rationale

### Project Constraints
- `.planning/PROJECT.md` — Core value, personas (Family/Social/Corporate), multi-step wizard with live estimate rationale, markdown-in-repo + AI-agent-via-GitHub constraint, single-page scroll constraint (modal doesn't break this)
- `.planning/PROJECT.md` §"Key Decisions" — "Multi-step wizard", "Live price estimate", "Email + stored log for leads" decisions and rationale
- `.planning/STATE.md` §"Decisions" — stack confirmation, content workflow, store-before-email ordering, LeadStore interface
- `.planning/STATE.md` §"Blockers/Concerns" — resolved Open Decisions (package tiers 10–20/21–30/31–75, Google Sheets lead storage, placeholder photography, domain deferred to Phase 5)

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` §"Shared Schema & Repo Layout" — D-05 (schemas at `src/lib/schemas/`), D-06 (`src/lib/pricing/estimate.ts` stub + test contract, boundary list), D-07 (`src/lib/{email,leads}` directories exist with `.gitkeep`), D-08 (shadcn Button installed; Dialog/Input/Form/Label to be installed in Phase 3), D-15 (env var names registered: RESEND_API_KEY, RESEND_FROM_EMAIL, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, GOOGLE_SHEETS_CREDENTIALS_JSON, GOOGLE_SHEETS_LEAD_SHEET_ID), D-14 (Astro `output:'server'` + `@astrojs/vercel` = where `defineAction` handlers plug in)
- `.planning/phases/02-content-static-sections/02-CONTEXT.md` §"Navigation & Scroll" — D-12 through D-15 (nav behavior, "Get a Quote" CTA surface), plus all 8 static sections as the page the modal overlays
- `.planning/phases/02-content-static-sections/02-CONTEXT.md` §"Existing Code Insights" — site.md NAP + leadTimeDays + blackoutDates canonical source

### Research & Stack
- `.planning/research/STACK.md` — Astro 6 + React 19.2 island + React Hook Form + Zod + Astro Actions + Resend + React Email + Google Sheets + Cloudflare Turnstile + Vercel (serverless + cron)
- `.planning/research/ARCHITECTURE.md` — Action handler location (`src/actions/`), LeadStore interface pattern, email template layout conventions
- `.planning/research/PITFALLS.md` — Known traps: Turnstile test-key in production, email-before-store silent-loss, rate-limit IP extraction on Vercel, React 19 + RHF interop
- `.planning/research/SUMMARY.md` — Cross-cutting research summary, Open Decisions resolution context
- `.planning/research/FEATURES.md` — Feature catalog mapping WIZ/EST/LEAD/SPAM to library capabilities

### Source-of-Truth Files
- `src/lib/schemas/packages.ts` — `packageSchema` (id, guestRange {min,max}, pricePerPerson {min,max}, includes, popular, order) — authoritative input shape for `estimate()`
- `src/lib/schemas/site.ts` — `siteSchema` including `leadTimeDays`, `blackoutDates`, `responseTime`, `email`, `phone` — drives date-picker validation (D-08), Step 4 ZIP fallback (D-09), error-message mailto links (D-18)
- `src/content/packages/{small,medium,large}.md` — the data the live estimate operates against; Phase 2 authored, schema-validated in CI
- `src/content/site.md` — canonical NAP, lead-time, blackouts; Phase 2 authored
- `src/lib/pricing/estimate.ts` — Phase 1 stub at this path; Phase 3 replaces the `throw` with the real implementation per D-10

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/lib/pricing/estimate.ts` (stub)** — typed stub exists from Phase 1 D-06 with the exact function signature Phase 3 will implement (`EstimateInput`, `EstimateRange`, pure function). Co-located test file `estimate.test.ts` already scaffolded for EST-05/06 boundary coverage.
- **`src/lib/schemas/` (all 8 schemas)** — `packageSchema` (for pricing), `siteSchema` (for lead-time + blackouts), plus the others. Phase 3 adds a new `leadSchema` here for wizard form validation + Astro Action input re-validation (same Zod schema, shared client/server per D-05 in Phase 1).
- **shadcn Button** (`src/components/ui/button.tsx`) — used for wizard step navigation, submit, CTAs. Additional shadcn components to install in Phase 3: **Dialog** (D-01), **Input**, **Label**, **Form**, **RadioGroup** (for preferred contact), **Textarea** (for notes).
- **Design tokens** (`src/styles/global.css`) — full brand palette + semantic tokens + editorial type scale. Sticky estimate bar uses `bg-surface` + `border-accent`; submit button uses `bg-primary` (greens-deep); error alert uses `bg-southern-red` tinted.
- **Site data hook pattern** — `getEntry('site', 'site')` from Content Collections is the pattern Phase 2 uses for NAP; wizard reuses it for `leadTimeDays`, `blackoutDates`, `email` (for error-UX mailto).
- **Package data loader** — `getCollection('packages')` pattern Phase 2 PackagesSection already uses; Phase 3 passes the loaded data into the wizard island as a prop (server → client boundary).

### Established Patterns
- **Astro Content Collections + Zod** — authoritative source for any configurable data; Phase 3 does not add new content files, only consumes packages + site.
- **Two-layer design tokens** — components reference semantic tokens (`text-ink`, `bg-surface`, `border-accent`), never raw brand names.
- **React islands with `client:*` directives** — Phase 2 established GalleryGrid (`client:visible`), MenuTabs (`client:load`), NavController (`client:load`). Wizard follows this pattern; Dialog Trigger renders server-side, Dialog content hydrates on first open (`client:idle` or `client:visible` — Claude's discretion pending bundle-split analysis).
- **Server → client data passing** — Astro component loads package data, passes as typed prop to React island; island never re-fetches.
- **Pure-function estimator co-located with tests** — pattern set by Phase 1 D-06; Phase 3 completes it.
- **Native elements first, shadcn for a11y-critical pieces** — FAQ section used native `<details>` successfully (Phase 2 D-discretion). Wizard uses shadcn Dialog because Dialog's a11y is non-trivial, but forms inside the dialog use standard inputs + RHF.

### Integration Points
- **`src/actions/` directory** — exists empty from Phase 1 scaffold. Phase 3 creates `src/actions/submitInquiry.ts` (Astro Action) and `src/actions/index.ts` (export). Uses `defineAction({ accept: 'form', input: leadSchema, handler })` pattern from research/STACK.md.
- **`src/lib/email/` directory** — exists empty. Phase 3 creates `templates/LeadNotification.tsx` and `templates/LeadConfirmation.tsx` (React Email), plus `send.ts` (Resend client wrapper).
- **`src/lib/leads/` directory** — exists empty. Phase 3 creates `LeadStore.ts` (interface), `GoogleSheetsAdapter.ts` (implementation), `store.ts` (factory/singleton), and the ID generator utility (ULID → `LK-XXXXXX` short form).
- **Env vars already registered** — Phase 1 D-15 pre-registered every v1 env var. Phase 3 only fills values into Vercel Preview: RESEND_API_KEY (sandbox key), RESEND_FROM_EMAIL (placeholder), TURNSTILE_SITE_KEY + SECRET_KEY (test pair), GOOGLE_SHEETS_CREDENTIALS_JSON, GOOGLE_SHEETS_LEAD_SHEET_ID. No schema changes.
- **Nav "Get a Quote" CTA** (Phase 2 D-13, D-14) — currently an anchor link per Phase 2. Phase 3 retargets it to open the Dialog (event handler instead of href). Hero CTA (HERO-03) and Package card CTAs (PKG-04) same retarget.
- **site.md consumers** — `formatPhone` util and BaseLayout already consume site.md for NAP. Wizard reads `site.leadTimeDays`, `site.blackoutDates`, `site.email` through the same `getEntry('site', 'site')` path.
- **Cron for LEAD-11** — Vercel cron config at `vercel.json`; new endpoint at `src/pages/api/cron/retry-email.ts` (server-rendered API route), auth via Vercel cron secret.

</code_context>

<specifics>
## Specific Ideas

- **"The wizard is a focused task."** Full-screen modal with dimmed backdrop over the home page — the food photography stays present in the background but blurred/dimmed, reinforcing that the user is in the middle of a decision, not reading a brochure.
- **"Don't let the tier become a trap."** D-10 rounds to $10 and D-13 always shows the range with "Final quote confirmed by Larrae" at equal weight — never a single binding number. The live estimate sets expectations; Larrae writes the real quote.
- **"Every lead is a real lead, including the edge cases."** Out-of-range (< 10 or > 75) doesn't dead-end the user at a phone number (D-12) — it routes to a custom-quote path that still captures full contact info. These are often the highest-value leads.
- **"Larrae reads email on her phone."** Notification template (D-16) is action-first: name + `tel:` link + estimate range visible above the fold on mobile. No scanning through a table of 15 fields to find the phone number.
- **"Brand continuity across surfaces."** The confirmation screen (D-15) and the inquirer's confirmation email (D-17) use the same warm heritage voice and recap the same data. The user sees the brand on-site, in their inbox, and in the submission ID (LK- prefix).
- **"SPA-standard URL handling."** pushState `/?step=N` (D-04) means browser back works the way every user expects — no surprises, no broken history.
- **"Bot-tripped submissions look exactly like success."** No 403, no error, no silent loss message (D-18) — a decoy success response that generates no lead, no email. Keeps bot feedback loops uninformative.

</specifics>

<deferred>
## Deferred Ideas

- **Abandoned-cart recovery email** — already v2 (V2-CONV-01). If a user reaches Step 4 and drops off, sessionStorage holds their data locally but no email is sent.
- **Save-and-resume email link** — already v2 (V2-CONV-02). sessionStorage handles the common case (same device, same session).
- **Smart wizard step-skipping / custom-quote flow redesign** — v2 (V2-CONV-03). Current custom-quote path (D-12) keeps them in the standard 4-step flow with different Step 3 content.
- **Real-time availability calendar** — v2 (V2-CONV-04). Date picker uses lead-time + blackout hints (D-08); no backend calendar yet.
- **Admin UI for viewing leads** — v2 (V2-OPS-01). Larrae views the Google Sheet directly on her phone.
- **Event-Type-specific tier recommendations** — discussed and declined in D-06. Would create two recommendation systems that could conflict with guest-count logic (D-11).
- **Event-Type-specific blackout/lead-time rules** — discussed and declined in D-06. Would require schema changes to site.md and a new decision UX for "why this date unavailable".
- **Aggregated rating widget / review scraping** — already out of scope (REQUIREMENTS.md Out of Scope).
- **Online payment in-flow** — already out of scope (PROJECT.md Out of Scope).
- **Share-link for partially-completed wizard** — possible with pushState URL (D-04) but deferred. sessionStorage is enough for v1.
- **Custom react-day-picker with visible blackouts** — discussed and declined in D-08 in favor of native picker + text hints. Revisit if Phase 4 CWV work shows no regression from adding it and Larrae asks for it.

</deferred>

---

*Phase: 03-inquiry-wizard-lead-pipeline*
*Context gathered: 2026-04-16*
