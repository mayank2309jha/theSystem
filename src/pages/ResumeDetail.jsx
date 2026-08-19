import { Link, useParams } from "react-router-dom";
import { resumeFileFromSlug, resumeInfo } from "../data/resumes";
import { companiesRankedForResume, formatINR } from "../lib/prep";
import OpenResumeButton from "../components/OpenResumeButton";

function scoreColor(score) {
  if (score >= 70) return "text-rank-d";
  if (score >= 45) return "text-system-blue";
  return "text-danger";
}

export default function ResumeDetail() {
  const { slug } = useParams();
  const file = resumeFileFromSlug(slug);
  const info = file ? resumeInfo[file] : null;

  if (!info) {
    return (
      <div className="system-panel p-6">
        <p className="text-slate-400">Unknown resume.</p>
        <Link to="/resumes" className="text-system-blue text-sm">← Back to Resume Maxing</Link>
      </div>
    );
  }

  const ranked = companiesRankedForResume(file);

  return (
    <div className="space-y-6">
      <Link to="/resumes" className="text-system-blue text-xs font-display uppercase tracking-widest hover:underline">
        ← Back to Resume Maxing
      </Link>

      <div className="system-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-white system-glow-text">{info.label}</h2>
            <p className="text-sm text-slate-400 mt-1">{info.bestFor}</p>
          </div>
          <OpenResumeButton
            file={file}
            className="text-[11px] font-display uppercase tracking-wider text-system-blue border border-system-blue px-3 py-1.5 rounded hover:bg-system-blue hover:text-system-void transition-colors shrink-0 disabled:opacity-50"
          />
        </div>
        <p className="text-xs text-slate-500 italic mt-2">{info.focus}</p>
      </div>

      <div className="system-panel p-6">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-4">
          All {ranked.length} Companies, Ranked by Alignment
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-system-border">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Company</th>
                <th className="pb-2 pr-3">Domain</th>
                <th className="pb-2 pr-3">Alignment</th>
                <th className="pb-2 pr-3 text-right">Base</th>
                <th className="pb-2 text-right">CTC</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ company, score }, i) => (
                <tr key={company.id} className="border-b border-system-border/40 hover:bg-system-void/40 transition-colors">
                  <td className="py-2 pr-3 text-slate-600 font-display">{i + 1}</td>
                  <td className="py-2 pr-3">
                    <Link to={`/company/${company.id}`} className="text-slate-200 hover:text-system-blue transition-colors font-medium">
                      {company.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-slate-500 text-xs">{company.domain}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2 w-32">
                      <div className="h-1.5 flex-1 bg-system-void rounded-full overflow-hidden border border-system-border">
                        <div className="h-full bg-gradient-to-r from-system-blue-dim to-system-blue" style={{ width: `${score}%` }} />
                      </div>
                      <span className={`font-display text-xs font-semibold w-9 text-right ${scoreColor(score)}`}>{score}%</span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-400 text-xs whitespace-nowrap">{formatINR(company.base)}</td>
                  <td className="py-2 text-right text-system-gold text-xs whitespace-nowrap">{formatINR(company.ctc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
