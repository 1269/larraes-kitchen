// Source: LEAD-03 + RESEARCH §Rate Limit Strategy + Plan 03-04 Task 1 behavior.
// Pure helper tests only — store-backed rate-limit integration lives in InMemoryLeadStore.test.ts (Task 2).
import { describe, expect, it } from "vitest";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, hashIp } from "../rateLimit";

describe("hashIp", () => {
  it("returns a 64-char hex SHA-256 string", () => {
    const h = hashIp("127.0.0.1");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it("is deterministic for the same input", () => {
    expect(hashIp("127.0.0.1")).toBe(hashIp("127.0.0.1"));
    expect(hashIp("203.0.113.42")).toBe(hashIp("203.0.113.42"));
  });
  it("produces different hashes for different IPs", () => {
    expect(hashIp("127.0.0.1")).not.toBe(hashIp("127.0.0.2"));
    expect(hashIp("10.0.0.1")).not.toBe(hashIp("10.0.0.2"));
  });
  it("hashes the empty string without throwing (unknown-IP bucket)", () => {
    const h = hashIp("");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it("raw IP is not present anywhere in the hash (SHA-256 output only)", () => {
    expect(hashIp("127.0.0.1")).not.toContain("127");
    expect(hashIp("127.0.0.1")).not.toContain("0.0.1");
  });
});

describe("rate limit constants", () => {
  it("RATE_LIMIT_MAX is 5 per LEAD-03", () => {
    expect(RATE_LIMIT_MAX).toBe(5);
  });
  it("RATE_LIMIT_WINDOW_MS is 10 minutes (600_000ms)", () => {
    expect(RATE_LIMIT_WINDOW_MS).toBe(10 * 60 * 1000);
    expect(RATE_LIMIT_WINDOW_MS).toBe(600_000);
  });
});
