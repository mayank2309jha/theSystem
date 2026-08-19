export const RESUME = {
  SDE: "SDE.pdf",
  ALGO: "SDE + Algo.pdf",
  BACKEND: "Backend.pdf",
  ML: "ML.pdf",
  NONCORE: "Non-Core Companies.pdf",
};

// URL-safe slugs for routing (resume filenames have spaces/plus signs).
export const RESUME_SLUG = {
  [RESUME.SDE]: "sde",
  [RESUME.ALGO]: "sde-algo",
  [RESUME.BACKEND]: "backend",
  [RESUME.ML]: "ml",
  [RESUME.NONCORE]: "non-core",
};

export function resumeFileFromSlug(slug) {
  return Object.keys(RESUME_SLUG).find((file) => RESUME_SLUG[file] === slug);
}

export const resumeInfo = {
  [RESUME.SDE]: {
    label: "SDE (Generalist)",
    focus: "Broad full-stack + systems + DB + distributed + testing coverage, balanced project order (Order Matching Engine, Search Engine, Index Advisor, NETRA).",
    bestFor: "Generalist product-company SDE interviews where you don't know which sub-area the interviewer will pull on.",
  },
  [RESUME.ALGO]: {
    label: "SDE + Algo (DSA-forward)",
    focus: "Same project set, reordered to lead with algorithmic depth (Search Engine, Genome Indexing, Order Matching) with an expanded Algorithms & Data Structures block (Graph, DP, Greedy, String, Suffix Arrays).",
    bestFor: "Companies with heavy pen-and-paper/whiteboard DSA rounds or a competitive-programming culture.",
  },
  [RESUME.BACKEND]: {
    label: "Backend / Distributed Systems",
    focus: "Leads with Real-Time Order Matching Engine, then Search Engine, Index Advisor, NETRA, Distributed KV Cache, Genomic Streaming Pipeline — Backend, Databases and Distributed Systems skill blocks are front and center, ML section dropped.",
    bestFor: "Backend Engineer / infra / DevOps-flavored roles where distributed-systems depth is the differentiator.",
  },
  [RESUME.ML]: {
    label: "Machine Learning",
    focus: "Project order flipped to lead with the M.Tech project and Impact of Label Noise on ML, then Search & Retrieval, Multi-Model NLP, NETRA — PyTorch/scikit-learn/DL/NLP skill block promoted, systems block trimmed.",
    bestFor: "Data Scientist / ML Engineer / AI Research roles.",
  },
  [RESUME.NONCORE]: {
    label: "Non-Core Companies",
    focus: "Condensed bullets, Data & Analytics block (Pandas/NumPy/EDA/Statistics) promoted, coursework includes Money & Banking / Micro / Macroeconomics.",
    bestFor: "Finance, consulting, analyst, and non-core trainee roles where deep systems trivia is irrelevant but business/data fluency matters.",
  },
};
