// Source: CONTEXT D-05, D-07..D-09, D-14, D-19 + RESEARCH §Pattern 1 + REQUIREMENTS LEAD-01/04/07, SPAM-01/03/04, WIZ-11. Canonical template.
import { z } from "zod";
import { validateEventDate } from "@/components/wizard/validation/eventDate";

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

/**
 * WR-03: Server-side business-rule validation for `eventDate`. The client-side
 * `onBlur` handler in Step2GuestsDate.tsx runs the same `validateEventDate`
 * against site lead-time and blackout config, but a bot that bypasses the
 * client and posts directly to the Astro Action can submit a past date or
 * blackout date because `leadSchema` only checks the YYYY-MM-DD format. This
 * helper re-applies the same business rules on the server BEFORE `store.append`
 * so a bypass path cannot persist a logically-invalid lead.
 *
 * Kept as a separate helper (rather than folding into `leadSchema.superRefine`)
 * to preserve the existing client/server schema parity — the same `leadSchema`
 * parses on both sides; only the server pipeline calls this extra check.
 *
 * Returns `null` on valid, or the UI-SPEC-locked error string on invalid.
 */
export function validateLeadBusinessRules(
  input: Pick<LeadInput, "eventDate">,
  site: { leadTimeDays: number; blackoutDates: readonly string[]; email?: string },
): string | null {
  return validateEventDate(input.eventDate, {
    leadTimeDays: site.leadTimeDays,
    blackoutDates: site.blackoutDates,
    siteEmail: site.email,
  });
}
