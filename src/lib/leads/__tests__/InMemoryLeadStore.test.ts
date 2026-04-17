// Source: Plan 03-04 Task 2 behavior — InMemoryLeadStore must satisfy LeadStore exactly, and
// rateLimitCheck (Task 1) must compose with it end-to-end. Sheets adapter is integration-tested
// against a real spreadsheet in Plan 05's Action tests; Task 2 only covers the in-memory path.
import { beforeEach, describe, expect, it } from "vitest";
import type { LeadRecord } from "../LeadStore";
import { InMemoryLeadStore } from "../InMemoryLeadStore";
import { RATE_LIMIT_MAX, hashIp, rateLimitCheck } from "../rateLimit";

function fixtureLead(overrides: Partial<LeadRecord> = {}): LeadRecord {
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
    zip: "94510",
    eventAddress: "",
    eventCity: "Benicia",
    notes: "",
    howHeard: "google",
    contactMethod: "email",
    ipHash: "hash1",
    notifyEmailStatus: "pending",
    confirmEmailStatus: "pending",
    retryCount: 0,
    userAgent: "test-ua",
    ...overrides,
  };
}

describe("InMemoryLeadStore", () => {
  let store: InMemoryLeadStore;
  beforeEach(() => {
    store = new InMemoryLeadStore();
  });

  describe("append + findByIdempotencyKey", () => {
    it("round-trips an appended record", async () => {
      const r = fixtureLead();
      const returned = await store.append(r);
      expect(returned).toEqual(r);
      expect(await store.findByIdempotencyKey(r.idempotencyKey)).toEqual(r);
    });
    it("returns null when idempotency key is absent", async () => {
      expect(await store.findByIdempotencyKey("not-there")).toBeNull();
    });
    it("finds records by idempotency key among many", async () => {
      const a = fixtureLead({
        submissionId: "LK-A1",
        idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      });
      const b = fixtureLead({
        submissionId: "LK-B2",
        idempotencyKey: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      });
      await store.append(a);
      await store.append(b);
      expect(await store.findByIdempotencyKey(a.idempotencyKey)).toEqual(a);
      expect(await store.findByIdempotencyKey(b.idempotencyKey)).toEqual(b);
    });
  });

  describe("updateEmailStatuses", () => {
    it("mutates notify + confirm statuses for the matching submissionId", async () => {
      const r = fixtureLead();
      await store.append(r);
      await store.updateEmailStatuses(r.submissionId, { notify: "sent", confirm: "failed" });
      const after = await store.findByIdempotencyKey(r.idempotencyKey);
      expect(after?.notifyEmailStatus).toBe("sent");
      expect(after?.confirmEmailStatus).toBe("failed");
    });
    it("no-ops when submissionId is not found", async () => {
      await expect(
        store.updateEmailStatuses("LK-UNKNOWN", { notify: "sent", confirm: "sent" }),
      ).resolves.toBeUndefined();
    });
  });

  describe("findPendingEmails", () => {
    it("returns only records older than minAgeMs with pending email status", async () => {
      const old = fixtureLead({
        submissionId: "LK-OLD",
        idempotencyKey: "22222222-2222-4222-8222-222222222222",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      });
      const fresh = fixtureLead({
        submissionId: "LK-NEW",
        idempotencyKey: "33333333-3333-4333-8333-333333333333",
        createdAt: new Date().toISOString(),
      });
      await store.append(old);
      await store.append(fresh);
      const pending = await store.findPendingEmails({ maxRetries: 3, minAgeMs: 60 * 60 * 1000 });
      expect(pending.map((p) => p.submissionId)).toEqual(["LK-OLD"]);
    });
    it("excludes records at or above maxRetries", async () => {
      const r = fixtureLead({
        submissionId: "LK-SPENT",
        idempotencyKey: "44444444-4444-4444-8444-444444444444",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        retryCount: 3,
      });
      await store.append(r);
      const pending = await store.findPendingEmails({ maxRetries: 3, minAgeMs: 60 * 60 * 1000 });
      expect(pending).toEqual([]);
    });
    it("excludes records where all emails are already sent", async () => {
      const r = fixtureLead({
        submissionId: "LK-SENT",
        idempotencyKey: "55555555-5555-4555-8555-555555555555",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notifyEmailStatus: "sent",
        confirmEmailStatus: "sent",
      });
      await store.append(r);
      const pending = await store.findPendingEmails({ maxRetries: 3, minAgeMs: 60 * 60 * 1000 });
      expect(pending).toEqual([]);
    });
  });

  describe("markEmailRetry", () => {
    it("bumps retryCount and sets the notify column", async () => {
      const r = fixtureLead();
      await store.append(r);
      await store.markEmailRetry(r.submissionId, "notify", "sent");
      const after = await store.findByIdempotencyKey(r.idempotencyKey);
      expect(after?.notifyEmailStatus).toBe("sent");
      expect(after?.confirmEmailStatus).toBe("pending");
      expect(after?.retryCount).toBe(1);
    });
    it("bumps retryCount and sets the confirm column", async () => {
      const r = fixtureLead();
      await store.append(r);
      await store.markEmailRetry(r.submissionId, "confirm", "failed");
      const after = await store.findByIdempotencyKey(r.idempotencyKey);
      expect(after?.confirmEmailStatus).toBe("failed");
      expect(after?.notifyEmailStatus).toBe("pending");
      expect(after?.retryCount).toBe(1);
    });
    it("no-ops when submissionId is not found", async () => {
      await expect(
        store.markEmailRetry("LK-UNKNOWN", "notify", "sent"),
      ).resolves.toBeUndefined();
    });
  });

  describe("rate-limit integration (composed with rateLimitCheck)", () => {
    it("allows up to RATE_LIMIT_MAX submissions, then blocks", async () => {
      const ip = hashIp("127.0.0.1");
      for (let i = 0; i < RATE_LIMIT_MAX; i++) {
        const res = await rateLimitCheck(store, ip);
        expect(res.allowed).toBe(true);
        expect(res.current).toBe(i + 1);
      }
      const blocked = await rateLimitCheck(store, ip);
      expect(blocked.allowed).toBe(false);
      expect(blocked.current).toBe(RATE_LIMIT_MAX);
    });
    it("tracks different ipHashes independently", async () => {
      const a = hashIp("10.0.0.1");
      const b = hashIp("10.0.0.2");
      for (let i = 0; i < RATE_LIMIT_MAX; i++) await rateLimitCheck(store, a);
      // a is now exhausted
      expect((await rateLimitCheck(store, a)).allowed).toBe(false);
      // b has a fresh bucket
      expect((await rateLimitCheck(store, b)).allowed).toBe(true);
    });
    it("ignores hits outside the rolling window", async () => {
      const ip = hashIp("203.0.113.1");
      // Seed an ancient hit directly; it should be excluded from the window count.
      await store.recordRateLimitHit({
        ipHash: ip,
        timestampMs: Date.now() - 60 * 60 * 1000, // 1h ago — well outside the 10-minute window
        action: "submit",
      });
      const res = await rateLimitCheck(store, ip);
      expect(res.allowed).toBe(true);
      expect(res.current).toBe(1); // the ancient hit doesn't count
    });
  });

  describe("test-only helpers", () => {
    it("clear() empties the store", async () => {
      await store.append(fixtureLead());
      store.clear();
      expect(await store.findByIdempotencyKey(fixtureLead().idempotencyKey)).toBeNull();
    });
  });
});
