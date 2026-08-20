// Final rounding-out domains — real interview topics and industry-standard
// tracks not yet covered by the categories above.
export const additionalDomainsSkills = [
  {
    id: "compilers",
    name: "Compilers",
    category: "Systems & OS",
    level: 10,
    why: "A real, verbatim Qualcomm compiler-team interview topic — dominator trees, interference graphs, register allocation, loop vectorization.",
    subskills: [
      { id: "compilers-dominance", name: "Dominator Trees & Dominance Frontiers", weight: 2, todos: ["Draw the dominator tree for a diamond-pattern CFG by hand", "Explain what a dominance frontier represents and why it matters for SSA construction"] },
      { id: "compilers-register-allocation", name: "Register Allocation", weight: 2, todos: ["Explain k-graph-coloring register allocation and how spilling is decided", "Work through a small example deciding which variable to spill in a nested loop"] },
      { id: "compilers-optimizations", name: "Compiler Optimizations", weight: 2, todos: ["Explain loop vectorization and one condition that enables it", "Explain constant folding and dead-code elimination with a before/after example"] },
    ],
  },
  {
    id: "sre",
    name: "Site Reliability Engineering (SRE)",
    category: "Cloud & DevOps",
    level: 10,
    why: "The discipline of keeping distributed systems like the ones on this resume actually up in production — a natural extension of the observability/fault-tolerance work already demonstrated.",
    subskills: [
      { id: "sre-slo-sla", name: "SLIs/SLOs/SLAs", weight: 2, todos: ["Define a real SLI/SLO for a project you've built (e.g. p99 latency < 200ms)", "Explain the difference between an SLA and an SLO and why the distinction matters"] },
      { id: "sre-incident-response", name: "Incident Response & Postmortems", weight: 2, todos: ["Write a blameless postmortem for a real bug you fixed (e.g. one of the race conditions in the KV Cache)", "Explain the purpose of an incident-severity classification system"] },
      { id: "sre-on-call", name: "On-call Practices", weight: 1, todos: ["Explain alert fatigue and one way to reduce false-positive pages", "Design an escalation policy for a real service"] },
    ],
  },
  {
    id: "bi-tools",
    name: "Excel & Business Intelligence Tools",
    category: "Data Engineering",
    level: 10,
    why: "Relevant for Data Scientist/Analyst-flavored roles (Accenture, TIAA) where a full code-based pipeline isn't always the expected deliverable.",
    subskills: [
      { id: "excel-advanced-formulas", name: "Advanced Excel (pivot tables, lookups)", weight: 2, todos: ["Build a pivot table answering a real business question from raw data", "Use XLOOKUP/INDEX-MATCH correctly instead of nested IFs"] },
      { id: "bi-dashboards", name: "BI Dashboards (Power BI/Tableau)", weight: 1, todos: ["Build one dashboard telling a clear story from a real dataset", "Explain the difference between a dashboard for monitoring versus one for exploration"] },
    ],
  },
];
