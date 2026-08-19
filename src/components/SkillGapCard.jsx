import { Link } from "react-router-dom";
import RankPill from "./RankPill";

// Deliberately does not assume a universal target rank — shows the CURRENT
// rank plus the next concrete milestone ("reach D-Rank, unlock 6 more
// companies"), which depends on nothing but the skill's real data. If a
// user wants to chase a specific company's bar, they do that from the
// company page; this card never implies "you must reach A-Rank."
export default function SkillGapCard({ skill, level, currentRank, milestone }) {
  return (
    <Link
      to={`/skill/${skill.id}`}
      className="block border border-system-border bg-system-void/30 rounded p-4 hover:border-system-blue transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display font-bold text-sm text-slate-100 group-hover:text-system-blue transition-colors">{skill.name}</h3>
        {!milestone && (
          <span className="text-[10px] font-display uppercase text-rank-d whitespace-nowrap">Covers every company</span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{skill.category}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <RankPill rank={currentRank} label="Now" />
        {milestone && (
          <>
            <span className="text-slate-600 text-xs">→</span>
            <RankPill rank={milestone.rank} />
            <span className="text-[11px] text-system-blue">
              unlocks {milestone.newlyUnlockedCount} more compan{milestone.newlyUnlockedCount === 1 ? "y" : "ies"}
            </span>
          </>
        )}
      </div>
      <div className="h-1.5 w-full bg-system-void rounded-full overflow-hidden border border-system-border mt-3">
        <div className="h-full bg-gradient-to-r from-system-blue-dim to-system-blue" style={{ width: `${level}%` }} />
      </div>
    </Link>
  );
}
