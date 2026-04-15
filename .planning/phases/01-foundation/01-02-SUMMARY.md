---
phase: 01-foundation
plan: 02
subsystem: infra
tags: [astro, integrations, vercel-adapter, react-19, mdx, sitemap, env-schema, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 01
    provides: "Astro 6.1.6 scaffold, pnpm 9.15.9, Node 22 pins, tsconfig strict, prerender-guarded index"
provides:
  - "Astro framework integrations installed: @astrojs/react@5.0.3, @astrojs/mdx@5.0.3, @astrojs/sitemap@3.7.2, @astrojs/vercel@10.0.4"
  - "React 19.2.5 + react-dom 19.2.5 + @types/react + @types/react-dom installed (for Phase 3 wizard island)"
  - "astro.config.mjs wired canonical: site, output:'server', vercel() adapter with webAnalytics disabled + imageService enabled, integrations [react, mdx, sitemap]"
  - "tsconfig.json extended by astro add react with jsx:'react-jsx' + jsxImportSource:'react' (strict + noUncheckedIndexedAccess preserved)"
  - "v1 env schema registered in .env.example (tracked) with 8 vars, empty placeholders"
  - "src/env.d.ts declares ImportMetaEnv + ImportMeta with 8 typed string readonly fields — zero drift vs .env.example"
  - "pnpm build succeeds end-to-end: server entrypoint bundled to .vercel/output/_functions, /index.html prerendered (Pitfall 4 guard intact)"
  - "dev server serves / with Larrae's brand word under output:'server'"
affects: [01-03, 01-04, 01-05, 01-06, 01-07, 02-*, 03-*]

# Tech tracking
tech-stack:
  added:
    - "@astrojs/react@5.0.3"
    - "@astrojs/mdx@5.0.3"
    - "@astrojs/sitemap@3.7.2"
    - "@astrojs/vercel@10.0.4"
    - "react@19.2.5"
    - "react-dom@19.2.5"
    - "@types/react@19.2.14 (dev)"
    - "@types/react-dom@19.2.3 (dev)"
  patterns:
    - "Canonical astro.config.mjs composition: site + output:'server' + adapter(vercel) + integrations array, with tailwindcss import held back for Wave 3"
    - "Env schema as two-file contract: .env.example (names + docs) + src/env.d.ts (typed keys) — validated byte-for-byte parity"
    - "Env values typed as `string` (not `string | undefined`) because runtime reads are gated behind Phase 3 Action boundary where Zod will parse import.meta.env at call time"
    - "Vercel adapter with `imageService: true` + `webAnalytics: { enabled: false }` — Phase 4 flips analytics on after monitoring instrumentation"

key-files:
  created:
    - ".env.example"
    - "src/env.d.ts"
  modified:
    - "astro.config.mjs (overwritten with canonical RESEARCH excerpt minus tailwindcss)"
    - "package.json (integrations + react + react-dom + types added by astro add)"
    - "pnpm-lock.yaml (resolved new deps)"
    - "tsconfig.json (astro add react added jsx + jsxImportSource; strict flags preserved)"

key-decisions:
  - "Adopted astro add's auto-published tsconfig.json edit (jsx:'react-jsx', jsxImportSource:'react') unchanged — required for React 19 island tsx files; does not conflict with strict flags"
  - "Kept .env.example with trailing empty `=` after each name (RESEARCH canonical) — Vercel env register step (Wave 7) will set `__placeholder__` values; no real secrets land in repo"
  - "Typed env vars as `string` not `string | undefined` per RESEARCH § Phase 1 typing strategy (line 900) — Phase 3 adds Zod schema that parses import.meta.env at Action entry and fails loudly on placeholders"
  - "Skipped opportunistic `astro check` at verify step because it prompts for @astrojs/check install — that dep lands in Wave 5 dev tooling; `pnpm build` end-to-end is the stronger gate and passes"
  - "Did NOT install @astrojs/tailwind (forbidden by CLAUDE.md); Tailwind v4 via @tailwindcss/vite is Wave 3 work, not this wave"

patterns-established:
  - "Install integrations one-at-a-time via `pnpm astro add <name> --yes` so failures attribute cleanly, then overwrite astro.config.mjs with the canonical composed version (astro add writes minimal inserts; canonical has adapter options + site + output that astro add does not set)"
  - "Two-file env contract: .env.example documents names + grouping for humans + Vercel dashboard; src/env.d.ts provides TypeScript visibility at `import.meta.env.*` call sites"
  - "All 8 v1 env var names locked now — any new env var in later phases requires adding to BOTH files atomically"

requirements-completed: [FND-01, FND-08]

# Metrics
duration: ~3 min
completed: 2026-04-15
---

# Phase 01 Plan 02: Framework Integrations + Env Schema Summary

**Installed React 19, MDX, Sitemap, and the Vercel adapter into the Astro 6 scaffold; overwrote `astro.config.mjs` with the canonical `output:'server'` composition (tailwindcss deferred to Wave 3); registered the 8-var v1 env schema in `.env.example` + `src/env.d.ts` with verified name parity — `pnpm build` exits 0, `/index.html` still prerenders, `/` still serves the brand word.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-15T17:18:00Z (worktree spawn, roughly)
- **Completed:** 2026-04-15T17:21:00Z
- **Tasks:** 2 / 2
- **Commits:** `a2ddd58`, `541fbda`
- **Files:** 2 created, 4 modified

## Accomplishments

- Installed 4 Astro integrations + React 19 runtime via `pnpm astro add` (one at a time)
- Rewrote `astro.config.mjs` canonical — adds `site`, `output:'server'`, `adapter: vercel({webAnalytics, imageService})` (all three of which `astro add vercel` does not set by default)
- Verified build still prerenders `/` (Pitfall 4 guard from Wave 1 intact)
- `pnpm build` produces `.vercel/output/_functions/` server entry + static index — adapter toolchain confirmed wired
- Dev server smoke test: `/` returns HTML containing "Larrae" under `output:'server'`
- Created `.env.example` with 8 env vars grouped by subsystem (email, spam, storage, monitoring, public)
- Created `src/env.d.ts` with `ImportMetaEnv` + `ImportMeta` interfaces, all typed as `string` per RESEARCH strategy
- Verified byte-for-byte name parity between `.env.example` and `src/env.d.ts` (no drift)

## Installed Versions

```
@astrojs/mdx     5.0.3
@astrojs/react   5.0.3
@astrojs/sitemap 3.7.2
@astrojs/vercel  10.0.4
react            19.2.5
react-dom        19.2.5
@types/react     19.2.14 (dev)
@types/react-dom 19.2.3  (dev)
```

## Task Commits

1. **Task 2.1: Install framework integrations + adapter, author astro.config.mjs** — `a2ddd58` (feat)
2. **Task 2.2: Register env var schema in .env.example and src/env.d.ts** — `541fbda` (feat)

## Build Confirmation

`pnpm build` completes end-to-end:

```
[build] output: "server"
[build] mode: "server"
[build] adapter: @astrojs/vercel
prerendering static routes
  ├─ /index.html (+4ms)
✓ Completed in 43ms.
[@astrojs/vercel] Bundling function ../../../../dist/server/entry.mjs
[@astrojs/sitemap] `sitemap-index.xml` created at `dist/client`
[build] Server built in 1.65s
[build] Complete!
```

- `.vercel/output/` created with `_functions/`, `server/`, `static/`, `config.json`, `functions/`
- `dist/client/` populated (sitemap-index.xml emitted)
- Single warning: Vercel adapter notes local Node 23.8.0 is unsupported — will use Node 24 at runtime (expected; CI/prod runs within `engines.node` range)

## Decisions Made

- **Accepted astro-add's tsconfig.json edit unchanged.** Adding `jsx: "react-jsx"` + `jsxImportSource: "react"` is required so Phase 3's wizard island (React 19 TSX) compiles. The existing `strict: true` + `noUncheckedIndexedAccess: true` (CLAUDE.md non-negotiables) are preserved by astro add.
- **Wrote canonical `astro.config.mjs` (RESEARCH lines 442-464 minus the tailwindcss line).** `astro add vercel` only inserts `adapter: vercel()` — it does not set `webAnalytics: { enabled: false }`, `imageService: true`, `site`, or `output: "server"`. The canonical rewrite is load-bearing.
- **Env vars typed as `string` not `string | undefined`.** Per RESEARCH § Phase 1 typing strategy (line 900), no code in Phase 1 reads these. Phase 3 adds a Zod schema that parses `import.meta.env` at Action entry and fails loudly on unset/placeholder values. This keeps Phase 1 call sites clean instead of demanding `!` assertions everywhere downstream.
- **Did not install `@astrojs/check`.** The plan's verify block suffixed `|| true` around `astro check`, making it opportunistic. Running it triggers an interactive install prompt that is out-of-scope for this wave (dev tooling lands in Wave 5). The build gate is stronger — and it passed.

## Deviations from Plan

None. Plan executed exactly as written.

The only items worth noting fall under "followed plan's explicit guidance":

- Ran `pnpm install --frozen-lockfile` before `pnpm astro add` — required because the worktree was spun up fresh with no `node_modules`. Mentioned here only for continuity; it's an obvious prerequisite implied by "Run from repo root" in the task action.
- Did not run `pnpm exec astro check` because it prompted to install `@astrojs/check` interactively. Plan's verify line ended in `|| true` explicitly marking this as opportunistic; `pnpm build` is the stronger gate and exits 0.

## Issues Encountered

- **Port 4321 held briefly after dev-server smoke test.** Background `pnpm dev` spawned a child `astro dev` process that outlived its parent's kill. Cleared with `lsof -ti:4321 | xargs kill -9`. No impact on deliverables; dev smoke test confirmed brand word served under `output:'server'`.
- **Vercel adapter warning: `local Node.js version (23) is not supported`.** Expected — matches STATE.md's documented behavior around the Node 23.8.0 local runtime vs pinned `>=22.12.0 <23`. CI and Vercel serverless functions will use supported Node 22/24; local warning is harmless.

## User Setup Required

None. The `.env.example` placeholders point at Wave 7 (Vercel project setup) and Phase 3 (first real Resend/Turnstile/Sheets/Sentry keys).

## Next Wave Readiness

- **Ready for Wave 3** (Tailwind v4 + shadcn/ui): `astro.config.mjs` has the exact shape Wave 3 will extend (add `@tailwindcss/vite` import + `vite.plugins: [tailwindcss()]`). `src/env.d.ts` provides `PUBLIC_SITE_URL` typed for the SEO layout Wave 6 will consume.
- **Ready for Wave 4** (dev tooling): package dependencies stable — Vitest/Playwright/Biome install clean against this lockfile.
- **Ready for Phase 3** (Astro Actions): Vercel adapter with `output:'server'` is the serverless seam `defineAction` handlers plug into; React 19 runtime in place for the wizard island; 8 env var names locked for the Zod env schema that Phase 3 will author.

## Self-Check: PASSED

Verified commands against every acceptance criterion + commit existence:

- ✅ `package.json` deps include `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/vercel`, `react@^19`, `react-dom@^19`
- ✅ `astro.config.mjs` contains `output: "server"`, `adapter: vercel(`, `integrations: [react(), mdx(), sitemap()]`
- ✅ `astro.config.mjs` does NOT contain `@astrojs/tailwind` or `tailwindcss` import (Wave 3 concern)
- ✅ `package.json` does NOT contain `@astrojs/tailwind`
- ✅ `src/pages/index.astro` still contains `export const prerender = true` (Pitfall 4 guard preserved)
- ✅ `pnpm build` exits 0 — prerenders `/index.html`, bundles `.vercel/output/_functions/entry.mjs`
- ✅ `.vercel/output/` exists and contains `_functions/`, `server/`, `static/`, `config.json`, `functions/`
- ✅ `dist/client/` exists (sitemap-index.xml emitted)
- ✅ `.env.example` exists at repo root — 8 env declarations matching `^[A-Z][A-Z_]+=`
- ✅ All 8 names present in `.env.example`: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_SHEETS_CREDENTIALS_JSON`, `GOOGLE_SHEETS_LEAD_SHEET_ID`, `SENTRY_DSN`, `PUBLIC_SITE_URL`
- ✅ `src/env.d.ts` contains `/// <reference path="../.astro/types.d.ts" />` + `/// <reference types="astro/client" />` at top, declares `interface ImportMetaEnv` + `interface ImportMeta`
- ✅ 8 `readonly X: string;` entries in `src/env.d.ts` — sorted byte-for-byte equal to `.env.example` names (no drift)
- ✅ `git check-ignore .env.example` exits 1 (tracked, not ignored)
- ✅ No `.env` or `.env.local` created (those remain gitignored, Phase 3/5 concern)
- ✅ Commits `a2ddd58` and `541fbda` both present in `git log --oneline`

---
*Phase: 01-foundation*
*Plan: 02*
*Completed: 2026-04-15*
