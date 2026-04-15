import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
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
