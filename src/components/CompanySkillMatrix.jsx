import { Link } from "react-router-dom";
import RankPill from "./RankPill";
import { rankIndex, skillRankForLevel } from "../lib/ranks";
import { getSkill } from "../lib/prep";

const GAP_LABELS = ["None", "Small", "Moderate", "Large", "Large", "Large"];

function gapLabel(requiredRank, provenRank) {
  const gap = rankIndex(requiredRank) - rankIndex(provenRank);
  if (gap <= 0) return { label: "None", met: true };
  return { label: GAP_LABELS[gap] ?? "Large", met: false };
}

// Required / Claimed / Proven / Gap, per the spec's own worked example.
// `claimed` is the {skillId: level} union from useClaimedSkills (Resume
// Raid's signal); `provenLevels` is from outletContext (Phase 1); `catalog`
// is the Supabase-fetched skill catalog, also from outletContext. Best/Least
// prepared are just this same list sorted by gap size — no separate formula.
export default function CompanySkillMatrix({ catalog, company, claimed, provenLevels }) {
  const rows = company.skills.map((req) => {
    const skill = getSkill(catalog, req.id);
    const proven = provenLevels[req.id] ?? 0;
    const provenRank = skillRankForLevel(proven);
    const isClaimed = (claimed?.[req.id] ?? 0) > 0;
    const { label: gap, met } = gapLabel(req.requiredRank, provenRank);
    return { skill, req, provenRank, isClaimed, gap, met };
  });

  const margin = (r) => rankIndex(r.provenRank) - rankIndex(r.req.requiredRank);
  const bestPrepared = rows.filter((r) => r.met).sort((a, b) => margin(b) - margin(a)).slice(0, 3);
  const leastPrepared = rows.filter((r) => !r.met).sort((a, b) => margin(a) - margin(b)).slice(0, 3);

  return (
    <div className="system-panel p-6">
      <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Company Skill Matrix</p>
      <h3 className="font-display text-lg font-bold text-white mb-1">Required vs. Claimed vs. Proven</h3>
      <p className="text-xs text-slate-500 mb-4">
        Claimed comes from Resume Raid (upload resumes there to populate it). Proven comes from checked subskill
        evidence on Skill Maxing — proving a skill here updates it everywhere, not just for this company.
      </p>

      {(bestPrepared.length > 0 || leastPrepared.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {bestPrepared.length > 0 && (
            <div className="border border-rank-d/40 bg-rank-d/5 rounded p-3">
              <p className="text-[10px] uppercase tracking-widest text-rank-d mb-1.5">Best Prepared</p>
              <ul className="space-y-1">
                {bestPrepared.map((r) => (
                  <li key={r.req.id} className="text-xs text-slate-300">{r.skill?.name ?? r.req.id}</li>
                ))}
              </ul>
            </div>
          )}
          {leastPrepared.length > 0 && (
            <div className="border border-danger/40 bg-danger/5 rounded p-3">
              <p className="text-[10px] uppercase tracking-widest text-danger mb-1.5">Least Prepared</p>
              <ul className="space-y-1">
                {leastPrepared.map((r) => (
                  <li key={r.req.id} className="text-xs text-slate-300">{r.skill?.name ?? r.req.id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-system-border">
              <th className="pb-2 pr-3">Skill</th>
              <th className="pb-2 pr-3">Required</th>
              <th className="pb-2 pr-3">Claimed</th>
              <th className="pb-2 pr-3">Proven</th>
              <th className="pb-2">Gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.req.id} className="border-b border-system-border/40">
                <td className="py-2 pr-3">
                  <Link to={`/skill/${r.req.id}`} className="text-slate-200 hover:text-system-blue transition-colors">
                    {r.skill?.name ?? r.req.id}
                  </Link>
                </td>
                <td className="py-2 pr-3">
                  <RankPill rank={r.req.requiredRank} />
                </td>
                <td className="py-2 pr-3 text-xs">
                  {r.isClaimed ? <span className="text-system-blue">Yes</span> : <span className="text-slate-600">No</span>}
                </td>
                <td className="py-2 pr-3">
                  <RankPill rank={r.provenRank} />
                </td>
                <td className={`py-2 text-xs font-semibold ${r.met ? "text-rank-d" : r.gap === "Large" ? "text-danger" : "text-system-gold"}`}>
                  {r.gap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
