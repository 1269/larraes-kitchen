// Source: CONTEXT D-15 (confirmation content) + UI-SPEC §Confirmation view copy
// (lines 253-262, verbatim) + A11Y-03 (focus to heading).
import { useEffect, useRef } from "react";
import type { LeadInput } from "@/lib/schemas/lead";
import type { PackageData } from "@/lib/schemas/packages";

interface Props {
  submissionId: string;
  values: Partial<LeadInput>;
  packages: readonly PackageData[];
  finalEstimate: { min: number; max: number } | null;
  onBackToSite: () => void;
}

function firstNameOf(fullName: string | undefined): string {
  if (!fullName) return "friend";
  const trimmed = fullName.trim();
  if (!trimmed) return "friend";
  const first = trimmed.split(/\s+/)[0];
  return first ?? trimmed;
}

function tierNameOf(
  packageId: string | undefined,
  packages: readonly PackageData[],
): string {
  if (packageId === "custom") return "Custom quote";
  const pkg = packages.find((p) => p.id === packageId);
  return pkg?.name ?? "—";
}

function eventTypeLabel(eventType: string | undefined): string {
  if (eventType === "family") return "Family";
  if (eventType === "social") return "Social";
  if (eventType === "corporate") return "Corporate";
  return "—";
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  // Preserve the authored YYYY-MM-DD — the confirmation screen echoes what
  // the user typed, and the email copy also uses the raw ISO form.
  return iso;
}

/**
 * Post-submit confirmation view. Focus lands on the heading on mount (A11Y-03
 * step 6). "Back to site" closes the modal and returns to `/`.
 */
export default function ConfirmationView({
  submissionId,
  values,
  packages,
  finalEstimate,
  onBackToSite,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const firstName = firstNameOf(values.name);
  const tierName = tierNameOf(values.packageId, packages);
  const estimateLine = finalEstimate
    ? `$${finalEstimate.min}–$${finalEstimate.max}`
    : "Custom quote";

  return (
    <div data-testid="confirmation-view" className="bg-surface">
      <p className="text-body-sm uppercase tracking-[0.12em] text-accent font-semibold">
        REQUEST RECEIVED
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-display-md text-ink leading-tight focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 rounded-sm"
      >
        Thanks, {firstName} — your request is in.
      </h1>

      <div className="mt-8">
        <p className="text-body-sm text-ink font-semibold">What you told us:</p>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-body-md text-ink">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Event type</dt>
            <dd>{eventTypeLabel(values.eventType)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Guests</dt>
            <dd>{values.guestCount ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Date</dt>
            <dd>{formatDate(values.eventDate)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Package</dt>
            <dd>{tierName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Estimated</dt>
            <dd>{estimateLine}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-8 text-body-md text-ink">
        Reference:{" "}
        <span className="font-mono text-body-lg text-ink">{submissionId}</span>
      </p>

      <p className="mt-6 text-body-md text-ink">
        Larrae will reply within 24 hours to confirm details and send a final
        quote. Keep an eye on your inbox — and your spam folder, just in case.
      </p>

      <button
        type="button"
        onClick={onBackToSite}
        className="mt-8 w-full sm:w-auto rounded-full bg-primary text-white hover:bg-primary/90 min-h-[44px] px-8 py-3 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
      >
        Back to site
      </button>
    </div>
  );
}
