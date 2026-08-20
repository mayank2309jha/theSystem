# FutureSuggestions.md — Deferred Product/UI Backlog

**This is a backlog, not a task list.** Everything in this file is intentionally NOT implemented.
Do not fold any of these into the current skill/subskill data model, scoring formulas, or UI unless
the user explicitly asks for that specific item by name in a future turn. Recording something here
is not authorization to build it.

Each entry: Title, Problem, Desired outcome, Notes / implementation considerations, Status.

---

## 1. Landing Page Decluttering

**Problem**

The closest thing this app has to a public landing page is `/try` (the no-account Resume
Compatibility Checker — the page a shared link actually lands on). As of the 2026-08-20
CLAIMED/PROVEN/RELEVANT redesign it accumulated more on-page elements without a pass to check the
page still reads as focused:

- Two identical CTA banners (`CTABanner.jsx`, same text, same link) — one above the dropzone, one
  below the results table.
- Header block (system title + tagline + one-line privacy promise).
- `ThemeToggle` (fixed top-right) and `MethodologyButton` (fixed bottom-center) both float on top of
  the page at all times, on a page whose only real content is one dropzone + one results table.
- Once results are shown: a Resume Quality card (5 sub-dimension breakdown), then a Resume Alignment
  table (7 columns: #, Company, Domain, Alignment, Confidence, Base, CTC) with a paragraph of
  disclaimer text above it, then the second CTA banner.
- The page has no single dominant visual anchor — header, dropzone, two data-dense cards, and two
  identical CTAs are all roughly equal visual weight.

**Desired outcome**

A cleaner, more focused `/try` (or whatever the eventual public entry point is) with a clear visual
hierarchy — one primary action, a clear sense of what happens next, less competing/duplicate calls
to action, less upfront explanatory text before the user has done anything.

**Notes / implementation considerations**

- Candidates worth reviewing when this is picked up: whether both CTA banners are needed or one
  (post-results only, since a first-time visitor has nothing to click through to yet) is enough;
  whether the Resume Quality dimension breakdown belongs on first view or behind a
  "see breakdown" disclosure; whether the disclaimer paragraph above the Alignment table could move
  into the Methodology panel instead of sitting in the main flow.
- This is about `/try` specifically — `Login.jsx`/`Signup.jsx` are simpler and weren't flagged.
- Do not redesign yet.

**Status:** Deferred — not started.

---

## 2. Font Readability / Brightness

**Problem**

Text readability/contrast has been reported as insufficient in places. Grounding this in what
actually exists: the app uses six text-color tiers for meta/secondary text
(`text-white`/`text-slate-100` through `text-slate-600`, plus the theme's own `--sl-text`/
`--sl-text-dim` tokens), and `text-slate-500` alone is used in **76 places** across the codebase —
the single most common class for labels, captions, timestamps, and disclaimer text. `text-slate-600`
(dimmer still, 22 uses) is used for placeholders and footer text. These were tuned primarily for the
dark theme's Velvet Obsidian background; light mode (added 2026-08-20) got its own remapped values
for the same classes (see `src/index.css`'s `[data-theme="light"]` override block), but neither pass
included a dedicated contrast/accessibility audit — colors were chosen by eye, not measured.

**Desired outcome**

Body and meta text should be comfortably readable without a contrast audit turning up failures —
specifically review whether the dimmest tiers (`text-slate-500`, `text-slate-600`, `--sl-text-dim`)
are too low-contrast against their panel backgrounds, in both dark and light mode.

**Notes / implementation considerations**

- Every text color in this app is either a Tailwind stock slate shade (hardcoded in ~25 files —
  see `docs/CONTEXT.md`'s dark/light mode entry for the full list) or one of the CSS custom
  properties in `src/index.css`'s palette block. A real fix likely touches both: the token values
  themselves, and possibly the light-mode override block's remapped values for `text-slate-500`/
  `-600` specifically.
- If this is picked up, consider running an actual contrast-ratio check (e.g. the kind of tooling
  the `dataviz` skill's palette validator does for chart colors) rather than eyeballing it again —
  the whole point of the complaint is that eyeballing already produced text that reads as too dim.
- Don't conflate this with a full re-theme — the goal is fixing contrast on the existing "Regal"
  palette, not picking new brand colors.
- Do not implement yet.

**Status:** Deferred — not started.

---

<!-- Append new entries below this line, following the same Title / Problem / Desired outcome /
     Notes / Status structure, so this file stays scannable as it grows. -->
