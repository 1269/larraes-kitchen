// Source: Plan 03-06 Task 1 — TDD RED tests for LEAD-12 Resend delivery webhook.
// Exercises HMAC signature verification (timingSafeEqual), JSON parse guard,
// and correlation-tag-driven status updates emitted by Plan 05 send.ts.
import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryLeadStore } from "@/lib/leads/InMemoryLeadStore";
import type { LeadRecord } from "@/lib/leads/LeadStore";
import { resetLeadStoreForTests } from "@/lib/leads/store";
import { POST } from "../resend";

const SECRET = "whsec_test_supersecret";

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("hex");
}

function fixture(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    createdAt: new Date().toISOString(),
    submissionId: "LK-AAAAAA",
    ulid: "01HZK4QY7PBM0RJAX3F9EMT4VG",
    idempotencyKey: "11111111-1111-4111-8111-111111111111",
    eventType: "family",
    guestCount: 15,
    eventDate: "2026-06-15",
    packageId: "small",
    finalEstimateMin: 330,
    finalEstimateMax: 420,
    name: "Test",
    email: "t@example.com",
    phone: "5105550000",
    zip: "",
    eventAddress: "",
    eventCity: "",
    notes: "",
    howHeard: "",
    contactMethod: "email",
    ipHash: "h".repeat(64),
    notifyEmailStatus: "pending",
    confirmEmailStatus: "pending",
    retryCount: 0,
    userAgent: "",
    ...overrides,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: test helper — constructs a minimal APIContext
function ctx(request: Request): any {
  return { request };
}

describe("Resend webhook POST", () => {
  let store: InMemoryLeadStore;
  beforeEach(() => {
    store = new InMemoryLeadStore();
    resetLeadStoreForTests(store);
    vi.stubEnv("RESEND_WEBHOOK_SECRET", SECRET);
  });

  it("returns 401 on invalid signature (no store mutation)", async () => {
    await store.append(fixture());
    const body = JSON.stringify({
      type: "email.delivered",
      data: { tags: { submission_id: "LK-AAAAAA", which: "notify" } },
    });
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
          headers: { "x-resend-signature": "deadbeef" },
        }),
      ),
    );
    expect(res.status).toBe(401);
    const after = await store.findByIdempotencyKey("11111111-1111-4111-8111-111111111111");
    expect(after?.notifyEmailStatus).toBe("pending");
  });

  it("returns 401 when signature header is missing", async () => {
    const body = JSON.stringify({ type: "email.delivered", data: {} });
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
        }),
      ),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is not valid JSON (even with valid signature)", async () => {
    const body = "not-json-at-all";
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
          headers: { "x-resend-signature": sign(body) },
        }),
      ),
    );
    expect(res.status).toBe(400);
  });

  it("marks sent on email.delivered with notify tag", async () => {
    await store.append(fixture());
    const body = JSON.stringify({
      type: "email.delivered",
      data: { tags: { submission_id: "LK-AAAAAA", which: "notify" } },
    });
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
          headers: { "x-resend-signature": sign(body) },
        }),
      ),
    );
    expect(res.status).toBe(200);
    const after = await store.findByIdempotencyKey("11111111-1111-4111-8111-111111111111");
    expect(after?.notifyEmailStatus).toBe("sent");
    expect(after?.confirmEmailStatus).toBe("pending");
  });

  it("marks failed on email.bounced with confirm tag", async () => {
    await store.append(fixture());
    const body = JSON.stringify({
      type: "email.bounced",
      data: { tags: { submission_id: "LK-AAAAAA", which: "confirm" } },
    });
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
          headers: { "x-resend-signature": sign(body) },
        }),
      ),
    );
    expect(res.status).toBe(200);
    const after = await store.findByIdempotencyKey("11111111-1111-4111-8111-111111111111");
    expect(after?.confirmEmailStatus).toBe("failed");
  });

  it("returns 200 handled:false when correlation tags are missing", async () => {
    const body = JSON.stringify({
      type: "email.delivered",
      data: { email_id: "r_abc", to: ["a@b.com"] },
    });
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
          headers: { "x-resend-signature": sign(body) },
        }),
      ),
    );
    expect(res.status).toBe(200);
    const parsed = await res.json();
    expect(parsed.handled).toBe(false);
  });

  it("accepts sha256=<hex> prefixed signature form", async () => {
    await store.append(fixture());
    const body = JSON.stringify({
      type: "email.delivered",
      data: { tags: { submission_id: "LK-AAAAAA", which: "notify" } },
    });
    const res = await POST(
      ctx(
        new Request("http://local/api/webhooks/resend", {
          method: "POST",
          body,
          headers: { "x-resend-signature": `sha256=${sign(body)}` },
        }),
      ),
    );
    expect(res.status).toBe(200);
    const after = await store.findByIdempotencyKey("11111111-1111-4111-8111-111111111111");
    expect(after?.notifyEmailStatus).toBe("sent");
  });
});
