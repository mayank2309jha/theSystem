# THE SYSTEM

A Solo Leveling–inspired placement prep tracker. The theme (E→S hunter ranks,
"System window" UI, glowing status panels) is cosmetic — underneath it's a
personal placement-prep database: real company interview data, a resume
picker, and a skill-gap tracker, all seeded from actual 2025 IIT Bombay
placement records and 5 tailored resume variants.

**Status:** actively evolving. This README describes what exists today; see
[Roadmap](#roadmap--possible-next-steps) for what isn't built yet.

---

## What it does

- **Home** — a dashboard: current hunter rank (computed from cleared
  missions' XP), the nearest companies by placement day, the biggest
  skill gaps, and a personal job-application tracker (Mission Board).
- **Company Specific Prep** — 36 companies from the 2025 placement season,
  each with: required skills (per-skill target rank), DSA difficulty,
  core CS subjects to prepare, which of your projects to lead with, which
  resume variant to send (with a one-click PDF open), real interview-round
  breakdowns where a senior actually reported them, and a checkable prep
  roadmap.
- **Skill Maxing** — 23 skills spanning DSA, systems, ML, databases,
  interview craft, etc. Every skill starts at E-Rank (see
  [`SKILLS.md`](./SKILLS.md) for *why* each one matters and what closes the
  gap). Drag a skill's proficiency slider as you actually improve; it's
  the single source of truth the rest of the app reads from.
- **Resume Maxing** — all 5 resume variants (`Resumes/*.pdf`), each scored
  against all 36 companies by estimated skill alignment, so you can see a
  full ranked list per resume instead of just one recommendation per
  company.

Everything (skill levels, your own job applications, per-company prep
checklists) persists to `localStorage` — nothing leaves your browser, there's
no backend.

## Companion documents

| File | What it is |
|---|---|
| [`COMPANIES.md`](./COMPANIES.md) | Every company's full profile, auto-generated from `src/data/companies.js`. Regenerate with `node scripts/generate-companies-md.mjs` after editing the data — never hand-edit this file. |
| [`SKILLS.md`](./SKILLS.md) | A ground-truth skill audit: every skill/subskill actually named or demonstrated across all 5 resumes and 10 projects, each with a small checklist of things to do to prove/deepen it. Hand-maintained, not generated. |
| This file | Architecture, how to run, how the data model fits together, what's next. |

---

## Data sources

Everything in the app traces back to real files in the repo root, not
invented content:

- **`Company_Placement_Profiles.xlsx`** (`Company Profiles` + `Raw Data`
  sheets) — aggregated 2025 placement stats: company, role, CTC, base,
  locations, placement day.
- **`Placement Stats - Sheet1.pdf`** — the fuller per-student placement
  roster (used to catch companies missing from the aggregated sheet, e.g.
  Nvidia, Honda, Navi).
- **`2025 Placement stats (Responses).xlsx`** — a Google Form of real
  interview experiences from placed seniors: what was actually asked, round
  by round, plus their own prep advice. This is the source for every
  company's "Interview Rounds" and "Prep Roadmap" content in the app.
- **`Resumes/*.pdf`** (5 files) — `SDE.pdf`, `SDE + Algo.pdf`, `Backend.pdf`,
  `ML.pdf`, `Non-Core Companies.pdf`. Read in full to extract technical
  skills, project bullets, and coursework; copied into `public/resumes/` so
  the app can link straight to them.

Where no senior's interview report exists for a company, the app says so
explicitly (`verified: false` in the data, an "Unverified prep" badge in the
UI) rather than presenting a guess as fact.

---

## Architecture

React 19 + Vite 8 + Tailwind CSS v4 + React Router v7. No backend, no
build-time data fetching — everything is static data compiled into the
bundle, mutated client-side, and persisted to `localStorage`.

```
src/
  data/            Static content — the actual placement/resume knowledge base
    companies.js     36 companies: role, CTC, skills required, rounds, prep tips
    skills.js        23 skills: why it matters, roadmap, resources
    resumes.js        resume metadata + filename<->slug mapping
    resumeWeights.js  per-resume skill-weight tables + domain bonuses (see below)
    seed.js           Mission Board constants (types/statuses/XP table)

  lib/             Pure functions over the data — no React, no state
    ranks.js          E–S rank math: XP thresholds, skill-level→rank bands, rank gaps
    prep.js           Cross-cutting queries: company/skill lookups, skill-gap
                       analysis, resume-alignment scoring

  hooks/
    useLocalStorage.js  generic localStorage-backed useState

  components/       Presentational + small-interaction pieces
    Layout.jsx, NavBar.jsx          shell + tab navigation
    StatusWindow.jsx, RankTrack.jsx, RankBadge.jsx, RankPill.jsx   rank UI
    CompanyCard.jsx, SkillGapCard.jsx                              list-item cards
    MissionBoard.jsx, MissionCard.jsx                              personal job tracker

  pages/            One per route (see below)

  index.css         Tailwind entry + the entire color-palette system (see below)
  App.jsx           Router setup + all global state (skill levels, missions)
```

### Routing

```
/                    Home            dashboard
/companies           CompanyPrep     searchable/filterable company grid
/company/:id         CompanyDetail   full prep page for one company
/skills              SkillMaxing     skill tree, grouped by category
/skill/:id           SkillDetail     roadmap + which companies need it
/resumes             ResumeMaxing    5 resume cards, each with its top match
/resume/:slug        ResumeDetail    full company ranking for one resume
```

`App.jsx` owns all mutable state (`skillLevels`, `missions`, `playerName`)
and hands it down through `<Layout>` → `<Outlet context={...}>`; every page
reads it back with React Router's `useOutletContext()`. There's no
Redux/Zustand — the state is small enough that this is the whole state
layer.

### The rank system (`lib/ranks.js`)

Two related but distinct rank ladders, both `E → D → C → B → A → S`:

1. **Hunter rank** (shown on Home) — driven by cumulative XP from *cleared*
   missions in the Mission Board, against fixed thresholds
   (`RANK_THRESHOLDS`).
2. **Skill rank** — every skill has a 0–100 proficiency `level`; that number
   is mapped onto the *same* E–S vocabulary by splitting 0–100 into 6 equal
   bands (`skillRankForLevel`). This is what lets a company say "needs
   A-Rank System Design" and the UI compare it against your current rank
   directly (`rankGap`).

### Resume-alignment scoring (`data/resumeWeights.js` + `lib/prep.js`)

Each resume variant has a hand-derived weight (0–1) per skill, based on
actually reading its TECHNICAL SKILLS section — e.g. `SDE + Algo.pdf` and
`Backend.pdf` both drop the Machine Learning section entirely, so they score
**0** for `ml-fundamentals`/`deep-learning`/`nlp`/`data-analysis`, not just
"low." `resumeAlignmentScore(resumeFile, company)` computes a rank-weighted
average of those weights against a company's required skills (a company
needing A-Rank DSA counts for more than one needing D-Rank DSA), then
applies a small domain-match multiplier (e.g. the Non-Core resume gets a
bonus against Finance/Consulting-tagged companies) capped at 100%.

This is a heuristic, not a certainty — it's meant to rank-order options, not
to be taken as a precise probability.

### Color system (`src/index.css`)

**Every color in the app is a CSS custom property**, defined once at the top
of `src/index.css` under a `:root { ... }` block headed `THE SYSTEM — COLOR
PALETTE`. Tailwind's `@theme` block immediately below it just aliases
utility-class tokens (`--color-system-blue`, `--color-rank-a`, ...) onto
those variables — components never hardcode a color, they only ever use
Tailwind classes like `text-system-blue` or `border-rank-a`.

Current theme ("Regal," inspired by `colorpalette.jpg`): Regal Navy panels
over a Velvet Obsidian backdrop, Ethereal Ivory text, a cool blue→teal→
indigo→violet E→A rank ladder, with two warm colors used *only* as
deliberate accents — Opulent Gold for S-Rank/CTC/XP, Deep Crimson for
Failed/critical/unverified states.

To re-theme: edit the hex values (and their `-rgb` triplet counterparts,
used for glow/alpha effects) in that one block. Nothing else needs to
change — rank badges, panel backgrounds, button hovers, and glow shadows
(`.rank-glow-E` … `.rank-glow-S`, also defined in `index.css`) all resolve
from the same variables.

### Mission Board vs. Company Specific Prep — why both exist

These look similar but serve different purposes:

- **Company Specific Prep** is the *reference database* — every company
  that visited campus, what they ask, how to prep. It doesn't change based
  on what you've personally applied to.
- **Mission Board** (on Home) is *your own* application tracker — add a
  mission when you actually apply somewhere, move it through
  Queued→In Progress→Cleared/Failed, and clearing one awards XP toward your
  hunter rank. It starts empty by design; nothing here is pre-filled or
  assumed.

---

## Running it

```bash
npm install
npm run dev       # Vite dev server, default port 5173 (auto-increments if busy)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

Regenerating `COMPANIES.md` after editing `src/data/companies.js`:

```bash
node scripts/generate-companies-md.mjs
```

No environment variables, no external services, no auth — it's a static
site that reads its own bundled data.

---

## Progress so far

1. Base app scaffolded (Vite + React + Tailwind v4), Solo Leveling "System
   window" visual language established.
2. Rank system + Mission Board (personal job-application tracker) built.
3. All 5 resumes and all placement-data files read in full; built the
   Company Specific Prep and Skill Maxing tabs from that analysis — 36
   companies, 23 skills, each with real interview-round data where
   available.
4. Added Resume Maxing — full per-resume company ranking by estimated skill
   alignment, plus in-app resume viewing (PDFs served from
   `public/resumes/`).
5. Reworked the entire color system onto CSS custom properties and restyled
   to the "Regal" palette; reset every skill to a true E-Rank baseline.
6. Wrote `COMPANIES.md` (generated) and `SKILLS.md` (hand-audited resume +
   project skill inventory with proof-of-skill todos) as portable
   companion docs to this README.

## Roadmap / possible next steps

Nothing below is committed — just gaps and ideas worth considering as the
site keeps evolving:

- Wire `SKILLS.md`'s proof-of-skill todos into the app itself (right now
  they're markdown-only, disconnected from the Skill Maxing tab's roadmap).
- An editable player name / profile on Home (currently hardcoded to
  "Player").
- Deployment (Vercel/Netlify) so this is reachable outside `localhost`.
- A way to add new companies/skills without hand-editing the data files
  (even a simple form that writes back to `localStorage`-overlaid data).
- Revisit the resume-alignment weight tables periodically — they're a
  snapshot judgment call, not derived mechanically, and should be
  re-checked as resumes are updated.
- Expand company coverage as more interview reports come in (several
  companies are currently `verified: false`).
