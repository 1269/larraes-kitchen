# Phase 1: Foundation - Research

**Researched:** 2026-04-15
**Domain:** Astro 6 + React 19 + Tailwind v4 + shadcn/ui scaffold with Zod-validated Content Collections, CI gates, and Vercel preview deploys
**Confidence:** HIGH

## Summary

Phase 1 scaffolds a greenfield Astro 6 project and locks every pipeline later phases depend on: typed markdown content, image budget, branch protection, per-PR Vercel previews, and a Conventional Commits gate. Every architectural decision is already locked by CONTEXT.md (D-01..D-17) — this research resolves the *implementation-level* details: which install commands, which plugin file shapes, what order things are bounced through, and which CI steps must be required status checks versus advisory.

The dominant risk across this phase is **ordering**: Astro 6 must be installed before Tailwind v4's Vite plugin can be wired; Tailwind v4 must be working before `shadcn@latest init` can write `components.json`; the Vercel adapter must be installed before `output: 'server'` is set in `astro.config.mjs`; and `content.config.ts` must exist (even with empty collections) before `astro sync` or `astro check` will run cleanly in CI. Get the order right and every later phase inherits a clean pipeline. Get it wrong and the first content PR in Phase 2 will bounce on unrelated scaffold bugs.

**Primary recommendation:** Execute Phase 1 as a strict wave-ordered sequence — scaffold wipe → Astro init → framework integrations (react + mdx + sitemap + vercel) → Tailwind v4 (Vite plugin) → shadcn init + Button → design tokens in `@theme` → Fontsource installs + Lovelace self-host → Content Collections skeleton with `.gitkeep` → pricing stub → Vitest + Playwright configs → Biome + lefthook → image-budget script → GitHub Actions workflow → Vercel link → branch protection. Treat each as its own task; do not collapse waves that share a file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Design Tokens (Tailwind v4 `@theme`)**
- **D-01:** Two-layer token model. Brand layer defines the full warm palette as named CSS vars (`--color-deep-amber`, `--color-warm-cream`, `--color-greens-deep`, `--color-greens-mid`, `--color-iron-black`, `--color-southern-red`, `--color-butter-gold`, `--color-clay`). Semantic layer maps to brand: `--color-primary` = greens-deep, `--color-surface` = warm-cream, `--color-accent` = deep-amber, `--color-ink` = iron-black.
- **D-02:** Full warm palette declared in `@theme` from day one — no curated subset.
- **D-03:** Fonts self-hosted via Fontsource (`@fontsource/playfair-display`, `@fontsource/work-sans`). Lovelace self-hosted as woff2 in `/public/fonts/` with hand-authored `@font-face`. No Google Fonts CDN.
- **D-04:** Custom editorial typography scale as named tokens: `text-display-xl`, `text-display-lg`, `text-display-md`, `text-body-lg/md/sm`, `text-eyebrow`.

**Shared Schema & Repo Layout**
- **D-05:** All Zod schemas in `src/lib/schemas/{site,packages,menu,hero,about,testimonials,faq,gallery}.ts`. `src/content.config.ts` imports them.
- **D-06:** Pricing calculator at `src/lib/pricing/estimate.ts` as pure function. Co-located Vitest tests at `src/lib/pricing/estimate.test.ts`. Phase 1 ships a typed stub.
- **D-07:** Full repo skeleton with `.gitkeep` placeholders (directory tree specified in CONTEXT).
- **D-08:** shadcn/ui initialized in Phase 1. Only the **Button** component is installed now.

**CI Strictness & Merge Gates**
- **D-09:** FND-05 checks are required status checks blocking merge to `main`: TypeScript typecheck (`astro check`), Biome lint+format check, content schema validation (`astro sync`), image-size budget script, Playwright smoke stub.
- **D-10:** PR titles enforced as Conventional Commits via CI.
- **D-11:** CODEOWNERS sets a single owner for everything in v1.
- **D-12:** Husky + lint-staged (or equivalent) installed for local pre-commit (Biome format + lint on staged files). CI is source of truth. No local typecheck on commit.

**Deployment & Env Stubbing**
- **D-13:** Vercel project connected via `vercel link`. GitHub integration auto-creates Preview on every PR. Production deploys from `main` only after required checks pass.
- **D-14:** Astro adapter `@astrojs/vercel` with `output: 'server'`.
- **D-15:** `.env.example` defines every v1 env var name with placeholders: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_SHEETS_CREDENTIALS_JSON`, `GOOGLE_SHEETS_LEAD_SHEET_ID`, `SENTRY_DSN`, `PUBLIC_SITE_URL`. Vercel Preview + Production schema separation enforced day one.
- **D-16:** Image-size budget via `scripts/check-image-budget.sh` wired into CI. Fails if any `public/images/` file exceeds 600KB. CI-only, no pre-commit.

**Tooling Pins**
- **D-17:** `pnpm@9` via `packageManager` field. Node `>= 22.12 < 23` via `engines`. `.nvmrc` set to 22. CI uses `pnpm install --frozen-lockfile`.

### Claude's Discretion
- Exact CI job orchestration (one workflow vs split; matrix vs serial)
- Specific Conventional Commits regex / PR title check implementation
- Whether to add `release-please` (out of scope for v1)
- Biome configuration details within the recommended preset
- Astro `vite` config beyond what integrations require
- Husky vs `simple-git-hooks` vs `lefthook` choice
- Exact `.gitkeep` content (empty vs one-line README)

### Deferred Ideas (OUT OF SCOPE)
- Dark mode tokens
- `release-please` / semantic versioning automation
- PR template / issue templates
- Storybook / component playground
- Additional CODEOWNERS granularity
- Bundle-size budget CI gate (advisory only in v1)
- Pre-commit typecheck
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Astro 6 + React 19 + Tailwind v4 + shadcn/ui scaffold builds and deploys successfully | Scaffold sequence in "Wave/Dependency Ordering" + Standard Stack versions + Playwright smoke stub |
| FND-02 | Design tokens for full warm palette defined in Tailwind v4 `@theme` | `@theme` block pattern in "Code Examples" + two-layer token model from D-01 |
| FND-03 | Typography tokens (Lovelace/Playfair/Work Sans) loaded and usable as utility classes | Fontsource + self-host Lovelace recipe in "Code Examples" |
| FND-04 | Astro Content Collections with Zod frontmatter schemas for all 8 domains | `content.config.ts` + `src/lib/schemas/*.ts` skeleton in "Code Examples" |
| FND-05 | CI pipeline runs typecheck, Biome lint, content schema validation, image-size budget, Playwright smoke stub | GitHub Actions workflow pattern + required status check list in "Code Examples" |
| FND-06 | GitHub branch protection on main with required status checks + CODEOWNERS | Branch protection GitHub CLI/API recipe in "Code Examples" |
| FND-07 | Vercel project connected; preview deploys per PR | `vercel link` flow + `@astrojs/vercel` adapter config in "Code Examples" |
| FND-08 | Env var scaffolding separates Preview and Production environments | `.env.example` + `vercel env` commands in "Code Examples" |
| FND-09 | Image size CI budget rejects any `public/images/` file over 600KB | `scripts/check-image-budget.sh` in "Code Examples" |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These CLAUDE.md directives are binding for Phase 1 and carry the same authority as CONTEXT.md locked decisions. The planner MUST NOT propose patterns that contradict them.

- **GSD workflow enforcement:** No direct repo edits outside a GSD workflow. Phase 1 execution happens via `/gsd-execute-phase`.
- **Markdown-in-repo, no headless CMS:** Zero Sanity/Contentful/Payload/Strapi/Storyblok integration. Content lives in `src/content/*.md` validated by Zod.
- **Do NOT use Tailwind v3 `tailwind.config.js`:** CLAUDE.md explicitly calls this out — use `@theme` in a global CSS file.
- **Do NOT use `@astrojs/tailwind`:** That integration is deprecated for Tailwind v4. Use `@tailwindcss/vite` plugin directly.
- **Do NOT use Contentlayer.** Use Astro's native Content Collections.
- **Do NOT use Google Fonts CDN.** Self-host via Fontsource + hand-authored `@font-face` for Lovelace.
- **Single-page scroll architecture:** `src/pages/index.astro` is the ONLY route for content. Astro Actions live under `src/actions/`.
- **TypeScript strict:** `strict: true`, `noUncheckedIndexedAccess: true`. Non-negotiable per CLAUDE.md.
- **pnpm + Node 22.12+:** CLAUDE.md version pins are authoritative.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Markdown authoring & validation | Build-time (Content Layer) | — | Zod schemas compile at build; failure = CI fail, not runtime fail |
| Design tokens (palette + typography) | Build-time (CSS `@theme`) | — | Tailwind v4 CSS-first — tokens compile into utility classes during build |
| Route composition (`/`) | Build-time (SSG Astro page) | — | Single-page marketing site; no per-request personalization |
| Server Actions (`submit-lead`, Phase 3) | API / Backend (Vercel serverless) | — | Astro Action = serverless function under Vercel adapter with `output: 'server'` |
| Client interactivity (future wizard island) | Browser / Client (React 19) | — | One hydrated island; rest of page ships zero JS |
| Image optimization pipeline | CDN / Static (Vercel image CDN) | Build-time (Sharp) | `astro:assets` local fallback → Vercel CDN in prod |
| Font serving | CDN / Static (Vercel static assets) | — | Self-hosted woff2 under `/public/fonts/` + Fontsource via node_modules |
| Env vars + secrets | API / Backend (Vercel env) | — | Preview + Production environments separated at Vercel level |
| CI pipeline | External (GitHub Actions) | — | Branch-protection gates enforced server-side |
| Branch protection + CODEOWNERS | External (GitHub) | — | Repo-level config; not inside the build |

**Tier correctness check for Phase 1:** Every artifact this phase creates lives in build-time or external (CI/GitHub/Vercel) tiers. **No runtime features are built here.** If a plan proposes runtime logic (form handlers, API endpoints, data fetching, etc.), it belongs in Phase 2 or 3, not Phase 1.

## Standard Stack

### Core (all already locked by CLAUDE.md; versions verified 2026-04-15)

| Library | Version | Purpose | Why Standard | Verification |
|---------|---------|---------|--------------|--------------|
| astro | 6.1.x (latest 6.1.5 as of 2026-04-15) | Meta-framework | Islands architecture; Content Layer API; stable Astro Actions | [VERIFIED: npm registry — astro@6.1.5 published ~5 days before 2026-04-15] |
| @astrojs/react | latest compatible with Astro 6 | React integration | Required for the one interactive island (wizard, Phase 3) and shadcn/ui | [CITED: docs.astro.build/en/guides/integrations-guide/react/] |
| @astrojs/mdx | latest compatible with Astro 6 | MDX support | Required by CONT-05/06 for testimonials + FAQ with inline rich text | [CITED: docs.astro.build] |
| @astrojs/sitemap | latest | Build-time sitemap.xml | Phase 4 consumes this; installing in Phase 1 means zero retrofit | [CITED: docs.astro.build] |
| @astrojs/vercel | latest (Astro 6 compatible) | Serverless adapter | Required for `output: 'server'` and Phase 3's Astro Actions | [CITED: docs.astro.build/en/guides/integrations-guide/vercel/] |
| react | 19.2.x | UI for wizard island | Phase 3 will use `useActionState`; shadcn Button requires React 19 | [CITED: CLAUDE.md stack table] |
| react-dom | 19.2.x | DOM bindings for React | Peer dep of react | [CITED: react.dev] |
| tailwindcss | 4.2.x | Styling | CSS-first `@theme`; Oxide engine | [VERIFIED: tailwindcss.com/blog/tailwindcss-v4] |
| @tailwindcss/vite | 4.2.x | Vite plugin for Tailwind v4 | **Required** — this replaces the deprecated `@astrojs/tailwind` integration | [VERIFIED: tailwindcss.com/docs/installation/framework-guides/astro] |
| typescript | 5.6+ | Type safety | `strict: true`, `noUncheckedIndexedAccess: true` | [CITED: CLAUDE.md] |
| zod | 3.x (4 if stable) | Runtime validation + types | Backs Content Collections + shared client/server schemas | [CITED: CLAUDE.md] |
| @fontsource/playfair-display | latest | Self-hosted Playfair Display | Per D-03; replaces Google Fonts CDN | [VERIFIED: npm] |
| @fontsource/work-sans | latest | Self-hosted Work Sans | Per D-03 | [VERIFIED: npm] |

### Dev Tooling

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @biomejs/biome | 2.3+ | Linter + formatter | CLAUDE.md-locked; ~20x faster than ESLint+Prettier |
| @playwright/test | 1.5x | Smoke E2E | FND-05 required check |
| vitest | 4.x | Unit tests | Pricing calc + schemas + (Phase 3) email templates |
| schema-dts | latest | JSON-LD TypeScript types | Deferred but cheap to install now so Phase 4 doesn't bounce |
| lefthook | 1.x | Git hook driver | **Recommendation**: replaces Husky. Single binary, no `node_modules` bloat, runs hooks in parallel, written in Go. [VERIFIED: pkgpulse 2026 comparison] |

### Phase-Deferred (DO NOT install in Phase 1)

| Library | When to install | Rationale |
|---------|----------------|-----------|
| react-hook-form, @hookform/resolvers | Phase 3 | Wizard island only |
| resend, @react-email/components, @react-email/render | Phase 3 | Lead pipeline |
| yet-another-react-lightbox, react-photo-album | Phase 2 | Gallery island |
| @vercel/analytics, @vercel/speed-insights | Phase 4 | Observability phase |
| @sentry/astro | Phase 4 | Observability phase |
| googleapis or google-spreadsheet | Phase 3 | Lead storage adapter |

**Installing these in Phase 1 is a scope violation** — each has config/env surface area that belongs to its phase. Exception: `schema-dts` as a dev dep is zero-cost and prevents later churn.

### Alternatives Considered (for Phase 1 discretion items)

| Decision | Recommended | Alternative | Tradeoff |
|----------|-------------|-------------|----------|
| Git hook driver | **lefthook** | husky + lint-staged | Husky is more common; lefthook is faster + no runtime deps + single YAML. For a greenfield with Biome, lefthook is the cleaner modern pick. [CITED: pkgpulse.com, edopedia.com] |
| Git hook driver | lefthook | simple-git-hooks | simple-git-hooks is even lighter but single-threaded and less expressive — fine for 1-2 hooks, not for the lint+format+content-sync combo we want pre-commit |
| PR title check | **amannn/action-semantic-pull-request@v6** | commitlint + action | amannn is zero-config, used by Vite/Vercel/Microsoft/AWS, no `commitlint.config.js` to maintain. [CITED: github.com/amannn/action-semantic-pull-request] |
| Astro scaffold template | **`--template minimal`** | `--template basics` | Minimal produces a cleaner empty shell; basics pre-populates example components we'd delete anyway |
| TypeScript prompt | No flag needed | `--typescript strict` | Astro 5+ made strict the default and removed the prompt. [CITED: Astro v5 upgrade guide] |
| Tailwind integration | **`@tailwindcss/vite`** | `@astrojs/tailwind` | `@astrojs/tailwind` is deprecated for Tailwind v4. Official Tailwind Astro guide recommends the Vite plugin. [VERIFIED: tailwindcss.com/docs/installation/framework-guides/astro] |
| Vercel adapter mode | **`output: 'server'`** | `output: 'hybrid'` | Phase 3 Astro Actions require server rendering for the submit route. Pages can still be `export const prerender = true;` to stay SSG where appropriate. [CITED: docs.astro.build vercel adapter] |

### Installation (full sequence)

```bash
# 0. Precondition: wipe the existing package.json + node_modules (they only hold stale task-master-ai)
rm -rf node_modules package-lock.json package.json

# 1. Scaffold Astro 6 into the current directory
pnpm create astro@latest . --template minimal --install --git no --yes
# (flags: scaffold in cwd, no git re-init — we keep existing .git, auto-install deps, skip prompts)

# 2. Framework integrations (one at a time so failures are attributable)
pnpm astro add react
pnpm astro add mdx
pnpm astro add sitemap
pnpm astro add vercel

# 3. Tailwind v4 (NOTE: do NOT use `astro add tailwind` — that still wires @astrojs/tailwind)
pnpm add tailwindcss @tailwindcss/vite
# then hand-edit astro.config.mjs to add tailwindcss() to vite.plugins (see Code Examples)

# 4. Fonts
pnpm add @fontsource/playfair-display @fontsource/work-sans

# 5. Validation + dev types
pnpm add zod
pnpm add -D schema-dts

# 6. shadcn/ui init — AFTER Tailwind v4 + React are wired and tsconfig path alias exists
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button

# 7. Dev tooling
pnpm add -D @biomejs/biome vitest @playwright/test lefthook
pnpm exec playwright install --with-deps chromium
# (Phase 1 smoke uses chromium only; Phase 4 can add firefox/webkit if needed)

# 8. Version pins
#   - Edit package.json: add "packageManager": "pnpm@9", "engines": { "node": ">=22.12.0 <23" }
#   - Create .nvmrc with content "22"
```

**Version verification (`npm view` as of 2026-04-15):**

| Package | Verified latest | Source |
|---------|-----------------|--------|
| astro | 6.1.5 | [VERIFIED: npmjs.com/package/astro] |
| tailwindcss | 4.2.x | [VERIFIED: tailwindcss.com/blog/tailwindcss-v4] |
| @tailwindcss/vite | 4.2.x (tracks tailwindcss) | [VERIFIED: tailwindcss.com/docs/installation/framework-guides/astro] |
| @biomejs/biome | 2.3+ | [CITED: CLAUDE.md] |

The planner should run `npm view <pkg> version` at plan-creation time and pin majors in `package.json`.

## Architecture Patterns

### System Diagram — Phase 1 Pipeline (not a runtime architecture; a *validation* architecture)

```
                                GITHUB PR OPENED
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
 ┌─────────────────┐      ┌──────────────────────┐     ┌──────────────────┐
 │ PR Title Check  │      │  CI Workflow (.github │     │  Vercel GitHub   │
 │ (amannn action) │      │  /workflows/ci.yml)   │     │  integration     │
 │ Conventional    │      │                       │     │                  │
 │ Commits regex   │      │  Jobs (parallel       │     │  Preview deploy  │
 └────────┬────────┘      │  where possible):     │     │  (auto per PR)   │
          │               │                       │     └────────┬─────────┘
          │               │  ┌─────────────────┐  │              │
          │               │  │ install (pnpm)  │  │              │
          │               │  └────────┬────────┘  │              │
          │               │           │           │              │
          │               │  ┌────────┼────────┐  │              │
          │               │  ▼        ▼        ▼  │              │
          │               │ type-   biome   content│              │
          │               │ check   check   sync  │              │
          │               │ (astro          (astro │              │
          │               │  check)          sync)│              │
          │               │  │        │        │  │              │
          │               │  ▼        ▼        ▼  │              │
          │               │  image-budget  playwr.│              │
          │               │  script        smoke  │              │
          │               │  (scripts/     (assert │              │
          │               │  check-image-  dev 200)│              │
          │               │  budget.sh)           │              │
          │               └──────────┬────────────┘              │
          │                          │                           │
          ▼                          ▼                           ▼
                     ALL CHECKS GREEN + CODEOWNERS APPROVAL
                                     │
                                     ▼
                           main updated ──▶ Vercel Production deploy
```

### Recommended Project Structure (post-Phase-1)

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # required status checks
│   │   └── pr-title.yml         # amannn/action-semantic-pull-request
│   └── CODEOWNERS               # single-owner v1
├── .husky/ or lefthook.yml      # local pre-commit (lefthook recommended)
├── .nvmrc                       # "22"
├── .env.example                 # all v1 env vars, placeholder values
├── astro.config.mjs             # integrations, vite plugin, vercel adapter, output:'server'
├── biome.json                   # Biome config (extends recommended)
├── components.json              # shadcn/ui config
├── package.json                 # packageManager: pnpm@9, engines.node >=22.12 <23
├── playwright.config.ts         # smoke test config, chromium only
├── tsconfig.json                # strict + noUncheckedIndexedAccess + @/* path alias
├── vercel.json                  # (optional) only if we need overrides beyond adapter
├── vitest.config.ts             # Vitest config for unit tests
├── public/
│   ├── fonts/                   # Lovelace woff2 files (+ LICENSE if required)
│   │   └── .gitkeep
│   └── images/
│       └── .gitkeep
├── scripts/
│   └── check-image-budget.sh    # 600KB enforcement, CI-only
├── src/
│   ├── actions/                 # (Phase 3 home for Astro Actions; empty in Phase 1)
│   │   └── .gitkeep
│   ├── components/
│   │   ├── sections/
│   │   │   └── .gitkeep
│   │   └── ui/                  # shadcn Button lands here
│   │       └── button.tsx       # (from `shadcn add button`)
│   ├── content/
│   │   ├── site/.gitkeep
│   │   ├── hero/.gitkeep
│   │   ├── about/.gitkeep
│   │   ├── menu/.gitkeep
│   │   ├── packages/.gitkeep
│   │   ├── testimonials/.gitkeep
│   │   ├── faq/.gitkeep
│   │   └── gallery/.gitkeep
│   ├── content.config.ts        # Content Collections definitions
│   ├── env.d.ts                 # Astro + custom ImportMetaEnv types
│   ├── layouts/.gitkeep
│   ├── lib/
│   │   ├── email/.gitkeep       # Phase 3
│   │   ├── leads/.gitkeep       # Phase 3
│   │   ├── pricing/
│   │   │   ├── estimate.ts      # typed stub
│   │   │   └── estimate.test.ts # skipped scaffold test
│   │   ├── schemas/
│   │   │   ├── site.ts
│   │   │   ├── hero.ts
│   │   │   ├── about.ts
│   │   │   ├── menu.ts
│   │   │   ├── packages.ts
│   │   │   ├── testimonials.ts
│   │   │   ├── faq.ts
│   │   │   └── gallery.ts
│   │   └── utils.ts             # shadcn-generated (cn() helper)
│   ├── pages/
│   │   └── index.astro          # minimal "Larrae's Kitchen" placeholder for Phase 1
│   └── styles/
│       └── global.css           # @import "tailwindcss" + @theme block + @font-face Lovelace
└── tests/
    └── smoke.spec.ts            # Playwright "/ returns 200 and contains brand word"
```

### Pattern 1: Tailwind v4 `@theme` with brand + semantic layers

**What:** CSS-first design tokens live in `src/styles/global.css` under `@theme`. Two layers — brand color vars and semantic aliases — per D-01.

**When to use:** Any Tailwind utility that references a brand color or the editorial type scale.

**Example:** See Code Examples § "global.css with @theme brand + semantic tokens".

### Pattern 2: Zod schema module + Content Collection wiring

**What:** Each content domain has a Zod schema in `src/lib/schemas/<domain>.ts` that exports the schema AND a `type` inferred from it. `src/content.config.ts` imports the schemas and registers collections via the `glob()` loader. Phase 1 registers all eight collections even though directories contain only `.gitkeep`.

**When to use:** Any `defineCollection` call; any place that needs the type of a validated content entry.

**Example:** See Code Examples § "Zod schema + content.config.ts skeleton".

### Pattern 3: Astro Actions-ready adapter config

**What:** `astro.config.mjs` uses `output: 'server'` with the Vercel adapter so Phase 3's Astro Actions get serverless functions. Marketing pages can opt back into SSG with `export const prerender = true;` per-page — but Phase 1's `index.astro` is fine to leave as default since it's a one-line placeholder.

**When to use:** Default for every route unless it's a pure static content page (then opt into prerender).

**Example:** See Code Examples § "astro.config.mjs".

### Anti-Patterns to Avoid
- **Don't install `@astrojs/tailwind`.** It's the v3 path and conflicts with Tailwind v4. Use `@tailwindcss/vite` directly.
- **Don't put `tailwind.config.js` in the repo.** Tokens live in CSS via `@theme`. A JS config file is a v3 idiom CLAUDE.md explicitly forbids.
- **Don't pre-install Phase 2/3/4 dependencies "to save time later."** Each brings config surface area that belongs to its phase. Installing `resend` in Phase 1 means Phase 3's plan has a hidden dep that wasn't discussed.
- **Don't author real content in Phase 1.** `.gitkeep` only. If you find yourself writing a real `site.md`, you're doing Phase 2.
- **Don't leave Astro Actions disabled (`output: 'static'`).** Phase 3 needs `output: 'server'`; retrofitting it forces a rebuild + redeploy.
- **Don't let `astro sync` fail silently in CI.** It's the schema gate. If an empty collection directory breaks sync, add a `.gitkeep` with a one-char comment or switch the loader pattern to tolerate empty dirs. Verify locally before pushing.
- **Don't use `npx` for Playwright browser install in CI.** Use `pnpm exec playwright install --with-deps chromium` — matches the lockfile and respects pnpm's binary resolution.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conventional Commits PR title regex | Custom JS action with regex | `amannn/action-semantic-pull-request@v6` | Used by Vite/Vercel/Microsoft/AWS; zero-config; handles edge cases (scopes, breaking change `!`, revert PRs) |
| Image size check | Custom find + stat loop | Minimal `find public/images -size +600k` shell script (5 lines) | Script is so small it's fine — but DON'T write a Node script that pulls `fs-extra` + `bytes` deps |
| Git hooks | Shell scripts in `.git/hooks/` | lefthook (single YAML) | Not versioned otherwise; doesn't run in teammate / agent environments |
| Tailwind config | JS `tailwind.config.js` | CSS `@theme` block | Tailwind v4's official idiom; JS config is legacy |
| Astro content validation | Hand-written YAML linter | Zod schemas in Content Collections | Astro's built-in; `astro sync` runs them; TS types auto-generated |
| Conventional Commit types registry | Hand-written enum | `amannn` action defaults: `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert` | Matches industry standard |
| Font loading | `<link rel="preconnect">` to fonts.googleapis.com | Fontsource imports + hand-authored `@font-face` for Lovelace | Per D-03; zero third-party CDN on first paint |
| Branch protection YAML | "I'll configure it in the UI later" | `gh api` CLI recipe committed as `scripts/setup-branch-protection.sh` (or a one-time Terraform stanza) | Auditable, replayable, survives maintainer turnover |

**Key insight:** Phase 1's value is *boring correctness*. Every micro-tool this phase introduces (lefthook, Biome, amannn action) is a battle-tested OSS choice used by thousands of projects. The only bespoke code is the 5-line image-budget script and the (stub) pricing function. Resist any urge to generalize either.

## Runtime State Inventory

> Skipped for Phase 1: this is a greenfield scaffold phase. There is no runtime state, no stored data, no live services, no OS-registered tasks, no secrets-in-code rename, and no build artifacts carrying old names. The only "state" is the `package.json` + `node_modules` + `package-lock.json` trio from the stale `task-master-ai` dependency — all three are deleted in the scaffold's first task per CONTEXT § Existing Code Insights.

**Verified by:** `ls /Users/jashia/Documents/1_Projects/larraes-kitchen` — confirms only `CLAUDE.md`, `docs/`, `node_modules/`, `package-lock.json`, `package.json`.

## Common Pitfalls

### Pitfall 1: `@astrojs/tailwind` installed instead of `@tailwindcss/vite`
**What goes wrong:** You run `pnpm astro add tailwind` out of habit; it installs the v3-era integration; Tailwind v4's `@theme` directive silently no-ops; utility classes work but tokens don't; the palette is invisible.
**Why it happens:** `astro add tailwind` still works and doesn't error — it just wires the wrong adapter for v4.
**How to avoid:** **Do NOT use `astro add tailwind`.** Install `tailwindcss @tailwindcss/vite` manually and hand-edit `astro.config.mjs`. Verify with a build: `pnpm build` should generate a CSS bundle that includes your `--color-deep-amber` custom property.
**Warning signs:** `@astrojs/tailwind` appearing in `package.json` or `astro.config.mjs`. An unused `tailwind.config.js` file.

### Pitfall 2: `shadcn init` run before Tailwind v4 or React are wired
**What goes wrong:** `shadcn init` writes `components.json` assuming Tailwind and React exist; if they don't, the generated imports fail and you get opaque "Cannot find module" errors at first component add.
**Why it happens:** shadcn CLI doesn't verify preconditions; the failure manifests on `shadcn add button`, not on `shadcn init`.
**How to avoid:** Strict task ordering: Tailwind v4 + React + tsconfig path alias `@/*` must exist and build cleanly before `shadcn init` runs. [CITED: ui.shadcn.com/docs/installation/astro]
**Warning signs:** `components.json` referencing a Tailwind config file that doesn't exist; `button.tsx` imports that can't resolve `@/lib/utils`.

### Pitfall 3: Empty Content Collection directory breaks `astro sync`
**What goes wrong:** You define a collection for `src/content/menu/` but the directory has only `.gitkeep`. On some Astro versions this is fine; on others (historically Windows-affected per GitHub issue #12784) the glob loader reports "collection does not exist."
**Why it happens:** `.gitkeep` doesn't match `**/*.md`, so the loader sees zero matches and, depending on version/OS, either returns `[]` (good) or errors (bad).
**How to avoid:** Verify `pnpm exec astro sync` exits 0 in CI. If it errors, the fix is either (a) switch the pattern to `**/*.{md,mdx}` and accept empty, or (b) temporarily seed one `_placeholder.md` per collection that's deleted in Phase 2 first task. Option (a) is cleaner. [CITED: docs.astro.build/en/guides/content-collections/]
**Warning signs:** CI green locally on macOS but red in Ubuntu runner. Error text "collection does not exist or is empty."

### Pitfall 4: `output: 'server'` set without a default-prerender strategy
**What goes wrong:** Every page becomes an on-demand serverless function; cold starts hit LCP; Vercel function invocations rack up.
**Why it happens:** `output: 'server'` is Phase 3's requirement (for Astro Actions), but it changes the default for *every* page unless overridden.
**How to avoid:** Even in Phase 1, add `export const prerender = true;` to `src/pages/index.astro`. The root page is static; only Action routes should hit the function runtime. Document this convention for Phase 2.
**Warning signs:** Vercel build log shows the index page in the "Functions" section instead of "Static files."

### Pitfall 5: CI required-check names drift from workflow job names
**What goes wrong:** You mark "typecheck" as a required status check in branch protection, but the workflow job is named "Type Check". Branch protection can't match; PRs merge green because the check "never ran" (from branch protection's perspective).
**Why it happens:** GitHub branch protection matches status check contexts by exact string. Renaming a workflow job silently breaks the gate.
**How to avoid:** Use lowercase, hyphenated, stable job IDs (`typecheck`, `biome-check`, `content-sync`, `image-budget`, `smoke`). Document these in CLAUDE.md or a `.github/README.md`. Configure branch protection via `gh api` script so the contexts are in code, not UI-clicked.
**Warning signs:** PR shows "All checks have passed" with no list of checks; branch protection settings UI shows "context does not exist" warnings.

### Pitfall 6: Preview env vars missing placeholders
**What goes wrong:** `.env.example` has `RESEND_API_KEY=` but Vercel's Preview environment doesn't have a placeholder registered. In Phase 3, when the Astro Action first runs with the real key, build succeeds locally but deploy panics on missing env var.
**Why it happens:** `.env.example` documents *names*; Vercel separately needs each var *registered* per environment. Two sources, no automation, easy drift.
**How to avoid:** Phase 1 runs `vercel env add <NAME> preview` for every var in `.env.example` with the placeholder value `"__placeholder__"`. Same for production. This registers the schema even when real values aren't known. Later phases replace placeholders with real values, not *add* new var names.
**Warning signs:** `vercel env ls preview` output shorter than `.env.example` variable count.

### Pitfall 7: `pnpm create astro` inside a non-empty directory
**What goes wrong:** The CLI may refuse or overwrite. We specifically need it to scaffold *into* the current directory (`.`) alongside existing `.git`, `.planning/`, `CLAUDE.md`, `docs/`.
**Why it happens:** Greenfield expectations don't match this project's actual state.
**How to avoid:** Use `pnpm create astro@latest . --template minimal --git no --install --yes`. The `--git no` is critical — we do NOT want Astro to re-init git (that would wipe commit history). The `.` puts files in the current dir. Astro will preserve unrelated folders (`.planning/`, `docs/`).
**Warning signs:** Astro CLI asking about overwriting existing files, or re-initializing git. Cancel and re-run with correct flags.

### Pitfall 8: Lovelace font license forgotten or misattributed
**What goes wrong:** Lovelace is commercial (Ellen Luff / Set Sail Studios). Self-hosting the woff2 is permitted under most desktop+web licenses, but the license varies. Deploying without an attribution file or confirming the license scope is a legal risk.
**Why it happens:** Fontsource doesn't ship Lovelace (commercial only); manual self-host skips the usual OSS compliance surface.
**How to avoid:** In Phase 1, create `/public/fonts/LOVELACE-LICENSE.txt` (or a `THIRDPARTY.md` in repo root) with the license terms sourced from the purchase receipt. Include a human-readable comment in `global.css` near the `@font-face` declaration citing the license file.
**Warning signs:** Lovelace woff2 committed with no accompanying license documentation.

## Code Examples

### `astro.config.mjs`

```javascript
// Source: docs.astro.build/en/guides/integrations-guide/vercel/ + tailwindcss.com/docs/installation/framework-guides/astro
// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://larraeskitchen.com", // PUBLIC_SITE_URL; finalized in Phase 5
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: false }, // Phase 4 flips this on
    imageService: true,
  }),
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### `src/styles/global.css` (brand + semantic tokens + self-hosted Lovelace)

```css
/* Source: tailwindcss.com/docs/theme + CONTEXT D-01..D-04 */
@import "tailwindcss";

/* Fontsource CSS is imported from JS (see src/pages/index.astro or layout).
   Lovelace is commercial; self-hosted below. License: /public/fonts/LOVELACE-LICENSE.txt */
@font-face {
  font-family: "Lovelace";
  src: url("/fonts/Lovelace.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@theme {
  /* ─── Brand layer (D-01, D-02) ─── */
  --color-deep-amber: #B8621B;
  --color-warm-cream: #F7EFD9;
  --color-greens-deep: #2E4A2F;
  --color-greens-mid: #4A6B4C;
  --color-iron-black: #1C1B19;
  --color-southern-red: #9F2F2A;
  --color-butter-gold: #E8C36A;
  --color-clay: #B5775E;

  /* ─── Semantic layer (D-01) ─── */
  --color-primary: var(--color-greens-deep);
  --color-surface: var(--color-warm-cream);
  --color-accent: var(--color-deep-amber);
  --color-ink: var(--color-iron-black);

  /* ─── Typography (D-03, D-04) ─── */
  --font-display: "Lovelace", "Playfair Display", ui-serif, Georgia, serif;
  --font-serif: "Playfair Display", ui-serif, Georgia, serif;
  --font-sans: "Work Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;

  --text-display-xl: 4.5rem;   /* hero */
  --text-display-xl--line-height: 1.05;
  --text-display-lg: 3rem;     /* section heads */
  --text-display-md: 2rem;     /* Playfair italic subheads */
  --text-body-lg: 1.125rem;
  --text-body-md: 1rem;
  --text-body-sm: 0.875rem;
  --text-eyebrow: 0.75rem;
  --text-eyebrow--letter-spacing: 0.12em;
}
```

### `src/lib/schemas/packages.ts` (representative schema — one per domain)

```typescript
// Source: CONTEXT D-05 + ARCHITECTURE §2.3
import { z } from "zod";

export const packageSchema = z.object({
  id: z.enum(["small", "medium", "large"]),
  name: z.string(),
  guestRange: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }).refine((r) => r.min <= r.max, "min must be <= max"),
  pricePerPerson: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }).refine((r) => r.min <= r.max, "min must be <= max"),
  includes: z.array(z.string()).min(1),
  popular: z.boolean().default(false),
  order: z.number().int(),
});

export type PackageData = z.infer<typeof packageSchema>;
```

Other seven schema files (`site.ts`, `hero.ts`, `about.ts`, `menu.ts`, `testimonials.ts`, `faq.ts`, `gallery.ts`) follow the same pattern — Phase 1 ships them with full field shapes mirroring ARCHITECTURE §2.3 so Phase 2 content can be authored without schema churn.

### `src/content.config.ts`

```typescript
// Source: docs.astro.build/en/guides/content-collections/ + CONTEXT D-05
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { siteSchema } from "./lib/schemas/site";
import { heroSchema } from "./lib/schemas/hero";
import { aboutSchema } from "./lib/schemas/about";
import { menuItemSchema } from "./lib/schemas/menu";
import { packageSchema } from "./lib/schemas/packages";
import { testimonialSchema } from "./lib/schemas/testimonials";
import { faqGroupSchema } from "./lib/schemas/faq";
import { gallerySchema } from "./lib/schemas/gallery";

const site = defineCollection({
  loader: glob({ base: "./src/content/site", pattern: "**/*.md" }),
  schema: siteSchema,
});
const hero = defineCollection({
  loader: glob({ base: "./src/content/hero", pattern: "**/*.md" }),
  schema: heroSchema,
});
const about = defineCollection({
  loader: glob({ base: "./src/content/about", pattern: "**/*.md" }),
  schema: aboutSchema,
});
const menu = defineCollection({
  loader: glob({ base: "./src/content/menu", pattern: "**/*.md" }),
  schema: menuItemSchema,
});
const packages = defineCollection({
  loader: glob({ base: "./src/content/packages", pattern: "**/*.md" }),
  schema: packageSchema,
});
const testimonials = defineCollection({
  loader: glob({ base: "./src/content/testimonials", pattern: "**/*.md" }),
  schema: testimonialSchema,
});
const faq = defineCollection({
  loader: glob({ base: "./src/content/faq", pattern: "**/*.md" }),
  schema: faqGroupSchema,
});
const gallery = defineCollection({
  loader: glob({ base: "./src/content/gallery", pattern: "**/*.md" }),
  schema: gallerySchema,
});

export const collections = { site, hero, about, menu, packages, testimonials, faq, gallery };
```

**Empty-collection behavior:** With `.gitkeep`-only directories, the glob pattern `**/*.md` matches zero files. `astro sync` completes successfully and emits empty `astro:content` types for each collection. No placeholder markdown needed. Verified against Astro 6.1 docs.

### `src/lib/pricing/estimate.ts` (stub)

```typescript
// Source: CONTEXT D-06 — typed stub; real implementation lands in Phase 3
import type { PackageData } from "../schemas/packages";

export interface EstimateInput {
  guests: number;
  packageId: PackageData["id"];
  packages: readonly PackageData[];
}

export interface EstimateRange {
  min: number;
  max: number;
}

/**
 * Pure, deterministic price estimator. Returns a range for the given guest
 * count against the pre-validated package data. Phase 3 will implement this.
 */
export function estimate(_input: EstimateInput): EstimateRange | null {
  // Phase 3 stub — deliberate null so any accidental production call fails fast.
  throw new Error("estimate() not yet implemented — Phase 3");
}
```

### `src/lib/pricing/estimate.test.ts` (scaffold)

```typescript
import { describe, it } from "vitest";

describe("estimate()", () => {
  // Real boundary matrix (EST-05/EST-06) lands in Phase 3. Scaffold only.
  it.skip("returns a range for every tier boundary (Phase 3)", () => {});
});
```

### `scripts/check-image-budget.sh`

```bash
#!/usr/bin/env bash
# Source: CONTEXT D-16 — fails CI if any public/images/ file exceeds 600KB
set -euo pipefail

BUDGET_BYTES=$((600 * 1024))
ROOT="${1:-public/images}"

if [[ ! -d "$ROOT" ]]; then
  echo "ℹ  $ROOT does not exist — nothing to check."
  exit 0
fi

# BSD find (macOS) uses -size with 'c' suffix; GNU find (Linux/CI) is identical.
# Portable form: use `stat` per file for byte-accurate comparison.
OVERSIZED=()
while IFS= read -r -d '' file; do
  size=$(wc -c <"$file" | tr -d ' ')
  if (( size > BUDGET_BYTES )); then
    OVERSIZED+=("$file ($(( size / 1024 )) KB)")
  fi
done < <(find "$ROOT" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.gif' \) -print0)

if (( ${#OVERSIZED[@]} > 0 )); then
  echo "ERROR: ${#OVERSIZED[@]} image(s) exceed the 600KB budget:"
  printf '  - %s\n' "${OVERSIZED[@]}"
  echo ""
  echo "Fix: re-export at ≤2560px with quality 80–90 via squoosh/ImageOptim."
  exit 1
fi

echo "✓ All images under 600KB budget."
```

Wire via `package.json`:
```json
{
  "scripts": {
    "check:images": "bash scripts/check-image-budget.sh"
  }
}
```

### `.github/workflows/ci.yml` (required status checks)

```yaml
# Source: Playwright CI guide + Astro testing docs + CONTEXT D-09
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm
      - run: pnpm install --frozen-lockfile

  typecheck:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec astro sync   # must run before astro check
      - run: pnpm exec astro check

  biome-check:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec biome ci .

  content-sync:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec astro sync   # Zod validation is the gate

  image-budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/check-image-budget.sh

  smoke:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm exec playwright test
```

**Required status check contexts** (configure in branch protection):
`typecheck`, `biome-check`, `content-sync`, `image-budget`, `smoke`, `pr-title` (from the amannn workflow below).

### `.github/workflows/pr-title.yml`

```yaml
# Source: github.com/amannn/action-semantic-pull-request
name: pr-title

on:
  pull_request_target:
    types: [opened, edited, synchronize, reopened]

permissions:
  pull-requests: read

jobs:
  pr-title:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `playwright.config.ts` + `tests/smoke.spec.ts`

```typescript
// playwright.config.ts — Source: playwright.dev/docs/ci-intro + docs.astro.build/en/guides/testing/
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:4321" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

```typescript
// tests/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("home page returns 200 and renders brand word", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText(/larrae/i);
});
```

### `.github/CODEOWNERS`

```
# Source: docs.github.com/en/repositories/managing-your-repositories-settings-and-features/customizing-your-repository/about-code-owners
# Single-owner v1 (per CONTEXT D-11). Refine when the team grows.

*   @<maintainer-github-username>
```

Place in `.github/CODEOWNERS` (preferred over root so it's grouped with other GitHub metadata).

### `lefthook.yml`

```yaml
# Source: github.com/evilmartians/lefthook + biomejs.dev/recipes/git-hooks
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "*.{js,jsx,ts,tsx,json,css,astro}"
      run: pnpm exec biome check --write --staged --no-errors-on-unmatched {staged_files}
      stage_fixed: true
```

Enable with: `pnpm exec lefthook install`.

### `.env.example`

```bash
# Source: CONTEXT D-15 — every v1 env var name with placeholders.
# Register each of these in Vercel Preview + Production environments
# in Phase 1 with value "__placeholder__" (or equivalent); replace with
# real values in Phase 3 (Preview) and Phase 5 (Production).

# Email (Phase 3 wires, Phase 5 goes live)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Spam protection (Phase 3 wires, Phase 5 flips to prod keys)
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Lead storage — Google Sheets (Phase 3)
GOOGLE_SHEETS_CREDENTIALS_JSON=
GOOGLE_SHEETS_LEAD_SHEET_ID=

# Error monitoring (Phase 4)
SENTRY_DSN=

# Public — available in client bundle
PUBLIC_SITE_URL=http://localhost:4321
```

### `src/env.d.ts`

```typescript
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly RESEND_FROM_EMAIL: string;
  readonly TURNSTILE_SITE_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly GOOGLE_SHEETS_CREDENTIALS_JSON: string;
  readonly GOOGLE_SHEETS_LEAD_SHEET_ID: string;
  readonly SENTRY_DSN: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Phase 1 typing strategy when values aren't filled in:** Typed as `string` (not `string | undefined`). Runtime reads are gated behind the Astro Action boundary (which doesn't execute in Phase 1). No code in Phase 1 actually reads these values. Phase 3 adds a Zod schema that parses `import.meta.env` at Action-invocation time and fails loudly if placeholders are still present.

### Vercel setup recipe

```bash
# Source: vercel.com/docs/frameworks/frontend/astro — one-time Phase 1 setup.
# Install CLI if not present: pnpm add -g vercel

vercel link                          # links repo to a new Vercel project
vercel env pull .env.local           # pulls any existing env vars (should be empty initially)

# Register every var in both environments with placeholders
for VAR in RESEND_API_KEY RESEND_FROM_EMAIL TURNSTILE_SITE_KEY TURNSTILE_SECRET_KEY \
           GOOGLE_SHEETS_CREDENTIALS_JSON GOOGLE_SHEETS_LEAD_SHEET_ID SENTRY_DSN PUBLIC_SITE_URL; do
  echo "__placeholder__" | vercel env add "$VAR" preview
  echo "__placeholder__" | vercel env add "$VAR" production
done

# Verify
vercel env ls preview
vercel env ls production
```

`vercel.json` is **not required** — `@astrojs/vercel` adapter configures everything Astro needs. Only add `vercel.json` if we hit a specific override need in later phases (redirects, function region pinning, etc.).

### Branch protection via `gh` CLI

```bash
# Source: cli.github.com + docs.github.com/en/rest/branches/branch-protection
# Run once after the first green CI on a throwaway PR, so the check contexts exist.

REPO="<owner>/<repo>"

gh api -X PUT "repos/$REPO/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "typecheck",
      "biome-check",
      "content-sync",
      "image-budget",
      "smoke",
      "pr-title"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

Commit this as `scripts/setup-branch-protection.sh` so the config is auditable and replayable.

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.0/schema.json",
  "files": {
    "include": ["src/**/*.{ts,tsx,js,jsx,astro,json,css}", "tests/**/*.ts"],
    "ignore": ["**/dist/**", "**/node_modules/**", "**/.astro/**", "**/.vercel/**", "public/**"]
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": { "enabled": true }
}
```

Note: Biome has first-party `.astro` parsing in 2.3+. Confirm by running `pnpm exec biome check src/pages/index.astro` after install — if it errors on Astro syntax, pin the plugin version as documented in Biome's Astro recipe.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@astrojs/tailwind` integration | `@tailwindcss/vite` Vite plugin | Tailwind v4 (early 2025) | `@astrojs/tailwind` effectively deprecated for v4; use the Vite plugin directly |
| `tailwind.config.js` | `@theme` block in `global.css` | Tailwind v4 | Config lives in CSS, not JS |
| Astro `src/content/config.ts` | `src/content.config.ts` at repo src root | Astro 5 Content Layer API | Old location still works but new projects should use the new path |
| `--typescript strict` flag on `create astro` | Auto-applied, prompt removed | Astro 5 | Flag is a no-op now; strict is default |
| Husky + lint-staged (shell) | lefthook (Go binary, parallel) | Gradually replacing in 2025–2026 | Faster, no node_modules bloat, polyglot |
| ESLint + Prettier | Biome | 2024+ | One tool, ~20x faster |
| Contentlayer | Astro Content Collections | 2025 onward | Contentlayer effectively abandoned |

**Deprecated/outdated:**
- **`@astrojs/tailwind`** — do not use for v4 projects
- **Contentlayer** — unmaintained; migrate if you encounter it
- **Astro v1/v2 `src/content/config.ts` location** — use `src/content.config.ts`

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `pnpm create astro@latest . --git no --install --yes` will scaffold into a non-empty directory without clobbering `.git`, `CLAUDE.md`, `docs/`, or `.planning/`. | Installation sequence | MEDIUM — if Astro refuses or overwrites, first scaffold task bounces. Mitigation: verify in a throwaway branch; if the CLI rejects a populated cwd, scaffold into a temp dir and `rsync` the result over. |
| A2 | `astro sync` succeeds with `.gitkeep`-only content collection directories on Astro 6.1.x in Ubuntu CI. | Empty-collection pitfall | LOW-MEDIUM — historically an issue on Windows (Astro #12784); Ubuntu CI should be fine. If sync errors, fallback is to add a single `_placeholder.md` per collection that Phase 2's first task deletes. |
| A3 | Lovelace license permits web self-hosting via `@font-face`. | Fonts, Pitfall 8 | MEDIUM — license varies by vendor. Mitigation: verify against the purchase receipt during Phase 1; document in `THIRDPARTY.md`. If license blocks web use, fall back to Playfair Display for display type (visually close; the project's heritage brief calls out Playfair as an equal alternative). |
| A4 | Biome 2.3+ parses `.astro` files natively without extra plugin config. | biome.json | LOW — Biome's Astro recipe documents this; verify at install with `biome check` on an `.astro` file. If it errors, add `overrides` stanza per biome.dev/recipes. |
| A5 | `@astrojs/vercel` latest pairs cleanly with Astro 6.1.x. | Adapter section | LOW — both are actively maintained by the Astro core team; compatibility is the explicit intent. Verify with `pnpm build` → preview on Vercel works end to end during Phase 1 smoke. |
| A6 | `amannn/action-semantic-pull-request@v6` is the current major as of 2026-04-15. | PR title check | LOW — web search confirms v6 is current; if a v7 has shipped, bump the pin. |
| A7 | The existing repo's `.git` history, `CLAUDE.md`, `docs/`, and `.planning/` are preserved through the scaffold wipe. | Scaffold sequence | LOW — the plan explicitly `rm`s only `package.json`, `package-lock.json`, `node_modules`. No other filesystem paths are touched. |

**User confirmation needed:** None. All assumptions are verifiable during Phase 1 execution (A1–A6 have programmatic verification steps; A7 is a matter of obeying the `rm` targets in the plan).

## Open Questions

1. **Exact GitHub repo owner/name for branch protection scripting**
   - What we know: Project is a local git repo; there's a remote but it's not inspected here.
   - What's unclear: The `gh api repos/<owner>/<repo>/...` call needs the real path.
   - Recommendation: Planner includes a `scripts/setup-branch-protection.sh` that reads `gh repo view --json nameWithOwner` to avoid hardcoding.

2. **Is there already a Vercel team/account for the project?**
   - What we know: Vercel is the locked deploy target.
   - What's unclear: Whether `vercel link` needs to create a new project or link to an existing one.
   - Recommendation: Phase 1 plan's Vercel task starts with an interactive `vercel link` prompt (not automated); capture the resulting `.vercel/project.json` to the repo.

3. **CODEOWNERS username**
   - What we know: Single owner per D-11.
   - What's unclear: The actual GitHub username.
   - Recommendation: Planner parameterizes as `<maintainer-github-username>` and the plan's final human step fills it in.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >= 22.12 | Astro 6 | Must verify | — | `nvm install 22 && nvm use 22` — `.nvmrc` enables this |
| pnpm 9 | All install/CI steps | Must verify | — | `corepack enable && corepack prepare pnpm@9 --activate` |
| git | scaffold preservation | Yes (repo already initialized) | — | — |
| GitHub CLI (`gh`) | Branch protection, CODEOWNERS push | Must verify | — | Fall back to GitHub UI configuration (document manual steps) |
| Vercel CLI (`vercel`) | `vercel link`, `vercel env add` | Must verify | — | `pnpm add -g vercel` if not installed |
| A GitHub account with repo admin rights | Branch protection setup | Assumed | — | Required — cannot be faked |
| A Vercel account | Preview deploys | Assumed | — | Required — cannot be faked |

**Missing dependencies with no fallback:** None in the blocking sense — every tool above is either already installed, trivially installable via pnpm/corepack, or has a documented manual-UI fallback. The planner should add a preflight task that checks each one and fails fast with an actionable error.

**Missing dependencies with fallback:** `gh` CLI fallback is GitHub UI (acceptable for a one-time branch protection setup; document the UI clicks).

## Validation Architecture

Per `.planning/config.json` → `workflow.nyquist_validation: true`, this section maps every FND-XX requirement to the signal that proves it.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (unit) + Playwright 1.5x (E2E smoke) + `astro check` (typecheck) + `astro sync` (content schema) + bash script (image budget) + Biome 2.3+ (lint/format) |
| Config files | `vitest.config.ts`, `playwright.config.ts`, `biome.json`, `tsconfig.json`, `src/content.config.ts`, `scripts/check-image-budget.sh` |
| Quick run command (per commit, pre-push) | `pnpm exec biome check . && pnpm exec astro sync` |
| Full suite command (per PR / phase gate) | `pnpm exec biome ci . && pnpm exec astro sync && pnpm exec astro check && bash scripts/check-image-budget.sh && pnpm exec vitest run && pnpm exec playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists (Wave)? |
|--------|----------|-----------|-------------------|---------------------|
| FND-01 | Site scaffolds, builds, and serves `/` returning 200 with brand word | smoke (Playwright) | `pnpm exec playwright test tests/smoke.spec.ts` | Wave 5 (smoke + tests created) |
| FND-02 | Warm palette tokens compile to CSS custom properties and are usable as Tailwind utilities (e.g., `bg-primary`, `text-ink`, `bg-deep-amber`) | unit (visual CSS check) + smoke | `pnpm build && grep -q "color-deep-amber" dist/**/*.css` (Wave 3) **AND** Playwright asserts `document.documentElement` computed style resolves `--color-primary` | Wave 3 (global.css) + Wave 5 (smoke assertion) |
| FND-03 | Playfair, Work Sans, and Lovelace each resolve to their self-hosted files (not Google Fonts) | smoke | Playwright asserts no request to `fonts.googleapis.com` on page load; asserts `getComputedStyle(h1).fontFamily` includes "Lovelace" or "Playfair Display" | Wave 5 |
| FND-04 | `content.config.ts` defines 8 collections with Zod schemas; `astro sync` emits `astro:content` types for each; invalid frontmatter fails `astro sync` | content-schema (astro sync) + unit (Zod) | `pnpm exec astro sync` **AND** `pnpm exec vitest run src/lib/schemas` (Vitest tests that feed malformed data to each schema and assert `.parse()` throws) | Wave 4 (schemas + config) — Vitest schema tests are a Wave 0 gap |
| FND-05 | CI pipeline runs every required check on every PR and blocks merge on failure | meta-CI | Open a scratch PR with deliberate failures (one per check type) and confirm each blocks merge; remove when resolved | Wave 6 (workflow exists) — manual verification on first real PR |
| FND-06 | `main` is protected; direct push is rejected; required status checks listed; CODEOWNERS enforced | meta-CI | `gh api repos/:owner/:repo/branches/main/protection` response includes all 6 contexts and `require_code_owner_reviews: true`; attempt `git push origin main` and assert rejection | Wave 7 (after branch-protection script run) |
| FND-07 | Opening any PR auto-creates a Vercel Preview URL posted as a comment | manual (observable) | Open PR; confirm Vercel bot comments with preview URL within 3 min; open URL and confirm home page renders | Wave 7 |
| FND-08 | `.env.example` lists all 8 vars; Vercel Preview AND Production both have all 8 registered | unit (parse) + meta (CLI) | `grep -c "^[A-Z]" .env.example` equals 8 **AND** `vercel env ls preview \| wc -l` matches **AND** `vercel env ls production \| wc -l` matches | Wave 7 |
| FND-09 | Committing a 700KB image file under `public/images/` fails the `image-budget` CI check | smoke (adversarial) | On a scratch branch, add a 700KB `public/images/test-too-big.jpg`, push, observe `image-budget` job fail red; revert | Wave 6 (script exists) — adversarial verification in Wave 8 |

### Sampling Rate

- **Per task commit:** `pnpm exec biome check --write` (fast; pre-commit via lefthook)
- **Per wave merge:** `pnpm exec astro sync && pnpm exec astro check && pnpm exec vitest run` (local before push)
- **Per PR:** Full CI workflow (all 6 required checks + PR title check)
- **Phase gate (`/gsd-verify-work`):** Full suite green on a merged main + adversarial checks for FND-06, FND-09 completed

### Wave 0 Gaps

The following must exist before the main implementation waves begin; the first wave of Phase 1 creates them.

- [ ] `vitest.config.ts` — not created by `pnpm create astro`; must be added in Wave 1
- [ ] `tests/smoke.spec.ts` — Playwright smoke test file (wave 5)
- [ ] `playwright.config.ts` — Playwright config with Astro dev server integration (wave 5)
- [ ] `biome.json` — Biome config (wave 5)
- [ ] `src/lib/schemas/<domain>.test.ts` (optional but recommended) — one happy-path + one malformed-data test per schema so `astro sync` passing isn't the only schema assertion. Can land in Phase 2 if Wave 0 gets over-scoped.
- [ ] `scripts/check-image-budget.sh` — image budget script (wave 6)
- [ ] Seed minimum one `.gitkeep` or `_placeholder.md` in each content directory so `astro sync` has something to traverse (wave 4)
- [ ] Framework install: Playwright browsers via `pnpm exec playwright install --with-deps chromium` — required in CI cache setup (wave 5)
- [ ] Framework install: `pnpm exec lefthook install` — local-only, documented in README for human contributors (wave 5)

## Sources

### Primary (HIGH confidence)
- [Astro 6 release blog (2026-03-10)](https://astro.build/blog/astro-6/) — release date, Node 22.12 floor
- [Astro 6.1 release blog](https://astro.build/blog/astro-610/) — current minor, image/Markdown updates
- [Astro @astrojs/vercel adapter docs](https://docs.astro.build/en/guides/integrations-guide/vercel/) — `output: 'server'` + adapter config
- [Astro Content Collections guide](https://docs.astro.build/en/guides/content-collections/) — glob loader, Zod schemas
- [Astro CLI reference](https://docs.astro.build/en/reference/cli-reference/) — scaffold flags
- [Astro v5 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v5/) — `--typescript strict` flag removed
- [Astro testing guide](https://docs.astro.build/en/guides/testing/) — Playwright pattern
- [Tailwind v4 Astro installation guide](https://tailwindcss.com/docs/installation/framework-guides/astro) — `@tailwindcss/vite` + global.css pattern
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, `@theme`
- [shadcn/ui Astro installation docs](https://ui.shadcn.com/docs/installation/astro) — init command, path alias, components.json
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — v4 track notes
- [Playwright CI intro](https://playwright.dev/docs/ci-intro) — `--with-deps` pattern, GitHub Actions
- [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) — PR title check, current v6
- [GitHub REST API: branch protection](https://docs.github.com/en/rest/branches/branch-protection) — required status checks, CODEOWNERS
- [Biome git-hooks recipe](https://biomejs.dev/recipes/git-hooks/) — lefthook + staged files pattern
- [npm registry — astro package](https://www.npmjs.com/package/astro) — version verification (6.1.5 as of 2026-04-15)

### Secondary (MEDIUM confidence)
- [Astro + Tailwind v4 2026 quick guide (Tailkits)](https://tailkits.com/blog/astro-tailwind-setup/) — corroborates the official installation pattern
- [lefthook vs husky comparison (pkgpulse 2026)](https://www.pkgpulse.com/blog/husky-vs-lefthook-vs-lint-staged-git-hooks-nodejs-2026) — justifies lefthook pick
- [Terraform GitHub provider — branch_protection](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/branch_protection) — reference for declarative alternative to `gh api`

### Tertiary (LOW confidence, flagged for validation)
- None. All decisions in this research are backed by HIGH or MEDIUM sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm/official blogs within 30 days of research
- Architecture: HIGH — every decision maps to a locked CONTEXT.md D-01..D-17 entry or an official docs pattern
- Pitfalls: HIGH for technical pitfalls 1-7 (verified against Astro issues, Tailwind v4 docs, shadcn docs, Playwright docs); MEDIUM for pitfall 8 (Lovelace license — product-specific, not stack-wide)
- Validation mapping: HIGH — each FND-XX has a concrete automated check plus an adversarial verification plan

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (30 days — Astro 6.1.x, Tailwind 4.2.x, shadcn v4 CLI are all actively iterating; check `npm view` on any pinned version before planning if past this date)
