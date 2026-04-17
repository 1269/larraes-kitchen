// Source: SPAM-01/03/04 + RESEARCH §Pattern 11 + CONTEXT D-18 + Plan 03-04 Task 1 behavior.
import { describe, expect, it } from "vitest";
import { MIN_TIME_MS, checkHoneypot, checkMinTime, checkUrlHeuristics } from "../botGates";

describe("checkHoneypot", () => {
  it("returns true (pass) when honeypot is empty string", () => {
    expect(checkHoneypot({ honeypot: "" })).toBe(true);
  });
  it("returns false (bot) when honeypot has any non-empty content", () => {
    expect(checkHoneypot({ honeypot: "http://evil" })).toBe(false);
    expect(checkHoneypot({ honeypot: "anything at all" })).toBe(false);
    expect(checkHoneypot({ honeypot: " " })).toBe(false);
  });
});

describe("checkMinTime", () => {
  const now = 1_700_000_000_000;
  it("returns true when elapsed >= MIN_TIME_MS", () => {
    expect(checkMinTime({ wizardMountedAt: now - MIN_TIME_MS }, now)).toBe(true);
    expect(checkMinTime({ wizardMountedAt: now - (MIN_TIME_MS + 1) }, now)).toBe(true);
    expect(checkMinTime({ wizardMountedAt: now - 10_000 }, now)).toBe(true);
  });
  it("returns false when elapsed < MIN_TIME_MS", () => {
    expect(checkMinTime({ wizardMountedAt: now - (MIN_TIME_MS - 1) }, now)).toBe(false);
    expect(checkMinTime({ wizardMountedAt: now - 100 }, now)).toBe(false);
    expect(checkMinTime({ wizardMountedAt: now }, now)).toBe(false);
  });
  it("returns false for invalid/unset mount timestamps", () => {
    expect(checkMinTime({ wizardMountedAt: 0 }, now)).toBe(false);
    expect(checkMinTime({ wizardMountedAt: -1 }, now)).toBe(false);
    expect(checkMinTime({ wizardMountedAt: Number.NaN }, now)).toBe(false);
    expect(checkMinTime({ wizardMountedAt: Number.POSITIVE_INFINITY }, now)).toBe(false);
  });
  it("MIN_TIME_MS is 3000 (3s) per SPAM-03", () => {
    expect(MIN_TIME_MS).toBe(3000);
  });
});

describe("checkUrlHeuristics", () => {
  it("returns true (pass) when all fields are empty", () => {
    expect(checkUrlHeuristics({ notes: "", eventAddress: "" })).toBe(true);
    expect(checkUrlHeuristics({})).toBe(true);
  });
  it("returns true when fields contain no URL-like patterns", () => {
    expect(checkUrlHeuristics({ notes: "gluten free please", eventAddress: "123 First St, Benicia" })).toBe(true);
  });
  it("returns false when notes contain http(s):// URLs", () => {
    expect(checkUrlHeuristics({ notes: "check out http://evil.example" })).toBe(false);
    expect(checkUrlHeuristics({ notes: "see https://evil.example/page" })).toBe(false);
  });
  it("returns false when notes contain www.-prefixed domains", () => {
    expect(checkUrlHeuristics({ notes: "visit www.cheap.example for more" })).toBe(false);
  });
  it("returns false when eventAddress contains a URL", () => {
    expect(
      checkUrlHeuristics({ notes: "best option.", eventAddress: "123 First St. https://evil" }),
    ).toBe(false);
  });
  it("returns false when name contains a URL", () => {
    expect(checkUrlHeuristics({ name: "http://spam.example" })).toBe(false);
  });
  it("is case-insensitive", () => {
    expect(checkUrlHeuristics({ notes: "HTTP://EVIL" })).toBe(false);
    expect(checkUrlHeuristics({ notes: "WWW.EVIL.EXAMPLE" })).toBe(false);
  });
});
