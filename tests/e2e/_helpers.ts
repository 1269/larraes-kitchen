// Source: Plan 03-06 Task 2 — shared E2E helpers.
//
// The wizard is mounted as an Astro React island with `client:load`, which
// begins hydration after the HTML has been served. A pointer click on the
// hero CTA fires `window.dispatchEvent(new CustomEvent("wizard:open"))`;
// WizardIsland's `useEffect` registers the listener during its first render
// — meaning a click BEFORE hydration completes dispatches the event into the
// void and the Dialog never opens.
//
// `openWizardFromHero` waits for `networkidle` (hydration signal in dev)
// and then retries the open action until the dialog is visible.
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Click the hero CTA and wait for the wizard Dialog to appear. Retries a
 * handful of times because WizardIsland's listener is attached during React
 * hydration — clicks before the effect fires are swallowed.
 */
export async function openWizardFromHero(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  const dialog = page.getByRole("dialog");
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.locator('[data-wizard-entry="hero"]').first().click();
    try {
      await expect(dialog).toBeVisible({ timeout: 1500 });
      return;
    } catch {
      // Hydration may still be in-flight — back off a beat and retry.
      await page.waitForTimeout(500);
    }
  }
  // Final attempt with the real timeout so the caller sees a clean failure.
  await expect(dialog).toBeVisible();
}

/**
 * Same pattern for package-card deep-link entry (data-wizard-entry="package_card").
 */
export async function openWizardFromPackageCard(
  page: Page,
  tier: "small" | "medium" | "large",
): Promise<void> {
  await page.waitForLoadState("networkidle");
  const dialog = page.getByRole("dialog");
  const card = page.locator(`[data-wizard-entry="package_card"][data-tier="${tier}"]`).first();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await card.click();
    try {
      await expect(dialog).toBeVisible({ timeout: 1500 });
      return;
    } catch {
      await page.waitForTimeout(500);
    }
  }
  await expect(dialog).toBeVisible();
}
