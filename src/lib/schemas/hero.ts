import { z } from "zod";

export const heroSchema = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  ctaText: z.string(),
  priceChip: z.string(),
  heroImage: z.string(),
  heroImageAlt: z.string(),
});

export type HeroData = z.infer<typeof heroSchema>;
