const DIMENSION_LABELS = {
  quantifiedImpact: "Quantified Impact",
  actionVerbUsage: "Action Verbs",
  sectionCoverage: "Section Coverage",
  length: "Length",
  lowRedundancy: "Low Redundancy",
};

// Resume Quality — a property of the resume itself, independent of any one
// company (that's Resume Alignment, shown separately). Heuristic and
// labeled as such; see lib/resumeQuality.js for the exact formula.
export default function ResumeQualityCard({ quality, className = "" }) {
  return (
    <div className={`system-panel p-6 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase">Resume Quality</p>
        <span className="font-display text-lg font-bold text-system-blue">{quality.overall}/100</span>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        A heuristic estimate of the resume itself — not company-specific, not AI-scored, not a claim about your
        actual ability. Based on extracted text, which loses some formatting (see Methodology).
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.entries(quality.dimensions).map(([key, val]) => (
          <div key={key} className="text-center">
            <p className="font-display text-sm text-slate-300">{val}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide leading-tight">{DIMENSION_LABELS[key] ?? key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
