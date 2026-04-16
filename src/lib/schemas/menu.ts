import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string(),
  category: z.enum(["proteins", "sides", "desserts"]),
  description: z.string(),
  dietary: z
    .array(z.enum(["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"]))
    .default([]),
  photo: z.string().optional(),
  photoAlt: z.string().optional(),
  order: z.number().int(),
});

export type MenuItem = z.infer<typeof menuItemSchema>;
