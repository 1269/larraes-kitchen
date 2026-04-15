# Feature Research — Larrae's Kitchen

**Domain:** Local soul food catering marketing site (single-page scroll, inquiry-driven conversion)
**Researched:** 2026-04-15
**Confidence:** HIGH for industry norms and conversion patterns (multi-source agreement); MEDIUM for soul-food-specific benchmarks (limited category-specific competitors with modern sites); HIGH for MVP scope (strongly constrained by PROJECT.md).

---

## How This Maps to Personas and Core Conversion

Every feature below is rated on whether it moves one of three personas toward the inquiry wizard submit:

- **Cynthia** (residential, 10–20 guests) — wants trust, cultural authenticity, clear pricing, fast reply
- **Ethan** (social host, 20–30 guests) — wants story, distinctiveness, conversation-worthy food, reliability
- **Emma** (corporate, 50–75 guests) — wants professionalism, documentation, reliability, reviewable proposal

**Core conversion:** Inquiry wizard submit (event type → guests/date → package → contact) with live price estimate.

---

## Feature Landscape

### Hero / Top-of-Funnel

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Above-the-fold hero image of real food | Stock photography kills catering trust; "show real food from real events" is the dominant 2026 norm | LOW | All three; Cynthia and Ethan decide within seconds whether this looks authentic |
| Single primary CTA ("Get a Quote" / "Start My Quote") anchored to the wizard | Multiple CTAs cut conversion substantially; decision fatigue documented | LOW | Drives the core conversion directly |
| One-line value prop: "Authentic Soul Food Catering in Benicia" (or similar) | Users orient in <2 seconds; positioning must be instantly legible | LOW | Confirms Cynthia/Ethan are in the right place |
| Sticky top nav with "Get a Quote" always reachable | One-scroll SPA needs persistent re-entry to the CTA | LOW | Prevents losing the conversion after scroll exploration |
| Mobile hero <70vh with thumb-accessible CTA | >60% of local-service traffic is mobile; CTA must sit in thumb zone | LOW | Especially Cynthia, who arrives from Instagram/Facebook on mobile |
| LCP <2.5s on hero image | Core Web Vitals gates Google ranking and perceived quality | MEDIUM | Depends on stack choice; Next.js Image + modern formats required |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Subtle cinematic hero (cast-iron skillet, hands in frame, family-style abundance) | Sweetgreen editorial discipline + soul-food warmth — signals "this is not Applebee's catering" | LOW (art direction cost, not engineering) | Ethan especially; differentiates from generic catering competitors |
| Starting-from price chip in hero ("From $15/person") | Sets expectation, cuts tire-kickers, improves inquiry quality; multi-source evidence that transparent pricing lifts submission rates | LOW | Emma (budget pre-qualification), Cynthia (no hidden-fee fear) |
| Secondary tertiary link "See the menu" or "View packages" (understated, not button) | Sweetgreen-style "Order now →" affordance — keeps primary CTA dominant while offering the curious a path | LOW | Ethan, who wants to see distinctiveness before committing to a form |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Hero carousel / slider of multiple dishes | "We have so much to show" | Carousels have well-documented near-zero engagement past slide 1; compound LCP cost; add motion complexity | One hero image, carefully shot. Additional imagery lives in Gallery |
| Autoplay video hero | "Cinematic feel" | Page weight, mobile data cost, motion-sensitivity accessibility concern, content production cost. PROJECT.md explicitly defers video | Still photography with strong art direction |
| Two co-equal CTAs ("Get a Quote" + "Call Now") | "Give users options" | Documented conversion penalty (some studies report severe drops); dilutes the wizard funnel | Primary = wizard CTA. Phone number lives in nav/contact section, not hero |

---

### About / Brand Story

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Chef / owner portrait (real person, not generic kitchen shot) | Trust signal for local-service businesses; small-caterer sites are expected to feel personal | LOW | Cynthia's "support local Black-owned businesses" goal; Ethan's "story behind the food" |
| Heritage-rooted origin paragraph (2–3 short paragraphs, editorial rhythm) | Sweetgreen/CAVA demonstrate the "grew up among this food" narrative as the ecosystem norm | LOW | Ethan primarily; this is where he decides Larrae is worth booking over a generic option |
| "Benicia's only soul food specialist" positioning statement | Validated positioning from preserved discovery; category ownership claim is the strongest local moat | LOW | All three; shortcut to differentiation |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Pull-quote callout in serif italic (Playfair Display) with a single heritage line | Visual punctuation in the editorial scroll rhythm; "family recipes passed down" ethos without long-form copy | LOW | Ethan; turns About from a paragraph block into a designed moment |
| Secondary photograph: chef or hands working (action, not posed) | Implies craft; pairs with the heritage story without demanding video production | LOW | All three; reinforces authenticity |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Long-form chef biography (500+ words) | "Tell the full story" | Scroll depth kills it; users skim in single-page layouts; burying the menu/packages | 150–250 words in About, with an optional "Read more" reveal if needed later. V1 should resist even that |
| Embedded autoplay "about us" video | "Video converts" | Production cost not justified; page weight; PROJECT.md defers video explicitly | Photography + typography carries the story in v1 |
| Mission/values bullet list (generic corporate language) | "Looks professional" | Reads as boilerplate; contradicts cultural-authenticity positioning | Values expressed implicitly through the heritage narrative and food photography |

---

### Menu Presentation

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Categorized menu (Proteins / Sides / Desserts) | Documented expectation; users scan by category | LOW | All three |
| Category tabs or anchor-nav pill chips (sticky on mobile scroll) | Single-page scroll requires in-section navigation to avoid "where did the sides go" disorientation | MEDIUM | Cynthia on mobile especially |
| Dish name + 1-line description + prep method / heritage note | Authenticity signal; "slow-cooked" / "smothered" language is part of the product | LOW | Ethan (distinctiveness); Cynthia (authenticity) |
| Dietary indicators (vegetarian, gluten-free where accurate) as icons or pill tags | 2026 norm; inclusivity is now expectation not differentiator | LOW | Emma (accommodating mixed corporate teams); Cynthia (family with restrictions) |
| Dish photography per item (or per category if full per-dish is cost-prohibitive v1) | Text-only menus feel dated for food businesses in 2026 | MEDIUM (photography cost) | All three |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Serif italic dish names (Playfair/Lovelace) with sans-serif descriptions | Editorial discipline from Sweetgreen reference; signals craft | LOW | Ethan; visual personality competitors lack |
| "Protein + 2 sides" pairing suggestions within menu | Helps non-planners (Cynthia) visualize what a meal looks like without opening packages section | LOW | Cynthia specifically |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| À la carte per-item pricing on the menu | "Transparency" | Confuses catering economics (priced per person, package-based); invites negotiation over line items; creates maintenance burden for Larrae | Package pricing in the Packages section. Menu shows what's available; packages tell you what it costs |
| PDF menu download | "Print-friendly" | Abandons the user to a PDF experience; breaks analytics; creates version drift between live menu and PDF | Menu is the live content. If needed, "Email me this menu" as a v2 lead capture |
| Full allergen matrix (sesame, mustard, sulfites, etc.) per dish | "2026 allergen compliance" | Real soul food catering conversations about allergens happen human-to-human; a matrix creates legal exposure if wrong and maintenance cost if stale | Dietary indicators for the common cases (vegetarian, can-be-GF) + FAQ answer: "We accommodate allergies — please mention on the inquiry form" |
| Search-within-menu | "Users want to find things fast" | Menu is ~15 items across 3 categories on a single-page site; search is solving a problem that doesn't exist | Category anchor chips are enough |
| Full live inventory / "available today" status | "Show what's available right now" | Catering is by-event, not by-day; creates operational load to maintain | Static menu; customization handled in inquiry follow-up |

---

### Catering Packages (Three Tiers)

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Three tier cards (Small 10–20 / Medium 21–30 / Large 50–75) | Preserved discovery; "Good-Better-Best" is the 80%+ industry pattern | LOW | All three self-select by tier |
| Per-person price range visible ($18–22 / $16–20 / $15–18) | Transparent pricing is a 2026 conversion driver; hiding it raises abandonment and attracts tire-kickers | LOW | Emma (budget fit); Cynthia (no-surprise trust) |
| What's included checklist per tier (icons or checkmarks) | Standard pattern; users must scan differences in <10 seconds | LOW | All three |
| Guest-count range labels prominent on each card | Primary self-selection criterion; users match their event to a tier | LOW | All three |
| Minimum order note where applicable | Prevents inquiry spam from sub-minimum events; sets expectations | LOW | Cynthia (guards against rejection surprise) |
| CTA on each card that deep-links into wizard with that package pre-selected | Reduces wizard friction by one step for users who already chose | MEDIUM | All three; material conversion lift |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| "Most Popular" highlight on the Medium tier | Documented 60–70% of clients pick middle when middle is recommended; anchors decision | LOW | Cynthia/Ethan especially; reduces decision fatigue |
| Subtle tier visual differentiation (ribbon or badge, NOT color-bombed card) | Sweetgreen editorial restraint vs. Groupon-style "BEST VALUE!!" energy | LOW | Ethan; respects the brand tone |
| Inline add-on hint ("Add desserts from $4/person") | Sets up the wizard's optional-extras step; prepares Cynthia for add-on questions | LOW | Cynthia (planning ahead); no commitment at this stage |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Exact fixed price per tier ("$20/person flat") | "Simpler" | Catering genuinely varies by menu mix and service level; false precision sets up the wrong conversation | Range pricing with live estimate in wizard that narrows based on inputs |
| "Compare plans" feature toggle | "SaaS pricing page pattern" | Three tiers on a single-page site are already side-by-side; a toggle adds interaction for no gain | Three cards in a row on desktop, stacked on mobile |
| "Request custom package" as a fourth card | "Flexibility signal" | Splits the CTA; Larrae can handle custom in the inquiry follow-up | FAQ entry: "Need something outside these tiers? Mention it in your inquiry" |

---

### Gallery

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Masonry or editorial grid of event photography | Documented industry norm; pure flat grid feels generic for food | MEDIUM | Ethan especially (visualizing the vibe) |
| Lightbox for full-size viewing with keyboard navigation | Standard UX; accessibility requirement (ESC to close, arrow keys) | MEDIUM | All three |
| 15–25 curated images for v1 launch | Enough to feel lived-in; fewer feels sparse, more is diminishing returns | LOW | All three |
| Lazy loading + responsive image sizing | Performance non-negotiable on photography-heavy page | LOW-MEDIUM | Depends on stack (Next.js Image handles this) |
| Alt text on every image describing the dish or event | WCAG 2.1 AA; alt is the accessibility path for photography (contrast rules don't apply to photos, but descriptive alt does) | LOW | Screen reader users across all personas |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Event-type segmentation chips (Family / Social / Corporate) | Lets each persona see themselves in the gallery; "show me corporate setups" is Emma's first instinct | MEDIUM | All three; especially Emma |
| Caption overlay with event type and package used (visible on hover desktop, always visible mobile) | Social proof that's specific and credible, not generic | LOW | Emma (professional context); Cynthia (family context) |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Video reels embedded in gallery | "Instagram-style dynamic content" | Page weight spikes, autoplay accessibility issues, production cost; PROJECT.md defers video | Still photography only in v1; Instagram embed elsewhere can cover motion |
| "Upload your event photo" user-generated feature | "Community building" | Moderation load, quality inconsistency, legal/consent questions | Curated gallery only; sourced with client permission via follow-up after events |
| Full infinite scroll with hundreds of images | "More is better" | Diminishing returns past ~25 images; hurts performance; buries the rest of the page (Testimonials, FAQ, Contact) | Curated 15–25 images; add more in v2 if content warrants |

---

### Testimonials

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| 3–6 testimonials visible (one per persona segment represented) | Users need to see someone "like them" endorsing the service | LOW | All three; each persona looks for their own archetype |
| Client name + event type + quote | "Sarah M. — Family Birthday — 18 guests"; specificity beats anonymous blobs | LOW | All three |
| Quote-mark typographic treatment, serif pull-quote | Design credibility; editorial rhythm | LOW | Ethan |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Static grid layout (not auto-rotating carousel) | Carousels reduce engagement; users want to scan all testimonials at once | LOW | All three |
| Star-rating visual for each testimonial | Quick credibility scan; pattern-matches Google/Yelp expectations | LOW | Emma (scanning for professionalism); Cynthia (scanning for trust) |
| Optional client anonymization control per testimonial (last initial for residential, full name + company for corporate) | Residential clients often prefer privacy; corporate clients want the logo | LOW | Cynthia (privacy); Emma (attribution) |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-rotating testimonial carousel | "Save screen space" | Reduced engagement documented; accessibility issues (motion, focus management); content passes before users finish reading | Static grid; swipeable on mobile if count exceeds 3 |
| Live Google Reviews API embed | "Fresh social proof" | API key management, rate limits, review content you don't control appearing (including bad ones or spam), extra runtime dependency | Hand-curated testimonials from Google/Yelp pulled as markdown content; link out to Google profile separately |
| Video testimonials | "Higher trust" | Production cost, hosting, accessibility (captions), page weight | Written quotes with name + event; add a link to a Google review as social proof instead |
| Aggregate rating widget ("4.9/5 from 47 reviews") | "Credibility at a glance" | If pulled live from Google, brittle; if hardcoded, becomes stale | Defer; a few named testimonials + "Read our Google reviews" link does the job |

---

### FAQ

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Accordion-style expand/collapse (one section open at a time is standard) | FAQ is the canonical accordion use case; users come for 1–2 answers | LOW | All three |
| Grouped by category (Ordering / Delivery / Menu Customization / Payment) | Preserved IA from UX strategy brief; standard catering FAQ structure | LOW | All three |
| FAQPage schema.org JSON-LD | Triggers FAQ rich results in search; improves local SEO footprint | LOW | SEO surface; indirectly helps Emma's Google-driven discovery |
| Keyboard-accessible accordion (Enter/Space to toggle, ARIA states) | WCAG 2.1 AA requirement | LOW | Assistive-tech users |

#### High-Value FAQ Categories (Converting)

Based on industry analysis of catering FAQ conversion:

- **Lead time / advance booking window** ("How far in advance do I need to book?") — directly affects whether the inquiry is even worth submitting
- **Service area / delivery radius** ("Do you serve Vallejo / Martinez / Fairfield?") — filters out-of-area leads before wizard
- **Menu customization and allergens** ("Can you accommodate vegetarian / gluten-free?") — removes a blocker especially for Emma's mixed corporate teams
- **Deposit and payment terms** ("How does payment work?") — critical for Emma's expense-reporting constraints
- **Minimum order / minimum guest count** — prevents sub-minimum inquiries
- **What's included vs. add-on** (staff, setup, tableware) — clarifies package scope

#### Lower-Value Categories (Fill Space, Don't Skip Entirely)

- Cancellation policy (important but not conversion-critical)
- Dietary details beyond "we accommodate" (handled per-inquiry)

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| FAQ search bar | "Users want to find answers fast" | 10–15 Q&As on a single-page site; search is overkill | Category headers + accordion; cmd-F works for power users |
| All accordions open by default | "Show everything" | Wall-of-text effect; defeats the purpose of progressive disclosure | Closed by default; open on click |
| Chatbot "Ask our FAQ" widget | "Modern AI support" | Response quality risk without training; operational load if it routes to Larrae; adds third-party dependency | Static FAQ + inquiry form is the channel |

---

### Inquiry Wizard (The Core Conversion)

This is the feature the entire site is designed around. Treat it with proportional care.

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Multi-step flow (4 steps: Event Type → Guests & Date → Package → Contact) | Preserved decision; multi-step outperforms single long form for complex inputs | HIGH | All three; this IS the conversion |
| Progress indicator ("Step 2 of 4") or progress bar | Without it, every step "might be followed by five more" — documented abandonment driver | LOW | All three; high impact |
| Back / forward navigation preserving entered data | Users WILL want to change an answer; losing it = abandonment | MEDIUM | All three |
| Live price estimate updating as user fills (guests × selected package's per-person range) | Preserved decision; tentpole differentiator; "From $432 – $528" format shows range not false precision | MEDIUM | Emma (budget fit); Cynthia (transparency) |
| Required-field validation at step boundaries (not end-of-form) | Catching errors early reduces abandonment at submit; users hate "your form has 3 errors" at the end | MEDIUM | All three |
| Mobile-optimized inputs (native date picker, numeric keypad for guest count, large tap targets) | 60%+ traffic is mobile; bad mobile form UX is the #1 abandonment cause cited | MEDIUM | Cynthia primarily (arriving from Instagram on iPhone) |
| Service-area / ZIP-code check (either inline or as a soft gate) | Prevents out-of-area leads from filling the whole form then bouncing | MEDIUM | All three; protects Larrae's inbox |
| Clear confirmation state post-submit (not just a redirect to "/") | Users need to know their inquiry went through; uncertainty = repeat submits | LOW | All three |
| Form spam protection (honeypot + optional hCaptcha/Turnstile) | Required for any public form in 2026; unprotected forms get abused in days | LOW | Operational integrity |
| Email delivery to Larrae + stored record (per PROJECT.md) | Core requirement; lead must reach Larrae immediately + persist for follow-up tracking | MEDIUM | Operational |

#### Field Sequencing Recommendation (Reduces Abandonment)

Order from lowest-commitment to highest-commitment. Contact info is LAST, not first.

1. **Event Type** (Family / Social / Corporate — 3 large tappable cards, maps to persona)
2. **Guest Count + Event Date** (numeric input + date picker)
3. **Package** (tier selection — pre-selects if user came from a Packages CTA)
4. **Contact Details** (Name + Email + Phone + optional Message)

Rationale: By step 4, the user has invested time seeing the live estimate respond to their inputs — sunk-cost psychology increases contact-step completion. Asking email first (common mistake) makes the form feel like a lead trap from step 1.

#### Live Price Estimate UX

| Aspect | Recommendation | Notes |
|--------|----------------|-------|
| Placement | Persistent card/bar visible alongside the form steps (sticky on desktop, collapsed bar on mobile) | Users must see it change in response to their inputs — that's the whole feature |
| Format | Range, not point estimate ("Estimated $432 – $528") | Matches per-person price range; avoids false precision that could anchor a negotiation |
| Update trigger | On input blur or every input change (debounced ~300ms) | Avoids jitter; animated number transition is acceptable but not required |
| Edge cases | Below-minimum guest count → "Minimum 10 guests — adjust to see estimate"; Out-of-area ZIP → "We don't currently serve [ZIP] — we serve Benicia and [list]" | Never show "$0" or broken states |
| Disclaimer | Micro-copy: "Estimate only — final pricing confirmed by Larrae" | Legal/expectation protection; standard in tiered-quote UX |

#### Date Picker UX

| Aspect | Recommendation | Notes |
|--------|----------------|-------|
| Lead-time enforcement | Disable dates within the minimum lead window (e.g., 14 days out) with a tooltip explaining why | Prevents inquiries Larrae can't fulfill |
| Weekend vs. weekday signaling | Visual chip ("Saturday — popular date") rather than blocking — inform, don't block | Matches catering norms; weekends are higher-demand but still bookable |
| Blackout dates | Content-editable list in markdown (holidays, Larrae's time off) — disable with "Not available" tooltip | Keeps Larrae in control without a calendar backend |
| No live availability backend | Explicitly NOT a real-time calendar — see anti-features | Manual blackout list is enough for v1 |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Smart step-skipping based on answers (e.g., if guest count outside all tiers, jump to "let's talk — custom inquiry" variant) | Keeps edge cases in the funnel instead of abandoning | HIGH | Saves Emma's 75+ outlier inquiries |
| Optional fields marked clearly (Phone optional if Email provided; "Special requests" optional) | Required-field fatigue is a top abandonment cause | LOW | All three |
| Save-and-resume via email link (v1.x not v1) | Users who abandon step 3 get a "finish your quote" email 24h later | HIGH | Defer to post-launch |

#### Anti-Features (Critical)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Single long form with all fields visible | "Simpler to implement" | Wall-of-fields effect; documented higher abandonment than stepped; no opportunity to show the live estimate responding | Stick with the stepped wizard — it's the architectural decision the project is built around |
| Asking for email/phone in step 1 | "Capture the lead early even if they abandon" | Users perceive this as a trap; elevated abandonment in step 1 itself; damages the brand tone | Contact details in step 4, after the user has seen their estimate |
| Real-time availability calendar backed by Larrae's actual calendar | "Instant booking" | Requires backend scheduling integration Larrae doesn't have; operational risk if it ever shows "available" when she's not; over-promises for a marketing site | Static blackout dates in markdown; Larrae confirms in her follow-up email |
| Integrated deposit/payment in the wizard | "Close the deal on-site" | PROJECT.md explicit out-of-scope; payment happens off-site via Larrae's existing process; adds Stripe/merchant overhead not justified in v1 | Inquiry → Larrae's quote email → her existing payment process |
| Abandoned-cart recovery email in v1 | "Recover the 70% who drop off" | Requires partial-save backend, email automation infrastructure, and consent handling that multiplies v1 scope | Defer to v1.x once baseline conversion is measurable |
| Conversational chatbot form ("Tell me about your event!") | "Modern / friendly" | Increased session time, unclear structure for user, harder to validate, harder for Larrae to triage the leads | Stepped wizard with clear structure |
| More than 4 steps | "Capture more data" | Each added step multiplies abandonment probability | 4 steps max; defer nice-to-know fields to follow-up conversation |

---

### Contact / Service Area

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| Phone number displayed (tel: link on mobile) | Local-service businesses are expected to have a reachable phone; Emma especially will prefer it | LOW | Emma; also Cynthia as a fallback |
| Email displayed (mailto: link) | Standard | LOW | All three |
| Service area listed in text ("Benicia and surrounding areas: Vallejo, Martinez, Fairfield, American Canyon") | Clearest way to communicate reach; doesn't depend on a map | LOW | All three |
| Business hours or "inquiry response time" expectation ("We respond within 24 hours") | Sets the correct expectation; reduces "did they get it?" follow-ups | LOW | Emma (process-oriented) |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Static service-area map (shaded region, not interactive Google Maps embed) | Visual reinforcement without Google Maps JS weight + cookie consent overhead; image rendered from a static source | LOW-MEDIUM | All three; especially out-of-Benicia prospects |
| "Not sure if you're in range? Just ask" micro-copy | Removes the "probably not worth trying" friction for borderline locations | LOW | Cynthia (in neighboring towns) |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full interactive Google Maps embed | "Professional" | Adds tracking, cookie consent obligation (EU visitors), JS weight, layout shift risk, API key management | Static image of service area with Benicia marked; Google Maps link for those who want directions |
| WhatsApp chat widget | "Modern communication" | Operational load on Larrae if she's not staffed to respond quickly; expectation mismatch; extra third-party dependency | Phone + email + inquiry form are the three documented channels |
| Live chat widget (Intercom, Drift, etc.) | "Instant support" | PROJECT.md explicit out-of-scope; adds monthly SaaS cost; empty when Larrae isn't online looks worse than no chat | Inquiry form + 24h response promise |
| SMS-only contact option | "Younger audience prefers SMS" | Larrae has to pick a channel she'll actually check; adds SMS infrastructure | Phone number works for SMS on mobile; no separate SMS widget needed |

---

### Social Proof Beyond Testimonials

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|-------------------|------------|-----------------|
| Link to Google Business Profile reviews | Standard for local service; where users actually verify | LOW | All three |

#### Differentiators

| Feature | Value Proposition | Complexity | Persona / Notes |
|---------|-------------------------|------------|-----------------|
| Instagram feed embed (curated, in or near gallery) | Documented conversion lift for food brands; keeps site feeling "alive" between formal updates; supports Cynthia/Ethan who arrived from Instagram | MEDIUM | Cynthia/Ethan; less for Emma |
| Press mention / logo strip (if any coverage exists — local press, magazines) | Strong trust anchor for Emma especially | LOW | Emma; only if Larrae actually has press — do not fake |
| "Featured at [venue]" partnership mentions (if true) | Preferred-vendor signal for corporate audience | LOW | Emma; only if real |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Fake-looking "As Featured In" logo bar with no real press | "Aspirational credibility" | Users can tell; hurts trust more than it helps | Omit until real coverage exists. Launch without, add in v1.x when genuine |
| Instagram feed in v1 if Instagram account is thin or inactive | "Social proof" | An empty-looking embed is worse than no embed | Defer until Instagram has 20+ quality posts; can be added post-launch trivially |

---

### SEO & Local Discovery

#### Table Stakes

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| LocalBusiness / Restaurant schema (JSON-LD) in head | Local SEO foundation; Google uses it for rich results and Knowledge Panel | LOW | Affects Emma's Google-driven discovery most |
| FAQPage schema on FAQ section | Can trigger FAQ rich results; increases SERP footprint | LOW | All three; ambient SEO benefit |
| Name/Address/Phone matching Google Business Profile exactly | Conflicting signals hurt local ranking — documented mistake | LOW | Operational discipline |
| Page title, meta description, og:image for social shares | Standard; links shared in Facebook/Instagram DMs render correctly | LOW | Cynthia/Ethan (word-of-mouth sharing) |
| Semantic HTML + proper heading hierarchy (H1 → H2 → H3) | SEO and accessibility both | LOW | Ambient |
| Image alt text throughout | SEO + accessibility | LOW | Ambient |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Location-specific landing pages ("Soul food catering in Vallejo", "Soul food catering in Martinez") | "Capture nearby search traffic" | Single-page scroll architecture conflicts; quality page content per location requires real differentiation or Google flags as doorway pages | Deferred to v2 per PROJECT.md; mention nearby cities in the service-area copy for v1 |
| Blog / content marketing section | "SEO via content" | PROJECT.md explicit out-of-scope for v1 | Markdown schema allows room; add in v2 |

---

### Accessibility (Beyond Baseline)

#### Table Stakes (WCAG 2.1 AA Required)

| Feature | Why Expected | Complexity | Persona / Notes |
|---------|--------------|------------|-----------------|
| 4.5:1 contrast for normal text, 3:1 for large text | WCAG 2.1 AA requirement | LOW | All users including those with low vision |
| Scrim/overlay behind text on food photography to maintain contrast | Food photography is visually busy; text over images needs consistent background | LOW | All users |
| Keyboard navigation across nav, accordion, gallery, lightbox, wizard | Core WCAG requirement | MEDIUM | Keyboard-only and screen-reader users |
| Focus indicators visible and styled (not browser default) | Design consistency + WCAG 2.4.7 | LOW | Ambient |
| Alt text on all content images; empty alt on decorative images | WCAG 1.1.1 | LOW | Screen-reader users |
| Form labels properly associated (not placeholder-as-label) | WCAG 3.3.2 | LOW | All users |
| `prefers-reduced-motion` respected (lightbox transitions, scroll animations, estimate animation) | WCAG 2.3.3; also just respectful | LOW | Vestibular-sensitive users |
| Skip-to-content link | WCAG 2.4.1 | LOW | Keyboard users |
| ARIA where semantic HTML isn't enough (accordion states, wizard progress) | Standard pattern | LOW-MEDIUM | Assistive-tech users |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Accessibility overlay widget (AccessiBe, UserWay, etc.) | "Instant WCAG compliance" | Documented: cannot deliver WCAG 2.1 AA compliance; addresses ~30% of barriers and often breaks assistive tech; creates legal liability, not reduces it | Build accessibility into the source; audit with axe-core/Lighthouse; real manual testing |

---

## Feature Dependencies

```
Live Price Estimate
    └── requires ── Packages Content (per-person price ranges)
                        └── requires ── Markdown content schema finalized

Inquiry Wizard
    ├── requires ── Packages Content (for package-selection step)
    ├── requires ── Service Area Definition (for ZIP gate)
    ├── requires ── Lead-time / Blackout Dates (for date picker)
    └── requires ── Email + Storage Backend (lead delivery per PROJECT.md)

Packages CTA Deep-Link → Wizard
    └── requires ── Wizard supports pre-selection via URL param or state

FAQ Schema
    └── requires ── FAQ Content in structured markdown (question + answer pairs)

LocalBusiness Schema
    └── requires ── Finalized NAP (Name/Address/Phone) aligned with Google Business Profile

Gallery Event-Type Filter
    └── requires ── Each image tagged with event type in content frontmatter

"Most Popular" Package Badge
    └── enhances ── Three-Tier Packages (decision anchoring)

Mobile Hero CTA Performance
    └── requires ── LCP <2.5s (image optimization, modern formats)

Instagram Embed
    └── conflicts-in-v1 ── Thin Instagram account (defer until content density exists)

Real-Time Availability Calendar
    └── conflicts ── PROJECT.md no-backend posture (defer indefinitely)

Abandoned-Cart Recovery
    └── conflicts-in-v1 ── Partial-data storage + email automation scope (defer to v1.x)
```

### Dependency Notes

- **Live estimate requires packages content:** The estimate multiplies guests × selected package's per-person range. Content must be authored before the wizard can math.
- **Wizard requires service-area definition:** ZIP-gate or explicit city list must be decided content before wizard can enforce it.
- **Wizard requires lead-time rules:** Date picker needs a "minimum days out" config and a blackout-date list before it can disable correct dates.
- **Packages deep-links enhance wizard conversion:** If packages-section CTA pre-selects in wizard, Step 3 becomes a confirmation rather than a decision — measurable lift.
- **Gallery filter depends on tagging:** Event-type chips require every gallery image to be tagged. This is a content-authoring cost, not engineering.
- **Accessibility is foundational, not additive:** Retrofitting accessibility post-launch is 3–5x the cost of building it in from the start — relevant to phase ordering.

---

## MVP Definition

### Launch With (v1) — Must Ship for First Real Booking

#### Structural
- [ ] Single-page scroll site with Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact in that order
- [ ] Sticky top nav with persistent "Get a Quote" CTA
- [ ] Mobile-first responsive with LCP <2.5s
- [ ] WCAG 2.1 AA compliant (keyboard nav, contrast, reduced motion, alt text, semantic HTML)

#### Content Sections
- [ ] Hero: single cinematic food image + value prop + primary CTA + starting-from price chip
- [ ] About: chef heritage story (150–250 words), portrait, "Benicia's only soul food specialist" positioning
- [ ] Menu: Proteins / Sides / Desserts with dish names, 1-line descriptions, dietary indicators, per-dish or per-category photography
- [ ] Packages: Three cards (Small / Medium / Large) with per-person ranges, inclusions, "Most Popular" on Medium, deep-link CTA into wizard
- [ ] Gallery: 15–25 curated images, masonry layout, lightbox with keyboard nav, alt text on each
- [ ] Testimonials: 3–6 static testimonials, one per persona segment, name + event type + quote + stars
- [ ] FAQ: Accordion grouped by Ordering / Delivery / Menu Customization / Payment with FAQPage schema
- [ ] Contact: Phone, email, service-area text, response-time expectation, static service-area map image

#### Inquiry Wizard
- [ ] 4-step flow: Event Type → Guests & Date → Package → Contact
- [ ] Progress indicator
- [ ] Live price estimate (range format) that updates with inputs
- [ ] Date picker with lead-time enforcement and blackout dates (markdown-configurable)
- [ ] Service-area ZIP check (inline, with fallback "not sure? just ask" message)
- [ ] Validation at step boundaries, back/forward navigation with state preservation
- [ ] Mobile-optimized inputs
- [ ] Confirmation state post-submit
- [ ] Email delivery to Larrae + stored lead record
- [ ] Spam protection (honeypot + Turnstile or equivalent)

#### SEO / Infra
- [ ] LocalBusiness / Restaurant JSON-LD schema
- [ ] FAQPage schema on FAQ
- [ ] og:image, meta description, page title
- [ ] NAP aligned with Google Business Profile
- [ ] Analytics wired up

### Add After Validation (v1.x)

- [ ] Abandoned-cart recovery email for wizard drop-offs (after baseline conversion is measured)
- [ ] Instagram feed embed (once Instagram account has 20+ quality posts)
- [ ] Press/partnership logo strip (when real coverage exists)
- [ ] Smart step-skipping for out-of-tier guest counts → custom inquiry variant
- [ ] Save-and-resume via email link
- [ ] Gallery event-type filter chips (once gallery exceeds 25 images)
- [ ] Aggregate review rating widget (once review count justifies it)

### Future Consideration (v2+)

- [ ] Blog / content marketing (markdown schema leaves room)
- [ ] Location-specific landing pages (Vallejo, Martinez, etc.) — triggers multi-page architecture debate
- [ ] Video content (hero reel or chef story)
- [ ] Customer account portal for repeat clients
- [ ] Online ordering / payment processing
- [ ] Loyalty program

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Inquiry wizard (4 steps, live estimate) | HIGH | HIGH | P1 |
| Hero with single CTA + starting-from price | HIGH | LOW | P1 |
| Three-tier packages with "Most Popular" + deep-link | HIGH | LOW | P1 |
| Menu with categories + dietary indicators | HIGH | MEDIUM (photography) | P1 |
| Gallery (masonry + lightbox, 15–25 images) | HIGH | MEDIUM | P1 |
| About / heritage story | HIGH | LOW | P1 |
| Testimonials (static grid, one per persona) | HIGH | LOW | P1 |
| FAQ accordion + FAQPage schema | MEDIUM | LOW | P1 |
| Contact + service area | MEDIUM | LOW | P1 |
| LocalBusiness / Restaurant schema | MEDIUM | LOW | P1 |
| Accessibility (WCAG 2.1 AA) | HIGH | MEDIUM (if built in) | P1 |
| Spam protection on wizard | HIGH | LOW | P1 |
| Gallery event-type filter | MEDIUM | MEDIUM | P2 |
| Instagram feed embed | MEDIUM | LOW-MEDIUM | P2 |
| Abandoned-cart recovery | MEDIUM | HIGH | P2 |
| Press logo strip | LOW-MEDIUM | LOW | P2 (when real) |
| Smart wizard branching | MEDIUM | HIGH | P2 |
| Save-and-resume email | MEDIUM | HIGH | P2 |
| Blog | LOW (for conversion) | HIGH | P3 |
| Location landing pages | MEDIUM (SEO long-term) | HIGH (architecture) | P3 |
| Video content | LOW (for conversion) | HIGH | P3 |
| Live chat / WhatsApp | LOW (operational negative) | LOW-MEDIUM | P3 (probably never) |
| Customer portal | LOW (until repeat volume) | HIGH | P3 |
| Online payment | LOW (off-site works) | HIGH | P3 |

---

## Competitor / Reference Feature Analysis

| Feature | Typical Soul Food / Local Caterers (Ebony Eyes, California Cookout, Gist, etc.) | Editorial Food Brands (Sweetgreen, CAVA) | Larrae's Approach |
|---------|---------------------|---------------------|-------------------|
| Hero | Food photography + phone number prominent | Single cinematic image + one CTA + editorial type | Single cinematic food image + "Get a Quote" CTA + starting-from price; editorial discipline, soul-food warmth |
| Pricing transparency | Ranges from "call for pricing" to per-person starting price | N/A (different business model) | Per-person ranges visible on package cards + live estimate in wizard (stronger than most local competitors) |
| Menu | Text list or PDF; occasional photography | Rich photography, ingredient storytelling | Text + categorized + dietary indicators + per-item or per-category photography; italic serif dish names |
| Packages | Often described prose-style; some use cards | N/A | Three clear tiered cards with "Most Popular" anchor |
| Inquiry form | Usually single-page long form | Generally no form — different conversion model | Multi-step wizard with live estimate — meaningful differentiation from local competitors |
| Testimonials | Text quotes, sometimes with carousel | Often press quotes rather than customer quotes | Static grid, persona-segmented, named clients with event types |
| About/Story | Short bio on about page (multi-page sites) | Heritage/founding narrative, photography-rich | Editorial heritage paragraph + pull quote + chef portrait — lean into the Sweetgreen rhythm |
| Gallery | Grid or carousel, sometimes event-type filtered | Less emphasis on gallery; brand imagery integrated throughout | Masonry with optional event-type filter (v2 if content grows) |
| Service area | Phone-based; map embed common | N/A | Static map image + text list; no interactive Google Maps in v1 |
| Tech stack norms | WordPress / Squarespace / Wix; heavy, CMS-driven | Next.js / custom stacks, performance-first | Modern React framework with markdown-in-repo — lighter than CMS approach, editable via AI agent |

---

## Cross-Cutting Notes for the Roadmap

### Phase-Implication Flags

- **Content-first phases:** Packages, menu, testimonials, FAQ, blackout dates — all markdown schema. This should come before the wizard phase because the wizard depends on package pricing and service-area content existing.
- **Wizard is a phase of its own:** Live estimate, step validation, lead-time logic, ZIP gate, email delivery, spam protection — non-trivial. Should not be combined with another major phase.
- **Accessibility is not a phase — it's a constraint.** Bake into every phase; do not defer.
- **Image pipeline is load-bearing:** Hero performance, gallery performance, menu photography all depend on it. Establish image optimization early (likely in the foundation phase) so later phases benefit.
- **Analytics + lead storage backend:** Needed by the wizard phase. Decide storage approach (markdown log? database? email-only with a service like Basin or Resend?) before wizard build.

### Research Flags (Likely Need Deeper Investigation Per-Phase)

- **Wizard phase:** Live estimate animation patterns, exact ZIP-validation approach (library vs. static list), email delivery service selection, lead storage schema
- **Image pipeline phase:** Next.js Image vs. alternatives under markdown-in-repo constraint; responsive breakpoints for masonry gallery
- **Schema/SEO phase:** Exact JSON-LD shape for a service-area catering business (Restaurant subtype vs. FoodEstablishment vs. custom); Google Business Profile alignment checklist

---

## Sources

Catering-specific conversion and feature norms:
- [How to Build a Catering Website That Converts — Dinevate](https://www.dinevate.com/pages/how-to-build-a-catering-website-that-converts-inquiries-to-orders/)
- [Catering Website Design Examples — Muffin Group](https://muffingroup.com/blog/catering-website-design/)
- [Tiered Catering Packages Pricing & Structure — PricingLink](https://pricinglink.com/knowledge-base/private-event-catering/tiered-catering-packages-pricing/)
- [Catering Package Pricing Strategy — BusinessDojo](https://dojobusiness.com/blogs/news/catering-pricing-strategy)
- [2026 Catering Trends — Caterease](https://www.caterease.com/2026-catering-trends-innovations/)
- [Dietary Requirements for Events 2026 — Premier Staff](https://premierstaff.com/blog/list-of-dietary-requirements-for-events/)
- [Allergen-Friendly Menus — 360training](https://www.360training.com/blog/allergen-friendly-menus-guide-to-safe-dining)

Form conversion / abandonment:
- [Form Abandonment: How to Prevent It — Fullstory](https://www.fullstory.com/blog/form-abandonment/)
- [Simplify B2B Lead Gen Forms — FunnelEnvy](https://www.funnelenvy.com/blog/simplify-your-b2b-lead-gen-forms-to-reduce-abandonment-rates)
- [The Form Abandonment Problem — Surface Labs](https://withsurface.com/blog/the-form-abandonment-problem-nobody-talks-about)
- [How to Reduce Form Abandonment — FluentForms](https://fluentforms.com/how-to-reduce-form-abandonment/)

Hero / CTA / single-page patterns:
- [Hero Section Design Best Practices 2026 — Perfect Afternoon](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Best CTA Placement Strategies 2026 — LandingPageFlow](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages)
- [Website Hero Best Practices — Prismic](https://prismic.io/blog/website-hero-section)
- [Website Hero Image Best Practices 2026 — Shopify](https://www.shopify.com/blog/16480796-how-to-create-beautiful-and-persuasive-hero-images-for-your-online-store)
- [Top Conversion Rate Optimization 2026 — Bluehost](https://www.bluehost.com/blog/conversion-rate-optimization-best-practices/)

Editorial / brand storytelling references:
- [The Story of Sweetgreen — Restaurant Business](https://www.restaurantbusinessonline.com/marketing/story-sweetgreen)
- [About Us — CAVA](https://cava.com/ourstory)
- [Can Storytelling Help Food Brands Stand Out — Seven Claves](https://www.sevenclaves.com/post/can-storytelling-help-food-brands-stand-out-in-a-crowded-market)

Gallery / testimonials / accordion patterns:
- [Accordion Design Best Practices — HubSpot](https://blog.hubspot.com/website/accordion-design)
- [Accordion UI Design — Mobbin](https://mobbin.com/glossary/accordion)
- [Best Ways to Showcase Photo Gallery — Pixpa](https://www.pixpa.com/blog/ways-to-showcase-your-photo-gallery-on-a-portfolio-website)

Date picker / booking UX:
- [Date Picker UI Design — Mobbin](https://mobbin.com/glossary/date-picker)
- [Calendar UI Examples — Eleken](https://www.eleken.co/blog-posts/calendar-ui)
- [How to Design an Effective Date Picker UI — Cieden](https://cieden.com/book/atoms/date-picker/date-picker-ui)
- [Blackout Dates Explained — Touchstay](https://touchstay.com/blog/blackout-dates-explained)

Accessibility:
- [WCAG Color Accessibility Guide 2026 — AI Brand Colors](https://aibrandcolors.com/accessibility-guide/)
- [New Digital Accessibility Requirements in 2026 — BBK Law](https://bbklaw.com/resources/new-digital-accessibility-requirements-in-2026)
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [Do Images Need to Follow Accessibility Rules — Accessible Web](https://accessibleweb.com/question-answer/images-art-need-follow-accessibility-rules/)

SEO / schema:
- [LocalBusiness Schema — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [LocalBusiness — Schema.org](https://schema.org/LocalBusiness)
- [Local SEO for Restaurants 2026 — LocalMighty](https://www.localmighty.com/blog/local-seo-for-restaurants/)
- [Restaurant Marketing Ideas 2026 — Local Restaurant SEO](https://localrestaurantseo.com/restaurant-marketing-ideas-for-2026-ai-and-seo/)

Social proof / Instagram embeds:
- [Embed Instagram Feed Free 2026 — EmbedSocial](https://embedsocial.com/blog/embed-instagram-feed-for-free/)
- [How to Integrate Social Media in 2026 — Curator](https://curator.io/blog/integrate-social-media-into-website)

Soul food catering market references (site examples):
- [Ebony Eyes Soul Food](https://www.ebonyeyessoulfood.com/)
- [California Cookout Soul Food Wedding Catering](https://californiacookout.com/soul-food-wedding-catering/)
- [Gist Catering](https://gistcateringserenity.com/)
- [All Occasions Southern Soul Food](https://aossoulfoodcatering.com/)

Internal project context:
- `/Users/jashia/Documents/1_Projects/larraes-kitchen/.planning/PROJECT.md`
- `/Users/jashia/Documents/1_Projects/larraes-kitchen/docs/prd-old.md`
- `/Users/jashia/Documents/1_Projects/larraes-kitchen/docs/ux-strategy-brief.md`

---
*Feature research for: Larrae's Kitchen — soul food catering marketing site*
*Researched: 2026-04-15*
