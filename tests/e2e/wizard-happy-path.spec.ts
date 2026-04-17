// Source: Plan 03-06 Task 2 — Playwright happy-path E2E.
// CONTEXT D-15 (confirmation copy), D-19 (LK-XXXXXX format).
// Turnstile test site key (`1x00000000000000000000AA`) auto-passes — injected
// via playwright.config.ts `webServer.env`, never written to .env on disk.
//
// W2 guard: the Plan 03 Task 2 placeholder stub `LK-PLACE` was removed in
// Plan 05 Task 3. If a merge conflict or regression restores the try/catch
// fallback, this happy-path spec must fail LOUDLY. We assert BOTH:
//   - positive: reference matches `LK-[0-9A-Z]{6}` pattern
//   - negative: reference is NOT `LK-PLACE*` (placeholder regression guard)
//
// Strategy: seed sessionStorage with a valid snapshot AND mock the Astro
// Action POST. The unit of this spec is the WIZARD RENDERING of the
// confirmation screen with a real LK- reference. The full submitInquiry
// pipeline is exercised in src/actions/__tests__/submitInquiry.test.ts
// (Plan 05, 12 scenarios).
import { expect, test } from "@playwright/test";

test.describe("Wizard happy path", () => {
  test("seeded flow → submit → confirmation with LK- (not LK-PLACE)", async ({ page }) => {
    // (1) Mock Astro Action success response — this is the server contract.
    await page.route("**/_actions/submitInquiry**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: {
            submissionId: "LK-4Q7P3B",
            estimate: { min: 500, max: 650 },
          },
          error: null,
        }),
      });
    });
    // (2) Hang Cloudflare Turnstile requests (never abort, never fulfill) —
    // the widget's `onError` callback clears turnstileToken in RHF state.
    // Hanging keeps the iframe in "pending" state so neither onSuccess nor
    // onError fires — the seeded sessionStorage token stays intact.
    await page.route("https://challenges.cloudflare.com/**", async (route) => {
      // Wait longer than the test itself, never respond.
      await new Promise((r) => setTimeout(r, 60_000));
      await route.abort();
    });

    // (3) Seed sessionStorage with a fully-valid wizard snapshot. This
    // satisfies the RHF zodResolver on submit without depending on the
    // Turnstile iframe handshake.
    await page.addInitScript(() => {
      const future = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      window.sessionStorage.setItem(
        "lk_wizard_v1",
        JSON.stringify({
          values: {
            eventType: "family",
            guestCount: 25,
            eventDate: future,
            zip: "",
            packageId: "medium",
            name: "Cynthia Jackson",
            email: "cynthia@example.com",
            phone: "(510) 555-0123",
            eventAddress: "",
            eventCity: "",
            notes: "",
            howHeard: "",
            contactMethod: "email",
            turnstileToken: "e2e-token-seeded",
          },
          savedAt: Date.now(),
        }),
      );
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open the wizard directly via a CustomEvent — bypasses any hydration
    // timing issue on the hero CTA script.
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("wizard:open", { detail: { entry: "hero" } }));
    });
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Walk to Step 4 (seeded values satisfy every step's validator).
    await page.locator('input[type="radio"][value="family"]').click({ force: true });
    await page.getByRole("button", { name: /Next — add guests & date/ }).click();
    await expect(page).toHaveURL(/[?&]step=2/);
    await page.getByRole("button", { name: /Next — pick your package/ }).click();
    await expect(page).toHaveURL(/[?&]step=3/);
    await page.getByRole("button", { name: /Next — your contact info/ }).click();
    await expect(page).toHaveURL(/[?&]step=4/);

    // Fields pre-populated from seeded sessionStorage.
    await expect(page.getByLabel("Your name")).toHaveValue("Cynthia Jackson");

    // Submit — route mock fulfills with LK-4Q7P3B.
    await page.getByRole("button", { name: "Send my request" }).click();

    // D-15 confirmation view — heading + Reference line.
    await expect(
      page.getByRole("heading", {
        name: /^Thanks, Cynthia — your request is in\.$/,
      }),
    ).toBeVisible({ timeout: 10_000 });
    const refLine = page.getByText(/^Reference: /);
    await expect(refLine).toBeVisible();

    const refText = await refLine.textContent();
    // Positive: real LK-XXXXXX format (D-19 — 6 upper-alphanumeric after LK-).
    expect(refText).toMatch(/LK-[0-9A-Z]{6}/);
    // Negative (W2 regression guard): placeholder stub must NOT appear.
    expect(refText).not.toMatch(/^Reference: LK-PLACE/);
    expect(refText).not.toContain("LK-PLACE");
  });
});
