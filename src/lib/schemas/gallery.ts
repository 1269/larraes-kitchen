import { z } from "zod";

export const gallerySchema = z.object({
  image: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  aspectRatio: z.enum(["1:1", "4:3", "3:2", "16:9", "3:4", "2:3", "9:16"]),
  order: z.number().int(),
});

export type GalleryImage = z.infer<typeof gallerySchema>;
