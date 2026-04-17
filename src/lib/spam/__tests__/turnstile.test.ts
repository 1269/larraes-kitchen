// Source: Plan 03-05 Task 1 — Cloudflare Turnstile server-verify client.
// RESEARCH §Pattern 9 + LEAD-02. Must never throw — returns `{ success: false, "error-codes": [...] }` on every failure.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "../turnstile";

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("POSTs to Cloudflare siteverify with secret + response + remoteip + idempotency_key and returns parsed body on success", async () => {
    const mockFetch = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, challenge_ts: "2026-04-17T01:00:00Z" }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await verifyTurnstile("valid-token", "1.2.3.4", "idem-uuid");

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    const [url, init] = call;
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init.method).toBe("POST");
    const body = init.body as URLSearchParams;
    expect(body.toString()).toContain("secret=test-secret");
    expect(body.toString()).toContain("response=valid-token");
    expect(body.toString()).toContain("remoteip=1.2.3.4");
    expect(body.toString()).toContain("idempotency_key=idem-uuid");
  });

  it("returns success:false with Cloudflare error-codes when response body indicates failure", async () => {
    const mockFetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await verifyTurnstile("bad-token", "1.2.3.4", "idem");
    expect(result.success).toBe(false);
    expect(result["error-codes"]).toEqual(["invalid-input-response"]);
  });

  it("returns success:false with http-<status> error-code on non-OK HTTP response", async () => {
    const mockFetch = vi.fn(async () => new Response("Bad Request", { status: 400 }));
    vi.stubGlobal("fetch", mockFetch);

    const result = await verifyTurnstile("token", "1.2.3.4", "idem");
    expect(result.success).toBe(false);
    expect(result["error-codes"]).toEqual(["http-400"]);
  });

  it("returns success:false with network-error when fetch throws", async () => {
    const mockFetch = vi.fn(async () => {
      throw new Error("econnreset");
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await verifyTurnstile("token", "1.2.3.4", "idem");
    expect(result.success).toBe(false);
    expect(result["error-codes"]).toEqual(["network-error"]);
  });

  it("returns success:false with missing-input-secret when TURNSTILE_SECRET_KEY is unset", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await verifyTurnstile("token", "1.2.3.4", "idem");
    expect(result.success).toBe(false);
    expect(result["error-codes"]).toEqual(["missing-input-secret"]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
