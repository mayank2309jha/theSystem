import { Link, useParams, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import RankPill from "../components/RankPill";
import OpenResumeButton from "../components/OpenResumeButton";
import MethodologyButton from "../components/MethodologyButton";
import CompanySkillMatrix from "../components/CompanySkillMatrix";
import { useClaimedSkills } from "../hooks/useClaimedSkills";
import { getCompany, companyReadinessFromSkillLevels, formatINR, resumeAlignmentScore } from "../lib/prep";
import { resumeInfo, RESUME_SLUG } from "../data/resumes";
import { useProfile } from "../hooks/useProfile";
import { useResume } from "../hooks/useResume";
import { isOwner } from "../lib/owner";
import { CONTEST_PLATFORMS, requiredRatingForRank, ratingGap } from "../lib/contestRatings";
import { analyzeResumeUrl } from "../lib/extractResumeSkills";
import { getAppResumeSignedUrl } from "../lib/appResumes";
import { scoreResumeQuality } from "../lib/resumeQuality";
import { scoreConfidence } from "../lib/confidence";

export default function CompanyDetail() {
  const { id } = useParams();
  const { catalog, provenLevels, companyPrepChecked, toggleCompanyPrepItem } = useOutletContext();
  const { data: profile } = useProfile();
  const { data: myResume, getSignedUrl: getMySignedUrl } = useResume();
  const { claimed } = useClaimedSkills(catalog);
  const company = getCompany(id);
  const checked = companyPrepChecked[id] ?? [];
  const owner = isOwner(profile);

  // Own-resume Resume Alignment/Quality/Confidence for this specific
  // company — additive to the existing Proven-based "Skill Requirement"
  // list above, and to the owner-only static-resume section below. Two
  // independent queries (one per audience) so neither fires for the other.
  const nonOwnerAnalysis = useQuery({
    queryKey: ["resume-analysis", myResume?.storage_path],
    enabled: !owner && !!myResume,
    queryFn: async () => analyzeResumeUrl(await getMySignedUrl(), catalog),
    staleTime: Infinity,
  });

  const ownerAnalysis = useQuery({
    queryKey: ["app-resume-analysis", company?.resume],
    enabled: owner && !!company,
    queryFn: async () => analyzeResumeUrl(await getAppResumeSignedUrl(company.resume), catalog),
    staleTime: Infinity,
  });

  if (!company) {
    return (
      <div className="system-panel p-6">
        <p className="text-slate-400">Unknown company.</p>
        <Link to="/companies" className="text-system-blue text-sm">← Back to Company Prep</Link>
      </div>
    );
  }

  const resume = resumeInfo[company.resume];
  const alignmentScore = resumeAlignmentScore(company.resume, company);

  const nonOwnerMetrics = nonOwnerAnalysis.data
    ? {
        alignment: companyReadinessFromSkillLevels(company, nonOwnerAnalysis.data.skillLevels),
        quality: scoreResumeQuality(nonOwnerAnalysis.data.text),
        confidence: scoreConfidence({ text: nonOwnerAnalysis.data.text, skillLevels: nonOwnerAnalysis.data.skillLevels, company }),
      }
    : null;

  const ownerMetrics = ownerAnalysis.data
    ? {
        quality: scoreResumeQuality(ownerAnalysis.data.text),
        confidence: scoreConfidence({ text: ownerAnalysis.data.text, skillLevels: ownerAnalysis.data.skillLevels, company }),
      }
    : null;

  function toggle(i) {
    toggleCompanyPrepItem(id, i);
  }

  return (
    <div className="space-y-6">
      <MethodologyButton pageKey="company-prep" />
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
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-2">DSA Level Required</p>
          <div className="flex items-center gap-3 flex-wrap">
            <RankPill rank={company.dsaLevel} label="DSA" />
            {profile?.contest_platform && (
              <RatingComparison
                platform={profile.contest_platform}
                userRating={profile.contest_rating}
                requiredRank={company.dsaLevel}
              />
            )}
          </div>
          {!profile?.contest_platform && (
            <p className="text-[11px] text-slate-500 mt-1.5">
              <Link to="/profile" className="text-system-blue hover:underline">
                Set your contest rating on Profile
              </Link>{" "}
              to compare it against this rank as an estimated Codeforces/CodeChef/LeetCode number.
            </p>
          )}

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
          {owner ? (
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
                <p className="text-xs text-slate-500 italic mb-2">{company.resumeReason}</p>
                <p className="text-[10px] text-slate-500">
                  Alignment above is Engine A (hand-authored per-resume weights, see docs/ResumetoCompany.md).
                  {ownerMetrics && (
                    <>
                      {" "}
                      Quality: <span className="text-slate-300">{ownerMetrics.quality.overall}/100</span> · Confidence:{" "}
                      <span className="text-slate-300">{ownerMetrics.confidence.overall}%</span>.
                    </>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-2" title="How closely does this resume match what this company looks for?">
                Resume Fit
              </p>
              {nonOwnerMetrics ? (
                <div className="border border-system-blue/40 bg-system-blue/5 rounded p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-display text-lg font-bold text-system-blue">{nonOwnerMetrics.alignment}%</p>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Alignment</p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-200">{nonOwnerMetrics.quality.overall}</p>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Quality /100</p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-200">{nonOwnerMetrics.confidence.overall}%</p>
                      <p className="text-[9px] uppercase tracking-wide text-slate-500">Confidence</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    From your uploaded resume's <strong className="text-slate-400">Claimed</strong> skills against
                    this company — not the same as being actually prepared. See{" "}
                    <Link to="/resume" className="text-system-blue hover:underline">My Resume</Link> for the full
                    36-company view.
                  </p>
                </div>
              ) : myResume ? (
                <div className="border border-system-border bg-system-void/30 rounded p-3">
                  <p className="text-xs text-slate-400">Scoring your resume against {company.name}...</p>
                </div>
              ) : (
                <div className="border border-system-border bg-system-void/30 rounded p-3">
                  <p className="text-xs text-slate-400">
                    Upload a resume on <Link to="/resume" className="text-system-blue hover:underline">My Resume</Link> to
                    see how it stacks up here, or try the public Resume Compatibility Checker — no account needed,
                    nothing stored.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CompanySkillMatrix catalog={catalog} company={company} claimed={claimed} provenLevels={provenLevels} />

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

function RatingComparison({ platform, userRating, requiredRank }) {
  const required = requiredRatingForRank(platform, requiredRank);
  const gap = ratingGap(userRating, platform, requiredRank);
  const label = CONTEST_PLATFORMS[platform]?.label ?? platform;
  const cleared = gap !== null && gap >= 0;

  return (
    <span className="text-[11px] text-slate-500">
      Est. {label} bar: <span className="text-slate-300 font-display">~{required}</span>
      {userRating != null && (
        <>
          {" "}
          · yours: <span className="text-slate-300 font-display">{userRating}</span>{" "}
          <span className={cleared ? "text-rank-d" : "text-slate-500"}>
            ({cleared ? `+${gap} clear` : `${gap} to go`})
          </span>
        </>
      )}
    </span>
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
