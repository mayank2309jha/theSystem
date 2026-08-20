// Per-page "how this works" content — the short `hover` string shows as a
// tooltip on that page's main heading; `sections` is the full body of the
// Methodology panel (MethodologyPanel.jsx / MethodologyButton.jsx). Kept as
// data, not scattered inline strings, so it's one place to update when a
// formula changes — see the transparency principle in docs/CONTEXT.md: every
// computed value in the app should trace back to an entry here.
export const methodology = {
  "resume-raid": {
    hover: "What does your resume claim you know?",
    title: "How Resume Raid Works",
    sections: [
      {
        heading: "What you're seeing",
        text: "Every skill any of your uploaded resumes mentions, unioned across all of them. This is CLAIMED — what your resumes say, not what you've demonstrated. Mentioning Kafka in a bullet point does not mean Kafka is Proven.",
      },
      {
        heading: "How detection works",
        text: "Each resume's PDF text is extracted entirely in your browser (nothing is sent anywhere) and matched against a keyword list per skill (src/data/skillKeywords.js). Distinct keyword hits map to a capped level estimate: 0 hits → 0, 1 → 35, 2 → 55, 3 → 70, 4+ → 85 (never 100 — keyword presence alone is never treated as full mastery). Detected levels are unioned across all your resumes by taking the maximum per skill.",
      },
      {
        heading: "Claimed → Proven",
        text: "A claimed skill becomes Proven by checking off real proof-of-skill todos on that skill's page (linked via \"Test My Strength\"). Proven is a weighted average of your checked subskill evidence — see the Skill Maxing methodology for the exact formula. \"Start Tracking\" just seeds a baseline self-assessment slider; it does not mark anything Proven.",
      },
      {
        heading: "Actual Skill vs. Unverified Claims",
        text: "Of everything claimed, how much has at least some Proven evidence (Proven > 0, i.e. at least one subskill todo checked)? That fraction is your Actual Skill %; the rest is Unverified. If the UI ever uses \"Bluffing\" as shorthand, it means exactly this — claimed but not yet demonstrated inside THE SYSTEM — not an accusation.",
      },
      {
        heading: "Limitations",
        text: "Keyword matching misses paraphrased skills (\"built REST services\" won't match as cleanly as \"REST APIs\"), can't tell a claimed skill from an aspirational one written the same way, and only covers skills in the 101-skill catalog. Treat detected levels as a starting point, not a verdict.",
      },
    ],
  },
  "company-prep": {
    hover: "Do you have what it takes to work at this company?",
    title: "How Company Prep Works",
    sections: [
      {
        heading: "What you're seeing",
        text: "Every skill this company requires (from real placement data where available), each with a required rank (E–S). Your rank next to it is PROVEN — evidence-based, from checked subskill todos — not the self-assessment slider or anything from your resume.",
      },
      {
        heading: "How readiness is calculated",
        text: "Each required skill contributes to an importance-weighted average: importance = the required rank's position in the E–S ladder (E=1 … S=6), so an A-Rank requirement counts more than a D-Rank one. Your progress toward each requirement is capped at 100% — exceeding a bar doesn't over-count. The same formula (companyReadinessFromSkillLevels in lib/prep.js) also powers Resume Alignment elsewhere, fed a different input (Claimed instead of Proven) — see that methodology for why those are kept separate.",
      },
      {
        heading: "Claimed vs. Proven here",
        text: "This page shows Proven only. If you want to know what your resume claims about this company's requirements specifically, check the \"Resume Fit\" panel — that's Resume Alignment, a different question, computed differently.",
      },
      {
        heading: "Verified vs. unverified data",
        text: "Rounds and prep tips marked verified come from an actual placed senior's reported experience. Companies without that flag show \"No verified senior report\" — the prep shown is best-practice for that role archetype, not a confirmed account. Required ranks themselves are set from the underlying placement data, not guessed.",
      },
    ],
  },
  "resume-alignment": {
    hover: "How closely does this resume match what this company looks for?",
    title: "How Resume Alignment Works",
    sections: [
      {
        heading: "What this measures",
        text: "How well your resume's CLAIMED skills (keyword-detected, or hand-authored weights for the 5 app-owned resumes) match a company's required skills and ranks. It does NOT measure how likely you are to get an interview or an offer — it's a text-overlap estimate, nothing about your resume's writing quality, presentation, or the rest of a real hiring process.",
      },
      {
        heading: "How the score is calculated",
        text: "Same importance-weighted formula as Company Prep readiness (see that methodology), fed CLAIMED skill levels instead of Proven ones. importance = required rank's position (E=1…S=6); your detected level is capped against what the rank actually requires; missing/undetected skills contribute 0, pulling the average down.",
      },
      {
        heading: "Resume Quality — a separate number",
        text: "Measures the resume text itself, independent of any company: quantified-impact density, action-verb usage, section coverage (Education/Experience/Skills), length, and low redundancy (repeated phrasing). Heuristic, not AI-scored — see lib/resumeQuality.js for the exact weights. A resume can have high Alignment with low Quality, or the reverse.",
      },
      {
        heading: "Confidence — a separate number",
        text: "How much THE SYSTEM trusts its OWN Alignment number for this specific resume+company pair — not a claim about you. Combines how much text was actually extracted (very little usually means a scanned/image PDF), what fraction of this company's required skills got any detection signal at all, and whether this company's requirement data is a verified senior report or a best-practice guess. High Alignment does NOT imply high Confidence — they're independent.",
      },
      {
        heading: "What the score does not mean",
        text: "Not a probability of getting hired. Not a measure of whether you actually know the skills (that's Proven, on Company Prep). Not a comparison against other candidates. A rough, disclosed estimate meant as a starting point.",
      },
    ],
  },
  "skill-maxing": {
    hover: "What can you actually prove you know?",
    title: "How Skill Maxing Works",
    sections: [
      {
        heading: "What you're seeing",
        text: "Every skill's PROVEN rank — driven entirely by which proof-of-skill subskill todos you've actually checked off, nothing self-reported.",
      },
      {
        heading: "How Proven is calculated",
        text: "Per skill: each subskill contributes checkedTodos/totalTodos (0–1) to a weighted average, weighted by that subskill's authored importance (1–3). Result is 0–100, mapped onto the E–S ladder the same way everywhere else in the app (6 equal bands). A skill with zero subskills scores 0 — there's no evidence mechanism for it yet, shown honestly rather than defaulted to something misleading.",
      },
      {
        heading: "Self-Assessment — kept, but separate",
        text: "Each skill's page also has a manual 0–100 slider, relabeled Self-Assessment. It's a personal gut-check only — dragging it never changes Proven, Company Prep readiness, Resume Alignment, or \"Where to Focus Next\" anywhere in the app.",
      },
      {
        heading: "Next milestone framing",
        text: "\"Reach C-Rank → unlocks N more companies\" is goal-agnostic by construction — it shows the next rank that actually unlocks more of the 36 companies for that specific skill, never an assumed universal top-tier target.",
      },
    ],
  },
  home: {
    hover: "Your overall progress, at a glance.",
    title: "How the Home Dashboard Works",
    sections: [
      {
        heading: "Level (1–100)",
        text: "Your overall progress toward S-Rank, divided into 100 levels. Driven purely by how many proof-of-skill todos you've checked off across the entire catalog, out of the total available — the same evidence Proven uses per skill, aggregated. Level 1 is the floor (never Level 0); Level 100 means every todo in the catalog is checked.",
      },
      {
        heading: "Hunter Rank badge",
        text: "The same Level number, relabeled onto the E–S ladder. Mission Board XP is shown as its own separate stat and no longer determines this badge — that changed when Level was introduced; XP is about your job-application pipeline, not what you've demonstrated.",
      },
      {
        heading: "Where to Focus Next",
        text: "Ranks skills by \"how many companies does the next milestone unlock,\" using Proven levels — the highest-leverage next move, not an assumed universal target.",
      },
    ],
  },
};

export function getMethodology(key) {
  return methodology[key] ?? null;
}
