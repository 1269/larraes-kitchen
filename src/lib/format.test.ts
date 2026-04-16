import { describe, expect, it } from "vitest";
import { formatPhone } from "./format";

describe("formatPhone", () => {
  it("formats raw 10-digit US phone", () => {
    expect(formatPhone("5105550123")).toBe("(510) 555-0123");
  });
  it("reformats already-formatted phone", () => {
    expect(formatPhone("(510) 555-0123")).toBe("(510) 555-0123");
  });
  it("returns input unchanged when not 10 digits", () => {
    expect(formatPhone("510")).toBe("510");
    expect(formatPhone("15105550123")).toBe("15105550123");
  });
  it("returns empty string when given empty", () => {
    expect(formatPhone("")).toBe("");
  });
});
