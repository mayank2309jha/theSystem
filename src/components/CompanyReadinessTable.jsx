import { Link } from "react-router-dom";
import { formatINR } from "../lib/prep";

function readinessColor(score) {
  if (score >= 70) return "text-rank-d";
  if (score >= 45) return "text-system-blue";
  return "text-danger";
}

// `linkToCompany` lets the public /try page (no auth, no company detail
// route available to it) render plain text instead of a Link.
export default function CompanyReadinessTable({ ranked, linkToCompany = true }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-system-border">
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-3">Company</th>
            <th className="pb-2 pr-3">Domain</th>
            <th className="pb-2 pr-3">Readiness</th>
            <th className="pb-2 pr-3 text-right">Base</th>
            <th className="pb-2 text-right">CTC</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ company, readiness }, i) => (
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
                  <span className={`font-display text-xs font-semibold w-9 text-right ${readinessColor(readiness)}`}>{readiness}%</span>
                </div>
              </td>
              <td className="py-2 pr-3 text-right text-slate-400 text-xs whitespace-nowrap">{formatINR(company.base)}</td>
              <td className="py-2 text-right text-system-gold text-xs whitespace-nowrap">{formatINR(company.ctc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
