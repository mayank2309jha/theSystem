import { RANK_ORDER, RANK_STYLES, getRankProgress, getLevelProgress } from "../lib/ranks";

// Accepts either `xp` (mission-driven Hunter Rank, uneven thresholds) or
// `level` (skill-mastery-driven Level 1-100, even bands) — exactly one
// should be passed. Same visual track either way.
export default function RankTrack({ xp, level, unitLabel = "XP" }) {
  const usingLevel = level !== undefined;
  const { current, next, isMaxRank, progress, xpIntoRank, xpForNext, levelIntoRank, levelForNext } = usingLevel
    ? getLevelProgress(level)
    : getRankProgress(xp);
  const into = usingLevel ? levelIntoRank : xpIntoRank;
  const forNext = usingLevel ? levelForNext : xpForNext;
  const currentIndex = RANK_ORDER.indexOf(current);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {RANK_ORDER.map((rank, i) => {
          const style = RANK_STYLES[rank];
          const achieved = i <= currentIndex;
          return (
            <div key={rank} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`font-display font-black w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all
                    ${achieved ? `${style.border} ${style.text} ${style.glow}` : "border-system-border text-slate-600"}
                    ${rank === current ? "scale-110" : ""}`}
                >
                  {rank}
                </div>
                <span className={`text-[10px] uppercase tracking-widest ${rank === current ? "text-system-blue" : "text-slate-600"}`}>
                  {rank === current ? "Now" : ""}
                </span>
              </div>
              {i < RANK_ORDER.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 bg-system-border relative overflow-hidden">
                  {i < currentIndex && <div className="absolute inset-0 bg-system-blue" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        {isMaxRank ? (
          <p className="text-center font-display text-rank-s text-sm tracking-widest system-glow-text">
            S-RANK ACHIEVED — YOU ARE THE STRONGEST HUNTER
          </p>
        ) : (
          <>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>
                Rank {current} → Rank {next}
              </span>
              <span>
                {into} / {forNext} {unitLabel}
              </span>
            </div>
            <div className="h-2 w-full bg-system-void rounded-full overflow-hidden border border-system-border">
              <div
                className="h-full bg-gradient-to-r from-system-blue-dim to-system-blue transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
