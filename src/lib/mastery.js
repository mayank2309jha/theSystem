// Mastery — a NEW, SEPARATE signal from Proven (lib/prep.js's
// provenSkillLevel, 0-100, todo-completion-based, drives Company Prep/Home).
// Mastery is 0-6 (Not Started..Advanced), richer (confidence, notes, review
// scheduling), and self-assessed per subskill rather than derived from
// checkboxes. The two are deliberately kept apart — see docs/System.md.
export const MASTERY_LEVELS = [
  { level: 0, label: "Not Started", description: "I have essentially not studied this." },
  { level: 1, label: "Aware", description: "I recognize the concept and can give a very basic explanation." },
  { level: 2, label: "Basic", description: "I understand the fundamental idea but cannot reliably implement or defend it." },
  { level: 3, label: "Working Knowledge", description: "I can use it in normal development and explain the major concepts." },
  { level: 4, label: "Interview Ready", description: "I can answer common interview questions and solve practical problems involving it." },
  { level: 5, label: "Strong", description: "I can explain internals, trade-offs, failure modes and practical engineering considerations." },
  { level: 6, label: "Advanced", description: "I can reason deeply about implementation details, edge cases, optimization and design trade-offs." },
];

export function masteryLevelLabel(level) {
  return MASTERY_LEVELS[level]?.label ?? "Not Started";
}

// Parent skill's Mastery score (0-6): importance-weight-weighted average of
// its subskills' mastery_level. A subskill with no row yet counts as 0 —
// same "never simply learned/not learned" principle Proven already applies,
// pushed down one more level. Deliberately simple math (importance_weight
// only) — interview_frequency_weight/difficulty_weight exist on the schema
// for future refinement but aren't factored in yet, per the explicit
// "avoid unnecessarily complicated mathematics" instruction.
export function masteryScore(skill, masteryBySubskillId) {
  const subskills = skill.subskills ?? [];
  if (subskills.length === 0) return 0;

  let weightedSum = 0;
  let weightTotal = 0;
  for (const sub of subskills) {
    const weight = sub.weight ?? 1;
    const level = masteryBySubskillId[sub.id]?.mastery_level ?? 0;
    weightedSum += level * weight;
    weightTotal += weight;
  }
  return weightTotal === 0 ? 0 : Math.round((weightedSum / weightTotal) * 10) / 10; // one decimal, e.g. 3.1
}

// Weak areas: lowest-scoring subskills first, with two flags per entry —
// `belowTarget` (mastery_level < the skill's preparedness_target, if set)
// and `highImportance` (importance_weight >= 2, i.e. this subskill matters
// more than average within its parent). No quiz-accuracy-based detection
// yet (overconfidence flagging, frequently-failed topics) — there's no quiz
// data to read; that's future work, not built here.
export function weakAreas(skill, masteryBySubskillId, target) {
  const subskills = skill.subskills ?? [];
  return subskills
    .map((sub) => {
      const level = masteryBySubskillId[sub.id]?.mastery_level ?? 0;
      const weight = sub.weight ?? 1;
      return {
        subskill: sub,
        level,
        belowTarget: target != null && level < target,
        highImportance: weight >= 2,
      };
    })
    .filter((w) => w.level < 4) // below "Interview Ready" — a reasonable default bar for "worth flagging"
    .sort((a, b) => a.level - b.level || (b.highImportance ? 1 : 0) - (a.highImportance ? 1 : 0));
}
