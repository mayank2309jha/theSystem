import { companies } from "../data/companies.js";
import { skillCatalog } from "../data/skills.js";
import { resumeSkillWeights, FLAT_WEIGHT_SKILLS, domainBonus } from "../data/resumeWeights.js";
import { RANK_ORDER, rankGap, rankIndex, skillRankForLevel } from "./ranks.js";

export function getCompany(id) {
  return companies.find((c) => c.id === id);
}

export function getSkill(id) {
  return skillCatalog.find((s) => s.id === id);
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
export function skillPriorities(levels) {
  return skillCatalog
    .map((skill) => {
      const level = levels[skill.id] ?? skill.level;
      return { skill, level, currentRank: skillRankForLevel(level), milestone: nextMilestone(skill.id, level) };
    })
    .filter((s) => s.milestone)
    .sort((a, b) => b.milestone.newlyUnlockedCount - a.milestone.newlyUnlockedCount);
}

export function companySkillReadiness(company, levels) {
  return company.skills.map((req) => {
    const level = levels[req.id] ?? getSkill(req.id)?.level ?? 0;
    return { ...req, skill: getSkill(req.id), level, gap: rankGap(level, req.requiredRank) };
  });
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
