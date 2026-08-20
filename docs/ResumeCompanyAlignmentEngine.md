# ResumeCompanyAlignmentEngine.md — How Resume-to-Company Alignment Checking Works

**This covers the same engine as [`docs/ResumetoCompany.md`](./ResumetoCompany.md)** — that file
already has the full breakdown; this one exists under the name you asked for so it's easy to find.
If you want these consolidated into one file later, say so and I'll merge them.

## The short version

Two separate engines answer "how well does this resume fit this company," sharing one piece of
core math:

1. **Static weight tables** (owner-only "Resume Maxing" feature, 5 known app resumes) — each
   resume's actual skill content was read once and hand-encoded as a 0–1 weight per skill in
   `src/data/resumeWeights.js`. A skill genuinely absent from a resume scores exactly 0, not just
   "low" (e.g. the DSA-forward resume drops Machine Learning entirely, so it scores 0% against
   ML-only companies — by design, not a bug).
2. **Keyword detection** (public `/try` and authenticated "My Resume", any uploaded PDF) — text is
   extracted from the PDF entirely in the browser (`pdfjs-dist`, lazy-loaded), then matched against
   per-skill keyword lists (`src/data/skillKeywords.js`). Distinct keyword hits (not raw
   occurrences) map to a capped proficiency guess: 0 hits→0, 1→35, 2→55, 3→70, 4+→85.

## The shared scoring core

Both engines eventually produce a `{skillId: 0-100}` map, which feeds into
`companyReadinessFromSkillLevels(company, skillLevels)` in `src/lib/prep.js`:

```
importance(requiredRank) = rankIndex(requiredRank) + 1        (E=1 ... S=6)
progress(skill) = min(yourLevel / requiredProficiencyForRank(requiredSkillRank), 1)
readiness = Σ(progress × importance) / Σ(importance) × 100
```

A company demanding a harder rank on a given skill counts for more in the average; exceeding a
requirement never over-counts (capped at "fully satisfied"). `companiesRankedByReadiness()` runs
this across all 36 companies and sorts by score.

## Full detail

See [`docs/System.md`](./System.md) for every formula in the app (not just this engine), and
[`docs/ResumetoCompany.md`](./ResumetoCompany.md) for the complete side-by-side comparison of the
two engines, their limitations, and where to improve detection quality if it's ever underperforming.
