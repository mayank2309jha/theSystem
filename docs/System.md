# System.md — How Leveling Works

Everything in THE SYSTEM's rank/scoring machinery lives in two files:
`src/lib/ranks.js` (the E→S rank vocabulary and math) and `src/lib/prep.js` (everything built on
top of it — skill priorities, company readiness, resume alignment). This document explains the
formulas, not just names them.

## The rank ladder

Six ranks, weakest to strongest: **E → D → C → B → A → S**. This single vocabulary is reused for
three different things in the app, and it's worth being precise about which is which:

1. **Hunter Rank** — your overall standing, shown on Home.
2. **Skill Rank** — a per-skill proficiency label (e.g. "C-Rank DSA").
3. **Requirement Rank** — how hard a company's bar is for a given skill (e.g. "Apple needs A-Rank
   System Design").

(1) and (2) are about *you*; (3) is a fact about a company, independent of anyone's progress.

## Hunter Rank (XP-driven)

Cumulative XP from **cleared missions** on your Mission Board, checked against fixed thresholds
(`RANK_THRESHOLDS` in `src/lib/ranks.js`):

| Rank | XP required |
|---|---|
| E | 0 |
| D | 300 |
| C | 800 |
| B | 1,800 |
| A | 3,500 |
| S | 6,000 |

XP itself comes from a mission's `difficulty` field when you mark it "Cleared" (`DIFFICULTY_XP` in
`src/data/seed.js`):

| Difficulty | XP awarded |
|---|---|
| E | 80 |
| D | 150 |
| C | 250 |
| B | 400 |
| A | 650 |
| S | 1,000 |

XP is only ever awarded once per mission (an `xpAwarded` flag prevents double-counting if you flip
a mission's status back and forth). **This is entirely separate from skill proficiency or company
readiness** — clearing a mission is about your personal job-application pipeline, not a claim about
what you actually know.

## Skill proficiency (currently: a direct 0–100 number)

Every skill has a proficiency value from 0 to 100, stored per-user (see `docs/CONTEXT.md` for the
current localStorage-based storage detail — the *value* itself is what matters here, not where
it's kept). That number maps onto the same E→S vocabulary by splitting 0–100 into 6 equal bands:

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

This exact function is the shared core behind **both** resume-checking flows (public `/try` and
authenticated `/resume`) — see `docs/ResumetoCompany.md` for how the skill-level map that feeds
into it gets built from an uploaded PDF. `companiesRankedByReadiness(skillLevels)` runs this for
all 36 companies and sorts descending.

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

**`skillPriorities(levels)`** ranks all 23 skills by "how many companies does the next milestone
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
| Hunter Rank from XP | `getRankForXP`, `getRankProgress` | `lib/ranks.js` |
| Skill level → rank band | `skillRankForLevel` | `lib/ranks.js` |
| Rank → required proficiency | `requiredProficiencyForRank` | `lib/prep.js` |
| Company readiness (one company) | `companyReadinessFromSkillLevels` | `lib/prep.js` |
| Company readiness (ranked, all companies) | `companiesRankedByReadiness` | `lib/prep.js` |
| Unlock curve / milestones | `skillUnlockCurve`, `nextMilestone`, `skillPriorities` | `lib/prep.js` |
| Resume alignment (5 static variants) | `resumeAlignmentScore`, `companiesRankedForResume` | `lib/prep.js` |
