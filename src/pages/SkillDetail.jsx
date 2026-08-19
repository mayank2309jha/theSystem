import { Link, useParams, useOutletContext } from "react-router-dom";
import RankPill from "../components/RankPill";
import { skillRankForLevel, proficiencyLabel } from "../lib/ranks";
import { getSkill, companiesRequiringSkill, highestRequiredRank } from "../lib/prep";

export default function SkillDetail() {
  const { id } = useParams();
  const { skillLevels, setSkillLevel } = useOutletContext();
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
  const ceiling = highestRequiredRank(id);
  const requiredBy = [...companiesRequiringSkill(id)].sort((a, b) => (a.company.day ?? Infinity) - (b.company.day ?? Infinity));

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
          <div className="flex items-center gap-2">
            <RankPill rank={currentRank} label="Now" />
            {ceiling && <RankPill rank={ceiling} label="Target" />}
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4">{skill.why}</p>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-3">Roadmap to S-Rank</p>
          <ol className="space-y-2.5">
            {skill.roadmap.map((step, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2.5">
                <span className="font-display text-system-blue/70 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {skill.resources.length > 0 && (
            <>
              <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mt-5 mb-2">Resources</p>
              <ul className="space-y-1.5">
                {skill.resources.map((r, i) => (
                  <li key={i} className="text-sm text-slate-400 border-l-2 border-system-blue/50 pl-2.5">
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-3">Gates This Unlocks</p>
          {requiredBy.length === 0 && <p className="text-sm text-slate-500 italic">No mapped companies require this yet.</p>}
          <div className="space-y-2">
            {requiredBy.map(({ company, requiredRank }) => (
              <Link
                key={company.id}
                to={`/company/${company.id}`}
                className="flex items-center justify-between border border-system-border bg-system-void/30 rounded px-3 py-2 hover:border-system-blue transition-colors group"
              >
                <span className="text-sm text-slate-200 group-hover:text-system-blue transition-colors">{company.name}</span>
                <RankPill rank={requiredRank} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
