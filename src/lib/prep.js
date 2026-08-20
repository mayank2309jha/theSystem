import { companies } from "../data/companies.js";
import { resumeSkillWeights, FLAT_WEIGHT_SKILLS, domainBonus } from "../data/resumeWeights.js";
import { RANK_ORDER, rankIndex, skillRankForLevel } from "./ranks.js";

// NOTE: every function below that needs the skill catalog takes it as a
// parameter (`catalog`) rather than importing one directly — the catalog now
// lives in Supabase (`skills`/`subskills` tables, migrated 2026-08-20, see
// supabase/schema.sql), fetched once via useSkillCatalog() and threaded
// through App.jsx's outletContext. This keeps this file itself agnostic to
// where the catalog came from (the "data-access layer" the migration asked
// for) — the one exception is Try.jsx, which still imports the static
// src/data/skills/ bundle directly to preserve its zero-Supabase-calls
// guarantee; see docs/CONTEXT.md.

export function getCompany(id) {
  return companies.find((c) => c.id === id);
}

// The "power scaling" system: overall progress toward S-Rank divided into
// 100 discrete levels — Level 1 (the floor; a brand-new account with zero
// checked todos reads as "Level 1", never "Level 0") up to Level 100 (every
// proof-of-skill todo across the whole catalog checked off). Deliberately
// driven by TODO COMPLETION, not the manually-set skill sliders — those
// default to a non-zero E-Rank seed (10), which would make a fresh account
// read as Level 10 instead of Level 1. Checking off todos is "doing more
// skills," which is literally what should move this number. The existing
// E-S rank ladder still applies on top of this exact same number via
// skillRankForLevel, so "Level 34" and "C-Rank" are two views of one
// underlying value, not two systems to reconcile.
export function hunterLevel(catalog, subskillTodos) {
  const totalTodoCount = catalog.reduce(
    (sum, skill) => sum + (skill.subskills ?? []).reduce((s, sub) => s + (sub.todos?.length ?? 0), 0),
    0
  );
  if (totalTodoCount === 0) return 1;
  const checkedCount = Object.keys(subskillTodos).length;
  const pct = (checkedCount / totalTodoCount) * 100;
  return Math.max(1, Math.min(100, Math.round(pct)));
}

export function getSkill(catalog, id) {
  return catalog.find((s) => s.id === id);
}

// PROVEN — what a user has actually demonstrated, as opposed to CLAIMED
// (resume-detected, see detectSkillLevelsFromText) or the self-reported
// slider (kept on SkillDetail as "Self-Assessment", intentionally NOT read
// by this function or by anything that computes company-facing readiness).
//
// For one skill: a weighted average of its subskills' todo-completion
// fraction, weighted by each subskill's `weight` (1-3, already authored per
// subskill, unused anywhere until now). A skill with zero subskills scores
// 0, not undefined — there's no evidence mechanism for it yet, which is a
// fact worth surfacing, not hiding behind a default.
export function provenSkillLevel(skill, subskillTodos) {
  const subskills = skill.subskills ?? [];
  if (subskills.length === 0) return 0;

  let weightedSum = 0;
  let weightTotal = 0;
  for (const sub of subskills) {
    const todos = sub.todos ?? [];
    if (todos.length === 0) continue; // no evidence mechanism defined yet — doesn't count toward the average
    const weight = sub.weight ?? 1;
    const doneCount = todos.filter((_, i) => subskillTodos[`${skill.id}:${sub.id}:${i}`]).length;
    const progress = doneCount / todos.length;
    weightedSum += progress * weight;
    weightTotal += weight;
  }
  return weightTotal === 0 ? 0 : Math.round((weightedSum / weightTotal) * 100);
}

// Same shape as the manual skillLevels map ({skillId: 0-100}) so it's a
// drop-in replacement anywhere that map is consumed — companyReadinessFromSkillLevels,
// skillPriorities, nextMilestone, etc. all work unchanged on either.
export function provenSkillLevels(catalog, subskillTodos) {
  return Object.fromEntries(catalog.map((skill) => [skill.id, provenSkillLevel(skill, subskillTodos)]));
}

// Lower = sooner in the placement season. Untimed/unlisted companies sort last.
export function dayValue(company) {
  return typeof company.day === "number" ? company.day : Infinity;
}

export function companiesSortedByDay() {
  return [...companies].sort((a, b) => dayValue(a) - dayValue(b));
}

export function companiesRequiringSkill(skillId) {
  return companies
    .filter((c) => c.skills.some((s) => s.id === skillId))
    .map((c) => ({
      company: c,
      requiredRank: c.skills.find((s) => s.id === skillId).requiredRank,
    }));
}

// Highest rank any company demands for this skill. Kept for reference/sorting,
// but deliberately NOT presented as "the rank you need" anywhere in the UI —
// that assumes everyone is targeting the single hardest company, which isn't
// true. Use skillUnlockCurve/nextMilestone instead for anything user-facing.
export function highestRequiredRank(skillId) {
  const reqs = companiesRequiringSkill(skillId);
  if (reqs.length === 0) return null;
  return reqs.reduce((max, r) => (rankIndex(r.requiredRank) > rankIndex(max) ? r.requiredRank : max), reqs[0].requiredRank);
}

// Which companies need this skill, grouped by the exact rank they require.
export function skillRankBreakdown(skillId) {
  const reqs = companiesRequiringSkill(skillId);
  const byRank = Object.fromEntries(RANK_ORDER.map((r) => [r, []]));
  for (const r of reqs) byRank[r.requiredRank].push(r.company);
  return byRank;
}

// Cumulative view: reaching rank R on this skill satisfies every company
// that requires R or below. Lets a user see "C-Rank already covers 25/36
// companies" instead of being told to chase the single hardest company.
export function skillUnlockCurve(skillId) {
  const breakdown = skillRankBreakdown(skillId);
  const total = RANK_ORDER.reduce((sum, r) => sum + breakdown[r].length, 0);
  let cumulative = 0;
  return RANK_ORDER.map((rank) => {
    const newlyUnlocked = breakdown[rank];
    cumulative += newlyUnlocked.length;
    return { rank, newlyUnlocked, unlockedCount: cumulative, total };
  });
}

// The next rank above the user's CURRENT level that actually unlocks more
// companies for this skill — a concrete, achievable next step rather than an
// assumed top-tier target. Returns null once every company listing this
// skill is already satisfied at the current rank.
export function nextMilestone(skillId, level) {
  const currentRank = skillRankForLevel(level);
  const curve = skillUnlockCurve(skillId);
  const currentIdx = rankIndex(currentRank);
  for (let i = currentIdx + 1; i < RANK_ORDER.length; i++) {
    if (curve[i].newlyUnlocked.length > 0) {
      return {
        rank: curve[i].rank,
        newCompanies: curve[i].newlyUnlocked,
        newlyUnlockedCount: curve[i].newlyUnlocked.length,
        totalUnlockedAfter: curve[i].unlockedCount,
        totalRequiring: curve[curve.length - 1].total,
      };
    }
  }
  return null;
}

// Skills ranked by "single highest-leverage next step" — reaching each
// skill's next milestone unlocks the most additional companies. Goal-
// agnostic on purpose: it doesn't assume any particular target company, it
// just surfaces where the next bit of effort goes furthest. Skills already
// maxed out for every company that lists them are excluded.
export function skillPriorities(catalog, levels) {
  return catalog
    .map((skill) => {
      const level = levels[skill.id] ?? skill.level;
      return { skill, level, currentRank: skillRankForLevel(level), milestone: nextMilestone(skill.id, level) };
    })
    .filter((s) => s.milestone)
    .sort((a, b) => b.milestone.newlyUnlockedCount - a.milestone.newlyUnlockedCount);
}

// The minimum proficiency % needed to BE a given rank — the same 6-way
// split skillRankForLevel() itself uses, just inverted.
export function requiredProficiencyForRank(rank) {
  return (rankIndex(rank) / RANK_ORDER.length) * 100;
}

// Aggregate 0-100 readiness for ONE company given ANY flat {skillId: 0-100}
// map, regardless of where those numbers came from — a manually-set skill
// level, or (as used by the resume checkers) keyword-detected proficiency
// from an uploaded PDF. Each required skill contributes to the average
// weighted by how high a rank it demands, and no single skill can
// contribute more than "fully satisfied" even if the user's level for it
// exceeds what's required.
export function companyReadinessFromSkillLevels(company, skillLevels) {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const req of company.skills) {
    const importance = rankIndex(req.requiredRank) + 1;
    const level = skillLevels[req.id] ?? 0;
    const requiredProficiency = requiredProficiencyForRank(req.requiredRank);
    const progress = requiredProficiency === 0 ? 1 : Math.min(level / requiredProficiency, 1);
    weightedSum += importance * progress;
    weightTotal += importance;
  }
  return weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 100) : 0;
}

// Every company ranked by readiness against a flat skill-level map.
export function companiesRankedByReadiness(skillLevels) {
  return [...companies]
    .map((company) => ({ company, readiness: companyReadinessFromSkillLevels(company, skillLevels) }))
    .sort((a, b) => b.readiness - a.readiness);
}

export function formatINR(amount) {
  if (amount == null) return "Not listed";
  return `₹${(amount / 100000).toFixed(2)} L`;
}

function skillWeight(resumeFile, skillId) {
  if (skillId in FLAT_WEIGHT_SKILLS) return FLAT_WEIGHT_SKILLS[skillId];
  return resumeSkillWeights[resumeFile]?.[skillId] ?? 0.3;
}

// 0-100 estimated alignment between a resume variant and a company, weighted
// by how high a rank each required skill demands (a company that needs
// A-Rank ML matters far more to the score than one that needs D-Rank ML).
export function resumeAlignmentScore(resumeFile, company) {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const req of company.skills) {
    const importance = rankIndex(req.requiredRank) + 1;
    weightedSum += importance * skillWeight(resumeFile, req.id);
    weightTotal += importance;
  }
  let score = weightTotal > 0 ? (weightedSum / weightTotal) * 100 : 50;

  const bonus = domainBonus[resumeFile];
  if (bonus && bonus.pattern.test(company.domain)) {
    score *= bonus.multiplier;
  }

  return Math.round(Math.min(100, score));
}

export function companiesRankedForResume(resumeFile) {
  return [...companies]
    .map((company) => ({ company, score: resumeAlignmentScore(resumeFile, company) }))
    .sort((a, b) => b.score - a.score);
}
