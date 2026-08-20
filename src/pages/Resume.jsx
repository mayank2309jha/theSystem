import { useEffect, useState } from "react";
import ResumeDropzone from "../components/ResumeDropzone";
import CompanyReadinessTable from "../components/CompanyReadinessTable";
import { useResume } from "../hooks/useResume";
import { detectSkillLevelsFromPdfFile, detectSkillLevelsFromPdfUrl } from "../lib/extractResumeSkills";
import { companiesRankedByReadiness } from "../lib/prep";

export default function Resume() {
  const { data: resume, isLoading, upload, uploadStatus, remove, removeStatus, getSignedUrl } = useResume();
  const [uploadError, setUploadError] = useState(null);
  const [ranked, setRanked] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState(null);

  async function scoreFromUrl() {
    setScoring(true);
    setScoreError(null);
    try {
      const url = await getSignedUrl();
      const skillLevels = await detectSkillLevelsFromPdfUrl(url);
      setRanked(companiesRankedByReadiness(skillLevels));
    } catch {
      setScoreError("Couldn't score your resume — try re-uploading it.");
    } finally {
      setScoring(false);
    }
  }

  // Re-score whenever a resume exists but we haven't computed results yet
  // for it (fresh page load with an existing resume, or after a delete
  // clears `ranked` back to null).
  useEffect(() => {
    if (resume && !ranked && !scoring) scoreFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.storage_path]);

  async function handleFile(file) {
    setUploadError(null);
    setRanked(null);
    try {
      // Score the freshly-picked file locally first — instant, no round trip —
      // then kick off the actual upload in parallel.
      const scoringPromise = detectSkillLevelsFromPdfFile(file).then((levels) =>
        setRanked(companiesRankedByReadiness(levels))
      );
      await Promise.all([upload(file), scoringPromise]);
    } catch {
      setUploadError("Upload failed — check your connection and try again.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete your uploaded resume? This can't be undone.")) return;
    await remove();
    setRanked(null);
  }

  if (isLoading) {
    return (
      <div className="system-panel p-6">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="system-panel p-6">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">My Resume</p>
        <h2 className="font-display text-xl font-bold text-white mb-1">Private, Yours Only</h2>
        <p className="text-sm text-slate-400 mb-4">
          Stored privately in your own account — no other user, including the app owner, can read it through the
          app or its database. Enforced server-side, not just hidden in the UI.
        </p>

        {!resume ? (
          <ResumeDropzone onFile={handleFile} disabled={uploadStatus === "pending"} label="Upload your resume to get started" />
        ) : (
          <div className="border border-system-border bg-system-void/30 rounded p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-200 font-medium">{resume.original_filename}</p>
              <p className="text-[11px] text-slate-500">{(resume.file_size / 1024).toFixed(0)} KB · uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <label className="text-[11px] font-display uppercase tracking-wider text-system-blue border border-system-blue px-3 py-1.5 rounded hover:bg-system-blue hover:text-system-void transition-colors cursor-pointer">
                Replace
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
              <button
                onClick={handleDelete}
                disabled={removeStatus === "pending"}
                className="text-[11px] font-display uppercase tracking-wider text-danger border border-danger px-3 py-1.5 rounded hover:bg-danger hover:text-system-void transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {uploadStatus === "pending" && <p className="text-sm text-system-blue mt-3 animate-pulse">Uploading...</p>}
        {uploadError && <p className="text-sm text-danger mt-3">{uploadError}</p>}
      </div>

      {resume && (
        <div className="system-panel p-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Your Fit</p>
          <h3 className="font-display text-lg font-bold text-white mb-2">All 36 Companies, Ranked</h3>
          <p className="text-xs text-slate-500 mb-4">
            A rough estimate based on keyword matching against your resume text — a starting point, not a verdict.
          </p>

          {scoring && <p className="text-sm text-system-blue animate-pulse">Scoring your resume...</p>}
          {scoreError && <p className="text-sm text-danger">{scoreError}</p>}
          {ranked && !scoring && <CompanyReadinessTable ranked={ranked} />}
        </div>
      )}
    </div>
  );
}
