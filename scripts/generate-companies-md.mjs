// Regenerates COMPANIES.md straight from src/data/companies.js so the doc can
// never drift from the app. Run after editing companies.js:
//   node scripts/generate-companies-md.mjs
import { companies } from "../src/data/companies.js";
import { resumeInfo } from "../src/data/resumes.js";
import { skillCatalog } from "../src/data/skills.js";
import { writeFileSync } from "node:fs";

function fmtINR(n) {
  return n == null ? "Not listed" : `₹${(n / 100000).toFixed(2)} L`;
}
function skillName(id) {
  return skillCatalog.find((s) => s.id === id)?.name ?? id;
}

const sorted = [...companies].sort((a, b) => (a.day ?? Infinity) - (b.day ?? Infinity));

let out = `# Companies\n\n`;
out += `Auto-generated from \`src/data/companies.js\` — do not hand-edit, run \`node scripts/generate-companies-md.mjs\` instead.\n\n`;
out += `Sourced from \`Company_Placement_Profiles.xlsx\`, \`Placement Stats - Sheet1.pdf\`, and \`2025 Placement Stats (Responses).xlsx\` (real interview reports from placed seniors, where available). ${companies.length} companies total, sorted by placement day.\n\n`;
out += `| Day | Company | Role | Domain | Overall | DSA | Base | CTC | Verified |\n`;
out += `|---|---|---|---|---|---|---|---|---|\n`;
for (const c of sorted) {
  out += `| ${typeof c.day === "number" ? c.day : "TBD"} | [${c.name}](#${c.id}) | ${c.role} | ${c.domain} | ${c.overallRank} | ${c.dsaLevel} | ${fmtINR(c.base)} | ${fmtINR(c.ctc)} | ${c.verified ? "✅" : "⚠️ no report yet"} |\n`;
}
out += `\n---\n\n`;

for (const c of sorted) {
  out += `## ${c.name}\n`;
  out += `<a id="${c.id}"></a>\n\n`;
  out += `**Role:** ${c.role}  \n`;
  out += `**Domain:** ${c.domain}  \n`;
  out += `**Day:** ${typeof c.day === "number" ? c.day : "TBD"} · **Locations:** ${c.locations}  \n`;
  out += `**Base:** ${fmtINR(c.base)} · **CTC:** ${fmtINR(c.ctc)}  \n`;
  out += `**Overall difficulty:** ${c.overallRank}-Rank · **DSA level:** ${c.dsaLevel}-Rank\n\n`;
  if (!c.verified) out += `> ⚠️ No verified senior interview report — prep below is best-practice for this role archetype, not confirmed first-hand.\n\n`;

  out += `**Core subjects:** ${c.coreSubjects.join(", ")}\n\n`;

  out += `**Skill requirements:**\n\n`;
  out += `| Skill | Required Rank |\n|---|---|\n`;
  for (const s of c.skills) out += `| ${skillName(s.id)} | ${s.requiredRank} |\n`;
  out += `\n`;

  out += `**Important projects to lead with:** ${c.projects.join("; ")}\n\n`;
  out += `**Recommended resume:** ${resumeInfo[c.resume].label} (\`${c.resume}\`) — ${c.resumeReason}\n\n`;

  out += `**Interview rounds:**\n\n`;
  c.rounds.forEach((r, i) => (out += `${i + 1}. ${r}\n`));
  out += `\n`;

  out += `**Prep checklist:**\n\n`;
  for (const t of c.prepTips) out += `- [ ] ${t}\n`;
  out += `\n---\n\n`;
}

writeFileSync(new URL("../COMPANIES.md", import.meta.url), out);
console.log(`Wrote COMPANIES.md — ${companies.length} companies.`);
