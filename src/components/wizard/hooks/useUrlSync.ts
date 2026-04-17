// Source: CONTEXT D-04 (pushState URL sync — /?step=N&tier=X) + WIZ-05 + WIZ-09 (deep-link)
// + RESEARCH §Pattern 3. T-03-15 mitigation: the TypeScript-typed pushUrlState signature
// only accepts { step, tier } — PII cannot be accidentally serialized into the URL.
import { useEffect } from "react";

export type UrlStep = 1 | 2 | 3 | 4;
export type UrlTier = "small" | "medium" | "large" | undefined;

/**
 * Parse the URL querystring into step/tier. Clamps invalid `step` values into
 * the 1..4 range (anything < 1 or NaN becomes 1; anything > 4 becomes 4).
 * Unknown tier values return undefined.
 */
export function readUrlState(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): { step: UrlStep; tier: UrlTier } {
  const params = new URLSearchParams(search);
  const stepRaw = Number(params.get("step"));
  let step: UrlStep = 1;
  if (Number.isFinite(stepRaw)) {
    if (stepRaw < 1) step = 1;
    else if (stepRaw > 4) step = 4;
    else step = Math.floor(stepRaw) as UrlStep;
  }
  const tierRaw = params.get("tier");
  const tier: UrlTier =
    tierRaw === "small" || tierRaw === "medium" || tierRaw === "large"
      ? tierRaw
      : undefined;
  return { step, tier };
}

/** pushState with `/?step=N&tier=X` (tier optional). PII-safe by signature. */
export function pushUrlState({
  step,
  tier,
}: { step: UrlStep; tier?: UrlTier }): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  params.set("step", String(step));
  if (tier) params.set("tier", tier);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ step, tier }, "", url);
}

/** pushState without any wizard params (closes the modal history entry). */
export function pushClose(): void {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", window.location.pathname);
}

/** Hook wrapper — attach a popstate listener for the wizard's lifetime. */
export function usePopStateListener(
  cb: (state: { step?: UrlStep }) => void,
): void {
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      cb((e.state as { step?: UrlStep }) ?? readUrlState());
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [cb]);
}
