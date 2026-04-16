import { z } from "zod";

export const aboutSchema = z.object({
  heritageNarrative: z.string().min(150).max(2500),
  positioning: z.string(),
  chefPortrait: z.string().optional(),
  chefPortraitAlt: z.string().optional(),
});

export type AboutData = z.infer<typeof aboutSchema>;
