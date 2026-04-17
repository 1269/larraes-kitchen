// Source: Plan 03-03 Task 3 — source-of-truth spec for StickyEstimateBar.
// Covers hidden/valid-range/custom-quote/EST-04 equal-visual-weight/A11Y-05.

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { PackageData } from "@/lib/schemas/packages";
import StickyEstimateBar from "../StickyEstimateBar";

const PACKAGES: readonly PackageData[] = [
  {
    id: "small",
    name: "Small",
    guestRange: { min: 10, max: 20 },
    pricePerPerson: { min: 22, max: 28 },
    includes: ["x"],
    popular: false,
    order: 1,
  },
  {
    id: "medium",
    name: "Medium",
    guestRange: { min: 21, max: 30 },
    pricePerPerson: { min: 20, max: 26 },
    includes: ["x"],
    popular: true,
    order: 2,
  },
  {
    id: "large",
    name: "Large",
    guestRange: { min: 31, max: 75 },
    pricePerPerson: { min: 18, max: 24 },
    includes: ["x"],
    popular: false,
    order: 3,
  },
];

function Wrapper({
  defaultValues,
  children,
}: {
  defaultValues: Record<string, unknown>;
  children: ReactNode;
}) {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("StickyEstimateBar", () => {
  it("renders nothing when guestCount is 0 (hidden-until-valid per D-13)", () => {
    const { container } = render(
      <Wrapper defaultValues={{ guestCount: 0, packageId: "small" }}>
        <StickyEstimateBar packages={PACKAGES} />
      </Wrapper>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Estimated $330–$420 for 15 small guests AND the chef-confirmation line", async () => {
    render(
      <Wrapper defaultValues={{ guestCount: 15, packageId: "small" }}>
        <StickyEstimateBar packages={PACKAGES} />
      </Wrapper>,
    );
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText(/Estimated \$330–\$420/)).toBeTruthy();
    expect(screen.getByText("Final quote confirmed by Chef Larry")).toBeTruthy();
  });

  it("renders Estimated $500–$650 for 25 medium guests", async () => {
    render(
      <Wrapper defaultValues={{ guestCount: 25, packageId: "medium" }}>
        <StickyEstimateBar packages={PACKAGES} />
      </Wrapper>,
    );
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText(/Estimated \$500–\$650/)).toBeTruthy();
  });

  it("EST-04: range + chef-confirmation lines share the same typography token (equal visual weight, UI-SPEC §Live estimate copy line 224)", async () => {
    render(
      <Wrapper defaultValues={{ guestCount: 15, packageId: "small" }}>
        <StickyEstimateBar packages={PACKAGES} />
      </Wrapper>,
    );
    await new Promise((r) => setTimeout(r, 300));
    const rangeEl = screen.getByText(/^Estimated \$330–\$420$/);
    const confirmEl = screen.getByText("Final quote confirmed by Chef Larry");
    // Both lines use text-body-lg + text-ink — matching size + color tokens.
    expect(rangeEl.className).toContain("text-body-lg");
    expect(rangeEl.className).toContain("text-ink");
    expect(confirmEl.className).toContain("text-body-lg");
    expect(confirmEl.className).toContain("text-ink");
    // DO NOT enforce identical classes — range is additionally font-semibold
    // by spec. Contract: same type-scale + same color = equal visual weight.
  });

  it("renders Custom quote — Chef Larry will follow up when packageId is 'custom'", async () => {
    render(
      <Wrapper defaultValues={{ guestCount: 100, packageId: "custom" }}>
        <StickyEstimateBar packages={PACKAGES} />
      </Wrapper>,
    );
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText("Custom quote — Chef Larry will follow up")).toBeTruthy();
  });

  it("has aria-live='polite' and role='status' (A11Y-05)", async () => {
    render(
      <Wrapper defaultValues={{ guestCount: 15, packageId: "small" }}>
        <StickyEstimateBar packages={PACKAGES} />
      </Wrapper>,
    );
    await new Promise((r) => setTimeout(r, 300));
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
  });
});
