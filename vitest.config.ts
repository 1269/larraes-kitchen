import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Virtual Astro modules are only resolved by `astro build` / `astro dev`.
      // Tests stub them so vi.mock can override behavior without Vite's
      // import-analysis failing on unresolved specifiers.
      "astro:actions": fileURLToPath(
        new URL("./tests/unit/stubs/astro-actions.ts", import.meta.url),
      ),
      "astro:content": fileURLToPath(
        new URL("./tests/unit/stubs/astro-content.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/unit/setup.ts"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.test.tsx",
    ],
    exclude: [
      "tests/smoke.spec.ts",
      "tests/e2e/**",
      "node_modules/**",
      "dist/**",
      ".vercel/**",
      ".astro/**",
    ],
    globals: false,
  },
});
