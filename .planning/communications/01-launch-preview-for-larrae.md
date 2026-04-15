---
type: client-email
to: Larrae
from: Ja Shia
status: DRAFT — do not send until Vercel preview URL is live
created: 2026-04-15
send_after: Phase 1 deploys to Vercel preview
fill_before_send:
  - PREVIEW_URL (paste actual Vercel preview link)
  - YOUR_EMAIL (the email Larrae should reply to)
---

# Email: Larrae's Kitchen — first preview is live

**Subject:** Larrae's Kitchen site — first preview is live, your eyes please 👀

Hi Larrae,

The first version of your site is up and running on a private preview link. Nothing is public yet — this URL is just for you (and anyone you forward it to) so you can walk through what's been built and tell me what feels right and what doesn't.

**Preview link:** {{PREVIEW_URL}}

It's a single-page scroll, so just keep scrolling from top to bottom. Open it on your phone too if you can — most of your guests will land there from Instagram or a Google search on mobile, so the phone view matters as much as the desktop one.

---

## What I need from you

Walk through the site and react to it however feels natural — what you love, what you'd change, what's missing, where you got confused, anything that doesn't sound like *you*. There are two easy ways to send that back:

### Option A — Just write it in an email

Reply to this email with your notes. Bullet points are fine. If you can mention which section you mean (e.g. "the hero with the photo," "the menu list," "the quote form"), that helps me find it fast.

### Option B — Record yourself talking through the site on Zoom

If it's easier to *talk* through your reactions than type them, record a quick Zoom of yourself walking the page. Here's the step-by-step:

1. Open Zoom and click **New Meeting** (you don't need to invite anyone — it's just you).
2. In the meeting toolbar, click **Share Screen** → pick the browser window with the preview link → click **Share**.
3. Click the **Record** button at the bottom of the toolbar (or hit `Alt+R` on Windows / `Cmd+Shift+R` on Mac). Pick **Record to the Cloud** if you have it, or **Record to this Computer** otherwise.
4. Talk through the site — scroll slowly, point things out, just say what comes to mind. There's no wrong way to do this. Five to ten minutes is plenty.
5. When you're done, click **Stop Recording**, then **End Meeting**.
6. **If you recorded to the Cloud:** Zoom emails you a shareable link in a few minutes — forward that email to me at {{YOUR_EMAIL}}.
   **If you recorded to your computer:** Zoom saves a `.mp4` file in your Documents → Zoom folder. Drag it into a reply to this email (Gmail handles up to ~25 MB; if it's bigger, drop it in your Google Drive and share the link with me).

Either option works for me — pick whichever you'll actually do today.

---

## What happens next (if you give the green light)

Once you sign off on the look and feel, here's the short list of what we line up to take this from a preview link to a working business tool:

1. **Hook up your real domain.** Right now the site lives at a temporary preview URL. We point your real domain (e.g., `larraeskitchen.com`) at the site so visitors can actually find you. If you don't have one yet, I'll help you pick and register one — it's about $12/year.
2. **Set up email sending.** Inquiry forms need to send notifications to your inbox reliably and not land in spam. That means a few DNS records (SPF / DKIM / DMARC) tied to your domain, and a sender address like `hello@larraeskitchen.com`. I do the technical part; you decide the address.
3. **Add a payment processor — Stripe.** This is a *new* item — not in the original build. Right now the site captures inquiries (someone asks for a quote, you reply, you book them by phone or email). If you want to also collect **deposits or full payment online**, we'd add Stripe. Stripe is the standard, takes ~2.9% + $0.30 per transaction, and lets you accept cards on the site without handling card numbers yourself. **This is a real decision** — adding online payments brings tax/refund/dispute handling into the picture, and it changes the booking flow. We can absolutely do it; I just want to flag it as a separate phase rather than slip it in quietly.

If all three sound good, I'll spin up a plan for each and we'll work through them in order — domain first (fastest, cheapest), email second, Stripe third (and only if you actually want online payments).

---

Take your time with the preview. No rush — better to react honestly than to rush through and miss things. Looking forward to your notes.

Talk soon,
Ja

---

## Internal notes (NOT for the client)

- **Stripe scope flag:** This was raised mid-Phase-1 by Ja. It is *not* in the current roadmap (Phases 1–5 build a lead-gen catering site — wizard → email + Sheets, no checkout). Adding Stripe needs:
  - A new phase (probably Phase 6) with its own requirements, threat model, and PCI-SAQ A scope decision.
  - New env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` — append to `.env.example` only when that phase plans, not now.
  - Decision: deposits-only vs full-payment-online vs payment-link emailed after quote (cheapest, no UI work, just a Stripe Checkout link).
  - Compliance: terms of service, refund policy, dispute handling — Larrae's call, not technical.
  - **Do NOT modify Phase 1 plans for this.** CONTEXT.md is locked and Stripe isn't in any FND-XX requirement. Park it as a deferred idea or a backlog item — `/gsd-add-backlog` is the right tool once she confirms.
- **Domain + email** are already in the roadmap (Phase 5 covers domain + DKIM/SPF/DMARC per CONTEXT D-15). The email sells those as "next steps" because from Larrae's POV they happen after preview approval; they're not new scope.
- **Preview URL** comes from the FND-07 Vercel integration. Will be auto-posted to the PR that ships Phase 1.
- **Send mechanics:** Don't send until Phase 1 verification passes and the preview URL renders cleanly on mobile + desktop. Open the URL yourself first, confirm hero, fonts, and basic scroll all work. If the preview is empty (Phase 1 is scaffold-only — no real content yet), this email is *premature* — wait until Phase 2 (content + sections) is also live, otherwise Larrae sees an empty page and thinks something is broken. **Recommend holding this email until at least Phase 2 ships.**
