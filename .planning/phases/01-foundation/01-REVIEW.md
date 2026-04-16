---
phase: 01-foundation
reviewed: 2026-04-15T12:00:00Z
depth: standard
files_reviewed: 33
files_reviewed_list:
  - .env.example
  - .github/CODEOWNERS
  - .github/workflows/ci.yml
  - .github/workflows/pr-title.yml
  - .gitignore
  - astro.config.mjs
  - biome.json
  - components.json
  - lefthook.yml
  - package.json
  - playwright.config.ts
  - scripts/check-image-budget.sh
  - scripts/setup-branch-protection.sh
  - src/components/ui/button.tsx
  - src/content.config.ts
  - src/env.d.ts
  - src/lib/pricing/estimate.test.ts
  - src/lib/pricing/estimate.ts
  - src/lib/schemas/about.ts
  - src/lib/schemas/faq.ts
  - src/lib/schemas/gallery.ts
  - src/lib/schemas/hero.ts
  - src/lib/schemas/menu.ts
  - src/lib/schemas/packages.ts
  - src/lib/schemas/site.ts
  - src/lib/schemas/testimonials.ts
  - src/lib/utils.ts
  - src/pages/index.astro
  - src/styles/global.css
  - tests/smoke.spec.ts
  - tsconfig.json
  - vitest.config.ts
findings:
  critical: 1
  warning: 6
  info: 5
  total: 12
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-15T12:00:00Z
**Depth:** standard
**Files Reviewed:** 33
**Status:** issues_found

## Summary

Phase 01 is a foundation/scaffolding phase. The codebase is well-structured: Zod schemas are clean and typed, CI workflows are solid, TypeScript is configured strictly per project spec (`strict: true`, `noUncheckedIndexedAccess: true`), and the Astro + React + Tailwind v4 stack is wired correctly.

Key concerns are: (1) the `pr-title.yml` workflow uses `pull_request_target` which is a known security risk vector, (2) the `setup-branch-protection.sh` script disables admin enforcement creating a bypass, (3) several Zod schemas have missing validation constraints that could admit bad data, and (4) minor `.gitignore` duplication and `.env.example` comment inconsistency with CLAUDE.md (Turso vs Google Sheets).

Overall the foundation is solid for a scaffolding phase. The critical and warning items should be addressed before Phase 2 builds on top of these schemas and workflows.

## Critical Issues

### CR-01: `pull_request_target` trigger exposes workflow to fork-based injection

**File:** `.github/workflows/pr-title.yml:4`
**Issue:** The `pull_request_target` event runs in the context of the *base* branch, which means it has access to repository secrets (`GITHUB_TOKEN` with write permissions). While this workflow only invokes a well-known third-party action (`amannn/action-semantic-pull-request@v6`) and does not checkout untrusted code, using `pull_request_target` with `synchronize` in the types list is a known anti-pattern. If this workflow is ever modified to checkout PR code or run scripts from the PR, it becomes a full repository compromise vector. The `synchronize` event type is especially dangerous because it fires on every push to the PR branch, giving an attacker repeated opportunities.
**Fix:** Switch to `pull_request` trigger. The semantic PR title check only reads the PR title metadata and does not need base-branch context or elevated secrets. If `pull_request` is insufficient for the action (some older versions required `pull_request_target` to read fork PR titles), pin to a SHA instead of a tag and remove `synchronize` from the types list at minimum:
```yaml
on:
  pull_request:
    types: [opened, edited, reopened]

permissions:
  pull-requests: read
```

## Warnings

### WR-01: Branch protection disables admin enforcement

**File:** `scripts/setup-branch-protection.sh:29`
**Issue:** `"enforce_admins": false` means repository admins can bypass all branch protection rules (force-push to main, merge without CI, skip reviews). For a single-owner project this means the owner can accidentally push directly to main, bypassing the CI pipeline that this phase carefully sets up.
**Fix:** Set to `true` so admins are also bound by the protection rules:
```json
"enforce_admins": true,
```

### WR-02: `.env.example` references Google Sheets but CLAUDE.md specifies Turso

**File:** `.env.example:14-16`
**Issue:** The `.env.example` file declares `GOOGLE_SHEETS_CREDENTIALS_JSON` and `GOOGLE_SHEETS_LEAD_SHEET_ID`, and `src/env.d.ts:9-10` types these as well. However, CLAUDE.md's recommended stack specifies **Turso (libSQL)** as the lead storage solution, with Google Sheets listed only as an alternative "if Larrae strongly prefers editing leads in Sheets." This creates confusion about the canonical architecture: code will be developed against whichever env vars exist in the type system, potentially locking in the wrong integration.
**Fix:** If the decision is Turso (as CLAUDE.md recommends), replace the Google Sheets vars with Turso vars:
```env
# Lead storage -- Turso (Phase 3)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```
And update `src/env.d.ts` accordingly. If Google Sheets was deliberately chosen, update CLAUDE.md to reflect that decision.

### WR-03: `about` schema allows `chefPortrait` without `chefPortraitAlt`

**File:** `src/lib/schemas/about.ts:6-7`
**Issue:** Both `chefPortrait` and `chefPortraitAlt` are independently optional. This means content can include a portrait image path with no alt text, which violates WCAG 2.1 AA (the project's accessibility constraint). An `<img>` rendered from this data without alt text is an accessibility failure.
**Fix:** Use a Zod `refine` to enforce that `chefPortraitAlt` is required when `chefPortrait` is provided:
```ts
export const aboutSchema = z.object({
  heritageNarrative: z.string().min(150).max(2500),
  positioning: z.string(),
  chefPortrait: z.string().optional(),
  chefPortraitAlt: z.string().optional(),
}).refine(
  (d) => !d.chefPortrait || !!d.chefPortraitAlt,
  { message: "chefPortraitAlt is required when chefPortrait is provided", path: ["chefPortraitAlt"] }
);
```

### WR-04: `menu` schema allows `photo` without `photoAlt`

**File:** `src/lib/schemas/menu.ts:10-11`
**Issue:** Same pattern as WR-03. `photo` and `photoAlt` are independently optional. A menu item with a photo but no alt text violates WCAG 2.1 AA.
**Fix:** Add a refine:
```ts
export const menuItemSchema = z.object({
  name: z.string(),
  category: z.enum(["proteins", "sides", "desserts"]),
  description: z.string(),
  dietary: z
    .array(z.enum(["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"]))
    .default([]),
  photo: z.string().optional(),
  photoAlt: z.string().optional(),
  order: z.number().int(),
}).refine(
  (d) => !d.photo || !!d.photoAlt,
  { message: "photoAlt is required when photo is provided", path: ["photoAlt"] }
);
```

### WR-05: `gallery` schema has no `order` uniqueness signal and `image` path is unvalidated

**File:** `src/lib/schemas/gallery.ts:3-8`
**Issue:** The `image` field accepts any string with no validation. While Zod cannot check file existence, there is no minimum length or pattern check, so an empty string `""` would pass validation and produce a broken `<img src="">` at runtime (which triggers a duplicate page request in many browsers). Additionally, the `alt` field has no minimum length, so `alt=""` would pass, producing a decorative-image signal for what is likely a meaningful gallery photo.
**Fix:** Add minimum length constraints:
```ts
export const gallerySchema = z.object({
  image: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  aspectRatio: z.enum(["1:1", "4:3", "3:2", "16:9", "3:4", "2:3", "9:16"]),
  order: z.number().int(),
});
```

### WR-06: `hero` schema image/alt fields accept empty strings

**File:** `src/lib/schemas/hero.ts:3-9`
**Issue:** `headline`, `heroImage`, and `heroImageAlt` all accept empty strings. An empty `heroImage` causes the same broken-`<img>` issue as WR-05. An empty `headline` produces a blank `<h1>` which hurts SEO and accessibility. An empty `heroImageAlt` is a WCAG violation for the primary above-the-fold image.
**Fix:** Add `.min(1)` to required string fields:
```ts
export const heroSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  ctaText: z.string().min(1),
  priceChip: z.string().min(1),
  heroImage: z.string().min(1),
  heroImageAlt: z.string().min(1),
});
```

## Info

### IN-01: `.gitignore` has duplicate entries

**File:** `.gitignore:3,18` and `.gitignore:9,20`
**Issue:** `.vercel/` is listed at both line 3 (`/.vercel/`) and line 18 (`# Vercel` section). `.env` and `.env.local` are listed at lines 9-10 and again at lines 20-21 under `# Env`. This is cosmetic but makes maintenance harder.
**Fix:** Remove the duplicate blocks. Keep the organized section-based layout and remove the duplicates from the top:
```gitignore
/node_modules/
/.next/
/.idea/
/.vscode/
*.log
.DS_Store
Thumbs.db

# Astro
.astro/
dist/

# Vercel
.vercel/

# Env
.env
.env.local
.env.production

# Playwright
playwright-report/
test-results/

# Misc
.cache/
```

### IN-02: `estimate()` stub throws instead of returning `null`

**File:** `src/lib/pricing/estimate.ts:21`
**Issue:** The function signature declares `EstimateRange | null` as the return type, but the implementation throws an `Error`. The comment says "deliberate throw so any accidental production call fails fast," which is a valid approach for a stub, but it contradicts the return type. If Phase 3 callers write `try/catch`-free code relying on the `null` return (as the type suggests), they will get an unhandled exception instead.
**Fix:** This is acceptable as a deliberate stub pattern if Phase 3 replaces it before any caller exists. No change required now, but add a `@throws` JSDoc annotation so Phase 3 developers know:
```ts
/**
 * @throws {Error} Always — stub not yet implemented. Phase 3 will replace.
 */
export function estimate(_input: EstimateInput): EstimateRange | null {
  throw new Error("estimate() not yet implemented -- Phase 3");
}
```

### IN-03: CI `install` job does work but no downstream job uses its artifacts

**File:** `.github/workflows/ci.yml:9-19`
**Issue:** The `install` job runs `pnpm install --frozen-lockfile` but does not cache or upload any artifacts. Every downstream job (`typecheck`, `biome-check`, `content-sync`, `smoke`) re-runs `pnpm install --frozen-lockfile` independently. The `install` job serves only as a "fail-fast if lockfile is broken" gate, but `pnpm/action-setup@v4` + `actions/setup-node@v4` with `cache: pnpm` already caches the pnpm store across jobs.
**Fix:** This is a minor efficiency issue, not a bug. The `install` job could be removed and each downstream job would still work. Alternatively, use a shared cache artifact. Low priority.

### IN-04: `biome.json` excludes `src/styles` from linting

**File:** `biome.json:12`
**Issue:** The `!**/src/styles` exclusion in the `files.includes` array means Biome will never lint or format CSS files under `src/styles/`. This is likely intentional (Tailwind CSS files with `@theme` and `@layer` directives may confuse Biome's CSS parser), but it is worth documenting the intent so future contributors do not accidentally add TypeScript files under `src/styles/` expecting them to be linted.
**Fix:** Add a comment in `biome.json` or document in CLAUDE.md conventions section that `src/styles/` is excluded from Biome because it contains Tailwind v4 CSS-first config.

### IN-05: `site` schema `hours.open` / `hours.close` accept any string

**File:** `src/lib/schemas/site.ts:17-18`
**Issue:** The `open` and `close` fields in the `hours` array accept arbitrary strings. For JSON-LD `OpeningHoursSpecification`, these should ideally be in `HH:MM` format. While enforcing a regex in Zod adds complexity, accepting `"whenever we feel like it"` as an opening time would produce invalid structured data.
**Fix:** Consider adding a regex pattern if hours will be used in JSON-LD:
```ts
const timeFormat = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format");
```
Low priority -- can be deferred if content is author-controlled and validated manually.

---

_Reviewed: 2026-04-15T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
