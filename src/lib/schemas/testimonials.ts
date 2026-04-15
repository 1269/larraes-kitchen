import { z } from "zod";

export const testimonialSchema = z.object({
  clientName: z.string(),
  eventType: z.enum(["family", "social", "corporate", "other"]),
  quote: z.string(),
  rating: z.number().int().min(1).max(5),
  order: z.number().int(),
});

export type TestimonialData = z.infer<typeof testimonialSchema>;
