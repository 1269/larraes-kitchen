// Source: Plan 03-06 Task 2 — Playwright config with Turnstile test-key isolation (B5/SPAM-06).
//
// CRITICAL — Turnstile test-key isolation strategy:
//
// Cloudflare publishes Turnstile test keys that always pass / always block:
//   site key  : 1x00000000000000000000AA       (always-passes)
//   secret key: 1x0000000000000000000000000000000AA (always-passes)
//
// Plan 02's scripts/check-turnstile-keys.sh (SPAM-06 CI gate) greps the
// production `dist/` for these literals and fails the build if found. We MUST
// keep those strings out of `.env` / `.env.production` files — Astro/Vite read
// those at `pnpm build` time and bake PUBLIC_* vars into the client bundle.
//
// Isolation strategy: inject the test keys into the Playwright webServer
// subprocess via `webServer.env` ONLY. The subprocess inherits these as OS
// env vars; Vite's env loader prioritizes process.env over dotfiles. We use
// `pnpm dev` (NOT `pnpm build && pnpm preview`) as the webServer command
// because:
//   (a) @astrojs/vercel does not support `astro preview`, so `pnpm preview`
//       fails outright (Rule 3 blocker — plan body's pattern was infeasible).
//   (b) `pnpm dev` (astro dev) reads process.env at REQUEST time — it never
//       produces a `dist/` at all. The test keys exist only in the dev-server
//       subprocess memory. Nothing is written to disk.
//   (c) Production deploys run `pnpm build` (Vercel build step) without these
//       env vars set — Vercel's env UI is the source of truth for real keys.
//
// Developer verification:
//   pnpm build && scripts/check-turnstile-keys.sh dist   # exits 0 (clean)
//   pnpm exec playwright test                             # uses dev-server with test keys
//
// DO NOT write these literals into .env / .env.production / .env.development.
import { defineConfig, devices } from "@playwright/test";

// Cloudflare-documented Turnstile test keys — process-scoped ONLY.
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Process-scoped env — NEVER written to disk.
        // Vite/Astro reads these INSTEAD of .env files when set here.
        // SPAM-06 production gate stays clean because production `pnpm build`
        // runs without these vars set (Vercel env UI supplies real keys).
        env: {
          PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEY,
          TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRET_KEY,
        },
      },
});
