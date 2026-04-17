// Source: Plan 03-03 Task 1 — every <behavior> line maps to an `it()` block.
// UI-SPEC §Field validation error strings (lines 204-207) are the locked error copy.
import { describe, expect, it } from "vitest";
import { addDays, validateEventDate } from "../validation/eventDate";

describe("addDays", () => {
  it("handles month rollover via UTC arithmetic (no timezone drift)", () => {
    expect(addDays("2026-04-28", 7)).toBe("2026-05-05");
  });
});

describe("validateEventDate", () => {
  it("returns null for a valid future date outside lead-time and blackouts", () => {
    expect(
      validateEventDate("2026-06-15", {
        leadTimeDays: 7,
        blackoutDates: [],
        todayIso: "2026-04-16",
      }),
    ).toBeNull();
  });

  it("returns lead-time error when the date is inside the lead window", () => {
    expect(
      validateEventDate("2026-04-20", {
        leadTimeDays: 7,
        blackoutDates: [],
        todayIso: "2026-04-16",
      }),
    ).toBe("We need at least 7 days lead time. Try 2026-04-23 or later.");
  });

  it("returns blackout error with email suffix when the date is blacked out", () => {
    expect(
      validateEventDate("2026-12-25", {
        leadTimeDays: 7,
        blackoutDates: ["2026-12-25"],
        todayIso: "2026-04-16",
        siteEmail: "hello@larraeskitchen.com",
      }),
    ).toBe(
      "We're closed on 2026-12-25. Pick another day or email us at hello@larraeskitchen.com.",
    );
  });

  it("returns blackout error without suffix when no email is provided", () => {
    expect(
      validateEventDate("2026-12-25", {
        leadTimeDays: 7,
        blackoutDates: ["2026-12-25"],
        todayIso: "2026-04-16",
      }),
    ).toBe("We're closed on 2026-12-25. Pick another day.");
  });

  it("returns past-date error when the date is today or earlier", () => {
    expect(
      validateEventDate("2026-04-15", {
        leadTimeDays: 7,
        blackoutDates: [],
        todayIso: "2026-04-16",
      }),
    ).toBe("Please pick a date in the future.");
  });

  it("returns format error when the date is not YYYY-MM-DD", () => {
    expect(
      validateEventDate("06/15/2026", {
        leadTimeDays: 7,
        blackoutDates: [],
        todayIso: "2026-04-16",
      }),
    ).toBe("Use YYYY-MM-DD date format");
  });
});
