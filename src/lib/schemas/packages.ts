// Source: CONTEXT D-05, D-06 + RESEARCH § Code Examples. Canonical template.
import { z } from "zod";

export const packageSchema = z.object({
  id: z.enum(["small", "medium", "large"]),
  name: z.string(),
  guestRange: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }).refine((r) => r.min <= r.max, "min must be <= max"),
  pricePerPerson: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }).refine((r) => r.min <= r.max, "min must be <= max"),
  includes: z.array(z.string()).min(1),
  popular: z.boolean().default(false),
  order: z.number().int(),
});

export type PackageData = z.infer<typeof packageSchema>;
