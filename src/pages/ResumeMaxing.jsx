import { useNavigate } from "react-router-dom";
import { RESUME, RESUME_SLUG, resumeInfo } from "../data/resumes";
import { companiesRankedForResume } from "../lib/prep";
import OpenResumeButton from "../components/OpenResumeButton";

export default function ResumeMaxing() {
  const navigate = useNavigate();

  return (
    <div className="system-panel p-6">
      <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Resume Maxing</p>
      <h2 className="font-display text-xl font-bold text-white mb-1">Five Blades, Five Fights</h2>
      <p className="text-sm text-slate-400 mb-6">
        Every company scored against every resume variant, by estimated skill alignment. Pick a resume to see its full ranked list.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(RESUME).map((file) => {
          const info = resumeInfo[file];
          const ranked = companiesRankedForResume(file);
          const topMatch = ranked[0];
          return (
            <div
              key={file}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/resume/${RESUME_SLUG[file]}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/resume/${RESUME_SLUG[file]}`)}
              className="block border border-system-border bg-system-void/30 rounded p-4 hover:border-system-blue transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-bold text-slate-100 group-hover:text-system-blue transition-colors">{info.label}</h3>
                <OpenResumeButton
                  file={file}
                  className="text-[10px] font-display uppercase tracking-wider text-system-blue border border-system-blue px-2 py-1 rounded hover:bg-system-blue hover:text-system-void transition-colors shrink-0 disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-slate-400 mb-3">{info.bestFor}</p>
              <div className="flex items-center justify-between text-[11px] border-t border-system-border/60 pt-2">
                <span className="text-slate-500">Top match</span>
                <span className="text-system-blue font-display font-semibold">
                  {topMatch.company.name} · {topMatch.score}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
