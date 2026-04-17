// Source: UI-SPEC §Components Inventory (stepper) + §Responsive Behavior +
// A11Y-03 (<ol>/aria-current="step") + A11Y-01 (focus ring) + WIZ-14 (motion-reduce).
import { Check } from "lucide-react";

interface Props {
  currentStep: 1 | 2 | 3 | 4;
}

/**
 * 4-step progress stepper: `<ol>` with `<li aria-current="step">` on the active
 * dot. Complete dots show a Lucide Check icon; future dots are `bg-ink/20`;
 * active dot is `bg-primary`. Eyebrow line below reads `STEP N OF 4` (UI-SPEC
 * §Copywriting Contract — Step eyebrow).
 */
export default function ProgressIndicator({ currentStep }: Props) {
  const steps = [1, 2, 3, 4] as const;
  return (
    <div>
      <ol role="list" className="flex items-center justify-center gap-2">
        {steps.map((step) => {
          const isComplete = step < currentStep;
          const isActive = step === currentStep;
          const dotClass = [
            "flex items-center justify-center rounded-full min-h-[44px] min-w-[44px]",
            "transition-colors duration-150 motion-reduce:transition-none",
            "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
            isComplete || isActive ? "bg-primary text-white" : "bg-ink/20 text-ink/60",
          ].join(" ");
          return (
            <li
              key={step}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${step} of 4`}
              className="flex items-center"
            >
              <span className={dotClass} data-step={step} data-state={isActive ? "active" : isComplete ? "complete" : "inactive"}>
                {isComplete ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <span className="text-body-sm font-semibold">{step}</span>
                )}
              </span>
              {step < 4 && (
                <span
                  aria-hidden="true"
                  className={[
                    "mx-2 h-0.5 w-8 md:w-12 transition-colors duration-150 motion-reduce:transition-none",
                    step < currentStep ? "bg-primary" : "bg-ink/20",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-body-sm uppercase tracking-[0.12em] text-accent font-semibold">
        STEP {currentStep} OF 4
      </p>
    </div>
  );
}
