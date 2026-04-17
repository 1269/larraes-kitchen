// Source: Plan 03-03 Task 2a — ProgressIndicator thin coverage.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressIndicator from "../ProgressIndicator";

describe("ProgressIndicator", () => {
  it("renders 4 step items", () => {
    render(<ProgressIndicator currentStep={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
  });

  it("marks the active step with aria-current='step'", () => {
    render(<ProgressIndicator currentStep={2} />);
    const items = screen.getAllByRole("listitem");
    const first = items[0];
    const second = items[1];
    const third = items[2];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();
    expect(first?.getAttribute("aria-current")).toBeNull();
    expect(second?.getAttribute("aria-current")).toBe("step");
    expect(third?.getAttribute("aria-current")).toBeNull();
  });

  it("shows the eyebrow line 'STEP N OF 4' matching currentStep", () => {
    render(<ProgressIndicator currentStep={3} />);
    expect(screen.getByText("STEP 3 OF 4")).toBeTruthy();
  });

  it("marks previous dots as complete (data-state='complete')", () => {
    const { container } = render(<ProgressIndicator currentStep={3} />);
    const dots = container.querySelectorAll("[data-step]");
    expect(dots).toHaveLength(4);
    expect(dots[0]?.getAttribute("data-state")).toBe("complete");
    expect(dots[1]?.getAttribute("data-state")).toBe("complete");
    expect(dots[2]?.getAttribute("data-state")).toBe("active");
    expect(dots[3]?.getAttribute("data-state")).toBe("inactive");
  });
});
