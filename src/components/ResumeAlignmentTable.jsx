import { Link } from "react-router-dom";
import { formatINR } from "../lib/prep";

function scoreColor(score) {
  if (score >= 70) return "text-rank-d";
  if (score >= 45) return "text-system-blue";
  return "text-danger";
}

// Resume Alignment — how well a resume's CLAIMED skills (keyword-detected)
// match a company's required skills. Deliberately never called "Readiness"
// here — that word is reserved for skill-based (Proven) Company Prep
// readiness elsewhere in the app, a different question ("do I have the
// skill" vs "does this resume claim the skill"). See docs/System.md.
//
// `confidenceByCompanyId` is optional — Try.jsx/Resume.jsx pass it once
// per-company confidence is computed; omitting it just hides that column
// rather than showing a fabricated number.
export default function ResumeAlignmentTable({ ranked, linkToCompany = true, confidenceByCompanyId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-system-border">
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-3">Company</th>
            <th className="pb-2 pr-3">Domain</th>
            <th className="pb-2 pr-3">Alignment</th>
            {confidenceByCompanyId && <th className="pb-2 pr-3">Confidence</th>}
            <th className="pb-2 pr-3 text-right">Base</th>
            <th className="pb-2 text-right">CTC</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ company, readiness }, i) => {
            const confidence = confidenceByCompanyId?.[company.id];
            return (
              <tr key={company.id} className="border-b border-system-border/40 hover:bg-system-void/40 transition-colors">
                <td className="py-2 pr-3 text-slate-600 font-display">{i + 1}</td>
                <td className="py-2 pr-3">
                  {linkToCompany ? (
                    <Link to={`/company/${company.id}`} className="text-slate-200 hover:text-system-blue transition-colors font-medium">
                      {company.name}
                    </Link>
                  ) : (
                    <span className="text-slate-200 font-medium">{company.name}</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-slate-500 text-xs">{company.domain}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2 w-32">
                    <div className="h-1.5 flex-1 bg-system-void rounded-full overflow-hidden border border-system-border">
                      <div className="h-full bg-gradient-to-r from-system-blue-dim to-system-blue" style={{ width: `${readiness}%` }} />
                    </div>
                    <span className={`font-display text-xs font-semibold w-9 text-right ${scoreColor(readiness)}`}>{readiness}%</span>
                  </div>
                </td>
                {confidenceByCompanyId && (
                  <td className="py-2 pr-3 text-xs text-slate-400 whitespace-nowrap">
                    {confidence != null ? `${confidence}%` : "—"}
                  </td>
                )}
                <td className="py-2 pr-3 text-right text-slate-400 text-xs whitespace-nowrap">{formatINR(company.base)}</td>
                <td className="py-2 text-right text-system-gold text-xs whitespace-nowrap">{formatINR(company.ctc)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
