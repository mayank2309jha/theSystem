import { Link } from "react-router-dom";
import { skillRankForLevel } from "../lib/ranks";
import RankPill from "./RankPill";

export default function SkillGapCard({ skill, level, ceiling, gap }) {
  const currentRank = skillRankForLevel(level);
  return (
    <Link
      to={`/skill/${skill.id}`}
      className="block border border-system-border bg-system-void/30 rounded p-4 hover:border-system-blue transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display font-bold text-sm text-slate-100 group-hover:text-system-blue transition-colors">{skill.name}</h3>
        {gap > 0 ? (
          <span className="text-[10px] font-display uppercase text-danger whitespace-nowrap">{gap} rank{gap > 1 ? "s" : ""} short</span>
        ) : (
          <span className="text-[10px] font-display uppercase text-rank-d whitespace-nowrap">On target</span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{skill.category}</p>
      <div className="flex items-center gap-2">
        <RankPill rank={currentRank} label="Now" />
        {ceiling && <span className="text-slate-600 text-xs">→</span>}
        {ceiling && <RankPill rank={ceiling} label="Needed" />}
      </div>
      <div className="h-1.5 w-full bg-system-void rounded-full overflow-hidden border border-system-border mt-3">
        <div className="h-full bg-gradient-to-r from-system-blue-dim to-system-blue" style={{ width: `${level}%` }} />
      </div>
    </Link>
  );
}
