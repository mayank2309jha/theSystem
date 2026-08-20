# System.md — How Leveling Works

Most of THE SYSTEM's rank/scoring machinery lives in `src/lib/ranks.js` (the E→S rank vocabulary
and math) and `src/lib/prep.js` (skill priorities, Proven evidence, company readiness, resume
alignment). Two newer, smaller files hold the Resume Quality and Confidence scorers specifically:
`src/lib/resumeQuality.js` and `src/lib/confidence.js`. This document explains the formulas, not
just names them — see `docs/CONTEXT.md` for the CLAIMED/PROVEN/RELEVANT redesign this reflects.

## The rank ladder

Six ranks, weakest to strongest: **E → D → C → B → A → S**. This single vocabulary is reused for
several different things in the app, and it's worth being precise about which is which:

1. **Hunter Rank** — your overall standing, shown on Home. As of the Level-system redesign
   (2026-08-20), this is **Level-driven, not XP-driven** — see below.
2. **Skill Rank (Proven)** — a per-skill proficiency label (e.g. "C-Rank DSA"), from **Proven**
   evidence (checked subskill todos) as of the CLAIMED/PROVEN/RELEVANT redesign (2026-08-20, later
   the same day). This used to come from the manually-set slider; the slider still exists but is
   relabeled **Self-Assessment** and no longer feeds this or anything else company-facing — see
   "Proven skill" below for the full story and why that changed.
3. **Requirement Rank** — how hard a company's bar is for a given skill (e.g. "Apple needs A-Rank
   System Design").

(1) and (2) are about *you*; (3) is a fact about a company, independent of anyone's progress.

## Level — the power-scaling system (1–100)

Your overall progress toward S-Rank, divided into 100 discrete levels. Level 1 is the floor — a
brand-new account with zero checked proof-of-skill todos reads as "Level 1," never "Level 0."
Level 100 means every proof-of-skill todo across the entire 101-skill catalog is checked off.

```js
// src/lib/prep.js
TOTAL_TODO_COUNT = Σ todos.length across every subskill across every skill in skillCatalog  (648 currently)

hunterLevel(subskillTodos) {
  checkedCount = number of keys in subskillTodos   // { "skillId:subskillId:todoIndex": true, ... }
  pct = (checkedCount / TOTAL_TODO_COUNT) × 100
  return clamp(round(pct), 1, 100)
}
```

Level is deliberately driven by **todo completion**, not by the manually-set skill sliders — those
default to a non-zero E-Rank seed (10 out of 100), which would make a fresh account misleadingly
read as "Level 10." Checking off a proof-of-skill todo is "doing more skills," which is literally
what should move this number.

**The Hunter Rank badge on Status Window is this same number, relabeled.** `skillRankForLevel(level)`
maps Level onto the E→S vocabulary via the same 6-equal-band split skill proficiency uses (see
below) — so "Level 34" and "C-Rank" are two views of one underlying value, not two systems to
reconcile. `getLevelProgress(level)` (in `ranks.js`) drives the rank-track progress bar the same way
`getRankProgress(xp)` used to.

**What changed from the original design:** Hunter Rank used to be purely XP-driven — cumulative XP
from cleared Mission Board entries against fixed thresholds (`getRankForXP`/`getRankProgress`,
`RANK_THRESHOLDS` in `ranks.js`). That XP-threshold system **still exists in code** (`RankTrack`
still accepts an `xp` prop and can render it), but nothing in the UI calls it that way anymore —
`StatusWindow.jsx` always passes `level`, never `xp`, to `RankTrack`. Mission Board XP still
accumulates from a mission's `difficulty` field when marked "Cleared" (`DIFFICULTY_XP` in
`src/data/seed.js`, awarded once per mission via an `xpAwarded` flag) and still displays as its own
"Total XP" stat on Home — it's just no longer what determines your rank badge. If you're trying to
understand "why does clearing missions not move my rank anymore," this is why: that's the Level
system's job now, driven by subskill-todo completion, not job-application progress.

For reference, the now-inert XP thresholds:

| Rank | XP required |
|---|---|
| E | 0 |
| D | 300 |
| C | 800 |
| B | 1,800 |
| A | 3,500 |
| S | 6,000 |

And mission difficulty → XP:

| Difficulty | XP awarded |
|---|---|
| E | 80 |
| D | 150 |
| C | 250 |
| B | 400 |
| A | 650 |
| S | 1,000 |

## Subskills & proof-of-skill todos

Every skill in the 101-skill catalog (`src/data/skills/`, 17 category files aggregated via
`index.js`) breaks down as **Skill → Subskills → Todos**:

```js
{
  id, name, category, level: 10,   // level = default seed for the proficiency slider, see below
  why,
  subskills: [
    { id, name, weight, todos: ["...", "...", ...] }
  ]
}
```

Checking a todo (`toggleSubskillTodo` in `App.jsx`, todo id format `` `${skillId}:${subskillId}:${todoIndex}` ``)
is what feeds `hunterLevel` above **and**, per skill, `provenSkillLevel` below. **Current catalog
size: 101 skills, 324 subskills (avg 3.2/skill), 648 todos** — short of the ~10-subskills-per-skill
target the catalog was built toward; `dsa` (11) and `hld` (10) already meet the bar, most others
(GraphQL, MySQL, MongoDB, TDD, and more) currently sit at 1–2. See `docs/CONTEXT.md` for the full
list and honest accounting of this gap (Phase 6 of the CLAIMED/PROVEN/RELEVANT plan closes it).

## Proven skill — evidence-based, drives everything company-facing

As of the CLAIMED/PROVEN/RELEVANT redesign (2026-08-20), every skill's 0–100 proficiency for
scoring purposes is **Proven** — `provenSkillLevel(skill, subskillTodos)` in `lib/prep.js`, a
weighted average over that skill's subskills:

```
for each subskill:
  progress = checkedTodos / totalTodos                (0 if the subskill has no todos)
  contributes progress × subskill.weight

provenSkillLevel = Σ(progress × weight) / Σ(weight) × 100     (0 if the skill has no subskills at all)
```

`subskill.weight` (1–3, authored alongside every subskill when the 101-skill catalog was built) had
sat unused until this redesign — this is the formula that finally reads it. `provenSkillLevels(subskillTodos)`
runs this for the whole catalog → `{skillId: 0-100}`, computed once in `App.jsx` (memoized off
`subskillTodos`) and threaded through `outletContext` as `provenLevels`. `skillRankForLevel(level)`
(same 6-equal-band split as everywhere else — see below) turns this into the E→S label shown
everywhere: `CompanyCard`'s readiness badge, `CompanyDetail`'s "Skill Requirement" list, Home's
"Where to Focus Next," and `SkillDetail`'s own rank badge/milestone messaging all read `provenLevels`,
not the slider.

## Self-Assessment (the old manual slider — still exists, no longer scores anything)

Every skill also still has a manually-set 0–100 slider on `SkillDetail`, now explicitly labeled
**Self-Assessment**. It's a personal gut-check only: dragging it updates `skillLevels`
(account-backed, `user_skill_levels` — see `docs/CONTEXT.md`), and nothing else. It does **not**
feed Proven, Company Prep readiness, "Where to Focus Next," or Resume Alignment anywhere in the app
— verified live (dragging it to 80 does not move any company-facing number; checking a subskill
todo does). It still maps onto the same 6-equal-band E→S split for its own display purposes:

```
band width = 100 / 6 ≈ 16.67

E:  0.00 – 16.67
D: 16.67 – 33.33
C: 33.33 – 50.00
B: 50.00 – 66.67
A: 66.67 – 83.33
S: 83.33 – 100.00
```

Every new account starts every skill's slider at **10** (E band) — this default seed is a
holdover from before Proven existed and is cosmetic now; it never contributes to any scoring path.
**If this section is ever touched again: do not reintroduce the slider into any scoring formula
without re-confirming with the user first** — replacing it with Proven was a deliberate, explicitly
asked-for product decision (see `docs/CONTEXT.md`), not an oversight to "fix" back.

## Required-rank → required-proficiency

To compare "your level" against "what a company needs," a company's required rank has to become a
number too. `requiredProficiencyForRank(rank)` in `prep.js` uses the *lower bound* of that rank's
band — i.e. the minimum proficiency you'd need to legitimately claim that rank:

```
requiredProficiencyForRank(rank) = (rankIndex(rank) / 6) × 100

E → 0%      D → 16.67%   C → 33.33%
B → 50%     A → 66.67%   S → 83.33%
```

## Company Prep readiness (per skill, and overall) — fed Proven

For one required skill on one company:

```
progress = requiredProficiency == 0
  ? 1                                                    (E-Rank requirement is always met)
  : min(yourLevel / requiredProficiency, 1)               (capped — exceeding a requirement doesn't over-count)
```

A company usually requires several skills, each with different importance. Importance is derived
directly from the required rank — a company demanding A-Rank System Design should move the needle
more than one demanding D-Rank System Design:

```
importance(requiredRank) = rankIndex(requiredRank) + 1     (E=1, D=2, C=3, B=4, A=5, S=6)
```

Overall readiness for one company (`companyReadinessFromSkillLevels` in `prep.js`) is the
importance-weighted average of every required skill's progress, as a percentage:

```
readiness = Σ(progress × importance) / Σ(importance) × 100
```

`companyReadinessFromSkillLevels(company, levels)` is a **generic function over any `{skillId: 0-100}`
map** — it doesn't know or care where `levels` came from. Two conceptually different things feed it
today, and the app is careful to label the *output* differently depending on which:

- **Company Prep readiness** (`CompanyCard`'s badge, `CompanyDetail`'s "Skill Requirement" list, via
  `companySkillReadiness`) — fed **`provenLevels`**. This is "do I actually have the skill," shown
  as "Readiness," which the CLAIMED/PROVEN/RELEVANT terminology explicitly keeps for this
  skill-based, evidence-driven concept.
- **Resume Alignment** (`/try`, `/resume`, and the non-owner "Resume Fit" panel on `CompanyDetail`,
  via `companiesRankedByReadiness`) — fed **resume-keyword-detected levels** (CLAIMED, not Proven).
  This is "does my resume claim the skill" — a different question, deliberately never called
  "Readiness" in the UI for this path (renamed to "Alignment" during the same redesign — see
  `docs/ResumetoCompany.md`). `companiesRankedByReadiness(skillLevels)` runs the same core function
  for all 36 companies and sorts descending; only what it's fed, and what the UI calls the result,
  differs.

## Goal-driven skill framing ("unlock curve")

Earlier versions of the Home/Skill Maxing pages computed each skill's target as "the single
hardest company's requirement" and displayed a red "N ranks short" warning for nearly every skill
on a fresh account. This was deliberately redesigned — see `docs/CONTEXT.md` for why — around the
idea that different companies want different things, and no one should be told they must reach the
top tier in everything.

**`skillUnlockCurve(skillId)`** groups every company that requires a given skill by the exact rank
they need, then computes a cumulative count: "how many companies are satisfied once you reach rank
R." For example, DSA might show: C-Rank covers 12 companies, B-Rank adds 6 more (18 total), A-Rank
adds 1 more (Apple, 19 total) — making it visually obvious that most of the value is at C/B-Rank,
not that everyone needs A-Rank.

**`nextMilestone(skillId, level)`** finds the next rank above your *current* level that would
actually unlock more companies, and returns how many. This is what drives the "Reach C-Rank →
unlocks 12 more companies" language throughout the app — always a concrete, achievable next step,
never an assumed ceiling.

**`skillPriorities(levels)`** ranks all 101 skills by "how many companies does the next milestone
unlock" — the highest-leverage single next move, goal-agnostic by construction. This powers Home's
"Where to Focus Next" panel (top 6), fed `provenLevels`. Skills already maxed out for every company
that lists them are excluded from this list (there's nothing left to unlock).

## Resume Alignment, Engine A — the static, 5-resume-variant version

Distinct from Company Prep readiness (which is about you, Proven-based) — Resume Alignment for the
5 app-owned resumes (`resumeAlignmentScore` in `prep.js`, owner-only) scores how well one of them
fits a company, using hand-authored per-resume skill weight tables (`src/data/resumeWeights.js`)
instead of a detected proficiency number. Full detail in `docs/ResumetoCompany.md`.

## Resume Quality (new, 2026-08-20) — a property of the resume itself

`scoreResumeQuality(text)` in `lib/resumeQuality.js` — independent of any company, unlike
Alignment. Heuristic, client-side, no AI call. Five dimensions, each 0–100, combined into an overall
score:

```
overall = quantifiedImpact × 0.30
        + actionVerbUsage  × 0.25
        + sectionCoverage  × 0.20
        + length           × 0.15
        + lowRedundancy    × 0.10
```

- **quantifiedImpact** — density of number/%/multiplier patterns per 100 words (regex-based),
  capped at a density of 6-per-100-words = 100 points.
- **actionVerbUsage** — fraction of a ~25-word curated strong-verb list ("built," "designed,"
  "optimized," ...) that appears anywhere in the text.
- **sectionCoverage** — fraction of {Education, Experience/Projects, Skills} headers detected.
- **length** — a healthy band (150–1,400 extracted words) scores highest; too short or too long
  scores down.
- **lowRedundancy** — inverse of a repeated-5-word-phrase ratio (a rough copy-paste/duplication
  proxy).

**Disclosed limitation, not hidden**: pdf.js text extraction (`extractResumeSkills.js`) does not
preserve bullet/line boundaries — a page's text items are joined into one flat string. Every
dimension above is therefore density-based (per 100 words across the whole resume), not "fraction
of bullets that do X." If per-bullet analysis is ever wanted, it needs a change to how
`extractTextFromSource` joins text items first (grouping by y-position) — not done, on purpose, to
avoid risking the already-working skill-keyword detection that shares the same extraction path.

## Confidence (new, 2026-08-20) — how much to trust one Alignment number

`scoreConfidence({ text, skillLevels, company })` in `lib/confidence.js` — per resume+company pair,
NOT a property of the resume alone (unlike Quality) and NOT a claim about the candidate. Average of
three factors, each 0–1:

```
extractionConfidence  = 0.2 if <50 extracted words, 0.6 if <150, else 1
coverageConfidence    = (company's required skills with ANY detected signal) / (total required)
dataConfidence        = 1 if company.verified, else 0.6

confidence = round(((extractionConfidence + coverageConfidence + dataConfidence) / 3) × 100)
```

A high Alignment score does **not** imply high Confidence — they're independent axes by design
(e.g. a resume that barely extracted any text can still coincidentally score well on the few
skills it did detect, and Confidence is what flags that as unreliable). Shown per-company as an
extra column on the Resume Alignment table, and as part of the three-up Alignment/Quality/Confidence
display on `CompanyDetail`'s "Resume Fit" panel.

## Mastery (new, 2026-08-21) — a separate, richer signal from Proven

`user_subskill_mastery` (Supabase, RLS-scoped per user) tracks a **0-6 scale per subskill**,
independent of Proven's todo-completion-based 0-100 and independent of the Self-Assessment slider —
confirmed explicitly as a deliberate, separate signal, not a replacement (see `docs/CONTEXT.md`).

```
0 Not Started       — I have essentially not studied this.
1 Aware             — I recognize the concept and can give a very basic explanation.
2 Basic             — I understand the fundamental idea but cannot reliably implement or defend it.
3 Working Knowledge — I can use it in normal development and explain the major concepts.
4 Interview Ready   — I can answer common interview questions and solve practical problems involving it.
5 Strong            — I can explain internals, trade-offs, failure modes and practical engineering considerations.
6 Advanced          — I can reason deeply about implementation details, edge cases, optimization and design trade-offs.
```

**Parent skill's Mastery score** (`masteryScore` in `lib/mastery.js`) — same shape as
`provenSkillLevel`'s weighted average, just on the 0-6 scale and reading `mastery_level` instead of
todo-completion:

```
masteryScore = Σ(subskill.mastery_level × subskill.importance_weight) / Σ(importance_weight)
```

Rounded to one decimal (e.g. "Kafka — 3.1/6"). A subskill with no row yet counts as `mastery_level =
0`, not excluded — same "never simply learned/not learned" principle Proven already applies, pushed
down one more level, per explicit instruction. `interview_frequency_weight`/`difficulty_weight`
exist on the `subskills` table for future refinement but are **not** factored into this formula yet
— deliberately simple math, per an explicit "avoid unnecessarily complicated mathematics" instruction.

**Weak areas** (`weakAreas` in `lib/mastery.js`) — every subskill scoring below 4 (Interview Ready),
sorted lowest-first, flagged `belowTarget` (below the skill's `preparedness_target`, if one is set)
and `highImportance` (`importance_weight >= 2`). No quiz-accuracy-based detection (overconfidence
flagging, frequently-failed topics) — there's no quiz data yet; that's explicitly future work, not
built here.

Also stored per subskill, not yet used by any formula: `confidence_level` (0-6, a second
self-assessment — how sure you are, separate from how good you actually are — set up for a future
"confidence exceeds demonstrated performance" overconfidence check once quiz data exists), `notes`/
`interview_notes`/`mistakes` (free text), `last_reviewed`/`next_review`/`revision_count` (present so
a future spaced-repetition scheduler has somewhere to read/write — nothing computes them
automatically yet).

## Where the numbers live in code

| Concept | Function | File |
|---|---|---|
| Level (1-100, drives Hunter Rank badge) | `hunterLevel` | `lib/prep.js` |
| Level → rank progress bar | `getLevelProgress` | `lib/ranks.js` |
| Hunter Rank from XP (legacy, unreachable from current UI) | `getRankForXP`, `getRankProgress` | `lib/ranks.js` |
| **Proven skill (one skill, evidence-based)** | `provenSkillLevel` | `lib/prep.js` |
| **Proven skill (whole catalog)** | `provenSkillLevels` | `lib/prep.js` |
| Skill level → rank band (used by both Proven and Self-Assessment) | `skillRankForLevel` | `lib/ranks.js` |
| Rank → required proficiency | `requiredProficiencyForRank` | `lib/prep.js` |
| Generic company readiness (one company, any skill-level map) | `companyReadinessFromSkillLevels` | `lib/prep.js` |
| Generic company readiness (ranked, all companies) | `companiesRankedByReadiness` | `lib/prep.js` |
| Unlock curve / milestones | `skillUnlockCurve`, `nextMilestone`, `skillPriorities` | `lib/prep.js` |
| Resume Alignment, Engine A (5 static variants) | `resumeAlignmentScore`, `companiesRankedForResume` | `lib/prep.js` |
| **Resume Quality** | `scoreResumeQuality` | `lib/resumeQuality.js` |
| **Confidence** | `scoreConfidence` | `lib/confidence.js` |
| **Mastery score (one skill, 0-6)** | `masteryScore` | `lib/mastery.js` |
| **Weak areas (one skill)** | `weakAreas` | `lib/mastery.js` |
| DSA contest-rating estimate | `requiredRatingForRank`, `ratingGap` | `lib/contestRatings.js` |
