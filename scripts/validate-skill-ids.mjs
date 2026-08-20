// Cross-file identifier validator. Skill ids are plain strings duplicated
// across several static data files with no shared type/schema, so a catalog
// rename can silently break company requirements or resume weight tables
// without any build/lint error — this happened for real once (23/36
// companies broke when the 101-skill catalog restructuring renamed several
// flat ids; see docs/CONTEXT.md). Run via `npm run lint`, which chains this
// after oxlint, so a future rename fails loudly instead of silently.
import { skillCatalog } from "../src/data/skills/index.js";
import { companies } from "../src/data/companies.js";
import { resumeSkillWeights, FLAT_WEIGHT_SKILLS } from "../src/data/resumeWeights.js";
import { skillKeywords } from "../src/data/skillKeywords.js";

const catalogIds = new Set(skillCatalog.map((s) => s.id));
let failures = 0;

function fail(message) {
  console.error(`✗ ${message}`);
  failures++;
}

// 1. Every company-required skill id must exist in the catalog.
for (const company of companies) {
  for (const req of company.skills ?? []) {
    if (!catalogIds.has(req.id)) {
      fail(`companies.js: "${company.name}" (${company.id}) requires unknown skill id "${req.id}"`);
    }
  }
}

// 2. Every resumeWeights.js key (per resume file, plus the flat-weight set)
//    must exist in the catalog — an orphaned key silently falls back to the
//    default 0.3 weight in resumeAlignmentScore() instead of erroring.
for (const [resumeFile, weights] of Object.entries(resumeSkillWeights)) {
  for (const skillId of Object.keys(weights)) {
    if (!catalogIds.has(skillId)) {
      fail(`resumeWeights.js: "${resumeFile}" has a weight for unknown skill id "${skillId}"`);
    }
  }
}
for (const skillId of Object.keys(FLAT_WEIGHT_SKILLS)) {
  if (!catalogIds.has(skillId)) {
    fail(`resumeWeights.js: FLAT_WEIGHT_SKILLS has unknown skill id "${skillId}"`);
  }
}

// 3. Every catalog skill should have a skillKeywords.js entry — its absence
//    doesn't crash anything (detectSkillLevelsFromText falls back to an
//    empty array), but it means that skill can NEVER be detected from an
//    uploaded resume, which is a real, silent capability gap worth flagging.
for (const skill of skillCatalog) {
  if (!(skill.id in skillKeywords)) {
    fail(`skillKeywords.js: skill "${skill.id}" (${skill.name}) has no keyword entry — will never be detected from a resume`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} cross-file identifier issue${failures === 1 ? "" : "s"} found.`);
  process.exit(1);
}
console.log(`✓ Cross-file skill id validation passed (${catalogIds.size} skills, ${companies.length} companies).`);
