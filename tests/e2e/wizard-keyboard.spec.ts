// Source: Plan 03-06 Task 2 — Playwright keyboard-only wizard E2E.
// WIZ-13 (full keyboard navigation), A11Y-03 (focus trap + ARIA roles),
// CONTEXT D-01 (shadcn Dialog provides focus trap via Radix).
//
// This spec verifies a keyboard-only user can open the wizard from a
// focused CTA, complete Step 1 using Tab + Enter, and advance to Step 2.
// Full end-to-end keyboard submission is overkill for this guard — the
// critical regression is "can the dialog and step navigation be reached
// without a pointer at all?"
import { expect, test } from "@playwright/test";

test.describe("Wizard keyboard nav", () => {
  test("Tab + Enter opens dialog, selects persona, advances to Step 2", async ({ page }) => {
    await page.goto("/");
    // Wait for React island hydration — without this, the Enter keydown can
    // dispatch wizard:open before WizardIsland's event listener is attached.
    await page.waitForLoadState("networkidle");

    // Focus the hero CTA directly and activate via keyboard (retry because
    // WizardIsland's `useEffect` registers the wizard:open listener during
    // client hydration — the first Enter can be swallowed).
    const dialog = page.getByRole("dialog");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.locator('[data-wizard-entry="hero"]').first().focus();
      await page.keyboard.press("Enter");
      try {
        await expect(dialog).toBeVisible({ timeout: 1500 });
        break;
      } catch {
        await page.waitForTimeout(500);
      }
    }
    await expect(dialog).toBeVisible();

    // Tab until an element whose accessible name includes "Family" is focused
    // — this is the sr-only radio wrapped by the Family persona tile. Keyboard
    // users must be able to reach every interactive element in the Dialog.
    let reachedFamily = false;
    for (let i = 0; i < 40; i += 1) {
      const accessibleName = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return "";
        // Prefer aria-label, then aria-labelledby, then associated <label> text,
        // then the element's own text.
        if (el.getAttribute("aria-label")) return el.getAttribute("aria-label") ?? "";
        const labelledBy = el.getAttribute("aria-labelledby");
        if (labelledBy) {
          const byId = document.getElementById(labelledBy);
          if (byId) return byId.textContent?.trim() ?? "";
        }
        // Radio wrapped by a <label>: fall back to the label's text content.
        const wrapping = el.closest("label");
        if (wrapping) return wrapping.textContent?.trim() ?? "";
        return el.textContent?.trim() ?? "";
      });
      if (accessibleName.includes("Family")) {
        reachedFamily = true;
        break;
      }
      await page.keyboard.press("Tab");
    }
    expect(reachedFamily).toBe(true);
    // Space selects a radio; Enter would submit a form.
    await page.keyboard.press("Space");

    // Tab forward to the Step 1 Next button and press Enter.
    let reachedNext = false;
    for (let i = 0; i < 30; i += 1) {
      const active = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
      if (active.includes("Next — add guests")) {
        reachedNext = true;
        break;
      }
      await page.keyboard.press("Tab");
    }
    expect(reachedNext).toBe(true);
    await page.keyboard.press("Enter");

    // Step 2 reached — chip + date picker visible.
    await expect(page.getByRole("button", { name: /21–30 guests/ })).toBeVisible();
  });
});
