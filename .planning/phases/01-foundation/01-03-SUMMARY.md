---
phase: 01-foundation
plan: 03
subsystem: ui
tags: [tailwind, tailwind-v4, theme, fontsource, shadcn, brand-palette, typography, design-tokens]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 02
    provides: "Astro 6 + React 19 + Vercel adapter + MDX + sitemap wired; tsconfig strict with jsx:react-jsx"
provides:
  - "Tailwind v4.2.2 compiled via @tailwindcss/vite (Vite plugin path — NOT @astrojs/tailwind)"
  - "src/styles/global.css with @theme block: 8 brand colors + 4 semantic tokens + 3 font stacks + 7-step editorial text scale"
  - "Brand utilities resolve: bg-primary, bg-surface, bg-accent, text-ink, font-display, font-serif, font-sans, text-display-xl/lg/md, text-body-lg/md/sm, text-eyebrow"
  - "Playfair Display + Work Sans self-hosted via Fontsource (imported in src/pages/index.astro — zero Google CDN requests)"
  - "Lovelace @font-face declaration in global.css referencing /fonts/Lovelace.woff2 (pending maintainer supply — falls back to Playfair)"
  - "shadcn/ui initialized (radix-nova preset, baseColor neutral) with components.json + @/* path alias + cn() helper"
  - "Button component installed at src/components/ui/button.tsx (Button + buttonVariants exports)"
  - "shadcn scaffold CSS merged into global.css with brand @theme as source of truth (shadcn @theme inline overrides of --color-primary / --color-accent / --font-sans stripped)"
affects: [01-04, 01-05, 01-06, 01-07, 02-*, 03-*]

# Tech tracking
tech-stack:
  added:
    - "tailwindcss@4.2.2"
    - "@tailwindcss/vite@4.2.2"
    - "@fontsource/playfair-display@5.2.8"
    - "@fontsource/work-sans@5.2.8"
    - "class-variance-authority@0.7.1"
    - "clsx@2.1.1"
    - "tailwind-merge@3.5.0"
    - "lucide-react@1.8.0"
    - "radix-ui@1.4.3"
  patterns:
    - "Tailwind v4 CSS-first config via @theme block (no tailwind.config.js — v3 idiom is explicitly forbidden by CLAUDE.md)"
    - "Two-layer token model: brand layer (--color-deep-amber, --color-greens-deep, etc.) + semantic layer (--color-primary → var(--color-greens-deep)) — palette swap only touches semantic layer"
    - "Brand @theme as source of truth; shadcn's neutral @theme inline block retained ONLY for keys that do not conflict with brand (border, ring, muted, destructive, card, popover, foreground/background, radius, sidebar, chart) — brand-overlapping keys (primary, accent, font-sans, font-heading) stripped"
    - "Fontsource self-hosting: each weight imported individually from component frontmatter (@fontsource/playfair-display/400.css etc.) — no Google CDN hop, FND-03 compliant"
    - "shadcn init bootstrapped via 4.2.0 CLI with --template astro --base radix --preset nova --yes flags; flag shape differs from pre-4.x docs"

key-files:
  created:
    - "src/styles/global.css"
    - "public/fonts/LOVELACE-LICENSE.txt"
    - "components.json"
    - "src/lib/utils.ts"
    - "src/components/ui/button.tsx"
  modified:
    - "astro.config.mjs (added vite.plugins: [tailwindcss()])"
    - "src/pages/index.astro (added Fontsource + global.css imports; token utility classes)"
    - "tsconfig.json (added baseUrl + @/* path alias for shadcn)"
    - "package.json / pnpm-lock.yaml"

key-decisions:
  - "Rejected shadcn's @theme inline overrides of --color-primary, --color-accent, --color-accent-foreground, --font-sans, --font-heading — these would have clobbered the brand palette declared in the custom @theme block. Brand @theme is the source of truth; shadcn's neutral scaffolding is retained only for non-conflicting keys (border/ring/muted/card/sidebar/chart/radius) that the Button variant CSS consumes."
  - "Removed shadcn's three appended CSS @imports: tw-animate-css (unused animation library), shadcn/tailwind.css (broken import path — shadcn is a CLI, not a Tailwind CSS package), @fontsource-variable/geist (Geist is not in the brand font stack, violates D-03 / FND-03)."
  - "Uninstalled three runtime deps shadcn CLI had added automatically: `shadcn` (it's a CLI tool, shouldn't be a runtime dep — ran via pnpm dlx), `tw-animate-css`, `@fontsource-variable/geist`. Kept class-variance-authority + clsx + tailwind-merge + lucide-react + radix-ui (all needed by Button)."
  - "Did NOT install `@astrojs/check` — `astro check` prompts for it interactively, and that dep is scheduled for the Wave 5 dev-tooling plan. Validated @/ alias resolution by temporarily importing `Button` + `cn` into index.astro and running `pnpm build` (exits 0)."
  - "Lovelace.woff2 NOT supplied — the @font-face declaration 404s gracefully and --font-display falls back to Playfair Display. LOVELACE-LICENSE.txt placeholder committed; maintainer must supply font file + real license text before Phase 5 launch (A3)."

patterns-established:
  - "Tailwind v4 wiring: @tailwindcss/vite plugin in astro.config.mjs `vite.plugins` — never @astrojs/tailwind (CLAUDE.md forbids v3 integration)"
  - "shadcn-merge protocol: after `shadcn init` on a branded codebase, audit the emitted CSS for @theme inline entries that shadow your brand tokens; delete the shadowing entries but keep shadcn's neutral scaffold (border/ring/muted/card) so shadcn components still render"
  - "shadcn CLI 4.x flag shape: `--template astro --base radix --preset <nova|vega|maia|lyra|mira|luma>` — the old `--base-color` / `--css` flags from 3.x docs no longer exist"
  - "Font self-hosting contract: npm-install @fontsource/<family> + import each weight CSS file individually in component frontmatter — never `<link rel=stylesheet href=fonts.googleapis.com>`"

requirements-completed: [FND-01, FND-02, FND-03]

# Metrics
duration: ~10 min
completed: 2026-04-15
---

# Phase 01 Plan 03: Brand Token Pipeline + shadcn/ui Init Summary

**Tailwind v4 wired via the Vite plugin; brand-warm @theme compiles 8 palette colors + 4 semantic tokens + 3 font stacks + editorial text scale into utility classes; Playfair Display + Work Sans self-hosted via Fontsource (zero Google CDN); shadcn/ui initialized with Button installed, and shadcn's brand-shadowing @theme inline overrides stripped so the warm palette (primary=greens-deep, accent=deep-amber) remains the single source of truth.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-15T17:24:30Z (worktree spawn)
- **Completed:** 2026-04-15T17:34:30Z (Task 3.2 commit)
- **Tasks completed:** 2 / 3 (Task 3.3 is a `checkpoint:human-verify` awaiting user visual sign-off — cannot be auto-completed)
- **Files created:** 5
- **Files modified:** 4

## Installed Versions

```
tailwindcss              4.2.2
@tailwindcss/vite        4.2.2
@fontsource/playfair-display 5.2.8
@fontsource/work-sans    5.2.8
class-variance-authority 0.7.1
clsx                     2.1.1
tailwind-merge           3.5.0
lucide-react             1.8.0
radix-ui                 1.4.3
shadcn CLI (dlx only)    4.2.0
```

## Accomplishments

- Tailwind v4.2.2 compiled via `@tailwindcss/vite` (not `@astrojs/tailwind`)
- `src/styles/global.css` authored with the full brand + semantic + typography token model:
  * 8 palette colors: deep-amber, warm-cream, greens-deep, greens-mid, iron-black, southern-red, butter-gold, clay
  * 4 semantic tokens: primary → greens-deep, surface → warm-cream, accent → deep-amber, ink → iron-black
  * 3 font stacks: display (Lovelace → Playfair → serif fallback), serif (Playfair), sans (Work Sans)
  * 7-step editorial text scale: display-xl/lg/md + body-lg/md/sm + eyebrow (with letter-spacing token)
- Playfair Display 400/700 + Work Sans 400/600 self-hosted via Fontsource (zero Google CDN requests — FND-03 enforced)
- Lovelace `@font-face` declaration wired (falls back to Playfair until maintainer supplies the commercial `.woff2`)
- `public/fonts/LOVELACE-LICENSE.txt` committed with placeholder license text + clear Phase 5 action item
- shadcn/ui initialized: `components.json`, `src/lib/utils.ts` (cn helper), `src/components/ui/button.tsx` (Button + buttonVariants)
- `tsconfig.json` extended with `baseUrl: "."` + `@/*: ["./src/*"]` alias (required by shadcn + used throughout future waves)
- Brand `@theme` block preserved unchanged through shadcn init — built CSS correctly resolves `.text-primary { color: var(--color-primary) }` → `var(--color-greens-deep)` → `#2E4A2F`
- `pnpm build` passes end-to-end, prerenders `/index.html`, bundles Vercel serverless function entry
- Probe test confirmed: `import { Button } from "@/components/ui/button"` + `import { cn } from "@/lib/utils"` resolve in real `pnpm build` path

## Task Commits

1. **Task 3.1: Install Tailwind v4 + Fontsource, author global.css with brand tokens** — `0f9cd8d` (feat)
2. **Task 3.2: Init shadcn/ui + install Button, preserve brand @theme** — `3578ad7` (feat)
3. **Task 3.3: Human-verify checkpoint** — AWAITING USER (visual verification in browser + DevTools network check)

## Files Created/Modified

- `src/styles/global.css` — (created) Tailwind v4 entry + Lovelace @font-face + brand @theme + shadcn neutral scaffold (brand-shadowing keys removed)
- `public/fonts/LOVELACE-LICENSE.txt` — (created) License placeholder with Phase 5 TODO
- `components.json` — (created by shadcn init) style=radix-nova, baseColor=neutral, cssVariables=true, @/ aliases
- `src/lib/utils.ts` — (created by shadcn init) `cn()` = `twMerge(clsx(...))`
- `src/components/ui/button.tsx` — (created by shadcn init) Button + buttonVariants
- `astro.config.mjs` — (modified) added `import tailwindcss from "@tailwindcss/vite"` + `vite: { plugins: [tailwindcss()] }`
- `src/pages/index.astro` — (modified) added 4 Fontsource CSS imports + `../styles/global.css` import; h1/body now use token utilities (`bg-surface text-ink font-sans font-display text-display-xl text-primary font-serif`)
- `tsconfig.json` — (modified) added `baseUrl: "."` + `paths: { "@/*": ["./src/*"] }` (strict + noUncheckedIndexedAccess preserved)
- `package.json` / `pnpm-lock.yaml` — (modified) +tailwindcss, +@tailwindcss/vite, +Fontsource fonts, +shadcn runtime deps (CVA/clsx/tailwind-merge/lucide-react/radix-ui); −shadcn (CLI), −tw-animate-css, −@fontsource-variable/geist

## Decisions Made

- **Brand @theme is source of truth for design tokens.** shadcn's `@theme inline` block emitted by init contained `--color-primary: var(--primary)` and `--font-sans: 'Geist Variable'` — both would have shadowed the brand layer. Rule 1 (bug): removed those lines while keeping shadcn's non-conflicting neutral scaffold (border/ring/muted/card/popover/destructive/radius/sidebar/chart) which the Button variant CSS references.
- **Font stack compliance enforced strictly.** Removed shadcn's auto-injected `@import "@fontsource-variable/geist"` and its companion `--font-sans` override. Our D-03 font plan is Lovelace/Playfair/Work Sans only; Geist has no place in the design system.
- **`shadcn` removed from runtime deps.** The shadcn CLI auto-adds itself as a dependency during init — but it's a CLI tool, not a runtime library. We invoke it via `pnpm dlx` only. Uninstalled to keep the production bundle clean.
- **Deferred `astro check` verification.** `astro check` requires `@astrojs/check` (Wave 5 dep). Validated `@/` alias resolution by temporarily importing Button into index.astro and running `pnpm build` — if the alias had been broken the build would fail on resolve. It didn't. Cleaner gate than a disruptive interactive install.
- **Lovelace font file intentionally absent.** A3 (RESEARCH) acknowledges the maintainer supplies the commercial file pre-launch. Created the license placeholder, wired the `@font-face`, and confirmed graceful Playfair fallback. Do NOT create a zero-byte `.woff2`.
- **shadcn CLI 4.2 flag shape is new.** Pre-4.x docs referenced `--base-color` and `--css` flags; 4.2 replaces those with `--base <radix|base>` and `--preset <nova|vega|...>` with CSS path inferred from `components.json`. Plan step 2 used the old flag shape and failed; recovered with `--template astro --base radix --preset nova --yes`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] shadcn init emitted @theme inline overrides that clobbered brand tokens**
- **Found during:** Task 3.2, step 2 (shadcn init)
- **Issue:** `shadcn init` wrote a second `@theme inline { ... }` block into `src/styles/global.css` AFTER the brand `@theme` block. That block contained `--color-primary: var(--primary)` and `--font-sans: 'Geist Variable'` — later-block cascade rules mean these silently override the brand `--color-primary: var(--color-greens-deep)` and `--font-sans: "Work Sans"`. This would have broken every `text-primary`, `bg-primary`, `font-sans` utility on the page.
- **Fix:** Rewrote `src/styles/global.css` to preserve the brand `@theme` block and shadcn's non-conflicting `@theme inline` entries (border/ring/muted/card/chart/sidebar/radius) while deleting the brand-shadowing entries (`--color-primary`, `--color-accent`, `--color-accent-foreground`, `--font-sans`, `--font-heading`). The plan explicitly anticipated this deviation under Task 3.2 step 2 ("If shadcn overwrites @theme, restore... merge shadcn's additions manually").
- **Files modified:** `src/styles/global.css`
- **Verification:** Built CSS now contains `.text-primary{color:var(--color-primary)}` and `--color-primary:var(--color-greens-deep)` — chain resolves to the brand green. Grep confirms `color-deep-amber`, `color-greens-deep`, and `Work Sans` all present in built CSS.
- **Committed in:** `3578ad7`

**2. [Rule 2 — Missing critical] Removed shadcn's unwanted @imports (Geist + tw-animate-css + broken shadcn/tailwind.css)**
- **Found during:** Task 3.2, step 2 (shadcn init)
- **Issue:** shadcn init prepended three CSS @imports: `@import "tw-animate-css"` (unused animation lib), `@import "shadcn/tailwind.css"` (broken — shadcn is a CLI, no such CSS export), `@import "@fontsource-variable/geist"` (Geist font not in brand stack, violates D-03 / FND-03). The broken `shadcn/tailwind.css` import was also the source of the `"file" is not a known CSS property` warning during the build immediately after init.
- **Fix:** Deleted all three @imports from `src/styles/global.css`. Uninstalled `@fontsource-variable/geist` and `tw-animate-css` runtime deps. Also uninstalled `shadcn` itself from runtime deps (CLI tool — not a runtime library; use `pnpm dlx` for any future component installs).
- **Files modified:** `src/styles/global.css`, `package.json`, `pnpm-lock.yaml`
- **Verification:** Post-fix `pnpm build` exits 0 with no CSS warnings. `grep -E '"(shadcn|tw-animate|@fontsource-variable/geist)"' package.json` returns nothing.
- **Committed in:** `3578ad7`

**3. [Rule 2 — Missing critical] Removed shadcn @layer base body/html rules that force neutral palette globally**
- **Found during:** Task 3.2, step 2
- **Issue:** shadcn init appended `@layer base { body { @apply bg-background text-foreground } html { @apply font-sans } }`. Because shadcn's neutral `:root` defines `--background: oklch(1 0 0)` (pure white) and `--foreground: oklch(0.145 0 0)` (near-black), these rules would have forced every page body to white+black regardless of brand-surface / brand-ink utilities, and every html to Work Sans (the latter isn't bad, but it's redundant now that index.astro sets `font-sans` on body explicitly).
- **Fix:** Kept `@layer base { * { @apply border-border outline-ring/50 } }` (shadcn Button relies on the border + ring default tokens). Deleted the body + html rules — index.astro's `<body class="bg-surface text-ink font-sans">` explicitly opts into the brand palette.
- **Files modified:** `src/styles/global.css`
- **Verification:** Built CSS: no global `body{background:var(--background)}` rule. index.astro's body HTML renders with `bg-surface` (warm cream) at runtime — verified via build output.
- **Committed in:** `3578ad7`

**4. [Rule 3 — Blocking] shadcn CLI 4.2 flag shape differed from plan; `--base-color` / `--css` rejected**
- **Found during:** Task 3.2, step 2
- **Issue:** Plan specified `pnpm dlx shadcn@latest init --base-color neutral --css src/styles/global.css --yes`. shadcn CLI 4.2.0 rejects `--base-color` with `error: unknown option '--base-color'`. The 4.x CLI uses `--base <radix|base>` and `--preset <nova|...>` with CSS file inferred from `components.json`.
- **Fix:** Invoked as `pnpm dlx shadcn@latest init --template astro --base radix --preset nova --yes`. Resulting `components.json` has `baseColor: "neutral"` (preset-default) and `css: "src/styles/global.css"` — matching the plan's intent.
- **Files modified:** (command shape only; no file diff differed from plan outcome)
- **Verification:** `components.json` contains `"baseColor": "neutral"` and `"css": "src/styles/global.css"` — plan intent preserved.
- **Committed in:** `3578ad7`

**5. [Rule 1 — Bug] shadcn CLI silently created a `feat: initial commit` after init**
- **Found during:** Task 3.2, step 2 (post-init git status)
- **Issue:** shadcn CLI 4.2 runs `git commit` with a generic "feat: initial commit" message after init succeeds. This contaminated the git log with a non-conforming commit message and mixed shadcn's raw output with my brand-token merge.
- **Fix:** `git reset --soft HEAD~1` immediately after running shadcn init. Re-staged all files (shadcn init additions + my brand-@theme merge + uninstall of unwanted deps) and committed as a single logical unit with the conventional `feat(01-03): …` message describing the full operation. No history rewrite beyond the stub commit that shadcn made — my recorded `0f9cd8d` from Task 3.1 remained untouched.
- **Files modified:** (git history only)
- **Verification:** `git log --oneline -5` shows no `feat: initial commit` stub; `3578ad7` is the single Task 3.2 commit.
- **Committed in:** `3578ad7`

---

**Total deviations:** 5 auto-fixed (2 Rule 1 bug, 2 Rule 2 missing-critical, 1 Rule 3 blocking)
**Impact on plan:** All five deviations protect brand integrity and CLAUDE.md constraints. Deviations #1 and #3 were explicitly anticipated by the plan ("If shadcn overwrites @theme... preserve brand tokens"). #2 enforces D-03 / FND-03 font policy. #4 is a CLI version drift from the plan text. #5 cleans up git history that shadcn CLI polluted without authorization. No scope creep.

## Issues Encountered

- **CSS build warning during initial post-shadcn-init build** — `"file" is not a known CSS property` emitted from Tailwind oxide, traced to shadcn's `@import "shadcn/tailwind.css"` resolving to something that emitted a `.\[file\:lines\]{file:lines}` utility. Warning disappeared after Deviation #2 removed the bad import. Build now clean.
- **Vercel adapter Node 23 warning** — Same as prior waves: local Node 23.8.0 triggers `@astrojs/vercel` warning about unsupported engine; falls through to Node 24 at prod runtime. Expected and documented behavior.
- **shadcn's silent git commit** — flagged under Deviation #5. Future shadcn invocations in later waves should pass a flag to suppress this, or pre-check with `git stash` + `git commit --no-verify` workflow.

## User Setup Required

- **BLOCKING for Phase 5 launch** (not for Wave 4+ work): Maintainer must place the commercial Lovelace woff2 at `public/fonts/Lovelace.woff2` AND replace `public/fonts/LOVELACE-LICENSE.txt` placeholder with real license text from the Set Sail Studios receipt before production deploy. Until then, display type gracefully falls back to Playfair Display per `--font-display` stack.
- **Checkpoint verification pending** — Task 3.3 is a `checkpoint:human-verify` that cannot be auto-completed. User must run `pnpm dev`, open http://localhost:4321/, and verify:
  1. h1 renders in serif (Lovelace if supplied, else Playfair fallback)
  2. DevTools Network shows ZERO requests to `fonts.googleapis.com` / `fonts.gstatic.com`
  3. h1 color is brand deep green (`#2E4A2F`)
  4. body background is warm cream (`#F7EFD9`)
  5. If `/fonts/Lovelace.woff2` returns 404, note whether maintainer intends to supply the file before Phase 5

## Next Wave Readiness

- **Ready for Wave 4** (dev tooling — Biome, Vitest, Playwright, lefthook): lockfile stable, no token regressions, `pnpm build` passes.
- **Ready for Phase 2** (content sections): `bg-primary` / `text-ink` / `font-display` / `text-display-xl` / `text-eyebrow` all consumable as Tailwind utilities. Button component importable from `@/components/ui/button`. `cn()` helper importable from `@/lib/utils`.
- **Ready for Phase 3** (wizard island): React 19 runtime + shadcn foundation already in place; future `pnpm dlx shadcn add form input label` will install additional primitives under `src/components/ui/` against the same preserved token base.
- **Not blocking:** Lovelace woff2 + real license text (Phase 5 precondition).

## Threat Flags

None. No new network endpoints, auth paths, or file-access patterns introduced. Brand-token CSS is static, served from the same origin as the rest of the build output.

## Self-Check: PASSED

Verified against every acceptance criterion plus commit existence:

- ✅ `package.json` includes `tailwindcss`, `@tailwindcss/vite`, `@fontsource/playfair-display`, `@fontsource/work-sans`
- ✅ `package.json` does NOT include `@astrojs/tailwind`, `tw-animate-css`, `@fontsource-variable/geist`, or `shadcn` runtime dep
- ✅ `astro.config.mjs` contains `import tailwindcss from "@tailwindcss/vite"` + `plugins: [tailwindcss()]`
- ✅ `src/styles/global.css` contains `@import "tailwindcss"`, `@theme { ... }`, `@font-face { font-family: "Lovelace" ...}`
- ✅ Brand tokens present in global.css: `color-deep-amber`, `color-warm-cream`, `color-greens-deep`, `color-greens-mid`, `color-iron-black`, `color-southern-red`, `color-butter-gold`, `color-clay`
- ✅ Semantic tokens present: `color-primary`, `color-surface`, `color-accent`, `color-ink`
- ✅ Font stacks present: `font-display`, `font-serif`, `font-sans`
- ✅ Text scale present: `text-display-xl/lg/md`, `text-body-lg/md/sm`, `text-eyebrow`
- ✅ `src/pages/index.astro` imports `@fontsource/playfair-display/400.css` + `@fontsource/work-sans/400.css` + `../styles/global.css`
- ✅ `src/pages/index.astro` uses token utilities: `bg-surface text-ink font-sans font-display text-display-xl text-primary font-serif`
- ✅ `public/fonts/LOVELACE-LICENSE.txt` exists
- ✅ No `tailwind.config.js` or `tailwind.config.ts` in repo
- ✅ `tsconfig.json` contains `"@/*": ["./src/*"]`
- ✅ `components.json` exists (style=radix-nova, baseColor=neutral, css=src/styles/global.css)
- ✅ `src/lib/utils.ts` exports `cn`
- ✅ `src/components/ui/button.tsx` exports `Button` + `buttonVariants`
- ✅ Only `button.tsx` under `src/components/ui/` (D-08: Button-only in Phase 1)
- ✅ `pnpm build` exits 0; prerenders `/index.html`; bundles `.vercel/output/_functions/entry.mjs`
- ✅ Built CSS under `dist/client/_astro/` contains `color-deep-amber`, `color-greens-deep`, `Work Sans`
- ✅ Built CSS resolves `.text-primary` → `var(--color-primary)` → `var(--color-greens-deep)`
- ✅ `@/components/ui/button` and `@/lib/utils` resolve at build time (probe test)
- ✅ Commits `0f9cd8d` and `3578ad7` present in `git log --oneline`

---
*Phase: 01-foundation*
*Plan: 03*
*Completed: 2026-04-15 (Tasks 3.1 + 3.2; Task 3.3 awaiting human-verify checkpoint)*
