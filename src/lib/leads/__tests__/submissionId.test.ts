// Source: CONTEXT D-19 (LK-XXXXXX format) + PATTERNS §submissionId.ts + Plan 03-04 Task 1 behavior.
import { describe, expect, it } from "vitest";
import { makeSubmissionId, shortOf } from "../submissionId";

describe("shortOf", () => {
  it("produces LK- prefix + last 6 chars uppercased", () => {
    const u = "01hzk4qy7pbm0rjax3f9emt4vg";
    expect(shortOf(u)).toBe(`LK-${u.slice(-6).toUpperCase()}`);
  });
  it("is already uppercase-safe for already-uppercased ULIDs", () => {
    const u = "01HZK4QY7PBM0RJAX3F9EMT4VG";
    expect(shortOf(u)).toBe("LK-MT4VG0".replace("MT4VG0", u.slice(-6).toUpperCase()));
    expect(shortOf(u)).toBe(`LK-${u.slice(-6).toUpperCase()}`);
  });
});

describe("makeSubmissionId", () => {
  it("returns a 26-char ULID and matching LK-XXXXXX short form", () => {
    const { ulid: u, submissionId } = makeSubmissionId();
    expect(u).toHaveLength(26);
    // Crockford alphabet: 0-9, A-Z, excluding I, L, O, U
    expect(submissionId).toMatch(/^LK-[0-9A-HJKMNP-TV-Z]{6}$/);
  });
  it("short form is derived from the ULID tail", () => {
    const { ulid: u, submissionId } = makeSubmissionId();
    expect(submissionId).toBe(`LK-${u.slice(-6).toUpperCase()}`);
  });
  it("1000 IDs are (effectively) collision-free at a 6-char slice", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) ids.add(makeSubmissionId().submissionId);
    // Full 26-char ULIDs are collision-free; the last-6 slice has ~1B entropy
    // so collisions within a 1000-sample are vanishingly unlikely. Floor 995.
    expect(ids.size).toBeGreaterThanOrEqual(995);
  });
});
