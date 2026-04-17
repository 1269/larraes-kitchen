// Source: CONTEXT D-05 (3 persona tiles) + UI-SPEC §Persona tiles lines 166-170
// (copy verbatim) + §Components Inventory + §Responsive Behavior +
// WIZ-08 (44px touch floor) + WIZ-13 (keyboard arrow nav via radiogroup) +
// WIZ-14 (motion-reduce) + A11Y-03 (fieldset/legend).
import { Briefcase, Home, PartyPopper } from "lucide-react";
import { useFormContext } from "react-hook-form";

type EventTypeId = "family" | "social" | "corporate";

interface TileDef {
  id: EventTypeId;
  icon: typeof Home;
  title: string;
  descriptor: string;
}

const TILES: readonly TileDef[] = [
  {
    id: "family",
    icon: Home,
    title: "Family",
    descriptor:
      "Intimate gatherings — Sunday dinners, birthdays, reunions.",
  },
  {
    id: "social",
    icon: PartyPopper,
    title: "Social",
    descriptor:
      "Showers, graduations, milestones, neighborhood get-togethers.",
  },
  {
    id: "corporate",
    icon: Briefcase,
    title: "Corporate",
    descriptor: "Team lunches, client events, office celebrations.",
  },
];

export default function Step1EventType() {
  const { register, watch, setValue, formState } = useFormContext();
  const selected = watch("eventType") as EventTypeId | undefined;
  const error = formState.errors.eventType?.message as string | undefined;

  // Register the field once so RHF tracks validation even though we render
  // custom visual tiles on top of native radios.
  register("eventType");

  return (
    <fieldset className="mt-6">
      <legend className="sr-only">Event type</legend>
      <div
        role="radiogroup"
        aria-label="Event type"
        aria-invalid={!!error}
        aria-describedby={error ? "eventType-error" : undefined}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const isSelected = selected === tile.id;
          const tileClass = [
            "flex flex-col items-start text-left gap-2 rounded-lg p-4 md:p-6",
            "bg-white border-2 transition-colors motion-reduce:transition-none",
            "min-h-[44px] min-w-[44px]",
            "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
            isSelected
              ? "border-primary ring-4 ring-primary/20"
              : "border-ink/10 hover:border-primary/40",
          ].join(" ");
          return (
            <label key={tile.id} className={tileClass}>
              <input
                type="radio"
                name="eventType-visual"
                value={tile.id}
                checked={isSelected}
                onChange={() => {
                  setValue("eventType", tile.id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className="sr-only"
              />
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <span className="text-body-md font-semibold text-ink">
                {tile.title}
              </span>
              <span className="text-body-md text-ink/60">
                {tile.descriptor}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p
          id="eventType-error"
          role="alert"
          className="mt-3 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
