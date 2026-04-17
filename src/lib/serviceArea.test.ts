import { describe, expect, it } from "vitest";
import { BENICIA_SERVICE_AREA_ZIPS, resolveServiceAreaCity } from "./serviceArea";

describe("resolveServiceAreaCity()", () => {
  it("returns 'Benicia' for the canonical Benicia ZIP 94510", () => {
    expect(resolveServiceAreaCity("94510")).toBe("Benicia");
  });

  it("returns 'Vallejo' for an adjacent Vallejo ZIP (94591)", () => {
    expect(resolveServiceAreaCity("94591")).toBe("Vallejo");
  });

  it("returns null for an out-of-area ZIP (99999)", () => {
    expect(resolveServiceAreaCity("99999")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(resolveServiceAreaCity("")).toBeNull();
  });

  it("returns null for a non-5-digit input (too short)", () => {
    expect(resolveServiceAreaCity("9451")).toBeNull();
  });

  it("returns null for a non-5-digit input (too long)", () => {
    expect(resolveServiceAreaCity("945101")).toBeNull();
  });

  it("returns null for a non-numeric string", () => {
    expect(resolveServiceAreaCity("abcde")).toBeNull();
  });

  it("BENICIA_SERVICE_AREA_ZIPS is frozen and contains 94510 → Benicia", () => {
    expect(Object.isFrozen(BENICIA_SERVICE_AREA_ZIPS)).toBe(true);
    expect(BENICIA_SERVICE_AREA_ZIPS["94510"]).toBe("Benicia");
  });
});
