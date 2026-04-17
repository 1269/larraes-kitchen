// Source: Plan 03-06 Task 1 — TDD RED tests for LEAD-11 daily retry cron.
// Exercises bearer auth, pending scan, retry outcome persistence, and maxRetries cap.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryLeadStore } from "@/lib/leads/InMemoryLeadStore";
import type { LeadRecord } from "@/lib/leads/LeadStore";
import { resetLeadStoreForTests } from "@/lib/leads/store";

vi.mock("@/lib/email/send", () => ({
  sendLeadNotification: vi.fn(async () => {}),
  sendLeadConfirmation: vi.fn(async () => {}),
}));

import { sendLeadConfirmation, sendLeadNotification } from "@/lib/email/send";
import { GET } from "../retry-email";

function fixture(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    // 2h old so it clears the 1h minAgeMs floor
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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

describe("retry-email cron GET", () => {
  let store: InMemoryLeadStore;
  beforeEach(() => {
    store = new InMemoryLeadStore();
    resetLeadStoreForTests(store);
    vi.stubEnv("CRON_SECRET", "supersecret");
    vi.mocked(sendLeadNotification).mockReset().mockResolvedValue(undefined);
    vi.mocked(sendLeadConfirmation).mockReset().mockResolvedValue(undefined);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await GET(ctx(new Request("http://local/api/cron/retry-email")));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("unauthorized");
  });

  it("returns 401 when Bearer token is wrong", async () => {
    const res = await GET(
      ctx(
        new Request("http://local/api/cron/retry-email", {
          headers: { authorization: "Bearer nope" },
        }),
      ),
    );
    expect(res.status).toBe(401);
  });

  it("scans pending leads, retries both emails, marks both sent on success", async () => {
    await store.append(fixture());
    const res = await GET(
      ctx(
        new Request("http://local/api/cron/retry-email", {
          headers: { authorization: "Bearer supersecret" },
        }),
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scanned).toBe(1);
    expect(body.sent).toBe(2);
    expect(body.failed).toBe(0);
    expect(sendLeadNotification).toHaveBeenCalledTimes(1);
    expect(sendLeadConfirmation).toHaveBeenCalledTimes(1);
    const after = await store.findByIdempotencyKey("11111111-1111-4111-8111-111111111111");
    expect(after?.notifyEmailStatus).toBe("sent");
    expect(after?.confirmEmailStatus).toBe("sent");
  });

  it("marks failed when notify send throws", async () => {
    vi.mocked(sendLeadNotification).mockRejectedValueOnce(new Error("resend_down"));
    await store.append(fixture());
    const res = await GET(
      ctx(
        new Request("http://local/api/cron/retry-email", {
          headers: { authorization: "Bearer supersecret" },
        }),
      ),
    );
    const body = await res.json();
    expect(body.scanned).toBe(1);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(1);
    const after = await store.findByIdempotencyKey("11111111-1111-4111-8111-111111111111");
    expect(after?.notifyEmailStatus).toBe("failed");
    expect(after?.confirmEmailStatus).toBe("sent");
  });

  it("skips records whose retryCount has reached the max cap (3)", async () => {
    await store.append(fixture({ retryCount: 3 }));
    const res = await GET(
      ctx(
        new Request("http://local/api/cron/retry-email", {
          headers: { authorization: "Bearer supersecret" },
        }),
      ),
    );
    const body = await res.json();
    expect(body.scanned).toBe(0);
    expect(sendLeadNotification).not.toHaveBeenCalled();
    expect(sendLeadConfirmation).not.toHaveBeenCalled();
  });

  it("returns scanned:0 when store has no pending leads", async () => {
    await store.append(fixture({ notifyEmailStatus: "sent", confirmEmailStatus: "sent" }));
    const res = await GET(
      ctx(
        new Request("http://local/api/cron/retry-email", {
          headers: { authorization: "Bearer supersecret" },
        }),
      ),
    );
    const body = await res.json();
    expect(body.scanned).toBe(0);
    expect(sendLeadNotification).not.toHaveBeenCalled();
  });
});
