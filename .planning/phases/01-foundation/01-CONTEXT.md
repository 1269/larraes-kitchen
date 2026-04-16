# Phase 1: Foundation - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the technical foundation — Astro 6 + React 19 + Tailwind v4 + shadcn/ui scaffold, design tokens, Zod content schemas, CI pipeline, Vercel deploy, and branch protection — so every later phase ships code and content against a validated pipeline. No runtime features (hero, wizard, lead pipeline) are built here; this phase produces the empty-but-validated skeleton everything else fills in.

</domain>

<decisions>
## Implementation Decisions

### Design Tokens (Tailwind v4 `@theme`)
- **D-01:** Two-layer token model. Brand layer defines the full warm palette as named CSS vars (`--color-deep-amber`, `--color-warm-cream`, `--color-greens-deep`, `--color-greens-mid`, `--color-iron-black`, `--color-southern-red`, `--color-butter-gold`, `--color-clay`). Semantic layer maps to brand: `--color-primary` = greens-deep, `--color-surface` = warm-cream, `--color-accent` = deep-amber, `--color-ink` = iron-black. Components reference semantic tokens; brand tokens stay available for one-off uses.
- **D-02:** Full warm palette declared in `@theme` from day one — no curated subset. Avoids re-opening token PRs in Phase 2 when a less-common color is needed.
- **D-03:** Fonts self-hosted via Fontsource (`@fontsource/playfair-display`, `@fontsource/work-sans`) with weights/styles subset to actual usage. Lovelace (commercial license) is self-hosted as woff2 in `/public/fonts/` with a hand-authored `@font-face`. No Google Fonts CDN — preserves CWV (PERF-01) and removes a third-party hop on first paint.
- **D-04:** Custom editorial typography scale defined as named tokens: `text-display-xl` (hero), `text-display-lg` (section heads), `text-display-md` (Playfair italic subheads), `text-body-lg/md/sm` (Work Sans body), `text-eyebrow` (small caps Work Sans). Enforces typographic discipline for Phase 2 instead of ad-hoc Tailwind sizes.

### Shared Schema & Repo Layout
- **D-05:** All Zod schemas live in `src/lib/schemas/{site,packages,menu,hero,about,testimonials,faq,gallery}.ts`. `src/content.config.ts` imports them to define Content Collections. Phase 3's wizard, Astro Action, and email templates import the same schema modules — single source of truth for types and validation.
- **D-06:** Price calculator at `src/lib/pricing/estimate.ts` as a pure function. Imports `packageSchema` from `src/lib/schemas/packages.ts` and operates on the validated package data. Co-located Vitest tests at `src/lib/pricing/estimate.test.ts` will cover EST-05/06 boundary cases (1, 9, 10, 11, 20, 21, 30, 31, 75, 76, 200) when Phase 3 lands the wizard. In Phase 1 the file exists as a typed stub or skipped test scaffold so the directory contract is set.
- **D-07:** Full repo skeleton stood up in Phase 1 with `.gitkeep` placeholders:
  ```
  src/
    components/{ui,sections}/.gitkeep
    layouts/.gitkeep
    lib/{schemas,pricing,email,leads}/.gitkeep
    content/{site,hero,about,menu,packages,testimonials,faq,gallery}/.gitkeep
    pages/index.astro
    styles/global.css
    content.config.ts
  public/{images,fonts}/.gitkeep
  ```
  Phase 2/3 PRs only add files into existing directories — smaller, more reviewable diffs and an explicit map for the AI content agent.
- **D-08:** shadcn/ui initialized in Phase 1 (`pnpm dlx shadcn@latest init` → `components.json`, `src/lib/utils.ts`). Only the **Button** component is installed now (used in hero CTA, package cards, wizard). Card, Accordion, Dialog, Input, Form, Label install in the phases that first need them.

### CI Strictness & Merge Gates
- **D-09:** All FND-05 checks are **required status checks** that block merge to `main`: TypeScript typecheck (`astro check`), Biome lint+format check, content schema validation (Zod via `astro sync`), image-size budget script, and the Playwright smoke stub (asserts `pnpm dev` boots and `/` returns 200). Coverage and bundle-size are advisory only.
- **D-10:** PR titles enforced as Conventional Commits via a CI step (regex against `feat:|fix:|docs:|chore:|refactor:|test:|ci:`). Matches existing repo commit style (`docs:`, `chore:`). Failing PRs surface the rule + an example.
- **D-11:** CODEOWNERS sets a single owner (the project maintainer) for everything in v1. Required-reviewers + required-status-checks satisfy FND-06's branch-protection bar. CODEOWNERS gets refined when more contributors join.
- **D-12:** Husky + lint-staged installed for local pre-commit (Biome format + lint on staged files only — fast feedback for human contributors). CI is the source of truth: AI-agent PRs from environments without Husky still pass once they meet CI standards. No local typecheck on commit (too slow); typecheck runs on push/CI only.

### Deployment & Env Stubbing
- **D-13:** Vercel project connected via `vercel link` and the resulting config committed; the GitHub integration auto-creates a Preview deployment on every PR (FND-07). Production deploys promote from `main` only after all required status checks pass (D-09).
- **D-14:** Astro adapter is `@astrojs/vercel` with `output: 'server'` configured in `astro.config.mjs`. Required so Phase 3's Astro Actions run as serverless functions on Vercel.
- **D-15:** `.env.example` defines every env var name v1 will ever need, with placeholder values: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_SHEETS_CREDENTIALS_JSON`, `GOOGLE_SHEETS_LEAD_SHEET_ID`, `SENTRY_DSN`, `PUBLIC_SITE_URL`. Vercel Preview and Production environments are created in Phase 1 with the placeholder names registered (no real values). Phase 3 fills Resend/Turnstile/Sheets in Preview; Phase 5 supplies Production values + DKIM/SPF/DMARC. Schema separation between Preview and Production is enforced from day one (FND-08).
- **D-16:** Image-size budget enforced by a shell script (`scripts/check-image-budget.sh`) wired into CI. Fails the job if any file in `public/images/` exceeds 600KB (FND-09). No pre-commit version — AI-agent content PRs that don't run local hooks should still bounce at CI before merge.

### Tooling Pins
- **D-17:** `pnpm@9` declared via `packageManager` field in `package.json`; Node `>= 22.12 < 23` declared via `engines`. `.nvmrc` set to 22 LTS. CI uses pnpm action with frozen lockfile (`pnpm install --frozen-lockfile`).

### Claude's Discretion
- Exact CI job orchestration (one workflow vs split workflows; matrix vs serial)
- Specific Conventional Commits regex / PR title check implementation (custom action vs `commitlint`-style script)
- Whether to add `release-please` or similar versioning automation (out of scope for v1; Phase 5 launch may revisit)
- Biome configuration details (rule overrides, formatter options) within the recommended preset
- Astro `vite` config beyond what the integrations require
- Choice of Husky vs `simple-git-hooks` vs `lefthook` for the pre-commit driver — pick the lightest that works
- Exact `.gitkeep` content (empty file vs single-line README explaining the directory's purpose)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack & Architecture
- `.planning/research/STACK.md` — Definitive stack: Astro 6, React 19.2, Tailwind 4.2, shadcn/ui (Tailwind v4 track), TypeScript 5.6+, Node 22 LTS, pnpm 9. Includes alternatives considered and version compatibility matrix.
- `.planning/research/ARCHITECTURE.md` — Recommended source layout, integration points, content-collection patterns.
- `.planning/research/SUMMARY.md` — Cross-cutting research summary; resolution context for the 5 Open Decisions.
- `.planning/research/FEATURES.md` — Feature catalog with phase mapping.
- `.planning/research/PITFALLS.md` — Known traps to avoid (including image-budget rationale, env split rationale, Astro Action output mode).

### Project Constraints
- `.planning/PROJECT.md` — Core value, constraints (markdown-in-repo, no headless CMS; warm palette + heritage typography non-negotiable; single-page scroll), key decisions table.
- `.planning/REQUIREMENTS.md` §Foundation — FND-01 through FND-09 acceptance criteria.
- `.planning/REQUIREMENTS.md` §"Out of Scope" — explicit exclusions to prevent scope creep into Phase 1.
- `.planning/ROADMAP.md` §"Phase 1: Foundation" — goal, requirements list, success criteria, risks addressed (C4, H1, H8).

### State
- `.planning/STATE.md` — Resolved Open Decisions (package tiers 10–20 / 21–30 / 31–75; Google Sheets lead storage; placeholder photography/testimonials; deferred domain to Phase 5).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None** — repo is greenfield. Only `package.json` (with stale `task-master-ai` dep that should be removed during scaffold), `node_modules`, `package-lock.json`, `docs/`, and `.planning/` exist. Phase 1's first concrete task is wiping `package.json` clean and re-initializing as the Astro project root.

### Established Patterns
- **Markdown-in-repo content workflow** (PROJECT.md): all editable content lives as `.md` files with Zod-validated frontmatter. Phase 1 creates the schema contract; Phase 2 authors content against it.
- **GSD planning structure** (`.planning/`): roadmap-driven phases, each with CONTEXT/PLAN/VERIFICATION lifecycle. Phase 1 plans live in `.planning/phases/01-foundation/`.
- **Conventional Commits** in existing git history (`docs:`, `chore:` prefixes) — Phase 1's CI gate (D-10) codifies what's already practiced.

### Integration Points
- **Vercel** (FND-07): GitHub integration creates per-PR preview URLs. Phase 1 connects the project; Phase 2's content PRs and Phase 3's wizard PRs all surface as preview URLs the AI content agent can review before merge.
- **GitHub branch protection** (FND-06): `main` requires the CI status checks defined in D-09 plus CODEOWNERS review. Configured in Phase 1 and never weakened.
- **Astro `output: 'server'` + `@astrojs/vercel`** (D-14): the seam Phase 3's `defineAction` server handlers will plug into.
- **`src/lib/schemas/`** (D-05): the import target shared by `src/content.config.ts` (Phase 1), wizard form validation (Phase 3), Astro Action input validation (Phase 3), and React Email payload typing (Phase 3).

</code_context>

<specifics>
## Specific Ideas

- Two-layer tokens (brand + semantic) means Phase 2 components reference `text-ink` / `bg-surface` / `border-accent`, not raw brand names. If Larrae ever wants a seasonal palette swap, only the semantic mapping changes.
- Custom editorial type scale names (`text-display-xl`, `text-eyebrow`) intentionally echo Sweetgreen-style editorial rhythm without stealing the palette — preserves the warm soul-food feel.
- `.env.example` registers every name v1 will ever need from day one so later-phase PRs only fill values in Vercel; the schema/contract never moves.
- Image-budget script is intentionally CI-only (not pre-commit) because AI-agent content PRs originate from environments without Husky. CI is the universal gate.
- shadcn Button is the only pre-installed component because it appears in every section that ships in Phase 2 (hero CTA, package cards, FAQ jump links) and Phase 3 (wizard steps).

</specifics>

<deferred>
## Deferred Ideas

- **Dark mode tokens** — semantic layer (D-01) makes this trivially addable later, but no v1 requirement asks for it.
- **release-please / semantic versioning automation** — useful when shipping a versioned product; this is a marketing site, deferred indefinitely.
- **PR template + issue templates** — nice polish; can ride along in any later phase that needs them.
- **Storybook / component playground** — meaningful when component count > ~10; revisit in Phase 4 or v2.
- **Additional CODEOWNERS granularity (separate owners for `/content` vs `/src`)** — relevant only when the team grows past one person.
- **Bundle-size budget CI gate** — advisory in v1 (D-09); promote to blocking if Phase 4 CWV work shows real regression risk.
- **Pre-commit typecheck** — too slow for fast feedback; CI handles it.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-15*
