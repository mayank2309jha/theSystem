import { Link } from "react-router-dom";
import RankPill from "./RankPill";
import { formatINR } from "../lib/prep";

export default function CompanyCard({ company }) {
  return (
    <Link
      to={`/company/${company.id}`}
      className="block border border-system-border bg-system-void/30 rounded p-4 hover:border-system-blue transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display font-bold text-slate-100 group-hover:text-system-blue transition-colors">{company.name}</h3>
        <RankPill rank={company.overallRank} />
      </div>
      <p className="text-xs text-slate-400 mb-2">{company.role}</p>
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider">
        <span className="px-1.5 py-0.5 rounded border border-system-border text-slate-500">{company.domain}</span>
        {!company.verified && (
          <span className="px-1.5 py-0.5 rounded border border-danger/50 text-danger">Unverified prep</span>
        )}
      </div>
      <div className="flex items-end justify-between mt-3 pt-2 border-t border-system-border/60 text-[11px] text-slate-500">
        <span>{typeof company.day === "number" ? `Day ${company.day}` : "Day TBD"}</span>
        <span className="text-right leading-tight">
          <span className="block text-slate-500">Base {formatINR(company.base)}</span>
          <span className="block text-system-gold font-semibold">CTC {formatINR(company.ctc)}</span>
        </span>
      </div>
    </Link>
  );
}
