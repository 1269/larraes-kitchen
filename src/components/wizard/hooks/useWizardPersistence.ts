// Source: CONTEXT D-03 (dirty-aware dismiss retains state) + WIZ-04 (sessionStorage persist)
// + RESEARCH §Pattern 3 (Wizard state persistence) + §Pitfall 5 (SSR hydration mismatch).
// Uses sessionStorage (per-tab, cleared on tab close) per T-03-14 threat disposition.
import type { LeadInput } from "@/lib/schemas/lead";

const STORAGE_KEY = "lk_wizard_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h — D-03 "your progress is saved"

export interface WizardSnapshot {
  values: Partial<LeadInput>;
  savedAt: number;
}

/**
 * Load the persisted wizard snapshot. Returns undefined when:
 *   - no snapshot exists
 *   - SSR (no `window`)
 *   - snapshot is > 24h old (auto-cleared)
 *   - parse fails
 */
export function loadSnapshot(): Partial<LeadInput> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as WizardSnapshot;
    if (!parsed || typeof parsed !== "object" || !parsed.savedAt) return undefined;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    return parsed.values;
  } catch {
    return undefined;
  }
}

/** Save the wizard snapshot. No-op on SSR or quota-exceeded. */
export function saveSnapshot(values: Partial<LeadInput>): void {
  if (typeof window === "undefined") return;
  try {
    const snapshot: WizardSnapshot = { values, savedAt: Date.now() };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota exceeded — non-fatal */
  }
}

/** Remove the wizard snapshot. Called on successful submit (per WIZ-04). */
export function clearSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
