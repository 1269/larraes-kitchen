// Source: Plan 03-05 Task 1 — React Email template for Larrae's lead notification.
// CONTEXT D-16 (action-first layout, tap-to-call phone), UI-SPEC §Email copy, LEAD-08.
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import LeadNotification from "../templates/LeadNotification";
import type { LeadRecord } from "@/lib/leads/LeadStore";

const fixture: LeadRecord = {
  createdAt: "2026-04-17T10:00:00.000Z",
  submissionId: "LK-4Q7P3B",
  ulid: "01HXYZ0000000000000000000A",
  idempotencyKey: "11111111-1111-4111-8111-111111111111",
  eventType: "family",
  guestCount: 15,
  eventDate: "2026-06-15",
  packageId: "small",
  finalEstimateMin: 330,
  finalEstimateMax: 420,
  name: "Cynthia Patterson",
  email: "cynthia@example.com",
  phone: "5105550123",
  zip: "94510",
  eventAddress: "123 Main St",
  eventCity: "Benicia",
  notes: "Vegetarian option requested",
  howHeard: "instagram",
  contactMethod: "phone",
  ipHash: "abc123",
  notifyEmailStatus: "pending",
  confirmEmailStatus: "pending",
  retryCount: 0,
  userAgent: "Mozilla/5.0",
};

describe("LeadNotification template", () => {
  it("renders the inquirer name and the tap-to-call phone (formatted)", async () => {
    const html = await render(<LeadNotification record={fixture} />);
    expect(html).toContain("Cynthia Patterson");
    expect(html).toContain("(510) 555-0123"); // formatPhone output
    expect(html).toContain("tel:5105550123"); // raw digits in href
  });

  it("renders the email, event type, guest count, event date, and submission ID", async () => {
    const html = await render(<LeadNotification record={fixture} />);
    expect(html).toContain("cynthia@example.com");
    expect(html).toContain("family");
    // React SSR inserts <!-- --> between adjacent text nodes — match either
    // the raw fragment or the combined phrase after comment removal.
    const stripped = html.replace(/<!--[^]*?-->/g, "");
    expect(stripped).toContain("15 guests");
    expect(html).toContain("2026-06-15");
    expect(html).toContain("LK-4Q7P3B");
  });

  it("renders the estimated range when present", async () => {
    const html = await render(<LeadNotification record={fixture} />);
    expect(html).toContain("$330");
    expect(html).toContain("$420");
  });

  it("renders the notes when present", async () => {
    const html = await render(<LeadNotification record={fixture} />);
    expect(html).toContain("Vegetarian option requested");
  });

  it("renders 'Custom quote' copy when the estimate is null (custom-quote path)", async () => {
    const custom: LeadRecord = { ...fixture, finalEstimateMin: null, finalEstimateMax: null };
    const html = await render(<LeadNotification record={custom} />);
    expect(html).toContain("Custom quote");
  });
});
