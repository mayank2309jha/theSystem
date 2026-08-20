# ResumetoCompany.md — How Resume-to-Company Scoring Actually Works

There are **two separate scoring engines** in this app that both answer "how well does this resume
fit this company," built for two different situations. They share one piece of core math but
differ completely in how they arrive at the input to that math. Conflating them is the easiest way
to misunderstand this system, so this document keeps them clearly apart.

Both engines are called **Resume Alignment** in the UI as of the CLAIMED/PROVEN/RELEVANT redesign
(2026-08-20) — never "Readiness." "Readiness" is reserved for the separate, skill-based, Proven-
evidence-driven Company Prep concept (see `docs/System.md`); Resume Alignment answers a different
question ("does my resume claim the skill") and is deliberately never called Readiness anywhere in
the UI, per explicit spec. Two more numbers, Resume Quality and Confidence, ship alongside
Alignment wherever Engine B runs — see the bottom of this file.

## Engine A — Static weight tables (5 app-owned resumes, owner-only)

**Where:** `resumeAlignmentScore()` and `companiesRankedForResume()` in `src/lib/prep.js`, backed
by `src/data/resumeWeights.js`. Powers the "Resume Maxing" feature.

**The input isn't detected — it's hand-authored.** Each of the 5 resume PDFs (SDE, SDE+Algo,
Backend, ML, Non-Core Companies) was actually read in full, and for each of the original ~20 core
skills, a weight from 0 to 1 was manually assigned per resume based on what that resume's TECHNICAL
SKILLS section and project bullets actually contain.

*(Note on catalog IDs: the skill catalog grew from 23 to 101 skills for the subskill/todo tracking
system — see `docs/System.md` — and that restructuring initially left `resumeWeights.js` and
`companies.js` pointing at 8-9 flat skill ids that had been renamed or split, e.g. `dbms-sql`→`sql`,
`system-design`→`hld`. This was a real, silently-degrading bug — caught and fixed by remapping every
reference to its current catalog id; see `docs/CONTEXT.md` for the full list and how it was found.
`resumeWeights.js` still only covers that original ~20-skill set by design, which remains fine since
`companies.js` doesn't currently require any of the other ~80 catalog skills — it would only become a
gap if a company's requirements are ever expanded to reference one of those without adding a weight
for it too.)*

Crucially, a skill genuinely **absent** from a resume gets **0**, not just "low" — e.g. `SDE +
Algo.pdf` and `Backend.pdf` both drop the Machine Learning section entirely, so
`ml-fundamentals`/`deep-learning`/`nlp`/`eda` are all weighted 0 for those two variants. This is why,
e.g., the DSA-forward resume scores 0% against purely ML-focused companies (Wipro, Accenture) in
`docs/COMPANIES.md`'s data — that's the formula working correctly, not a bug.

A small set of skills (`resume-storytelling`, `hr-behavioral`, `aptitude`) are "flat weight"
skills — every resume variant is assumed equally capable of them, since they're about how you talk
in an interview, not what's on paper (`FLAT_WEIGHT_SKILLS` in `resumeWeights.js`).

**The formula:**

```
score = Σ(importance × resumeWeight) / Σ(importance) × 100

importance(requiredRank) = rankIndex(requiredRank) + 1     (same importance formula as company readiness)
```

Then a small domain-match multiplier applies for a few resumes (`domainBonus` in
`resumeWeights.js`) — e.g. the Non-Core resume gets a 1.3× bonus against companies tagged
Finance/Consulting/Non-Core, since its condensed, business-readable framing genuinely suits those
roles better than raw skill-list overlap alone would capture. Capped at 100%.

**Why this exists as a separate, hand-tuned system:** these are 5 *known, fixed* documents — there
was no need to guess their content when the actual content could just be read once and encoded
directly. This is more accurate than keyword-matching would be for these 5 specific files, at the
cost of not generalizing to any other resume — which is exactly why Engine B exists.

## Engine B — Keyword detection (any uploaded resume, public + authenticated)

**Where:** `src/lib/extractResumeSkills.js` (extraction) + `src/data/skillKeywords.js` (matching)
feeding into the **same** `companyReadinessFromSkillLevels()` used for skill-based Company Prep
readiness elsewhere in the app (see `docs/System.md`) — the UI calls the result "Resume Alignment"
here, "Readiness" there; same underlying function, different input and different label, on purpose.
Powers `/try` (public, no auth), `/resume` (authenticated, private, persisted), and **Resume Raid**
(`/resume-raid`) — which runs this same extraction across *every* resume a user uploads and unions
the per-skill results via `Math.max`, surfacing every skill CLAIMED by at least one of their resumes
rather than scoring one document against companies (see `docs/CONTEXT.md` — Resume Raid's full
CLAIMED/PROVEN split is planned but not yet built as of this writing).

Every skill this engine detects is **CLAIMED**, not **PROVEN** — a resume mentioning Kafka doesn't
mean Kafka is Proven; Proven only comes from checked subskill-todo evidence on Skill Maxing (see
`docs/System.md`'s "Proven skill" section). Nowhere in the app should a Resume Alignment number be
read as "the user actually knows this."

This engine has to work on a document it's never seen before, from a stranger, with no time to
hand-author anything. The whole pipeline runs **client-side**:

1. **Extraction** — `pdfjs-dist` (dynamically imported, not bundled into the main app, so its 1MB+
   weight only loads for someone who actually uses a resume-checking feature) reads the PDF's raw
   text, page by page, entirely in the browser. For an uploaded `File` object
   (`detectSkillLevelsFromPdfFile`), or for an already-stored resume fetched via a signed URL
   (`detectSkillLevelsFromPdfUrl`) on the authenticated My Resume and Resume Raid pages. Two sibling
   functions, `analyzeResumeFile`/`analyzeResumeUrl`, do the identical extraction but also return
   the raw text alongside the detected levels — added for Resume Quality/Confidence (below), which
   need the text itself, not just the detected skills. The original two functions were kept
   unchanged so Resume Raid's existing call sites didn't need to change.
2. **Keyword matching** — `detectSkillLevelsFromText()` lowercases the extracted text and, for
   each of the 101 skills in the catalog, counts how many **distinct** keywords from that skill's
   list (`skillKeywords.js`) appear anywhere in the text. Counting distinct keywords rather than raw
   occurrences means one repeated buzzword can't fake high proficiency.
3. **Level estimate** — match count maps onto a capped proficiency guess:

   | Distinct keyword matches | Estimated level |
   |---|---|
   | 0 | 0 |
   | 1 | 35 |
   | 2 | 55 |
   | 3 | 70 |
   | 4+ | 85 (capped — keyword presence alone never implies full mastery) |

4. **Scoring** — the resulting `{skillId: 0-100}` map is fed into `companyReadinessFromSkillLevels`
   for all 36 companies, then sorted by readiness (`companiesRankedByReadiness`).

Two skills (`resume-storytelling`, `hr-behavioral`) have empty keyword lists on purpose — a PDF
genuinely can't demonstrate interview presence, so they always contribute 0 from this engine
(they still count in Engine A via the flat-weight mechanism, which is a different, more
appropriate treatment for a *known* resume where those qualities were separately assessed).

### Known limitations (disclosed in the UI, not hidden)

- **Paraphrase blindness.** "Built REST services" won't match as cleanly as "REST APIs" would.
  This is a keyword matcher, not an LLM — it was deliberately built this way specifically so the
  public checker needs no backend, no API key, and no per-request cost (see `docs/CONTEXT.md` for
  the explicit build-vs-buy tradeoff that led here).
- **No context understanding.** Mentioning a skill in a "things I want to learn" section would
  count the same as mentioning it as an accomplished project skill.
- **Capped confidence.** Even a resume packed with a skill's keywords tops out at 85%, never 100%
  — the detector is deliberately never fully confident about anything it infers rather than reads
  explicitly.

Both `/try` and `/resume` show this disclaimer directly above the results table — it's core
product honesty, not fine print, and shouldn't be removed or softened without reconsidering why it
was added.

## Resume Quality and Confidence — two more numbers alongside Alignment

Added in the same CLAIMED/PROVEN/RELEVANT redesign that renamed Engine B's output to Resume
Alignment. Both are computed from the SAME extracted text Engine B already produces (via
`analyzeResumeFile`/`analyzeResumeUrl` above) — no extra parsing pass.

- **Resume Quality** (`lib/resumeQuality.js`, `scoreResumeQuality(text)`) — a property of the
  resume ITSELF, independent of any one company. Quantified-impact density, action-verb usage,
  section coverage, length, low redundancy, combined into one 0–100 score with the sub-scores
  shown too. Full formula in `docs/System.md`.
- **Confidence** (`lib/confidence.js`, `scoreConfidence({ text, skillLevels, company })`) — how
  much THE SYSTEM trusts its OWN Alignment number for one specific resume+company pair, not a
  claim about the candidate. A high Alignment score does not imply high Confidence — they're
  independent by design. Full formula in `docs/System.md`.

Both are heuristic, client-side, zero-backend — same philosophy as Engine B itself. Shown on
`/try`, `/resume` (Quality once per resume; Confidence per company as a table column), and on
`CompanyDetail`'s "Resume Fit" panel (three-up, for both non-owner accounts' own resumes and,
alongside Engine A's Alignment, for the owner's static resumes).

## Side-by-side

| | Engine A (Resume Maxing) | Engine B (Resume Alignment / Quality / Confidence) |
|---|---|---|
| Input | 5 known, hand-read PDFs | Any uploaded PDF, never seen before |
| Skill weights | Manually authored per resume | Auto-detected via keyword count |
| Accuracy | High (real content, human-verified) | Rough estimate, explicitly disclosed as such |
| Audience | Owner account only | Anyone — public and authenticated |
| Where content lives | `resumeWeights.js` (static) | Extracted live from the uploaded file, never stored as text |
| Shared math | `companyReadinessFromSkillLevels`-style importance weighting (own implementation: `resumeAlignmentScore`) | `companyReadinessFromSkillLevels` directly |
| Quality / Confidence | Owner's section shows both too (same functions, fed the owner's static-resume text) | Native — computed from the same extraction pass |

## If detection quality ever needs improving

The keyword lists in `skillKeywords.js` are the single highest-leverage place to improve Engine
B's accuracy — adding synonyms/phrasings that real resumes actually use (informed by seeing what
real uploads get under/over-detected) will help more than tuning the level-mapping thresholds.
Resist the urge to add an LLM call here unless the public-facing, zero-cost, zero-backend property
of `/try` is explicitly being traded away on purpose — that property was a deliberate design
decision, not an oversight (see the extraction-method discussion in `docs/CONTEXT.md`).
