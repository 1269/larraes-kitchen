// Source: CONTEXT D-01..D-19 + UI-SPEC §Copywriting Contract (step headings verbatim)
// + §Interaction & Motion (focus order 1-8) + §Responsive Behavior (dialog sizes)
// + WIZ-01..14 (4-step flow, persistence, URL sync, mobile, a11y, reduced motion) +
// RESEARCH §Pattern 2 (Astro Action submit) + §Event-based decoupling (wizard:open).
// T-03-17 mitigation: step-boundary validation is UX only; Plan 05 Action re-parses
// the same leadSchema server-side (LEAD-01).
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { leadSchema, type LeadInput } from "@/lib/schemas/lead";
import type { PackageData } from "@/lib/schemas/packages";
import ConfirmationView from "./ConfirmationView";
import DirtyDismissGuard from "./DirtyDismissGuard";
import ProgressIndicator from "./ProgressIndicator";
import StickyEstimateBar from "./StickyEstimateBar";
import Step1EventType from "./steps/Step1EventType";
import Step2GuestsDate from "./steps/Step2GuestsDate";
import Step3Package from "./steps/Step3Package";
import Step4Contact, { type AlertKind } from "./steps/Step4Contact";
import { wizardAnalytics } from "./hooks/useWizardAnalytics";
import {
  clearSnapshot,
  loadSnapshot,
  saveSnapshot,
} from "./hooks/useWizardPersistence";
import {
  pushClose,
  pushUrlState,
  readUrlState,
  usePopStateListener,
  type UrlStep,
  type UrlTier,
} from "./hooks/useUrlSync";

type EntryPoint = "hero" | "nav" | "package_card" | "contact_section";

interface WizardOpenDetail {
  entry?: EntryPoint;
  tier?: UrlTier;
}

interface SiteProps {
  leadTimeDays: number;
  blackoutDates: string[];
  email: string;
}

interface Props {
  packages: PackageData[];
  site: SiteProps;
}

const STEP_COPY: Record<
  UrlStep,
  { eyebrow: string; heading: string; subtitle: string }
> = {
  1: {
    eyebrow: "STEP 1 OF 4",
    heading: "Tell us about your event",
    subtitle: "This helps Larrae tailor her reply.",
  },
  2: {
    eyebrow: "STEP 2 OF 4",
    heading: "How many, and when?",
    subtitle: "A rough count is fine — we'll confirm on the quote.",
  },
  3: {
    eyebrow: "STEP 3 OF 4",
    heading: "Pick a package",
    subtitle: "We picked one to match your guest count — change it if you like.",
  },
  4: {
    eyebrow: "STEP 4 OF 4",
    heading: "How should we reach you?",
    subtitle:
      "Larrae replies within 24 hours. Check your spam, just in case.",
  },
};

const NEXT_COPY: Record<1 | 2 | 3, string> = {
  1: "Next — add guests & date",
  2: "Next — pick your package",
  3: "Next — your contact info",
};

const STEP_FIELDS: Record<UrlStep, (keyof LeadInput)[]> = {
  1: ["eventType"],
  2: ["guestCount", "eventDate"],
  3: ["packageId"],
  4: ["name", "email", "phone"],
};

// Read URL state once on mount — SSR-safe (readUrlState guards on window).
function initialStep(): UrlStep {
  if (typeof window === "undefined") return 1;
  return readUrlState().step;
}

function initialTier(): UrlTier {
  if (typeof window === "undefined") return undefined;
  return readUrlState().tier;
}

export default function WizardIsland({ packages, site }: Props) {
  // Restore snapshot (if any) + URL tier. URL wins for packageId per D-04.
  const snapshot = useMemo(() => loadSnapshot(), []);
  const urlTier = useMemo(() => initialTier(), []);
  const mountedAt = useMemo(() => Date.now(), []);
  const idempotencyKey = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${mountedAt}-${Math.random().toString(36).slice(2)}`;
  }, [mountedAt]);

  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: "onBlur",
    defaultValues: {
      eventType: (snapshot?.eventType ?? undefined) as LeadInput["eventType"],
      guestCount: (snapshot?.guestCount ?? 0) as LeadInput["guestCount"],
      eventDate: snapshot?.eventDate ?? "",
      zip: snapshot?.zip ?? "",
      packageId: (urlTier ?? snapshot?.packageId ?? undefined) as LeadInput["packageId"],
      name: snapshot?.name ?? "",
      email: snapshot?.email ?? "",
      phone: snapshot?.phone ?? "",
      eventAddress: snapshot?.eventAddress ?? "",
      eventCity: snapshot?.eventCity ?? "",
      notes: snapshot?.notes ?? "",
      howHeard: snapshot?.howHeard ?? "",
      contactMethod: snapshot?.contactMethod ?? "email",
      honeypot: "",
      wizardMountedAt: mountedAt,
      idempotencyKey,
      turnstileToken: snapshot?.turnstileToken ?? "",
    },
  });

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<UrlStep>(initialStep());
  const [mode, setMode] = useState<"form" | "confirmation">("form");
  const [submissionId, setSubmissionId] = useState<string>("");
  const [finalEstimate, setFinalEstimate] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [alert, setAlert] = useState<AlertKind>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Persist every RHF change. T-03-14: sessionStorage (per-tab, cleared on
  // tab close) — PII is bounded to the user's own session.
  useEffect(() => {
    const sub = form.watch((values) => {
      saveSnapshot(values as Partial<LeadInput>);
    });
    return () => sub.unsubscribe();
  }, [form]);

  // Focus the step heading on step change (A11Y-03 focus order 1/2/4).
  useEffect(() => {
    if (mode === "form") headingRef.current?.focus();
  }, [currentStep, mode]);

  // Listen for `wizard:open` CustomEvent — the entry-point dispatchers (Task 2b)
  // fire this with { entry, tier? }. The wizard is event-decoupled from CTAs.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<WizardOpenDetail>).detail ?? {};
      const { entry = "nav", tier } = detail;
      if (tier) {
        form.setValue("packageId", tier as LeadInput["packageId"], {
          shouldDirty: false,
        });
      }
      setOpen(true);
      setMode("form");
      setAlert(null);
      setCurrentStep(initialStep());
      pushUrlState({ step: initialStep(), tier });
      wizardAnalytics.start({
        entryPoint: entry,
        tierPreselected: tier && tier !== undefined ? tier : undefined,
      });
    };
    window.addEventListener("wizard:open", handler);
    return () => window.removeEventListener("wizard:open", handler);
  }, [form]);

  // beforeunload warning — only when the form is dirty (WIZ-06).
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && mode === "form" && open) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [form.formState.isDirty, mode, open]);

  // popstate: browser Back moves to previous step (D-04).
  const onPop = useCallback(
    (state: { step?: UrlStep }) => {
      if (!open) return;
      const next = (state.step ?? readUrlState().step) as UrlStep;
      setCurrentStep(next);
    },
    [open],
  );
  usePopStateListener(onPop);

  const handleDismiss = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setOpen(true);
        return;
      }
      // Closing: dirty-aware dismiss per D-03.
      if (form.formState.isDirty && mode === "form") {
        setGuardOpen(true);
        return;
      }
      setOpen(false);
      pushClose();
    },
    [form.formState.isDirty, mode],
  );

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      handleDismiss(false);
      return;
    }
    const prev = (currentStep - 1) as UrlStep;
    setCurrentStep(prev);
    pushUrlState({
      step: prev,
      tier: form.getValues("packageId") as UrlTier,
    });
  }, [currentStep, form, handleDismiss]);

  const handleNext = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep];
    const ok = await form.trigger(fields);
    if (!ok) return;

    if (currentStep < 4) {
      const next = (currentStep + 1) as UrlStep;
      const tier = form.getValues("packageId") as UrlTier;
      setCurrentStep(next);
      pushUrlState({ step: next, tier });
      const values = form.getValues();
      wizardAnalytics.stepComplete(currentStep, {
        eventType: values.eventType,
        guestCount: Number(values.guestCount) || undefined,
        packageId: values.packageId,
      });
    }
  }, [currentStep, form]);

  const onSubmit = useCallback(
    async (values: LeadInput) => {
      setIsSubmitting(true);
      setAlert(null);
      try {
        // Plan 05 Task 2 shipped the real handler — this import resolves at
        // runtime to the Astro Actions barrel (src/actions/index.ts → server.submitInquiry).
        const astroActions = await import("astro:actions");
        const actions = (astroActions as unknown as {
          actions: { submitInquiry: (fd: FormData) => Promise<unknown> };
          isInputError: (e: unknown) => boolean;
        }).actions;
        const isInputError = (astroActions as unknown as {
          isInputError: (e: unknown) => boolean;
        }).isInputError;

        const formData = new FormData();
        for (const [k, v] of Object.entries(values)) {
          formData.append(k, String(v ?? ""));
        }
        const result = (await actions.submitInquiry(formData)) as {
          data?: {
            submissionId: string;
            estimate: { min: number; max: number } | null;
          };
          error?: { code?: string } | null;
        };
        const { data, error } = result;

        // D-18 error UX — map ActionError codes to client alert kinds.
        if (error && isInputError(error)) {
          wizardAnalytics.submitFailure("validation");
          setAlert("server");
          return;
        }
        if (error?.code === "FORBIDDEN") {
          setAlert("turnstile");
          wizardAnalytics.submitFailure("turnstile");
          return;
        }
        if (error?.code === "TOO_MANY_REQUESTS") {
          setAlert("rate_limit");
          wizardAnalytics.submitFailure("rate_limit");
          return;
        }
        if (error) {
          setAlert("server");
          wizardAnalytics.submitFailure("server_error");
          return;
        }
        if (data) {
          setSubmissionId(data.submissionId);
          setFinalEstimate(data.estimate);
          setMode("confirmation");
          clearSnapshot();
          wizardAnalytics.submitSuccess({
            submissionId: data.submissionId,
            packageId: values.packageId,
            guestCount: Number(values.guestCount) || 0,
            eventType: values.eventType,
            estimateMin: data.estimate?.min ?? null,
            estimateMax: data.estimate?.max ?? null,
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const handleBackToSite = useCallback(() => {
    setOpen(false);
    pushClose();
    setMode("form");
    form.reset();
    window.scrollTo({ top: 0 });
  }, [form]);

  const copy = STEP_COPY[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent
        showCloseButton={true}
        aria-labelledby="wizard-title"
        className="bg-surface h-dvh w-dvw max-w-none p-4 md:max-w-[640px] md:p-6 md:rounded-lg lg:max-w-[720px] lg:p-8 md:h-auto md:max-h-[90vh] overflow-y-auto"
      >
        {/* Radix DialogTitle for SR context — rendered sr-only per UI-SPEC focus
            order step 1. The visible step heading carries the per-step content. */}
        <DialogTitle asChild>
          <h2 id="wizard-title" className="sr-only">
            Get a quote
          </h2>
        </DialogTitle>
        <DialogDescription className="sr-only">
          A 4-step form to request a catering quote.
        </DialogDescription>

        <FormProvider {...form}>
          {mode === "form" ? (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col min-h-full"
            >
              <ProgressIndicator currentStep={currentStep} />

              <div className="mt-6 flex-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-display-md text-ink leading-tight focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 rounded-sm"
                >
                  {copy.heading}
                </h2>
                <p className="mt-2 text-body-md text-ink/70">{copy.subtitle}</p>

                {currentStep === 1 && <Step1EventType />}
                {currentStep === 2 && <Step2GuestsDate site={site} />}
                {currentStep === 3 && <Step3Package packages={packages} />}
                {currentStep === 4 && (
                  <Step4Contact
                    site={site}
                    isSubmitting={isSubmitting}
                    alert={alert}
                  />
                )}
              </div>

              {currentStep >= 2 && mode === "form" && (
                <StickyEstimateBar packages={packages} />
              )}

              {currentStep < 4 && (
                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto rounded-full bg-primary text-white hover:bg-primary/90 min-h-[44px] px-6 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
                  >
                    {NEXT_COPY[currentStep as 1 | 2 | 3]}
                  </button>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full sm:w-auto rounded-full text-primary hover:bg-primary/10 min-h-[44px] px-6 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
                    >
                      Back
                    </button>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full sm:w-auto rounded-full text-primary hover:bg-primary/10 min-h-[44px] px-6 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
                  >
                    Back
                  </button>
                </div>
              )}
            </form>
          ) : (
            <ConfirmationView
              submissionId={submissionId}
              values={form.getValues()}
              packages={packages}
              finalEstimate={finalEstimate}
              onBackToSite={handleBackToSite}
            />
          )}
        </FormProvider>

        <DirtyDismissGuard
          open={guardOpen}
          onKeepEditing={() => setGuardOpen(false)}
          onClose={() => {
            const step = currentStep;
            setGuardOpen(false);
            setOpen(false);
            pushClose();
            wizardAnalytics.dismissDirty(step);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
