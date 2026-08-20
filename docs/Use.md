# Use.md — Feature Catalog

Everything you can actually do in THE SYSTEM, organized by page. See `docs/Case.md` for narrative
walkthroughs of how these fit together for different kinds of users, and `docs/System.md` for the
math behind the numbers this page mentions.

## Public (no account)

### Resume Compatibility Checker — `/try`
Upload a PDF resume, get it scored against all 36 companies, entirely in your browser. Nothing is
uploaded, nothing is stored — closing the tab discards everything. Meant to be shared directly
(e.g. `https://<your-domain>/try`) with people who don't have an account and might not want one
yet. Two CTA banners (top and after results) link to `/login` for anyone who wants the full app.

### Sign up / Log in — `/signup`, `/login`
Email + password. No email confirmation step currently — submitting logs you straight in. The
signup page also links out to the free checker for anyone not ready to commit to an account.

## Authenticated (every account)

### Home — `/`
The dashboard. Shows:
- **Status Window** — your name, **Level (1–100)** with a rank progress bar (E–S, derived from
  Level, not from XP — see `docs/System.md`), total XP and missions cleared/active as separate
  stats, skills tracked (101).
- **Progress Over Time** — a day-by-day line graph of your Level against an even pace to Level 100
  (2026-08-18 → 2026-11-30). Fills in one point per day you've actually used the app; doesn't
  backfill retroactively. Authenticated-only by construction (Home itself is behind the login wall).
- **Nearest Quests** — the 6 soonest companies by real placement day, shared reference data.
- **Where to Focus Next** — up to 6 skills, each with a concrete next milestone ("Reach C-Rank →
  unlocks 12 more companies"), not an assumed universal target.
- **Mission Board** — see below.

### Company Specific Prep — `/companies`, `/company/:id`
All 36 companies from the real 2025 placement season, searchable and filterable by domain
(SDE/Systems/ML/Fintech/Non-Core). Each company's page shows:
- Required skills with target ranks, linking to that skill's detail page.
- DSA difficulty and core CS subjects to prepare.
- Which of the resume's known projects to lead with.
- Real interview-round breakdowns where a senior actually reported them (flagged "Unverified prep"
  otherwise, in crimson, rather than presenting a guess as fact).
- A checkable prep-roadmap checklist.
- (Owner account only) which of the 5 app resume variants to send, with an alignment score.

### Skill Maxing — `/skills`, `/skill/:id`
All 101 skills grouped by category (Core CS, Languages, Frontend, Backend, Databases, Distributed
Systems, Systems & OS, Cloud & DevOps, Machine Learning, NLP/LLMs, Data Engineering, Applied
Algorithms, Testing, Security, Specialized, Interview Craft, and more) — things like React, HLD,
LLD, Node, Postgres. Each skill:
- Has a proficiency slider (0–100) you drag as you actually improve — every account starts every
  skill at 10 (E-Rank). This slider is what company-readiness scoring reads.
- Shows its next milestone (which rank, how many companies it unlocks).
- On the detail page, breaks down into **subskills** (e.g. React → React Hooks, React Router), each
  with a checklist of concrete **proof-of-skill todos** — things you must actually be able to do to
  say you know that subskill. Checking these off is what advances your overall **Level** (see Home),
  independently of the proficiency slider above.
- Has its own progress chart against the same even-pace-to-Level-100 reference line (a single
  "today" point, not a full trail — only the aggregate Level history on Home tracks day-by-day).
- A full breakdown of every company that needs it, grouped by the rank they require — so you can
  see, e.g., that C-Rank already covers most of the list and only one or two companies need A-Rank.

**Known gap:** subskill depth varies a lot by skill right now — `dsa` and `hld` have 10+ subskills
each, but many others (GraphQL, MySQL, MongoDB, TDD, and more) currently have only 1–2. See
`docs/CONTEXT.md` for the full list; this is an acknowledged shortfall against the original spec,
not a hidden one.

### Resume Raid — `/resume-raid`
Upload every resume you have — different variants, old drafts, all of them (no limit, unlike My
Resume's single slot). The app scans every one of them for mentioned projects, coursework, and
technologies, unions the results across all your resumes (same keyword-detection engine as the
Resume Compatibility Checker), and shows every skill you've **claimed** on paper, grouped by
category. For each claimed skill: a "Test My Strength" link straight into that skill's subskill
checklist (because mentioning a skill on a resume isn't proof you actually know it), and a "Start
Tracking" button that seeds it as a tracked skill at a baseline level. This is a second route into
prep, distinct from Skill Maxing's own browse-everything view — it starts from what you've already
claimed rather than the full catalog.

### My Resume — `/resume`
Upload your own resume privately (PDF, 5MB max). Stored in your own account only — no other user,
including the app owner, can read it through the app or its database (enforced server-side via Row
Level Security, not just hidden in the UI). Once uploaded:
- Replace or delete it any time.
- See the same "all 36 companies ranked by readiness" table the public checker produces, computed
  from your actual stored resume, re-scored fresh each visit.

### Mission Board (on Home)
Your personal job-application tracker — distinct from the reference company database. Add a
mission when you actually apply somewhere: company, role, type (Application/OA/Technical
Interview/HR Interview/Offer), difficulty (E–S), deadline, notes. Move it through
Queued → In Progress → Cleared/Failed. Clearing a mission awards XP (once per mission), shown as its
own "Total XP" stat — XP no longer drives your Level or Hunter Rank badge (that's subskill-todo
completion now, see Skill Maxing above and `docs/System.md`). Starts empty for every new account by
design.

### Profile — `/profile`
Edit your display name. See your email. Log out.

## Owner-only (one specific account)

### Resume Maxing — `/resumes`, `/resume/:slug`
Compares the 5 app-owned resume variants (SDE, SDE+Algo, Backend, ML, Non-Core Companies) against
all 36 companies by estimated skill alignment. Pick a resume, see every company ranked by fit, open
the actual PDF (served via a short-lived signed URL from a private bucket only this account can
read). Not visible in navigation, and not reachable by URL, for any other account.

## What each account type can't do (by design, not oversight)

- Non-owner accounts never see the Resume Maxing tab, its routes, or the 5 app-owned PDFs — see
  `docs/Case.md`'s "what a non-owner explicitly cannot do" section for what was actually verified.
- The public `/try` checker never writes anything to a database — verified via network inspection
  during development, not just assumed.
- No account can read another account's resume, profile, missions, or skill data — every
  user-owned table is scoped at the database level, not just filtered in the UI.
