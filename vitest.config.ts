import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
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
