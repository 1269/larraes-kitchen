import { describe, expect, it } from "vitest";
import type { PackageData } from "../schemas/packages";
import { estimate, tierForGuests } from "./estimate";

// Fixture mirrors src/content/packages/{small,medium,large}.md values exactly.
const PACKAGES: readonly PackageData[] = [
  {
    id: "small",
    name: "Small",
    guestRange: { min: 10, max: 20 },
    pricePerPerson: { min: 22, max: 28 },
    includes: ["placeholder"],
    popular: false,
    order: 1,
  },
  {
    id: "medium",
    name: "Medium",
    guestRange: { min: 21, max: 30 },
    pricePerPerson: { min: 20, max: 26 },
    includes: ["placeholder"],
    popular: true,
    order: 2,
  },
  {
    id: "large",
    name: "Large",
    guestRange: { min: 31, max: 75 },
    pricePerPerson: { min: 18, max: 24 },
    includes: ["placeholder"],
    popular: false,
    order: 3,
  },
];

describe("tierForGuests()", () => {
  it("returns null for 9 guests (below Small minimum)", () => {
    expect(tierForGuests(9, PACKAGES)).toBeNull();
  });

  it("returns small for 10 guests (Small minimum)", () => {
    expect(tierForGuests(10, PACKAGES)?.id).toBe("small");
  });

  it("returns small for 20 guests (Small maximum)", () => {
    expect(tierForGuests(20, PACKAGES)?.id).toBe("small");
  });

  it("returns medium for 21 guests (Medium minimum)", () => {
    expect(tierForGuests(21, PACKAGES)?.id).toBe("medium");
  });

  it("returns medium for 30 guests (Medium maximum)", () => {
    expect(tierForGuests(30, PACKAGES)?.id).toBe("medium");
  });

  it("returns large for 31 guests (Large minimum)", () => {
    expect(tierForGuests(31, PACKAGES)?.id).toBe("large");
  });

  it("returns large for 75 guests (Large maximum)", () => {
    expect(tierForGuests(75, PACKAGES)?.id).toBe("large");
  });

  it("returns null for 76 guests (above Large maximum)", () => {
    expect(tierForGuests(76, PACKAGES)).toBeNull();
  });
});

describe("estimate()", () => {
  it("returns null for guests < 1 (out-of-range, EST-08)", () => {
    expect(estimate({ guests: 0, packageId: "small", packages: PACKAGES })).toBeNull();
  });

  it("returns null for guests > 200 (out-of-range, EST-08)", () => {
    expect(estimate({ guests: 201, packageId: "large", packages: PACKAGES })).toBeNull();
  });

  it("returns null for packageId === 'custom' (D-12)", () => {
    expect(estimate({ guests: 50, packageId: "custom", packages: PACKAGES })).toBeNull();
  });

  it("honors explicit packageId choice over tier-for-guests (D-11 override)", () => {
    // 15 guests would match small tier, but user picked large — respect choice.
    const result = estimate({ guests: 15, packageId: "large", packages: PACKAGES });
    expect(result).toEqual({
      min: 270, // 15 × 18 = 270 (already $10-rounded)
      max: 360, // 15 × 24 = 360 (already $10-rounded)
    });
  });

  it("rounds min/max to nearest $10 (D-10)", () => {
    // 23 × 20 = 460 (exact), 23 × 26 = 598 → rounds to 600
    const result = estimate({ guests: 23, packageId: "medium", packages: PACKAGES });
    expect(result).toEqual({ min: 460, max: 600 });
  });

  it("returns {min:330,max:420} for guests:15 packageId:small", () => {
    expect(estimate({ guests: 15, packageId: "small", packages: PACKAGES })).toEqual({
      min: 330,
      max: 420,
    });
  });

  it("returns {min:500,max:650} for guests:25 packageId:medium", () => {
    expect(estimate({ guests: 25, packageId: "medium", packages: PACKAGES })).toEqual({
      min: 500,
      max: 650,
    });
  });

  it("returns {min:900,max:1200} for guests:50 packageId:large", () => {
    expect(estimate({ guests: 50, packageId: "large", packages: PACKAGES })).toEqual({
      min: 900,
      max: 1200,
    });
  });

  describe("boundary table (EST-06)", () => {
    const cases: Array<
      [number, "small" | "medium" | "large", { min: number; max: number } | null]
    > = [
      [9, "small", null], // out-of-range below small (covered by estimate guard for <1 only, but tier miss)
      [10, "small", { min: 220, max: 280 }],
      [11, "small", { min: 240, max: 310 }], // 11×22=242→240, 11×28=308→310
      [20, "small", { min: 440, max: 560 }],
      [21, "medium", { min: 420, max: 550 }], // 21×20=420, 21×26=546→550
      [30, "medium", { min: 600, max: 780 }],
      [31, "large", { min: 560, max: 740 }], // 31×18=558→560, 31×24=744→740
      [75, "large", { min: 1350, max: 1800 }],
      [76, "large", null], // out-of-range above large (tier miss → null)
    ];
    it.each(cases)("guests=%i packageId=%s → expected", (guests, packageId, expected) => {
      expect(estimate({ guests, packageId, packages: PACKAGES })).toEqual(expected);
    });
  });

  describe("exhaustive 1..200 sweep (EST-05)", () => {
    it("every integer 1..200 either produces a range or null — no throws", () => {
      for (let g = 1; g <= 200; g++) {
        const tier =
          PACKAGES.find((p) => g >= p.guestRange.min && g <= p.guestRange.max)?.id ?? "small";
        const result = estimate({ guests: g, packageId: tier, packages: PACKAGES });
        if (g < 10 || g > 75) {
          expect(result).toBeNull();
        } else {
          expect(result).not.toBeNull();
          if (result) {
            expect(result.min).toBeGreaterThan(0);
            expect(result.max).toBeGreaterThanOrEqual(result.min);
            expect(result.min % 10).toBe(0);
            expect(result.max % 10).toBe(0);
          }
        }
      }
    });
  });
});
