import { expect, test } from "@playwright/test";

test("home page returns 200 and renders brand word", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText(/larrae/i);
});
