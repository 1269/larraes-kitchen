// Source: CONTEXT D-07 (chips + numeric), D-08 (native date), D-09 (ZIP pre-fill)
// + UI-SPEC §Copywriting Contract (chip labels verbatim, placeholders, inline hints)
// + WIZ-07 (iOS 16px font floor), WIZ-08 (44px touch), WIZ-10 (lead-time/blackout),
// WIZ-11 (soft ZIP check), WIZ-14 (motion-reduce) + resolveServiceAreaCity (Wave 1).
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { resolveServiceAreaCity } from "@/lib/serviceArea";
import { validateEventDate } from "../validation/eventDate";

interface Chip {
  label: string;
  autofill: number;
}

const CHIPS: readonly Chip[] = [
  { label: "10–20 guests", autofill: 15 },
  { label: "21–30 guests", autofill: 25 },
  { label: "31–50 guests", autofill: 40 },
  { label: "50+ guests", autofill: 75 },
];

interface Props {
  site: { leadTimeDays: number; blackoutDates: string[]; email: string };
}

export default function Step2GuestsDate({ site }: Props) {
  const { register, watch, setValue, formState, setError, clearErrors } = useFormContext();
  const guestCount = Number(watch("guestCount")) || 0;
  const zipValue = (watch("zip") as string | undefined) ?? "";
  const eventDateError = formState.errors.eventDate?.message as string | undefined;
  const guestCountError = formState.errors.guestCount?.message as string | undefined;
  const zipError = formState.errors.zip?.message as string | undefined;

  // Inline hints below chips — UI-SPEC §Inline hints (lines 187-189).
  let guestHint: { text: string; color: string } | null = null;
  if (guestCount > 0 && guestCount < 10) {
    guestHint = {
      text: "Our minimum is 10 guests — submit anyway for a custom quote.",
      color: "text-accent",
    };
  } else if (guestCount > 200) {
    guestHint = {
      text: `Groups over 200 need a direct conversation. Please email us at ${site.email} or submit below and Chef Larry will reach out.`,
      color: "text-accent",
    };
  } else if (guestCount > 75) {
    guestHint = {
      text: "Groups over 75 get a custom quote — we'd love to hear about it.",
      color: "text-accent",
    };
  }

  const blackoutText = site.blackoutDates.length > 0 ? site.blackoutDates.join(", ") : "none";

  return (
    <div className="mt-6 space-y-6">
      {/* Guest count: chips + numeric field */}
      <fieldset>
        <legend className="text-body-sm text-ink font-semibold">How many guests?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {CHIPS.map((chip) => {
            const isActive = guestCount === chip.autofill;
            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setValue("guestCount", chip.autofill, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className={[
                  "min-h-[44px] rounded-full px-4 text-body-md font-semibold transition-colors motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
                  isActive
                    ? "bg-primary text-white border-transparent"
                    : "bg-white border border-ink/20 text-ink",
                ].join(" ")}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        {guestHint && <p className={`mt-3 text-body-sm ${guestHint.color}`}>{guestHint.text}</p>}

        <div className="mt-4">
          <label htmlFor="guestCount" className="text-body-sm text-ink font-semibold">
            Exact count (optional)
          </label>
          <Input
            id="guestCount"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 25"
            className="mt-1 h-11 text-body-md"
            aria-invalid={!!guestCountError}
            aria-describedby={guestCountError ? "guestCount-error" : undefined}
            {...register("guestCount", { valueAsNumber: true })}
          />
          {guestCountError && (
            <p
              id="guestCount-error"
              role="alert"
              className="mt-2 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
            >
              {guestCountError}
            </p>
          )}
        </div>
      </fieldset>

      {/* Event date */}
      <div>
        <label htmlFor="eventDate" className="text-body-sm text-ink font-semibold">
          Event date
        </label>
        <Input
          id="eventDate"
          type="date"
          className="mt-1 h-11 text-body-md"
          aria-invalid={!!eventDateError}
          aria-describedby="eventDate-hint eventDate-error"
          {...register("eventDate", {
            onBlur: (e) => {
              const value = String(e.target.value ?? "");
              if (!value) return;
              const msg = validateEventDate(value, {
                leadTimeDays: site.leadTimeDays,
                blackoutDates: site.blackoutDates,
                siteEmail: site.email,
              });
              if (msg) {
                setError("eventDate", { type: "manual", message: msg });
              } else {
                clearErrors("eventDate");
              }
            },
          })}
        />
        <p id="eventDate-hint" className="mt-2 text-body-sm text-ink/60">
          We typically need {site.leadTimeDays} days lead time. Blackout dates: {blackoutText}.
        </p>
        {eventDateError && (
          <p
            id="eventDate-error"
            role="alert"
            className="mt-2 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
          >
            {eventDateError}
          </p>
        )}
      </div>

      {/* ZIP — soft service-area check, pre-fills Step 4 city */}
      <div>
        <label htmlFor="zip" className="text-body-sm text-ink font-semibold">
          Event ZIP (optional)
        </label>
        <Input
          id="zip"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{5}"
          placeholder="e.g. 94510"
          className="mt-1 h-11 text-body-md"
          aria-invalid={!!zipError}
          aria-describedby={zipError ? "zip-error" : "zip-hint"}
          {...register("zip", {
            onBlur: (e) => {
              const value = String(e.target.value ?? "").trim();
              if (!value) return;
              const city = resolveServiceAreaCity(value);
              if (city) {
                setValue("eventCity", city, { shouldDirty: true });
              }
            },
          })}
        />
        {zipValue && !resolveServiceAreaCity(zipValue) && /^\d{5}$/.test(zipValue) && (
          <p id="zip-hint" className="mt-2 text-body-sm text-ink/60">
            We may need to travel — Chef Larry will confirm.
          </p>
        )}
        {zipError && (
          <p
            id="zip-error"
            role="alert"
            className="mt-2 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
          >
            {zipError}
          </p>
        )}
      </div>
    </div>
  );
}
