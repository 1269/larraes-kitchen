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
