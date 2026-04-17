// Source: CONTEXT D-03 (dirty-aware dismiss) + UI-SPEC §Dirty-dismiss confirmation
// (copy locked verbatim) + A11Y-03 (role="alertdialog") + WIZ-14 (motion-reduce).
// Inline overlay INSIDE the Dialog — NOT a nested Dialog (keeps focus mgmt clean).
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onKeepEditing: () => void;
  onClose: () => void;
}

export default function DirtyDismissGuard({ open, onKeepEditing, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  // Focus management: when the guard opens, focus the non-destructive default
  // ("Keep editing") per UI-SPEC §Interaction & Motion and WCAG focus safety.
  useEffect(() => {
    if (open) keepRef.current?.focus();
  }, [open]);

  // Escape → non-destructive default (Keep editing), not Close. UI-SPEC §Keyboard
  // shortcuts: "Escape triggers dirty-dismiss flow if dirty" at the Dialog level;
  // inside the guard, Escape is the safer Keep-editing action.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onKeepEditing();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open, onKeepEditing]);

  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dismiss-title"
      aria-describedby="dismiss-body"
      data-testid="dirty-dismiss-guard"
      className="absolute inset-0 z-10 flex items-center justify-center bg-ink/40 p-4 motion-reduce:animate-none"
    >
      <div
        ref={cardRef}
        className="bg-surface rounded-lg p-6 max-w-md w-full shadow-lg"
      >
        <h2
          id="dismiss-title"
          className="font-display text-display-md text-ink leading-tight"
        >
          Leave the quote wizard?
        </h2>
        <p id="dismiss-body" className="mt-3 text-body-md text-ink">
          Your progress is saved on this device — come back anytime from the
          "Get a Quote" button.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            ref={keepRef}
            type="button"
            onClick={onKeepEditing}
            className="rounded-full bg-primary text-white hover:bg-primary/90 min-h-[44px] px-6 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full text-primary hover:bg-primary/10 min-h-[44px] px-6 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
