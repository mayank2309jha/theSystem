import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import StatusWindow from "../components/StatusWindow";
import CompanyCard from "../components/CompanyCard";
import SkillGapCard from "../components/SkillGapCard";
import MissionBoard from "../components/MissionBoard";
import { companiesSortedByDay, skillGaps } from "../lib/prep";
import { skillCatalog } from "../data/skills";

export default function Home() {
  const { playerName, xp, missionStats, skillLevels, missions, addMission, setMissionStatus, removeMission } = useOutletContext();

  const priorityCompanies = useMemo(() => companiesSortedByDay().slice(0, 6), []);
  const topGaps = useMemo(() => skillGaps(skillLevels).slice(0, 6), [skillLevels]);

  return (
    <div className="space-y-6">
      <StatusWindow
        playerName={playerName}
        xp={xp}
        missionStats={missionStats}
        skillStats={{ count: skillCatalog.length }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Company Specific Prep</p>
          <h3 className="font-display text-lg font-bold text-white mb-4">Nearest Quests (by Placement Day)</h3>
          <div className="space-y-2.5">
            {priorityCompanies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        </div>

        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Skill Maxing</p>
          <h3 className="font-display text-lg font-bold text-white mb-4">Biggest Skill Gaps</h3>
          <div className="space-y-2.5">
            {topGaps.map(({ skill, level, ceiling, gap }) => (
              <SkillGapCard key={skill.id} skill={skill} level={level} ceiling={ceiling} gap={gap} />
            ))}
          </div>
        </div>
      </div>

      <MissionBoard missions={missions} onAdd={addMission} onSetStatus={setMissionStatus} onRemove={removeMission} />
    </div>
  );
}
