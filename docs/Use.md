# Use.md — Feature Catalog

Everything you can actually do in THE SYSTEM, organized by page. See `docs/Case.md` for narrative
walkthroughs of how these fit together for different kinds of users, and `docs/System.md` for the
math behind the numbers this page mentions.

## Public (no account)

### Resume Compatibility Checker — `/try`
Upload a PDF resume, get **Resume Alignment** scored against all 36 companies (never called
"Readiness" — that word means something skill-based elsewhere in the app), plus **Resume Quality**
(a heuristic read on the resume text itself) and per-company **Confidence** (how much to trust that
company's Alignment number) — three separate, independently disclosed estimates. Entirely in your
browser; nothing is uploaded, nothing is stored — closing the tab discards everything. Meant to be
shared directly (e.g. `https://<your-domain>/try`) with people who don't have an account and might
not want one yet. Two CTA banners (top and after results) link to `/login` for anyone who wants the
full app. A "?" button opens a Methodology panel explaining exactly how each number is computed.

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
  unlocks 12 more companies"), not an assumed universal target. Based on **Proven** skill (checked
  subskill evidence), not the self-assessment slider.
- **Mission Board** — see below.

A "?" button opens a Methodology panel explaining Level and the Hunter Rank badge.

### Company Specific Prep — `/companies`, `/company/:id`
All 36 companies from the real 2025 placement season, searchable and filterable by domain
(SDE/Systems/ML/Fintech/Non-Core). Every company card shows a live "Your readiness" bar (Proven-
based). Each company's detail page shows:
- Required skills with target ranks, your **Proven** rank next to each (evidence-based, from
  checked subskill todos — never the self-assessment slider), linking to that skill's detail page.
- DSA difficulty, plus (if you've set a contest rating on Profile) an estimated Codeforces/CodeChef/
  LeetCode bar and a "clear"/"to go" comparison against your own rating — explicitly labeled an
  estimate derived from the company's existing rank requirement, not a real per-company number.
- Core CS subjects to prepare, and which of the resume's known projects to lead with.
- **Company Skill Matrix** — every required skill's Required rank, whether you've **Claimed** it
  (from Resume Raid), your **Proven** rank, and the Gap between them (None/Small/Moderate/Large),
  plus Best Prepared / Least Prepared summaries. Proving a skill here (via its linked skill page)
  updates your Proven rank everywhere, not just for this company.
- Real interview-round breakdowns where a senior actually reported them (flagged "Unverified prep"
  otherwise, in crimson, rather than presenting a guess as fact).
- A checkable prep-roadmap checklist.
- **Resume Fit** — for non-owner accounts with a resume uploaded on My Resume, a live three-up:
  Resume Alignment / Resume Quality / Confidence, specific to this company. (Owner account instead
  sees "Which Resume to Send" — one of the 5 app resume variants, with the same three-metric
  framing plus a human-written rationale.)
- A "?" button opens a Methodology panel explaining Proven, readiness, and Resume Alignment.

### Skill Maxing — `/skills`, `/skill/:id`
All 101 skills grouped by category (Core CS, Languages, Frontend, Backend, Databases, Distributed
Systems, Systems & OS, Cloud & DevOps, Machine Learning, NLP/LLMs, Data Engineering, Applied
Algorithms, Testing, Security, Specialized, Interview Craft, and more) — things like React, HLD,
LLD, Node, Postgres. Each skill's rank is **Proven** — a weighted average of checked subskill-todo
evidence, the only thing that drives Company Prep and "Where to Focus Next" anywhere in the app.
Each skill:
- Shows its next milestone (which rank, how many companies it unlocks), based on Proven.
- On the detail page, breaks down into **subskills** (e.g. React → React Hooks, React Router), each
  with a checklist of concrete **proof-of-skill todos** — things you must actually be able to do to
  say you know that subskill. Checking these off is what advances Proven for that skill *and* your
  overall **Level** (see Home).
- Also has a **Self-Assessment** slider (0–100) — a personal gut-check, separate from Proven.
  Dragging it never changes Proven, Company Prep, "Where to Focus Next," or Resume Alignment
  anywhere in the app; it's shown purely for your own reflection.
- Has its own progress chart (Proven-based) against the same even-pace-to-Level-100 reference line
  (a single "today" point, not a full trail — only the aggregate Level history on Home tracks
  day-by-day).
- A full breakdown of every company that needs it, grouped by the rank they require — so you can
  see, e.g., that C-Rank already covers most of the list and only one or two companies need A-Rank.
- A "?" button opens a Methodology panel with the exact Proven formula.

**Known gap:** subskill depth varies a lot by skill right now — `dsa` and `hld` have 10+ subskills
each, but many others (GraphQL, MySQL, MongoDB, TDD, and more) currently have only 1–2. See
`docs/CONTEXT.md` for the full list; this is an acknowledged shortfall against the original spec,
not a hidden one.

### Resume Raid — `/resume-raid`
A collapsible "What is Resume Raid?" intro explains the concept up front (starts collapsed). Upload
every resume you have — different variants, old drafts, all of them (no limit, unlike My Resume's
single slot). The app scans every one of them for mentioned projects, coursework, and technologies,
unions the results across all your resumes (same keyword-detection engine as the Resume
Compatibility Checker), and shows every skill you've **Claimed** on paper, grouped by category —
each with a **Proven** rank pill right next to it (an "Unverified" tag if Proven is still 0). Claimed
is not Proven — mentioning a skill on a resume isn't proof you actually know it. An **Actual Skill
vs. Unverified Claims** summary bar shows what fraction of claimed skills have any Proven evidence
at all — updates live as you check subskill todos. For each claimed skill: a "Test My Strength" link
straight into that skill's subskill checklist to make it genuinely Proven, and a "Start Tracking"
button that seeds the self-assessment slider at a baseline level. This is a second route into prep,
distinct from Skill Maxing's own browse-everything view — it starts from what you've already claimed
rather than the full catalog. A "?" button opens a Methodology panel on Claimed vs. Proven and the
detection method.

### My Resume — `/resume`
Upload your own resume privately (PDF, 5MB max). Stored in your own account only — no other user,
including the app owner, can read it through the app or its database (enforced server-side via Row
Level Security, not just hidden in the UI). Once uploaded:
- Replace or delete it any time.
- See **Resume Quality** (once, for the resume itself) and a **Resume Alignment** table for all 36
  companies with a per-company **Confidence** column — the same three-metric framing as `/try`,
  computed from your actual stored resume, re-scored fresh each visit. A "?" button explains all
  three.

### Mission Board (on Home)
Your personal job-application tracker — distinct from the reference company database. Add a
mission when you actually apply somewhere: company, role, type (Application/OA/Technical
Interview/HR Interview/Offer), difficulty (E–S), deadline, notes. Move it through
Queued → In Progress → Cleared/Failed. Clearing a mission awards XP (once per mission), shown as its
own "Total XP" stat — XP no longer drives your Level or Hunter Rank badge (that's subskill-todo
completion now, see Skill Maxing above and `docs/System.md`). Starts empty for every new account by
design.

### Profile — `/profile`
Edit your display name. See your email. Log out. Also: **Contest Rating** (DSA Track) — pick one
platform (Codeforces/CodeChef/LeetCode) and self-report your current rating; it's what powers the
estimated-rating comparison on each company's "DSA Level Required" section. Optional, self-reported,
update it yourself whenever it changes.

## Owner-only (one specific account)

### Resume Maxing — `/resumes`, `/resume/:slug`
Compares the 5 app-owned resume variants (SDE, SDE+Algo, Backend, ML, Non-Core Companies) against
all 36 companies by estimated Resume Alignment (Engine A — hand-authored per-resume skill weights,
more precise than keyword detection since these 5 documents are known and read in full). Pick a
resume, see every company ranked by fit, open the actual PDF (served via a short-lived signed URL
from a private bucket only this account can read). Not visible in navigation, and not reachable by
URL, for any other account.

## What each account type can't do (by design, not oversight)

- Non-owner accounts never see the Resume Maxing tab, its routes, or the 5 app-owned PDFs — see
  `docs/Case.md`'s "what a non-owner explicitly cannot do" section for what was actually verified.
- The public `/try` checker never writes anything to a database — verified via network inspection
  during development, not just assumed.
- No account can read another account's resume, profile, missions, or skill data — every
  user-owned table is scoped at the database level, not just filtered in the UI.
