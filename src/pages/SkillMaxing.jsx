import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import SkillGapCard from "../components/SkillGapCard";
import { nextMilestone } from "../lib/prep";
import { skillRankForLevel } from "../lib/ranks";
import { skillCatalog } from "../data/skills";

export default function SkillMaxing() {
  const { skillLevels } = useOutletContext();
  const [query, setQuery] = useState("");

  const overview = useMemo(
    () =>
      skillCatalog.map((skill) => {
        const level = skillLevels[skill.id] ?? skill.level;
        return { skill, level, currentRank: skillRankForLevel(level), milestone: nextMilestone(skill.id, level) };
      }),
    [skillLevels]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return overview;
    return overview.filter(
      ({ skill }) =>
        skill.name.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q) ||
        (skill.subskills ?? []).some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [overview, query]);

  const byCategory = useMemo(() => {
    const groups = {};
    for (const g of filtered) {
      groups[g.skill.category] ??= [];
      groups[g.skill.category].push(g);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="system-panel p-6">
      <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Skill Maxing</p>
      <h2 className="font-display text-xl font-bold text-white mb-1">Skill Tree</h2>
      <p className="text-sm text-slate-400 mb-4">
        Every skill starts at E-Rank. Each card shows the next rank that actually unlocks more companies for
        that skill — not a fixed target everyone is assumed to need. Click one for the full breakdown and roadmap.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a skill or subskill (e.g. React, HLD, Kafka, Docker)..."
        className="w-full mb-6 bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
      />

      <div className="space-y-8">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-display text-sm uppercase tracking-widest text-slate-500 mb-3">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(({ skill, level, currentRank, milestone }) => (
                <SkillGapCard key={skill.id} skill={skill} level={level} currentRank={currentRank} milestone={milestone} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-500 italic">No skill matches "{query}".</p>}
      </div>
    </div>
  );
}
