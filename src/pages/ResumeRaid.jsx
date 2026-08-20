import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import ResumeDropzone from "../components/ResumeDropzone";
import RankPill from "../components/RankPill";
import { useRaidResumes } from "../hooks/useRaidResumes";
import { detectSkillLevelsFromPdfUrl } from "../lib/extractResumeSkills";
import { skillRankForLevel } from "../lib/ranks";
import { skillCatalog } from "../data/skills";

export default function ResumeRaid() {
  const { claimSkills } = useOutletContext();
  const { data: resumes, isLoading, upload, uploadStatus, remove, getSignedUrl } = useRaidResumes();
  const [uploadError, setUploadError] = useState(null);
  const [claimed, setClaimed] = useState(null); // { skillId: level } union across all resumes
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [justClaimed, setJustClaimed] = useState({});

  async function scanAll() {
    if (!resumes || resumes.length === 0) {
      setClaimed({});
      return;
    }
    setScanning(true);
    setScanError(null);
    try {
      const perResume = await Promise.all(
        resumes.map(async (r) => {
          const url = await getSignedUrl(r);
          return detectSkillLevelsFromPdfUrl(url);
        })
      );
      const union = {};
      for (const levels of perResume) {
        for (const [skillId, level] of Object.entries(levels)) {
          union[skillId] = Math.max(union[skillId] ?? 0, level);
        }
      }
      setClaimed(union);
    } catch {
      setScanError("Couldn't scan one or more resumes — try re-uploading it.");
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    if (resumes && resumes.length > 0) scanAll();
    if (resumes && resumes.length === 0) setClaimed({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumes?.length]);

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
    ? skillCatalog
        .filter((s) => claimed[s.id] > 0)
        .map((s) => ({ skill: s, detectedLevel: claimed[s.id], detectedRank: skillRankForLevel(claimed[s.id]) }))
        .sort((a, b) => b.detectedLevel - a.detectedLevel)
    : [];

  const byCategory = {};
  for (const entry of claimedEntries) {
    byCategory[entry.skill.category] ??= [];
    byCategory[entry.skill.category].push(entry);
  }

  return (
    <div className="space-y-6">
      <div className="system-panel p-6">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Resume Raid</p>
        <h2 className="font-display text-xl font-bold text-white mb-1">Every Skill You've Claimed, On Paper</h2>
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

        {!isLoading && resumes && resumes.length > 0 && (
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
            a verdict. Click "Test My Strength" to open that skill's subskill checklist and actually verify it.
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
                  {entries.map(({ skill, detectedRank }) => (
                    <div key={skill.id} className="border border-system-border bg-system-void/30 rounded p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">{skill.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <RankPill rank={detectedRank} label="Claimed" />
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
