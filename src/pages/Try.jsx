import { useState } from "react";
import ResumeDropzone from "../components/ResumeDropzone";
import ResumeAlignmentTable from "../components/ResumeAlignmentTable";
import ResumeQualityCard from "../components/ResumeQualityCard";
import CTABanner from "../components/CTABanner";
import ThemeToggle from "../components/ThemeToggle";
import MethodologyButton from "../components/MethodologyButton";
import { analyzeResumeFile } from "../lib/extractResumeSkills";
import { companiesRankedByReadiness } from "../lib/prep";
import { scoreResumeQuality } from "../lib/resumeQuality";
import { scoreConfidence } from "../lib/confidence";

export default function Try() {
  const [status, setStatus] = useState("idle"); // idle | parsing | done | error
  const [ranked, setRanked] = useState(null);
  const [quality, setQuality] = useState(null);
  const [confidenceById, setConfidenceById] = useState(null);
  const [fileName, setFileName] = useState(null);

  async function handleFile(file) {
    setStatus("parsing");
    setFileName(file.name);
    try {
      const { text, skillLevels } = await analyzeResumeFile(file);
      const nextRanked = companiesRankedByReadiness(skillLevels);
      setRanked(nextRanked);
      setQuality(scoreResumeQuality(text));
      setConfidenceById(
        Object.fromEntries(nextRanked.map(({ company }) => [company.id, scoreConfidence({ text, skillLevels, company }).overall]))
      );
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 max-w-4xl mx-auto">
      <ThemeToggle />
      <MethodologyButton pageKey="resume-alignment" />
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

      {status === "done" && quality && <ResumeQualityCard quality={quality} className="mt-6" />}

      {status === "done" && ranked && (
        <div className="system-panel p-6 mt-6">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Results for {fileName}</p>
          <h2 className="font-display text-lg font-bold text-white mb-2">Resume Alignment — All 36 Companies</h2>
          <p className="text-xs text-slate-500 mb-4">
            How well what your resume <strong className="text-slate-400">Claims</strong> (keyword-detected skills)
            matches each company's requirements — a rough estimate, not a deep analysis, and not the same as being
            actually prepared. It will miss skills described in different words than we look for. Confidence
            reflects how much THE SYSTEM trusts its own number, not how good your resume is.
          </p>
          <ResumeAlignmentTable ranked={ranked} linkToCompany={false} confidenceByCompanyId={confidenceById} />
          <CTABanner className="mt-6" />
        </div>
      )}

      <footer className="text-center text-[11px] text-slate-600 mt-10 tracking-widest uppercase">
        Arise. Only I Level Up.
      </footer>
    </div>
  );
}
