import RankBadge from "./RankBadge";
import { DIFFICULTY_XP, MISSION_STATUSES } from "../data/seed";

const STATUS_STYLES = {
  Queued: "text-slate-400 border-slate-600",
  "In Progress": "text-system-blue border-system-blue",
  Cleared: "text-rank-d border-rank-d",
  Failed: "text-danger border-danger",
};

export default function MissionCard({ mission, onSetStatus, onRemove }) {
  const currentIndex = MISSION_STATUSES.indexOf(mission.status);
  const canAdvance = mission.status !== "Cleared" && mission.status !== "Failed";

  return (
    <div className="border border-system-border bg-system-void/30 rounded p-3 group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-slate-100">{mission.company}</p>
          <p className="text-xs text-slate-400">{mission.role}</p>
        </div>
        <RankBadge rank={mission.difficulty} size="sm" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] uppercase tracking-wider">
        <span className="px-1.5 py-0.5 rounded border border-system-border text-slate-400">{mission.type}</span>
        <span className={`px-1.5 py-0.5 rounded border ${STATUS_STYLES[mission.status]}`}>{mission.status}</span>
        <span className="px-1.5 py-0.5 rounded border border-system-border text-system-gold">
          +{DIFFICULTY_XP[mission.difficulty]} XP
        </span>
      </div>

      {mission.notes && <p className="text-xs text-slate-500 mt-2">{mission.notes}</p>}
      {mission.deadline && (
        <p className="text-[10px] text-slate-600 mt-1">Deadline: {mission.deadline}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-system-border/60">
        <div className="flex gap-1.5">
          {canAdvance && (
            <button
              onClick={() => onSetStatus(mission.id, MISSION_STATUSES[currentIndex + 1])}
              className="text-[11px] font-display px-2 py-1 rounded border border-system-blue text-system-blue hover:bg-system-blue hover:text-system-void transition-colors"
            >
              Advance →
            </button>
          )}
          {mission.status !== "Failed" && mission.status !== "Cleared" && (
            <button
              onClick={() => onSetStatus(mission.id, "Failed")}
              className="text-[11px] font-display px-2 py-1 rounded border border-danger text-danger hover:bg-danger hover:text-system-void transition-colors"
            >
              Mark Failed
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(mission.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-danger transition-opacity text-xs"
          aria-label={`Remove ${mission.company} mission`}
          title="Remove mission"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
