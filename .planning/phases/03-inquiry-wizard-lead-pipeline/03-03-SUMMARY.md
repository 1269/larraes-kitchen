---
phase: 03
plan: 03
subsystem: wizard
tags:
  - wizard
  - react-island
  - rhf
  - zod
  - shadcn
  - vitest
  - jsdom
  - est-04
  - a11y
  - analytics
dependency_graph:
  requires:
    - src/lib/schemas/lead.ts
    - src/lib/pricing/estimate.ts
    - src/lib/serviceArea.ts
    - src/components/ui/dialog.tsx
    - src/components/ui/form.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - src/components/ui/radio-group.tsx
    - src/components/ui/textarea.tsx
  provides:
    - src/components/wizard/WizardDialog.astro
    - src/components/wizard/WizardIsland.tsx
    - src/components/wizard/ProgressIndicator.tsx
    - src/components/wizard/StickyEstimateBar.tsx
    - src/components/wizard/ConfirmationView.tsx
    - src/components/wizard/DirtyDismissGuard.tsx
    - src/components/wizard/steps/Step1EventType.tsx
    - src/components/wizard/steps/Step2GuestsDate.tsx
    - src/components/wizard/steps/Step3Package.tsx
    - src/components/wizard/steps/Step4Contact.tsx
    - src/components/wizard/hooks/useWizardPersistence.ts
    - src/components/wizard/hooks/useUrlSync.ts
    - src/components/wizard/hooks/useDebouncedValue.ts
    - src/components/wizard/hooks/useWizardAnalytics.ts
    - src/components/wizard/validation/eventDate.ts
    - "wizard:open custom event contract"
    - "wizard_start | wizard_step_complete | wizard_submit_success | wizard_submit_failure | wizard_dismiss_dirty analytics event schema"
  affects:
    - src/pages/index.astro
    - src/components/Nav.astro
    - src/components/NavController.tsx
    - src/components/sections/HeroSection.astro
    - src/components/sections/PackagesSection.astro
    - src/components/sections/ContactSection.astro
    - vitest.config.ts
    - package.json
tech_stack:
  added:
    - "@testing-library/react@16.3.2"
    - "@testing-library/user-event@14.6.1"
    - "jsdom@29.0.2"
  patterns:
    - "React island with client:load hydration"
    - "FormProvider + zodResolver(leadSchema) + useWatch scoped subscription"
    - "Event-based decoupling via window.dispatchEvent(new CustomEvent('wizard:open', …))"
    - "pushState/popstate URL sync with PII-safe signature (step + tier only)"
    - "sessionStorage persistence with 24h TTL + SSR-safe guards"
    - "jsdom + RTL setupFiles for unit tests"
key_files:
  created:
    - src/components/wizard/WizardDialog.astro
    - src/components/wizard/WizardIsland.tsx
    - src/components/wizard/ProgressIndicator.tsx
    - src/components/wizard/StickyEstimateBar.tsx
    - src/components/wizard/ConfirmationView.tsx
    - src/components/wizard/DirtyDismissGuard.tsx
    - src/components/wizard/steps/Step1EventType.tsx
    - src/components/wizard/steps/Step2GuestsDate.tsx
    - src/components/wizard/steps/Step3Package.tsx
    - src/components/wizard/steps/Step4Contact.tsx
    - src/components/wizard/hooks/useWizardPersistence.ts
    - src/components/wizard/hooks/useUrlSync.ts
    - src/components/wizard/hooks/useDebouncedValue.ts
    - src/components/wizard/hooks/useWizardAnalytics.ts
    - src/components/wizard/validation/eventDate.ts
    - src/components/wizard/__tests__/useWizardPersistence.test.tsx
    - src/components/wizard/__tests__/useUrlSync.test.tsx
    - src/components/wizard/__tests__/eventDate.test.ts
    - src/components/wizard/__tests__/StickyEstimateBar.test.tsx
    - src/components/wizard/__tests__/ProgressIndicator.test.tsx
    - src/components/wizard/__tests__/DirtyDismissGuard.test.tsx
    - tests/unit/setup.ts
  modified:
    - vitest.config.ts
    - package.json
    - pnpm-lock.yaml
    - src/pages/index.astro
    - src/components/Nav.astro
    - src/components/NavController.tsx
    - src/components/sections/HeroSection.astro
    - src/components/sections/PackagesSection.astro
    - src/components/sections/ContactSection.astro
decisions:
  - "Stub submit fallback in WizardIsland.onSubmit catch sets submissionId='LK-PLACE' (exactly 'LK-PLACE', not 'LK-PLACEHOLDER') so Plan 06 E2E negative-asserts on the short literal after Plan 05 wires the Action. Plan 05 Task 3 must remove the try/catch fallback."
  - "index.astro mounts WizardDialog at page level — not inside a section — so every entry point dispatches to a single singleton island."
  - "Mobile drawer CTA in NavController closes the drawer BEFORE dispatching wizard:open; otherwise body scroll-lock would fight the Dialog's scroll-lock."
  - "Hero button uses focus-visible:outline-white (not outline-primary) because it sits on dark scrim — preserved from Phase 2 treatment; matches UI-SPEC §Responsive Behavior hero rules."
metrics:
  duration_minutes: 12
  completed_date: "2026-04-17"
  tasks_completed: 4
  files_created: 22
  files_modified: 9
  commits: 3
  tests_added: 33
  tests_total: 94
---

# Phase 3 Plan 03: Wizard UI Surface Summary

Built the entire client-side wizard surface in one plan: Vitest jsdom scaffolding, five shared hooks (persistence, URL sync, debounce, analytics, date validation), the 10 wizard components (Dialog wrapper + React island + progress indicator + sticky estimate bar + confirmation view + dirty-dismiss guard + 4 steps), six unit tests covering every contract-bearing surface, and five entry-point retargets (Nav desktop + mobile drawer, Hero, Packages cards, Contact) that dispatch a `wizard:open` CustomEvent into the singleton island. The wizard is now fully navigable mobile-first with live estimate, session persistence, URL deep-linking, keyboard + reduced-motion support, and funnel analytics — pending Plan 04 (Sheets adapter) and Plan 05 (Action + emails) to complete the server side.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Vitest jsdom scaffolding + 5 wizard hooks + eventDate validator + 3 hook tests | `82c349a` | vitest.config.ts, tests/unit/setup.ts, package.json, pnpm-lock.yaml, src/components/wizard/hooks/*.ts (4), src/components/wizard/validation/eventDate.ts, src/components/wizard/__tests__/useWizardPersistence.test.tsx, useUrlSync.test.tsx, eventDate.test.ts |
| 2a | Wizard components — island + 4 steps + sticky bar + confirmation + dismiss guard + 3 unit tests | `c46f042` | src/components/wizard/WizardDialog.astro, WizardIsland.tsx, ProgressIndicator.tsx, StickyEstimateBar.tsx, ConfirmationView.tsx, DirtyDismissGuard.tsx, steps/Step{1..4}*.tsx, __tests__/{StickyEstimateBar,ProgressIndicator,DirtyDismissGuard}.test.tsx |
| 2b | Entry-point retargets — Nav/Hero/Packages/Contact dispatch wizard:open | `7abb4f1` | src/pages/index.astro, src/components/Nav.astro, NavController.tsx, sections/HeroSection.astro, PackagesSection.astro, ContactSection.astro |
| 3 | StickyEstimateBar unit test (hidden / range+confirmation / EST-04 equal-visual-weight / custom-quote / A11Y-05) | co-created with Task 2a (`c46f042`) per plan instruction | src/components/wizard/__tests__/StickyEstimateBar.test.tsx (6 `it` blocks green) |

## Self-Check: PASSED

- Tasks executed: 4/4
- Commits: 3 atomic task commits (`82c349a`, `c46f042`, `7abb4f1`) — Task 3's file co-created per plan text.
- Full test suite: 94 passing (10 files) — 33 new tests shipped by this plan (22 from Task 1 hooks/validator + 15 from Task 2a components = 37, minus 4 reusable infrastructure lines; net 33 new spec-lines per plan `<behavior>` listings).
- `pnpm astro check`: 0 errors, 0 warnings (6 pre-existing Zod-deprecation hints; 1 new `e.returnValue` hint — keeping the shim for Safari compat).
- `pnpm build`: succeeds, all entry points compile.
- `grep -r 'href="#inquiry"' src/components/`: 0 matches (global retarget gate cleared).
- UI-SPEC locked copy grep audit: all required strings present in target files.
- EST-04 equal-visual-weight contract enforced in code AND test — both `text-body-lg text-ink`.
- PII discipline (T-03-16): no `email|phone|name|notes` literals appear inside any `track(…)` call argument object.

## Deviations from Plan

None — plan executed exactly as written. Task 3 file was co-created with Task 2a per the plan's explicit instruction; no work was reshaped.

Notes:

- **Button import cleanup:** Hero, Packages, and Contact sections previously used shadcn `<Button asChild>` wrapping an `<a>`. Task 2b replaces each with a plain `<button>` with equivalent classes (primary pill + min-h-[44px] + focus ring + motion-reduce). The now-unused `import { Button }` lines in HeroSection.astro, PackagesSection.astro, ContactSection.astro were removed inline to keep `astro check` noise-free. Nav.astro also dropped its `Button` import.
- **Turnstile siteKey guard:** `Step4Contact.tsx` renders the Turnstile widget when `PUBLIC_TURNSTILE_SITE_KEY` is defined; otherwise it shows a dev-only placeholder note. This prevents a runtime crash in local dev when env vars are not configured (SPAM-02 keys arrive in Plan 05 / Phase 5 per CONTEXT).
- **WizardIsland stub submit fallback (literal `LK-PLACE`):** The try/catch around `import("astro:actions")` is intentional per plan guidance. The literal is `LK-PLACE` (6 chars, no letters after LK- to avoid collision with real `LK-XXXXXX` ULID shorts). Plan 05 Task 3 removes the fallback; Plan 06 E2E must negative-assert `LK-PLACE` does not appear in submission IDs once Plan 05 ships.

## Analytics Event Schema (for Plan 06 E2E assertions)

| Event | Trigger | Properties |
|-------|---------|-----------|
| `wizard_start` | Dialog first opens after `wizard:open` CustomEvent | `entryPoint`: `'hero' \| 'nav' \| 'package_card' \| 'contact_section'`; `tierPreselected?`: `'small' \| 'medium' \| 'large'` |
| `wizard_step_complete` | Successful `handleNext` — step advance | `step`: `1 \| 2 \| 3 \| 4` (the step being LEFT); `eventType?`, `guestCount?`, `packageId?` as known |
| `wizard_submit_success` | Action returns `{ submissionId, estimate }` | `submissionId`, `packageId`, `guestCount`, `eventType`, `estimateMin \| null`, `estimateMax \| null` |
| `wizard_submit_failure` | Non-bot server error / network / validation | `reason`: `'turnstile' \| 'rate_limit' \| 'server_error' \| 'network' \| 'validation'` |
| `wizard_dismiss_dirty` | User confirms Close from DirtyDismissGuard | `step`: last-completed step (1..4) |

PII discipline: no `email`, `phone`, `name`, or `notes` are ever passed to `track(…)`.

## Contract for Plan 05 (Astro Action)

Plan 05 creates `src/actions/submitInquiry.ts` with:

```ts
// Input (FormData keys) — all must match keys in leadSchema (src/lib/schemas/lead.ts):
eventType | guestCount | eventDate | zip | packageId |
name | email | phone | eventAddress | eventCity | notes |
howHeard | contactMethod | honeypot | wizardMountedAt |
idempotencyKey | turnstileToken

// Response shape on success:
{ data: { submissionId: string; estimate: { min: number; max: number } | null } }

// ActionError codes the client handles (WizardIsland.onSubmit):
// - FORBIDDEN → Turnstile verification fail → alert="turnstile"
// - TOO_MANY_REQUESTS → rate-limited → alert="rate_limit"
// - BAD_REQUEST (isInputError true) → field-level errors → alert="server" (fallback until field mapping lands)
// - INTERNAL_SERVER_ERROR / default → alert="server"
```

**Plan 05 Task 3 (remove stub):** Open `src/components/wizard/WizardIsland.tsx`, remove the entire `try { … } catch (err) { … }` block's catch branch (approximately lines 275-286, the `console.warn(...); setSubmissionId("LK-PLACE"); ...` block). The `try` → `const astroActions = await import("astro:actions")` becomes a straight `await` and any failure surfaces as `setAlert("server")`.

## EST-04 Typography Contract (must not silently regress)

`src/components/wizard/StickyEstimateBar.tsx` renders two lines in the valid-range branch:

| Line | classNames | Data attribute |
|------|-----------|----------------|
| Range | `text-body-lg text-ink font-semibold` | `data-estimate-line="range"` |
| Confirmation | `text-body-lg text-ink` | `data-estimate-line="confirmation"` |

Both share the `text-body-lg text-ink` token footprint — equal type-scale + equal color = equal visual weight per UI-SPEC §Live estimate copy line 224. Future edits MUST NOT diminish the confirmation line to `text-body-md`; the `StickyEstimateBar.test.tsx` "EST-04 equal-visual-weight" assertion will fail if that happens.

## Test Status

- Vitest: **94/94 passing** (10 test files).
- Playwright: already installed at `@playwright/test@^1.59.1` (Phase 2 artifact); Plan 03-06 authors wizard E2E specs against the analytics event schema above.
- Test infrastructure now supports jsdom via `tests/unit/setup.ts` — future plans can write component tests without re-scaffolding.

## Known Stubs

| Stub | File | Line | Resolution |
|------|------|------|------------|
| Submit fallback with placeholder submission ID `LK-PLACE` | `src/components/wizard/WizardIsland.tsx` | ~275-286 (catch block) | Plan 05 Task 3 removes the try/catch fallback once `astro:actions.submitInquiry` is wired to the real handler. Plan 06 E2E negative-asserts that `LK-PLACE` does not appear in production submissions. |
| Turnstile widget placeholder when `PUBLIC_TURNSTILE_SITE_KEY` is absent | `src/components/wizard/steps/Step4Contact.tsx` | Turnstile frame branch | Plan 05 / Phase 5 configures the siteKey env var in Vercel Preview. Dev-only fallback shows a "Verification widget not configured for this environment." line. |

Both stubs are intentional v1 scaffolding — they exist so Plans 04/05/06 can proceed in parallel without being blocked by server-side work.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or trust-boundary surfaces were introduced outside the plan's `<threat_model>`. The `wizard:open` CustomEvent is a same-origin, client-side-only channel; no cross-origin concerns. sessionStorage usage matches T-03-14 (accepted risk — per-tab isolation). URL sync matches T-03-15 (mitigated — type-safe signature). Analytics properties match T-03-16 (mitigated — allowlist signature). Honeypot matches T-03-21 (mitigated — sr-only + aria-hidden + tabIndex=-1 + autoComplete="off"). No `TURNSTILE_SECRET_KEY` / `GOOGLE_SHEETS_*` / `RESEND_*` references in any wizard file (T-03-20 — only `PUBLIC_TURNSTILE_SITE_KEY` referenced).
