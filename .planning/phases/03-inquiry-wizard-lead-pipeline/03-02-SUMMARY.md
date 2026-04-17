---
phase: 03-inquiry-wizard-lead-pipeline
plan: 02
subsystem: infra
tags: [dependencies, shadcn, radix-ui, react-hook-form, resend, react-email, googleapis, ulid, vercel-analytics, cloudflare-turnstile, ci-gate]

requires:
  - phase: 01-foundation
    provides: shadcn Button primitive, cn utility, radix-ui unified package, components.json with radix-nova style and empty registries
  - phase: 02-content-static-sections
    provides: BaseLayout.astro with Nav/Footer structure that Analytics mount composes with
provides:
  - Phase 3 runtime dependencies (react-hook-form, @hookform/resolvers, resend, @react-email/{components,render,tailwind}, googleapis, ulid, @vercel/analytics, @marsidev/react-turnstile)
  - shadcn primitives: Dialog, Input, Label, Form, RadioGroup, Textarea — all normalized to the repo's `radix-ui` unified import pattern and `cn` from `@/lib/utils`
  - Vercel Analytics ingestion mount in BaseLayout (serves downstream track() calls)
  - SPAM-06 CI gate script (`scripts/check-turnstile-keys.sh` + `pnpm check:turnstile`) that blocks production bundles containing documented Cloudflare Turnstile test-key substrings
affects: [03-03-wizard-island, 03-04-sheets-adapter, 03-05-action-emails, 03-06-cron-webhook-e2e, 04-seo-a11y-perf]

tech-stack:
  added:
    - react-hook-form@7.72.1
    - "@hookform/resolvers@3.10.0"
    - resend@4.8.0
    - "@react-email/components@0.0.31"
    - "@react-email/render@1.4.0"
    - "@react-email/tailwind@1.2.2"
    - googleapis@144.0.0
    - ulid@2.4.0
    - "@vercel/analytics@1.6.1"
    - "@marsidev/react-turnstile@1.5.0"
    - "shadcn primitives (dialog, input, label, form, radio-group, textarea)"
  patterns:
    - "shadcn components always use `radix-ui` unified import (never `@radix-ui/react-*`) — matches Phase 1 button.tsx convention"
    - "components.json.registries: {} is load-bearing UI-SPEC §Registry Safety — only shadcn official registry allowed"
    - "Form component hand-authored when registry style (radix-nova) ships empty form.json — wrapper follows default shadcn semantics but adapted to repo's import discipline"
    - "Analytics mounted via @vercel/analytics/astro (not @vercel/analytics/react) — keeps the island surface minimal and avoids unnecessary client:* hydration"
    - "SPAM-06 CI gate is a standalone shell script, invocable via npm script, unwired from CI workflow (Phase 4 concern per VALIDATION §Wave 0)"

key-files:
  created:
    - src/components/ui/dialog.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - src/components/ui/form.tsx
    - src/components/ui/radio-group.tsx
    - src/components/ui/textarea.tsx
    - scripts/check-turnstile-keys.sh
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/layouts/BaseLayout.astro

key-decisions:
  - "Vercel Analytics entry: chose @vercel/analytics/astro (framework-native) over @vercel/analytics/react — simpler mount, no client:* directive required, avoids loading React just for analytics."
  - "form.tsx authored in-repo: the radix-nova registry ships an empty form.json (no files), so form.tsx was hand-authored following the default shadcn form.tsx semantics but adapted to: (1) unified radix-ui imports (Slot, LabelPrimitive), (2) cn from @/lib/utils, (3) modern shadcn function-component + data-slot convention, (4) useFormState subscription pattern for formState."
  - "Kept button.tsx untouched during shadcn install — executor answered `N` to the overwrite prompt; git diff post-install confirms zero changes."

patterns-established:
  - "Phase 3 shadcn add pattern: pipe `N` to stdin to preserve existing primitives (`echo N | pnpm dlx shadcn@latest add ...`) since `--yes` alone doesn't auto-reject overwrites."
  - "When a style registry ships an empty component JSON, hand-author the component in-repo matching the default shadcn semantics but mapping imports to the project's unified radix-ui convention."

requirements-completed: [WIZ-01, WIZ-07, WIZ-08, WIZ-13, WIZ-14, SPAM-02, SPAM-06, OBS-01]

duration: ~6 min
completed: 2026-04-17
---

# Phase 3 Plan 02: Phase 3 Dependencies + Analytics Mount + SPAM-06 Gate Summary

**Wave-1 bootstrap: installed 10 runtime dependencies, generated 6 shadcn primitives (radix-ui unified imports), mounted Vercel Analytics ingestion in BaseLayout, and shipped the SPAM-06 CI gate script that rejects production bundles containing documented Cloudflare Turnstile test keys.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-17T00:53:00Z
- **Completed:** 2026-04-17T00:58:50Z
- **Tasks:** 2 (auto)
- **Files modified:** 10 (3 modified, 7 created)

## Accomplishments

- All 10 Phase 3 runtime dependencies installed and pinned in `package.json` at the plan's requested minimum versions (actual installed versions recorded in tech-stack.added)
- 6 shadcn primitives generated via the official CLI (radix-nova style), all verified to use the `radix-ui` unified import pattern and `cn` from `@/lib/utils` — no `@radix-ui/react-*` per-primitive imports anywhere
- `form.tsx` hand-authored (radix-nova registry ships empty) with the default shadcn form semantics adapted to the repo's import discipline
- `<Analytics />` mounted in `BaseLayout.astro` using `@vercel/analytics/astro` — build output confirmed: `<vercel-analytics>` custom element + loader script appear on every rendered page
- `scripts/check-turnstile-keys.sh` shipped: greps dist/ for all 7 documented Cloudflare Turnstile test-key substrings (3 site keys, 3 secret keys, dummy token), exits non-zero on match
- Script verified end-to-end: clean production build passes (exit 0); sentinel injection (`echo "1x00000000000000000000AA" > dist/__sentinel.txt`) fails as expected (exit 1, pattern + file surfaced); sentinel removal returns to clean pass
- `pnpm check:turnstile` npm script registered
- `pnpm astro check` exits 0 (only pre-existing zod deprecation hints in `src/lib/schemas/site.ts`, out of scope)
- `pnpm build` succeeds

## Task Commits

1. **Task 1: Install Phase 3 dependencies + generate shadcn primitives** — `91485bb` (feat)
2. **Task 2: Mount Vercel Analytics in BaseLayout + ship SPAM-06 CI gate script** — `9c89ec2` (feat)

## Files Created/Modified

### Created
- `src/components/ui/dialog.tsx` — shadcn Dialog (focus trap, Escape, ARIA modal); exports Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription
- `src/components/ui/input.tsx` — shadcn Input wrapping native `<input>` with design-token classes; exports Input
- `src/components/ui/label.tsx` — shadcn Label (Radix Label primitive under the hood); exports Label
- `src/components/ui/form.tsx` — hand-authored react-hook-form integration (Form = FormProvider, FormField = Controller wrapper, FormItem/FormLabel/FormControl/FormDescription/FormMessage primitives + useFormField hook); exports Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, useFormField
- `src/components/ui/radio-group.tsx` — shadcn RadioGroup + RadioGroupItem (Radix under the hood); exports RadioGroup, RadioGroupItem
- `src/components/ui/textarea.tsx` — shadcn Textarea wrapping native `<textarea>` with design-token classes; exports Textarea
- `scripts/check-turnstile-keys.sh` — SPAM-06 CI gate; greps dist/ for 7 documented Cloudflare Turnstile test-key substrings; strict shell (`set -euo pipefail`); argument-configurable dist dir

### Modified
- `package.json` — added 10 dependencies + `check:turnstile` npm script
- `pnpm-lock.yaml` — lockfile sync
- `src/layouts/BaseLayout.astro` — added `import Analytics from "@vercel/analytics/astro"` + `<Analytics />` just before `</body>`

## Decisions Made

See key-decisions frontmatter above:

1. **Vercel Analytics entry: Astro-native over React** — chose `@vercel/analytics/astro` (default import `Analytics`) over `@vercel/analytics/react` + `client:load`. Reason: keeps the BaseLayout surface zero-JS until Vercel's own loader injects; no React hydration cost for an analytics-only feature. Build output confirms `<vercel-analytics>` custom element + loader script compile correctly.

2. **Hand-authored form.tsx** — the radix-nova registry (`style: "radix-nova"` in components.json) ships an empty `form.json` (`{ name: "form", type: "registry:ui" }` with no `files`, no `dependencies`). `pnpm dlx shadcn@latest add form` reports "No changes." and creates no file. Authored the component in-repo following the canonical shadcn form semantics (Form = FormProvider, FormField = Controller wrapper, useFormField hook binds FormFieldContext + FormItemContext, all five FormItem/Label/Control/Description/Message slots emit proper ARIA wiring) while mapping imports to the repo's unified `radix-ui` import + `cn` from `@/lib/utils` convention. Used the modern function-component + `data-slot="<name>"` pattern matching `dialog.tsx`/`radio-group.tsx` (not the legacy `React.forwardRef` pattern in the default shadcn form.tsx).

3. **Preserved button.tsx** — answered `N` to the shadcn CLI's overwrite prompt for `button.tsx`. Verified via `git diff src/components/ui/button.tsx` (empty) that the Phase 1 primitive is byte-identical post-install.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Hand-authored form.tsx (radix-nova registry ships empty form.json)**
- **Found during:** Task 1 (shadcn component generation)
- **Issue:** Running `pnpm dlx shadcn@latest add form` against the repo's `style: "radix-nova"` reported "No changes." and created zero files. Verified by fetching `https://ui.shadcn.com/r/styles/radix-nova/form.json` directly — the registry entry is `{ "name": "form", "type": "registry:ui" }` with no `files` array and no `dependencies`. The default shadcn style (`default` not `radix-nova`) does ship a full form.tsx. Plan's acceptance criteria explicitly require `src/components/ui/form.tsx` to exist and export `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField`.
- **Fix:** Authored `src/components/ui/form.tsx` in-repo following the default shadcn form semantics (Form = FormProvider, FormField = Controller wrapper, useFormField binding FormFieldContext + FormItemContext) but mapped to the repo's discipline: (1) `radix-ui` unified imports (`import { Slot, Label as LabelPrimitive } from "radix-ui"`), (2) `cn` from `@/lib/utils`, (3) modern function-component pattern with `data-slot` composition attributes (matching `dialog.tsx` / `radio-group.tsx`), (4) `useFormState({ name })` subscription to keep error surfacing reactive in RHF ≥7.53.
- **Files modified:** `src/components/ui/form.tsx` (created)
- **Verification:** `pnpm astro check` passes (0 errors); `grep 'export { Form, ... FormField }'` confirms all required exports; `grep '@radix-ui/react-'` in the file returns empty (unified `radix-ui` import discipline respected).
- **Committed in:** `91485bb` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking / missing upstream artifact)
**Impact on plan:** Single deviation was necessary because the chosen shadcn style (`radix-nova`) does not ship a form component. Alternative would have been changing `components.json.style` to `default`, which would have been a far larger architectural deviation (would re-style every existing shadcn primitive and break the `radix-nova` preset lock established in Phase 1 D-08). Hand-authoring the single missing primitive while preserving the style preset is the minimum-scope fix.

## Issues Encountered

- **Node version mismatch (worktree environment):** default shell Node was v23.8.0, but `engines.node = ">=22.12.0 <23"`. Resolved by sourcing `~/.nvm/nvm.sh && nvm use 22` at the top of every `pnpm`/`node` invocation. No dependency install or build was ever run against Node 23. Worktree environment detail — not a plan concern, not a deviation.
- **`pnpm dlx shadcn@latest add` reports files as "Skipped"/"might be identical"** — the CLI's text output is misleading when the install is in fact writing files the first time. Verified actual file creation via `ls -la src/components/ui/` after the command. Files were correctly created.

## User Setup Required

None - no external service configuration required at this plan. Downstream plans (03-05, 03-06) will require RESEND_API_KEY, TURNSTILE_SECRET_KEY, and GOOGLE_SHEETS_CREDENTIALS_JSON to be populated in Vercel Preview env — but that is Phase 3's user-setup boundary, not this plan's.

## Next Phase Readiness

- **Plan 03 (wizard island):** All six shadcn primitives (Dialog, Input, Label, Form, RadioGroup, Textarea) ready to import. React Hook Form + Zod resolver ready. @marsidev/react-turnstile ready for the widget. @vercel/analytics `track()` has an ingestion mount.
- **Plan 04 (Sheets adapter):** `googleapis` ready for Google Sheets v4 append/update. `ulid` ready for LK-XXXXXX short-form generation.
- **Plan 05 (Action + emails):** `resend` + `@react-email/{components,render,tailwind}` ready for LeadNotification + LeadConfirmation templates. `@hookform/resolvers` + shared Zod schema ready for server-side input re-validation inside `defineAction`.
- **Plan 06 (cron + webhook + E2E):** SPAM-06 gate script is invocable via `pnpm check:turnstile` — Phase 4 will wire this into the GitHub Actions workflow.
- **UI-SPEC compliance:** `components.json.registries` still `{}` (no third-party registries declared). button.tsx byte-identical to Phase 1 baseline.

## Self-Check: PASSED

All claimed files exist; both commits present in `git log`:

- `package.json`, `pnpm-lock.yaml`, `components.json`: FOUND
- `src/components/ui/dialog.tsx`, `input.tsx`, `label.tsx`, `form.tsx`, `radio-group.tsx`, `textarea.tsx`: FOUND
- `src/layouts/BaseLayout.astro`: FOUND
- `scripts/check-turnstile-keys.sh`: FOUND (executable)
- Commit `91485bb` (feat Task 1): FOUND
- Commit `9c89ec2` (feat Task 2): FOUND

---

*Phase: 03-inquiry-wizard-lead-pipeline*
*Completed: 2026-04-17*
