---
status: partial
phase: 02-content-static-sections
source: [02-VERIFICATION.md]
started: 2026-04-16T17:10:00Z
updated: 2026-04-16T17:10:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Full browser scroll test — all 8 sections in order
expected: Hero → About → Menu → Packages → Gallery → Testimonials → FAQ → Contact renders in order; sticky nav follows scroll; "Get a Quote" CTA always visible; anchor links (#menu, #packages, etc.) jump cleanly to correct sections; browser back/forward works correctly without router
result: [pending]

### 2. Package CTA deep-links — "Select Small" / "Select Medium" / "Select Large"
expected: URL becomes #inquiry?tier=small, #inquiry?tier=medium, #inquiry?tier=large respectively; the wizard section (Phase 3) is not yet built so the fragment will 404 gracefully, but the URL param pattern must be correct so Phase 3 can consume it
result: [pending]

### 3. Gallery lightbox keyboard navigation
expected: Clicking an image opens the lightbox; Arrow Left/Right navigate between images; Escape closes it; Tab focus stays trapped inside the lightbox when open
result: [pending]

### 4. Menu tab switching (post-UAT fix, commit 67117d9)
expected: Clicking "Sides" hides Proteins panel and shows Sides panel; clicking "Desserts" hides Sides and shows Desserts; ArrowLeft/ArrowRight keyboard navigation cycles tabs; all content was server-rendered (DOM has all 3 panels, tabs just toggle hidden attribute)
result: [pending]

### 5. HERO-05 contrast — WCAG AA on hero text over food photograph
expected: Headline text, subheadline, price chip, and CTA button all pass 4.5:1 contrast ratio on WCAG AA checker against the scrim-darkened background
result: [pending]

### 6. FAQ-04 keyboard + screen reader announcement
expected: Each <details>/<summary> element is keyboard-focusable; browser announces expanded/collapsed state on activation; ChevronDown rotates 180 degrees on open
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
