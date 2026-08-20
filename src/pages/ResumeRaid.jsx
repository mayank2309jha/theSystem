import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import ResumeDropzone from "../components/ResumeDropzone";
import RankPill from "../components/RankPill";
import MethodologyButton from "../components/MethodologyButton";
import { useClaimedSkills } from "../hooks/useClaimedSkills";
import { skillRankForLevel } from "../lib/ranks";

export default function ResumeRaid() {
  const { catalog, claimSkills, provenLevels } = useOutletContext();
  const { resumes, resumesLoading, upload, uploadStatus, remove, claimed, scanning, scanError } = useClaimedSkills(catalog);
  const [uploadError, setUploadError] = useState(null);
  const [justClaimed, setJustClaimed] = useState({});
  const [introOpen, setIntroOpen] = useState(false);

  async function handleFile(file) {
    setUploadError(null);
    try {
      await upload(file);
    } catch {
      setUploadError("Upload failed — check your connection and try again.");
    }
  }

  async function handleDelete(resume) {
    if (!confirm(`Remove ${resume.original_filename} from Resume Raid?`)) return;
    await remove(resume);
  }

  function handleClaim(skillId) {
    claimSkills([skillId], 35);
    setJustClaimed((prev) => ({ ...prev, [skillId]: true }));
  }

  const claimedEntries = claimed
    ? catalog
        .filter((s) => claimed[s.id] > 0)
        .map((s) => ({
          skill: s,
          detectedLevel: claimed[s.id],
          detectedRank: skillRankForLevel(claimed[s.id]),
          proven: provenLevels[s.id] ?? 0,
          provenRank: skillRankForLevel(provenLevels[s.id] ?? 0),
        }))
        .sort((a, b) => b.detectedLevel - a.detectedLevel)
    : [];

  // Actual Skill vs. Unverified Claims — of everything claimed, how much has
  // at least SOME Proven evidence (>0, i.e. at least one subskill todo
  // checked)? A binary "demonstrated or not" bar, not an arbitrary
  // percentage threshold — see the Methodology panel for why.
  const demonstratedCount = claimedEntries.filter((e) => e.proven > 0).length;
  const actualSkillPct = claimedEntries.length === 0 ? 0 : Math.round((demonstratedCount / claimedEntries.length) * 100);

  const byCategory = {};
  for (const entry of claimedEntries) {
    byCategory[entry.skill.category] ??= [];
    byCategory[entry.skill.category].push(entry);
  }

  return (
    <div className="space-y-6">
      <MethodologyButton pageKey="resume-raid" />
      <div className="system-panel p-6">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Resume Raid</p>
        <h2 className="font-display text-xl font-bold text-white mb-1">Every Skill You've Claimed, On Paper</h2>

        <button
          onClick={() => setIntroOpen((o) => !o)}
          className="text-xs text-system-blue hover:underline mb-2"
        >
          {introOpen ? "▾ Hide" : "▸ What is Resume Raid?"}
        </button>
        {introOpen && (
          <div className="text-xs text-slate-400 leading-relaxed border-l-2 border-system-blue/40 pl-3 mb-4 space-y-1.5">
            <p>Resume Raid tells you what your resumes claim you are — it is resume-based interview preparation, not primarily a company-preparation tool.</p>
            <p>It analyzes every resume you upload, extracts mentioned skills/technologies/frameworks/tools, and maps them onto the skill catalogue (subskills included where detectable).</p>
            <p>Everything found becomes <strong className="text-slate-300">CLAIMED</strong> — not <strong className="text-slate-300">PROVEN</strong>. It helps you test whether you actually know what you claim, by linking straight into each skill's proof-of-skill checklist.</p>
          </div>
        )}

        <p className="text-sm text-slate-400 mb-4">
          Upload every resume you have — different variants, old drafts, all of them. This scans every project,
          course, and technology mentioned across all of them and builds one combined list: every skill you've
          claimed to know. Mentioning a skill on a resume isn't proof you actually know it — that's what the
          <Link to="/skills" className="text-system-blue hover:underline"> Skill Maxing </Link>
          subskill checklists are for. Think of this as raiding your own resumes for what you're on the hook to
          actually defend in an interview.
        </p>

        <ResumeDropzone onFile={handleFile} disabled={uploadStatus === "pending"} label="Add a resume to the raid" />
        {uploadStatus === "pending" && <p className="text-sm text-system-blue mt-3 animate-pulse">Uploading...</p>}
        {uploadError && <p className="text-sm text-danger mt-3">{uploadError}</p>}

        {!resumesLoading && resumes && resumes.length > 0 && (
          <div className="mt-4 space-y-2">
            {resumes.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-system-border bg-system-void/30 rounded px-3 py-2">
                <div>
                  <p className="text-sm text-slate-200">{r.original_filename}</p>
                  <p className="text-[11px] text-slate-500">{(r.file_size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={() => handleDelete(r)}
                  className="text-[11px] font-display uppercase tracking-wider text-danger border border-danger px-2 py-1 rounded hover:bg-danger hover:text-system-void transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {resumes && resumes.length > 0 && claimedEntries.length > 0 && (
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Actual Skill vs. Unverified Claims</p>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <div className="h-2.5 w-full bg-system-void rounded-full overflow-hidden border border-system-border flex">
                <div className="h-full bg-rank-d" style={{ width: `${actualSkillPct}%` }} />
                <div className="h-full bg-danger/50" style={{ width: `${100 - actualSkillPct}%` }} />
              </div>
            </div>
            <span className="font-display text-lg font-bold text-rank-d whitespace-nowrap">{actualSkillPct}% Actual Skill</span>
          </div>
          <p className="text-xs text-slate-500">
            {demonstratedCount} of {claimedEntries.length} claimed skills have at least some Proven evidence (a
            checked subskill todo) · {claimedEntries.length - demonstratedCount} are unverified claims — not an
            accusation, just "claimed but not yet demonstrated in THE SYSTEM." See Methodology for exactly how this
            is calculated.
          </p>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <div className="system-panel p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase">Claimed Skills</p>
            {scanning && <span className="text-[11px] text-system-blue animate-pulse">Scanning...</span>}
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1">
            {claimedEntries.length} skill{claimedEntries.length === 1 ? "" : "s"} found across {resumes.length} resume
            {resumes.length === 1 ? "" : "s"}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            A rough keyword-based detection, same engine as the Resume Compatibility Checker — a starting point, not
            a verdict. The <strong className="text-slate-400">Proven</strong> badge next to each is your real,
            evidence-based rank for that skill (same number Company Prep reads) — click "Test My Strength" to raise
            it.
          </p>

          {scanError && <p className="text-sm text-danger mb-4">{scanError}</p>}

          {claimedEntries.length === 0 && !scanning && (
            <p className="text-sm text-slate-500 italic">No recognizable skills detected yet.</p>
          )}

          <div className="space-y-6">
            {Object.entries(byCategory).map(([category, entries]) => (
              <div key={category}>
                <h4 className="font-display text-xs uppercase tracking-widest text-slate-500 mb-2">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {entries.map(({ skill, detectedRank, provenRank, proven }) => (
                    <div key={skill.id} className="border border-system-border bg-system-void/30 rounded p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">{skill.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <RankPill rank={detectedRank} label="Claimed" />
                          <RankPill rank={provenRank} label="Proven" />
                          {proven === 0 && <span className="text-[9px] text-danger uppercase tracking-wide">Unverified</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <Link
                          to={`/skill/${skill.id}`}
                          className="text-[10px] font-display uppercase tracking-wider text-system-blue border border-system-blue px-2 py-1 rounded hover:bg-system-blue hover:text-system-void transition-colors whitespace-nowrap"
                        >
                          Test My Strength
                        </Link>
                        {justClaimed[skill.id] ? (
                          <span className="text-[10px] text-rank-d">Added to tracking</span>
                        ) : (
                          <button
                            onClick={() => handleClaim(skill.id)}
                            className="text-[10px] font-display uppercase tracking-wider text-slate-400 hover:text-system-gold transition-colors"
                          >
                            Start Tracking
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
