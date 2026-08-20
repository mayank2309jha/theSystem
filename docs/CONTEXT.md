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
   - **GitHub connected + docs written** (`docs/` folder created, README brought current — was
     badly stale, still claiming "no backend" after the whole Supabase migration).
   - **The 101-skill catalog + Resume Raid + Level system + progress graphs** (2026-08-20,
     same day as the above). User explicitly said the existing 23 skills weren't enough options
     for a hunter to master, and asked for ~100+ specific top-level skills (e.g. "React, HLD, LLD,
     Node, Postgres"), each with ~10 subskills on average (e.g. "React Hooks, React Router"),
     each subskill with concrete "prove you know this" todos — sourced first from reading all 5
     resumes, then company requirements, then web research to fill any remaining gap toward 100+.
     - Built `src/data/skills/` as 17 category files (`coreCS.js`, `languages.js`, `frontend.js`,
       `backend.js`, `databases.js`, `distributedSystems.js`, `systemsOS.js`, `cloudDevops.js`,
       `machineLearning.js`, `nlpLLM.js`, `dataEngineering.js`, `appliedAlgorithms.js`,
       `testing.js`, `security.js`, `specialized.js`, `interviewCraft.js`, `additionalDomains.js`),
       aggregated via `skills/index.js`; `src/data/skills.js` is now just a thin re-export so
       every existing `from "../data/skills"` import kept working unchanged.
     - **Known shortfall, not yet closed:** landed at **101 skills but only 324 subskills total
       (avg 3.2/skill, not the ~10 asked for)** — breadth was prioritized over depth in this pass.
       Many skills (GraphQL, MySQL, MongoDB, TDD, most cloud/data-viz entries) currently have only
       1-2 subskills. This was flagged directly to the user rather than silently under-delivered.
       **The highest-value next step is a dedicated pass expanding subskills on the currently-thin
       skills toward the ~10 average** — `dsa` (11) and `hld` (10) already meet the bar and don't
       need more; most others do.
     - Each subskill has `{ id, name, weight, todos: [...] }` — `weight` exists for a future
       subskill-driven proficiency formula (mirrors the original Phase C design) but is **not yet
       wired to anything** — manually-set skill sliders are still what `skillLevels` (and thus
       company readiness) reads.
     - **SkillDetail.jsx redesigned**: the old `roadmap`/`resources` fields are gone from the data
       model entirely (replaced by `subskills`), so the page now renders a checkable subskill/todo
       list instead. Todo-completion state (`subskillTodos`, `{todoId: true}` sparse map keyed
       `"{skillId}:{subskillId}:{todoIndex}"`) lives in `App.jsx`'s global state, namespaced per
       user from the start — learned from the earlier `useLocalStorage` key-reactivity bug.
     - **Power scaling / Level system**: `hunterLevel(subskillTodos)` in `lib/prep.js` — Level
       1-100, where 1 is the floor and 100 = every todo in the whole catalog checked off.
       **Important, non-obvious design correction made mid-session**: the first version derived
       Level from the average of the manually-set skill sliders, which default to 10 (E-Rank
       seed) — that made a brand-new account show "Level 10," contradicting the user's explicit
       "they are level 1 right now." Fixed by driving Level from `subskillTodos` completion count
       instead (a genuinely-earned signal, 0 checked = Level 1) — verified live. If this ever gets
       touched again, do NOT revert to a skill-level-average basis without re-deriving why that's
       wrong. `skillRankForLevel(level)` still applies on top for the E-S rank label — **and this
       means the Hunter Rank badge on Status Window is now Level-driven, not XP-driven.**
       `StatusWindow.jsx` calls `skillRankForLevel(level)`, not `getRankForXP(xp)`; `RankTrack` is
       only ever invoked with the `level` prop now (its `xp` code path in `ranks.js`/`RankTrack.jsx`
       still exists and still works, just currently unreachable from the UI). Mission Board XP still
       accumulates and still displays as its own "Total XP" stat on Home, but no longer determines
       the rank badge or rank-track progress bar — that's a real behavior change from the original
       spec (`docs/System.md` used to document Hunter Rank as purely XP-driven; it's been corrected
       to describe this). Don't "fix" `StatusWindow` back to XP-driven without confirming that's
       actually wanted — the Level system was built specifically to replace XP as the headline
       progress number.
     - **Resume Raid** (`/resume-raid`, all authenticated users): upload *multiple* resumes (new
       `user_raid_resumes` table, no unique-per-user constraint, unlike `user_resumes`'s single
       "My Resume" slot) into the same private `resumes` bucket under `{user_id}/raid/{id}.pdf`
       (no new bucket/storage policy needed — the existing policy already scopes by the caller's
       own top-level folder). Scans all of them with the same keyword-detection engine as `/try`,
       unions results via max-per-skill, and surfaces every "claimed" skill (present in at least
       one resume) with a link into that skill's subskill/todo checklist ("Test My Strength") and
       a "Start Tracking" button that calls `claimSkills()` to seed a baseline slider level.
     - **Progress graphs, authenticated-only by construction** (every route showing one is already
       behind `ProtectedRoute` — no separate gating needed). Hand-rolled inline SVG
       (`ProgressChart.jsx`), not a charting library — pdf.js already added real weight this
       session, a 2-line chart didn't justify another dependency. Home shows real day-by-day
       history (`levelHistory`, one snapshot per calendar day, written via a `useEffect` in
       `App.jsx`) against an even-pace reference line from 2026-08-18 to 2026-11-30. SkillDetail
       shows the same reference line but only a single "today" point — **per-skill historical
       trails are NOT tracked** (only the aggregate `levelHistory` is), a deliberate scope
       trade-off, not an oversight.
     - **Bug fix**: `CompanyDetail.jsx`'s prep-checklist was still plain `useLocalStorage("ts-prep-
       {companyId}")` — not even namespaced per user, unlike missions/skillLevels which had
       already been fixed. Moved into the same global, namespaced pattern
       (`companyPrepChecked`/`toggleCompanyPrepItem` in `App.jsx`'s outlet context). This closes
       the "known issue" flagged in the previous session — don't reintroduce a page-local
       `useLocalStorage` call for anything that needs to be user-isolated; put it in `App.jsx`.

5. **Critical regression found and fixed while updating docs (2026-08-20, later same day).** The
   101-skill catalog restructuring in the entry above silently broke cross-references: `companies.js`
   (23/36 companies, i.e. most of them), `resumeWeights.js` (all 5 resume variants), and
   `skillKeywords.js` referenced 9 flat skill ids that no longer existed after the catalog was
   split/renamed (`system-design`→`hld`, `distributed-systems`→`microservices`, `os`→`os-fundamentals`,
   `data-analysis`→`eda`, `backend-apis`→`rest-api-design`, `dbms-sql`→`sql`, `networks`→`computer-networks`,
   `cloud-infra`→`docker`, `react-frontend`→`react`). Effect: for those 23 companies,
   `getSkill(requiredSkillId)` silently returned `undefined` — the Company Detail page showed a raw
   broken id instead of the skill name and linked to a dead "Unknown skill" page, and that
   requirement could never be satisfied (its skill level was permanently stuck at the `?? 0`
   fallback) — degrading company-readiness scoring app-wide without any visible error or crash. Same
   root cause degraded Resume Maxing (`resumeAlignmentScore`) for the same skills across all 5
   resumes. **Fixed** by remapping the 8-9 stale ids to their closest current-catalog equivalent in
   all three files (verified zero orphaned ids remain via script, `docs/COMPANIES.md`/`docs/Company.md`
   regenerated to match). Separately, `skillKeywords.js` only ever had entries for the original 23
   skills — meaning Resume Raid (built in the same session, same entry above) could only ever detect
   ~21 of the 101 catalog skills from an uploaded resume, no matter what was in it. Extended
   `skillKeywords.js` to cover all 101 skills: the original 21 (renamed per the mapping above, and a
   few narrowed — e.g. `docker`'s old cloud-infra-era keywords like "kubernetes"/"aws"/"terraform"
   were removed now that those each have their own dedicated entry, to avoid one upload inflating
   multiple skills off the same keyword) stay hand-curated; the other ~80 are auto-derived from each
   skill's name + subskill names — a first pass, not hand-tuned, and the next thing worth revisiting
   if Resume Raid's detections look off for a specific skill.
   - **Lesson for next time a skill catalog restructuring happens:** grep every other data file for
     the old flat skill ids before considering the restructuring done — `companies.js` and
     `resumeWeights.js` don't import from `skills.js` in any way that would make a stale reference
     fail loudly (JS objects, no schema/type validation), so this kind of breakage is silent by
     construction. `npm run build`/`npm run lint` passing is not sufficient evidence that
     cross-file id references are intact.

6. **Account-backed persistence + more bug-hunting (2026-08-20, later still).** User asked for a
   search bar on Skill Maxing, an at-a-glance skill readiness view on Company Specific Prep, for
   progress to actually save across devices, a contest-rating-based DSA track, and thoughts on how
   to measure success/progress — mid-turn, while the doc-update/bug-fix work above was still in
   flight.
   - **Search bar** (`SkillMaxing.jsx`): filters by skill name, category, or subskill name.
   - **Company readiness at a glance**: `CompanyCard.jsx` now takes an optional `skillLevels` prop
     and renders a readiness % bar (reuses `companyReadinessFromSkillLevels`, the same function the
     resume checkers use) — shown on both Home's "Nearest Quests" and the full Company Specific Prep
     list, not just after clicking into a company (which already showed the full per-skill breakdown
     and still does).
   - **Persistence migration (the big one)**: skill-proficiency sliders, subskill-todo completions,
     company-prep checklists, missions, and level history all moved from per-user-namespaced
     `localStorage` onto Supabase (`user_skill_levels` [new table], `user_skill_todos`,
     `user_company_prep`, `missions`, `user_level_history` [new table]) — five new hooks
     (`useSkillLevels`, `useSkillTodos`, `useCompanyPrep`, `useMissions`, `useLevelHistory`), same
     `@tanstack/react-query` + Supabase pattern as the pre-existing `useProfile`/`useResume`. Each
     hook does a **one-time migration**: the first time it finds zero DB rows for the current user,
     it reads that user's old localStorage key (if any) and pushes it up once, so nobody's existing
     progress silently vanishes on upgrade. `App.jsx`'s `AppRoutes` no longer touches
     `useLocalStorage` at all for this state — `useLocalStorage.js` itself is kept only as the
     one-time migration read source inside these hooks.
     - **Real bug caught during this work, not by inspection — by actually testing it**: the first
       version of `useSkillTodos`'s and `useCompanyPrep`'s toggle mutations decided INSERT-vs-DELETE
       by reading `queryClient.getQueryData(queryKey)` *inside* `mutationFn`. TanStack Query runs
       `onMutate` (the optimistic update) **before** `mutationFn` — so by the time `mutationFn` ran,
       the optimistic flip had already landed in the cache, and reading "current state" there
       actually read the *new*, already-toggled state, causing every toggle to fire the *opposite*
       DB operation (checking a box for the first time fired a DELETE, not an INSERT). This was
       silent — no console error, no crash, `npm run build`/`lint` both passed — and was only caught
       by an actual Playwright test that checked a box, then logged into the same account from a
       **completely separate, zero-localStorage browser context** and confirmed the checkbox
       state actually round-tripped through the database. It didn't, on the first attempt. Fixed by
       capturing `wasChecked` once, at click time (before either `onMutate` or `mutationFn` run),
       and threading that captured value through as a mutation variable instead of letting
       `mutationFn` re-derive it. **Lesson: for any optimistic-update mutation whose server call
       branches on "was this already true," capture that boolean before calling `.mutate()` —
       never let the mutation function re-read cache state to decide its own branch**, and don't
       trust a mutation is correct just because the optimistic UI looks right after one click — a
       single click can look correct optimistically while doing the wrong thing server-side, only
       visible by checking the actual persisted state from a separate session.
     - **`user_skill_levels` and `user_level_history` are BRAND NEW tables** — they exist in
       `supabase/schema.sql` now but **not yet in the live Supabase project**, since there's no tool
       available to run SQL against it directly; only the user can do that (Supabase Dashboard → SQL
       Editor → paste the whole file → Run — it's idempotent-ish, safe to re-run). Verified via
       Playwright that hitting these missing tables fails as a clean 404 from PostgREST (React Query
       swallows it, UI falls back to catalog defaults — no crash, but silent non-persistence) — so
       **skill-slider values and the Level/progress graph history will NOT actually persist across
       devices until the user re-runs the updated schema.sql.** `user_skill_todos`/`user_company_prep`
       already existed from Phase A and were verified working end-to-end (see bug above) without
       needing any new SQL.
   - **Contest ratings (Codeforces/CodeChef/LeetCode) for DSA — built**, after asking the user which
     approach they wanted for the two genuinely open questions (via `AskUserQuestion`, not assumed):
     required-rating-per-company derived from each company's existing real `dsaLevel` (not invented
     from nothing), and the user's own rating self-reported/manually entered on Profile (not
     live-fetched from a platform API — simpler, no CORS/API-stability risk).
     - `src/lib/contestRatings.js` (new): `CONTEST_PLATFORMS` maps each platform's own
       publicly-documented rating tiers (Codeforces's Newbie/Pupil/Specialist/Expert/Candidate
       Master+ titles, CodeChef's/LeetCode's star-ish bands) onto the E-S rank ladder, so a
       company's existing `dsaLevel: "A"` now also reads as "~1900+ Codeforces" — explicitly labeled
       an *estimate derived from the rank data*, not a real per-company survey number, everywhere
       it's shown (Profile's form copy, and implicitly via the "Est." prefix on CompanyDetail).
     - `profiles` gained `contest_platform`/`contest_rating` columns (nullable, self-reported) —
       **another schema.sql re-run needed**, added via `alter table ... add column if not exists` so
       re-running the file is still safe even though the table already exists live.
     - Profile page: platform dropdown + rating number input, saved via a new
       `updateContestRating` mutation on `useProfile`. CompanyDetail's "DSA Level Required" now shows
       the derived rating threshold next to the existing rank pill, plus a "+N clear"/"N to go"
       comparison once the user has set their own rating — or a link to go set it if they haven't.
     - Verified via Playwright that this degrades gracefully (no crash, a clear inline error
       instead) when the new columns don't exist yet — i.e. before the user re-runs schema.sql —
       consistent with how `user_skill_levels`/`user_level_history` degrade above.
   - **"How should this app measure success/progress" — a question, not a feature, answered in
     conversation, not built.** Worth a future session re-reading that answer if it turns into a
     concrete feature request.

7. **Dark/light mode toggle (2026-08-20, same day, after the persistence work above).** User hit
   the expected "columns don't exist yet" error trying to save a contest rating (confirms they
   haven't re-run `schema.sql` yet — not a new bug), and separately asked for a theme toggle.
   - Found while investigating: this app's ~25 component/page files use Tailwind's **built-in**
     gray scale directly (`text-white`, `text-slate-100` through `-600`, `border-slate-600`) in
     hundreds of places, NOT the `--sl-*`/`--color-system-*` theme tokens the top of `index.css`
     documents as "every color in the app." Rewriting all of that to semantic tokens was judged too
     large/risky just to add theming (would touch essentially every file). **Decision**: keep dark
     mode's existing values as the unconditional `:root` default (zero risk of regressing the
     current look), add a full second palette under `:root[data-theme="light"]`, and additionally
     override the specific hardcoded Tailwind classes actually used in this codebase
     (`.text-white`, `.text-slate-100`..`.text-slate-600`, `.border-slate-600`,
     `.placeholder\:text-slate-600::placeholder`) under `[data-theme="light"]` with higher-specificity
     selectors. **If a new hardcoded `text-slate-N`/`text-white`/etc. class shows up anywhere in the
     app later, it needs its own override added in this same block in `index.css` or it will stay
     dark-colored (illegible) in light mode** — there's a comment marking exactly where.
   - Light palette isn't a mechanical inversion — the rank-ladder hues especially needed deepening
     (e.g. the dark-mode C-Rank teal `#3fc7dc` is far too light to read on white, deepened to
     `#0e8098`) since what worked as light-text-on-navy needs real contrast against white instead.
     Verified visually via Playwright screenshots of Home/SkillDetail/CompanyDetail/SkillMaxing/
     Profile in light mode before considering this done, not just "does it compile."
   - `.system-glow-text`/`.rank-glow-*`/`.system-panel`'s box-shadow "glow" effects are dialed back
     to ordinary soft shadows under light mode — a colored glow around dark ink on white reads as a
     blur/halo, not a glow; it's a dark-mode-specific effect.
   - `index.html` has a **blocking inline script** (before `<script type="module">`) that reads
     `localStorage["ts-theme"]` (falling back to `prefers-color-scheme`) and sets `data-theme` on
     `<html>` before first paint — without this there'd be a flash of the wrong theme on every load.
     `src/hooks/useTheme.js` mirrors the same logic for the toggle button and must be kept in sync
     with that inline script if either changes.
   - Theme choice lives in **localStorage, unnamespaced by user** — deliberately, since it's a
     device/browser display preference, not account data (consistent with how most apps treat
     light/dark mode; doesn't need the Supabase persistence treatment the data in item 6 above got).
   - **Real bug caught by screenshot-testing, not by inspection**: the first version rendered
     `<ThemeToggle />` as a single `fixed top-3 right-3` element at the top of `AppRoutes`, meant to
     cover every route including the ones outside `<Layout>`. On authenticated pages this silently
     overlapped `Layout.jsx`'s existing "Log Out" link in the same corner (visible in a screenshot as
     "LOG O" with the toggle button covering the rest). Fixed by giving `ThemeToggle` two render
     modes — `variant="inline"` (a plain button, used inside `Layout.jsx`'s header row next to Log
     Out) and the default `variant="fixed"` (used standalone on `Login`/`Signup`/`Try`, the three
     routes with no shared header to attach to). **Don't go back to one global fixed instance
     covering every route** — the pages with a real header need the inline variant specifically to
     avoid this exact overlap.

8. **`schema.sql` re-run failure (2026-08-20, same day): `ERROR 42703: column "is_owner" does not
   exist`.** Root cause: `create table if not exists public.profiles (...)` is a full no-op when the
   table already exists (it does, since Phase A) — it does NOT retroactively add columns that are
   only present in the CREATE TABLE text, even `is_owner`, which had been part of that inline
   definition since long before this session. The later `create policy "profiles_update_own"`
   statement references `is_owner` directly, and since nothing had explicitly `alter table add
   column`'d it onto the real, already-existing table, that reference failed. This was the exact
   same class of bug as the `contest_platform`/`contest_rating` safety net added earlier the same
   day — I added that net for the two NEW columns but didn't realize `is_owner` needed the identical
   treatment, since it read as "already existing" rather than "a column whose presence in a live
   table isn't actually guaranteed by this file." **Fixed**: `alter table public.profiles add
   column if not exists is_owner boolean not null default false;` added alongside the other two.
   **Lesson, stated plainly for next time this file is touched**: in this file specifically, a
   column only actually gets added to a live database via an explicit `alter table ... add column
   if not exists` line — never by editing the inline `create table if not exists` column list alone,
   no matter how "obviously already there" that column seems. Every column in `profiles` past the
   original `id`/`email`/`name`/`created_at`/`updated_at` needs one of these lines or a future
   session will hit this same error class again.

9. **CLAIMED / PROVEN / RELEVANT model (2026-08-20, a later session, in progress).** The user sent a large,
   detailed spec asking THE SYSTEM to become a transparent, evidence-based placement-intelligence system —
   distinguishing what a resume CLAIMS, what's actually PROVEN (evidence-based), and what a company finds
   RELEVANT, never collapsed into one ambiguous number, with a per-page Methodology panel explaining every
   computed value. The spec explicitly asked for an inspect-then-plan-then-wait workflow (matching
   `EnterPlanMode`/`ExitPlanMode`), so that's what happened: full repo inspection, a written 6-phase plan
   (`/Users/mayankjha/.claude/plans/shimmering-yawning-journal.md`), one `AskUserQuestion` on the single
   consequential fork (see below), explicit approval, then execution. **Phases 1-5 are done and verified as
   of this entry; only Phase 6 (deep skill-catalogue expansion for the owner's highest-priority skills)
   remains** — flagged in the plan itself as a large content-authoring effort needing its own dedicated
   pass, not an architecture task like the rest. See the plan file for its exact scope.
   - **The one real architectural fork, asked directly rather than assumed**: the manual 0-100 skill slider
     (`skillLevels`/`useSkillLevels`) used to drive Company Prep readiness, "Where to Focus Next," and every
     company-facing skill number. The spec's own Company Skill Matrix example shows only
     Required/Claimed/Proven/Gap — no slider — and explicitly says to prefer evidence-based progression over
     self-reported percentages. **Confirmed direction: PROVEN (see below) replaces the slider for ALL
     scoring; the slider stays visible on SkillDetail, relabeled "Self-Assessment," fully decoupled — it no
     longer feeds anything company-facing anywhere in the app.** If this ever gets touched again, do not
     quietly restore the slider to any scoring path without re-confirming — this was a deliberate, asked-for
     product decision, not an oversight.
   - **PROVEN, finally wiring the long-inert subskill `weight` field**: `provenSkillLevel(skill,
     subskillTodos)` / `provenSkillLevels(subskillTodos)` in `lib/prep.js` — a weighted average of each
     subskill's todo-completion fraction, weighted by that subskill's `weight` (1-3, authored back when the
     101-skill catalog was built, unused until now). A skill with zero subskills scores 0, not undefined —
     an honest "no evidence mechanism yet" rather than a hidden default. `App.jsx` computes this once
     (memoized off `subskillTodos`) and threads it through `outletContext` as `provenLevels`, alongside the
     now-inert-for-scoring `skillLevels`. Every consumer that used to read `skillLevels` for a company-facing
     number now reads `provenLevels` instead: `CompanyCard.jsx`, `CompanyDetail.jsx`'s
     `companySkillReadiness`, `Home.jsx`/`SkillMaxing.jsx`'s `skillPriorities`/`nextMilestone`,
     `SkillDetail.jsx`'s rank badge and milestone messaging. Verified live: dragging the Self-Assessment
     slider to 80 does NOT move Company Prep numbers; checking subskill todos does.
   - **Cross-file identifier validator, closing a gap the spec explicitly called out**: `npm run lint` is now
     `oxlint && node scripts/validate-skill-ids.mjs`. The new script asserts every `companies.js`
     required-skill id exists in the catalog, every `resumeWeights.js`/`FLAT_WEIGHT_SKILLS` key exists in
     the catalog, and every catalog skill has a `skillKeywords.js` entry — exactly the class of silent
     breakage found and fixed earlier this session (23/36 companies). Verified it actually catches a real
     break: temporarily renamed a required skill id in `companies.js`, confirmed the script printed the
     mismatch and lint exited non-zero, then reverted and confirmed clean again.
   - **Resume Alignment, replacing "Readiness" in every resume-facing context** — the spec was specific that
     "Company Readiness" must never describe resume matching, since it's a different question ("do I have
     the skill" vs "does this resume claim the skill"). `CompanyReadinessTable.jsx` → renamed
     `ResumeAlignmentTable.jsx` (only ever used by `Try.jsx`/`Resume.jsx`, confirmed via grep before
     renaming — safe, no shared usage with the slider-based `CompanyCard.jsx` badge, which correctly keeps
     "readiness" language since that's the skill-based Company Prep concept the spec says IS fine to keep).
     The underlying generic function `companiesRankedByReadiness`/`companyReadinessFromSkillLevels` in
     `lib/prep.js` was NOT renamed — it's a legitimately generic "score any skill-level map against a
     company" utility, reused for Company Prep (fed Proven), Resume Alignment (fed Claimed/resume-detected),
     and the non-owner "Resume Fit" panel on `CompanyDetail.jsx` alike; only what it's FED and what the UI
     CALLS the result changed.
   - **Resume Quality** (`lib/resumeQuality.js`, new) and **Confidence** (`lib/confidence.js`, new) —
     genuinely new metrics, not previously present in any form. Both heuristic, client-side, zero backend
     calls (same philosophy as the rest of the resume-checking pipeline). Quality scores the resume TEXT
     itself (quantified-impact density, action-verb usage, section coverage, length, low redundancy) —
     **known, disclosed limitation: pdf.js text extraction doesn't preserve bullet/line boundaries** (a
     page's text items get flattened into one string), so every signal is density-based (per 100 words),
     not "fraction of bullets that do X" — documented in the file's own header comment and in the
     Methodology panel, not hidden. Confidence scores how much the app should trust its OWN Alignment number
     for one resume+company pair (extraction quality, requirement coverage, whether the company's data is
     `verified: true/false`) — explicitly NOT a claim about the candidate, and explicitly independent of
     Alignment (a resume can score 89% Alignment and 54% Confidence at the same time, on purpose).
     `extractResumeSkills.js` gained `analyzeResumeFile`/`analyzeResumeUrl` (return `{text, skillLevels}`
     together) alongside the pre-existing `detectSkillLevelsFromPdfFile`/`Url` (skill levels only, kept
     unchanged so Resume Raid's existing call sites didn't need to change).
     - Wired into `Try.jsx` and `Resume.jsx` (Quality shown once per resume; Confidence shown per company as
       an extra table column) and, additively, into `CompanyDetail.jsx`'s "Resume Fit" section for
       non-owner accounts with their own uploaded resume (three-up: Alignment/Quality/Confidence, live,
       React-Query-cached per resume so it's not re-parsed on every company page visit) — as well as the
       owner-only "Which Resume to Send" section, which keeps Engine A's hand-authored `resumeAlignmentScore`
       for Alignment specifically but gains the same Quality/Confidence framing for consistency. Verified
       live with a synthetic test PDF: the same resume showed identical Alignment (66%) on both `/try`'s
       36-company table and `CompanyDetail`'s Apple-specific panel — the shared core function actually is
       shared, not silently diverged.
   - **Methodology panel system** — `src/data/methodology.js` (per-page-key content: a short hover string
     plus structured panel sections), `MethodologyButton.jsx` (fixed bottom-right — deliberately the
     opposite corner from `ThemeToggle`'s fixed variant, so the two floating buttons never fight for the
     same corner the way `ThemeToggle` once collided with Layout's Log Out link) + `MethodologyPanel.jsx`
     (slide-up, closes on backdrop/✕/Escape). Wired onto Home, Company Prep, Company Detail, Skill Maxing,
     Skill Detail, Resume Raid, My Resume, and `/try`. Content is grounded in the ACTUAL current formulas
     (written by re-reading the just-built `provenSkillLevel`/`scoreResumeQuality`/`scoreConfidence` source,
     not from the spec's aspirational description) — if any of those formulas change later, update
     `methodology.js` in the same change, or the panel starts lying about how the app actually works.
   - **Resume Raid, Phase 4 — Claimed vs. Proven, done.** Collapsible "What is Resume Raid?" intro block
     (starts collapsed). The scan/union logic (per-resume keyword detection, `Math.max` union across all
     raid resumes) was pulled out of `ResumeRaid.jsx` into `src/hooks/useClaimedSkills.js` — needed by
     `CompanyDetail.jsx`'s Company Skill Matrix too (Phase 5), so it couldn't stay page-local. Each claimed
     skill now shows a second **Proven** rank pill next to its **Claimed** one (from Phase 1's
     `provenLevels`), plus an "Unverified" tag when Proven is still 0. New **Actual Skill vs. Unverified
     Claims** summary bar: `demonstrated = claimed skills where provenLevels[id] > 0` (at least one
     checked subskill todo — a binary bar, not an arbitrary percentage threshold, matching the spec's own
     worked example shape), `Actual Skill % = demonstrated / totalClaimed × 100`. Verified live: checking
     one subskill todo on a claimed skill moved the summary bar from 0% to a nonzero value on next visit
     to `/resume-raid`, no reload needed (React Query cache + `outletContext`'s `provenLevels` both update
     reactively).
   - **Company Skill Matrix, Phase 5 — done.** `src/components/CompanySkillMatrix.jsx`, wired into
     `CompanyDetail.jsx` as an additive full-width panel between the existing skill-requirement/resume-fit
     grid and the interview-rounds/prep-roadmap grid (doesn't replace anything). Table: Skill / Required /
     Claimed (Yes-No, from `useClaimedSkills`) / Proven (rank, from `provenLevels`) / Gap (`None` if
     Proven meets or exceeds Required, else `Small`/`Moderate`/`Large` scaled by rank-index difference —
     a judgment-call bucketing, not from the spec, documented as such in the component's own comment).
     Best/Least Prepared summaries are just this same row set filtered and sorted by margin
     (`rankIndex(provenRank) - rankIndex(requiredRank)`), not a separate formula. Verified live with a
     synthetic resume against Apple: `resume-storytelling` (empty keyword list, can't be detected from a
     PDF by design) correctly showed Claimed=No while `dsa`/`hld`/`microservices` (all mentioned in the
     synthetic text) showed Claimed=Yes — confirms the matrix reads the real `useClaimedSkills` signal, not
     a stub. Also confirmed the "proving a skill on a company page feeds back into global Proven" spec
     requirement needed zero new plumbing — `provenLevels` was already global (Phase 1), the matrix just
     reads it like everything else does.

10. **Skill catalog → Supabase migration + subskill Mastery tracking (2026-08-21).** Two requests
    back-to-back: a detailed spec for subskill-level Mastery tracking (0-6 scale, confidence, notes,
    architecture ready for future quizzes/question banks/spaced repetition), and — via
    `AskUserQuestion`, not assumed — an explicit, detailed 19-point instruction to migrate the skill
    catalog itself (`src/data/skills/`) into Supabase as the source of truth. Planned via
    `EnterPlanMode` (a genuinely large, two-batch undertaking) before any code changed; plan file:
    `shimmering-yawning-journal.md`. **Two decisions confirmed explicitly, don't relitigate without
    asking again:** (a) Mastery is NEW and SEPARATE from Proven — Proven (0-100, todo-based) keeps
    driving Company Prep/Home exactly as before; Mastery is an additive personal-study layer. (b) The
    catalog migrates to Supabase now, not deferred, with correctness prioritized over speed.
    - **Schema**: `skills`/`subskills` tables (section 8 of `schema.sql`) — **IDs preserved exactly**
      from the static catalog (verified via script beforehand: all 101 skill ids and 324 subskill ids
      are globally unique, safe as Postgres primary keys) specifically because
      `user_skill_todos.todo_id` already references them for real accounts; regenerating IDs would
      have silently orphaned existing progress. `owner_id null` = global/system skill (readable by
      any authenticated user, writable only by the owner account, reusing the exact `profiles.is_owner`
      RLS pattern already used for the `app-resumes` bucket); `owner_id = some user` = that user's own
      future custom skill. `todos` stayed a `jsonb` array column on `subskills` rather than becoming
      its own table — no per-todo state exists beyond the boolean completion already tracked in
      `user_skill_todos`, so normalizing further wasn't justified yet. `weight` was renamed
      `importance_weight` (same 1-3 scale, same meaning, matching the new terminology); two more
      nullable columns (`interview_frequency_weight`, `difficulty_weight`) exist per the spec's
      "optionally have" but are NOT used in any scoring formula yet. Also added `user_subskill_mastery`
      (section 9) — the actual Mastery state, RLS-scoped to `auth.uid() = user_id` like every other
      per-user table. Deliberately did NOT create question-bank/quiz_attempts/notes-search tables —
      explicitly out of scope per the user's own "make the architecture capable, don't build the full
      quiz system now."
    - **A real design tension surfaced and resolved, not glossed over**: `/try` (the public, no-auth
      resume checker) has a previously explicit, tested, documented invariant — zero Supabase network
      calls, verified during its own build. `extractResumeSkills.js` (which `/try` uses) imported the
      static catalog directly; migrating the catalog to Supabase would have silently broken that
      invariant. **Resolution**: `detectSkillLevelsFromPdfFile`/`detectSkillLevelsFromPdfUrl`/
      `analyzeResumeFile`/`analyzeResumeUrl` gained an optional `catalog` parameter defaulting to the
      still-present static import (renamed `staticSkillCatalog` internally for clarity). `Try.jsx`
      calls them with no catalog argument — completely unchanged behavior, zero Supabase dependency
      preserved. Every authenticated caller (`Resume.jsx`, `ResumeRaid.jsx` via `useClaimedSkills`,
      `CompanyDetail.jsx`'s both resume-analysis queries) now passes the Supabase-fetched catalog
      explicitly. **This is the one deliberate, permanent place the static catalog stays a live read
      path — not a bug, not leftover cruft. Don't "clean this up" by removing the static import from
      `extractResumeSkills.js` without re-deriving why `/try` needs it.**
    - **Data-access layer** (the explicit "components shouldn't care where data comes from" ask):
      `src/hooks/useSkillCatalog.js` (new) fetches `skills`+`subskills` from Supabase and reshapes
      them into **exactly** the old static shape (`{id, name, category, why, level, subskills:
      [{id, name, weight, todos}]}`) — this shape compatibility is what let `lib/prep.js`'s actual
      math stay untouched. `lib/prep.js` functions that read the catalog (`getSkill`,
      `provenSkillLevel(s)`, `skillPriorities`, `hunterLevel`) were refactored to accept `catalog` as
      a parameter instead of importing one — mechanical signature changes, zero logic changes.
      `App.jsx` fetches the catalog once (`useSkillCatalog()`) and threads it through
      `outletContext` as `catalog` (+ `catalogLoading`/`catalogError`), alongside `provenLevels` etc.
      Every component that used to `import { skillCatalog } from "../data/skills"` directly
      (`SkillMaxing.jsx`, `Home.jsx`, `ResumeRaid.jsx`, `SkillDetail.jsx`, `CompanyDetail.jsx`,
      `CompanySkillMatrix.jsx`) now reads it off `useOutletContext()` instead — verified via grep
      that zero stale single-argument calls to the refactored functions remained anywhere.
      `useSkillLevels.js`'s `defaultSkillLevels` now also derives from the fetched catalog (passed
      in as a parameter) rather than the static one, and its query is gated on
      `catalog.length > 0` specifically to avoid a race where it'd compute defaults from an empty
      catalog before the fetch resolves.
    - **Graceful degradation, actually verified, not assumed**: the new tables don't exist in the
      live Supabase project yet (schema.sql changes need the user to re-run it, same as every prior
      schema change this project has made). Verified live via Playwright that this produces a clean
      404-then-React-Query-error, not a crash — no page threw. **First pass showed something
      genuinely confusing though**: Skill Maxing's empty-catalog state rendered as `No skill matches
      ""` — indistinguishable from "you searched for something and got zero results." Fixed by
      threading a `catalogError` field through `outletContext` too and giving `SkillMaxing.jsx`/
      `SkillDetail.jsx` an explicit, actionable error message (re-run schema.sql, then the seed
      script) instead of a silent empty state. This is exactly the kind of "looks fine until you
      actually look" gap that's easy to ship if you only check for crashes and not for confusing
      empty/error states — worth remembering as a general lesson, not just here.
    - **Seed script** — `scripts/seed-skills-to-supabase.mjs`, idempotent (`upsert` on `id`), reads
      the static catalog and pushes it into Supabase, then does a post-seed read-back count as a
      sanity check. Needs the **service role key** (not the anon key — the anon key has no write
      access to `skills`/`subskills` by RLS design), added to `.env.example` as
      `SUPABASE_SERVICE_ROLE_KEY` (deliberately NOT `VITE_`-prefixed, so Vite never bundles it into
      client code). Run via `node --env-file=.env.local scripts/seed-skills-to-supabase.mjs` — Node
      25's built-in `--env-file` flag, no new `dotenv` dependency needed. **`src/data/skills/` stays
      in the repo, not deleted** — it's this script's input and `/try`'s permanent read path, not a
      leftover to clean up.
    - **`scripts/validate-skill-ids.mjs`/`generate-companies-md.mjs`/`generate-company-md.mjs` were
      deliberately left unchanged** — they're offline Node scripts with no Supabase credentials at
      lint/build time; their job is sanity-checking the static seed source before it's ever pushed to
      Supabase, not validating the live database. Don't try to make lint depend on live DB access.
    - **Mastery tracking** (`lib/mastery.js`, `hooks/useSubskillMastery.js`, new UI on
      `SkillDetail.jsx`): `masteryScore(skill, masteryBySubskillId)` mirrors `provenSkillLevel`'s
      importance-weight-weighted-average shape but on the 0-6 scale, reading `mastery_level` instead
      of todo-completion — deliberately simple math, `interview_frequency_weight`/`difficulty_weight`
      exist on the schema but aren't factored in, per the explicit "avoid unnecessarily complicated
      mathematics" instruction. `weakAreas()` flags subskills below "Interview Ready" (4/6), with
      `belowTarget`/`highImportance` flags — no quiz-accuracy-based detection (overconfidence
      flagging, frequently-failed topics) since no quiz data exists yet; that's explicitly future
      work. UI: an aggregate "Kafka — 3.1/6" panel + Weak Areas callout, and per-subskill
      mastery_level/confidence_level dropdowns integrated into the existing Subskills checklist
      (not a separate duplicate list) with notes/interview_notes/mistakes fields collapsed by default
      behind a "+ Notes" toggle — free-text fields save on blur, not on every keystroke (a real
      mutation-per-keystroke mistake was caught and fixed before shipping, not after).
    - **Real bug caught by the linter, not by inspection**: the first version called
      `useSubskillMastery()` AFTER `SkillDetail.jsx`'s early `return` for a not-yet-loaded/unknown
      skill — a Rules of Hooks violation (hooks must run in the same order every render). `oxlint`
      caught it immediately (`react-hooks(rules-of-hooks)`); fixed by moving the hook call before
      the early returns. Worth remembering: this class of bug is easy to introduce when adding a new
      hook call to a component that already has early-return guards — always check hook placement
      relative to existing conditionals when editing, not just adding new code cleanly.
    - **STILL REQUIRED before any of this works live**: the user must (1) re-run the full
      `supabase/schema.sql` in their Supabase SQL Editor (adds `skills`/`subskills`/
      `user_subskill_mastery`), then (2) run
      `node --env-file=.env.local scripts/seed-skills-to-supabase.mjs` with a real
      `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` to actually populate the catalog. Neither step can
      be done by Claude — no tool exists to run SQL or hold service-role credentials in this
      environment. Until both are done, every authenticated page shows the graceful "couldn't load
      the skill catalog" message described above, not broken functionality, but also not a working
      app. This is the single most important unblocking step for anyone picking this up next.
      **Resolved 2026-08-21 — see entry 11**: the user added the service-role key and Claude ran the
      seed script directly; this had never actually been run, which was the root cause of a real bug.

11. **Resume Alignment 0% bug fix + SKILL/SUBSKILL/KNOWLEDGE POINT taxonomy + 40-skill PDF ingestion
    (2026-08-21).** Three things landed together.
    - **The bug**: Resume Alignment showed 0% for every company while Confidence stayed non-zero.
      Root cause confirmed by querying Supabase directly: `skills`/`subskills` existed (schema.sql had
      been re-run) but had **zero rows** — the seed script (item 10 above) had never actually been
      run against the live project. `useSkillCatalog()` returned `[]`, so `detectSkillLevelsFromText`
      had no skills to iterate, `skillLevels` came back `{}`, and every `skillLevels[req.id] ?? 0` in
      `companyReadinessFromSkillLevels` fell back to 0 — while Confidence's `dataConfidence`/
      `extractionConfidence` components still computed normally from the resume text and company
      metadata alone, producing exactly the observed 0%-alignment/67%-confidence split. Fixed by
      running `node --env-file=.env.local scripts/seed-skills-to-supabase.mjs` directly (Claude ran
      it, since the service-role key was now in `.env.local`) — confirmed live afterward.
    - **Taxonomy clarification**: a detailed spec introduced a 4-level hierarchy — DOMAIN > SKILL >
      SUBSKILL > KNOWLEDGE POINT — with SUBSKILL as the **sole** atomic mastery-tracking unit (test:
      "3-10 independent interview questions, could be strong at one while weak at a sibling in the
      same skill"). Knowledge points are smaller supporting facts/terms/commands that must NOT get
      independent mastery records. Explicit mandate: audit the existing catalog against this before
      adding more content. **Audit verdict**: spot-checked existing subskills across multiple files —
      all already pass the subskill test (e.g. `node-event-loop`, `spring-data-jpa`,
      `grpc-streaming`); none showed the 3-level-nesting anti-pattern from the user's own bad example.
      No reclassification of the original 324 subskills was needed — they were just missing knowledge
      points, an additive gap, not a structural violation.
    - **Schema**: `subskills.knowledge_points jsonb not null default '[]'::jsonb` — same shape as the
      existing `todos` column, no new table (knowledge points don't get independent identity per the
      spec). `useSkillCatalog.js` and `seed-skills-to-supabase.mjs` both updated to carry it through.
      No new UI surface added — the taxonomy doc explicitly scopes the quiz system that would consume
      these as future work.
    - **PDF ingestion**: two uploaded PDFs ("Skills & Subskills-1"/"-2") contained an independently
      authored, already-taxonomy-clean catalog — **100 skills, 1,341 subskills (after removing 3
      parser-artifact phantom subskills), 5,150 knowledge points**. Extracted via `pdftotext -layout`
      (not page-image reads — the PDFs were 153 and 115 pages, too large to read as images
      economically) plus a custom parser script anchored on the document's own "Preparedness
      target:"/numbered-list structure. Verified the PDF's own structure already matches the user's
      worked example of *correct* taxonomy (skill 100 "Research & Experimental Methodology"'s
      "Problem formulation" subskill correctly holds "research question"/"hypotheses"/"assumptions"
      as knowledge points, not as nested sub-subskills) — confirming the PDFs were the taxonomy-clean
      reference to merge in, not raw material needing restructuring.
    - **Merge policy, confirmed via `AskUserQuestion`**: where a PDF skill clearly overlapped an
      existing skill (e.g. PDF's separate "REST APIs" + "API Design" vs. the existing merged
      `rest-api-design`; "Data Structures" + "Algorithms" vs. `dsa`), fold into the existing skill
      rather than creating an adjacent near-duplicate. Of the 100 PDF skills, **60 merged into an
      existing skill id, 40 became genuinely new skills** — no existing skill/subskill id, name, or
      todo was ever changed or removed. New skills were placed into the existing 17 per-domain
      category files by conceptual fit (no new files created). New skill/subskill ids are
      kebab-case, collision-checked against the full namespace. Generated via a one-off script that
      text-spliced new subskill lines into each target skill's existing `subskills: [...]` array and
      appended new skill blocks — verified via `node --check` on every touched file plus a full
      catalog re-import confirming zero duplicate ids and byte-identical survival of every
      pre-existing id.
    - **A real correctness bug this surfaced, fixed before merging**: `provenSkillLevel` in
      `lib/prep.js` counted a subskill's `weight` toward the denominator even when it had zero todos
      (`progress = 0` but the weight still diluted the average). All ~1,341 new subskills start with
      `todos: []` (the PDFs give knowledge points, not "prove it" tasks — authoring real todos for
      1,341 subskills is separate, larger, deferred work). Left unfixed, merging e.g. 48 new
      empty-todos subskills into `dsa` (11 existing, real completion history) would have crashed that
      skill's Proven score toward 0 — not from lost proof, but from being counted as failing evidence
      that was simply never defined. **Fixed**: subskills with zero todos are now skipped entirely
      (excluded from both `weightedSum` and `weightTotal`), so "no evidence mechanism yet" means
      "doesn't affect the score" rather than "counts as failed." Zero behavior change for any of the
      324 original subskills (all already had real todos).
    - **`skillKeywords.js`** gained entries for all 40 new skills — caught immediately by
      `scripts/validate-skill-ids.mjs` (chained into `npm run lint`) flagging each one as "will never
      be detected from a resume," exactly the check it was built for. One skill
      (`resume-interview-defense`) deliberately kept an empty list — not resume-detectable, same
      pattern as existing interview-craft skills.
    - **Final catalog size: 141 skills, 1,662 subskills, 5,150 knowledge points.**
    - **Resolved same day**: the user ran the `alter table` in the Supabase SQL Editor, confirmed via
      a direct column-existence query; Claude then re-ran the seed script — live counts verified by
      paginated query (a first unpaginated check undercounted knowledge points at 3,359 due to
      PostgREST's default 1000-row page cap, not a real gap): **141 skills, 1,662 subskills, 5,150
      knowledge points, all live.** Re-verified the exact bug mechanism directly: fed a synthetic
      resume through `detectSkillLevelsFromText` against the live catalog and confirmed non-zero
      CLAIMED levels across 12 skills.

12. **Two more fixes from live user feedback on the new catalog (2026-08-21, same day as entry 11).**
    - **Privacy leak**: `CompanyDetail.jsx` rendered an "Important Projects" list — the *owner's own*
      resume project titles (e.g. "Impact of Label Noise on ML Generalization") — completely
      unconditionally on every company page, visible to **any** logged-in user, not gated by
      `isOwner(profile)` at all (only the resume-reveal panel below it was owner-gated). In a
      single-user app this was invisible; in the now-multi-user app it meant any other account could
      see the owner's personal project names just by opening a company page. User caught this from a
      screenshot and asked directly why their own resume projects were being exposed. **Fixed**:
      removed the block entirely (lines were `company.projects.map(...)` reading a static
      `projects: [...]` array per company in `data/companies.js`) — not gated, just deleted, since the
      owner-only "Which Resume to Send" panel already covers the "which resume/project to lead with"
      need for the owner specifically. `company.projects` data itself was left in `companies.js`
      (still read by `scripts/generate-companies-md.mjs` for the owner's own private `COMPANIES.md`
      planning doc, which isn't served to other users).
    - **Redundant skill display, confirmed via `AskUserQuestion`**: the user noticed a company page
      showed "few" skills and asked whether they matched "the skills overall" — investigation showed
      two separate skill displays on the same `CompanyDetail.jsx` page reading the *same* small
      per-company `company.skills` list (a company only requires a handful of the 141 skills, by
      design — not a bug): a plain "Skill Requirement" list (skill name + current→required rank) and
      the richer Company Skill Matrix table (Skill/Required/Claimed/Proven/Gap) further down. Asked
      which mismatch they meant; confirmed they wanted one consistent table, not two different-looking
      displays of the same data. **Fixed**: removed the "Skill Requirement" list entirely — the matrix
      already covers Required and Proven (plus Claimed and Gap, which the list didn't have) and each
      row already links to `/skill/:id`. This orphaned three functions with no other callers, removed
      as dead code rather than left unused: `companySkillReadiness` (`lib/prep.js`), `rankGap`
      (`lib/ranks.js`), and the `skillRankForLevel`/`companySkillReadiness` imports in
      `CompanyDetail.jsx`. Verified live via Playwright screenshot: company page now shows DSA
      Level/Core Subjects/Resume Fit at top, then the single Company Skill Matrix table, then
      Interview Rounds/Prep Roadmap — no crash, no leftover "Important Projects" or duplicate skill
      list.

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

- **RESOLVED 2026-08-21.** The catalog now loads live with the full **141 skills / 1,662 subskills /
  5,150 knowledge points** — `skills`/`subskills` seeded (fixing the Resume Alignment 0% bug), the
  `knowledge_points` column added via the SQL Editor, then re-seeded. All verified live (paginated
  count query, plus a direct re-test of `detectSkillLevelsFromText` against the live catalog
  returning non-zero levels). See entry 11 for the full writeup.
- **ACTION REQUIRED before skill-slider/Level-graph persistence works**: `user_skill_levels` and
  `user_level_history` exist in `supabase/schema.sql` but not yet in the live Supabase project — the
  user needs to re-run the full schema.sql in their Supabase SQL Editor. Until then, those two data
  types silently fall back to local defaults every load (no crash, just no persistence) — see the
  dated entry above. `user_skill_todos`/`user_company_prep`/`missions` already existed and work now.
- **Mastery tracking (0-6, per subskill) is built but has no content yet** — the UI exists
  (`SkillDetail.jsx`'s new panel), but no quiz/question banks, quiz-accuracy tracking, overconfidence
  flagging, or automated spaced-repetition scheduling exist. `next_review`/`last_reviewed`/
  `revision_count` are columns with nowhere writing them automatically yet — manual only, if a user
  sets them at all. Explicitly deferred, not an oversight — see the dated entry above.
- **Custom user-created skills/subskills aren't reachable from the UI yet** — the schema supports
  them (`skills.owner_id`/`subskills` via `skill_id`), but there's no "add a skill" form anywhere.
  RLS is ready for this; the UI isn't.
- **Subskill depth was thin on the original 101 skills; 40 new skills + 1,341 subskills + 5,150
  knowledge points were merged in from a second reference catalog (entry 11)** — 141 skills, 1,662
  subskills total now. The ~1,341 newly added/merged subskills have empty `todos` (no "prove it"
  tasks yet — see `provenSkillLevel`'s fix in entry 11 for why this doesn't dilute Proven scores) and
  populated `knowledgePoints` instead. Writing real todos for them is separate, deferred work.
- **Subskill `weight` is now wired** (Phase 1, done) — `provenSkillLevel` in `lib/prep.js` finally
  reads it. Superseded item, kept here only so a future read of this file doesn't wonder why an
  older note said the opposite.
- **Contest ratings are built but need the same schema.sql re-run** — `profiles.contest_platform`/
  `contest_rating` won't exist in the live DB until then; the Profile page shows a clear inline error
  (not a crash) if you try to save before that.
- **Per-skill historical trails aren't tracked** — only the aggregate `levelHistory` snapshot
  (used by Home's chart) is. SkillDetail's chart shows a single "today" point against the
  reference line, not a real trail, by deliberate scope trade-off.
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
| `SKILLS.md` | Hand-audited resume/project skill inventory with proof-of-skill todos, written before the multi-user migration. The app's own in-app subskill/todo catalog (141 skills, `src/data/skills/`) now covers similar ground at far broader depth (1,662 subskills, though most of the 1,341 added 2026-08-21 carry knowledge points rather than proof-of-skill todos yet) — this file remains the more thorough source for the specific 10 resume projects; not a duplicate to be deleted. |
| `Case.md` | Concrete user-journey walkthroughs — what different kinds of users (public visitor, fresh signup, returning hunter, owner) actually see and do. |
| `System.md` | The leveling/ranking/scoring math — Level, Proven (evidence-based) vs. Self-Assessment (slider), Company Prep readiness, Resume Alignment/Quality/Confidence formulas. |
| `Use.md` | Feature-by-feature catalog — what each part of the app does and how to use it. |
| `ResumetoCompany.md` | Deep dive specifically on the two resume-to-company scoring engines (static weight-table for the 5 app-owned resumes vs. keyword-detection for uploaded resumes), plus Resume Quality and Confidence, and their formulas/limitations. |
| `FutureSuggestions.md` | Deferred product/UI backlog — landing-page decluttering, font contrast, and whatever gets appended later. Recording something there is explicitly NOT authorization to build it. |

## Quick file map (most-likely-to-matter files)

```
supabase/schema.sql          canonical DB schema — RLS policies, is_owner column, storage buckets,
                              skills/subskills/user_subskill_mastery (2026-08-21 migration)
scripts/seed-skills-to-supabase.mjs   one-time idempotent seed, static catalog -> Supabase (new)
src/hooks/useSkillCatalog.js the data-access layer — fetches skills/subskills from Supabase,
                              reshapes into the old static-catalog shape (new)
src/hooks/useSubskillMastery.js   per-user Mastery state (user_subskill_mastery) (new)
src/lib/mastery.js            Mastery formulas (masteryScore, weakAreas) — separate from Proven (new)
src/lib/prep.js              almost all scoring/ranking math — provenSkillLevel(s), company readiness,
                              resume alignment, skill-unlock curves. Catalog-consuming functions
                              (getSkill, provenSkillLevel(s), skillPriorities, hunterLevel) take a
                              `catalog` parameter now instead of importing one directly
src/lib/ranks.js             E–S rank math (thresholds, bands, gap calculation)
src/lib/resumeQuality.js     Resume Quality heuristic scorer
src/lib/confidence.js        Confidence scorer for one resume+company pair
src/lib/contestRatings.js    DSA contest-rating estimate bands per platform
src/lib/owner.js             isOwner(profile) — DB-driven, no hardcoded identity
src/lib/extractResumeSkills.js   pdf.js text extraction (lazy-loaded) + keyword scoring glue;
                              takes an optional `catalog` param defaulting to the static bundle —
                              Try.jsx relies on that default to stay zero-Supabase-calls; every
                              authenticated caller passes the Supabase-fetched catalog explicitly
src/data/companies.js        36 companies — static, sourced from real placement data, don't invent entries
src/data/skills.js           thin re-export of src/data/skills/index.js — NOW the seed source and
                              Try.jsx's permanent read path, not the app's runtime source of truth
                              (that's Supabase as of 2026-08-21 — see supabase/schema.sql's header)
src/data/skills/             17 category files + index.js — content lives here AND in Supabase;
                              re-run the seed script after editing these to keep them in sync
src/data/skillKeywords.js    keyword lists the resume checkers match against
src/data/methodology.js      per-page "how this works" content for MethodologyButton/Panel
scripts/validate-skill-ids.mjs   cross-file skill-id validator, chained into `npm run lint` —
                              validates the static seed source, not the live DB, on purpose
src/App.jsx                  all global state lives in AppRoutes; routes wired here; fetches the
                              skill catalog once (useSkillCatalog) and threads it through
                              outletContext as `catalog`, alongside provenLevels/skillLevels/etc.
src/context/AuthProvider.jsx + useAuth.js + AuthContext.js   split across 3 files specifically to satisfy a react-refresh lint rule
```
