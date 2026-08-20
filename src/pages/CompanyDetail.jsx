import { Link, useParams, useOutletContext } from "react-router-dom";
import RankPill from "../components/RankPill";
import OpenResumeButton from "../components/OpenResumeButton";
import { skillRankForLevel } from "../lib/ranks";
import { getCompany, companySkillReadiness, formatINR, resumeAlignmentScore } from "../lib/prep";
import { resumeInfo, RESUME_SLUG } from "../data/resumes";
import { useProfile } from "../hooks/useProfile";
import { isOwner } from "../lib/owner";

export default function CompanyDetail() {
  const { id } = useParams();
  const { skillLevels, companyPrepChecked, toggleCompanyPrepItem } = useOutletContext();
  const { data: profile } = useProfile();
  const company = getCompany(id);
  const checked = companyPrepChecked[id] ?? [];

  if (!company) {
    return (
      <div className="system-panel p-6">
        <p className="text-slate-400">Unknown company.</p>
        <Link to="/companies" className="text-system-blue text-sm">← Back to Company Prep</Link>
      </div>
    );
  }

  const readiness = companySkillReadiness(company, skillLevels);
  const resume = resumeInfo[company.resume];
  const alignmentScore = resumeAlignmentScore(company.resume, company);

  function toggle(i) {
    toggleCompanyPrepItem(id, i);
  }

  return (
    <div className="space-y-6">
      <Link to="/companies" className="text-system-blue text-xs font-display uppercase tracking-widest hover:underline">
        ← Back to Company Specific Prep
      </Link>

      <div className="system-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-white system-glow-text">{company.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{company.role}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <RankPill rank={company.overallRank} label="Overall" />
            {!company.verified && (
              <span className="text-[10px] px-2 py-0.5 rounded border border-danger/50 text-danger uppercase tracking-wider">
                No verified senior report — best-practice prep
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Stat label="Base" value={formatINR(company.base)} />
          <Stat label="CTC" value={formatINR(company.ctc)} accent="text-system-gold" />
          <Stat label="Day" value={typeof company.day === "number" ? company.day : "TBD"} />
          <Stat label="Locations" value={company.locations} small />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-3">Skill Requirement</p>
          <div className="space-y-2.5">
            {readiness.map((r) => {
              const currentRank = skillRankForLevel(r.level);
              return (
                <Link
                  key={r.id}
                  to={`/skill/${r.id}`}
                  className="flex items-center justify-between border border-system-border bg-system-void/30 rounded px-3 py-2 hover:border-system-blue transition-colors group"
                >
                  <span className="text-sm text-slate-200 group-hover:text-system-blue transition-colors">{r.skill?.name ?? r.id}</span>
                  <div className="flex items-center gap-2">
                    <RankPill rank={currentRank} />
                    <span className="text-slate-600 text-xs">→</span>
                    <RankPill rank={r.requiredRank} />
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mt-5 mb-2">DSA Level Required</p>
          <RankPill rank={company.dsaLevel} label="DSA" />

          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mt-5 mb-2">Core Subjects</p>
          <div className="flex flex-wrap gap-1.5">
            {company.coreSubjects.map((s) => (
              <span key={s} className="text-[11px] px-2 py-1 rounded border border-system-border text-slate-300">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-3">Important Projects</p>
          <ul className="space-y-1.5 mb-5">
            {company.projects.map((p) => (
              <li key={p} className="text-sm text-slate-300 border-l-2 border-system-blue/50 pl-2.5">
                {p}
              </li>
            ))}
          </ul>

          {isOwner(profile) ? (
            <>
              <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-2">Which Resume to Send</p>
              <div className="border border-system-blue/40 bg-system-blue/5 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/resume/${RESUME_SLUG[company.resume]}`} className="font-display font-semibold text-system-blue hover:underline">
                    {resume.label} · {alignmentScore}% aligned
                  </Link>
                  <OpenResumeButton
                    file={company.resume}
                    className="text-[11px] font-display uppercase tracking-wider text-system-blue border border-system-blue px-2 py-1 rounded hover:bg-system-blue hover:text-system-void transition-colors disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-slate-400 mb-1.5">{resume.focus}</p>
                <p className="text-xs text-slate-500 italic">{company.resumeReason}</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-2">Resume Fit</p>
              <div className="border border-system-border bg-system-void/30 rounded p-3">
                <p className="text-xs text-slate-400">
                  Want to see how <em>your own</em> resume stacks up against this company? Try the public Resume
                  Compatibility Checker — no account needed, nothing stored.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-3">Interview Rounds</p>
          <ol className="space-y-2.5">
            {company.rounds.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2.5">
                <span className="font-display text-system-blue/70 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-3">Prep Roadmap</p>
          <ul className="space-y-2">
            {company.prepTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <button
                  onClick={() => toggle(i)}
                  className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                    checked[i] ? "bg-system-blue border-system-blue text-system-void" : "border-system-border text-transparent"
                  }`}
                >
                  ✓
                </button>
                <span className={`text-sm ${checked[i] ? "text-slate-500 line-through" : "text-slate-300"}`}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-white", small = false }) {
  return (
    <div className="border border-system-border bg-system-void/40 rounded px-3 py-2 text-center">
      <p className={`font-display ${small ? "text-xs" : "text-lg"} font-bold ${accent}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </div>
  );
}
