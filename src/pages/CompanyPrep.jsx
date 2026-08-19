import { useMemo, useState } from "react";
import CompanyCard from "../components/CompanyCard";
import { companiesSortedByDay } from "../lib/prep";

const DOMAINS = ["All", "SDE", "Systems", "ML", "Fintech", "Non-Core / Consulting"];

function matchesDomain(company, filter) {
  if (filter === "All") return true;
  if (filter === "SDE") return /SDE|Software/i.test(company.domain);
  if (filter === "Systems") return /Systems|Embedded|Low-level|DevOps|Infra/i.test(company.domain);
  if (filter === "ML") return /ML|AI|Data Science/i.test(company.domain);
  if (filter === "Fintech") return /Fintech/i.test(company.domain);
  if (filter === "Non-Core / Consulting") return /Non-Core|Consulting|Trainee|Generalist/i.test(company.domain);
  return true;
}

export default function CompanyPrep() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const companiesList = useMemo(() => {
    return companiesSortedByDay()
      .filter((c) => matchesDomain(c, filter))
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.role.toLowerCase().includes(query.toLowerCase()));
  }, [filter, query]);

  return (
    <div className="system-panel p-6">
      <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Company Specific Prep</p>
      <h2 className="font-display text-xl font-bold text-white mb-1">Every Gate on the Board</h2>
      <p className="text-sm text-slate-400 mb-4">
        Sourced from 2025 placement data — {companiesSortedByDay().length} companies, real interview reports where available.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or role..."
          className="flex-1 min-w-[200px] bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
        />
        <div className="flex flex-wrap gap-1.5">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-2.5 py-1.5 text-[11px] font-display uppercase tracking-wider rounded border transition-colors ${
                filter === d ? "border-system-blue text-system-blue bg-system-blue/10" : "border-system-border text-slate-500 hover:text-slate-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {companiesList.map((c) => (
          <CompanyCard key={c.id} company={c} />
        ))}
        {companiesList.length === 0 && <p className="text-sm text-slate-500 italic col-span-full">No companies match that search.</p>}
      </div>
    </div>
  );
}
