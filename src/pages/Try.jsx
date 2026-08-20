import { useState } from "react";
import ResumeDropzone from "../components/ResumeDropzone";
import CompanyReadinessTable from "../components/CompanyReadinessTable";
import CTABanner from "../components/CTABanner";
import { detectSkillLevelsFromPdfFile } from "../lib/extractResumeSkills";
import { companiesRankedByReadiness } from "../lib/prep";

export default function Try() {
  const [status, setStatus] = useState("idle"); // idle | parsing | done | error
  const [ranked, setRanked] = useState(null);
  const [fileName, setFileName] = useState(null);

  async function handleFile(file) {
    setStatus("parsing");
    setFileName(file.name);
    try {
      const skillLevels = await detectSkillLevelsFromPdfFile(file);
      setRanked(companiesRankedByReadiness(skillLevels));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 max-w-4xl mx-auto">
      <header className="text-center mb-6">
        <p className="text-xs tracking-[0.4em] text-system-blue/60 uppercase mb-2">The System</p>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white system-glow-text tracking-wide">
          Resume Compatibility Checker
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          See how your resume stacks up against 36 real companies from the 2025 placement season. Nothing is
          uploaded anywhere — your PDF is read entirely in your browser and never leaves this tab.
        </p>
      </header>

      <CTABanner className="mb-6" />

      <div className="system-panel p-6">
        <ResumeDropzone onFile={handleFile} disabled={status === "parsing"} />

        {status === "parsing" && <p className="text-sm text-system-blue mt-4 animate-pulse">Reading {fileName}...</p>}
        {status === "error" && (
          <p className="text-sm text-danger mt-4">
            Couldn't read that PDF — it may be scanned/image-based rather than text, or corrupted. Try a
            different export of your resume.
          </p>
        )}
      </div>

      {status === "done" && ranked && (
        <div className="system-panel p-6 mt-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Results for {fileName}</p>
          <h2 className="font-display text-lg font-bold text-white mb-2">All 36 Companies, Ranked by Fit</h2>
          <p className="text-xs text-slate-500 mb-4">
            This is a rough estimate based on keyword matching against your resume text, not a deep analysis — it
            will miss skills described in different words than we look for. Treat it as a starting point, not a
            verdict.
          </p>
          <CompanyReadinessTable ranked={ranked} linkToCompany={false} />
          <CTABanner className="mt-6" />
        </div>
      )}

      <footer className="text-center text-[11px] text-slate-600 mt-10 tracking-widest uppercase">
        Arise. Only I Level Up.
      </footer>
    </div>
  );
}
