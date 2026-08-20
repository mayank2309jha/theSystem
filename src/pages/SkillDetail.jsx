import { useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import RankPill from "../components/RankPill";
import ProgressChart from "../components/ProgressChart";
import MethodologyButton from "../components/MethodologyButton";
import { skillRankForLevel, proficiencyLabel, rankIndex } from "../lib/ranks";
import { getSkill, skillUnlockCurve, nextMilestone } from "../lib/prep";
import { useSubskillMastery } from "../hooks/useSubskillMastery";
import { masteryScore, weakAreas, MASTERY_LEVELS } from "../lib/mastery";

export default function SkillDetail() {
  const { id } = useParams();
  const { catalog, catalogLoading, catalogError, skillLevels, setSkillLevel, provenLevels, subskillTodos, toggleSubskillTodo, today } =
    useOutletContext();
  const skill = getSkill(catalog, id);
  // Called unconditionally, before the early returns below — React's Rules
  // of Hooks require every hook to run in the same order on every render,
  // regardless of whether `skill` turns out to exist.
  const { masteryBySubskillId, updateMastery } = useSubskillMastery();

  if (!skill) {
    if (catalogLoading) {
      return (
        <div className="system-panel p-6">
          <p className="text-slate-500 text-sm">Loading skill catalog...</p>
        </div>
      );
    }
    if (catalogError) {
      return (
        <div className="system-panel p-6">
          <p className="text-sm text-danger border border-danger/40 bg-danger/10 rounded px-3 py-2">
            Couldn't load the skill catalog — the <code>skills</code>/<code>subskills</code> tables may not exist in
            Supabase yet. Re-run <code>supabase/schema.sql</code>, then the seed script (see README).
          </p>
        </div>
      );
    }
    return (
      <div className="system-panel p-6">
        <p className="text-slate-400">Unknown skill.</p>
        <Link to="/skills" className="text-system-blue text-sm">← Back to Skill Maxing</Link>
      </div>
    );
  }

  // PROVEN — evidence-based (subskill/todo completion, weighted). This is
  // what drives the rank badge, the milestone messaging, and everything
  // company-facing. Deliberately NOT the slider below — see lib/prep.js's
  // provenSkillLevel and docs/CONTEXT.md for why that split exists.
  const level = provenLevels[id] ?? 0;
  const currentRank = skillRankForLevel(level);
  const currentIdx = rankIndex(currentRank);
  const curve = skillUnlockCurve(id);
  const milestone = nextMilestone(id, level);
  const total = curve[curve.length - 1].total;
  const subskills = skill.subskills ?? [];

  // Self-Assessment — the old manual slider. Purely a personal gut-check now;
  // reading/writing it never touches Proven, company readiness, or anything
  // else in the app.
  const selfAssessedLevel = skillLevels[id] ?? skill.level;

  // Mastery — a NEW, separate signal (0-6 per subskill: Not Started..
  // Advanced), independent of Proven and Self-Assessment. See lib/mastery.js.
  const score = masteryScore(skill, masteryBySubskillId);
  const weak = weakAreas(skill, masteryBySubskillId, skill.preparednessTarget);

  return (
    <div className="space-y-6">
      <MethodologyButton pageKey="skill-maxing" />
      <Link to="/skills" className="text-system-blue text-xs font-display uppercase tracking-widest hover:underline">
        ← Back to Skill Maxing
      </Link>

      <div className="system-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{skill.category}</p>
            <h2 className="font-display text-2xl font-bold text-white system-glow-text">{skill.name}</h2>
          </div>
          <div className="text-right">
            <RankPill rank={currentRank} label="Proven" />
            <p className="text-[10px] text-slate-500 mt-1">{level}% from checked evidence below</p>
          </div>
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

        <div className="mt-5 pt-4 border-t border-system-border">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Self-Assessment</p>
          <p className="text-[11px] text-slate-500 mb-3">
            Your own gut-check — a personal reflection input only. It does not affect Proven, Company Prep
            readiness, "Where to Focus Next," or Resume Alignment anywhere in the app; only the checked evidence
            below does.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={selfAssessedLevel}
              onChange={(e) => setSkillLevel(id, Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="font-display text-sm text-slate-400 w-12 text-right">{selfAssessedLevel}%</span>
          </div>
          <div className="h-2 w-full bg-system-void rounded-full overflow-hidden border border-system-border mt-1.5">
            <div className="h-full bg-system-border transition-all" style={{ width: `${selfAssessedLevel}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{proficiencyLabel(selfAssessedLevel)} · drag to update as you see yourself</p>
        </div>

        <div className="mt-5 pt-4 border-t border-system-border">
          <ProgressChart
            history={[{ date: today, level }]}
            currentLevel={level}
            todayStr={today}
            title="This Skill's Pace (Proven)"
            subtitle="A day-by-day trail isn't tracked per skill (only overall Level is, on Home) — this shows where an even pace to full mastery would put you today versus your actual Proven evidence."
          />
        </div>
      </div>

      <div className="system-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase">Mastery</p>
            <p className="text-[11px] text-slate-500">
              A separate, richer signal from Proven — your own graded self-assessment per subskill (0-6), not
              derived from checkboxes. Set it per subskill below.
            </p>
          </div>
          <p className="font-display text-2xl font-bold text-system-violet whitespace-nowrap">
            {score}<span className="text-sm text-slate-500">/6</span>
          </p>
        </div>

        {weak.length > 0 && (
          <div className="mt-3 border border-danger/40 bg-danger/5 rounded p-3">
            <p className="text-[10px] uppercase tracking-widest text-danger mb-1.5">Weak Areas</p>
            <ul className="space-y-1">
              {weak.slice(0, 5).map((w) => (
                <li key={w.subskill.id} className="text-xs text-slate-300 flex items-center justify-between gap-2">
                  <span>
                    {w.subskill.name}
                    {w.highImportance && <span className="text-system-gold"> · high importance</span>}
                    {w.belowTarget && <span className="text-danger"> · below target</span>}
                  </span>
                  <span className="text-slate-500 font-display">{w.level}/6</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Subskills</p>
          <p className="text-[11px] text-slate-500 mb-3">
            What you need to actually be able to do to say you know each of these — check them off as you genuinely
            can, and set your Mastery level for each.
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
                  <div className="space-y-1.5 mb-3">
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
                  <SubskillMastery subskillId={sub.id} row={masteryBySubskillId[sub.id]} onChange={updateMastery} />
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

// Per-subskill Mastery controls — mastery_level/confidence_level dropdowns
// (always visible) plus notes/interview_notes/mistakes (collapsed by
// default, per "gradual enrichment" — most subskills will never need them
// filled in, and showing three empty textareas per subskill by default would
// bury the actual checklist above).
function SubskillMastery({ subskillId, row, onChange }) {
  const [notesOpen, setNotesOpen] = useState(false);
  // Local draft state for the free-text fields, saved on blur rather than on
  // every keystroke — an onChange-per-keystroke mutation would hammer the DB
  // for something as simple as typing a sentence. The dropdowns below don't
  // need this (a discrete select firing once per choice is fine as-is).
  const [notesDraft, setNotesDraft] = useState(row?.notes ?? "");
  const [interviewNotesDraft, setInterviewNotesDraft] = useState(row?.interview_notes ?? "");
  const [mistakesDraft, setMistakesDraft] = useState(row?.mistakes ?? "");
  const masteryLevel = row?.mastery_level ?? 0;
  const confidenceLevel = row?.confidence_level ?? null;

  return (
    <div className="border-t border-system-border pt-2.5">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <label className="text-[10px] uppercase tracking-widest text-slate-500">Mastery</label>
        <select
          value={masteryLevel}
          onChange={(e) => onChange(subskillId, { mastery_level: Number(e.target.value) })}
          className="bg-system-void/60 border border-system-border rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-system-blue"
        >
          {MASTERY_LEVELS.map((m) => (
            <option key={m.level} value={m.level}>
              {m.level} — {m.label}
            </option>
          ))}
        </select>

        <label className="text-[10px] uppercase tracking-widest text-slate-500 ml-2">Confidence</label>
        <select
          value={confidenceLevel ?? ""}
          onChange={(e) => onChange(subskillId, { confidence_level: e.target.value === "" ? null : Number(e.target.value) })}
          className="bg-system-void/60 border border-system-border rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-system-blue"
        >
          <option value="">—</option>
          {MASTERY_LEVELS.map((m) => (
            <option key={m.level} value={m.level}>
              {m.level}
            </option>
          ))}
        </select>

        <button onClick={() => setNotesOpen((o) => !o)} className="text-[10px] text-system-blue hover:underline ml-auto">
          {notesOpen ? "Hide notes" : "+ Notes"}
        </button>
      </div>

      {notesOpen && (
        <div className="space-y-1.5 mt-2">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={() => notesDraft !== (row?.notes ?? "") && onChange(subskillId, { notes: notesDraft })}
            placeholder="Notes..."
            rows={2}
            className="w-full bg-system-void/60 border border-system-border rounded px-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-system-blue resize-y"
          />
          <textarea
            value={interviewNotesDraft}
            onChange={(e) => setInterviewNotesDraft(e.target.value)}
            onBlur={() =>
              interviewNotesDraft !== (row?.interview_notes ?? "") && onChange(subskillId, { interview_notes: interviewNotesDraft })
            }
            placeholder="Interview notes..."
            rows={2}
            className="w-full bg-system-void/60 border border-system-border rounded px-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-system-blue resize-y"
          />
          <textarea
            value={mistakesDraft}
            onChange={(e) => setMistakesDraft(e.target.value)}
            onBlur={() => mistakesDraft !== (row?.mistakes ?? "") && onChange(subskillId, { mistakes: mistakesDraft })}
            placeholder="Mistakes to remember..."
            rows={2}
            className="w-full bg-system-void/60 border border-system-border rounded px-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-system-blue resize-y"
          />
        </div>
      )}
    </div>
  );
}
