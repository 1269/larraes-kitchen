// Source: CONTEXT D-05, D-07..D-09, D-14, D-19 + RESEARCH §Pattern 1 + REQUIREMENTS LEAD-01/04/07, SPAM-01/03/04, WIZ-11. Canonical template.
import { z } from "zod";

export const leadSchema = z.object({
  // Step 1 — Event type (D-05, D-06)
  eventType: z.enum(["family", "social", "corporate"]),

  // Step 2 — Guests & date (D-07, D-08)
  guestCount: z.coerce.number().int().min(1).max(500),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD date format"),
  zip: z
    .string()
    .regex(/^\d{5}$/)
    .optional()
    .or(z.literal("")),

  // Step 3 — Package tier (D-10, D-11, D-12)
  packageId: z.enum(["small", "medium", "large", "custom"]),

  // Step 4 — Contact required (D-14)
  name: z.string().min(1).max(200),
  email: z.email().max(320),
  phone: z.string().min(7).max(32),

  // Step 4 — Contact optional (D-14)
  eventAddress: z.string().max(500).optional().or(z.literal("")),
  eventCity: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  howHeard: z.enum(["google", "instagram", "word-of-mouth", "other", ""]).optional().default(""),
  contactMethod: z.enum(["email", "phone", "text"]).default("email"),

  // Bot gates + system fields (SPAM-01, SPAM-03, LEAD-04)
  honeypot: z.string().max(0), // MUST be empty; any content = bot
  wizardMountedAt: z.coerce.number().int().positive(),
  idempotencyKey: z.string().uuid(),
  turnstileToken: z.string().min(1),
});

export type LeadInput = z.infer<typeof leadSchema>;
