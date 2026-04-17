// Source: Plan 03-06 Task 2 — Playwright wizard state persistence E2E.
// CONTEXT D-02 (package deep-link carries tier — `data-tier="medium"` entry
// points on PackagesSection cards), D-04 (pushState URL sync), WIZ-04
// (sessionStorage persistence), WIZ-05 (URL step sync).
import { expect, test } from "@playwright/test";
import { openWizardFromHero, openWizardFromPackageCard } from "./_helpers";

test.describe("Wizard state persistence", () => {
  test("package card with data-tier='medium' pre-selects medium on Step 3", async ({ page }) => {
    await page.goto("/");
    // Deep-link via a package-card CTA carries tier forward but still lands
    // the user on Step 1 (D-02). Tier should be pre-selected once Step 3 opens.
    await openWizardFromPackageCard(page, "medium");
    await expect(page.getByRole("dialog")).toBeVisible();

    // Step 1 — Social persona. Click the wrapping <label> (the sr-only radio
    // would be intercepted by decorative SVG children).
    await page.locator('label:has(input[value="social"])').click();
    await page.getByRole("button", { name: /Next — add guests & date/ }).click();

    // Step 2 — 21–30 chip (25 guests → medium) + future date
    await page.getByRole("button", { name: "21–30 guests" }).click();
    const future = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await page.getByLabel("Event date").fill(future);
    await page.getByRole("button", { name: /Next — pick your package/ }).click();

    // Step 3 — medium radio should be pre-selected (carried from deep-link)
    const mediumRadio = page.locator('input[type="radio"][value="medium"]');
    await expect(mediumRadio).toBeChecked();
  });

  test("refresh mid-wizard restores step via URL pushState sync", async ({ page }) => {
    await page.goto("/");
    await openWizardFromHero(page);
    await page.locator('label:has(input[value="family"])').click();
    await page.getByRole("button", { name: /Next — add guests & date/ }).click();

    // Now at Step 2 — URL should have ?step=2
    await expect(page).toHaveURL(/[?&]step=2/);

    // Select a guest chip so sessionStorage has something to restore
    await page.getByRole("button", { name: "10–20 guests" }).click();

    // Refresh — URL-step sync (WIZ-05) should land the user back on Step 2
    await page.reload();
    await expect(page.getByRole("dialog")).toBeVisible();
    // The Step 2 "Next — pick your package" button proves we're still on Step 2.
    await expect(page.getByRole("button", { name: /Next — pick your package/ })).toBeVisible();
  });
});
