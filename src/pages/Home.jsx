import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import StatusWindow from "../components/StatusWindow";
import CompanyCard from "../components/CompanyCard";
import SkillGapCard from "../components/SkillGapCard";
import MissionBoard from "../components/MissionBoard";
import ProgressChart from "../components/ProgressChart";
import MethodologyButton from "../components/MethodologyButton";
import { companiesSortedByDay, skillPriorities } from "../lib/prep";
import { methodology } from "../data/methodology";

export default function Home() {
  const {
    playerName,
    catalog,
    xp,
    level,
    levelHistory,
    today,
    missionStats,
    provenLevels,
    missions,
    addMission,
    setMissionStatus,
    removeMission,
  } = useOutletContext();

  const priorityCompanies = useMemo(() => companiesSortedByDay().slice(0, 6), []);
  const topPriorities = useMemo(() => skillPriorities(catalog, provenLevels).slice(0, 6), [catalog, provenLevels]);

  return (
    <div className="space-y-6" title={methodology.home.hover}>
      <MethodologyButton pageKey="home" />
      <StatusWindow
        playerName={playerName}
        xp={xp}
        level={level}
        missionStats={missionStats}
        skillStats={{ count: catalog.length }}
      />

      <div className="system-panel p-6">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Progress Over Time</p>
        <ProgressChart
          history={levelHistory}
          currentLevel={level}
          todayStr={today}
          title="Overall Readiness — Aug 18 to Nov 30"
          subtitle="Your Level over time against an even pace to Level 100. One point per day you've used the app — it fills in as you keep going, not retroactively."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1" title={methodology["company-prep"].hover}>
            Company Specific Prep
          </p>
          <h3 className="font-display text-lg font-bold text-white mb-4">Nearest Quests (by Placement Day)</h3>
          <div className="space-y-2.5">
            {priorityCompanies.map((c) => (
              <CompanyCard key={c.id} company={c} skillLevels={provenLevels} />
            ))}
          </div>
        </div>

        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1" title={methodology["skill-maxing"].hover}>
            Skill Maxing
          </p>
          <h3 className="font-display text-lg font-bold text-white mb-1">Where to Focus Next</h3>
          <p className="text-xs text-slate-500 mb-4">
            Your next-highest-leverage step per skill — not a claim that you need top rank everywhere. Different
            companies want different things; browse Company Specific Prep to see exactly what your own targets need.
            Based on <strong className="text-slate-400">Proven</strong> skill (checked subskill evidence), not the
            self-assessment slider.
          </p>
          <div className="space-y-2.5">
            {topPriorities.map(({ skill, level: skillLevel, currentRank, milestone }) => (
              <SkillGapCard key={skill.id} skill={skill} level={skillLevel} currentRank={currentRank} milestone={milestone} />
            ))}
          </div>
        </div>
      </div>

      <MissionBoard missions={missions} onAdd={addMission} onSetStatus={setMissionStatus} onRemove={removeMission} />
    </div>
  );
}
