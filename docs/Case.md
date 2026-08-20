# Case.md — How Different People Actually Use THE SYSTEM

Concrete walkthroughs of who uses this app and what they see, from first landing to habitual use.
Four kinds of visitor exist: an anonymous stranger, a freshly-signed-up hunter, a returning hunter,
and the app owner (one specific account). Each sees a meaningfully different app.

---

## Case 1 — A classmate who's never heard of this app, shared a `/try` link

**Entry point:** someone pastes `https://<your-domain>/try` in a group chat.

1. Page loads instantly — no login wall, no redirect. Header reads "Resume Compatibility Checker"
   with a one-line promise: *"Nothing is uploaded anywhere — your PDF is read entirely in your
   browser and never leaves this tab."*
2. A CTA banner sits right at the top: *"Enjoying this? Try the full app with multiple cool
   features like this."* — clickable immediately, before they've done anything, linking to
   `/login`.
3. They drag their own resume PDF onto the dropzone (or click to browse). Client-side validation:
   PDF only, 5MB max.
4. `pdf.js` downloads (only now — first time this visitor has triggered any resume-checking code)
   and extracts the raw text from their PDF, entirely in their browser.
5. That text is matched against ~20 keyword lists (one per skill) and turned into a rough
   0–100 proficiency estimate per skill.
6. Every one of the 36 companies gets a readiness score from that estimate, and a full ranked
   table appears — company, domain, readiness %, base, CTC — sorted best-fit first.
7. A second CTA banner appears below the results, same message, same link.
8. **What never happens:** no Supabase request fires at any point in this entire flow — verifiable
   in the browser's Network tab. Nothing about this visitor or their resume is stored anywhere.
   If they close the tab, it's gone.
9. If they click the CTA, they land on `/login`, see a "New hunter? Awaken your account" link, and
   can sign up from there — which takes them into Case 2.

## Case 2 — A brand-new signup, first five minutes

1. `/signup`: name, email, password (min 6 chars). No email confirmation step — submitting logs
   them in immediately and drops them on Home.
2. **Home, first load:**
   - Status Window shows their chosen name, **LV 1** (of 100), **E-Rank** badge derived from that
     Level, "Rank E → Rank D: 0/17 Lv". A separate "Total XP" stat reads 0 (XP still exists as a
     Mission Board stat but no longer determines the rank badge — see `docs/System.md`).
   - "Missions Cleared," "Active Missions" both read 0 — Mission Board starts genuinely empty by
     design, nothing pre-filled.
   - "Skills Tracked": 101.
   - **Progress Over Time** graph — a single point at Level 1 on today's date, plotted against an
     even-pace-to-Level-100 reference line running 2026-08-18 → 2026-11-30. Fills in day by day from
     here; verified live that a brand-new account genuinely shows Level 1, not some higher seeded
     value.
   - "Nearest Quests (by Placement Day)" — the 6 soonest companies from the real placement
     calendar, same for every user (this part is shared reference data, not personalized).
   - "Where to Focus Next" — up to 6 skills, each showing "Now E-Rank → reach {next rank}: unlocks
     N more companies." Every skill genuinely starts at E-Rank (10%) on its own proficiency slider
     — verified live during development that this is true even for the very first render, not just
     eventually. (This slider is separate from the Level number above — see step 5.)
3. They click around **Company Specific Prep** — full access, 36 companies, searchable/filterable,
   real interview-round writeups where a senior actually reported them (flagged "Unverified prep"
   in a crimson badge otherwise).
4. They click into a company (e.g. Apple): see required skills with rank targets, DSA level, core
   subjects, important projects to lead with — but **not** a "Which Resume to Send" section. Since
   they're not the owner, that section is replaced with: *"Want to see how your own resume stacks
   up against this company? Try the public Resume Compatibility Checker."*
5. **Skill Maxing:** all 101 skills grouped by category, each with a slider they can drag as they
   actually improve (dragging writes to their account immediately — no save button,
   no round trip) *and* a subskill/todo checklist underneath — e.g. clicking into "React" shows
   subskills like "React Hooks," "React Router," each with a handful of concrete "prove you can do
   this" todos. Checking a todo is what actually moves their Level number on Home; dragging the
   slider only affects that one skill's company-readiness scoring.
6. They notice **no "Resume Maxing" tab** in the nav at all — it doesn't render for them. Typing
   `/resumes` directly into the URL bar bounces them straight back to Home.
7. **My Resume** and **Resume Raid** tabs *are* there, though (different from Resume Maxing — see
   Case 4 and Case 4b).

## Case 3 — Same user, a week later, actively prepping

1. Logs back in — session persists, no re-auth needed unless they explicitly logged out.
2. Has been dragging skill sliders as they actually study; some are now C/B-Rank.
3. Home's "Where to Focus Next" list has changed — skills they've maxed for every company that
   needs them quietly drop off the list (replaced with "Covers every company" if viewed directly
   on Skill Maxing); new leverage opportunities surface.
4. Adds a real mission: "Apple — Software Engineer — Online Assessment — Queued." Advances it
   through Queued → In Progress as they go through actual rounds. Marking one "Cleared" awards XP,
   shown as its own Home stat — this is entirely separate from Level/Hunter Rank now (which come
   from subskill-todo completion, not job-application progress) and from skill proficiency (which
   comes from the manual slider). Three independent numbers, three independent meanings.
5. Checks off items on a company's Prep Roadmap checklist — properly isolated per account (like
   every other tracked state in the app), even on a shared browser.
6. Checks off proof-of-skill todos on a couple of skills' subskill checklists — each one nudges
   their Level up by a fraction of a percent (Level = checked todos ÷ 648 total, rounded).

## Case 4 — Uploading a real resume (authenticated, private)

1. Clicks **My Resume** in the nav (visible to every authenticated user, not owner-gated).
2. Empty state: "Upload your resume to get started," same dropzone UI as the public checker.
3. Drops a PDF. Two things happen roughly in parallel: the file is scored locally (instant
   feedback) *and* uploaded to their own private storage slot
   (`resumes/{their-user-id}/resume.pdf` in Supabase Storage, tracked in the `user_resumes` table).
4. Once uploaded, the page shows the filename, size, and upload date, with **Replace** and
   **Delete** actions.
5. Below that: the same ranked-companies-by-readiness table as `/try`, computed from their actual
   stored resume.
6. **Privacy, verified concretely during development:** a second, completely separate test account
   was created and sent to `/resume` — it showed the empty upload state, with zero trace of the
   first account's filename or results anywhere in the page. This isn't a UI-only precaution: the
   Storage bucket's RLS policy means the *database itself* refuses to serve one user's file to
   another user's session, regardless of what the frontend code does or doesn't hide.
7. If they revisit later, the page re-fetches their stored PDF via a short-lived signed URL and
   re-runs the same client-side extraction — nothing about their resume's content is cached
   server-side between visits.

## Case 4b — Resume Raid: turning "what's on my resumes" into a prep list

1. Clicks **Resume Raid** in the nav. Unlike My Resume, there's no single slot — they drop in all
   five of their old resume drafts and variants, one after another.
2. Each upload goes to their own private storage folder (`resumes/{their-user-id}/raid/{id}.pdf` —
   same bucket My Resume uses, just a different subfolder, so no new Storage policy was needed).
3. The moment the resume list changes, the app automatically scans **every** uploaded resume
   (fetching each via a signed URL, extracting text client-side, keyword-matching — the same engine
   `/try` and `/resume` use) and **unions** the results: if any single resume mentions a skill, it
   counts as claimed, at the highest confidence level detected across all of them.
4. Results render as a **Claimed Skills** grid grouped by category — every skill their resumes
   collectively claim, each with a "Claimed" rank pill.
5. Two actions per skill: **"Test My Strength"** jumps straight to that skill's `/skill/:id` page
   and its subskill checklist — the explicit point being that a resume bullet isn't proof, checking
   real todos is. **"Start Tracking"** seeds that skill's proficiency slider to a baseline (35,
   D-Rank) so it shows up in Skill Maxing and company-readiness scoring going forward.
6. They can remove any resume from the raid at any time; the claimed-skills list re-scans and
   updates automatically.

## Case 5 — The owner account (one specific, DB-flagged account)

Everything from Case 2–4, plus:

1. **"Resume Maxing" tab appears** in the nav — a feature no other account can see or reach.
2. Sees all 5 of the app-owned resume variants (SDE, SDE+Algo, Backend, ML, Non-Core Companies),
   each with a full ranked list of all 36 companies by estimated alignment, and an "Open PDF"
   button that fetches a short-lived signed URL from a bucket only this account's row can read.
3. On every `CompanyDetail` page, sees a "Which Resume to Send" card recommending one specific
   variant with a human-written rationale ("Apple's DSA round is genuinely hard... lead with the
   DSA-forward resume") plus that resume's estimated alignment score for this specific company.
4. **What determines this isn't a hardcoded email or ID anywhere in the code** — it's a single
   boolean column (`profiles.is_owner`) that only a direct SQL Editor command can set, specifically
   so no personal identifier ever ships in the public JS bundle. See `System.md` and `CONTEXT.md`
   for why this mattered enough to redesign once.

## Case 6 — What a non-owner explicitly cannot do (tested, not assumed)

- Cannot see the "Resume Maxing" nav tab.
- Cannot reach `/resumes` or `/resume/:slug` by typing the URL directly — redirected home.
- Cannot fetch any of the 5 app-owned resume PDFs even by guessing a direct Storage URL — blocked
  server-side by the bucket's RLS policy, independent of the UI.
- Cannot see another user's uploaded resume, profile name, missions, or skill-todo completions —
  every user-owned table is scoped to `auth.uid() = user_id` at the database level.
- Cannot grant themselves owner access by any client-side action — the `profiles.is_owner` column
  has a `WITH CHECK` policy that silently rejects any client update attempting to change it.

## Quick reference: who sees what

| Surface | Anonymous (`/try`) | Any authenticated user | Owner account only |
|---|---|---|---|
| Company Specific Prep | ❌ | ✅ | ✅ |
| Skill Maxing (101 skills, subskills/todos, Level) | ❌ | ✅ | ✅ |
| Progress Over Time graph | ❌ | ✅ (own history) | ✅ (own history) |
| Mission Board | ❌ | ✅ (own data) | ✅ (own data) |
| My Resume (private upload, single slot) | ❌ | ✅ (own resume) | ✅ (own resume) |
| Resume Raid (private upload, multiple) | ❌ | ✅ (own resumes) | ✅ (own resumes) |
| Resume Compatibility Checker | ✅ (own upload, nothing stored) | via My Resume/Raid instead | via My Resume/Raid instead |
| Resume Maxing (5 app resumes) | ❌ | ❌ | ✅ |
