import { z } from "zod";

export const siteSchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string().default("US"),
  }),
  phone: z.string(),
  email: z.string().email(),
  serviceArea: z.array(z.string()).min(1),
  hours: z.array(z.object({
    days: z.string(),
    open: z.string(),
    close: z.string(),
  })),
  social: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    google: z.string().url().optional(),
  }).default({}),
  leadTimeDays: z.number().int().positive().default(7),
  blackoutDates: z.array(z.string()).default([]),
  responseTime: z.string().default("We respond within 24 hours"),
});

export type SiteData = z.infer<typeof siteSchema>;
