// Source: CONTEXT D-10 (estimate range), D-11 (auto-select matching tier),
// D-12 (custom-quote path) + UI-SPEC §Components Inventory (Step 3 cards) +
// §Color (butter-gold "Recommended" badge reuses PackagesSection pattern) +
// §Copywriting Contract (custom-quote card copy verbatim).
import { Check } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { tierForGuests } from "@/lib/pricing/estimate";
import type { PackageData } from "@/lib/schemas/packages";

type TierId = "small" | "medium" | "large" | "custom";

interface Props {
  packages: readonly PackageData[];
}

export default function Step3Package({ packages }: Props) {
  const { watch, setValue, formState, register } = useFormContext();
  const guestCount = Number(watch("guestCount")) || 0;
  const selected = watch("packageId") as TierId | undefined;
  const error = formState.errors.packageId?.message as string | undefined;

  register("packageId");

  const isCustomPath = guestCount > 0 && (guestCount < 10 || guestCount > 75);
  const recommendedTier = tierForGuests(guestCount, packages);
  const sorted = [...packages].sort((a, b) => a.order - b.order);

  // Auto-select on entry: custom path auto-picks 'custom'; otherwise auto-pick
  // the matching tier unless the user has already chosen one (D-11).
  useEffect(() => {
    if (isCustomPath && selected !== "custom") {
      setValue("packageId", "custom", { shouldDirty: false });
      return;
    }
    if (!isCustomPath && !selected && recommendedTier) {
      setValue("packageId", recommendedTier.id, { shouldDirty: false });
    }
  }, [isCustomPath, recommendedTier, selected, setValue]);

  // Mismatch soft note (D-11). Non-blocking — copy follows UI-SPEC §Inline hints.
  let mismatchNote: string | null = null;
  if (!isCustomPath && selected && selected !== "custom" && recommendedTier) {
    if (selected !== recommendedTier.id) {
      const selectedPkg = packages.find((p) => p.id === selected);
      if (selectedPkg) {
        mismatchNote = `${selectedPkg.name} covers ${selectedPkg.guestRange.min}–${selectedPkg.guestRange.max} — double-check your guest count.`;
      }
    }
  }

  if (isCustomPath) {
    return (
      <div className="mt-6">
        <label
          className={[
            "block rounded-lg p-6 md:p-8",
            "bg-white border-2 transition-colors motion-reduce:transition-none",
            "border-primary bg-clay/5",
            "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
          ].join(" ")}
        >
          <input
            type="radio"
            name="packageId-visual"
            value="custom"
            checked={selected === "custom"}
            onChange={() =>
              setValue("packageId", "custom", {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="sr-only"
          />
          <h3 className="font-serif italic text-display-md text-ink">Custom quote</h3>
          <p className="mt-3 text-body-md text-ink/90">
            Groups of this size are unique — Chef Larry will tailor a menu, headcount plan, and
            price together with you within 24 hours.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-body-sm font-semibold text-primary">
            <Check className="size-4" aria-hidden="true" /> Selected
          </span>
        </label>
        {error && (
          <p
            id="packageId-error"
            role="alert"
            className="mt-3 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div
        role="radiogroup"
        aria-label="Package tier"
        aria-invalid={!!error}
        aria-describedby={error ? "packageId-error" : undefined}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {sorted.map((pkg) => {
          const isSelected = selected === pkg.id;
          const isRecommended = recommendedTier != null && recommendedTier.id === pkg.id;
          const cardClass = [
            "relative flex flex-col rounded-lg p-6 md:p-8",
            "bg-white border-2 transition-colors motion-reduce:transition-none",
            "min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
            isSelected ? "border-primary bg-clay/5" : "border-ink/10 hover:border-primary/40",
          ].join(" ");
          return (
            <label key={pkg.id} className={cardClass}>
              <input
                type="radio"
                name="packageId-visual"
                value={pkg.id}
                checked={isSelected}
                onChange={() =>
                  setValue("packageId", pkg.id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="sr-only"
              />
              {isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-butter-gold)] px-3 py-1 text-body-sm uppercase tracking-[0.12em] font-semibold text-ink">
                  Recommended for {guestCount} guests
                </span>
              )}
              <h3 className="font-serif italic text-display-md text-ink">{pkg.name}</h3>
              <p className="mt-1 text-body-sm font-semibold uppercase tracking-[0.08em] text-ink/60">
                {pkg.guestRange.min}–{pkg.guestRange.max} guests
              </p>
              <div className="mt-4">
                <p className="font-serif italic text-display-md text-ink">
                  ${pkg.pricePerPerson.min}–${pkg.pricePerPerson.max}
                </p>
                <p className="text-body-sm text-ink/60">per person</p>
              </div>
              <ul className="mt-4 space-y-2 text-body-md text-ink/90">
                {pkg.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-1" aria-hidden="true" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
              {isSelected && (
                <span className="mt-4 inline-flex items-center gap-2 text-body-sm font-semibold text-primary">
                  <Check className="size-4" aria-hidden="true" /> Selected
                </span>
              )}
            </label>
          );
        })}
      </div>
      {mismatchNote && <p className="mt-3 text-body-sm text-ink/60">{mismatchNote}</p>}
      {error && (
        <p
          id="packageId-error"
          role="alert"
          className="mt-3 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
        >
          {error}
        </p>
      )}
    </div>
  );
}
