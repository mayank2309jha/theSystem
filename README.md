# THE SYSTEM

A Solo Leveling–inspired placement prep tracker. The theme (E→S hunter ranks,
"System window" UI, glowing status panels) is cosmetic — underneath it's a
multi-user, evidence-based placement-intelligence platform: real company
interview data, a resume-to-company alignment checker (public and
account-based), and a skill tracker that keeps three things explicitly
separate rather than collapsing them into one score —
**CLAIMED** (what a resume says), **PROVEN** (what you've actually
demonstrated via checked evidence), and **RELEVANT** (what a company
requires) — all seeded from actual 2025 IIT Bombay placement records and
5 tailored resume variants. Every non-trivial number in the app has a
"How this works" methodology panel explaining the formula, its data, and its
limitations — see [`docs/System.md`](./docs/System.md) for the same thing in
writing.

**Status:** actively evolving, live and multi-user. This README describes
what exists today; see [Roadmap](#roadmap--possible-next-steps) for what
isn't built yet, and [`docs/CONTEXT.md`](./docs/CONTEXT.md) for the full
decision history if you need to understand *why* something is built the way
it is.

**Live:** deployed on Vercel, auto-deploying from `main` on every push.

---

## What it does

- **Home** — a dashboard: current Hunter Rank + **Level (1–100)** ("power
  scaling" — see below), a day-by-day progress graph against an even pace to
  Level 100, the nearest companies by placement day, a goal-agnostic "Where
  to Focus Next" panel (next achievable skill milestone, not an assumed
  top-tier target), and a personal job-application tracker (Mission Board).
- **Company Specific Prep** — 36 companies from the 2025 placement season,
  each with required skills (per-skill target rank), your **Proven** rank
  against each (evidence-based — see Skill Maxing below, never the
  self-assessment slider), DSA difficulty (plus an estimated contest-rating
  bar, see below), core CS subjects to prepare, which projects to lead with,
  real interview-round breakdowns where a senior actually reported them, and
  a checkable prep roadmap.
- **Skill Maxing** — 101 skills (React, HLD, LLD, Node, Postgres, and so on)
  spanning DSA, systems, ML, databases, cloud/devops, interview craft, etc.,
  each broken down into subskills (e.g. React → React Hooks, React Router)
  with concrete proof-of-skill todos under every subskill. Your rank is
  **Proven** — a weighted average of checked subskill evidence, the only
  thing that drives Company Prep and "Where to Focus Next" anywhere in the
  app. A separate **Self-Assessment** slider still exists per skill (a
  personal gut-check) but deliberately feeds nothing company-facing. Each
  skill's page also shows a per-skill progress chart and the full breakdown
  of which companies need it, grouped by the rank they actually require.
- **Resume Raid** (`/resume-raid`, every authenticated account) — upload as
  many resumes as you have (different variants, old drafts). Scans every one
  of them for mentioned projects, coursework, and technologies, unions the
  results, and surfaces every skill you've **Claimed** on paper — each with a
  one-click link into that skill's subskill checklist to actually make it
  Proven, and a "Start Tracking" button to seed the self-assessment slider.
- **Resume Alignment, two ways** (never called "Readiness" — that word is
  reserved for the skill-based Company Prep concept above; see
  [`docs/ResumetoCompany.md`](./docs/ResumetoCompany.md)):
  - **Public, no account** (`/try`) — upload any resume, scored against all
    36 companies, entirely client-side (PDF text extraction + keyword
    matching happen in the browser). Nothing is ever uploaded or stored.
    Meant to be shared directly with people who don't have an account.
  - **Authenticated** (`/resume`, "My Resume") — same scoring, but your
    resume is stored privately (Supabase Storage, RLS-locked to your own
    account) so results persist across visits.
  - Both also show **Resume Quality** (a heuristic score of the resume text
    itself — quantified impact, action verbs, section coverage, length,
    redundancy — independent of any one company) and **Confidence** (how
    much the app trusts its own Alignment number for a given company, based
    on extraction quality, requirement coverage, and whether that company's
    data is verified) — three genuinely separate numbers, never collapsed
    into one. A high Alignment score does not imply high Confidence.
- **Resume Maxing** (owner account only) — the 5 app-owned resume variants,
  each scored against all 36 companies by hand-authored skill-weight tables
  (more precise than keyword detection, since these 5 documents are known
  and were read in full rather than guessed at), with the same
  Quality/Confidence framing alongside.
- **Methodology panels** — a "?" button on every major page opens a
  page-specific explanation of what's shown, how it's calculated, what data
  feeds it, and its known limitations. Nothing in the app should present an
  estimate as objective fact without saying so.
- **Mission Board** — your own job-application tracker, separate from the
  reference company database. Clearing a mission still awards XP (shown as a
  stat on Home) — as of the Level system redesign, XP no longer drives the
  Hunter Rank badge itself; see [`docs/System.md`](./docs/System.md).
- **Contest rating DSA track** — self-report your rating on one platform
  (Codeforces/CodeChef/LeetCode) on `/profile`; each company's DSA
  requirement then also shows an estimated rating bar for that platform
  (derived from the company's existing rank requirement, not a real
  per-company survey number — disclosed as such), with a "clear"/"to go"
  comparison against your own.

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
| [`docs/FutureSuggestions.md`](./docs/FutureSuggestions.md) | Deferred product/UI backlog — recording something here is explicitly NOT authorization to build it. |
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
    skills.js         thin re-export of skills/index.js (kept so old imports still work)
    skills/           101 skills across 17 category files, aggregated via index.js — each
                      skill has subskills, each subskill has proof-of-skill todos (324
                      subskills / 648 todos total; see docs/CONTEXT.md for the honest
                      subskill-depth gap against the ~10/skill target)
    skillKeywords.js  keyword lists the resume checkers (and Resume Raid) match uploaded text against
    resumes.js        resume metadata + filename<->slug mapping
    resumeWeights.js  per-resume skill-weight tables + domain bonuses
    seed.js           Mission Board constants (types/statuses/XP table)
    methodology.js    per-page "how this works" content for the Methodology panel/button

  lib/             Pure functions — no React, no state
    ranks.js              E-S rank math: XP thresholds (legacy path), skill-level/Level->rank
                          bands, rank gaps
    prep.js                almost all scoring/ranking math: hunterLevel (the Level 1-100
                           formula), provenSkillLevel(s) (evidence-based, see docs/System.md),
                           company readiness, resume alignment, skill-unlock curves. Catalog-
                           consuming functions take `catalog` as a parameter (see useSkillCatalog
                           below) instead of importing one directly
    mastery.js             Mastery formulas (masteryScore, weakAreas) — 0-6 scale, separate from
                           Proven, see docs/System.md
    resumeQuality.js       Resume Quality heuristic scorer — quantified impact, action verbs,
                           section coverage, length, redundancy
    confidence.js          Confidence scorer — how much to trust one resume+company Alignment number
    contestRatings.js      DSA contest-rating estimate bands per platform (Codeforces/CodeChef/LeetCode)
    owner.js               isOwner(profile) — DB-driven, never a hardcoded identity
    extractResumeSkills.js pdf.js text extraction (lazy-loaded) + keyword scoring glue,
                           used by /try, /resume, and Resume Raid; analyzeResumeFile/Url also
                           return the raw text for Quality/Confidence
    appResumes.js          signed-URL fetch for the 5 owner-only app resumes
    supabaseClient.js      Supabase client from env vars

  context/          AuthContext.js / AuthProvider.jsx / useAuth.js — split across 3
                    files specifically to satisfy a react-refresh lint rule

  hooks/
    useLocalStorage.js  generic localStorage-backed useState (key-reactive) — now only used
                        as a one-time read source for migrating pre-2026-08-20 local
                        progress into the account the first time each hook below finds
                        zero rows for a user; no longer the source of truth for anything
    useSkillCatalog.js  the data-access layer — fetches the skill catalog from Supabase
                        (skills/subskills), reshapes it into the old static-catalog shape.
                        Fetched once in App.jsx, threaded through outletContext as `catalog`
    useSubskillMastery.js  React Query hook for per-subskill Mastery state (user_subskill_mastery)
    useProfile.js       React Query hook for the profiles table
    useResume.js        React Query hook for private resume upload/replace/delete
    useRaidResumes.js   React Query hook for multi-resume CRUD (Resume Raid)
    useSkillLevels.js   React Query hook for the skill-proficiency slider (user_skill_levels)
    useSkillTodos.js    React Query hook for subskill/todo completions (user_skill_todos)
    useCompanyPrep.js   React Query hook for company prep-checklists (user_company_prep)
    useMissions.js      React Query hook for the Mission Board (missions)
    useLevelHistory.js  React Query hook for day-by-day Level snapshots (user_level_history)
    useClaimedSkills.js React Query + local state — CLAIMED skills unioned across every Resume
                        Raid upload (Math.max per skill); shared by ResumeRaid.jsx and
                        CompanyDetail.jsx's Company Skill Matrix so both read one signal

  components/       Presentational + small-interaction pieces
    Layout.jsx, NavBar.jsx                shell + tab navigation (owner-gated tabs)
    ProtectedRoute.jsx, OwnerRoute.jsx     route guards
    StatusWindow.jsx, RankTrack.jsx, RankBadge.jsx, RankPill.jsx   rank/level UI
    ProgressChart.jsx                     hand-rolled inline SVG line chart — Level over
                                          time vs. an even-pace reference line
    ThemeToggle.jsx                       dark/light toggle (inline variant next to Log Out,
                                          fixed variant on the 3 pages with no shared header)
    MethodologyButton.jsx, MethodologyPanel.jsx   fixed bottom-right "?" + slide-up panel,
                                          content from data/methodology.js
    CompanyCard.jsx, SkillGapCard.jsx     list/result cards
    CompanySkillMatrix.jsx                Required/Claimed/Proven/Gap table + Best/Least Prepared,
                                          on every company detail page
    ResumeAlignmentTable.jsx, ResumeQualityCard.jsx   resume-scoring result display
    MissionBoard.jsx, MissionCard.jsx     personal job tracker
    ResumeDropzone.jsx, OpenResumeButton.jsx, CTABanner.jsx        resume-flow pieces

  pages/            One per route (see below), including ResumeRaid.jsx

  index.css         Tailwind entry + the entire color-palette system (see below)
  App.jsx           Router setup + all global state, sourced from the account-backed hooks
                    below (skill levels, missions, subskill-todo completions, company-prep
                    checklists, level history — all Supabase/RLS-backed as of the
                    2026-08-20 persistence migration, see docs/CONTEXT.md)
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
/resume-raid               ResumeRaid          multi-resume upload + claimed-skills scan

/resumes, /resume/:slug    ResumeMaxing/Detail  owner account only (OwnerRoute-gated)
```

`App.jsx`'s `AppRoutes` owns global state (`skillLevels`, `missions`, `playerName` from the
fetched profile) and hands it down through `<Layout>` → `<Outlet context={...}>`; pages read it
back via `useOutletContext()`. Auth state comes from `AuthProvider`/`useAuth`; per-request server
state (profile, resume) goes through React Query hooks.

### The rank system (`lib/ranks.js`) and scoring (`lib/prep.js`)

Full formulas in [`docs/System.md`](./docs/System.md). Short version: **Level** (1–100, "power
scaling") is derived from how many proof-of-skill todos you've checked off across the whole
101-skill catalog out of the total available — `hunterLevel(subskillTodos)` in `lib/prep.js`, floor
of 1 so a fresh account never reads "Level 0". The Hunter Rank badge shown on Home is that same
Level mapped onto the E→S vocabulary via `skillRankForLevel`. Mission Board XP still accumulates
and displays as its own stat, but no longer drives the rank badge — that's the Level system's job
now.

Per-skill proficiency is **Proven** — `provenSkillLevel(skill, subskillTodos)` in `lib/prep.js`, a
weighted average of checked subskill-todo evidence (finally using each subskill's long-inert
`weight` field). This is what Company Prep readiness and "Where to Focus Next" read
(`provenLevels`, computed once in `App.jsx`). A separate manually-set 0–100 **Self-Assessment**
slider per skill still exists (`skillLevels`) but is fully decoupled from scoring — dragging it
never moves any company-facing number, by explicit, asked-for design (see `docs/CONTEXT.md`).
Company readiness is an importance-weighted average of per-skill Proven progress against a
company's required rank (importance = required rank's position in the ladder, so an A-Rank
requirement counts more than a D-Rank one). The same core function
(`companyReadinessFromSkillLevels`) also powers **Resume Alignment** (never called "Readiness" in
that context — a deliberate terminology split, see `docs/System.md`) — fed resume-detected CLAIMED
skill levels instead of Proven ones, for both resume checkers and Resume Raid's claimed-skill
detection. Resume Alignment ships alongside two more independent numbers, **Resume Quality**
(`lib/resumeQuality.js`, a property of the resume text itself) and **Confidence**
(`lib/confidence.js`, how much to trust one Alignment number) — see
[`docs/ResumetoCompany.md`](./docs/ResumetoCompany.md) for the full engine breakdown and
[`docs/System.md`](./docs/System.md) for every formula.

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

**Dark/light mode**: a full second "Regal Light" palette lives under `:root[data-theme="light"]` in
the same block, toggled via the sun/moon button (`ThemeToggle.jsx` — inline next to Log Out on
authenticated pages, fixed-corner on Login/Signup/Try) and persisted to `localStorage` (device-level
preference, not synced to the account). **Not every component uses the theme tokens** — a lot of
existing className usage is Tailwind's stock `text-white`/`text-slate-100..600`/`border-slate-600`
directly, so light mode also overrides those specific classes further down `index.css`; adding a new
hardcoded gray class anywhere needs a matching override there or it won't re-theme. See
`docs/CONTEXT.md` for the full reasoning and the rank-color contrast adjustments this required.

---

## Running it

```bash
npm install
cp .env.example .env.local     # fill in your Supabase project's URL + anon key
npm run dev       # Vite dev server
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint + scripts/validate-skill-ids.mjs (cross-file skill-id check, see below)
```

Database setup: run `supabase/schema.sql` in full, once, in your Supabase project's SQL Editor —
it's idempotent-ish and safe to re-run after edits. **If you already ran it before 2026-08-21's
skill-catalog migration, re-run it once more** — it added `skills`/`subskills` (the skill catalog
itself, now DB-authoritative — see "The skill catalog" below) and `user_subskill_mastery` (Mastery
tracking). If you're even further behind, it also added `user_skill_levels`/`user_level_history`
(2026-08-20) and `profiles.contest_platform`/`contest_rating`. `user_skill_todos`/
`user_company_prep`/`missions` have existed since Phase A.

**After running schema.sql, also seed the skill catalog** (a separate, required step — the schema
creates empty tables, this populates them):

```bash
# Add SUPABASE_SERVICE_ROLE_KEY to .env.local first (see .env.example — NOT the anon key,
# and never VITE_-prefixed, or Vite would bundle it into the client build)
node --env-file=.env.local scripts/seed-skills-to-supabase.mjs
```

Idempotent — safe to re-run any time you edit `src/data/skills/` to push the changes to Supabase.

### The skill catalog (as of 2026-08-21, migrated from static JS)

`skills`/`subskills` in Supabase are now the **runtime source of truth** — `src/data/skills/`
(17 category files) is the **seed source** the script above reads from, plus the one deliberate
exception: `Try.jsx` (the public, no-auth resume checker) still imports that static bundle directly,
to preserve its zero-Supabase-network-calls guarantee. Every authenticated page reads the catalog
via `useSkillCatalog()` (fetched once in `App.jsx`, threaded through `outletContext` as `catalog`).
**To add or edit a skill**: edit the static files in `src/data/skills/` as before, then re-run the
seed script — don't edit Supabase rows by hand and expect the static files to catch up on their own.

Regenerating the auto-generated docs after editing `src/data/companies.js`:

```bash
node scripts/generate-companies-md.mjs   # docs/COMPANIES.md
node scripts/generate-company-md.mjs     # docs/Company.md
```

`scripts/validate-skill-ids.mjs` (chained into `npm run lint`) catches the specific class of bug
that broke 23/36 companies once already this project's life — a skill-catalog id renamed in
`src/data/skills/` without updating every place that still references the old id
(`companies.js`, `resumeWeights.js`, `skillKeywords.js`). Run it standalone with
`node scripts/validate-skill-ids.mjs` any time you touch the skill catalog.

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
8. Expanded the skill catalog from 23 to **101 skills** (324 subskills, 648 proof-of-skill todos),
   restructured `SkillDetail` around a checkable subskill/todo list, replaced XP-driven Hunter Rank
   with a todo-completion-driven **Level system (1–100)**, added day-by-day progress graphs (Home
   + per-skill), built **Resume Raid** (`/resume-raid`) for scanning multiple resumes into one
   claimed-skills list, and fixed a company-prep-checklist namespacing bug found along the way.
9. Found and fixed a real regression from step 8: the catalog restructuring silently broke 23/36
   companies' skill requirements and Resume Raid's keyword detection (stale/missing skill ids) —
   see `docs/CONTEXT.md` for the full incident writeup. Added a search bar to Skill Maxing, a
   readiness % on every company card, and **migrated skill levels, subskill-todo completions,
   company-prep checklists, missions, and level history off localStorage onto Supabase** so
   progress follows the account across devices — `useSkillLevels`/`useSkillTodos`/`useCompanyPrep`/
   `useMissions`/`useLevelHistory`, each with a one-time pull of any leftover local progress into
   the account the first time it finds zero DB rows. Also built a **self-reported contest-rating DSA
   track** (Codeforces/CodeChef/LeetCode) — required ratings are an explicit estimate derived from
   each company's existing DSA rank, not invented data. **Requires re-running `supabase/schema.sql`**
   (new tables + `profiles` columns) before either of these takes effect — see "Running it" above.
10. **CLAIMED / PROVEN / RELEVANT redesign, Phases 1-5 of 6** (plan:
    `shimmering-yawning-journal.md`, see `docs/CONTEXT.md` for the full writeup). Skill proficiency
    is now **Proven** (evidence-based, finally wiring the subskill `weight` field from step 8) —
    the manual slider is relabeled **Self-Assessment** and fully decoupled from Company Prep,
    "Where to Focus Next," and Resume Alignment, per an explicit confirmed direction. Added a
    cross-file skill-id validator to `npm run lint` (closes the class of bug found in step 9).
    Renamed the resume-scoring UI from "Readiness" to **Resume Alignment** everywhere it means
    "does this resume claim the skill" (kept "Readiness" only for the skill-based Proven concept).
    Added **Resume Quality** and **Confidence** as two new, independent, disclosed-as-heuristic
    numbers alongside Alignment. Added a page-specific **Methodology panel** ("?" button, bottom
    right) explaining every computed value's formula, data, and limitations. Redesigned Resume Raid
    around the Claimed/Proven split — a collapsible "What is Resume Raid?" intro, a Proven badge
    next to every claimed skill, and an **Actual Skill vs. Unverified Claims** summary bar. Added a
    **Company Skill Matrix** (`CompanySkillMatrix.jsx`) to every company page — Required/Claimed/
    Proven/Gap per skill, plus Best/Least Prepared summaries.
11. **Skill catalog migrated to Supabase + subskill Mastery tracking** (2026-08-21, plan file same
    as above). The skill catalog (`skills`/`subskills`) is now DB-authoritative — see "The skill
    catalog" under "Running it." `src/data/skills/` stays as the seed source and as `/try`'s
    permanent, deliberate exception (preserves its zero-Supabase-calls guarantee). Every catalog ID
    preserved exactly (verified globally unique beforehand) so existing todo-completion progress
    kept working through the migration. Built alongside: **Mastery** — a new, separate 0-6 scale
    (Not Started → Advanced) per subskill, with confidence, notes, and review-scheduling fields,
    explicitly independent from Proven (per a direct confirmation, not an assumption). Shows as
    "Kafka — 3.1/6" with a Weak Areas callout on `SkillDetail`. Question banks, quizzes, and
    automated spaced repetition are explicitly NOT built — the data model is architected for them,
    not the modules themselves.

## Roadmap / possible next steps

Nothing below is committed — gaps and ideas worth considering as the site keeps evolving. Full
detail on all of these in `docs/CONTEXT.md`'s "not built yet" section:

- **ACTION REQUIRED right now**: the skill catalog migration needs schema.sql re-run AND the seed
  script run before Skill Maxing/Company Prep/Resume Raid show anything real — see "Running it."
- **Question banks, quiz-accuracy tracking, overconfidence flagging, automated spaced repetition,
  and resume-defense mode are all explicitly not built** — Mastery's data model (schema, formulas)
  supports them arriving later without a redesign, but none of the modules themselves exist.
- **No UI for creating custom skills/subskills yet** — the schema (`skills.owner_id`, RLS) supports
  it; there's no "add a skill" form anywhere in the app.
- **Phase 6 of the CLAIMED/PROVEN/RELEVANT plan — deep subskill-depth expansion for the owner's
  actual highest-priority skills — isn't started.** Flagged in the plan itself as a large
  content-authoring effort needing its own dedicated pass, distinct from Phases 1-5's architecture
  work. Same underlying gap as the next bullet.
- **Subskill depth falls short of spec on most of the 101 skills** — 324 subskills total, average
  3.2/skill, against an explicit ~10/skill ask. `dsa` (11) and `hld` (10) already meet the bar;
  most others (GraphQL, MySQL, MongoDB, TDD, and more) currently sit at 1–2.
- **Per-skill historical progress trails aren't tracked** — only the aggregate `levelHistory` (used
  by Home's chart) is; SkillDetail's chart shows a single "today" point, a deliberate scope
  trade-off, not an oversight.
- **Resume Quality's bullet-level analysis is a known limitation** — pdf.js extraction doesn't
  preserve line/bullet boundaries, so Quality's signals are density-based (per 100 words), not
  per-bullet. Fixing this means changing how `extractTextFromSource` joins text items — not done,
  to avoid risking the already-working skill-keyword detection sharing that code path.
- Revisit the resume-alignment weight tables and keyword lists periodically — both are
  judgment-call heuristics that should be re-checked against real usage.
- Expand company coverage as more interview reports come in (several are `verified: false`).
- Decide deliberately on email confirmation (currently off, fine for low-friction testing, worth
  reconsidering now that strangers can sign up).
- User-created custom skills/subskills/companies, an OA Tracker distinct from DSA proficiency, an
  Interview Simulator with a company-specific question bank, and a future notes/documents/quizzes
  knowledge base are all explicitly scoped as NEXT/LATER, not started — see the plan file.
