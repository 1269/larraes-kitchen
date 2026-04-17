// Source: CONTEXT D-10/D-11/D-12 + RESEARCH §Pattern 5 + EST-01..EST-08
import type { PackageData } from "../schemas/packages";

export interface EstimateInput {
  guests: number;
  packageId: PackageData["id"] | "custom";
  packages: readonly PackageData[];
}

export interface EstimateRange {
  min: number;
  max: number;
}

/** Round a number to the nearest $10 (D-10 pricing contract). */
const round10 = (n: number): number => Math.round(n / 10) * 10;

/**
 * Find the package whose `guestRange.[min, max]` covers `guests`.
 * Returns null if no package matches (guest count below smallest tier min or
 * above largest tier max).
 */
export function tierForGuests(
  guests: number,
  packages: readonly PackageData[],
): PackageData | null {
  return packages.find((p) => guests >= p.guestRange.min && guests <= p.guestRange.max) ?? null;
}

/**
 * Pure, deterministic price estimator. Returns a $10-rounded range for the
 * given guest count against `packages`. Honors the explicit `packageId`
 * choice (D-11 soft-override) within the tier system — e.g. 15 guests with
 * packageId="large" still estimates against Large's pricing even though 15
 * normally maps to Small. Returns null for:
 *   - out-of-range guests (< 1 or > 200) per EST-08
 *   - guests falling outside the union of all tier ranges (i.e. no tier
 *     covers them — the custom-quote path per D-12 is taken by the caller)
 *   - packageId === "custom" per D-12 (custom-quote path has no numeric range)
 *   - chosen/derived package not found in `packages`
 */
export function estimate(input: EstimateInput): EstimateRange | null {
  const { guests, packageId, packages } = input;
  if (!Number.isFinite(guests) || guests < 1 || guests > 200) return null;
  if (packageId === "custom") return null;

  // No tier covers these guests → custom-quote path; caller handles UX.
  if (!tierForGuests(guests, packages)) return null;

  // Within the tier system: honor explicit packageId over the guest-derived tier
  // (D-11 soft-override). Falls back to tierForGuests only if the explicit id
  // isn't present in `packages` (defensive — ids should always match).
  const pkg = packages.find((p) => p.id === packageId) ?? tierForGuests(guests, packages);
  if (!pkg) return null;

  return {
    min: round10(guests * pkg.pricePerPerson.min),
    max: round10(guests * pkg.pricePerPerson.max),
  };
}
