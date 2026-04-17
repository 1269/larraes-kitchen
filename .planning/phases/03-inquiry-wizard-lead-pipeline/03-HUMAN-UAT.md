---
status: partial
phase: 03-inquiry-wizard-lead-pipeline
source: [03-VERIFICATION.md]
started: 2026-04-17T19:35:00Z
updated: 2026-04-17T19:35:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Wizard submit flow end-to-end (mobile)

expected: Confirmation screen shows "Thanks, [Name] — your request is in." with a real `LK-XXXXXX` reference code (6 alphanumeric chars after `LK-`). The `LK-PLACE` placeholder must NOT appear.

steps:
1. Open Vercel Preview URL on a mobile device (iPhone Safari or Android Chrome)
2. Tap "Get a Quote" from the hero
3. Complete all 4 steps: persona (Family/Social/Corporate) → 25 guests + date 2+ weeks out → Medium tier → Name/Email/Phone
4. Watch the sticky estimate bar update live as you edit guests + tier
5. Tap "Send my request" and wait for the invisible Turnstile check
6. Confirm the confirmation screen appears with a real `LK-XXXXXX` reference

why_human: 3 of 5 Playwright E2E specs are blocked by a React 19 SSR "Invalid hook call" warning in the full-stack dev server hydration path. Pre-existing. Phase 5 owns the `@hookform/resolvers` v5 migration fix.

result: [pending]

### 2. Bot decoy path (honeypot injection)

expected: Wizard shows the confirmation view (decoy success), but NO new row appears in the Leads Google Sheet. The `LK-XXXXXX` shown in the confirmation view must NOT appear in the Sheet.

steps:
1. Open the wizard on Vercel Preview
2. DevTools → Elements → find the hidden `input[name="honeypot"]` field inside the wizard Dialog
3. Set its value to `test-bot` via the property inspector
4. Complete the form normally and submit
5. Open the Leads tab of the Google Sheet — verify NO new row was appended

why_human: SPAM-01 silent-decoy is unit-tested (`submitInquiry.test.ts` scenario #2) but requires live Sheets access to confirm the row is absent.

result: [pending]

### 3. Email delivery (Larrae notification + inquirer confirmation)

expected: Larrae receives email with subject `"New quote: [Name] · [eventType] · [N] guests · [date]"` (action-first layout, tel: link, estimate). Submitter receives email with subject `"We got your request — thanks, [First Name]"` (heritage copy, matching `LK-XXXXXX`). Both appear in Resend Dashboard with `submission_id` + `which` tags.

steps:
1. Provision RESEND_API_KEY + RESEND_FROM_EMAIL in Vercel Preview env per Plan 05 checklist
2. Submit a complete inquiry on the Preview
3. Check Larrae's inbox within 5 minutes — verify notification email with action-first layout
4. Check submitter's inbox within 5 minutes — verify confirmation email with matching `LK-XXXXXX`
5. Check Resend Dashboard → Logs → find both sends with `submission_id` and `which` tags

why_human: Real email delivery and inbox rendering cannot be automated. React Email templates are render-tested (11 scenarios) but inbox spam-folder behavior and rendering across Gmail / iOS Mail / Outlook require human inspection.

result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

No programmatic gaps — all 7 ROADMAP success criteria have implementation evidence. See `03-VERIFICATION.md` for the full audit.

## Launch Blockers (from 03-REVIEW.md — fix before production)

- **CR-01** — `src/lib/leads/GoogleSheetsAdapter.ts:28` — `safeText` regex misses `+`, `-`, `@`, `\t` formula triggers
- **CR-03** — `src/pages/api/cron/retry-email.ts:30` — `Bearer undefined` accepted when `CRON_SECRET` unset
- **CR-04** — `src/pages/api/webhooks/resend.ts:125-130` — `markEmailRetry` failure returns 200 (Resend stops retrying)

Fix with `/gsd-code-review-fix 3` or manually.
