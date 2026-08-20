// Regenerates docs/Company.md straight from src/data/companies.js — a
// skills-and-weighting-focused companion to docs/COMPANIES.md (which covers
// interview rounds / prep tips / narrative content instead). Run after
// editing companies.js:
//   node scripts/generate-company-md.mjs
import { companies } from "../src/data/companies.js";
import { skillCatalog } from "../src/data/skills.js";
import { rankIndex } from "../src/lib/ranks.js";
import { writeFileSync } from "node:fs";

function fmtINR(n) {
  return n == null ? "Not listed" : `₹${(n / 100000).toFixed(2)} L`;
}
function skillMeta(id) {
  return skillCatalog.find((s) => s.id === id) ?? { name: id, category: "?" };
}
// Same importance formula used throughout the scoring engine (see
// docs/System.md) — E=1 ... S=6. This IS the "weightage" of a required
// skill for a given company: how much it counts toward that company's
// overall readiness/alignment score relative to its other requirements.
function weightFor(requiredRank) {
  return rankIndex(requiredRank) + 1;
}

const sorted = [...companies].sort((a, b) => (a.day ?? Infinity) - (b.day ?? Infinity));

let out = `# Company.md\n\n`;
out += `Auto-generated from \`src/data/companies.js\` — do not hand-edit, run \`node scripts/generate-company-md.mjs\` instead.\n\n`;
out += `Every company's skill requirements with their **weight** — the numeric importance (1-6, derived from required rank: E=1 ... S=6) each skill carries in that company's readiness/alignment scoring. See \`docs/System.md\` for the full formula. For interview rounds, prep checklists, and narrative content, see \`COMPANIES.md\` instead — this file is the data-table companion, not a replacement.\n\n`;

out += `## Summary\n\n`;
out += `| Company | Domain | Base | CTC | Skills Required | Overall |\n|---|---|---|---|---|---|\n`;
for (const c of sorted) {
  out += `| [${c.name}](#${c.id}) | ${c.domain} | ${fmtINR(c.base)} | ${fmtINR(c.ctc)} | ${c.skills.length} | ${c.overallRank} |\n`;
}
out += `\n---\n\n`;

for (const c of sorted) {
  out += `## ${c.name}\n`;
  out += `<a id="${c.id}"></a>\n\n`;
  out += `**Role:** ${c.role}  \n`;
  out += `**Domain:** ${c.domain}  \n`;
  out += `**Base:** ${fmtINR(c.base)} · **CTC:** ${fmtINR(c.ctc)} · **Median day:** ${typeof c.day === "number" ? c.day : "TBD"}  \n`;
  out += `**Locations:** ${c.locations}  \n`;
  out += `**Overall difficulty:** ${c.overallRank}-Rank · **DSA level:** ${c.dsaLevel}-Rank\n\n`;

  const rows = c.skills
    .map((s) => ({ ...s, meta: skillMeta(s.id), weight: weightFor(s.requiredRank) }))
    .sort((a, b) => b.weight - a.weight);

  out += `| Skill | Category | Required Rank | Weight |\n|---|---|---|---|\n`;
  for (const r of rows) {
    out += `| ${r.meta.name} | ${r.meta.category} | ${r.requiredRank} | ${r.weight} |\n`;
  }
  out += `\n_Weight sum: ${rows.reduce((s, r) => s + r.weight, 0)} — a company's overall readiness score is the weight-average of per-skill progress across these rows (see docs/System.md)._\n\n`;
  out += `[Full prep detail (interview rounds, checklist, recommended resume) →](./COMPANIES.md#${c.id})\n\n---\n\n`;
}

writeFileSync(new URL("../docs/Company.md", import.meta.url), out);
console.log(`Wrote docs/Company.md — ${companies.length} companies.`);
