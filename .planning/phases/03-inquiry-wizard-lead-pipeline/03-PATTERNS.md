# Phase 3: Inquiry Wizard & Lead Pipeline - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 23 new / 1 modified
**Analogs found:** 18 with matches / 23

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|----------------|---------------|
| `src/lib/schemas/lead.ts` (NEW) | Zod schema | build-time + request-time validation | `src/lib/schemas/packages.ts` | exact (schema sibling) |
| `src/lib/pricing/estimate.ts` (MODIFY, replace stub body) | pure util fn | request-response (pure) | stub at same path + co-located test | exact (same file) |
| `src/lib/pricing/estimate.test.ts` (MODIFY, replace scaffold) | vitest unit test | request-response | `src/lib/format.test.ts` | exact |
| `src/lib/pricing/roundToTen.ts` (NEW, optional helper) | pure util fn | request-response | `src/lib/format.ts` | exact (pure util next to its home) |
| `src/lib/leads/LeadStore.ts` (NEW) | TS interface (contract) | — | none | no analog (Phase 3 establishes) |
| `src/lib/leads/GoogleSheetsAdapter.ts` (NEW) | service (storage adapter) | CRUD (append + update) | none | no analog — use RESEARCH §GoogleSheetsAdapter code |
| `src/lib/leads/store.ts` (NEW) | singleton factory | — | none | no analog |
| `src/lib/leads/submissionId.ts` (NEW) | pure util fn | request-response | `src/lib/format.ts` | exact (tiny pure util) |
| `src/lib/leads/submissionId.test.ts` (NEW) | vitest unit test | request-response | `src/lib/format.test.ts` | exact |
| `src/lib/leads/rateLimit.ts` (NEW) | service helper | CRUD (sheet-backed rolling window) | none | no analog |
| `src/lib/leads/botGates.ts` (NEW) | pure util fns (honeypot / min-time / URL regex) | request-response | `src/lib/format.ts` + `validateEventDate` plan | exact pattern (pure helpers) |
| `src/lib/email/send.ts` (NEW) | service wrapper (Resend) | request → third-party | none | no analog |
| `src/lib/email/templates/LeadNotification.tsx` (NEW) | React Email template | build-time compile → send-time render | none | no analog (Phase 3 establishes) |
| `src/lib/email/templates/LeadConfirmation.tsx` (NEW) | React Email template | build-time compile → send-time render | none | no analog |
| `src/lib/serviceArea.ts` (NEW) | static lookup (ZIP → city) | request-response | `src/lib/format.ts` | exact (small pure util + data) |
| `src/actions/submitInquiry.ts` (NEW) | Astro Action handler | client form → server pipeline → store + email | none (empty `src/actions/`) | no analog — use RESEARCH §Astro Action skeleton |
| `src/actions/index.ts` (NEW) | Astro Action barrel | — | none | no analog (trivial re-export) |
| `src/pages/api/cron/retry-email.ts` (NEW) | Astro server endpoint | scheduled → sheet scan → email retry | none (empty `src/pages/api/`) | no analog |
| `src/pages/api/webhooks/resend.ts` (NEW) | Astro server endpoint | webhook → sheet update | none | no analog |
| `src/components/wizard/WizardDialog.astro` (NEW) | Astro component (server) | build-time content prop → client island | `src/components/sections/PackagesSection.astro` (content load + pass-to-React) & `MenuSection.astro` (server-rendered shell + React island) | role-match |
| `src/components/wizard/WizardIsland.tsx` (NEW) | React island (root) | client form state + server submit | `src/components/NavController.tsx` | role-match (largest existing island with focus/Escape/ARIA + `client:load`) |
| `src/components/wizard/ProgressIndicator.tsx` (NEW) | React subcomponent | client state reflection | (sub-component of island) | inline pattern |
| `src/components/wizard/StickyEstimateBar.tsx` (NEW) | React subcomponent | client pure-fn driven | `src/components/GalleryGrid.tsx` (lazy sub-component pattern) | partial |
| `src/components/wizard/ConfirmationView.tsx` (NEW) | React subcomponent (terminal state) | client render only | — | inline pattern |
| `src/components/wizard/DirtyDismissGuard.tsx` (NEW) | React subcomponent (inline overlay) | client state | `NavController` drawer overlay pattern | partial |
| `src/components/wizard/steps/Step1EventType.tsx` (NEW) | React step component | RHF read/write | — | inline radio-as-tiles pattern in UI-SPEC |
| `src/components/wizard/steps/Step2GuestsDate.tsx` (NEW) | React step component | RHF read/write + debounce | — | inline pattern |
| `src/components/wizard/steps/Step3Package.tsx` (NEW) | React step component | RHF read/write + tier select | `src/components/sections/PackagesSection.astro` (visual template) | partial (visual only) |
| `src/components/wizard/steps/Step4Contact.tsx` (NEW) | React step component | RHF + Turnstile + submit | — | inline pattern |
| `src/components/ui/{dialog,input,label,form,radio-group,textarea}.tsx` (NEW via shadcn CLI) | shadcn primitives | — | `src/components/ui/button.tsx` | exact (sibling shadcn file) |
| `src/components/Nav.astro` (MODIFY) | retarget "Get a Quote" anchor → Dialog trigger | — | self (current file) | exact |
| `src/components/sections/HeroSection.astro` (MODIFY) | retarget CTA → Dialog trigger | — | self | exact |
| `src/components/sections/PackagesSection.astro` (MODIFY) | retarget card CTAs → Dialog trigger w/ tier | — | self | exact |
| `src/components/sections/ContactSection.astro` (MODIFY) | retarget "Start a quote" → Dialog trigger | — | self | exact |
| `vercel.json` (NEW or MODIFY) | Vercel cron config | — | none (root config) | no analog |
| `tests/e2e/wizard.spec.ts` (NEW) | Playwright E2E | full flow | `tests/smoke.spec.ts` | role-match |

---

## Pattern Assignments

### `src/lib/schemas/lead.ts` (Zod schema)

**Analog:** `src/lib/schemas/packages.ts` (sibling schema file — same directory, same Zod 4 idiom)

**Imports + declaration pattern** (`src/lib/schemas/packages.ts` lines 1-24):
```typescript
// Source: CONTEXT D-05, D-06 + RESEARCH § Code Examples. Canonical template.
import { z } from "zod";

export const packageSchema = z.object({
  id: z.enum(["small", "medium", "large"]),
  name: z.string(),
  guestRange: z
    .object({
      min: z.number().int().positive(),
      max: z.number().int().positive(),
    })
    .refine((r) => r.min <= r.max, "min must be <= max"),
  /* … */
  order: z.number().int(),
});

export type PackageData = z.infer<typeof packageSchema>;
```

**Conventions to copy verbatim:**
- File header comment: `// Source: <CONTEXT citation> + RESEARCH § ... . Canonical template.`
- `import { z } from "zod";` (Zod 4 imports always flat — never `import * as z`)
- Schema name pattern: `<domain>Schema` (not `<Domain>Schema`) — matches `packageSchema`, `siteSchema`, `heroSchema`, `faqGroupSchema`
- `export type <Domain>Data = z.infer<typeof <domain>Schema>;` at end (every schema file does this)
- Nested refinements via `.refine((r) => r.min <= r.max, "message")`
- `.default(...)` on optional fields (see `siteSchema` lines 28-31: `leadTimeDays: z.number().int().positive().default(7)`)
- `z.enum([...])` for closed value sets (copy the `id: z.enum(["small", "medium", "large"])` idiom for `eventType`, `preferredContact`, `howHeard`)

**New fields for leadSchema (per CONTEXT D-05, D-07..D-09, D-14, D-19 + LEAD-07):**
```typescript
// Sketch (executor authors):
eventType: z.enum(["family", "social", "corporate"]),
guestCount: z.coerce.number().int().min(1).max(500),
eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
zip: z.string().regex(/^\d{5}$/).optional().or(z.literal("")),
packageId: z.enum(["small", "medium", "large", "custom"]),
name: z.string().min(1).max(200),
email: z.string().email(),
phone: z.string().min(7).max(30),
// optional: eventAddress{street,city}, notes, howHeard, preferredContact
turnstileToken: z.string().min(1),
idempotencyKey: z.string().uuid(),
honeypot: z.string().max(0), // must be empty — honeypot
wizardMountedAt: z.coerce.number().int().positive(),
```

---

### `src/lib/pricing/estimate.ts` (pure pricing fn)

**Analog:** the file itself — Phase 1 stub already defines the exact input/output contract. Phase 3 replaces only the `throw` body.

**Existing stub** (`src/lib/pricing/estimate.ts` lines 1-23):
```typescript
import type { PackageData } from "../schemas/packages";

export interface EstimateInput {
  guests: number;
  packageId: PackageData["id"];
  packages: readonly PackageData[];
}

export interface EstimateRange {
  min: number;
  max: number;
}

export function estimate(_input: EstimateInput): EstimateRange | null {
  throw new Error("estimate() not yet implemented — Phase 3");
}
```

**Conventions to preserve (LOCKED by the stub contract):**
- Named exports only — no default export
- `EstimateInput` / `EstimateRange` interface names stay exact (they're referenced in RESEARCH.md and documented)
- `readonly PackageData[]` — caller passes a frozen array (no mutation)
- Return `null` for out-of-range / custom-quote path per EST-08 + CONTEXT D-12 (type signature is already `EstimateRange | null`)

**New body requirements (CONTEXT D-10 + EST-01..08):**
- Pure — no module-scoped reads, no I/O, no `getCollection`. Packages passed as an argument (EST-02).
- Find pkg by `packageId`; if missing OR `packageId === 'custom'`, return `null`.
- If `guests < pkg.guestRange.min` or `guests > pkg.guestRange.max` strict, return `null` (custom-quote path per D-12 routing — the caller decides whether to treat as "out of range" or "tier mismatch, still show estimate"; pricing fn stays strict to boundary).
- Compute `min = guests * pkg.pricePerPerson.min`, `max = guests * pkg.pricePerPerson.max`.
- Round each end to nearest $10: `Math.round(x / 10) * 10`.

---

### `src/lib/pricing/estimate.test.ts` (vitest unit test)

**Analog:** `src/lib/format.test.ts` — the only existing filled-out vitest file in the repo.

**Full imports + describe/it pattern** (`src/lib/format.test.ts` lines 1-18):
```typescript
import { describe, expect, it } from "vitest";
import { formatPhone } from "./format";

describe("formatPhone", () => {
  it("formats raw 10-digit US phone", () => {
    expect(formatPhone("5105550123")).toBe("(510) 555-0123");
  });
  it("returns input unchanged when not 10 digits", () => {
    expect(formatPhone("510")).toBe("510");
    expect(formatPhone("15105550123")).toBe("15105550123");
  });
});
```

**Conventions to copy:**
- `import { describe, expect, it } from "vitest";` — flat import
- Co-located — test lives at `xxx.test.ts` next to `xxx.ts`
- Test describes the exported function name verbatim: `describe("estimate()", ...)`
- No `beforeEach` / `afterEach` hooks for pure functions — each `it()` is self-contained

**EST-05/06 boundary matrix to implement (from RESEARCH + CONTEXT D-10):**
Table-driven test covering integer guest counts 1..200 at boundaries **9, 10, 11, 20, 21, 30, 31, 49, 50, 75, 76, 100, 200** for each tier, asserting `null` for out-of-tier and exact `{min, max}` (post-$10-rounding) for in-tier.

---

### `src/lib/format.ts` (pure util — template for `submissionId.ts`, `botGates.ts`, `roundToTen.ts`)

**Analog:** `src/lib/format.ts` itself — the project's canonical "tiny pure util with doc comment" template.

**Full file** (`src/lib/format.ts` lines 1-6):
```typescript
/** Format a 10-digit US phone string (e.g., "5105550123") as "(510) 555-0123". */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 10) return digits;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
```

**Conventions for all new pure utils (`submissionId.ts`, `botGates.ts`, `roundToTen.ts`, `serviceArea.ts`):**
- One `/** ... */` JSDoc line above each exported fn describing input → output by example
- Named exports (no default)
- No imports from anything framework-specific (React, Astro) — utils stay portable between client + server (important for `estimate` and `botGates` which run in both)
- Co-located `.test.ts` sibling file for any fn with branching logic

---

### `src/components/ui/button.tsx` → template for shadcn primitives to be installed

**Analog:** `src/components/ui/button.tsx` (the only shadcn-installed component from Phase 1 D-08).

**Imports + file structure** (`src/components/ui/button.tsx` lines 1-7 + 44-67):
```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva( /* ... */ );

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

**Conventions (enforced by shadcn CLI output — executor should NOT hand-edit the generated files unless to substitute brand tokens):**
- `import { cn } from "@/lib/utils";` — the path alias is configured; use it everywhere in island code
- `import { Slot } from "radix-ui";` — **single Radix package**, not per-primitive packages (`@radix-ui/react-slot` etc.) — Phase 1 chose the unified `radix-ui@^1.4.3` install
- Named exports at bottom in curly braces (no default)
- `data-slot="<component-name>"` attribute is load-bearing — shadcn targets it for composition
- Brand-token discipline (Phase 1 D-01): the shadcn CLI will generate `bg-primary`, `text-primary-foreground` etc. referencing the neutral scaffold tokens in `global.css:100-132`. These are fine — they don't collide with brand `--color-primary` in the `@theme` block (see `global.css:53-58` comment: "Brand-overlapping keys REMOVED"). **If a generated component references a brand-colliding token, copy the resolution pattern from `global.css:53-58` rather than altering the brand.**

---

### `src/components/wizard/WizardIsland.tsx` (root React island)

**Analog:** `src/components/NavController.tsx` — the largest existing island, establishes the pattern for `client:load` + focus management + Escape + scroll-lock + ARIA dialog semantics.

**Imports + useEffect-heavy pattern** (`src/components/NavController.tsx` lines 1-8, 76-117):
```typescript
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  links: { href: string; label: string }[];
  siteName: string;
}

export default function NavController({ links, siteName }: Props) {
  // Body scroll-lock when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      firstDrawerLinkRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Escape closes drawer + focus trap
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setDrawerOpen(false); hamburgerRef.current?.focus(); return; }
      /* …Tab-trap branches… */
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);
  /* … */
}
```

**Conventions to copy:**
- `export default function` — Phase 2 islands all use default-export (verified: `NavController`, `MenuTabs`, `GalleryGrid`). **Stay with default export for all wizard React components** for consistency with existing `client:*` imports.
- Typed `Props` interface above the component, destructured in params
- `useRef<HTMLButtonElement>(null)` for focus targets (line 13-14)
- `useEffect` cleanup returns for every listener (`return () => document.removeEventListener(...)`)
- Body scroll-lock on open: `document.body.style.overflow = "hidden"` + restore on cleanup (directly portable to wizard Dialog open)
- `aria-modal="true" aria-label="..."` on overlay container (NavController line 150-152) — shadcn Dialog gives this for free; keep the `aria-label` explicit
- Focus on first focusable on open; focus return to trigger on close (NavController lines 79, 94) — shadcn Dialog handles return-to-trigger natively; override the first-focus target to the step heading per UI-SPEC § Focus management step 1
- `min-h-[44px] min-w-[44px]` on every interactive element (NavController line 130) — WIZ-08 enforcement
- `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4` — identical focus ring token everywhere (NavController lines 131, 166, 178; also PackagesSection line 37, ContactSection line 40, 52) — **copy verbatim into every wizard button / input**

**Transition / motion pattern** (`NavController.tsx` lines 142, 156):
```typescript
"transition-opacity duration-250 motion-reduce:transition-none"
"transition-transform duration-250 ease-out motion-reduce:transition-none"
```
Wizard must use `motion-reduce:transition-none` and `motion-reduce:animate-none` suffixes on every animated class (WIZ-14). The base `BaseLayout.astro` scoped scroll-behavior override (lines 25-30) is the second belt-and-suspenders layer.

**What to ADD beyond NavController (research-backed, no existing analog):**
- `FormProvider` + `useForm` from `react-hook-form`
- `useWizardPersistence()` hook wrapping `sessionStorage.setItem('lk_wizard_v1', JSON.stringify(getValues()))` on every change (WIZ-04)
- `window.history.pushState({step}, '', '/?step=N')` + `popstate` listener (WIZ-05) — see RESEARCH §Wizard State Persistence for the full skeleton
- `onSubmit` handler calling `actions.submitInquiry.safe({formData})` — see RESEARCH §Astro Action client-call pattern

---

### `src/components/wizard/WizardDialog.astro` (server wrapper + content loader)

**Analog:** `src/components/sections/PackagesSection.astro` (server loads content + passes typed data into React-renderable pieces) AND `src/components/sections/MenuSection.astro` (server-rendered tablist shell + React island that hydrates behavior).

**Server-side content loading + typed prop pass-down** (`src/pages/index.astro` lines 1-27 + `src/components/sections/PackagesSection.astro` lines 1-14):
```astro
---
import { getCollection, getEntry } from "astro:content";
/* … in page … */
const site = await getEntry("site", "site");
const packages = (await getCollection("packages")).sort((a, b) => a.data.order - b.data.order);
---

---
// PackagesSection.astro frontmatter
import { Button } from "@/components/ui/button";
import type { PackageData } from "@/lib/schemas/packages";

interface Props {
  id: string;
  packages: PackageData[];
}
const { id, packages } = Astro.props;
```

**Conventions to copy:**
- Content loading happens in `src/pages/index.astro`, NOT inside section components. **WizardDialog.astro** receives `packages: PackageData[]` and `site: SiteData` as props from the page (same pattern). Update `src/pages/index.astro` to pass these props.
- `interface Props { … }` in frontmatter, destructured from `Astro.props`
- `import type { PackageData } from "@/lib/schemas/packages";` — path alias `@/` + `import type` for type-only imports
- Astro component renders the Dialog trigger button(s) + mounts the React island. Island receives packages + site subset as props — **client never re-fetches** (established pattern, see CONTEXT §Established Patterns).

**Server-render shell + hydrate island** (`MenuSection.astro` lines 58-78, 145):
```astro
<div role="tablist" aria-label="Menu categories" data-menu-tablist>
  {categories.map((c, i) => (
    <button type="button" role="tab" id={`menu-tab-${c.key}`} aria-selected={i === 0 ? "true" : "false"} data-menu-tab={c.key}>
      {c.label}
    </button>
  ))}
</div>
/* … panels … */
<MenuTabs client:load />
```

**Adaptation for wizard:**
- WizardDialog.astro renders a hidden `<dialog>` trigger (or uses shadcn Dialog.Trigger server-rendered) + mounts `<WizardIsland client:load packages={packages} site={siteSubset} />`
- `client:load` (not `client:visible` or `client:idle`) per WIZ-01 — "island must be ready before user taps CTA" (RESEARCH §Phase Requirements row WIZ-01)
- Wizard does NOT need `client:only` — server render of the Dialog trigger is desirable for LCP

---

### `src/components/wizard/ProgressIndicator.tsx`, `StickyEstimateBar.tsx`, `DirtyDismissGuard.tsx`, step components

**Analog (visual + class-composition):** `src/components/sections/PackagesSection.astro` lines 27-89 (card/tile visual grammar for Step 3) + `src/components/NavController.tsx` lines 138-145 (backdrop overlay pattern for DirtyDismissGuard) + `src/components/GalleryGrid.tsx` lines 82-93 (pill-button pattern for chips).

**Card-with-variants visual pattern** (`PackagesSection.astro` lines 27-38, 40-85):
```astro
const cardClasses = [
  "relative flex flex-col rounded-lg border p-6 md:p-8",
  isPopular ? "border-primary/30 bg-clay/5" : "border-ink/10 bg-surface",
].join(" ");
/* … */
<article class={cardClasses}>
  {isPopular && (
    <span class="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-butter-gold)] px-3 py-1 text-eyebrow uppercase tracking-[0.12em] font-semibold text-ink">
      Most Popular
    </span>
  )}
  <h3 class="font-serif italic text-display-md text-ink">{pkg.name}</h3>
  <p class="mt-1 text-body-sm font-semibold uppercase tracking-[0.08em] text-ink/60">
    {pkg.guestRange.min}–{pkg.guestRange.max} guests
  </p>
  <div class="mt-6">
    <p class="font-display text-display-md text-ink">
      ${pkg.pricePerPerson.min}–${pkg.pricePerPerson.max}
    </p>
    <p class="text-body-sm text-ink/60">per person</p>
  </div>
```

**Conventions to copy for Step 3 tier cards + Step 1 persona tiles:**
- `[…].join(" ")` array pattern for conditional classes (rather than `clsx` in Astro components) — PackagesSection uses this
- `bg-[color:var(--color-butter-gold)]` for the **single** Butter Gold highlight — UI-SPEC reserves this exclusively for Step 3 "Recommended for N guests" badge, mirroring `PackagesSection.astro` "Most Popular" treatment (UI-SPEC § Components Inventory row "Package tier cards")
- Italic serif price: `font-serif italic text-display-md text-ink` — Step 3 cards use this verbatim for `$20–$26 per person` display
- Guest-range meta line: `text-body-sm font-semibold uppercase tracking-[0.08em] text-ink/60` — pattern shows up on PackagesSection line 52-54 and UI-SPEC § Typography eyebrow
- `p-6 md:p-8` — Step 3 card internal padding (UI-SPEC § Spacing exception #4 codifies this "matches existing PackagesSection"). **Copy verbatim.**
- `flex-col + flex-grow spacer + CTA bottom` — Phase 2 uses `<div class="flex-grow" />` (PackagesSection line 74) to push the CTA to the bottom of the card when card heights differ. Use for Step 3 cards to keep "Select" / radio affordance aligned across tiers.

**Backdrop / overlay for DirtyDismissGuard** (`NavController.tsx` lines 138-145):
```tsx
<div
  onClick={() => setDrawerOpen(false)}
  aria-hidden="true"
  className={cn(
    "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-250 motion-reduce:transition-none lg:hidden",
    drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
  )}
/>
```

**Adaptation for DirtyDismissGuard** (UI-SPEC says inline overlay WITHIN Dialog, NOT a nested Dialog):
- `absolute inset-0` (not `fixed`) because it sits inside the Dialog content bounds
- `bg-ink/40` scrim — same token as NavController drawer backdrop; UI-SPEC locks this
- Centered card: `<div class="bg-surface rounded-lg p-6 max-w-md mx-auto my-auto shadow-lg">…</div>`

**Chip / pill-button variant** (`GalleryGrid.tsx` lines 82-93):
```tsx
<button
  type="button"
  className={cn(
    "inline-flex items-center justify-center rounded-full border border-ink/20 text-ink",
    "px-6 py-3 text-body-md font-semibold",
    "hover:bg-ink hover:text-surface transition-colors duration-200 motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
  )}
>
```

**Adaptation for Step 2 guest-count chips** (UI-SPEC § Token References → "Chip idle / Chip selected"):
- idle: `bg-white border border-ink/20 text-ink min-h-[44px]`
- selected: `bg-primary text-white border-transparent min-h-[44px]`
- `inline-flex items-center justify-center rounded-full px-6 py-3 text-body-md font-semibold` carried from GalleryGrid pattern
- keep the same `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4` ring

---

### `src/components/Nav.astro` (MODIFY — retarget "Get a Quote" to Dialog trigger)

**Analog:** the current file itself (lines 47-53).

**Current pattern** (`src/components/Nav.astro` lines 46-54):
```astro
<div class="flex items-center gap-3">
  <Button
    size="default"
    className="hidden lg:inline-flex rounded-full px-6 bg-primary text-white hover:bg-primary/90"
    asChild
  >
    <a href="#inquiry">Get a Quote</a>
  </Button>
  <NavController client:load links={links} siteName={site.name} />
</div>
```

**Modification pattern (D-specifics + WIZ-05 entry point):**
- Replace the `<a href="#inquiry">` anchor with a Dialog.Trigger (via shadcn `Dialog` component's `<DialogTrigger asChild>`) that opens the wizard modal
- **Mobile drawer CTA inside NavController.tsx line 186-191** must also retarget — currently `<a href="#inquiry" onClick={() => setDrawerOpen(false)}>`. Change to fire a `CustomEvent('wizard:open', { detail: { entry: 'nav' } })` OR hoist the Dialog open-state into a shared store (Research recommends the CustomEvent approach for minimum coupling — WizardIsland subscribes on mount).
- Same retarget for `HeroSection.astro` line 63 (`<a href="#inquiry">`), `PackagesSection.astro` lines 78, 82 (`<a href={`#inquiry?tier=${pkg.id}`}>` — tier URL param stays per D-02/WIZ-09, now dispatched via event detail), `ContactSection.astro` line 74 (`<a href="#inquiry">Start a quote</a>`).

**Event-based decoupling (recommended, matches GSD's "extensible patterns" philosophy and is already hinted at by the `data-*` attribute idiom used in Nav.astro lines 22-25):**
```typescript
// In WizardIsland useEffect on mount:
const onOpen = (e: Event) => {
  const detail = (e as CustomEvent).detail as { entry?: string; tier?: string } | undefined;
  setOpen(true);
  if (detail?.tier) setValue('packageId', detail.tier);
  // fire wizard_start analytics with entryPoint = detail.entry
};
window.addEventListener('wizard:open', onOpen);
return () => window.removeEventListener('wizard:open', onOpen);
```

---

### `src/actions/submitInquiry.ts` (Astro Action)

**Analog:** NONE — `src/actions/` directory is empty (only `.gitkeep`). Phase 3 establishes the pattern. Use RESEARCH §Architecture Patterns code skeleton + the following conventions from the existing schema + utility files:

**Conventions harvested from the codebase to apply here:**
- `import { z } from "zod";` + reuse `leadSchema` (single source — never redefine fields)
- `import type { SiteData } from "@/lib/schemas/site";` for lead-time + blackout validation (re-import the same validators used client-side)
- `import { estimate } from "@/lib/pricing/estimate";` — same pure fn used client-side for the `finalEstimate` stamped on the stored lead (LEAD-07 + EST-02)
- Env var access via `import.meta.env.RESEND_API_KEY` etc. — types already present in `src/env.d.ts:4-11`. **Never read env inside the schema file or the pure util files.**
- Throw `ActionError('BAD_REQUEST', …)` for validation failures, `ActionError('TOO_MANY_REQUESTS', …)` for rate-limit — per `astro:actions` API (RESEARCH §LEAD-01)
- **Silent decoy** for SPAM-01..04: return `{ submissionId: 'LK-' + fakeShort, finalEstimate: null }` with 200 status. UI-SPEC locks this: "Indistinguishable-from-real-success UI" (SPAM-01 branch).
- File header: `// Source: RESEARCH §Architectural Responsibility Map + CONTEXT D-01..D-19 + LEAD-01..12 + SPAM-01..06`

**Action skeleton (from RESEARCH.md §Primary recommendation):**
```typescript
// import pattern — to be written:
import { defineAction, ActionError } from "astro:actions";
import { leadSchema } from "@/lib/schemas/lead";
import { estimate } from "@/lib/pricing/estimate";
import { getStore } from "@/lib/leads/store";
import { sendLeadNotification, sendLeadConfirmation } from "@/lib/email/send";
import { checkBotGates } from "@/lib/leads/botGates";
import { verifyTurnstile, checkRateLimit } from "@/lib/leads/rateLimit";
import { buildSubmissionId } from "@/lib/leads/submissionId";

export const submitInquiry = defineAction({
  accept: "form",
  input: leadSchema,
  handler: async (input, context) => { /* 9-step pipeline per ARCH diagram */ },
});
```

---

### `src/lib/email/templates/LeadNotification.tsx`, `LeadConfirmation.tsx` (React Email)

**Analog:** NONE in the repo. Use `@react-email/components` (installed Phase 3). Brand-token discipline from `global.css:17-48` still applies — use `@react-email/tailwind` with a minimal `@theme` override reproducing the brand palette for email clients, since email clients don't ship `global.css`.

**Conventions harvested from existing components that carry over:**
- Display heading style: `font-display text-display-md text-ink` — reproduce via `<Text style={{ fontFamily: "Lovelace, 'Playfair Display', serif", fontSize: 32, color: '#1C1B19' }}>`
- Italic serif price: `font-serif italic` — used consistently on brand (PackagesSection line 50, MenuSection line 115, ContactSection lines 42, 53)
- Eyebrow style: `uppercase tracking-[0.12em] text-accent font-semibold` — inline `letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8621B', fontWeight: 600`
- Phone formatting: `import { formatPhone } from "@/lib/format";` — re-use for the Larrae notification `tel:` link (D-16)
- Submission ID: use `font-mono text-body-lg` per UI-SPEC § Token References "Submission ID" — inline as `<Text style={{ fontFamily: 'monospace', fontSize: '1.125rem' }}>LK-{short}</Text>`
- Subject strings locked in UI-SPEC § Email copy: `New quote: {name} · {eventType} · {guestCount} guests · {date}` / `We got your request — thanks, {firstName}`

---

### `src/pages/api/cron/retry-email.ts` (scheduled endpoint)

**Analog:** NONE — `src/pages/` only contains `index.astro`. Phase 3 establishes the API-route pattern.

**Conventions from Astro 6 docs + existing content loaders that apply:**
- Export `export const prerender = false;` at top (mirrors `src/pages/index.astro:13` which sets `prerender = true` for static; API routes flip this)
- Export `GET` / `POST` handler: `export async function GET({ request }: APIContext) { … }`
- Auth: check `request.headers.get('authorization') === \`Bearer ${import.meta.env.CRON_SECRET}\`` before doing anything
- Use the same `getStore()` from `@/lib/leads/store` (no direct googleapis import here — layered access only)
- Return `new Response(JSON.stringify({ retried, failed }), { status: 200 })`

**New env var required:** `CRON_SECRET` — must be added to `src/env.d.ts` (executor extends the `ImportMetaEnv` interface). Reference pattern at `src/env.d.ts:4-13`.

---

### `tests/e2e/wizard.spec.ts` (Playwright E2E)

**Analog:** `tests/smoke.spec.ts` — the only existing Playwright test.

**Full imports + test shape** (`tests/smoke.spec.ts` lines 1-8):
```typescript
import { expect, test } from "@playwright/test";

test("home page returns 200 and renders brand word", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText(/larrae/i);
});
```

**Conventions to copy:**
- Flat import from `@playwright/test` — no page-object-model scaffolding needed for Phase 3 (project is small)
- `test(...)` per flow, not nested `describe` (smoke test has none)
- Relative URLs (`/`) — `playwright.config.ts` already sets `baseURL`
- Semantic locators (`page.getByRole('button', { name: 'Get a Quote' })`) — prefer over CSS selectors per Playwright best practice

**New test scope (happy-path + validation + Turnstile bypass per CONTEXT + SPAM-06 CI gate):**
- Test 1: open from hero CTA → 4 steps → submit → confirmation view shows `LK-` prefix
- Test 2: validation blocks advance on empty required fields per step
- Test 3: `?step=3&tier=medium` deep-link pre-selects medium on Step 3
- Test 4: sessionStorage survives reload mid-wizard
- Test 5 (CI-only, gated by env): Turnstile test-keys succeed; real keys fail build per SPAM-06 grep gate

---

## Shared Patterns

### Focus ring (applied to every interactive element)

**Source:** repeated verbatim across `NavController.tsx:131,166,178`, `PackagesSection.astro:37`, `ContactSection.astro:40,52`, `MenuSection.astro:70`, `FaqSection.astro:57`, `AboutSection.astro` (none — no interactives), `GalleryGrid.tsx:88`, `BaseLayout.astro:34-37` (skip-link variant).

**Canonical class list:**
```
focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4
```

**Apply to:** every button, every input, every radio card, every chip, every tile, the Dialog close button, stepper dots, "Back to site" button, lightbox triggers (none in wizard), `mailto:` / `tel:` links in error alerts.

### Touch target floor (44×44px)

**Source:** `NavController.tsx:130,166`, `MenuSection.astro:69`, `FaqSection.astro:57`.

**Canonical class list:**
```
min-h-[44px] min-w-[44px]
```

**Apply to:** chips (Step 2), persona tiles (Step 1), tier cards (Step 3 — the whole card is the tap target), Next/Back/Submit buttons, stepper dots, Dialog close X, confirmation "Back to site" button.

### Reduced-motion discipline

**Source:** `BaseLayout.astro:27-29` (global scroll-behavior override), `NavController.tsx:142,156` (per-element), `PackagesSection.astro:38,87` (per-element), `FaqSection.astro:61` (rotation), `MenuSection.astro:72` (tab underline).

**Canonical suffix everywhere animations appear:**
```
motion-reduce:transition-none
motion-reduce:animate-none  (for spinners + bounce affordances)
motion-safe:animate-...     (only for decorative purely-safe motion, e.g. HeroSection:70 chevron bounce)
```

UI-SPEC § Interaction & Motion table is the authoritative per-element list.

### Brand-token discipline (two-layer)

**Source:** `global.css:17-48` @theme block declares BOTH brand-layer (`--color-greens-deep`) AND semantic-layer (`--color-primary`) tokens. Every section component uses only the semantic tokens (`bg-surface`, `text-ink`, `text-primary`, `text-accent`, `border-ink/10`).

**The ONLY two explicitly-allowed brand-direct references** (per UI-SPEC § Design System row "Two-layer token discipline"):
1. `bg-[color:var(--color-butter-gold)]` — the Most Popular / Recommended badge (appears at `HeroSection.astro:41`, `PackagesSection.astro:44`, and will appear on Step 3 Recommended badge)
2. `text-[color:var(--color-southern-red)]` + `bg-[color:var(--color-southern-red)]/10` — error states (no current usage; Phase 3 establishes for inline field errors, server-error alert, submission-failure banner)

### Content-collection data flow (server → island)

**Source:** `src/pages/index.astro:14-22` loads via `getEntry` / `getCollection`; `src/components/sections/MenuSection.astro:9-12` shape of Props; React island `MenuTabs` receives NO data and only rewires DOM (pure-behavior island). `GalleryGrid.tsx:24-26,34` receives typed `photos` prop from Astro component.

**Pattern for wizard:**
- `src/pages/index.astro` loads `site` (already does) + `packages` (already does) + passes both to a new `<WizardDialog site={site.data} packages={packages.map(p => p.data)} />`
- `WizardDialog.astro` forwards these to `<WizardIsland client:load packages={...} site={siteSubset} />`
- `siteSubset` is a narrow type: `{ leadTimeDays: number; blackoutDates: string[]; email: string }` — do NOT pass the full site (phone/hours/address aren't needed in the island, keeps the serialized prop payload small)
- **Zero `getEntry` / `getCollection` calls inside React files.** Server-only APIs never cross the boundary.

### Zod + content-collection schema sharing

**Source:** `src/content.config.ts:1-12` imports every schema from `src/lib/schemas/`; section components then `import type { XxxData } from "@/lib/schemas/xxx"`. Same schemas are used for content validation AND for typing the runtime data.

**Pattern for wizard (Phase 3 adds one new layer):**
- `src/lib/schemas/lead.ts` exports `leadSchema` — NOT registered in `content.config.ts` (leads aren't content)
- Client: `import { leadSchema } from "@/lib/schemas/lead"; const form = useForm({ resolver: zodResolver(leadSchema) });`
- Server: same `import { leadSchema }`, passed as Astro Action `input: leadSchema`
- **Single source of truth** for every field — never redeclare in a component

### Path alias `@/`

**Source:** every TS/TSX file uses it. `tsconfig.json` configures `"@/*": ["./src/*"]` (verify at executor time; every current import works through it).

**Applies to:** every new file — use `@/lib/schemas/lead`, `@/components/ui/button`, `@/lib/pricing/estimate`, `@/lib/utils`. Never use relative paths longer than `./sibling` or `../same-parent/file`.

---

## No Analog Found

Files with no close match in the existing codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason | Recommended source |
|------|------|-----------|--------|--------------------|
| `src/actions/submitInquiry.ts` | Astro Action handler | POST pipeline | `src/actions/` is empty (`.gitkeep` only) | RESEARCH §Architectural Responsibility Map + Astro Actions docs |
| `src/actions/index.ts` | barrel | — | no existing barrel pattern | RESEARCH §Standard Stack (Astro 6 requires `export const server = { submitInquiry }` style) |
| `src/lib/leads/LeadStore.ts` | TS interface (contract) | — | no service interfaces exist in the codebase yet | RESEARCH §LEAD-06 |
| `src/lib/leads/GoogleSheetsAdapter.ts` | `googleapis` client wrapper | append + update | no third-party SDK wrappers exist | RESEARCH §Google Sheets Schema + §Adapter skeleton |
| `src/lib/leads/store.ts` | singleton factory | — | no factory patterns exist | RESEARCH §LEAD-06 |
| `src/lib/leads/rateLimit.ts` | sheet-backed rolling window | — | no rate-limit code exists | RESEARCH §Rate Limit Strategy |
| `src/lib/email/send.ts` | Resend SDK wrapper | request → third-party | no email code exists | RESEARCH §Standard Stack row `resend` |
| `src/lib/email/templates/LeadNotification.tsx` | React Email JSX | build/send-time render | no email templates exist | RESEARCH §Standard Stack + resend.com/blog/react-email-5 |
| `src/lib/email/templates/LeadConfirmation.tsx` | React Email JSX | build/send-time render | no email templates exist | same as above |
| `src/pages/api/cron/retry-email.ts` | scheduled API route | cron → store scan → send | no API routes exist (only prerendered `index.astro`) | RESEARCH §LEAD-11 |
| `src/pages/api/webhooks/resend.ts` | webhook endpoint | inbound → sheet update | same reason | RESEARCH §LEAD-12 |
| `vercel.json` | platform config | — | file doesn't yet exist at root | RESEARCH §LEAD-11 crons + Vercel docs |

---

## Metadata

**Analog search scope:**
- `src/components/` (all `.astro` + `.tsx`) — 8 files
- `src/lib/` (schemas, pricing, format, utils) — 12 files
- `src/actions/`, `src/lib/email/`, `src/lib/leads/` — empty directories (verified `.gitkeep` only)
- `src/pages/index.astro`, `src/layouts/BaseLayout.astro`
- `src/styles/global.css` (token contract), `src/content.config.ts` (schema registration pattern)
- `tests/smoke.spec.ts`, `src/lib/format.test.ts` — test scaffolds

**Files scanned:** ~25
**Pattern extraction date:** 2026-04-16
**Strongest cross-cutting patterns identified:**
1. **Zod 4 schema idiom** (`import { z } from "zod"; export const xxxSchema = z.object({...}); export type XxxData = z.infer<typeof xxxSchema>`) — uniformly across all 8 existing schemas
2. **Semantic-token discipline** (`bg-surface`, `text-ink`, `text-primary`, `text-accent`, `border-ink/10`) — uniform across all 8 existing sections; brand-direct references gated to Butter Gold badges + Southern Red errors only
3. **Focus ring** (`focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4`) — every interactive element in the existing codebase
4. **Touch target floor** (`min-h-[44px] min-w-[44px]`) — every mobile interactive
5. **Reduced-motion suffix** (`motion-reduce:transition-none` / `motion-reduce:animate-none`) — every animated class
6. **Default-export React islands** with typed `Props` interface + `useEffect` cleanup returns
7. **Path alias `@/`** for all cross-directory imports
8. **Content loaded in the page, not in sections/islands** — typed props flow downstream only

---

*Phase: 03-inquiry-wizard-lead-pipeline*
*Pattern map created: 2026-04-16*
