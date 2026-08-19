import { companies } from "../data/companies.js";
import { skillCatalog } from "../data/skills.js";
import { resumeSkillWeights, FLAT_WEIGHT_SKILLS, domainBonus } from "../data/resumeWeights.js";
import { rankGap, rankIndex } from "./ranks.js";

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

// Highest rank any company demands for this skill — the ceiling to climb toward.
export function highestRequiredRank(skillId) {
  const reqs = companiesRequiringSkill(skillId);
  if (reqs.length === 0) return null;
  return reqs.reduce((max, r) => (rankIndex(r.requiredRank) > rankIndex(max) ? r.requiredRank : max), reqs[0].requiredRank);
}

// { skill, gap, ceiling } sorted by biggest gap first, for a given live levels map.
export function skillGaps(levels) {
  return skillCatalog
    .map((skill) => {
      const ceiling = highestRequiredRank(skill.id);
      const level = levels[skill.id] ?? skill.level;
      const gap = ceiling ? rankGap(level, ceiling) : 0;
      return { skill, level, ceiling, gap };
    })
    .sort((a, b) => b.gap - a.gap || rankIndex(b.ceiling ?? "E") - rankIndex(a.ceiling ?? "E"));
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
