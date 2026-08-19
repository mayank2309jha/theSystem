import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import SkillGapCard from "../components/SkillGapCard";
import { skillGaps } from "../lib/prep";

export default function SkillMaxing() {
  const { skillLevels } = useOutletContext();
  const gaps = useMemo(() => skillGaps(skillLevels), [skillLevels]);

  const byCategory = useMemo(() => {
    const groups = {};
    for (const g of gaps) {
      groups[g.skill.category] ??= [];
      groups[g.skill.category].push(g);
    }
    return groups;
  }, [gaps]);

  return (
    <div className="system-panel p-6">
      <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Skill Maxing</p>
      <h2 className="font-display text-xl font-bold text-white mb-1">Skill Tree</h2>
      <p className="text-sm text-slate-400 mb-6">
        Every skill starts at E-Rank. Click one to see its roadmap, resources, and which gates it unlocks.
      </p>

      <div className="space-y-8">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-display text-sm uppercase tracking-widest text-slate-500 mb-3">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(({ skill, level, ceiling, gap }) => (
                <SkillGapCard key={skill.id} skill={skill} level={level} ceiling={ceiling} gap={gap} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
