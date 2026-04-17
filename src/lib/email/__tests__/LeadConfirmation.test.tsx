// Source: Plan 03-05 Task 1 — React Email template for the inquirer's confirmation.
// CONTEXT D-17 (warm heritage voice), UI-SPEC §Email copy (opening heritage line locked), LEAD-09.
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import LeadConfirmation from "../templates/LeadConfirmation";
import type { LeadRecord } from "@/lib/leads/LeadStore";

const fixture: LeadRecord = {
  createdAt: "2026-04-17T10:00:00.000Z",
  submissionId: "LK-4Q7P3B",
  ulid: "01HXYZ0000000000000000000A",
  idempotencyKey: "11111111-1111-4111-8111-111111111111",
  eventType: "social",
  guestCount: 25,
  eventDate: "2026-07-10",
  packageId: "medium",
  finalEstimateMin: 500,
  finalEstimateMax: 650,
  name: "Ethan Marsh",
  email: "ethan@example.com",
  phone: "5105550199",
  zip: "94510",
  eventAddress: "",
  eventCity: "",
  notes: "",
  howHeard: "google",
  contactMethod: "email",
  ipHash: "abc123",
  notifyEmailStatus: "pending",
  confirmEmailStatus: "pending",
  retryCount: 0,
  userAgent: "Mozilla/5.0",
};

describe("LeadConfirmation template", () => {
  it("renders the verbatim warm heritage opening line", async () => {
    const html = await render(
      <LeadConfirmation record={fixture} larraeEmail="hello@larraeskitchen.com" />,
    );
    expect(html).toContain("We cook like family, and we treat every inquiry the same way.");
  });

  it("renders 'Thanks, {firstName} — your request is in.' as the heading", async () => {
    const html = await render(
      <LeadConfirmation record={fixture} larraeEmail="hello@larraeskitchen.com" />,
    );
    expect(html).toContain("Thanks, Ethan");
    expect(html).toContain("your request is in");
  });

  it("renders the event recap (type, guests, date, package) and estimate", async () => {
    const html = await render(
      <LeadConfirmation record={fixture} larraeEmail="hello@larraeskitchen.com" />,
    );
    expect(html).toContain("social");
    expect(html).toContain("25");
    expect(html).toContain("2026-07-10");
    expect(html).toContain("medium");
    expect(html).toContain("$500");
    expect(html).toContain("$650");
  });

  it("renders the submission ID as a reference line", async () => {
    const html = await render(
      <LeadConfirmation record={fixture} larraeEmail="hello@larraeskitchen.com" />,
    );
    expect(html).toContain("LK-4Q7P3B");
    expect(html).toContain("Reference");
  });

  it("renders a mailto link to Larrae's address", async () => {
    const html = await render(
      <LeadConfirmation record={fixture} larraeEmail="hello@larraeskitchen.com" />,
    );
    expect(html).toContain("mailto:hello@larraeskitchen.com");
  });

  it("renders 'Custom quote' copy when the estimate is null", async () => {
    const custom: LeadRecord = { ...fixture, finalEstimateMin: null, finalEstimateMax: null };
    const html = await render(
      <LeadConfirmation record={custom} larraeEmail="hello@larraeskitchen.com" />,
    );
    expect(html).toContain("Custom quote");
  });
});
