// Source: Plan 03-03 Task 1 — every <behavior> line maps to an `it()` block.
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  pushClose,
  pushUrlState,
  readUrlState,
} from "../hooks/useUrlSync";

describe("readUrlState", () => {
  it("reads `?step=3&tier=medium` into { step: 3, tier: 'medium' }", () => {
    expect(readUrlState("?step=3&tier=medium")).toEqual({
      step: 3,
      tier: "medium",
    });
  });

  it("defaults step to 1 when absent", () => {
    expect(readUrlState("")).toEqual({ step: 1, tier: undefined });
  });

  it("clamps `?step=99` to 4 (upper bound)", () => {
    expect(readUrlState("?step=99").step).toBe(4);
  });

  it("clamps `?step=-2` to 1 (lower bound)", () => {
    expect(readUrlState("?step=-2").step).toBe(1);
  });

  it("returns tier: undefined for unknown tier values", () => {
    expect(readUrlState("?step=1&tier=bogus").tier).toBeUndefined();
  });

  it("accepts each valid tier id", () => {
    expect(readUrlState("?step=3&tier=small").tier).toBe("small");
    expect(readUrlState("?step=3&tier=medium").tier).toBe("medium");
    expect(readUrlState("?step=3&tier=large").tier).toBe("large");
  });
});

describe("pushUrlState", () => {
  beforeEach(() => {
    // Reset URL to a stable base between assertions.
    window.history.replaceState({}, "", "/");
  });

  it("pushes `/?step=2` when only step is provided", () => {
    const spy = vi.spyOn(window.history, "pushState");
    pushUrlState({ step: 2 });
    expect(spy).toHaveBeenCalledTimes(1);
    const call = spy.mock.calls[0];
    expect(call).toBeDefined();
    const [state, , url] = call as [unknown, string, string];
    expect(state).toEqual({ step: 2, tier: undefined });
    expect(url).toContain("step=2");
    expect(url).not.toContain("tier=");
    spy.mockRestore();
  });

  it("pushes `/?step=3&tier=medium` when both are provided", () => {
    const spy = vi.spyOn(window.history, "pushState");
    pushUrlState({ step: 3, tier: "medium" });
    const call = spy.mock.calls[0];
    expect(call).toBeDefined();
    const [, , url] = call as [unknown, string, string];
    expect(url).toContain("step=3");
    expect(url).toContain("tier=medium");
    spy.mockRestore();
  });
});

describe("pushClose", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?step=3");
  });

  it("pushes the pathname with no wizard params", () => {
    const spy = vi.spyOn(window.history, "pushState");
    pushClose();
    const call = spy.mock.calls[0];
    expect(call).toBeDefined();
    const [, , url] = call as [unknown, string, string];
    expect(url).not.toContain("step=");
    expect(url).not.toContain("tier=");
    spy.mockRestore();
  });
});
