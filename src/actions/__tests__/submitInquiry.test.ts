// Source: Plan 03-05 Task 2 — integration test for the 9-step submitInquiry pipeline.
// RESEARCH §Pattern 2 (Action skeleton) + §Pattern 11 (silent decoy) + CONTEXT D-18 (error UX).
// Strategy: mock astro:content + astro:actions + Turnstile + email sends; use InMemoryLeadStore
// via resetLeadStoreForTests so we can inspect store.all() in assertions.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock astro:actions so ActionError is a plain constructor we can throw/inspect.
vi.mock("astro:actions", () => {
  class ActionError extends Error {
    code: string;
    constructor(opts: { code: string; message?: string }) {
      super(opts.message ?? opts.code);
      this.code = opts.code;
    }
  }
  const defineAction = <T>(cfg: T) => cfg;
  const isInputError = (e: unknown) => false;
  return { ActionError, defineAction, isInputError };
});

vi.mock("astro:content", () => ({
  getCollection: vi.fn(async () => [
    {
      data: {
        id: "small",
        name: "Small",
        guestRange: { min: 10, max: 20 },
        pricePerPerson: { min: 22, max: 28 },
        includes: ["x"],
        popular: false,
        order: 1,
      },
    },
    {
      data: {
        id: "medium",
        name: "Medium",
        guestRange: { min: 21, max: 30 },
        pricePerPerson: { min: 20, max: 26 },
        includes: ["x"],
        popular: true,
        order: 2,
      },
    },
    {
      data: {
        id: "large",
        name: "Large",
        guestRange: { min: 31, max: 75 },
        pricePerPerson: { min: 18, max: 24 },
        includes: ["x"],
        popular: false,
        order: 3,
      },
    },
  ]),
  getEntry: vi.fn(async () => ({ data: { email: "larrae@example.com" } })),
}));

vi.mock("@/lib/spam/turnstile", () => ({
  verifyTurnstile: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/email/send", () => ({
  sendLeadNotification: vi.fn(async () => {}),
  sendLeadConfirmation: vi.fn(async () => {}),
}));

import { submitInquiryHandler } from "../submitInquiry";
import { InMemoryLeadStore } from "@/lib/leads/InMemoryLeadStore";
import { resetLeadStoreForTests } from "@/lib/leads/store";
import type { LeadInput } from "@/lib/schemas/lead";

function baseInput(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    eventType: "family",
    guestCount: 15,
    eventDate: "2026-06-15",
    zip: "",
    packageId: "small",
    name: "Test User",
    email: "test@example.com",
    phone: "5105550000",
    eventAddress: "",
    eventCity: "",
    notes: "",
    howHeard: "",
    contactMethod: "email",
    honeypot: "",
    wizardMountedAt: Date.now() - 5000,
    idempotencyKey: "11111111-1111-4111-8111-111111111111",
    turnstileToken: "valid-token",
    ...overrides,
  };
}

const ctx = {
  clientAddress: "1.2.3.4",
  request: new Request("https://example.com/api/action", {
    headers: { "user-agent": "test-ua" },
  }),
};

describe("submitInquiryHandler", () => {
  let store: InMemoryLeadStore;
  beforeEach(async () => {
    store = new InMemoryLeadStore();
    resetLeadStoreForTests(store);
    vi.clearAllMocks();
    // Re-prime the default turnstile mock to success (vi.clearAllMocks clears impls).
    const { verifyTurnstile } = await import("@/lib/spam/turnstile");
    vi.mocked(verifyTurnstile).mockResolvedValue({ success: true });
    const { sendLeadNotification, sendLeadConfirmation } = await import(
      "@/lib/email/send"
    );
    vi.mocked(sendLeadNotification).mockResolvedValue(undefined);
    vi.mocked(sendLeadConfirmation).mockResolvedValue(undefined);
  });
  afterEach(() => {
    resetLeadStoreForTests();
  });

  it("happy path: stores the lead, sends both emails, returns submissionId + estimate", async () => {
    const { sendLeadNotification, sendLeadConfirmation } = await import(
      "@/lib/email/send"
    );
    const res = await submitInquiryHandler(
      baseInput(),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(res.submissionId).toMatch(/^LK-[A-Z0-9]{6}$/);
    expect(res.estimate).toEqual({ min: 330, max: 420 });
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0]?.notifyEmailStatus).toBe("sent");
    expect(store.all()[0]?.confirmEmailStatus).toBe("sent");
    expect(vi.mocked(sendLeadNotification)).toHaveBeenCalledOnce();
    expect(vi.mocked(sendLeadConfirmation)).toHaveBeenCalledOnce();
  });

  it("silent decoy on honeypot filled: returns 200-like success, no store, no email", async () => {
    const { sendLeadNotification, sendLeadConfirmation } = await import(
      "@/lib/email/send"
    );
    const res = await submitInquiryHandler(
      baseInput({ honeypot: "spam" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(res.submissionId).toMatch(/^LK-/);
    expect(res.estimate).toBeNull();
    expect(store.all()).toHaveLength(0);
    expect(vi.mocked(sendLeadNotification)).not.toHaveBeenCalled();
    expect(vi.mocked(sendLeadConfirmation)).not.toHaveBeenCalled();
  });

  it("silent decoy on min-time violation (< 3s): no store, no email", async () => {
    const res = await submitInquiryHandler(
      baseInput({ wizardMountedAt: Date.now() - 500 }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(res.submissionId).toMatch(/^LK-/);
    expect(store.all()).toHaveLength(0);
  });

  it("silent decoy on URL-in-notes: no store, no email", async () => {
    const res = await submitInquiryHandler(
      baseInput({ notes: "check http://spam.example" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(res.submissionId).toMatch(/^LK-/);
    expect(store.all()).toHaveLength(0);
  });

  it("throws FORBIDDEN on Turnstile verification failure; no store written", async () => {
    const { verifyTurnstile } = await import("@/lib/spam/turnstile");
    vi.mocked(verifyTurnstile).mockResolvedValue({
      success: false,
      "error-codes": ["invalid-input-response"],
    });
    await expect(
      submitInquiryHandler(
        baseInput(),
        ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(store.all()).toHaveLength(0);
  });

  it("throws TOO_MANY_REQUESTS when rate-limit cap is exceeded; no store written", async () => {
    const { hashIp } = await import("@/lib/leads/rateLimit");
    const ipHash = hashIp("1.2.3.4");
    for (let i = 0; i < 5; i++) {
      await store.recordRateLimitHit({
        ipHash,
        timestampMs: Date.now(),
        action: "submit",
      });
    }
    await expect(
      submitInquiryHandler(
        baseInput({ idempotencyKey: "22222222-2222-4222-8222-222222222222" }),
        ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
      ),
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(store.all()).toHaveLength(0);
  });

  it("idempotent replay returns the prior submissionId without re-appending or re-sending", async () => {
    const { sendLeadNotification } = await import("@/lib/email/send");
    const res1 = await submitInquiryHandler(
      baseInput(),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    const res2 = await submitInquiryHandler(
      baseInput(),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(res2.submissionId).toBe(res1.submissionId);
    expect(store.all()).toHaveLength(1);
    // Only the first call's email fan-out runs.
    expect(vi.mocked(sendLeadNotification)).toHaveBeenCalledTimes(1);
  });

  it("notify email fails → lead persists with notify='failed', confirm='sent'", async () => {
    const { sendLeadNotification } = await import("@/lib/email/send");
    vi.mocked(sendLeadNotification).mockRejectedValueOnce(new Error("resend down"));
    const res = await submitInquiryHandler(
      baseInput({ idempotencyKey: "33333333-3333-4333-8333-333333333333" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0]?.notifyEmailStatus).toBe("failed");
    expect(store.all()[0]?.confirmEmailStatus).toBe("sent");
    expect(res.submissionId).toMatch(/^LK-/);
  });

  it("both emails fail → lead persists with both statuses='failed' and Action still succeeds", async () => {
    const { sendLeadNotification, sendLeadConfirmation } = await import(
      "@/lib/email/send"
    );
    vi.mocked(sendLeadNotification).mockRejectedValueOnce(new Error("fail1"));
    vi.mocked(sendLeadConfirmation).mockRejectedValueOnce(new Error("fail2"));
    const res = await submitInquiryHandler(
      baseInput({ idempotencyKey: "44444444-4444-4444-8444-444444444444" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0]?.notifyEmailStatus).toBe("failed");
    expect(store.all()[0]?.confirmEmailStatus).toBe("failed");
    expect(res.submissionId).toMatch(/^LK-/);
  });

  it("stores the final estimate range computed server-side (not trusted from client)", async () => {
    await submitInquiryHandler(
      baseInput({ guestCount: 25, packageId: "medium" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(store.all()[0]?.finalEstimateMin).toBe(500);
    expect(store.all()[0]?.finalEstimateMax).toBe(650);
  });

  it("stores the SHA-256 ipHash (never the raw IP)", async () => {
    await submitInquiryHandler(
      baseInput({ idempotencyKey: "55555555-5555-4555-8555-555555555555" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    const record = store.all()[0];
    expect(record?.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(record?.ipHash).not.toBe("1.2.3.4");
  });

  it("captures the user-agent header from the request context", async () => {
    await submitInquiryHandler(
      baseInput({ idempotencyKey: "66666666-6666-4666-8666-666666666666" }),
      ctx as unknown as Parameters<typeof submitInquiryHandler>[1],
    );
    expect(store.all()[0]?.userAgent).toBe("test-ua");
  });
});
