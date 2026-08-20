# THE SYSTEM

A Solo Leveling–inspired placement prep tracker. The theme (E→S hunter ranks,
"System window" UI, glowing status panels) is cosmetic — underneath it's a
multi-user placement-prep platform: real company interview data, a resume
picker, a resume-to-company compatibility checker (both public and
account-based), and a skill-gap tracker, all seeded from actual 2025 IIT
Bombay placement records and 5 tailored resume variants.

**Status:** actively evolving, live and multi-user. This README describes
what exists today; see [Roadmap](#roadmap--possible-next-steps) for what
isn't built yet, and [`docs/CONTEXT.md`](./docs/CONTEXT.md) for the full
decision history if you need to understand *why* something is built the way
it is.

**Live:** deployed on Vercel, auto-deploying from `main` on every push.

---

## What it does

- **Home** — a dashboard: current hunter rank (computed from cleared
  missions' XP), the nearest companies by placement day, a goal-agnostic
  "Where to Focus Next" panel (next achievable skill milestone, not an
  assumed top-tier target), and a personal job-application tracker (Mission
  Board).
- **Company Specific Prep** — 36 companies from the 2025 placement season,
  each with required skills (per-skill target rank), DSA difficulty, core CS
  subjects to prepare, which projects to lead with, real interview-round
  breakdowns where a senior actually reported them, and a checkable prep
  roadmap.
- **Skill Maxing** — 23 skills spanning DSA, systems, ML, databases,
  interview craft, etc. Every account starts every skill at E-Rank. Each
  skill's page shows the full breakdown of which companies need it, grouped
  by the rank they actually require.
- **Resume Compatibility Checker, two ways:**
  - **Public, no account** (`/try`) — upload any resume, scored against all
    36 companies, entirely client-side (PDF text extraction + keyword
    matching happen in the browser). Nothing is ever uploaded or stored.
    Meant to be shared directly with people who don't have an account.
  - **Authenticated** (`/resume`, "My Resume") — same scoring, but your
    resume is stored privately (Supabase Storage, RLS-locked to your own
    account) so results persist across visits.
- **Resume Maxing** (owner account only) — the 5 app-owned resume variants,
  each scored against all 36 companies by hand-authored skill-weight tables
  (more precise than keyword detection, since these 5 documents are known
  and were read in full rather than guessed at).
- **Mission Board** — your own job-application tracker, separate from the
  reference company database. Clearing a mission awards XP toward Hunter
  Rank.

## Full documentation set

All companion docs live in [`docs/`](./docs/):

| File | What it is |
|---|---|
| [`docs/CONTEXT.md`](./docs/CONTEXT.md) | **Start here if picking this project back up cold.** Full decision log — what was built, why, what was tried and reverted, explicit user constraints (git ownership, no hardcoded owner identity, etc.), and what's genuinely NOT built yet. |
| [`docs/Case.md`](./docs/Case.md) | Concrete user-journey walkthroughs for each kind of visitor — anonymous, fresh signup, returning user, owner account. |
| [`docs/System.md`](./docs/System.md) | The leveling/ranking/scoring math, with exact formulas — Hunter Rank, skill proficiency bands, company readiness, resume alignment. |
| [`docs/Use.md`](./docs/Use.md) | Feature-by-feature catalog of everything the app does. |
| [`docs/ResumetoCompany.md`](./docs/ResumetoCompany.md) | Deep dive on the two separate resume-scoring engines (static weight tables vs. keyword detection) and their formulas/limitations. |
| [`docs/COMPANIES.md`](./docs/COMPANIES.md) | Every company's full prep profile (rounds, checklist, recommended resume). Auto-generated — `node scripts/generate-companies-md.mjs`, never hand-edit. |
| [`docs/Company.md`](./docs/Company.md) | Every company's skill requirements with numeric weighting, plus base/CTC. Auto-generated — `node scripts/generate-company-md.mjs`, never hand-edit. |
| [`docs/SKILLS.md`](./docs/SKILLS.md) | Ground-truth skill audit from reading all 5 resumes + 10 underlying projects, with proof-of-skill todos. Hand-maintained. |
| This file | Architecture, how to run, how the data model fits together, what's next. |

---

## Data sources

Everything traces back to real files, not invented content:

- **`Company_Placement_Profiles.xlsx`** — aggregated 2025 placement stats:
  company, role, CTC, base, locations, placement day.
- **`Placement Stats - Sheet1.pdf`** — the fuller per-student placement
  roster (catches companies missing from the aggregated sheet).
- **`2025 Placement stats (Responses).xlsx`** — real interview experiences
  from placed seniors, round by round, plus their own prep advice. Source
  for every company's "Interview Rounds" and "Prep Roadmap" content.
- **The 5 app-owned resume variants** — `SDE.pdf`, `SDE + Algo.pdf`,
  `Backend.pdf`, `ML.pdf`, `Non-Core Companies.pdf`. Read in full to extract
  technical skills, project bullets, and coursework. Stored privately in
  Supabase Storage (owner-only), **not** in `public/` — see the privacy note
  below.

Where no senior's interview report exists for a company, the app says so
explicitly (`verified: false`, an "Unverified prep" badge) rather than
presenting a guess as fact.

---

## Architecture

React 19 + Vite 8 + Tailwind CSS v4 + React Router v7 on the frontend.
**Supabase (Postgres + Auth + Storage) as the backend** — the frontend talks
to it directly via the public anon key; Row Level Security is the entire
security boundary, not client-side filtering. Hosted on Vercel,
GitHub-connected for auto-deploy on push to `main`.

```
src/
  data/            Static content — the actual placement/resume/skill knowledge base
    companies.js      36 companies: role, CTC, skills required, rounds, prep tips
    skills.js         23 skills: why it matters, roadmap, resources
    skillKeywords.js  keyword lists the resume checkers match uploaded text against
    resumes.js        resume metadata + filename<->slug mapping
    resumeWeights.js  per-resume skill-weight tables + domain bonuses
    seed.js           Mission Board constants (types/statuses/XP table)

  lib/             Pure functions — no React, no state
    ranks.js              E-S rank math: XP thresholds, skill-level->rank bands, rank gaps
    prep.js                almost all scoring/ranking math: company readiness, resume
                           alignment, skill-unlock curves — see docs/System.md
    owner.js               isOwner(profile) — DB-driven, never a hardcoded identity
    extractResumeSkills.js pdf.js text extraction (lazy-loaded) + keyword scoring glue
    appResumes.js          signed-URL fetch for the 5 owner-only app resumes
    supabaseClient.js      Supabase client from env vars

  context/          AuthContext.js / AuthProvider.jsx / useAuth.js — split across 3
                    files specifically to satisfy a react-refresh lint rule

  hooks/
    useLocalStorage.js  generic localStorage-backed useState (key-reactive, see below)
    useProfile.js       React Query hook for the profiles table
    useResume.js        React Query hook for private resume upload/replace/delete

  components/       Presentational + small-interaction pieces
    Layout.jsx, NavBar.jsx                shell + tab navigation (owner-gated tabs)
    ProtectedRoute.jsx, OwnerRoute.jsx     route guards
    StatusWindow.jsx, RankTrack.jsx, RankBadge.jsx, RankPill.jsx   rank UI
    CompanyCard.jsx, SkillGapCard.jsx, CompanyReadinessTable.jsx   list/result cards
    MissionBoard.jsx, MissionCard.jsx     personal job tracker
    ResumeDropzone.jsx, OpenResumeButton.jsx, CTABanner.jsx        resume-flow pieces

  pages/            One per route (see below)

  index.css         Tailwind entry + the entire color-palette system (see below)
  App.jsx           Router setup + all global state (skill levels, missions — still
                    localStorage-backed, namespaced per user id; see docs/CONTEXT.md
                    for what's NOT yet migrated to the database)
```

### Routing

```
/login, /signup           public, unauthenticated
/try                       public, unauthenticated — resume checker, zero backend calls

/                          Home                dashboard
/companies, /company/:id   CompanyPrep/Detail  company database
/skills, /skill/:id        SkillMaxing/Detail  skill tree
/profile                   Profile             name/email/logout
/resume                    Resume              private resume upload — every account

/resumes, /resume/:slug    ResumeMaxing/Detail  owner account only (OwnerRoute-gated)
```

`App.jsx`'s `AppRoutes` owns global state (`skillLevels`, `missions`, `playerName` from the
fetched profile) and hands it down through `<Layout>` → `<Outlet context={...}>`; pages read it
back via `useOutletContext()`. Auth state comes from `AuthProvider`/`useAuth`; per-request server
state (profile, resume) goes through React Query hooks.

### The rank system (`lib/ranks.js`) and scoring (`lib/prep.js`)

Full formulas in [`docs/System.md`](./docs/System.md). Short version: Hunter Rank comes from
cumulative Mission Board XP against fixed thresholds; skill proficiency is a 0–100 number mapped
onto the same E→S vocabulary via 6 equal bands; company readiness is an importance-weighted
average of per-skill progress (importance = required rank's position in that ladder, so an
A-Rank requirement counts more than a D-Rank one). The same core function
(`companyReadinessFromSkillLevels`) powers both the manually-set skill-slider readiness view *and*
both resume checkers — see [`docs/ResumetoCompany.md`](./docs/ResumetoCompany.md) for how an
uploaded PDF becomes a skill-level map in the first place.

### Privacy & security model

- Every user-owned table (`profiles`, `missions`, `user_resumes`, etc.) is Row-Level-Security
  locked to `auth.uid() = user_id` — enforced by Postgres, not by the frontend.
- The app-owner concept (`profiles.is_owner`) is a database boolean, never a hardcoded email/ID in
  client code — a client-side update can never flip it (RLS `WITH CHECK` blocks it); only a direct
  SQL Editor command can. See `docs/CONTEXT.md` for why this mattered enough to redesign once.
- The 5 app-owned resumes live in a private Storage bucket readable only by the owner account —
  not in `public/`, which would have zero access control.
- The public `/try` checker makes zero network requests to Supabase — verified, not assumed.
- Only the Supabase anon key ever ships to the browser; RLS is what makes that safe.

### Color system (`src/index.css`)

**Every color in the app is a CSS custom property**, defined once at the top of `src/index.css`
under a `:root { ... }` block headed `THE SYSTEM — COLOR PALETTE`. Tailwind's `@theme` block
aliases utility-class tokens onto those variables — components never hardcode a color.

Current theme ("Regal"): Regal Navy panels over a Velvet Obsidian backdrop, Ethereal Ivory text, a
cool blue→teal→indigo→violet E→A rank ladder, with two warm colors used *only* as deliberate
accents — Opulent Gold for S-Rank/CTC/XP, Deep Crimson for Failed/critical/unverified states. To
re-theme: edit the hex values (and `-rgb` triplet counterparts) in that one block.

---

## Running it

```bash
npm install
cp .env.example .env.local     # fill in your Supabase project's URL + anon key
npm run dev       # Vite dev server
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

Database setup: run `supabase/schema.sql` in full, once, in your Supabase project's SQL Editor —
it's idempotent-ish and safe to re-run after edits.

Regenerating the auto-generated docs after editing `src/data/companies.js`:

```bash
node scripts/generate-companies-md.mjs   # docs/COMPANIES.md
node scripts/generate-company-md.mjs     # docs/Company.md
```

**Git and deployment are entirely user-driven** — no `git`/`vercel` commands should be run on this
project's behalf without being asked; deploys happen via `git push` to `main` (Vercel auto-deploys)
now that GitHub is connected.

---

## Progress so far

1. Base app scaffolded, Solo Leveling visual language established, rank system + Mission Board
   built, 36 companies + 23 skills authored from real placement data.
2. Resume Maxing (owner-only, 5 static resumes vs. companies) + full CSS-custom-property color
   system built.
3. Migrated to multi-user: Supabase Auth, per-user isolated data, RLS on every table, private
   resume storage — including catching and fixing a real cross-user data leak in an interim
   localStorage layer, and a real PII-in-bundle issue in an early owner-detection approach.
4. Redesigned skill-gap UI around achievable milestones instead of an assumed universal top-tier
   target, per direct user feedback.
5. Deployed to Vercel, then connected GitHub for auto-deploy on push.
6. Built the resume-to-company checker for **both** audiences — public/no-account (`/try`,
   zero-backend, keyword-matching) and authenticated (`/resume`, private persistent storage) —
   sharing one scoring core with the rest of the app.
7. Full documentation set written (`docs/`), including a context-recovery doc for picking this
   project back up with no memory of how it got here.

## Roadmap / possible next steps

Nothing below is committed — gaps and ideas worth considering as the site keeps evolving. Full
detail on all of these in `docs/CONTEXT.md`'s "not built yet" section:

- **Company prep checklists aren't namespaced per user** on the shared-browser localStorage layer
  (missions and skill-levels are; this one was missed) — a real, known gap, not yet fixed.
- **Skill → Subskill → Todo proficiency redesign** was planned once but never executed — skill
  proficiency is still a directly-set slider, not derived from checkable evidence.
- **Progress-over-time graphs** (overall readiness on Home, per-skill on Skill Detail, dated
  2026-08-18 → 2026-11-30) — requested, not yet built.
- Migrate missions/skill-levels off `localStorage` onto Supabase properly (currently just
  per-user-namespaced as an interim measure).
- Revisit the resume-alignment weight tables and keyword lists periodically — both are
  judgment-call heuristics that should be re-checked against real usage.
- Expand company coverage as more interview reports come in (several are `verified: false`).
- Decide deliberately on email confirmation (currently off, fine for low-friction testing, worth
  reconsidering now that strangers can sign up).
