# Phase 3: Inquiry Wizard & Lead Pipeline - Research

**Researched:** 2026-04-16
**Domain:** Multi-step React form island (RHF 7 + Zod) + Astro 6 server Action + layered spam defense + Google Sheets lead store + Resend/React Email + Vercel Analytics + daily retry cron
**Confidence:** HIGH for Astro Actions / Turnstile / Resend / Google Sheets mechanics (verified against official docs). MEDIUM for RHF 7 ↔ `useActionState` interop pattern (ecosystem is still settling — multiple valid wirings).

## Summary

Phase 3 builds the conversion engine. The wizard is a single React island (`WizardIsland.tsx`) mounted inside a shadcn Dialog, using React Hook Form 7 for uncontrolled-by-default state across 4 steps, a pure `estimate()` function driving a sticky-bottom price bar, and sessionStorage + `pushState` URL sync for refresh/back/deep-link resilience. Submit calls an Astro Action (`src/actions/submitInquiry.ts`) that runs the store-first pipeline: silent bot gates (honeypot + min-time + URL-in-notes) → Turnstile server-verify → Zod re-parse → rate limit → Google Sheets append → Resend fan-out (notify + confirm) via `Promise.allSettled`. Email failures never lose the lead: the Sheets row is authoritative, `notify_email_status` / `confirm_email_status` columns record state, and a Vercel cron at `/api/cron/retry-email` retries rows stuck in `pending` daily.

**Primary recommendation:** Call the Astro Action from RHF's `onSubmit` handler directly (not via `useActionState` wrapper). Keep RHF as the client-side source of truth, reuse the *same* Zod schema server-side as the Action `input`, and map `isInputError(error).fields` back onto RHF's `setError` for per-field rendering. This is the minimum-surprise path for React 19 + RHF 7 + Astro 6 — documented by Astro and by the RHF maintainers in `react-hook-form#11832`. `useActionState` adds no value when RHF already owns the submit lifecycle.

**Tier-boundary status (CRITICAL CLARIFICATION):** The prompt references "C3 Tier boundaries — gated on Open Decision resolution." Per `.planning/STATE.md` §Blockers/Concerns, this decision is **already resolved**: Small 10–20, Medium 21–30, Large 31–75. `content/packages/{small,medium,large}.md` files are authored (verified 2026-04-16) with these exact `guestRange` values. **This is NOT a planning blocker.** The only tier-related open questions are the 9/21/31/76 edge-case semantics and the ≤9 / >75 / >200 custom-quote routing — which CONTEXT D-10, D-11, and D-12 fully specify.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Wizard surface & entry (D-01..D-04):**
- D-01: Full-screen **shadcn Dialog** modal; opens from Hero CTA, nav "Get a Quote", Package card CTAs. Install `shadcn@latest add dialog` in Phase 3 (plus Input, Label, Form, RadioGroup, Textarea).
- D-02: Package deep-links land on Step 1 with tier carried (not jumping straight to Step 3). URL: `/?step=1&tier=medium`.
- D-03: Dirty-aware dismiss; clean modal closes instantly, dirty shows inline "Leave the quote wizard?" confirmation with Keep-editing / Close. sessionStorage retains state in both paths.
- D-04: URL sync via **`pushState`** query params (`/?step=N&tier=X`). Each step advance pushes history; browser Back navigates steps; Back from Step 1 closes modal.

**Step 1 (D-05..D-06):**
- D-05: Three persona tiles (Family / Social / Corporate) mirroring PROJECT personas. One-tap completion on mobile.
- D-06: Event Type is purely informational — stored + surfaced in Larrae's email subject. Does NOT filter packages, alter pricing, reorder tiers, or gate dates.

**Step 2 (D-07..D-09):**
- D-07: Quick-pick chips (10–20, 21–30, 31–50, 50+) auto-fill midpoints (15/25/40/75); editable `<input inputmode="numeric">` below. 44×44px targets.
- D-08: Native `<input type="date">` with inline lead-time + blackout validation on blur/submit. Hints text-only (no custom calendar rendering).
- D-09: Optional ZIP — soft service-area check, pre-fills Step 4 city. Out-of-area shows "We may need to travel" but does NOT block.

**Estimate & tier logic (D-10..D-13):**
- D-10: `estimate(guests, packageId, packages) → { min, max }` with each end rounded to nearest $10. Lives at `src/lib/pricing/estimate.ts` (stub exists from Phase 1). Sources pricing **exclusively** from `content/packages/*.md`. Unit tests cover every integer guest count 1–200 at tier boundaries 9/10/11, 20/21, 30/31, 75/76.
- D-11: Step 3 auto-selects the matching tier with a "Recommended for N guests" badge; all three cards visible; override allowed with a soft non-blocking note on mismatch.
- D-12: Out-of-range (<10, >75, >200) routes to **custom-quote path** — real lead, no numeric estimate, custom-quote card on Step 3, "Custom quote — Larrae will follow up" in sticky bar.
- D-13: Estimate renders as a **sticky bottom bar inside the modal**, hidden until a valid guest count exists, ~250ms debounce, visible on Steps 2/3/4. Final rendered range at submit-time is stored on the lead record (LEAD-07) + echoed in both emails + confirmation screen.

**Step 4 (D-14):** Required: Name, Email, Phone. Optional: event address (street + city; city pre-filled from ZIP), "Anything special?" textarea, how-heard select, preferred contact radio. Free-text fields feed SPAM-04 URL heuristic.

**Confirmation screen (D-15):** In-place swap (no redirect per WIZ-12). Heading, event summary, submission ID `LK-XXXXXX` prominently, next-steps, `[Back to site]` button.

**Emails (D-16..D-17):**
- D-16: `LeadNotification` React Email to Larrae. Action-first mobile layout. Subject: `"New quote: [Name] · [Event type] · [Guest count] guests · [Date]"`. Top action block with `tel:` + `mailto:` links.
- D-17: `LeadConfirmation` React Email to inquirer. Warm heritage voice. Subject: `"We got your request — thanks, [Name]"`. Recap + 24-hour expectation + submission ID + mailto reply CTA.

**Error UX (D-18):** Specific-cause inline alerts above Step 4 submit; every error includes a `mailto:` from `site.email`. SPAM-01..04 bot-tripped rejections return a generic 200 with a decoy submission ID that is never persisted — no tell to the bot.

**Submission ID format (D-19):** `LK-XXXXXX` (6-char uppercase from ULID base32). Full ULID stored in a separate Sheets column for sortability + collision safety.

**Lead storage:** Google Sheets (resolved in STATE.md; overrides STACK.md's Turso recommendation). Service account auth via `GOOGLE_SHEETS_CREDENTIALS_JSON` + `GOOGLE_SHEETS_LEAD_SHEET_ID` (registered in Phase 1 D-15).

### Claude's Discretion

- Visual styling of tiles/chips/cards/sticky bar within shadcn + two-layer tokens
- Animation timings (all respect `prefers-reduced-motion`)
- Focus-management order per step (A11Y-03 says "proper ARIA roles/labels")
- Google Sheets column names/order within LEAD-07 set
- Micro-copy exact wording
- Whether to install shadcn `Form` wrapper vs. hand-wire RHF — pick most maintainable
- Wizard bundle-split strategy (lazy-load on Dialog open vs. prefetch on hero intersection)
- Cron schedule specifics for retry (time, retry count, backoff)
- Debounce timing for estimate (EST-07)
- Client-side vs. server-response analytics emission

### Deferred Ideas (OUT OF SCOPE)

- Abandoned-cart recovery email (V2-CONV-01)
- Save-and-resume email link (V2-CONV-02)
- Smart step-skipping / custom-quote redesign (V2-CONV-03)
- Real-time availability calendar (V2-CONV-04)
- Admin UI (V2-OPS-01)
- Event-Type-specific tier recommendations (declined D-06)
- Event-Type-specific blackout/lead-time rules (declined D-06)
- Review scraping (out of scope)
- Online payment (out of scope)
- Share-link for partial wizard (deferred)
- Custom react-day-picker with visible blackouts (declined D-08)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WIZ-01 | 4-step wizard as React island | Single `WizardIsland.tsx` hydrated inside shadcn Dialog via `client:load` (required — island must be ready before user taps CTA). Each step is a sub-component reading from RHF context. |
| WIZ-02 | Progress indicator (1 of 4…) | shadcn-free stepper — top of Dialog content, updates from `watch('_step')` or local state. |
| WIZ-03 | Step-boundary validation | RHF `trigger(['eventType'])` etc. on "Next" click. Block advance if fails. |
| WIZ-04 | sessionStorage persistence | Custom hook `useWizardPersistence()` wraps RHF; serializes `getValues()` to `sessionStorage.setItem('lk_wizard_v1', …)` on every change; restores on mount. Versioned key so schema migrations are easy. |
| WIZ-05 | `?step=N` URL sync + browser back/forward | `window.history.pushState({step:N}, '', '/?step=N')` on step advance; `popstate` listener restores step. Deep-link `?step=3&tier=medium` parsed on mount. See §Wizard State Persistence. |
| WIZ-06 | `beforeunload` warning only when dirty | `window.addEventListener('beforeunload', …)` gated on `formState.isDirty`. Note: Chrome/Firefox show generic message regardless of returned string. |
| WIZ-07 | Mobile input types | `<input type="number" inputmode="numeric" pattern="[0-9]*">` for guests; `<input type="date">` for date; `<input type="email" inputmode="email">` for email; `<input type="tel" inputmode="tel">` for phone. |
| WIZ-08 | 44×44px touch targets | Tailwind `min-h-[44px] min-w-[44px]` utility, applied via component wrappers. |
| WIZ-09 | Tier pre-selected via URL | Parsed from `URLSearchParams` on mount. Stored in form state as `packageId`; user still walks through Step 1/2 per D-02. |
| WIZ-10 | Date picker enforces lead-time + blackouts | Pure validator `validateEventDate(date, leadTimeDays, blackoutDates)` → error string \| null. Invoked by RHF resolver on blur. |
| WIZ-11 | Optional ZIP soft-check | Static ZIP-to-city map for Benicia-adjacent ZIPs (small JSON in `src/lib/serviceArea.ts`). Out-of-map ZIPs show "We may need to travel" but proceed. |
| WIZ-12 | Confirmation screen (no redirect) | After Action success, `WizardIsland` flips `mode` state from `'form'` → `'confirmation'`. Same Dialog container, different rendered children. |
| WIZ-13 | Keyboard navigation + focus | shadcn Dialog provides focus trap + Escape. Within steps, natural tab order + `autoFocus` on first field of new step. Never trap inside a step. |
| WIZ-14 | `prefers-reduced-motion` | CSS `@media (prefers-reduced-motion: reduce) { * { animation: none; transition: none; } }` scoped to modal + sticky bar. |
| EST-01 | Pure function shared client+server | `src/lib/pricing/estimate.ts` (Phase 1 stub exists) — no imports from anything framework-specific. Used by client wizard AND server Action for the `finalEstimate` field stamped on the Sheets row. |
| EST-02 | Pricing from `content/packages/*.md` only | `PackageData[]` passed in as an argument (no module-scoped reads). Caller loads via `getCollection('packages')` in Astro component, passes as prop to island; server Action re-loads via `getCollection`. |
| EST-03 | Range display, never single number | `{ min, max }` return; display template `"Estimated $${min}–$${max}"`. |
| EST-04 | "Final quote confirmed by Larrae" equal weight | Two-line sticky bar: `"Estimated $500–$650"` + `"Final quote confirmed by Larrae"` in matching `text-body-md`. |
| EST-05/06 | 1..200 boundary coverage | Table-driven Vitest at `estimate.test.ts`. Boundary set: 1, 9, 10, 11, 20, 21, 30, 31, 49, 50, 75, 76, 100, 200. |
| EST-07 | Debounce on estimate updates | `useDebouncedValue(guests, 250)` in the island; pure function is fast enough to run on every keystroke, but debounce avoids visual thrash for long pastes. |
| EST-08 | Out-of-range fallback | `estimate()` returns `null` when no package matches; UI renders "Custom quote — Larrae will follow up" per D-12. |
| LEAD-01 | Astro Action re-validates with Zod | `defineAction({ accept: 'form', input: leadSchema, handler })`. Same `leadSchema` imported client + server. |
| LEAD-02 | Turnstile server-verify before store/email | First real check after silent bot gates. `https://challenges.cloudflare.com/turnstile/v0/siteverify` POST with `secret` + `response` + `remoteip` + `idempotency_key`. |
| LEAD-03 | IP rate limit 5/10min | Sheets-backed rolling window OR in-memory per-lambda-instance (weak). See §Rate Limit Strategy. |
| LEAD-04 | Client-generated idempotency key | UUID v7 generated at wizard mount (`crypto.randomUUID()` — all modern browsers). Hidden field in form. Action checks Sheets `idempotency_key` column; duplicate → return prior row's submission_id, skip store + email. |
| LEAD-05 | Store before email | Linear pipeline: verify → parse → rate-limit → append-to-Sheets → `Promise.allSettled([notifyEmail, confirmEmail])`. Email failures logged but do not throw. |
| LEAD-06 | LeadStore interface + Google Sheets adapter | `src/lib/leads/LeadStore.ts` (interface), `GoogleSheetsAdapter.ts` (implementation using `googleapis` package), `store.ts` (singleton factory). |
| LEAD-07 | Stored record fields | See §Google Sheets Schema table below. |
| LEAD-08 | Notification email to Larrae | `LeadNotification` React Email template, rendered with `@react-email/render`, sent via `resend.emails.send()`. |
| LEAD-09 | Confirmation email to inquirer | `LeadConfirmation` template, same pipeline. Subject + `LK-XXXXXX` included. |
| LEAD-10 | Email failures don't lose lead | `Promise.allSettled` pattern; each email result updates `notify_email_status` / `confirm_email_status` columns via a Sheets update call. |
| LEAD-11 | Daily retry cron | `vercel.json` crons entry → `/api/cron/retry-email` (Astro API route) → scan Sheets for `*_email_status='pending'` rows created ≥1h ago → retry up to N times with `retry_count` column bumped. |
| LEAD-12 | Resend delivery webhook → observability | Resend webhook endpoint at `/api/webhooks/resend` writes delivery events back to Sheets (`*_email_status` column) + logs to Sentry (OBS-04 hook — Sentry lands in Phase 4, so for Phase 3 log to console.info, which Vercel captures). |
| SPAM-01 | Honeypot field | Hidden field `website` (common bot attractor). If non-empty → silent 200 decoy response, no store, no email. |
| SPAM-02 | Turnstile widget on Step 4 | `<div class="cf-turnstile" data-sitekey="…" data-callback="…">` via `@marsidev/react-turnstile` OR vanilla script tag. Token captured into hidden form field. |
| SPAM-03 | Min-time threshold | `wizardMountedAt` timestamp stamped on mount; submit time − mount time ≥ **3000ms** (lean low so fast legit users aren't blocked). Sub-threshold → silent 200 decoy. |
| SPAM-04 | URL-in-notes heuristic | Regex `/https?:\/\//i` OR `/www\.[a-z]/i` in `notes` + `eventAddress` free-text. Match → silent 200 decoy. |
| SPAM-05 | Email fallback visible | `site.email` rendered in every error message (D-18). |
| SPAM-06 | CI blocks Turnstile test keys in prod | CI step: `grep -r "1x00000000000000000000AA\|1x0000000000000000000000000000000AA" dist/` (test site/secret keys) and fail build on match. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Wizard UI + step state | Browser (React island) | — | Client-only interactivity; form state lives where user types |
| Live estimate math | Browser (pure fn) | API (Action, re-computes for stored record) | Shared pure fn; client shows live, server stamps final value |
| URL sync (`?step=N`) | Browser (`pushState`) | — | SPA-standard; server doesn't participate |
| sessionStorage persistence | Browser | — | Per-device, per-session; never crosses tier boundary |
| Honeypot + min-time + URL-heuristic | API (Astro Action) | Browser (set timestamps) | All bot gates enforce server-side; client only supplies inputs |
| Turnstile widget rendering | Browser (CF script) | — | Widget is an iframe served by Cloudflare |
| Turnstile token verification | API (Action calls siteverify) | — | Secret key MUST NOT leak to browser |
| Rate limiting | API | Storage (Sheets counter) | IP-based server check; Sheets is rolling-window store |
| Zod input validation | API (authoritative) | Browser (RHF resolver, instant feedback) | Server re-parses — never trusts client |
| Lead record persistence | Storage (Google Sheets) | API (adapter) | Sheets is source of truth for leads |
| Email send (notify + confirm) | API (Resend client) | — | Secret-keyed SDK; only server calls it |
| React Email template rendering | API (at send time) | Build (template compile) | `@react-email/render` runs on Action invocation; templates are standard React components |
| Retry cron | API (scheduled function) | Storage (reads Sheets) | Vercel Cron → Astro API route → Sheets scan |
| Funnel analytics events | Browser (`@vercel/analytics` `track()`) | — | `track()` is client-side only per Vercel docs |
| Delivery webhook ingestion | API (webhook endpoint) | Storage (update Sheets) | Resend POSTs events; endpoint writes back |

## Project Constraints (from CLAUDE.md)

- **Tech stack (pinned):** Astro 6.1.6, React 19.2.5, Tailwind 4.2.2, TypeScript 5.6+, Node ≥22.12 <23, pnpm 9.15.9. Verified in `package.json`. [VERIFIED: package.json].
- **Zod version:** `zod@^4.3.6` is already installed [VERIFIED: package.json] — schemas in `src/lib/schemas/*.ts` already use `z.enum`, `z.object`, `.refine` patterns compatible with Zod 4. Phase 3 MUST keep the same import (`import { z } from 'zod'`) for cross-file consistency.
- **Content management:** markdown-in-repo only — no headless CMS, no database for content. Leads are the ONLY runtime-written data.
- **Accessibility floor:** WCAG 2.1 AA. Wizard ARIA is load-bearing (A11Y-03).
- **Performance:** CWV pass on mobile. Wizard bundle MUST be lazy-loaded or kept small — don't bloat the hero LCP path.
- **Brand palette + typography:** Warm soul food palette retained; components consume semantic tokens (`text-ink`, `bg-surface`, `border-accent`) only, never brand names directly (Phase 1 D-01).
- **GSD Workflow Enforcement:** All edits go through a GSD command. Phase 3 execution uses `/gsd-execute-phase` with plan-level `/gsd-execute-plan` cycles.
- **Scaffolding already present (verified 2026-04-16):**
  - `src/actions/.gitkeep` — empty dir ready for `submitInquiry.ts`
  - `src/lib/email/.gitkeep` — ready for templates + `send.ts`
  - `src/lib/leads/.gitkeep` — ready for LeadStore + adapter
  - `src/lib/pricing/estimate.ts` — stub with `EstimateInput` / `EstimateRange` types (throws — Phase 3 implements)
  - `src/lib/pricing/estimate.test.ts` — skipped scaffold
  - `src/lib/schemas/packages.ts` — `packageSchema` with `guestRange`, `pricePerPerson` — ready for consumption
  - `src/lib/schemas/site.ts` — includes `leadTimeDays`, `blackoutDates`, `email`, `responseTime` — ready for wizard to read
  - `src/content/packages/{small,medium,large}.md` — authored with real pricing ($22–$28 / $20–$26 / $18–$24 per person; verified 2026-04-16)
  - `src/env.d.ts` — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_SHEETS_CREDENTIALS_JSON`, `GOOGLE_SHEETS_LEAD_SHEET_ID` all typed
  - `astro.config.mjs` — `output: 'server'` + `@astrojs/vercel` adapter + React integration present
- **Test infrastructure:** Vitest 4.1.4 + Playwright 1.59.1 + Biome 2.4 + lefthook — all installed [VERIFIED: package.json].

## Standard Stack

### Core (already installed — verify version, don't re-install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.1.6 | Meta-framework + Actions | [VERIFIED: package.json] Phase 1 baseline |
| @astrojs/vercel | ^10.0.4 | Serverless adapter, enables Actions + Crons | [VERIFIED: package.json] |
| @astrojs/react | ^5.0.3 | React island runtime | [VERIFIED: package.json] |
| react / react-dom | ^19.2.5 | Island UI | [VERIFIED: package.json] |
| zod | ^4.3.6 | Shared schemas (wizard + Action + content) | [VERIFIED: package.json] — already Zod 4, stable as of 2026-04 |
| tailwindcss | ^4.2.2 | Styling (CSS-first `@theme`) | [VERIFIED: package.json] |
| radix-ui | ^1.4.3 | Primitives used by shadcn Dialog etc. | [VERIFIED: package.json] |

### Phase 3 new dependencies

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| react-hook-form | ^7.54.0 | Wizard form state, uncontrolled by default, pairs with Zod resolver | Ecosystem standard; cleanest integration with Zod + React 19; handles multi-step via `trigger(fieldsArray)` | HIGH [CITED: github.com/orgs/react-hook-form/discussions/11832] |
| @hookform/resolvers | ^3.9.0 | Wires Zod into RHF | Official resolver package | HIGH |
| resend | ^4.0.0 | Email send SDK | Project already committed in STACK.md; free 3k/mo tier | HIGH [CITED: resend.com/blog/react-email-5] |
| @react-email/components | ^0.0.31 | Email JSX primitives (`<Html>`, `<Section>`, `<Text>`, `<Link>`, `<Button>`) | First-party with Resend; React 19.2 + Tailwind 4 support | HIGH [CITED: resend.com/blog/react-email-5 — "React Email now supports Tailwind 4. React Email has been upgraded to support React 19.2"] |
| @react-email/render | ^1.0.3 | `render()` → HTML string for Resend SDK | Companion to components package | HIGH |
| @react-email/tailwind | ^1.0.3 | Email-safe Tailwind class → inline style compilation | Required for brand continuity in email | HIGH |
| googleapis | ^144.0.0 | Google Sheets v4 append + update client | Official Node client; service-account auth via `google.auth.JWT` or `GoogleAuth` | HIGH [CITED: developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append] |
| ulid | ^2.3.0 | Generate sortable IDs; expose short base32 suffix | 26-char Crockford-base32; encodes timestamp + 80 bits random; browser+Node safe | HIGH [CITED: npmjs.com/package/ulid — "uses crypto.getRandomValues for browsers and crypto.randomBytes for Node"] |
| @vercel/analytics | ^1.5.0 | `track()` for funnel events | Project constraint — Vercel Analytics is the analytics choice | HIGH [CITED: vercel.com/docs/analytics/custom-events] |

### shadcn components to install (Phase 3 scope)

```bash
pnpm dlx shadcn@latest add dialog input label form radio-group textarea
# Note: Button already installed in Phase 1 D-08
```

Each runs on Tailwind v4 + React 19 per `ui.shadcn.com/docs/tailwind-v4` [CITED: ui.shadcn.com/docs/tailwind-v4].

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RHF direct `onSubmit` | React 19 `useActionState` wrapper | `useActionState` is designed for server-rendered forms with progressive enhancement; our wizard is hydrated client-only (Dialog mounts island on open), so progressive enhancement without JS is impossible anyway. RHF's existing lifecycle is simpler. **Do not use `useActionState`.** [CITED: markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router] confirms the wiring is awkward. |
| `@marsidev/react-turnstile` | Vanilla `<script>` tag + manual token field | Package is tiny (~2KB), handles React lifecycle + cleanup. Vanilla is fine too. **Recommend `@marsidev/react-turnstile`** — less bespoke code. |
| Google Sheets as primary store | Turso (STACK.md default) | STATE.md explicitly chose Sheets ("Larrae views/CRMs on her phone"). Preserve. |
| Vercel Cron for retry | GitHub Actions scheduled workflow | Vercel Cron is already-configured infra; GH Actions adds a secret + extra surface. Stick with Vercel. |
| ULID (lib) | `crypto.randomUUID()` v4 | Per CONTEXT D-19, full ULID is stored for time-sortability. UUID v4 is not sortable. **Stick with ULID.** Alternative: UUID v7 (also time-sortable) — but ULID's base32 encoding gives cleaner short-form extraction. |

### Installation (Phase 3)

```bash
pnpm add react-hook-form @hookform/resolvers resend \
  @react-email/components @react-email/render @react-email/tailwind \
  googleapis ulid @vercel/analytics @marsidev/react-turnstile

pnpm dlx shadcn@latest add dialog input label form radio-group textarea
```

**Version verification (run before committing `package.json`):**
```bash
for pkg in react-hook-form @hookform/resolvers resend \
  @react-email/components @react-email/render @react-email/tailwind \
  googleapis ulid @vercel/analytics @marsidev/react-turnstile; do
  pnpm view "$pkg" version;
done
```

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────── BROWSER ──────────────────────────────────────┐
│                                                                       │
│  Home (`/?step=N&tier=X`)                                             │
│    └─ shadcn Dialog (opened by Hero CTA / Nav / Package card)        │
│        └─ WizardIsland (client:load)                                 │
│            ├─ RHF FormProvider (uncontrolled, Zod resolver)          │
│            ├─ Step 1: EventTypeStep (persona tiles)                  │
│            ├─ Step 2: GuestsDateStep (chips + number + native date)  │
│            ├─ Step 3: PackageStep (3 cards auto-selected by guests)  │
│            ├─ Step 4: ContactStep + Turnstile + honeypot + token     │
│            ├─ StickyEstimateBar (pure estimate() + debounce)         │
│            └─ ConfirmationView (post-submit, same container)         │
│                      │                                                │
│                      │ onSubmit ← RHF handleSubmit                    │
│                      ▼                                                │
│          actions.submitInquiry({ formData })  ← astro:actions         │
│                      │                                                │
└──────────────────────┼────────────────────────────────────────────────┘
                       │ POST /_actions/submitInquiry (form-encoded)
                       ▼
┌───────────────── VERCEL SERVERLESS (Astro output:'server') ───────────┐
│                                                                        │
│  src/actions/submitInquiry.ts  ← defineAction({ accept:'form', ... }) │
│    ├─ 1. Silent bot gates (FAST — fail before any I/O):               │
│    │    ├─ honeypot (website field non-empty)                         │
│    │    ├─ min-time (submit - mount < 3000ms)                         │
│    │    └─ URL-in-notes regex                                         │
│    │    → decoy 200 with fake LK-XXXXXX; NO store, NO email           │
│    │                                                                   │
│    ├─ 2. Turnstile siteverify (POST to cf) ─────► challenges.cf.com   │
│    │    → fail: 200 with user-facing error (D-18)                     │
│    │                                                                   │
│    ├─ 3. Zod re-parse (leadSchema.parse) — defence in depth            │
│    │    → ActionError('BAD_REQUEST', fields)                           │
│    │                                                                   │
│    ├─ 4. Rate limit: append IP hash + timestamp to RateLimit sheet,   │
│    │    count rows in last 10min; >5 → ActionError('TOO_MANY_REQUESTS')│
│    │                                                                   │
│    ├─ 5. Idempotency check: lookup idempotency_key col in Sheets      │
│    │    → match: return prior submission_id, skip store + email        │
│    │                                                                   │
│    ├─ 6. estimate(guests, packageId, packages) → finalEstimate         │
│    │                                                                   │
│    ├─ 7. sheetsAdapter.append({ ...fields, finalEstimate, ulid, … })  │
│    │    ────────────────────────────────► Google Sheets API (append)  │
│    │    → throw on failure: 500, lead NOT created                     │
│    │                                                                   │
│    ├─ 8. Promise.allSettled([                                          │
│    │        resend.send(LeadNotification),  ──► resend.com API        │
│    │        resend.send(LeadConfirmation)   ──► resend.com API        │
│    │      ])                                                           │
│    │    → each result: update Sheets row column                        │
│    │       notify_email_status / confirm_email_status                  │
│    │    → one or both failing does NOT rollback the lead               │
│    │                                                                   │
│    └─ 9. return { submissionId: 'LK-4Q7P3B', finalEstimate }          │
│                                                                        │
│  src/pages/api/cron/retry-email.ts  ← Vercel Cron (daily)             │
│    ├─ Authorize header Bearer CRON_SECRET                              │
│    ├─ Scan Sheets for *_email_status = 'pending' AND retry_count < 3  │
│    └─ Per row: resend.send(...) → update status + retry_count          │
│                                                                        │
│  src/pages/api/webhooks/resend.ts  ← Resend delivery events           │
│    ├─ Verify webhook signature                                         │
│    └─ Update Sheets row for matching message_id                        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                       │
                       │ track() events from browser
                       ▼
┌──────── VERCEL ANALYTICS (client-side ingestion) ─────────────────────┐
│  wizard_start, wizard_step_complete{step}, wizard_submit_success,     │
│  wizard_submit_failure{reason}                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Recommended File Structure

```
src/
├── actions/
│   ├── index.ts                       # export { submitInquiry }
│   └── submitInquiry.ts               # defineAction; entire server pipeline
├── components/
│   ├── wizard/                        # NEW directory
│   │   ├── WizardDialog.astro         # Astro wrapper (loads island)
│   │   ├── WizardIsland.tsx           # Root React island; dialog open state
│   │   ├── WizardForm.tsx             # RHF FormProvider + step router
│   │   ├── steps/
│   │   │   ├── Step1EventType.tsx
│   │   │   ├── Step2GuestsDate.tsx
│   │   │   ├── Step3Package.tsx
│   │   │   └── Step4Contact.tsx       # includes Turnstile + honeypot
│   │   ├── StickyEstimateBar.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── ConfirmationView.tsx
│   │   ├── DirtyDismissGuard.tsx
│   │   └── hooks/
│   │       ├── useWizardPersistence.ts  # sessionStorage
│   │       ├── useUrlSync.ts            # pushState ↔ step/tier
│   │       ├── useDebouncedValue.ts
│   │       └── useWizardAnalytics.ts    # @vercel/analytics track() wrappers
│   └── ui/                             # shadcn (existing)
│       ├── dialog.tsx                  # NEW in Phase 3
│       ├── input.tsx                   # NEW
│       ├── label.tsx                   # NEW
│       ├── form.tsx                    # NEW
│       ├── radio-group.tsx             # NEW
│       └── textarea.tsx                # NEW
├── lib/
│   ├── schemas/
│   │   ├── lead.ts                    # NEW — leadSchema (client+server shared)
│   │   └── ... (existing 8 schemas)
│   ├── pricing/
│   │   ├── estimate.ts                # Phase 1 stub → Phase 3 impl
│   │   └── estimate.test.ts
│   ├── email/
│   │   ├── send.ts                    # Resend client wrapper
│   │   └── templates/
│   │       ├── LeadNotification.tsx
│   │       ├── LeadConfirmation.tsx
│   │       └── shared.tsx             # brand header/footer partials
│   ├── leads/
│   │   ├── LeadStore.ts               # interface
│   │   ├── GoogleSheetsAdapter.ts     # impl
│   │   ├── store.ts                   # factory/singleton
│   │   └── submissionId.ts            # ULID → LK-XXXXXX
│   ├── spam/
│   │   ├── turnstile.ts               # siteverify client
│   │   ├── honeypot.ts                # constants + checker
│   │   ├── heuristics.ts              # URL-in-notes, min-time
│   │   └── rateLimit.ts               # Sheets-backed rolling window
│   └── serviceArea.ts                 # ZIP → city map (WIZ-11)
└── pages/
    └── api/
        ├── cron/
        │   └── retry-email.ts         # LEAD-11
        └── webhooks/
            └── resend.ts              # LEAD-12
```

### Pattern 1: Shared Zod schema (client + server)

**What:** Single `leadSchema` defines the contract. RHF resolver uses it client-side; Astro Action `input` uses it server-side.
**Where:** `src/lib/schemas/lead.ts`

```typescript
// Source: research synthesis; pattern confirmed in Astro docs and RHF Zod resolver docs.
import { z } from "zod";

export const leadSchema = z.object({
  // Required (Step 1–4)
  eventType: z.enum(["family", "social", "corporate"]),
  guests: z.coerce.number().int().min(1).max(500),
  eventDate: z.coerce.date(),  // Astro Actions auto-coerce for form inputs
  packageId: z.enum(["small", "medium", "large", "custom"]),
  name: z.string().min(1).max(200),
  email: z.email().max(320),
  phone: z.string().min(7).max(32),

  // Optional
  zip: z.string().regex(/^\d{5}$/).optional().or(z.literal("")),
  eventAddress: z.string().max(500).optional().or(z.literal("")),
  eventCity: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  howHeard: z.enum(["google", "instagram", "word-of-mouth", "other", ""]).optional(),
  contactMethod: z.enum(["email", "phone", "text"]).default("email"),

  // Bot gates / system fields
  website: z.string().max(0),               // honeypot — MUST be empty
  wizardMountedAt: z.coerce.number().int(), // timestamp (Date.now())
  idempotencyKey: z.string().uuid(),
  turnstileToken: z.string().min(1),
});

export type LeadInput = z.infer<typeof leadSchema>;
```

**Import paths:**
- Client: `import { leadSchema } from '@/lib/schemas/lead'` → `resolver: zodResolver(leadSchema)`
- Server: `import { leadSchema } from '@/lib/schemas/lead'` → `defineAction({ input: leadSchema, … })`

### Pattern 2: Astro Action shape (store-first pipeline)

**Source:** [CITED: docs.astro.build/en/guides/actions/] + CONTEXT D-18 for decoy flow.

```typescript
// src/actions/submitInquiry.ts
import { defineAction, ActionError } from "astro:actions";
import { leadSchema } from "@/lib/schemas/lead";
import { verifyTurnstile } from "@/lib/spam/turnstile";
import { checkHoneypot, checkMinTime, checkUrlHeuristics } from "@/lib/spam/heuristics";
import { rateLimitCheck } from "@/lib/spam/rateLimit";
import { getLeadStore } from "@/lib/leads/store";
import { makeSubmissionId } from "@/lib/leads/submissionId";
import { estimate } from "@/lib/pricing/estimate";
import { getCollection } from "astro:content";
import { sendNotification, sendConfirmation } from "@/lib/email/send";
import { hashIp } from "@/lib/spam/rateLimit";

function decoySuccess() {
  // Silent bot reject: look identical to success; never persist, never email.
  return { submissionId: `LK-${Math.random().toString(32).slice(2, 8).toUpperCase()}`, estimate: null };
}

export const submitInquiry = defineAction({
  accept: "form",
  input: leadSchema,
  handler: async (input, ctx) => {
    const ip = ctx.clientAddress;  // Astro provides this

    // 1. Silent bot gates — never leak to bot which one tripped
    if (!checkHoneypot(input)) return decoySuccess();
    if (!checkMinTime(input, 3000)) return decoySuccess();
    if (!checkUrlHeuristics(input)) return decoySuccess();

    // 2. Turnstile
    const turnstile = await verifyTurnstile(input.turnstileToken, ip, input.idempotencyKey);
    if (!turnstile.success) {
      throw new ActionError({ code: "FORBIDDEN", message: "turnstile_failed" });
    }

    // 3. Rate limit (5/10min per hashed IP)
    const rl = await rateLimitCheck(hashIp(ip), 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      throw new ActionError({ code: "TOO_MANY_REQUESTS", message: "rate_limited" });
    }

    // 4. Idempotency
    const store = getLeadStore();
    const existing = await store.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { submissionId: existing.submissionId, estimate: existing.finalEstimate };

    // 5. Compute stamped-final estimate
    const packages = (await getCollection("packages")).map(e => e.data);
    const finalEstimate = estimate({ guests: input.guests, packageId: input.packageId, packages });

    // 6. Store-first
    const { submissionId, ulid } = makeSubmissionId();
    await store.append({
      ...input,
      ulid,
      submissionId,
      ipHash: hashIp(ip),
      createdAt: new Date().toISOString(),
      finalEstimate,
      notifyEmailStatus: "pending",
      confirmEmailStatus: "pending",
      retryCount: 0,
    });

    // 7. Email fan-out (do NOT throw on failure)
    const [notifyResult, confirmResult] = await Promise.allSettled([
      sendNotification({ ...input, submissionId, finalEstimate }),
      sendConfirmation({ ...input, submissionId, finalEstimate }),
    ]);
    await store.updateEmailStatuses(submissionId, {
      notify: notifyResult.status === "fulfilled" ? "sent" : "failed",
      confirm: confirmResult.status === "fulfilled" ? "sent" : "failed",
    });
    // Log failures (Sentry hook lands Phase 4; console.info captured by Vercel logs)
    if (notifyResult.status === "rejected") console.error("notify_email_failed", notifyResult.reason);
    if (confirmResult.status === "rejected") console.error("confirm_email_failed", confirmResult.reason);

    return { submissionId, estimate: finalEstimate };
  },
});
```

**Action return contract:**

| Scenario | HTTP | `data` | `error` (ActionError) | Client handling |
|----------|------|--------|-----------------------|-----------------|
| Success | 200 | `{submissionId, estimate}` | — | flip to ConfirmationView |
| Bot-tripped (SPAM-01..04) | 200 | `{submissionId: decoy, estimate: null}` | — | flip to ConfirmationView (same visual; bot can't tell) |
| Validation error (Zod) | 400 | — | `isInputError(err)` with `err.fields.<field>` | RHF `setError(field, { message })` |
| Turnstile fail | 403 | — | `FORBIDDEN / turnstile_failed` | D-18 Turnstile error alert |
| Rate limit | 429 | — | `TOO_MANY_REQUESTS / rate_limited` | D-18 rate-limit alert |
| Server/Sheets/Resend init failure | 500 | — | `INTERNAL_SERVER_ERROR` | D-18 generic server error |

**Client submit (inside `WizardForm.tsx`):**

```typescript
import { actions, isInputError } from "astro:actions";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/schemas/lead";

const methods = useForm<LeadInput>({
  resolver: zodResolver(leadSchema),
  mode: "onBlur",
  defaultValues: { /* …restored from sessionStorage + URL */ },
});

const onSubmit = methods.handleSubmit(async (values) => {
  const formData = new FormData();
  Object.entries(values).forEach(([k, v]) => formData.append(k, String(v ?? "")));
  const { data, error } = await actions.submitInquiry(formData);

  if (isInputError(error)) {
    for (const [field, messages] of Object.entries(error.fields ?? {})) {
      methods.setError(field as keyof LeadInput, { message: (messages as string[])[0] });
    }
    return;
  }
  if (error?.code === "FORBIDDEN") { /* Turnstile alert (D-18) */ return; }
  if (error?.code === "TOO_MANY_REQUESTS") { /* rate-limit alert */ return; }
  if (error) { /* generic server error */ return; }

  // Success (including decoy — indistinguishable by design)
  setMode("confirmation");
  setSubmissionId(data.submissionId);
});
```

### Pattern 3: Wizard state persistence (sessionStorage + URL + deep-link)

**The combined contract:**
- `sessionStorage` holds the full form snapshot under `lk_wizard_v1` (versioned key).
- URL holds only `?step=N` and optional `?tier=X`. Never PII.
- On mount:
  1. Read `?step` and `?tier` from `URLSearchParams`.
  2. Load sessionStorage snapshot (if present + same-day-ish validity).
  3. Merge — URL params win for `step` and `packageId`; snapshot wins for everything else.
- On every RHF change: `methods.watch(values => sessionStorage.setItem('lk_wizard_v1', JSON.stringify(values)))`.
- On step advance: `window.history.pushState({step:N}, '', withQuery(location.pathname, {step:N, tier:packageIdIfSet}))`.
- On `popstate`: read state.step, call `setCurrentStep(e.state?.step ?? 1)`. RHF values untouched.
- On close: `history.pushState({step:0}, '', location.pathname)` and clear sessionStorage only on successful submit OR user-explicit "reset wizard" (never on simple close — D-03).

**Pitfalls to bake into implementation:**
- **Hydration mismatch:** NEVER read sessionStorage during SSR. Gate restore logic in `useEffect` — or render a `<noscript>` form fallback + hydrate the real form after mount. Astro islands with `client:load` avoid SSR rendering of island content, but the Dialog trigger is server-rendered; ensure the island's initial state matches server output (e.g., step=1 default until `useEffect` runs).
- **Stale state across devices:** Deep-link opens with URL params only; do NOT auto-restore sessionStorage from another session if URL says step=1 (user clicked a fresh link from another device → expect fresh flow). Heuristic: if URL has `?step=3&tier=medium` and snapshot is > 24h old or has different `eventType`, discard snapshot and honor URL.
- **PII in URL:** Absolute no-no. `?step` and `?tier` only. Never email, name, phone, date in querystring.
- **Browser Back from Step 1 = close modal:** handled by history push order — opening the modal pushes one entry (`/?step=1`), closing pops back to `/`.

### Pattern 4: Live estimate (RHF `watch` vs `useWatch`)

**`useWatch`** is the correct primitive for the sticky bar — it subscribes to a specific field without re-rendering the whole form tree on every keystroke.

```typescript
// StickyEstimateBar.tsx
import { useWatch } from "react-hook-form";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { estimate } from "@/lib/pricing/estimate";

export function StickyEstimateBar({ packages }: { packages: PackageData[] }) {
  const guests = useWatch({ name: "guests" });
  const packageId = useWatch({ name: "packageId" });
  const debouncedGuests = useDebouncedValue(guests, 250);

  if (!debouncedGuests || debouncedGuests < 1) return null;  // D-13 hide-until-valid
  const range = estimate({ guests: debouncedGuests, packageId, packages });
  if (!range) return <StickyBar text="Custom quote — Larrae will follow up" />;
  return <StickyBar text={`Estimated $${range.min}–$${range.max} · Final quote confirmed by Larrae`} />;
}
```

**Why `useWatch` not `watch`:** `methods.watch()` invoked at the component top-level causes the entire component to re-render on any field change. `useWatch` with a specific `name` scopes the subscription. This matters on Step 2 where the user is typing a guest count.

### Pattern 5: `estimate()` pure function implementation contract

```typescript
// src/lib/pricing/estimate.ts (replaces Phase 1 stub)
import type { PackageData } from "../schemas/packages";

export interface EstimateInput {
  guests: number;
  packageId: PackageData["id"] | "custom";
  packages: readonly PackageData[];
}
export interface EstimateRange { min: number; max: number; }

/** Round to nearest $10 (D-10). */
const round10 = (n: number) => Math.round(n / 10) * 10;

/** Find the package whose guestRange.[min, max] covers guestCount. */
export function tierForGuests(guests: number, packages: readonly PackageData[]): PackageData | null {
  return packages.find(p => guests >= p.guestRange.min && guests <= p.guestRange.max) ?? null;
}

export function estimate(input: EstimateInput): EstimateRange | null {
  const { guests, packageId, packages } = input;
  if (!Number.isFinite(guests) || guests < 1 || guests > 200) return null;
  if (packageId === "custom") return null;

  // Honor user's explicit packageId choice even if it doesn't match tier-for-guests
  // (D-11 soft-mismatch — UI shows a warning but we still estimate against the chosen tier).
  const pkg = packages.find(p => p.id === packageId) ?? tierForGuests(guests, packages);
  if (!pkg) return null;

  return {
    min: round10(guests * pkg.pricePerPerson.min),
    max: round10(guests * pkg.pricePerPerson.max),
  };
}
```

**Why this shape works:**
- Pure function (no globals, no I/O) → same result client + server (EST-01).
- `packages` passed in → no module-level reads of content collections → easy to test with fixtures.
- Returns `null` for out-of-range / custom → clear UI fallback path (D-12, EST-08).
- Honors explicit `packageId` choice separately from `tierForGuests` → enables D-11's override behavior.

### Pattern 6: Google Sheets append + update (LeadStore)

**Library:** `googleapis` (official Node client) — not `google-spreadsheet` (third-party wrapper, stale).

```typescript
// src/lib/leads/GoogleSheetsAdapter.ts
import { google, type sheets_v4 } from "googleapis";
import type { LeadStore, LeadRecord } from "./LeadStore";

const RANGE_LEADS = "Leads!A:V";              // all columns
const RANGE_RATELIMIT = "RateLimit!A:C";

export class GoogleSheetsAdapter implements LeadStore {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(credentialsJson: string, spreadsheetId: string) {
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = spreadsheetId;
  }

  async append(record: LeadRecord): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: RANGE_LEADS,
      valueInputOption: "RAW",           // never interpret formulas from user input
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [leadRecordToRow(record)] },
    });
  }

  async findByIdempotencyKey(key: string): Promise<LeadRecord | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: RANGE_LEADS,
    });
    const rows = res.data.values ?? [];
    const idempotencyCol = 2;  // e.g., column C
    const match = rows.find(r => r[idempotencyCol] === key);
    return match ? rowToLeadRecord(match) : null;
  }

  async updateEmailStatuses(submissionId: string, statuses: { notify: string; confirm: string }) {
    // Use spreadsheets.values.batchUpdate with A1 ranges targeting the submission_id row
    // Implementation: scan for submissionId row index, then update two cells.
  }
}
```

**Quotas (from 2026-04 docs):** 300 read + 300 write requests per minute per project; 60/min per user. At <100 leads/mo v1 volume, we're nowhere near limits [CITED: developers.google.com/workspace/sheets/api/limits].

**Critical: `valueInputOption: "RAW"`** — if a user enters `=IMPORTRANGE(...)` in the notes field and we use `USER_ENTERED`, Sheets would execute the formula. Use `RAW` always for lead data.

### Pattern 7: Google Sheets schema

| Col | Name | Type | Source | Notes |
|-----|------|------|--------|-------|
| A | `created_at` | ISO-8601 string | server `new Date().toISOString()` | UTC |
| B | `submission_id` | `LK-XXXXXX` | `makeSubmissionId()` | User-facing |
| C | `ulid` | 26-char base32 | `makeSubmissionId()` | Sortable |
| D | `idempotency_key` | UUID | client | Dedup gate |
| E | `event_type` | enum | form | family \| social \| corporate |
| F | `guests` | int | form | 1–500 |
| G | `event_date` | ISO date | form | YYYY-MM-DD |
| H | `package_id` | enum | form | small \| medium \| large \| custom |
| I | `final_estimate_min` | int \| null | server `estimate()` | $ at $10 rounding |
| J | `final_estimate_max` | int \| null | server `estimate()` | |
| K | `name` | string | form | |
| L | `email` | string | form | |
| M | `phone` | string | form | |
| N | `zip` | string \| empty | form | |
| O | `event_address` | string \| empty | form | |
| P | `event_city` | string \| empty | form | |
| Q | `notes` | string \| empty | form | Max 2000 chars |
| R | `how_heard` | enum \| empty | form | |
| S | `contact_method` | enum | form | email \| phone \| text (default email) |
| T | `ip_hash` | hex | server `hashIp(clientAddress)` | SHA-256 + salt |
| U | `notify_email_status` | enum | server | pending \| sent \| failed |
| V | `confirm_email_status` | enum | server | pending \| sent \| failed |
| W | `retry_count` | int | server | Bumped by cron |
| X | `user_agent` | string | request headers | Short, useful for debugging |

**Sheets layout:**
- **Leads** tab: columns above. Row 1 = header.
- **RateLimit** tab: `ip_hash | timestamp_ms | action` — rolling window store.
- **Archive** tab: v2 — move rows after 6 months.

### Pattern 8: Resend + React Email

**Config (`src/lib/email/send.ts`):**

```typescript
import { Resend } from "resend";
import { render } from "@react-email/render";
import LeadNotification from "./templates/LeadNotification";
import LeadConfirmation from "./templates/LeadConfirmation";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function sendNotification(input: NotificationInput) {
  const html = await render(LeadNotification(input));
  return resend.emails.send({
    from: import.meta.env.RESEND_FROM_EMAIL,
    to: /* Larrae's email from site.md */ await getLarraeEmail(),
    subject: `New quote: ${input.name} · ${input.eventType} · ${input.guests} guests · ${input.eventDate}`,
    html,
    replyTo: input.email,  // lets Larrae reply directly to inquirer
  });
}

export async function sendConfirmation(input: ConfirmationInput) {
  const html = await render(LeadConfirmation(input));
  return resend.emails.send({
    from: import.meta.env.RESEND_FROM_EMAIL,
    to: input.email,
    subject: `We got your request — thanks, ${input.name}`,
    html,
    replyTo: await getLarraeEmail(),
  });
}
```

**Template (`src/lib/email/templates/LeadNotification.tsx`):**

```typescript
import { Html, Head, Body, Container, Section, Text, Link, Button, Tailwind } from "@react-email/components";

export default function LeadNotification(input: NotificationInput) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="max-w-[600px] mx-auto p-6">
            <Section>
              {/* Action block — top of message */}
              <Text className="text-xl font-bold">New quote from {input.name}</Text>
              <Text><Link href={`tel:${input.phone}`}>{input.phone}</Link></Text>
              <Text><Link href={`mailto:${input.email}`}>{input.email}</Link></Text>
              <Text>{input.eventType} · {input.guests} guests · {input.eventDate}</Text>
              {input.finalEstimate && (
                <Text className="text-lg font-semibold">
                  Estimated ${input.finalEstimate.min}–${input.finalEstimate.max}
                </Text>
              )}
            </Section>
            {/* … detail section with notes, address, etc. … */}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

**Dev preview:** `npx @react-email/cli dev` spins a local preview server against `src/lib/email/templates/`.

### Pattern 9: Turnstile server-verify

```typescript
// src/lib/spam/turnstile.ts
interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  challenge_ts?: string;
}

export async function verifyTurnstile(token: string, ip: string, idempotencyKey: string): Promise<TurnstileResponse> {
  const body = new URLSearchParams({
    secret: import.meta.env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: ip,
    idempotency_key: idempotencyKey,
  });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  return res.json();
}
```

**Test keys** (dev/preview only) [CITED: developers.cloudflare.com/turnstile/troubleshooting/testing/]:
- Always-passes site key: `1x00000000000000000000AA` / secret: `1x0000000000000000000000000000000AA`
- Always-blocks: `2x00000000000000000000AB` / `2x0000000000000000000000000000000AA`
- Forces interactive: `3x00000000000000000000FF`
- Token always passes (sent from widget): `XXXX.DUMMY.TOKEN.XXXX`

SPAM-06 CI gate greps `dist/` for these substrings and fails the production build.

### Pattern 10: Vercel Cron for retry-email

**`vercel.json`:**
```json
{
  "crons": [
    { "path": "/api/cron/retry-email", "schedule": "0 9 * * *" }
  ]
}
```
Runs 09:00 UTC daily (~ 02:00 PT) — ample time to retry the previous day's failures before Larrae's work hours. Free-tier supports 2 crons/project, each once-per-day on hobby plans [CITED: vercel.com/docs/cron-jobs].

**Endpoint (`src/pages/api/cron/retry-email.ts`):**

```typescript
export const prerender = false;
import type { APIRoute } from "astro";
import { getLeadStore } from "@/lib/leads/store";
import { sendNotification, sendConfirmation } from "@/lib/email/send";

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const store = getLeadStore();
  const pending = await store.findPendingEmails({ maxRetries: 3, minAgeMs: 60 * 60 * 1000 });
  let sent = 0, failed = 0;
  for (const lead of pending) {
    if (lead.notifyEmailStatus === "pending") {
      try { await sendNotification(lead); await store.markNotifySent(lead.submissionId); sent++; }
      catch (e) { await store.bumpRetry(lead.submissionId, "notify"); failed++; }
    }
    if (lead.confirmEmailStatus === "pending") {
      try { await sendConfirmation(lead); await store.markConfirmSent(lead.submissionId); sent++; }
      catch (e) { await store.bumpRetry(lead.submissionId, "confirm"); failed++; }
    }
  }
  return new Response(JSON.stringify({ sent, failed, scanned: pending.length }), { status: 200 });
};
```

**Gotcha:** Phase 1 D-15 registered env vars but did NOT include `CRON_SECRET`. Phase 3 MUST add `CRON_SECRET` to `src/env.d.ts` and `.env.example` + register in Vercel Preview + Production.

### Pattern 11: Layered spam defense (silent reject pattern)

**Order of checks (fail-fast, no-I/O first):**

1. **Honeypot** (`website !== ""`) — synchronous, pure
2. **Min-time** (`Date.now() - wizardMountedAt < 3000`) — synchronous
3. **URL-in-notes regex** — synchronous
4. **Turnstile siteverify** — 1 network hop to Cloudflare
5. **Zod parse** — CPU only
6. **Rate limit** — 1 Sheets read

Steps 1–3 return a **decoy success** (same shape as real success, fake submission_id, no store, no email). This prevents timing oracles because:
- Real success: 7+ Sheets ops + 2 Resend sends → 800–2500ms
- Decoy success: 0 I/O → 5–50ms

**⚠ Timing leak** — a sophisticated bot can detect the latency delta and infer rejection. Mitigations:
- Option A (recommended v1): accept the leak. Most bots don't correlate timing; the attacker payoff for detecting rejection is low given rate limits still apply at step 6 for any non-tripped submissions.
- Option B (v1.5 if bot traffic warrants): add artificial delay in decoy path — `await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))` — approximating real-path latency.

Document this as a known trade-off, not a design flaw.

### Anti-Patterns to Avoid

- **Calling Resend before Sheets append.** C1 is the #1 business risk — emails send, user sees confirmation, lead never persists. Always `await store.append()` first.
- **Using `USER_ENTERED` on Sheets append.** A `=HYPERLINK("http://evil",...)` in the notes field becomes a clickable phish. Use `RAW`.
- **Re-reading Content Collections per request without caching.** `getCollection('packages')` is synchronous and fast (Astro caches internally), but avoid calling it per-field on the estimate bar — load once in parent, pass as prop.
- **Storing PII (name, email, phone) in sessionStorage unencrypted forever.** CONTEXT accepts sessionStorage as the persistence layer; it clears when tab closes, acceptable. Do NOT move to localStorage (persists until manually cleared).
- **Using `useActionState` as an RHF replacement.** RHF + `useActionState` is awkward. Either use RHF alone (recommended) or replace RHF entirely with pure-React-19 form hooks (harder, loses multi-step ergonomics).
- **Revealing which bot gate rejected the submission in the response.** D-18 mandates decoy 200.
- **Trusting `x-forwarded-for` directly.** Vercel overwrites this; use `ctx.clientAddress` in Astro (Vercel-aware) or `request.headers.get('x-vercel-forwarded-for')` [CITED: vercel.com/docs/headers/request-headers]. Hash it with a salt before storing.
- **Running `estimate()` inside an RHF `watch()` callback without debounce.** Even though the function is pure, React renders thrash on fast keyboard input. 250ms debounce is the sweet spot per CONTEXT D-13.
- **Returning `{ error: '...' }` from an Action handler instead of throwing `ActionError`.** Astro's `isInputError` only recognizes thrown errors. Return-shape errors lose the field metadata.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-step form state | Custom reducer/context | React Hook Form 7 | Uncontrolled perf, built-in validation trigger, huge ecosystem |
| Client form validation | Hand-written check functions | Zod + `@hookform/resolvers` | Same schema as server = no drift |
| Modal with focus trap | Custom overlay component | shadcn Dialog (Radix under the hood) | Focus management is a11y-critical, easy to botch |
| CAPTCHA | Custom math question / bot prompt | Cloudflare Turnstile | Free, privacy-friendly, invisible-first UX |
| Email HTML | Hand-coded tables | React Email + `@react-email/tailwind` | Email clients are hostile — let the library handle quirks |
| ID generation | `Math.random()` / incrementing counter | `ulid` package | Collision resistance, time-sortability, cryptographic random |
| Form persistence | Custom debounced sessionStorage hook | RHF `watch` + one-line setItem | Minimal surface, works with RHF's subscription model |
| Date picker with blackouts | react-day-picker custom config | Native `<input type="date">` + validator (CONTEXT D-08) | Zero JS cost, platform-idiomatic on mobile |
| Spreadsheet client | `fetch` + OAuth dance | `googleapis` package | Service-account + retry + types included |

**Key insight:** Every hand-rolled solution in this list has been a documented cause of silent failure in similar catering/lead-gen projects. The value of using the library is not "saves lines of code" — it's "survives the long tail of edge cases we haven't imagined."

## Common Pitfalls

### Pitfall 1: Silent lead loss via email-before-store ordering
**What goes wrong:** Resend call succeeds, Sheets append fails (quota blip, service-account token expired, transient 503), confirmation email is in inquirer's inbox, user thinks they're booked, lead is gone.
**Why it happens:** Parallel `Promise.all([sendEmail, store.append])` or email-first ordering.
**How to avoid:** Strict linear pipeline. Store succeeds → then email. Email failure updates `*_email_status` but never deletes the row.
**Warning signs:** Any code shape where `resend.emails.send()` is awaited before `store.append()` completes. Code review MUST flag this.

### Pitfall 2: Zod schema divergence between client and server
**What goes wrong:** Client validates `phone: z.string().min(7)`, server validates `phone: z.string().regex(/^\+?[0-9\-\s]+$/)`. User passes client, server throws 400, user sees "please check the form" but can't see which field.
**How to avoid:** **One schema module (`src/lib/schemas/lead.ts`), imported by both sides.** Any field-specific server-only check (e.g., email domain MX validation) goes into the handler body, not the schema.

### Pitfall 3: Turnstile test keys shipped to production
**What goes wrong:** Dev uses test site key (always-passes), deploy to prod, bots flood the endpoint because the widget accepts any token.
**How to avoid:** SPAM-06 CI gate — `grep -r "1x0000000000000000000000AA\|2x0000000000000000000000AB\|3x00000000000000000000FF" dist/` fails the build. Also: production env vars set from Vercel dashboard, NOT .env files.
**Warning signs:** Test key substrings in build output.

### Pitfall 4: Vercel IP header confusion
**What goes wrong:** Code reads `request.headers.get('x-forwarded-for')` directly, gets `127.0.0.1` or Vercel's internal proxy IP, rate limit becomes per-proxy not per-client.
**How to avoid:** Use Astro's `ctx.clientAddress` in the Action handler — Astro's Vercel adapter already resolves this correctly. For API routes (cron/webhook), use `request.headers.get('x-vercel-forwarded-for')` or `x-real-ip` [CITED: vercel.com/docs/headers/request-headers].

### Pitfall 5: SessionStorage hydration mismatch with Astro islands
**What goes wrong:** `client:load` island reads sessionStorage on first render, React 19 throws hydration error because server rendered step=1 but client restored step=3.
**How to avoid:** Server renders the island's *shell* only. State restoration happens in `useEffect`. Render `{isHydrated ? <Steps step={currentStep}/> : <Skeleton/>}` during the first frame. OR: use `client:only="react"` for the wizard island (no SSR at all) — this is probably the right call for Phase 3 given the Dialog-gated nature.
**Recommendation:** Use `client:only="react"` for `WizardDialog`. There is no meaningful SSR for a modal that is closed by default.

### Pitfall 6: `<input type="date">` timezone drift
**What goes wrong:** User picks "2026-06-15" in Pacific time. Browser sends `2026-06-15T00:00:00.000Z`. Server converts to UTC → "2026-06-15". Looks fine. User in Hawaii picks same date; their browser sends the same string but their local date is June 14. Lead shows date as 2026-06-15 but the user meant June 14 in their context.
**How to avoid:** Always send + store as `YYYY-MM-DD` string (no time component). Zod: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`. No `z.coerce.date()` — that introduces TZ semantics.
**Note:** STACK.md suggested `z.coerce.date()` for date inputs; for an *event date* (calendar day, not instant-in-time), plain string is correct.

### Pitfall 7: Google Sheets append race condition
**What goes wrong:** Two near-simultaneous requests both check "does this idempotency_key exist?" → both see "no" → both append → duplicate lead.
**How to avoid:** Google Sheets has no row-level locks. Options:
- Accept the rare race (idempotency key is client-generated, so the race only happens if the same user clicks submit twice in the same millisecond with the same key — which is *exactly* the case we're guarding, meaning the second append is the expected retry).
- Use a distributed lock via a separate system (Upstash, etc.) — overkill for v1.
**Recommendation:** Accept the race. Post-hoc dedupe in the retry cron: before appending, if two rows with the same `idempotency_key` exist, keep the older, archive the newer.

### Pitfall 8: Resend webhook signature replay
**What goes wrong:** Endpoint trusts `x-resend-signature` without verifying against payload + secret, attacker replays old "delivered" events to mark failed emails as delivered.
**How to avoid:** Use Resend's webhook secret + `crypto.timingSafeEqual` HMAC check. `@resend/node` SDK includes a verifier helper — use it.

### Pitfall 9: Wizard island bundle bloats hero LCP
**What goes wrong:** `client:load` on the wizard pulls in RHF + Zod + @marsidev/react-turnstile + shadcn Dialog + Tailwind-email-stubs (~80KB gzipped) on hero paint.
**How to avoid:** Use `client:idle` for the WizardDialog trigger, or `client:only="react"` with a lightweight CTA button that only loads the island on click. Verify in Phase 4 CWV audit.

### Pitfall 10: `content/packages/*.md` pricing drift between client and server
**What goes wrong:** Client loads packages at build time via `getCollection` → passes as prop to island. Server Action also calls `getCollection` → in theory same data. But if an AI-agent PR updates package pricing AND the deploy is partial (ISR, preview deploy race), client + server could see different prices.
**How to avoid:** In the Action, `getCollection('packages')` runs at request time (it's a server function in `output: 'server'` mode). This reads from the build artifact, which is immutable per-deploy. Single deploy = consistent data. Verify by asserting in a test that `estimate()` on client args === `estimate()` on server args for a known input set.

## Runtime State Inventory

> Phase 3 is greenfield for runtime state — no migrations/renames — but several state categories require explicit handling.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **Google Sheets `Leads` tab** (brand new) — needs header row + schema; **RateLimit tab** (new) | Initial-setup task: create both tabs with correct headers; document in `docs/sheets-setup.md` |
| Live service config | **Vercel Cron entry** in `vercel.json`; **Resend webhook URL** configured in Resend dashboard pointing to `/api/webhooks/resend`; **Turnstile widget** configured in Cloudflare dashboard with production domain | Plan task: "Configure Resend webhook + Turnstile widget in Preview"; Phase 5 switches to Production values |
| OS-registered state | None — serverless | None |
| Secrets / env vars | Adds `CRON_SECRET` (NEW — not in Phase 1 D-15) and `RESEND_WEBHOOK_SECRET` (NEW) | Add both to `src/env.d.ts`, `.env.example`, and Vercel dashboard (Preview + Production) |
| Build artifacts | `dist/` output must NOT contain Turnstile test keys — CI gate (SPAM-06) | Add CI step in Phase 3 plan |

## Code Examples

### Making a submission ID (ULID → LK-XXXXXX)
```typescript
// src/lib/leads/submissionId.ts
import { ulid } from "ulid";

export function makeSubmissionId(): { ulid: string; submissionId: string } {
  const full = ulid();                            // e.g., "01HZK4QY7PBM0RJAX3F9EMT4VG"
  const suffix = full.slice(-6).toUpperCase();    // last 6 char → "MT4VG" (5 — adjust)
  return { ulid: full, submissionId: `LK-${full.slice(-6)}` };
}
```
Collision probability at 10k leads: ULID's 80 bits of randomness → effectively zero. The short 6-char suffix is *display only*; the full ULID is the unique key for Sheets lookups.

### RHF step-advance with trigger
```typescript
const goToStep = async (target: number) => {
  const fieldsByStep: Record<number, Array<keyof LeadInput>> = {
    1: ["eventType"],
    2: ["guests", "eventDate"],
    3: ["packageId"],
    4: ["name", "email", "phone", "turnstileToken"],
  };
  if (target > currentStep) {
    const ok = await methods.trigger(fieldsByStep[currentStep]);
    if (!ok) return;
  }
  setCurrentStep(target);
  urlSync.push(target);                      // pushState
  analytics.track("wizard_step_complete", { step: currentStep });
};
```

### Vercel Analytics funnel wiring (OBS-01)
```typescript
// src/components/wizard/hooks/useWizardAnalytics.ts
import { track } from "@vercel/analytics";

export const analytics = {
  start: () => track("wizard_start"),
  stepComplete: (step: number) => track("wizard_step_complete", { step }),
  submitSuccess: (submissionId: string) => track("wizard_submit_success", { submissionId }),
  submitFailure: (reason: "validation" | "turnstile" | "rate_limit" | "server") =>
    track("wizard_submit_failure", { reason }),
};
```
`@vercel/analytics` `<Analytics />` component mounted in `src/layouts/BaseLayout.astro` (existing from Phase 2). `track()` is client-side only [CITED: vercel.com/docs/analytics/custom-events] — perfect for an island. Include the `<Analytics />` component in `BaseLayout.astro` using the new `@vercel/analytics/astro` entry [CITED: vercel.com/docs/analytics/package].

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| reCAPTCHA v2/v3 | Cloudflare Turnstile | Ongoing — mainstream since 2023 | Privacy-friendly, invisible, CWV-friendly, free |
| `useState` + hand-rolled validation | RHF 7 + Zod resolver | RHF 7.43+ | Uncontrolled = perf; Zod = shared schema |
| React 18 Form actions (experimental) | React 19 stable `useActionState` / `useFormStatus` | React 19 (Dec 2024) | Not using here — RHF is cleaner for multi-step |
| Contentlayer | Astro Content Collections | 2024 Contentlayer abandoned | Typed markdown without runtime cost |
| `uuid.v4()` | `ulid()` or UUID v7 | 2023+ | Sortable IDs for audit log / admin view |
| Custom HTML email | React Email + `@react-email/tailwind` | 2024 React Email 3+ | Write JSX, get email-client-safe HTML |
| Next.js Pages Router | Astro 6 Actions (for this use case) | Astro 5/6 | Minimal JS for content sites |

**Deprecated / outdated to avoid:**
- `tailwindcss` v3 config file pattern: gone in v4. Use `@theme` in global CSS.
- `@hookform/resolvers` v2.x: Phase 3 needs v3+ for Zod v4 compatibility.
- Vercel Hobby cron minute-granularity: free tier allows minute-granular for a single cron; day-granular is safer.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@hookform/resolvers` v3.9.0 supports Zod v4 seamlessly | Standard Stack | Medium — if incompat, fall back to Zod v3 OR wait for resolver update. Mitigation: verify at install time with a quick Vitest against `leadSchema`. [ASSUMED] |
| A2 | Astro 6's `defineAction` signature is stable and unchanged since Astro 5 GA | Pattern 2 | Low — Astro 6 docs show same API [VERIFIED via docs.astro.build/en/guides/actions/]. |
| A3 | `ctx.clientAddress` in Astro Actions on Vercel returns the real client IP (not a proxy IP) | Pitfall 4 | Medium — if wrong, rate limit is broken. Mitigation: log + verify in Preview deploy with an actual request before hardening. [ASSUMED — not explicitly documented for Actions + Vercel combo; docs.astro.build references it for API routes] |
| A4 | Google Sheets API `valueInputOption: RAW` fully escapes formulas | Pattern 6 | High — if wrong, XSS via formula injection. Mitigation: also strip `=` prefix from untrusted text fields before append. [CITED: developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values#ValueInputOption — "The values the user has entered will not be parsed and will be stored as-is."] — HIGH confidence, but belt-and-suspenders `=` strip is prudent. |
| A5 | Vercel Cron on Hobby tier supports daily (not just weekly) schedule with zero cost | Pattern 10 | Low — [CITED: vercel.com/docs/cron-jobs/usage-and-pricing] Hobby: 2 cron jobs, 1 invocation/day each. Daily cadence works. [VERIFIED] |
| A6 | Resend free tier 3k/mo covers launch volume even with failures multiplying email count | Standard Stack | Low — catering site traffic + 2 emails/lead × 100 leads/mo = 200 emails, well under 3000. [VERIFIED via resend.com pricing] |
| A7 | React Email 5 + `@react-email/tailwind` work with React 19.2 without additional peer-dep patching | Pattern 8 | Low — [CITED: resend.com/blog/react-email-5 "React Email has been upgraded to support React 19.2"]. Verify at install via Vitest render test. |
| A8 | `@vercel/analytics` `track()` works from a React island without additional setup once `<Analytics />` is in `BaseLayout` | Code Examples | Low — [CITED: vercel.com/docs/analytics/custom-events]. Verify at launch. |
| A9 | `sessionStorage` is available in all target browsers (modern mobile) with no fallback needed | Pattern 3 | Very low — universal support. [VERIFIED] |
| A10 | The Turnstile "always-passes" test keys (`1x0000…AA`, etc.) are stable and unchanged | Pattern 9 | Low — documented since 2023. [CITED: developers.cloudflare.com/turnstile/troubleshooting/testing/] |

**Planning impact:** A1, A3 are the two to verify in Wave 0 tests. A4 warrants a defensive belt-and-suspenders implementation. All other assumptions are low-risk.

## Open Questions

1. **Which email address is Larrae's lead-notification recipient?**
   - What we know: `site.md` has `site.email`. CONTEXT expects D-16 email to go to Larrae.
   - What's unclear: Is `site.email` *the* email for lead notifications, or does she want a separate internal inbox?
   - Recommendation: Default to `site.email`. If she wants a separate `leads@` alias, that's a v1.1 env var (`LEADS_NOTIFY_EMAIL`) that defaults to `site.email`.

2. **`CRON_SECRET` and `RESEND_WEBHOOK_SECRET` — do these need to be added to Phase 1 D-15's env var inventory?**
   - What we know: Phase 1 D-15 enumerates env vars but doesn't include these.
   - What's unclear: Whether the planner should treat this as a Phase 1 retroactive edit vs. Phase 3 addition.
   - Recommendation: Phase 3 adds them to `src/env.d.ts` and `.env.example` — Phase 1 D-15 is no longer the single source after each phase may extend it. Document the extension in Phase 3 PLAN.

3. **Rate-limit storage: Sheets vs in-memory vs Upstash?**
   - What we know: LEAD-03 requires "5 submissions per 10 minutes" per IP. Sheets reads/writes cost quota. In-memory (Map) is per-lambda-instance → Vercel lambdas can be cold-started independently, so counter is useless across instances.
   - What's unclear: Is a Sheets-backed rolling window acceptable for v1 given the quota cost?
   - Recommendation: Accept Sheets-backed for v1. At 5 writes/10min cap + daily cron + normal submissions, we're 2 orders of magnitude under quota. If quota trips, fall back to IP-hash → count-in-same-minute using a tiny Vercel KV free tier (v1.1). Document as accepted trade-off.

4. **Should confirmation screen get its own URL for shareability / analytics?**
   - What we know: CONTEXT D-15 says "no redirect per WIZ-12". WIZ-12 says "submission confirmation screen displays submission ID (not a redirect)".
   - What's unclear: Does "no redirect" mean "no navigation event" or "no full page reload"?
   - Recommendation: Follow CONTEXT literally — in-place island swap, same URL. If analytics needs clarity, emit `wizard_submit_success` event with submission_id; Vercel Analytics can filter by custom prop. Defer a dedicated `/inquiry/confirmed` route unless a Phase 4 analytics need surfaces.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22.12+ | Astro 6, googleapis | ✓ | `^22.12 <23` pinned in package.json engines | — |
| pnpm 9 | package manager | ✓ | 9.15.9 pinned | — |
| Astro 6.1.6 | framework | ✓ | installed | — |
| React 19.2.5 | island | ✓ | installed | — |
| Zod 4.3.6 | schemas | ✓ | installed | — |
| shadcn CLI | component install | ✓ (via `pnpm dlx shadcn@latest`) | latest | — |
| Vercel account | deploy + cron + analytics | ✓ (Phase 1 D-13 linked) | — | — |
| Resend account + API key | transactional email | ⚠ **Not yet provisioned for Preview** | — | Plan task: provision sandbox key, add to Vercel Preview env |
| Cloudflare Turnstile account + site | bot defense | ⚠ **Not yet provisioned for Preview** | — | Plan task: create site, register production domain (placeholder OK for Preview), add keys to Vercel |
| Google Cloud project + service account | Sheets API | ⚠ **Not yet provisioned** | — | Plan task: create project, enable Sheets API, create service account + JSON key, share target sheet with account email |
| Google Sheet (Leads + RateLimit tabs) | lead storage | ⚠ **Not yet created** | — | Plan task: create sheet, author headers, share with service account |
| `@react-email/cli` | dev preview (not prod) | ✗ | — | Fallback: `vite-preview`-style render test via Vitest |

**Missing dependencies with no fallback:** None — all are straightforward provisioning tasks.

**Missing dependencies with fallback:** All external accounts (Resend, Turnstile, Google) — these need dashboard setup. Plan task: "Provision external services and populate Vercel Preview env vars" as Wave 0.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (unit) + Playwright 1.59.1 (e2e) |
| Config file | `vitest.config.ts` (exists from Phase 1 D-05 D-09); `playwright.config.ts` (exists) |
| Quick run command | `pnpm vitest run --reporter=dot` |
| Full suite command | `pnpm test && pnpm test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WIZ-01 | Wizard renders 4 steps as island | e2e | `pnpm test:e2e -- wizard-smoke` | ❌ Wave 0 |
| WIZ-02 | Progress indicator shows N of 4 | e2e | `pnpm test:e2e -- wizard-progress` | ❌ Wave 0 |
| WIZ-03 | Cannot advance with invalid fields | e2e | `pnpm test:e2e -- wizard-validation` | ❌ Wave 0 |
| WIZ-04 | sessionStorage persistence through refresh | e2e | `pnpm test:e2e -- wizard-persist` | ❌ Wave 0 |
| WIZ-05 | `?step=N` URL + browser back | e2e | `pnpm test:e2e -- wizard-url-sync` | ❌ Wave 0 |
| WIZ-06 | `beforeunload` only when dirty | e2e | `pnpm test:e2e -- wizard-beforeunload` | ❌ Wave 0 |
| WIZ-07 | Mobile input types (inputmode, type=date) | unit (DOM attrs) | `pnpm vitest run wizard-inputs` | ❌ Wave 0 |
| WIZ-08 | 44×44 touch target CSS | unit (computed style) | `pnpm vitest run wizard-touch-targets` | ❌ Wave 0 |
| WIZ-09 | `?tier=medium` deep-link pre-selects | e2e | `pnpm test:e2e -- wizard-deeplink` | ❌ Wave 0 |
| WIZ-10 | Date lead-time + blackouts enforced | unit + e2e | `pnpm vitest run date-validation` | ❌ Wave 0 |
| WIZ-11 | ZIP soft-check pre-fills city | unit | `pnpm vitest run service-area` | ❌ Wave 0 |
| WIZ-12 | Confirmation screen shows submission ID | e2e | `pnpm test:e2e -- wizard-confirmation` | ❌ Wave 0 |
| WIZ-13 | Keyboard navigation through wizard | e2e (manual-assisted via Playwright keyboard API) | `pnpm test:e2e -- wizard-keyboard` | ❌ Wave 0 |
| WIZ-14 | Reduced-motion disables transitions | unit (CSS snapshot) | `pnpm vitest run reduced-motion` | ❌ Wave 0 |
| EST-01 | `estimate()` is pure, shared module | unit | `pnpm vitest run src/lib/pricing/estimate.test.ts` | ⚠ Stub exists, impl empty |
| EST-02 | Sources pricing from packages content | unit (fixtures loaded from `content/packages/*.md` via `getCollection` mock) | `pnpm vitest run estimate-from-content` | ❌ Wave 0 |
| EST-03 | Returns range not single number | unit (return-type check) | `pnpm vitest run estimate-range` | ❌ Wave 0 (in main test file) |
| EST-04 | "Final quote confirmed by Larrae" rendered | unit (component test) | `pnpm vitest run sticky-bar-render` | ❌ Wave 0 |
| EST-05 | 1..200 maps to tier or fallback (exhaustive sweep) | unit (table) | `pnpm vitest run estimate-1-to-200` | ❌ Wave 0 |
| EST-06 | Boundary ±1 passes at 9/10/11, 20/21, 30/31, 75/76 | unit (boundary fixtures) | `pnpm vitest run estimate-boundaries` | ❌ Wave 0 |
| EST-07 | Debounce on estimate updates | unit (fake timers + rapid-fire keystrokes) | `pnpm vitest run estimate-debounce` | ❌ Wave 0 |
| EST-08 | Out-of-range shows custom-quote UI | unit (component) + e2e | `pnpm vitest run custom-quote-fallback` | ❌ Wave 0 |
| LEAD-01 | Astro Action re-validates with Zod | integration (Action invoked with bad input → 400 with field errors) | `pnpm vitest run submit-action-zod` | ❌ Wave 0 |
| LEAD-02 | Turnstile verified server-side before store/email | integration (mock Turnstile siteverify) | `pnpm vitest run submit-action-turnstile` | ❌ Wave 0 |
| LEAD-03 | 5/10min rate limit | integration (fake Sheets; 6th submission rejected) | `pnpm vitest run rate-limit` | ❌ Wave 0 |
| LEAD-04 | Idempotency key prevents duplicates | integration (same key submitted twice → one row, same submission_id) | `pnpm vitest run idempotency` | ❌ Wave 0 |
| LEAD-05 | Store before email | integration (fail email, verify row persisted) | `pnpm vitest run store-before-email` | ❌ Wave 0 |
| LEAD-06 | LeadStore interface + adapter | unit (in-memory LeadStore test double satisfies interface) | `pnpm vitest run lead-store-interface` | ❌ Wave 0 |
| LEAD-07 | Stored record field coverage | integration (assert Sheets row has all expected columns) | `pnpm vitest run store-fields` | ❌ Wave 0 |
| LEAD-08 | Notification email to Larrae | unit (render test) + integration (mock Resend) | `pnpm vitest run notify-email` | ❌ Wave 0 |
| LEAD-09 | Confirmation email to inquirer | unit (render) + integration (mock Resend) | `pnpm vitest run confirmation-email` | ❌ Wave 0 |
| LEAD-10 | Email failures don't lose lead | integration (email throws → row still exists + status=failed) | `pnpm vitest run email-failure-preserves-lead` | ❌ Wave 0 |
| LEAD-11 | Retry cron scans + retries pending | integration (cron endpoint invoked with bearer secret → finds pending rows → calls send) | `pnpm vitest run retry-cron` | ❌ Wave 0 |
| LEAD-12 | Resend webhook updates status | integration (POST to webhook with mock signed payload → Sheets updated) | `pnpm vitest run resend-webhook` | ❌ Wave 0 |
| SPAM-01 | Honeypot field rejects silently | integration (website=spam → 200 + decoy id + no store) | `pnpm vitest run honeypot` | ❌ Wave 0 |
| SPAM-02 | Turnstile widget renders on step 4 | e2e | `pnpm test:e2e -- turnstile-step-4` | ❌ Wave 0 |
| SPAM-03 | Min-time threshold rejects instant | integration (submit <3s after mount) | `pnpm vitest run min-time` | ❌ Wave 0 |
| SPAM-04 | URL-in-notes heuristic rejects | integration (notes contains http://) | `pnpm vitest run url-heuristic` | ❌ Wave 0 |
| SPAM-05 | Email fallback visible in error | e2e (simulate Turnstile fail, assert mailto visible) | `pnpm test:e2e -- error-email-fallback` | ❌ Wave 0 |
| SPAM-06 | CI blocks test keys in prod | CI (grep step in `.github/workflows/ci.yml`) | `bash scripts/check-turnstile-keys.sh dist/` | ❌ Wave 0 |
| — | Manual UAT: iPhone Safari + Android Chrome end-to-end wizard | manual-only | — (Phase 5 smoke test) | Docs in `03-VERIFICATION.md` |
| — | Manual UAT: Larrae receives + opens notification on mobile | manual-only | — | Phase 5 LAUN-06 |

### Sampling Rate

- **Per task commit:** `pnpm vitest run <changed-test-files>` — sub-10-second feedback
- **Per wave merge:** `pnpm test` (full Vitest suite) + `pnpm test:e2e --grep=@wave<N>` — tag e2e specs by wave
- **Phase gate:** `pnpm test && pnpm test:e2e && pnpm astro check && pnpm lint` green before `/gsd-verify-work`

### Wave 0 Gaps

Every test file below needs scaffolding in Wave 0 (before feature implementation):

- [ ] `src/lib/pricing/estimate.test.ts` — expand from skipped stub to full 1–200 sweep + boundary table (EST-05, EST-06)
- [ ] `src/lib/schemas/lead.test.ts` — leadSchema parse edge cases
- [ ] `src/lib/leads/LeadStore.test.ts` — interface contract using in-memory double
- [ ] `src/lib/leads/GoogleSheetsAdapter.test.ts` — mocked `googleapis` client
- [ ] `src/lib/leads/submissionId.test.ts` — ULID + `LK-XXXXXX` extraction
- [ ] `src/lib/email/templates/__tests__/LeadNotification.test.tsx` — `render()` output contains required fields
- [ ] `src/lib/email/templates/__tests__/LeadConfirmation.test.tsx`
- [ ] `src/lib/spam/turnstile.test.ts` — mocked fetch
- [ ] `src/lib/spam/heuristics.test.ts` — honeypot / min-time / URL regex
- [ ] `src/lib/spam/rateLimit.test.ts` — rolling-window logic
- [ ] `src/actions/submitInquiry.test.ts` — full pipeline integration with in-memory LeadStore + mock Resend + mock Turnstile
- [ ] `src/components/wizard/__tests__/useWizardPersistence.test.tsx` — sessionStorage round-trip
- [ ] `src/components/wizard/__tests__/useUrlSync.test.tsx` — pushState + popstate
- [ ] `src/components/wizard/__tests__/StickyEstimateBar.test.tsx` — hidden when invalid, shows range, shows custom-quote fallback
- [ ] `e2e/wizard-smoke.spec.ts` — 4-step happy path
- [ ] `e2e/wizard-persist.spec.ts` — refresh mid-wizard
- [ ] `e2e/wizard-url-sync.spec.ts` — back/forward + deep-link
- [ ] `e2e/wizard-keyboard.spec.ts` — tab-only completion
- [ ] `e2e/turnstile-test-bypass.spec.ts` — uses always-passes test key
- [ ] `e2e/error-email-fallback.spec.ts` — forces Turnstile fail (always-blocks test key)
- [ ] `scripts/check-turnstile-keys.sh` — SPAM-06 CI gate
- [ ] Shared fixtures: `tests/fixtures/packages.ts` (tier data), `tests/fixtures/site.ts` (site config), `tests/mocks/googleapis.ts`, `tests/mocks/resend.ts`, `tests/mocks/turnstile.ts`

**Framework install:** None — Vitest + Playwright already installed in Phase 1 D-05.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture | yes | Store-first + pluggable LeadStore interface documents trust boundaries |
| V2 Authentication | no | No user auth in wizard; service-account auth for Google Sheets (scoped to one sheet) |
| V3 Session Management | partial | sessionStorage used for UX continuity only — no auth state. Clear on successful submit. |
| V4 Access Control | yes | Cron endpoint MUST verify `Authorization: Bearer $CRON_SECRET`. Webhook endpoint MUST verify Resend signature. Action rate-limits per IP. |
| V5 Input Validation | **yes (critical)** | Zod `leadSchema` server-side re-parse (LEAD-01); `valueInputOption: RAW` for Sheets to prevent formula injection; URL-in-notes heuristic strips link spam; honeypot + min-time + Turnstile for bot defense. |
| V6 Cryptography | yes | `crypto.createHash('sha256')` + salt for IP hashing; HMAC `timingSafeEqual` for Resend webhook signature; `crypto.randomUUID()` for idempotency keys. Never hand-roll. |
| V7 Error Handling + Logging | yes | Errors logged via `console.error` (captured by Vercel) → Sentry in Phase 4. Decoy 200 on bot rejection (fail-silent). |
| V8 Data Protection | yes | PII (name, email, phone) never in URL. sessionStorage cleared on successful submit. IP stored only as hash. |
| V9 Communication | yes | HTTPS end-to-end (Vercel default). Resend + Turnstile + Google APIs all over HTTPS. |
| V10 Malicious Code | no | Pure app, no uploads, no code execution from user input. |
| V11 Business Logic | yes | Idempotency key prevents duplicate submission; rate limit bounds abuse cost; store-first ordering ensures lead persistence. |
| V13 API & Web Services | yes | Astro Actions generate POST endpoints under `/_actions/*`; same-origin cookies-less. |
| V14 Configuration | yes | Env vars never committed; `src/env.d.ts` documents the contract; SPAM-06 CI gate blocks test keys in prod. |

### Known Threat Patterns for Astro + React + Serverless + Sheets

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Formula injection via free-text notes → Sheets | Tampering / Elevation | `valueInputOption: RAW` + strip `=` prefix from untrusted text before append |
| XSS in email template via unescaped user input | Tampering | React Email auto-escapes; do not use `dangerouslySetInnerHTML` |
| CSRF on Astro Action | Tampering | Astro Actions accept same-origin; no CSRF token needed with `accept: 'form'` and `POST` (Astro generates unique per-action URLs) |
| Turnstile token replay | Spoofing | Token single-use + 5-min expiry enforced server-side by Cloudflare; we also include `idempotency_key` on siteverify |
| Resend webhook replay | Spoofing | HMAC signature verification via Resend secret + `crypto.timingSafeEqual` |
| Cron endpoint unauthorized access | Elevation | Bearer token check against `CRON_SECRET`; 401 on mismatch |
| Secret key in client bundle | Info Disclosure | Only `import.meta.env.PUBLIC_*` vars are inlined; `TURNSTILE_SITE_KEY` is `PUBLIC_`-prefixed (client-visible, safe); `TURNSTILE_SECRET_KEY` never prefixed. **CRITICAL: current `env.d.ts` uses `TURNSTILE_SITE_KEY` without `PUBLIC_` prefix — flag for Phase 3 rename to `PUBLIC_TURNSTILE_SITE_KEY` for Astro to expose to client safely.** |
| PII in logs | Info Disclosure | Only log submission_id + email hash in error paths, never full form |
| Bot DOS via repeated submits | DoS | Layered: honeypot (fast reject) + min-time + URL heuristic + Turnstile + rate limit. Decoy 200 doesn't inform attacker. |
| Sheets service-account compromise | Elevation | Service account scoped to one sheet (not whole Drive); key stored encrypted in Vercel env; rotate quarterly. |

**Env var rename flagged above:** Current `src/env.d.ts` has `TURNSTILE_SITE_KEY` — for Astro 6 to expose an env var to client bundles, it must be prefixed `PUBLIC_`. Phase 3 MUST rename to `PUBLIC_TURNSTILE_SITE_KEY` (and leave `TURNSTILE_SECRET_KEY` unchanged). This is a Phase 1 retroactive edit; planner should include it in the env-var setup task.

## Sources

### Primary (HIGH confidence)

- [Astro Actions guide](https://docs.astro.build/en/guides/actions/) — `defineAction`, `accept: 'form'`, `input` schemas, `ActionError`, `isInputError`, client call shape, form-enhanced submission
- [Astro Actions API Reference](https://docs.astro.build/en/reference/modules/astro-actions/) — exact signatures
- [Cloudflare Turnstile — Server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) — siteverify POST shape, response JSON, token validity (5 min), `idempotency_key`, `remoteip`
- [Cloudflare Turnstile — Testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) — test site/secret keys documented verbatim
- [Google Sheets API v4 — spreadsheets.values.append](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append) — `valueInputOption`, `insertDataOption`
- [Google Sheets API — Usage Limits](https://developers.google.com/workspace/sheets/api/limits) — 300 read + 300 write per minute per project
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) — `vercel.json` crons schema, GET-only invocation, cron expression limits
- [Vercel Cron — Managing](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — CRON_SECRET convention
- [Vercel Analytics — Custom Events](https://vercel.com/docs/analytics/custom-events) — `track()` signature, client-only caveat
- [Vercel Analytics package docs](https://vercel.com/docs/analytics/package) — `<Analytics />` for Astro
- [Vercel Request Headers](https://vercel.com/docs/headers/request-headers) — `x-forwarded-for` overwriting, `x-real-ip`, `x-vercel-forwarded-for`
- [React Email 5.0 release](https://resend.com/blog/react-email-5) — React 19.2 + Tailwind 4 support
- [React Email Tailwind component](https://react.email/docs/components/tailwind) — email-safe class compilation
- [ulid npm package](https://www.npmjs.com/package/ulid) — crypto.getRandomValues browser + crypto.randomBytes node
- [React Hook Form — React 19 discussion](https://github.com/orgs/react-hook-form/discussions/11832) — interop pattern with useActionState (official forum)
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — v4-track component install instructions

### Secondary (MEDIUM confidence — verified against official where possible)

- [Markus Oberlehner — RHF + useActionState + Next.js 15 App Router](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router) — confirms awkward interop; informs recommendation to use RHF standalone
- [LogRocket — Exploring Astro Actions + request rewriting](https://blog.logrocket.com/exploring-actions-request-rewriting-astro/) — field-error handling patterns
- [GitHub googleworkspace/node-samples — sheets_append_values.js](https://github.com/googleworkspace/node-samples/blob/main/sheets/snippets/sheets_append_values.js) — canonical `googleapis` append pattern
- [Stateful — Google Sheets API Limits](https://stateful.com/blog/google-sheets-api-limits) — retry/backoff patterns

### Tertiary (LOW confidence — flagged for validation)

- Specific latency numbers for decoy vs real paths (estimated from architecture; not measured)
- Exact retry-cron timing (recommendation 09:00 UTC; Larrae's time-zone preference may adjust)
- A11y screen-reader announcement wording for step transitions (implementation-detail, assumption)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every library version verified against either `package.json` or npm registry / official release notes (React Email 5, Tailwind 4, Astro 6 all dated 2026 or late 2025)
- Architecture: **HIGH** — Astro Actions + `defineAction` + RHF integration confirmed by official Astro docs and community posts; pipeline ordering is well-established store-first pattern
- Pitfalls: **HIGH** — each pitfall is documented in multiple reference materials or is a known issue in prior catering/lead-gen projects
- Runtime state inventory: **HIGH** — all state categories explicitly enumerated
- Validation architecture: **HIGH** — test framework already installed, every requirement mapped to a specific command
- Security: **MEDIUM-HIGH** — ASVS coverage complete; env-var PUBLIC_ prefix issue is a verifiable finding (not an assumption)

**Research date:** 2026-04-16
**Valid until:** 2026-07-16 (90 days — stable stack, slow-moving libraries; re-verify before launch if Phase 3 execution starts > 30 days from now)

---

*Phase: 03-inquiry-wizard-lead-pipeline*
*Research date: 2026-04-16*
