import RankBadge from "./RankBadge";
import RankTrack from "./RankTrack";
import { skillRankForLevel } from "../lib/ranks";

export default function StatusWindow({ playerName, xp, level, missionStats, skillStats }) {
  const rank = skillRankForLevel(level);

  return (
    <div className="system-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase">Status Window</p>
          <h2 className="font-display text-2xl font-bold text-white system-glow-text">{playerName}</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black text-system-blue system-glow-text leading-none">
            LV {level}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">of 100</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <RankBadge rank={rank} size="lg" />
        <div className="flex-1">
          <RankTrack level={level} unitLabel="Lv" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <Stat label="Total XP" value={xp} />
        <Stat label="Missions Cleared" value={missionStats.cleared} accent="text-rank-d" />
        <Stat label="Active Missions" value={missionStats.active} accent="text-system-blue" />
        <Stat label="Skills Tracked" value={skillStats.count} accent="text-system-violet" />
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="border border-system-border bg-system-void/40 rounded px-3 py-2 text-center">
      <p className={`font-display text-xl font-bold ${accent}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </div>
  );
}
