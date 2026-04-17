import { describe, expect, it } from "vitest";
import { leadSchema, type LeadInput } from "./lead";

/** Minimal valid lead — mutate specific fields to construct failure cases. */
function validLead(overrides: Partial<Record<keyof LeadInput, unknown>> = {}): Record<string, unknown> {
  return {
    eventType: "family",
    guestCount: 25,
    eventDate: "2026-06-15",
    zip: "94510",
    packageId: "medium",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "5105550123",
    eventAddress: "",
    eventCity: "",
    notes: "",
    howHeard: "",
    contactMethod: "email",
    honeypot: "",
    wizardMountedAt: 1700000000000,
    idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
    turnstileToken: "test-token",
    ...overrides,
  };
}

describe("leadSchema", () => {
  it("accepts a fully valid LeadInput object", () => {
    const result = leadSchema.safeParse(validLead());
    expect(result.success).toBe(true);
  });

  it("rejects a missing eventType with field-level error keyed at eventType", () => {
    const { eventType, ...rest } = validLead();
    void eventType;
    const result = leadSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["eventType"]);
    }
  });

  it("rejects guestCount: 0 but accepts guestCount: 1", () => {
    expect(leadSchema.safeParse(validLead({ guestCount: 0 })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ guestCount: 1 })).success).toBe(true);
  });

  it("rejects guestCount: 501 but accepts guestCount: 500", () => {
    expect(leadSchema.safeParse(validLead({ guestCount: 501 })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ guestCount: 500 })).success).toBe(true);
  });

  it("rejects eventDate: '06/15/2026' but accepts '2026-06-15'", () => {
    expect(leadSchema.safeParse(validLead({ eventDate: "06/15/2026" })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ eventDate: "2026-06-15" })).success).toBe(true);
  });

  it("rejects email: 'not-an-email' but accepts 'you@example.com'", () => {
    expect(leadSchema.safeParse(validLead({ email: "not-an-email" })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ email: "you@example.com" })).success).toBe(true);
  });

  it("rejects phone shorter than 7 characters", () => {
    expect(leadSchema.safeParse(validLead({ phone: "510555" })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ phone: "5105550" })).success).toBe(true);
  });

  it("rejects zip: '9451' (4 digits) but accepts '94510' and empty string", () => {
    expect(leadSchema.safeParse(validLead({ zip: "9451" })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ zip: "94510" })).success).toBe(true);
    expect(leadSchema.safeParse(validLead({ zip: "" })).success).toBe(true);
  });

  it("rejects honeypot with any content (must be exactly empty string)", () => {
    expect(leadSchema.safeParse(validLead({ honeypot: "filled-in-by-bot" })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ honeypot: "" })).success).toBe(true);
  });

  it("rejects idempotencyKey: 'not-a-uuid' but accepts a valid v4 UUID", () => {
    expect(leadSchema.safeParse(validLead({ idempotencyKey: "not-a-uuid" })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ idempotencyKey: "550e8400-e29b-41d4-a716-446655440000" })).success).toBe(true);
  });

  it("rejects packageId: 'xl' but accepts small | medium | large | custom", () => {
    expect(leadSchema.safeParse(validLead({ packageId: "xl" })).success).toBe(false);
    for (const p of ["small", "medium", "large", "custom"] as const) {
      expect(leadSchema.safeParse(validLead({ packageId: p })).success).toBe(true);
    }
  });

  it("coerces guestCount: '25' (string) to 25 (number)", () => {
    const result = leadSchema.safeParse(validLead({ guestCount: "25" }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guestCount).toBe(25);
      expect(typeof result.data.guestCount).toBe("number");
    }
  });

  it("coerces wizardMountedAt: '1697123456789' (string) to number", () => {
    const result = leadSchema.safeParse(validLead({ wizardMountedAt: "1697123456789" }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wizardMountedAt).toBe(1697123456789);
      expect(typeof result.data.wizardMountedAt).toBe("number");
    }
  });

  it("rejects name longer than 200 characters", () => {
    expect(leadSchema.safeParse(validLead({ name: "x".repeat(201) })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ name: "x".repeat(200) })).success).toBe(true);
  });

  it("rejects notes longer than 2000 characters", () => {
    expect(leadSchema.safeParse(validLead({ notes: "x".repeat(2001) })).success).toBe(false);
    expect(leadSchema.safeParse(validLead({ notes: "x".repeat(2000) })).success).toBe(true);
  });

  it("rejects eventType: 'wedding' (outside enum) but accepts family/social/corporate", () => {
    expect(leadSchema.safeParse(validLead({ eventType: "wedding" })).success).toBe(false);
    for (const t of ["family", "social", "corporate"] as const) {
      expect(leadSchema.safeParse(validLead({ eventType: t })).success).toBe(true);
    }
  });

  it("rejects empty turnstileToken (min 1)", () => {
    expect(leadSchema.safeParse(validLead({ turnstileToken: "" })).success).toBe(false);
  });

  it("accepts howHeard default when omitted", () => {
    const { howHeard, ...rest } = validLead();
    void howHeard;
    const result = leadSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.howHeard).toBe("");
    }
  });

  it("accepts contactMethod default when omitted", () => {
    const { contactMethod, ...rest } = validLead();
    void contactMethod;
    const result = leadSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactMethod).toBe("email");
    }
  });
});
