// Source: OBS-01 + UI-SPEC §Analytics Integration + T-03-16 (PII discipline).
// Explicit allowlist of event properties — no email/phone/name/notes keys permitted.
import { track } from "@vercel/analytics";

type EntryPoint = "hero" | "nav" | "package_card" | "contact_section";
type FailureReason =
  | "turnstile"
  | "rate_limit"
  | "server_error"
  | "network"
  | "validation";

export const wizardAnalytics = {
  start: (props: {
    entryPoint: EntryPoint;
    tierPreselected?: "small" | "medium" | "large";
  }) => track("wizard_start", props),

  stepComplete: (
    step: 1 | 2 | 3 | 4,
    props: { eventType?: string; guestCount?: number; packageId?: string },
  ) => track("wizard_step_complete", { step, ...props }),

  submitSuccess: (props: {
    submissionId: string;
    packageId: string;
    guestCount: number;
    eventType: string;
    estimateMin: number | null;
    estimateMax: number | null;
  }) => track("wizard_submit_success", props),

  submitFailure: (reason: FailureReason) =>
    track("wizard_submit_failure", { reason }),

  dismissDirty: (step: number) => track("wizard_dismiss_dirty", { step }),
};
