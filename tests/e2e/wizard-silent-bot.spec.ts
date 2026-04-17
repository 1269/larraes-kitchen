// Source: Plan 03-06 Task 2 — Playwright silent-bot E2E.
// CONTEXT D-18 (silent decoy for bot-tripped submissions — no tell),
// SPAM-01 (honeypot), SPAM-05 (fallback email).
//
// A bot that fills the honeypot must see exactly the same confirmation
// screen a legitimate user sees (decoy 200 with a fabricated LK-XXXXXX).
// No error alert, no lead record stored, no email sent.
//
// Strategy: the submitInquiry handler's full 9-step pipeline (including the
// honeypot gate's silent-decoy branch) is exercised by the 12-scenario
// integration suite in src/actions/__tests__/submitInquiry.test.ts. This E2E
// spec owns the CLIENT-SIDE contract — when the server returns a decoy
// success (200 with a fabricated submissionId), the wizard renders the
// confirmation view with NO visible error alert.
import { expect, test } from "@playwright/test";

test.describe("Silent bot defense", () => {
  test("decoy 200 → confirmation view with NO error alert", async ({ page }) => {
    // Mock the Astro Action to return a decoy success — the SHAPE Plan 05's
    // `decoySuccess()` returns for bot-gate trips. The client should be
    // indistinguishable between a real success and a decoy.
    await page.route("**/_actions/submitInquiry**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: { submissionId: "LK-7ZXY99", estimate: null },
          error: null,
        }),
      });
    });
    // Hang Turnstile — its onError callback clears turnstileToken in RHF.
    await page.route("https://challenges.cloudflare.com/**", async (route) => {
      await new Promise((r) => setTimeout(r, 60_000));
      await route.abort();
    });

    // Seed sessionStorage with a valid snapshot. Crucially the `honeypot`
    // field is "i-am-a-bot" — the server will silent-decoy this submission.
    await page.addInitScript(() => {
      const future = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      window.sessionStorage.setItem(
        "lk_wizard_v1",
        JSON.stringify({
          values: {
            eventType: "family",
            guestCount: 15,
            eventDate: future,
            zip: "",
            packageId: "small",
            name: "Bot Tester",
            email: "bot@example.com",
            phone: "(510) 555-0123",
            eventAddress: "",
            eventCity: "",
            notes: "",
            howHeard: "",
            contactMethod: "email",
            honeypot: "i-am-a-bot",
            turnstileToken: "e2e-token-seeded",
          },
          savedAt: Date.now(),
        }),
      );
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("wizard:open", { detail: { entry: "hero" } }));
    });
    await expect(page.getByRole("dialog")).toBeVisible();

    // Walk to Step 4.
    await page.locator('input[type="radio"][value="family"]').click({ force: true });
    await page.getByRole("button", { name: /Next — add guests & date/ }).click();
    await page.getByRole("button", { name: /Next — pick your package/ }).click();
    await page.getByRole("button", { name: /Next — your contact info/ }).click();

    // Ensure honeypot is still "i-am-a-bot" even after any widget re-render.
    await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('input[name="honeypot"]');
      if (el) {
        el.value = "i-am-a-bot";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    await page.getByRole("button", { name: "Send my request" }).click();

    // Decoy success: confirmation heading appears, reference looks real.
    await expect(page.getByRole("heading", { name: /^Thanks, Bot Tester/ })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/^Reference: /)).toBeVisible();

    // And CRUCIALLY — no visible error alert block. Silent reject.
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
