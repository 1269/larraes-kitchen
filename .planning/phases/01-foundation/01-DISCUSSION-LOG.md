# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 01-foundation
**Areas discussed:** Design token architecture, Shared schema & repo layout, CI strictness & merge gates, Deployment & env stubbing
**Mode:** Interactive for Areas 1–2; YOLO (auto-pick recommended) for Areas 3–4 per user request.

---

## Design token architecture

| Question | Option | Selected |
|----------|--------|----------|
| Token model: brand colors → Tailwind v4 `@theme` | Brand + semantic layer (Recommended) | ✓ |
|  | Brand-only tokens | |
|  | You decide | |
| Color naming: full palette vs curated subset | Full palette as documented (Recommended) | ✓ |
|  | Curated subset for v1 | |
| Font loading: Lovelace + Playfair + Work Sans | Fontsource self-host (Recommended) | ✓ |
|  | Google Fonts link tag | |
|  | All self-hosted woff2 (no Fontsource) | |
| Typography scale | Custom editorial scale (Recommended) | ✓ |
|  | Tailwind defaults + brand fonts only | |
|  | You decide | |

**User's choices:** All recommended options. Two-layer token model, full palette, Fontsource-self-host with Lovelace as licensed woff2, custom editorial scale.
**Notes:** Aligns with PROJECT.md non-negotiable warm palette and Sweetgreen-structural / soul-food-warmth hybrid. Semantic layer leaves room for later seasonal/dark-mode variants without component churn.

---

## Shared schema & repo layout

| Question | Option | Selected |
|----------|--------|----------|
| Where Zod schemas live | `src/lib/schemas/` (shared module) (Recommended) | ✓ |
|  | Inline in `src/content.config.ts` | |
|  | Per collection folder (`src/content/packages/_schema.ts`) | |
| Where price calculator lives | `src/lib/pricing/estimate.ts` + boundary tests (Recommended) | ✓ |
|  | `src/lib/wizard/estimate.ts` | |
|  | Defer placement until Phase 3 | |
| Repo skeleton | Full skeleton, empty placeholders (Recommended) | ✓ |
|  | Minimal skeleton, grow as needed | |
| shadcn/ui install scope | Init shadcn + install Button only in Phase 1 (Recommended) | ✓ |
|  | Init + full kit (Button, Card, Accordion, Dialog, Input, Form, Label) | |
|  | Init only, no components yet | |

**User's choices:** All recommended. Schemas centralized, pricing pure function with co-located tests, full directory skeleton from day one, shadcn init + Button only.
**Notes:** Full skeleton + centralized schemas are the load-bearing decisions for AI-agent-via-GitHub workflow — agents need a stable, predictable map of where files go.

---

## CI strictness & merge gates

> **Auto-resolved (YOLO mode at user request).** Recommended option taken for each.

| Decision | Recommended (selected) | Alternatives considered |
|----------|------------------------|-------------------------|
| Required status checks blocking merge | All FND-05 jobs block: typecheck (`astro check`), Biome lint+format, content schema validation (`astro sync`), image-budget script, Playwright smoke stub. Coverage/bundle-size advisory only. | Block only typecheck + Biome; promote others to blocking later. |
| PR title enforcement | Conventional Commits enforced via CI regex; failing PRs surface rule + example. | No enforcement; soft convention only. |
| CODEOWNERS granularity | Single owner for v1; refine when team grows. | Per-directory owners (premature). |
| Pre-commit hooks | Husky + lint-staged for Biome format on staged files (dev convenience); CI authoritative so AI-agent PRs aren't blocked by missing local hooks. | No local hooks (slower feedback). All checks local pre-commit (too slow + AI-agent unfriendly). |

**Notes:** CI-as-source-of-truth is critical for the AI-agent content PR workflow — local hooks are dev convenience only.

---

## Deployment & env stubbing

> **Auto-resolved (YOLO mode at user request).** Recommended option taken for each.

| Decision | Recommended (selected) | Alternatives considered |
|----------|------------------------|-------------------------|
| Vercel project setup | `vercel link` (config committed); GitHub integration creates Preview per PR; Production promotes from `main` after CI passes. | Vercel Dashboard manual setup (less reproducible). |
| Astro adapter / output mode | `@astrojs/vercel` with `output: 'server'` (required for Astro Actions in Phase 3). | `output: 'static'` (would block Phase 3). `output: 'hybrid'` deprecated in Astro 6. |
| Env var strategy | `.env.example` registers every v1 env var name with placeholder values from day one (Resend, Turnstile, Sheets, Sentry, PUBLIC_SITE_URL). Vercel Preview/Production environments created in Phase 1 with names registered (no real values). Phase 3 fills Preview; Phase 5 fills Production + DKIM. | Defer all env wiring to Phase 3/5 (forces schema thrash). |
| Image-size budget enforcement | CI-only `du`-based shell script (`scripts/check-image-budget.sh`); fails if any `public/images/` file > 600KB. No pre-commit. | Pre-commit + CI (AI-agent PRs without local hooks would slip through pre-commit anyway; CI is the universal gate). |

**Notes:** Output mode is the only non-obvious choice — `'server'` is required by Phase 3 Astro Actions, so committing to it now avoids a re-config later.

---

## Tooling pins (locked alongside the four discussed areas)

- `pnpm@9` via `packageManager` field
- Node `>= 22.12 < 23` via `engines`; `.nvmrc` = 22 LTS
- CI uses pnpm action with `--frozen-lockfile`

## Claude's Discretion

- Exact CI job orchestration (one workflow vs split; matrix vs serial)
- Conventional Commits enforcement implementation (custom action vs `commitlint`-style script)
- Biome rule overrides within the recommended preset
- Astro `vite` config beyond integration requirements
- Pre-commit driver choice (Husky / simple-git-hooks / lefthook — pick lightest)
- `.gitkeep` content (empty vs single-line README per directory)

## Deferred Ideas

- Dark mode token variant
- `release-please` / semantic versioning automation
- PR / issue templates
- Storybook / component playground
- Per-directory CODEOWNERS
- Bundle-size CI budget (advisory in v1)
- Pre-commit typecheck

---

*Discussion log generated: 2026-04-15*
