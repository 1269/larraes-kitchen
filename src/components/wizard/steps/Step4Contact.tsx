// Source: CONTEXT D-14 (required + optional fields) + UI-SPEC §Field labels and
// placeholders (verbatim), §Submission failure copy (error alert block lines
// 240-245), §Components Inventory (Turnstile frame, honeypot) +
// SPAM-01 (honeypot), SPAM-02 (Turnstile site key), WIZ-07 (iOS 16px),
// WIZ-08 (44px touch floor), WIZ-13 (keyboard), WIZ-14 (motion-reduce).
// T-03-20 mitigation: only PUBLIC_TURNSTILE_SITE_KEY referenced — no secrets.
// T-03-21 mitigation: honeypot is sr-only + aria-hidden + tabIndex=-1.
import { Turnstile } from "@marsidev/react-turnstile";
import { AlertTriangle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type AlertKind = "turnstile" | "rate_limit" | "server" | "network" | null;

interface Props {
  site: { email: string };
  isSubmitting: boolean;
  alert: AlertKind;
}

function alertCopy(
  kind: Exclude<AlertKind, null>,
  email: string,
): { message: string } {
  switch (kind) {
    case "turnstile":
      return {
        message: `Having trouble verifying you're human. Please try again, or email us directly at ${email}.`,
      };
    case "rate_limit":
      return {
        message: `Too many attempts — please wait a few minutes, or email us directly at ${email}.`,
      };
    case "network":
      return {
        message: `We couldn't reach our servers. Check your connection and try again, or email us at ${email}.`,
      };
    case "server":
      return {
        message: `Something went wrong on our end — please try again, or email us directly at ${email}.`,
      };
  }
}

export default function Step4Contact({ site, isSubmitting, alert }: Props) {
  const { register, formState, setValue } = useFormContext();
  const errs = formState.errors as Record<
    string,
    { message?: string } | undefined
  >;

  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

  return (
    <div className="mt-6 space-y-6">
      {/* Required: Name */}
      <div>
        <label htmlFor="name" className="text-body-sm text-ink font-semibold">
          Your name
        </label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Cynthia Jackson"
          className="mt-1 h-11 text-body-md"
          aria-invalid={!!errs.name}
          aria-describedby={errs.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errs.name?.message && (
          <p
            id="name-error"
            role="alert"
            className="mt-2 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
          >
            {errs.name.message}
          </p>
        )}
      </div>

      {/* Required: Email */}
      <div>
        <label htmlFor="email" className="text-body-sm text-ink font-semibold">
          Email
        </label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 h-11 text-body-md"
          aria-invalid={!!errs.email}
          aria-describedby={errs.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errs.email?.message && (
          <p
            id="email-error"
            role="alert"
            className="mt-2 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
          >
            {errs.email.message}
          </p>
        )}
      </div>

      {/* Required: Phone */}
      <div>
        <label htmlFor="phone" className="text-body-sm text-ink font-semibold">
          Phone
        </label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(510) 555-0123"
          className="mt-1 h-11 text-body-md"
          aria-invalid={!!errs.phone}
          aria-describedby={errs.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
        {errs.phone?.message && (
          <p
            id="phone-error"
            role="alert"
            className="mt-2 text-body-sm text-[color:var(--color-southern-red)] font-semibold"
          >
            {errs.phone.message}
          </p>
        )}
      </div>

      {/* Optional: Event address + City (pre-filled from ZIP) */}
      <div>
        <label
          htmlFor="eventAddress"
          className="text-body-sm text-ink font-semibold"
        >
          Event address (optional)
        </label>
        <Input
          id="eventAddress"
          type="text"
          autoComplete="street-address"
          placeholder="123 First St"
          className="mt-1 h-11 text-body-md"
          {...register("eventAddress")}
        />
      </div>

      <div>
        <label
          htmlFor="eventCity"
          className="text-body-sm text-ink font-semibold"
        >
          City
        </label>
        <Input
          id="eventCity"
          type="text"
          autoComplete="address-level2"
          placeholder="Benicia"
          className="mt-1 h-11 text-body-md"
          {...register("eventCity")}
        />
      </div>

      {/* Optional: Notes */}
      <div>
        <label htmlFor="notes" className="text-body-sm text-ink font-semibold">
          Anything special? (optional)
        </label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Dietary needs, venue details, special requests…"
          className="mt-1 text-body-md"
          {...register("notes")}
        />
      </div>

      {/* Optional: How heard */}
      <div>
        <label
          htmlFor="howHeard"
          className="text-body-sm text-ink font-semibold"
        >
          How did you hear about us? (optional)
        </label>
        <select
          id="howHeard"
          className="mt-1 w-full min-h-[44px] rounded-lg border border-ink/20 bg-white px-3 text-body-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
          {...register("howHeard")}
        >
          <option value="">Choose one</option>
          <option value="google">Google</option>
          <option value="instagram">Instagram</option>
          <option value="word-of-mouth">Word of mouth</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Optional: Preferred contact method (radio) */}
      <fieldset>
        <legend className="text-body-sm text-ink font-semibold">
          Preferred contact method (optional)
        </legend>
        <div role="radiogroup" className="mt-2 flex flex-wrap gap-4">
          {(["email", "phone", "text"] as const).map((method) => (
            <label
              key={method}
              className="inline-flex items-center gap-2 min-h-[44px] text-body-md text-ink"
            >
              <input
                type="radio"
                value={method}
                {...register("contactMethod")}
                className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
              />
              <span className="capitalize">{method}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot: SPAM-01 trap. sr-only + aria-hidden on wrapper,
          tabIndex=-1 + autoComplete="off" on input. Bots filling every visible
          field will still fill this one; keyboard users skip it naturally. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Your website</label>
        <input
          id="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          {...register("honeypot")}
        />
      </div>

      {/* Turnstile widget frame — SPAM-02. */}
      <div className="border border-ink/10 rounded-lg p-4">
        {siteKey ? (
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) =>
              setValue("turnstileToken", token, { shouldValidate: true })
            }
            onError={() =>
              setValue("turnstileToken", "", { shouldValidate: true })
            }
            onExpire={() =>
              setValue("turnstileToken", "", { shouldValidate: true })
            }
          />
        ) : (
          <p className="text-body-sm text-ink/60">
            Verification widget not configured for this environment.
          </p>
        )}
      </div>

      {/* Server error alert block — UI-SPEC §Submission failure lines 240-245 */}
      {alert && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[color:var(--color-southern-red)]/10 border border-[color:var(--color-southern-red)]/30 text-[color:var(--color-southern-red)] rounded-lg p-4"
        >
          <AlertTriangle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-body-sm font-semibold">
            {alertCopy(alert, site.email).message}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary text-white hover:bg-primary/90 min-h-[44px] px-8 py-3 text-body-md font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 disabled:opacity-60 disabled:pointer-events-none"
      >
        {isSubmitting ? "Sending…" : "Send my request"}
      </button>
    </div>
  );
}
