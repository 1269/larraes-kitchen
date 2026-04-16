# Phase 2 — Deferred Items

Out-of-scope discoveries logged by executor agents. Not addressed in the current plan.

## 02-01 Plan

### Zod v4 deprecation warnings in src/lib/schemas/site.ts

- **Found during:** Task 3 (BaseLayout.astro astro check verification)
- **Location:** src/lib/schemas/site.ts lines 13, 24, 25, 26
- **Issue:** Zod 4.x deprecates the bare `.email()` and `.url()` method signatures in favor of `z.email()` / `z.url()` top-level constructors or new signature. Emits 4 TypeScript hints (ts(6385) `deprecated`).
- **Scope:** Pre-existing Phase 1 code (src/lib/schemas/*.ts). NOT caused by plan 02-01 changes.
- **Severity:** hint only — `astro check` returns 0 errors and 0 warnings. Does not block build.
- **Recommended follow-up:** Phase 4 (SEO/perf/quality) or a focused `/gsd-quick` sweep to migrate all schemas to Zod 4 idioms.
