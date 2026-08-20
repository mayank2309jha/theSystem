# System.md — How Leveling Works

Everything in THE SYSTEM's rank/scoring machinery lives in two files:
`src/lib/ranks.js` (the E→S rank vocabulary and math) and `src/lib/prep.js` (everything built on
top of it — skill priorities, company readiness, resume alignment). This document explains the
formulas, not just names them.

## The rank ladder

Six ranks, weakest to strongest: **E → D → C → B → A → S**. This single vocabulary is reused for
several different things in the app, and it's worth being precise about which is which:

1. **Hunter Rank** — your overall standing, shown on Home. As of the Level-system redesign
   (2026-08-20), this is **Level-driven, not XP-driven** — see below.
2. **Skill Rank** — a per-skill proficiency label (e.g. "C-Rank DSA"), from the manually-set slider.
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
is what feeds `hunterLevel` above. **Current catalog size: 101 skills, 324 subskills (avg 3.2/skill),
648 todos** — short of the ~10-subskills-per-skill target the catalog was built toward; `dsa` (11)
and `hld` (10) already meet the bar, most others (GraphQL, MySQL, MongoDB, TDD, and more) currently
sit at 1–2. See `docs/CONTEXT.md` for the full list and honest accounting of this gap.

Each subskill's `weight` field exists for a future formula ("derive skill proficiency % from
weighted subskill completion," mirroring how `hunterLevel` derives Level from raw todo count) but
**is not wired to anything yet** — it's inert data right now.

## Skill proficiency (still: a direct 0–100 number, separate from Level)

Every skill *also* has its own proficiency value from 0 to 100 — the manually-set slider on
`SkillDetail`, unrelated to that skill's subskill/todo checklist or to Level. Stored per-user (see
`docs/CONTEXT.md` for the current account-backed (Supabase, `user_skill_levels`) storage detail — the *value* itself is what
matters here, not where it's kept). That number maps onto the same E→S vocabulary by splitting
0–100 into 6 equal bands:

```
band width = 100 / 6 ≈ 16.67

E:  0.00 – 16.67
D: 16.67 – 33.33
C: 33.33 – 50.00
B: 50.00 – 66.67
A: 66.67 – 83.33
S: 83.33 – 100.00
```

`skillRankForLevel(level)` in `ranks.js` does this conversion. Every new account starts every skill
at exactly **10** — solidly inside the E band, by explicit design ("assume I am an E-Ranker in all
skills").

## Required-rank → required-proficiency

To compare "your level" against "what a company needs," a company's required rank has to become a
number too. `requiredProficiencyForRank(rank)` in `prep.js` uses the *lower bound* of that rank's
band — i.e. the minimum proficiency you'd need to legitimately claim that rank:

```
requiredProficiencyForRank(rank) = (rankIndex(rank) / 6) × 100

E → 0%      D → 16.67%   C → 33.33%
B → 50%     A → 66.67%   S → 83.33%
```

## Company readiness (per skill, and overall)

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

This exact function is the shared core behind **all three** resume-scanning flows (public `/try`,
authenticated `/resume`, and Resume Raid's per-resume scan) — see `docs/ResumetoCompany.md` for how
the skill-level map that feeds into it gets built from an uploaded PDF. `companiesRankedByReadiness(skillLevels)`
runs this for all 36 companies and sorts descending.

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
"Where to Focus Next" panel (top 6). Skills already maxed out for every company that lists them are
excluded from this list (there's nothing left to unlock).

## Resume alignment (the static, 5-resume-variant version)

Distinct from company *readiness* (which is about you) — resume alignment
(`resumeAlignmentScore` in `prep.js`) scores how well one of the 5 app-owned resume PDFs fits a
company, using hand-authored per-resume skill weight tables (`src/data/resumeWeights.js`) instead
of a live proficiency number. Owner-only feature; full detail in `docs/ResumetoCompany.md`.

## Where the numbers live in code

| Concept | Function | File |
|---|---|---|
| Level (1-100, drives Hunter Rank badge) | `hunterLevel` | `lib/prep.js` |
| Level → rank progress bar | `getLevelProgress` | `lib/ranks.js` |
| Hunter Rank from XP (legacy, unreachable from current UI) | `getRankForXP`, `getRankProgress` | `lib/ranks.js` |
| Skill level → rank band | `skillRankForLevel` | `lib/ranks.js` |
| Rank → required proficiency | `requiredProficiencyForRank` | `lib/prep.js` |
| Company readiness (one company) | `companyReadinessFromSkillLevels` | `lib/prep.js` |
| Company readiness (ranked, all companies) | `companiesRankedByReadiness` | `lib/prep.js` |
| Unlock curve / milestones | `skillUnlockCurve`, `nextMilestone`, `skillPriorities` | `lib/prep.js` |
| Resume alignment (5 static variants) | `resumeAlignmentScore`, `companiesRankedForResume` | `lib/prep.js` |
