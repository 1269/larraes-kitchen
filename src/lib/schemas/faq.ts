import { z } from "zod";

export const faqGroupSchema = z.object({
  category: z.enum(["ordering", "delivery", "menu-customization", "payment"]),
  order: z.number().int(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).min(1),
});

export type FaqGroup = z.infer<typeof faqGroupSchema>;
