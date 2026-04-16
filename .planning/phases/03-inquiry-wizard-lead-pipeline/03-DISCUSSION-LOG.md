# Phase 3: Inquiry Wizard & Lead Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 03-inquiry-wizard-lead-pipeline
**Areas discussed:** Wizard surface & entry; Steps 1–2 (Event Type + Guests + Date); Estimate math & tier logic; Submission experience (fields, confirmation, emails, errors)

---

## Area 1: Wizard Surface & Entry

### Q: When the user hits 'Get a Quote', where does the wizard appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen modal (Recommended) | shadcn Dialog — takes over viewport, home page dims in background; focus trap + ARIA built in; URL syncs via ?step=N | ✓ |
| Dedicated /inquiry route | Separate page, rock-solid deep-linking; breaks single-page architecture | |
| Inline Contact/Wizard section | Scroll-to section on home page; pure SPA feel but distracts the user, mobile keyboard issues | |

**User's choice:** Full-screen modal
**Notes:** Decision carries forward as D-01. shadcn Dialog to be installed in Phase 3 (not present in Phase 1 D-08).

---

### Q: When user deep-links from a Package card (tier pre-selected), where in the wizard do they land?

| Option | Description | Selected |
|--------|-------------|----------|
| Start at Step 1 with tier stored (Recommended) | Tier remembered, auto-selected at Step 3; all funnel data preserved | ✓ |
| Jump to Step 3 (Package) | Skip first two steps; loses Event Type + Guest Count data | |
| Jump to Step 4 (Contact) with tier+default guest count | Fastest path; loses real guest count and date | |

**User's choice:** Start at Step 1 with tier stored
**Notes:** D-02. URL form: `/?step=1&tier=medium`.

---

### Q: User is mid-wizard in the modal, has typed real data, and taps the X or clicks the backdrop. What happens?

| Option | Description | Selected |
|--------|-------------|----------|
| Confirm 'Save for later?' with options (Recommended) | Inline confirmation, reinforces sessionStorage persistence; only when form is dirty | ✓ |
| Close silently, state persists | No confirmation, sessionStorage keeps data; risk of accidental close | |
| Close silently, state clears | Conflicts with WIZ-04 | |

**User's choice:** Confirm 'Save for later?' with options
**Notes:** D-03. Clean modals close instantly; dirty modals show inline confirmation with [Keep editing] / [Close].

---

### Q: Modal opens → URL needs to reflect wizard state for WIZ-05. What does the URL look like when the wizard is open?

| Option | Description | Selected |
|--------|-------------|----------|
| Push query: /?step=2 (Recommended) | SPA standard, browser back works cleanly, deep-link supports tier+step natively | ✓ |
| Hash fragment: /#inquiry-step-2 | Keeps query params clean for UTM; awkward with tier pre-select | |
| replaceState — URL never grows history | Breaks WIZ-05 | |

**User's choice:** Push query: /?step=2
**Notes:** D-04. Back from Step 1 closes modal; closing via X or backdrop pushes `/`.

---

## Area 2: Steps 1–2 — Event Type, Guests, Date

### Q: Step 1 asks 'What kind of event?' What options do we show?

| Option | Description | Selected |
|--------|-------------|----------|
| Three persona tiles: Family / Social / Corporate (Recommended) | Matches the three PROJECT.md personas; fast tap-scale on mobile | ✓ |
| Five-option dropdown (Birthday/Family/Holiday/Corporate/Wedding/Other) | More signal; slower and 'Wedding' may over-promise | |
| Free text 'Tell us about the event' | Maximum qualitative; high drop-off from step-1 typing | |

**User's choice:** Three persona tiles
**Notes:** D-05.

---

### Q: Does Event Type affect anything downstream, or is it purely informational?

| Option | Description | Selected |
|--------|-------------|----------|
| Purely informational (Recommended) | Stored + surfaced in Larrae's email + analytics; no package filtering, no pricing change | ✓ |
| Recommends a tier on Step 3 | Conflicts with guest-count-based recommendation | |
| Filters blackout dates or lead time | Adds schema + UX complexity | |

**User's choice:** Purely informational
**Notes:** D-06. Avoids two competing recommendation systems.

---

### Q: How does the user enter guest count in Step 2?

| Option | Description | Selected |
|--------|-------------|----------|
| Quick-picks + number field (Recommended) | Chips (10–20, 21–30, 31–50, 50+) auto-fill midpoint; editable number field below | ✓ |
| Stepper (− / number / +) | Touch-friendly but tedious for large ranges | |
| Plain number input | Simplest, no visual range cue | |
| Slider 10–200 | Visual but imprecise on mobile; confusing for out-of-range | |

**User's choice:** Quick-picks + number field
**Notes:** D-07. Chips also softly preview which tier they'll land on.

---

### Q: Step 2 also asks for the event date. Native or custom?

| Option | Description | Selected |
|--------|-------------|----------|
| Native <input type='date'> + inline hints (Recommended) | Platform picker + text hint for lead-time/blackouts; zero bundle cost | ✓ |
| Custom react-day-picker with visible blackouts | Greyed-out blocked dates; ~15KB + native feel lost | |
| Split: month + day dropdowns | Antiquated fallback | |

**User's choice:** Native <input type='date'> + inline hints
**Notes:** D-08. Lead-time + blackouts sourced from `content/site.md`. Deferred custom picker in `<deferred>` section.

---

## Area 3: Estimate Math & Tier Logic

### Q: For 25 guests in Medium tier ($20–$26/person), the live estimate shows:

| Option | Description | Selected |
|--------|-------------|----------|
| $500 – $650, rounded to nearest $10 (Recommended) | Clean reading, matches EST-03 format example | ✓ |
| $500 – $650, no rounding | Exact arithmetic; sometimes ugly | |
| Midpoint only: $575 | Conflicts with EST-03 | |
| Bold range + 'From' starting price | Conflicts with EST-04 ('equal visual weight') | |

**User's choice:** $500 – $650, rounded to nearest $10
**Notes:** D-10. Pure function at `src/lib/pricing/estimate.ts`; unit tests cover every boundary (EST-05/06).

---

### Q: User entered 25 guests. Step 3 shows the three package cards. How does it behave?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-select Medium, show all 3, allow override (Recommended) | 'Recommended for N guests' badge; mismatched picks show soft inline note but don't block | ✓ |
| Show only the matching tier | Removes tier-shopping, can confuse on misclicks | |
| Show all 3, no pre-selection | No guidance, slower decision | |

**User's choice:** Auto-select matching tier with override
**Notes:** D-11.

---

### Q: User enters 8 guests (below Small's 10 floor) or 120 guests (above Large's 75 ceiling). What does the wizard do?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline warning on Step 2, custom-quote on Step 3, still reach Step 4 (Recommended) | Converts edge-case users to real leads with a custom-quote path | ✓ |
| Block at Step 2 with phone CTA | Forces second action; loses leads | |
| Let them continue on nearest tier with caveat | Sets wrong price expectation | |

**User's choice:** Inline warning + custom-quote path
**Notes:** D-12. Step 3 replaces 3 cards with a single "Custom quote" card; estimate bar shows "Custom quote — Larrae will follow up".

---

### Q: Where does the live estimate live in the wizard, and when does it first appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky bar at the bottom of the modal, appears after guest count is entered (Recommended) | Always visible once calculable; debounced updates; persists to email + confirmation | ✓ |
| Inline within Step 2 and Step 3 only | Loses anchoring during Step 4 | |
| Only on Step 3 (package step) | Misses the live-estimate differentiator on Step 2 | |

**User's choice:** Sticky bar at bottom, appears after guest count entered
**Notes:** D-13. Final range shown at submit-time is captured on the lead record and echoed in both emails.

---

## Area 4: Submission Experience

### Q: Beyond name, email, and phone (all required), what else does Step 4 collect? (multiSelect)

| Option | Description | Selected |
|--------|-------------|----------|
| Event address / delivery location (Recommended) | ZIP pre-fills city; saves a round-trip | ✓ |
| Anything special? (free-text notes) (Recommended) | Dietary, venue, specials; high signal, low friction | ✓ |
| How did you hear about us? | Marketing data; not essential | ✓ |
| Preferred contact method | Respects inquirer's channel; small extra friction | ✓ |

**User's choice:** All four optional fields
**Notes:** D-14. All optional fields clearly labeled. Free-text fields feed SPAM-04 URL-in-notes heuristic.

---

### Q: After successful submit, the wizard shows a confirmation screen. What's on it?

| Option | Description | Selected |
|--------|-------------|----------|
| Recap + submission ID + next steps (Recommended) | Warm heading, event summary, prominent ID, response-time expectation, Back-to-site button | ✓ |
| Minimal 'Thanks — we'll be in touch' | Short acknowledgment; misses brand moment | |
| Auto-close back to site in 5s | Submission ID flashes away; breaks trust | |

**User's choice:** Recap + submission ID + next steps
**Notes:** D-15. No redirect (WIZ-12).

---

### Q: The notification email Larrae receives — what's the structure?

| Option | Description | Selected |
|--------|-------------|----------|
| Action-first: subject + summary + full detail (Recommended) | Phone tel:-link above the fold; full detail below; optimized for phone reading | ✓ |
| Structured table of all fields | Complete but Larrae has to scan to find phone | |
| Plain-text minimal | Fast but loses tap-to-call + brand | |

**User's choice:** Action-first
**Notes:** D-16. React Email template `LeadNotification`. Subject format: `"New quote: [Name] · [Event type] · [Guest count] guests · [Date]"`.

---

### Q: The confirmation email the inquirer receives — what's the tone and content?

| Option | Description | Selected |
|--------|-------------|----------|
| Warm, heritage-voiced recap + expectations (Recommended) | Short warm opener, event recap, 24h expectation, mailto reply CTA | ✓ |
| Short transactional 'got it' note | Works but off-brand for a soul-food caterer | |
| No confirmation email (on-site only) | Conflicts with LEAD-09 | |

**User's choice:** Warm, heritage-voiced recap + expectations
**Notes:** D-17. React Email template `LeadConfirmation`. Mirrors on-site confirmation screen so brand moment is consistent across surfaces.

---

### Q: User hits submit but Turnstile fails, OR hits rate limit, OR server errors. What does the user see?

| Option | Description | Selected |
|--------|-------------|----------|
| Specific cause + email fallback (Recommended) | Red alert above submit, cause-specific copy, mailto link; sessionStorage retains form; bot-tripped returns generic success (no tell) | ✓ |
| Generic 'something went wrong' for all failures | Frustrates legitimate users | |
| Silent retry with spinner | Masks rate limit; burns Turnstile tokens | |

**User's choice:** Specific cause + email fallback
**Notes:** D-18. SPAM-01..04 bot-rejection paths return a decoy 200 success with a non-persisted submission-ID pattern to keep bot feedback loops uninformative.

---

### Q: The submission ID shown on the confirmation screen and in both emails — what format?

| Option | Description | Selected |
|--------|-------------|----------|
| Short human-readable: LK-4Q7P3B (Recommended) | 6-char ULID-derived, 'LK-' prefix; readable on a phone call; full ULID stored in Sheets separately | ✓ |
| Full ULID: 01HX7M9K2Y8NQ5T3W... | Max uniqueness; unreadable | |
| Incrementing number: #000042 | Reveals volume; fragile sheet-row dependency | |

**User's choice:** Short human-readable: LK-XXXXXX
**Notes:** D-19. Full ULID stored separately in Google Sheets for time-sortability.

---

## Claude's Discretion

Documented in CONTEXT.md `<decisions>` under "Claude's Discretion". Includes: visual styling of tiles/chips/cards/sticky bar, animation timings, focus management order, Google Sheets column names, exact micro-copy, shadcn Form vs. hand-wired RHF, bundle-split strategy, cron schedule specifics, debounce timings, client-vs-server analytics event emission.

## Deferred Ideas

Documented in CONTEXT.md `<deferred>` section. Includes: abandoned-cart email (v2), save-and-resume link (v2), real-time availability calendar (v2), admin UI (v2), Event-Type-specific tier recommendations (rejected in discussion to avoid dual recommendation systems), Event-Type-specific blackouts (rejected — schema change), custom react-day-picker (revisit after Phase 4 CWV baseline), share-link for partial wizard (sessionStorage sufficient for v1).
