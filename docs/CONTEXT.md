# CONTEXT.md — Session/State Recovery Document

**Purpose of this file:** if a future Claude session (or a different assistant, or you yourself
months from now) opens this repo with zero memory of how it got here, this document should be
enough to reconstruct the full picture — what exists, why it's built this way, what's still
missing, and what NOT to redo or re-litigate. Read this before `README.md` if you're trying to
understand *history and intent*, not just current architecture (`README.md` is the architecture
snapshot; this is the decision log).

Written: 2026-08-20 (project started 2026-08-19).

---

## What this project is

"THE SYSTEM" — a Solo Leveling-themed placement-prep tracker, originally built for one person
(Mayank Jha, M.Tech CSE, IIT Bombay) and then evolved into a multi-user web app so classmates can
use it too. Real 2025 IIT Bombay placement data (36 companies, real interview reports from placed
seniors) plus 5 of Mayank's own tailored resume variants form the static knowledge base. On top of
that sits a personal tracker: rank/XP, skill proficiency, mission board (job applications), and a
resume-to-company compatibility checker.

## How this project was built (chronological narrative)

1. **Single-user React app, no backend.** Vite + React 19 + Tailwind v4 + React Router. All state
   in `localStorage`. Home/Company Specific Prep/Skill Maxing/Resume Maxing/Mission Board. Data
   authored by reading 5 real resume PDFs and 3 placement-data files (`Company_Placement_Profiles.xlsx`,
   `Placement Stats - Sheet1.pdf`, `2025 Placement stats (Responses).xlsx`) in full.
2. **Color system rework.** User wanted "cool colours," then supplied `colorpalette.jpg` (Regal
   Navy / Deep Crimson / Opulent Gold / Ethereal Ivory / Velvet Obsidian) and asked to reconcile
   the two. Resolved via `AskUserQuestion`: full regal palette, but E→A rank ladder stays cool
   (blue→teal→indigo→violet), gold reserved for S-Rank/CTC/XP, crimson reserved for
   Failed/critical/unverified states. Implemented as CSS custom properties in `src/index.css`
   (documented "COLOR PALETTE" block) — Tailwind's `@theme` just aliases onto those variables, so
   components never hardcode a color.
3. **Docs requested**: `README.md`, `COMPANIES.md` (auto-generated from `src/data/companies.js`
   via `scripts/generate-companies-md.mjs` — **never hand-edit `COMPANIES.md`**, regenerate it),
   `SKILLS.md` (hand-authored resume/project skill audit with proof-of-skill todos).
4. **Massive multi-user migration request** (a 48-section spec pasted by the user). Handled via
   `EnterPlanMode` — researched, asked clarifying questions (Supabase setup path, email
   confirmation), wrote a plan, got approval, then executed in phases:
   - **Phase A (done):** Supabase Auth + Postgres. `supabase/schema.sql` is the canonical DB
     schema — run it in the Supabase SQL Editor, it's idempotent/safe to re-run. `AuthProvider`,
     `ProtectedRoute`, Login/Signup/Profile pages. Missions/skill-levels stayed on
     `localStorage`, but namespaced per `user.id` as an interim measure.
   - **Real bug found & fixed during Phase A testing:** `useLocalStorage`'s state only
     initialized once at mount (before `user.id` resolved from `undefined`), so it silently kept
     reading/writing an `-anon` bucket regardless of who was actually logged in — two accounts on
     the same browser shared skill-level/mission data. Fixed by making the hook re-sync when its
     `key` changes (see `src/hooks/useLocalStorage.js` — the fix has a subtle
     `skipNextWriteRef` guard to avoid a stale-value overwrite race; don't simplify it without
     re-deriving why that guard exists).
   - **Resume privacy incident:** the 5 app-owned resume PDFs were served from `public/resumes/`
     — a Vite static folder with **zero access control**, reachable by anyone with the URL,
     authenticated or not, once the app went multi-user. User caught this ("why is anyone who logs
     in able to see my resume"). Fixed: deleted `public/resumes/`, added a private `app-resumes`
     Storage bucket, gated to the owner account only, enforced via RLS (`supabase/schema.sql`).
   - **Owner-identity redesign:** first pass hardcoded `OWNER_EMAIL` as a literal string in
     `src/lib/owner.js` and in a storage RLS policy. User correctly called this out ("will the
     owner email remain client side, is that not stupid?") — an email in a shipped JS bundle is a
     needless PII leak, even though it grants no actual access (RLS is the real enforcement).
     Redesigned: `profiles.is_owner boolean`, immutable via a client-side update (RLS `WITH CHECK`
     subquery blocks the client from ever flipping it — only a direct SQL Editor command can),
     `isOwner(profile)` now takes the fetched profile row, not the auth user. **No email or user
     ID is hardcoded anywhere in client code for this purpose.** Promotion command lives at the
     bottom of `schema.sql` as a commented-out one-liner.
   - Old test accounts were deleted by the user; they're now testing under a different personal
     account. `OWNER_EMAIL`-style hardcoding must never be reintroduced.
   - **Goal-driven skill framing redesign.** Original skill-gap UI computed each skill's ceiling
     as "the single hardest company's requirement" and showed a red "N ranks short" badge for
     nearly every skill on a fresh E-Rank account — user objected ("don't assume someone has to
     reach A tier in DSA... that depends on their goals"). Redesigned around an "unlock curve":
     `skillUnlockCurve(skillId)` in `src/lib/prep.js` shows how many companies are satisfied at
     each rank cumulatively; `nextMilestone()` surfaces the next rank that actually unlocks more
     companies (not an assumed top-tier target); Home's panel renamed "Where to Focus Next";
     `SkillDetail.jsx` shows the full company breakdown grouped by rank instead of one scary
     ceiling badge. This is a real product-philosophy decision, not just a UI tweak — **do not
     reintroduce a single "you must reach rank X" framing** without re-confirming with the user.
   - Text size: user reported "all text is not visible" — fixed globally via `html { font-size:
     120% }` in `index.css` (Tailwind's utilities are `rem`-based, so this scales everything
     uniformly) rather than editing every className.
   - **Vercel deployment.** Deployed via `vercel` CLI (already authenticated as `mayank2309jha`
     on this machine). Added `vercel.json` SPA rewrite (`/(.*)` → `/index.html`) — without it,
     direct links like `/company/apple` 404 on Vercel's static host. Env vars
     (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) set via `vercel env add` for
     Production+Preview. **Git is entirely the user's own responsibility** — they explicitly said
     "I will do myself," and separately required **no `Co-Authored-By: Claude` trailer ever** on
     commits in this repo. Never run `git commit`/`git push` here; at most, hand them exact
     commands.
   - **GitHub → Vercel auto-deploy connected** (2026-08-20) — `vercel git connect` / the CLI
     link couldn't do this itself (needs a browser-based GitHub App authorization only the user
     can grant); walked them through the dashboard flow. Confirmed working: a deployment
     (`the-system-qotje908r...`) went live automatically after their next `git push`. **Do not
     run `vercel --prod` manually anymore** unless explicitly asked — deploys should come from
     `git push` now.
   - **Resume-to-Company feature, both audiences.** Built one shared scoring core
     (`companyReadinessFromSkillLevels` in `lib/prep.js`, takes any flat `{skillId: 0-100}` map)
     reused by two flows:
     - **Public, no auth** (`/try`): upload any PDF → `pdfjs-dist` extracts text **entirely in
       the browser** → keyword-matched (`src/data/skillKeywords.js`) → scored. Verified zero
       network calls to Supabase during the whole flow. `pdfjs-dist` is **dynamically imported**
       inside `src/lib/extractResumeSkills.js` (not a top-level import) specifically so its
       1MB+ weight doesn't bloat every page load — only fetched when someone actually uses a
       resume-checking feature. Don't change this back to a static import.
     - **Authenticated** (`/resume`, "My Resume" tab, all users not just owner): private
       upload/replace/delete using the `resumes` bucket + `user_resumes` table that were already
       scaffolded in Phase A's schema. Verified with two real accounts that user B has zero
       visibility into user A's resume.
     - A prior deploy attempt (`the-system-l435csdxj...`) got stuck/failed before GitHub
       auto-deploy was wired up — this is almost certainly why the user reported "the resume to
       company alignment checker isn't working": it was never actually live, not a code bug. The
       feature was thoroughly verified working locally before that deploy attempt. Re-verify on
       the live URL once you have a moment; don't assume it's still broken, but don't assume it's
       fixed either — check.

## Current architecture snapshot (as of this writing)

- **Frontend:** React 19 + Vite 8 + Tailwind v4 + React Router v7, `@tanstack/react-query` for
  server state, `@supabase/supabase-js` for auth/db/storage, `pdfjs-dist` (lazy-loaded) for resume
  text extraction.
- **Backend:** Supabase (Postgres + Auth + Storage). No custom server — the frontend talks to
  Supabase directly via the anon key; Row Level Security is the entire security boundary.
- **Hosting:** Vercel, project `mayank2309jhas-projects/the-system`, GitHub-connected
  (`mayank2309jha/theSystem`, branch `main`) for auto-deploy on push.
- **Git:** exists, remote `https://github.com/mayank2309jha/theSystem.git`, branch `main`. The
  user drives all git operations personally — never commit/push on their behalf, and never add a
  Claude co-author trailer in this repo specifically (explicit, repeated instruction).

## What is NOT built yet (don't assume it exists)

- **The Skill → Subskill → Todo proficiency redesign never happened.** An earlier 48-section spec
  called for this (skill proficiency derived from checkable todos, weighted subskills, etc.) and a
  plan was written for it (Phase C), but the user's priorities shifted (privacy fixes, deployment,
  the resume checker, goal-driven framing, then docs) and Phase C was never executed. **Skill
  proficiency today is still a flat, directly-set 0-100 number per skill**
  (`ts-skill-levels-{userId}` in `localStorage`, via the `skillLevels` state in `App.jsx`'s
  `AppRoutes`), not derived from anything. `user_skill_todos` and `user_company_prep` tables exist
  in `schema.sql` (created proactively in Phase A) but have **zero application code reading or
  writing them** — they're reserved for whenever this redesign actually happens. Do not write docs
  or features that assume subskills/todos exist in the UI; they don't yet.
- **Company prep checklists** (the checkboxes on each `CompanyDetail.jsx` page) are still plain
  `localStorage` keyed only by `ts-prep-{companyId}` — **not even namespaced per user**, unlike
  missions/skill-levels. This means on a shared browser, two different accounts currently see and
  edit the *same* checklist state for a given company. This is a real, known gap, flagged to the
  user, not yet fixed as of this writing (they asked to prioritize documentation first). The fix
  is mechanically identical to the missions/skillLevels namespacing already done in `App.jsx` —
  should be quick whenever it's picked up.
- **Progress-over-time graphs** were requested (overall readiness graph on Home, per-skill graphs
  on `SkillDetail`, date range 2026-08-18 to 2026-11-30) but **not yet built** as of this writing.
  Needs: a decision on whether to add real historical snapshotting (a new `skill_snapshots` table,
  upserted once/day on visit) vs. a synthetic ideal-pace-only line; a charting library (none
  installed yet — Recharts is the natural choice); the `dataviz` skill should be consulted before
  writing any chart code, per its own instructions.
- **Email confirmation is disabled** on Supabase Auth (deliberate, for low-friction testing) —
  anyone can sign up with any typed email, no verification. Flagged to the user as a
  now-it's-public consideration; no decision to change it has been made.

## Explicit user preferences/constraints (don't violate these)

- Never add `Co-Authored-By: Claude` (or any Claude co-author) to commits in this repo.
- Never run `git init`/`commit`/`push` yourself here — the user does all git operations. At most,
  give them exact commands.
- Never hardcode the owner's email (or any personal identifier) in client-side code for
  access-control purposes — use the DB-driven `profiles.is_owner` pattern.
- Don't assume a universal "everyone needs top rank" framing anywhere in the UI — company
  requirements vary, and the product philosophy (established via direct correction) is to show
  concrete, achievable next steps, not an intimidating ceiling.
- Don't deploy to Vercel manually via CLI now that GitHub auto-deploy is connected, unless
  explicitly asked — deploys should come from the user's own `git push`.
- The 5 app-owned resumes and any future personal resume uploads must stay strictly private,
  enforced at the RLS/database level, not just hidden in the UI.

## Companion documents

| File | What it covers |
|---|---|
| `README.md` | Current architecture — how the code is organized, how to run it. Read this for *what exists*, not *why*. |
| `COMPANIES.md` | Auto-generated full company database dump. Regenerate via `node scripts/generate-companies-md.mjs`, never hand-edit. |
| `SKILLS.md` | Hand-audited resume/project skill inventory with proof-of-skill todos (written before the multi-user migration; still accurate as a skills reference, unrelated to the not-yet-built subskill/todo *feature*). |
| `Case.md` | Concrete user-journey walkthroughs — what different kinds of users (public visitor, fresh signup, returning hunter, owner) actually see and do. |
| `System.md` | The leveling/ranking/scoring math — hunter rank, skill proficiency bands, company readiness formulas, resume alignment formulas. |
| `Use.md` | Feature-by-feature catalog — what each part of the app does and how to use it. |
| `ResumetoCompany.md` | Deep dive specifically on the two resume-to-company scoring engines (static weight-table for the 5 app-owned resumes vs. keyword-detection for uploaded resumes) and their formulas/limitations. |

## Quick file map (most-likely-to-matter files)

```
supabase/schema.sql          canonical DB schema — RLS policies, is_owner column, storage buckets
src/lib/prep.js              almost all scoring/ranking math lives here
src/lib/ranks.js             E–S rank math (thresholds, bands, gap calculation)
src/lib/owner.js             isOwner(profile) — DB-driven, no hardcoded identity
src/lib/extractResumeSkills.js   pdf.js text extraction (lazy-loaded) + keyword scoring glue
src/data/companies.js        36 companies — static, sourced from real placement data, don't invent entries
src/data/skills.js           23 skills — roadmap/resources content, `level` field unused as of Phase A+ (kept for default seeding only)
src/data/skillKeywords.js    keyword lists the resume checkers match against
src/App.jsx                  all global state lives in AppRoutes; routes wired here
src/context/AuthProvider.jsx + useAuth.js + AuthContext.js   split across 3 files specifically to satisfy a react-refresh lint rule
```
