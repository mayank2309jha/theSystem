# Interview Best Practices

> **Purpose:** This document covers what happens *after* the resume is written — defending it. It's the reference for making sure every claim on a resume can survive technical questioning, for using the resume deliberately as an interview map, and for staying consistent across every channel an interviewer might check.
>
> **Core philosophy:** Every impressive claim on a resume creates an interview obligation. The resume's job is to get the interview; interview prep's job is to make sure that interview goes well.
>
> *Split from `bestPractices.md`. Resume writing, formatting, and project selection lives in `bestPractices_resume.md`.*

---

# 1. Interview Defensibility

Before including a bullet on a resume, ask:

> **Could I explain this for 10 minutes under technical questioning?**

For important technical claims, ideally be able to explain:

- Why?
- How?
- Alternatives?
- Trade-offs?
- Complexity?
- Failure modes?
- Testing?
- Benchmark methodology?
- Limitations?

If not, the wording on the resume may be too aggressive — this is a signal to walk back the claim, not to prepare harder after the fact.

# 2. Resume Claims Must Be Interview-Ready

Every important bullet should have an associated interview preparation record. For each bullet, be able to answer:

- **What?** — What exactly did you build?
- **Why?** — Why was this needed?
- **How?** — How did you implement it?
- **Alternatives?** — What else could you have done?
- **Trade-offs?** — Why did you choose this approach?
- **Result?** — What happened?
- **Limitations?** — Where does it fail?

# 3. The Resume as an Interview Map

A strong resume often causes interviews to focus heavily on resume content. Therefore:

> **Every strong bullet creates an interview obligation.**

This is good — a candidate should deliberately include achievements they are prepared to defend. Do not optimize only for getting questions. Optimize for getting **questions you can answer well**.

# 4. Breadcrumb Strategy

The "Tell me about yourself" answer can contain deliberate conversational hooks. Example:

> "During my M.Tech, I've become particularly interested in building high-performance software systems, which led me to work on a matching engine and a database optimization project..."

This can naturally lead the conversation toward specific projects (e.g., matching engine → algorithms; database optimization → databases) — if these are strengths, the candidate has created useful interview direction.

However:

> **Every breadcrumb should be interview-safe.**

If you mention something, expect the interviewer to ask about it. Don't drop a hook you can't follow up on.

# 5. Resume → Interview Consistency

The following must agree: Resume, LinkedIn, GitHub, Portfolio, Application form, Interview answers.

Differences in wording are fine. **Contradictory facts are not.** Before an interview, mentally re-check that what you're about to say matches what's on the resume the interviewer is holding — same technologies, same scale, same ownership claims, same numbers.

# 6. The Interview Test

Run this test on every element of a resume before an interview, not just once at freeze time:

- For every project: **Can the candidate survive a deep technical interview on this project?**
- For every metric: **Can the candidate explain exactly how it was measured?**
- For every technology: **Can the candidate explain why it was used?**
- For every algorithm: **Can the candidate explain complexity and alternatives?**

If not, the underlying resume claim should be reduced — a claim that can't pass this test is a liability, not an asset.

# 7. Preparing to Defend Specific Claim Types

Different kinds of claims invite different follow-up questions. Have a ready answer for each:

- **Performance/benchmark claims** — be ready to state the dataset, workload, hardware, software environment, baseline, number of runs, measurement method, variance, and what specifically changed between the baseline and result. An interviewer probing a benchmark number is testing whether it's real, not just whether it's impressive.
- **Research claims** — be ready to separate hypothesis from finding, and experimental observation from theory. Be ready to state limitations plainly, and to explain exactly what makes something "novel" or "state-of-the-art" if that language was used — with a real comparison, not just the label.
- **Architecture/scale claims** — be ready to explain precisely what "distributed," "production-ready," or "microservices" meant in your specific implementation, since these words invite scrutiny; overclaiming here is one of the fastest ways to lose credibility mid-interview.
- **Ownership claims (team projects)** — be ready to state precisely what you personally did versus what teammates or an advisor did. Precision here reads as confidence and honesty, not weakness — vague answers about "we did X" invite the interviewer to keep probing until they find the boundary.
- **AI-assisted projects** — be ready to explain the architecture, debug it live if asked, defend algorithmic choices, explain trade-offs, and reproduce the results conceptually. The question isn't whether AI tools were used; it's whether you understood and can operate on what was built.

# 8. Mock Interview and Company-Specific Preparation

Beyond claim-by-claim defensibility, interview readiness includes:

- Rehearsing a clear, well-structured "Tell me about yourself" answer that uses deliberate breadcrumbs (see §4).
- Company-specific preparation matched to the actual job description the resume was routed against (see the JD-matching and company-routing sections of `bestPractices_resume.md` — the resume selected for a given interview determines which projects/claims are most likely to come up).
- Actually running mock interviews before high-stakes ones, ideally with someone who will push on weak claims the way a real interviewer would.

---

# INTERVIEW READINESS CHECKLIST

- [ ] Can explain every project.
- [ ] Can explain every major bullet.
- [ ] Can explain every metric.
- [ ] Can explain every algorithm.
- [ ] Can explain major architectural decisions.
- [ ] Can explain trade-offs.
- [ ] Can explain failures and limitations.
- [ ] Can explain personal contribution.
- [ ] Can answer "Tell me about yourself."
- [ ] Breadcrumbs are deliberate and interview-safe.
- [ ] Company-specific preparation is complete.
- [ ] Mock interviews have been performed.
- [ ] Resume, LinkedIn, GitHub, portfolio, and application form all agree on facts.
- [ ] Every claim that would appear "impressive" to an interviewer has a ready 10-minute explanation behind it.

---

# NON-NEGOTIABLE RULES (Interview-Relevant Subset)

1. **Never claim technology you cannot defend.**
2. **Every impressive claim creates an interview obligation.**
3. **Never exaggerate ownership** — this is the single fastest way to be caught out under direct questioning.
4. **The resume must be defensible in an interview** — if a claim can't survive technical questioning, the fix is to weaken the claim on the resume, not to hope the question doesn't come up.

*(For the full non-negotiable rule set governing what goes on the resume itself, see `bestPractices_resume.md`.)*

---

# FINAL PRINCIPLE

> **The goal is not to make the candidate sound impressive in the interview. The goal is to make sure the genuinely impressive work already on the resume can be explained clearly, honestly, and in depth when asked.**

A resume built on real evidence (per `bestPractices_resume.md`) makes this part easy — there is nothing to defend that isn't true, so preparation is about clarity and recall, not damage control.
