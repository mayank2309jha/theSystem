import { Link, useParams, useOutletContext } from "react-router-dom";
import RankPill from "../components/RankPill";
import ProgressChart from "../components/ProgressChart";
import { skillRankForLevel, proficiencyLabel, rankIndex } from "../lib/ranks";
import { getSkill, skillUnlockCurve, nextMilestone } from "../lib/prep";

export default function SkillDetail() {
  const { id } = useParams();
  const { skillLevels, setSkillLevel, subskillTodos, toggleSubskillTodo, today } = useOutletContext();
  const skill = getSkill(id);

  if (!skill) {
    return (
      <div className="system-panel p-6">
        <p className="text-slate-400">Unknown skill.</p>
        <Link to="/skills" className="text-system-blue text-sm">← Back to Skill Maxing</Link>
      </div>
    );
  }

  const level = skillLevels[id] ?? skill.level;
  const currentRank = skillRankForLevel(level);
  const currentIdx = rankIndex(currentRank);
  const curve = skillUnlockCurve(id);
  const milestone = nextMilestone(id, level);
  const total = curve[curve.length - 1].total;
  const subskills = skill.subskills ?? [];

  return (
    <div className="space-y-6">
      <Link to="/skills" className="text-system-blue text-xs font-display uppercase tracking-widest hover:underline">
        ← Back to Skill Maxing
      </Link>

      <div className="system-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{skill.category}</p>
            <h2 className="font-display text-2xl font-bold text-white system-glow-text">{skill.name}</h2>
          </div>
          <RankPill rank={currentRank} label="Now" />
        </div>

        <p className="text-sm text-slate-400 mb-4">{skill.why}</p>

        {total > 0 && (
          <p className="text-xs text-slate-500 mb-4">
            {milestone ? (
              <>
                <span className="text-system-blue font-semibold">
                  Reach {milestone.rank}-Rank → unlocks {milestone.newlyUnlockedCount} more compan
                  {milestone.newlyUnlockedCount === 1 ? "y" : "ies"}
                </span>{" "}
                ({milestone.totalUnlockedAfter}/{total} covered at that rank). No assumption that you need the
                hardest company's bar — see the full breakdown below and pick your own target.
              </>
            ) : (
              <span className="text-rank-d font-semibold">Your current rank already covers every company that lists this skill.</span>
            )}
          </p>
        )}

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={level}
            onChange={(e) => setSkillLevel(id, Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="font-display text-sm text-system-blue w-12 text-right">{level}%</span>
        </div>
        <div className="h-2 w-full bg-system-void rounded-full overflow-hidden border border-system-border mt-1.5">
          <div className="h-full bg-gradient-to-r from-system-blue-dim to-system-blue transition-all" style={{ width: `${level}%` }} />
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">{proficiencyLabel(level)} · drag to update as you actually improve</p>

        <div className="mt-5 pt-4 border-t border-system-border">
          <ProgressChart
            history={[{ date: today, level }]}
            currentLevel={level}
            todayStr={today}
            title="This Skill's Pace"
            subtitle="A day-by-day trail isn't tracked per skill (only overall progress is, on Home) — this shows where an even pace to full mastery would put you today versus where you actually are."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Subskills</p>
          <p className="text-[11px] text-slate-500 mb-3">
            What you need to actually be able to do to say you know each of these — check them off as you genuinely
            can.
          </p>
          {subskills.length === 0 && <p className="text-sm text-slate-500 italic">No subskill breakdown yet for this skill.</p>}
          <div className="space-y-4">
            {subskills.map((sub) => {
              const todos = sub.todos ?? [];
              const doneCount = todos.filter((_, i) => subskillTodos[`${id}:${sub.id}:${i}`]).length;
              return (
                <div key={sub.id} className="border border-system-border bg-system-void/30 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-200">{sub.name}</p>
                    <span className="text-[10px] text-slate-500 font-display">
                      {doneCount}/{todos.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {todos.map((todo, i) => {
                      const todoId = `${id}:${sub.id}:${i}`;
                      const checked = !!subskillTodos[todoId];
                      return (
                        <label key={todoId} className="flex items-start gap-2.5 cursor-pointer group">
                          <button
                            type="button"
                            onClick={() => toggleSubskillTodo(todoId)}
                            className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                              checked ? "bg-system-blue border-system-blue text-system-void" : "border-system-border text-transparent group-hover:border-system-blue/60"
                            }`}
                          >
                            ✓
                          </button>
                          <span className={`text-xs ${checked ? "text-slate-500 line-through" : "text-slate-300"}`}>{todo}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Which Companies Need This</p>
          <p className="text-[11px] text-slate-500 mb-3">Grouped by the rank they actually require — pick your own target.</p>
          {total === 0 && <p className="text-sm text-slate-500 italic">No mapped companies require this yet.</p>}
          <div className="space-y-4">
            {curve
              .filter((tier) => tier.newlyUnlocked.length > 0)
              .map((tier) => (
                <div key={tier.rank}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <RankPill rank={tier.rank} />
                    <span className="text-[11px] text-slate-500">
                      {tier.newlyUnlocked.length} compan{tier.newlyUnlocked.length === 1 ? "y" : "ies"}
                      {rankIndex(tier.rank) === currentIdx && <span className="text-system-blue"> · your current rank</span>}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {tier.newlyUnlocked.map((company) => (
                      <Link
                        key={company.id}
                        to={`/company/${company.id}`}
                        className="flex items-center justify-between border border-system-border bg-system-void/30 rounded px-3 py-1.5 hover:border-system-blue transition-colors group"
                      >
                        <span className="text-sm text-slate-200 group-hover:text-system-blue transition-colors">{company.name}</span>
                        <span className="text-[11px] text-slate-500">{company.role}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
