// Source: CONTEXT D-13 (sticky bar, hidden until valid) + EST-03 (range display) +
// EST-04 (equal-visual-weight confirmation copy — UI-SPEC §Live estimate copy line 224)
// + EST-07 (250ms debounce) + EST-08 (custom-quote path) + A11Y-05 (aria-live polite).
// T-03-22 mitigation: useWatch scoped subscription (not methods.watch()) + debounce.
import { useWatch } from "react-hook-form";
import { estimate } from "@/lib/pricing/estimate";
import type { PackageData } from "@/lib/schemas/packages";
import { useDebouncedValue } from "./hooks/useDebouncedValue";

interface Props {
  packages: readonly PackageData[];
}

/**
 * Sticky bottom bar inside the wizard Dialog. Renders nothing until a valid
 * guest count is present (avoids "$0–$0" flash per D-13). For valid 10–75 guest
 * ranges: shows estimate range + "Final quote confirmed by Chef Larry". For
 * custom-quote path (< 10, > 75, or packageId === "custom"): single centered
 * line.
 *
 * EST-04 EQUAL-VISUAL-WEIGHT CONTRACT (UI-SPEC §Live estimate copy line 224):
 * Both the range line and the chef-confirmation line use the same typography
 * token (`text-body-lg text-ink`). The range line adds `font-semibold`; the
 * confirmation line does not. Same size + same color = equal visual weight per
 * EST-04. DO NOT diminish the confirmation line to `text-body-md` — that would
 * violate the EST-04 contract.
 */
export default function StickyEstimateBar({ packages }: Props) {
  const guestCount = useWatch({ name: "guestCount" }) as number | string | undefined;
  const packageId = useWatch({ name: "packageId" }) as
    | "small"
    | "medium"
    | "large"
    | "custom"
    | undefined;
  const debouncedGuests = useDebouncedValue(Number(guestCount) || 0, 250);

  if (!debouncedGuests || debouncedGuests < 1) return null;

  const range = estimate({
    guests: debouncedGuests,
    packageId: packageId ?? "small",
    packages,
  });

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="sticky-estimate-bar"
      className="sticky bottom-0 left-0 right-0 bg-white border-t border-ink/10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] min-h-[72px] md:min-h-[80px] flex flex-col items-center justify-center px-4 py-4 motion-reduce:animate-none"
    >
      {range ? (
        <>
          {/* EST-04 (UI-SPEC §Live estimate copy line 224):
              Line 1 = range line; Line 2 = confirmation line.
              Both share the typography token `text-body-lg text-ink` →
              equal visual weight. Range line adds font-semibold; confirmation
              line does not. */}
          <p className="text-body-lg text-ink font-semibold" data-estimate-line="range">
            Estimated ${range.min}–${range.max}
          </p>
          <p className="text-body-lg text-ink" data-estimate-line="confirmation">
            Final quote confirmed by Chef Larry
          </p>
        </>
      ) : (
        <p className="text-body-lg text-ink text-center" data-estimate-line="custom">
          Custom quote — Chef Larry will follow up
        </p>
      )}
    </div>
  );
}
