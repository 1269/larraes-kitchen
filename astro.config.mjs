// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://larraeskitchen.com", // PUBLIC_SITE_URL; finalized in Phase 5
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: false }, // Phase 4 flips this on
    imageService: true,
  }),
  integrations: [react(), mdx(), sitemap()],
});
