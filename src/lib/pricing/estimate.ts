// Source: CONTEXT D-06 — typed stub; real implementation lands in Phase 3
import type { PackageData } from "../schemas/packages";

export interface EstimateInput {
  guests: number;
  packageId: PackageData["id"];
  packages: readonly PackageData[];
}

export interface EstimateRange {
  min: number;
  max: number;
}

/**
 * Pure, deterministic price estimator. Returns a range for the given guest
 * count against the pre-validated package data. Phase 3 will implement this.
 */
export function estimate(_input: EstimateInput): EstimateRange | null {
  // Phase 3 stub — deliberate throw so any accidental production call fails fast.
  throw new Error("estimate() not yet implemented — Phase 3");
}
