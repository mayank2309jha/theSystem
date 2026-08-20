// Keyword/synonym lists per skill, used ONLY by the resume checkers (public
// /try and the authenticated My Resume page) to build a rough proficiency
// estimate from an arbitrary uploaded PDF's text. This is deliberately a
// simple, transparent, client-side keyword match — not an LLM call — so the
// public checker needs no backend, no API key, and no per-request cost.
// It's a heuristic and is labeled as one everywhere it's shown; it will
// miss paraphrased skills ("built REST services" won't match as cleanly as
// "REST APIs" would) and that's an accepted, disclosed trade-off.
//
// Skills with no real resume-detectable signature (interview craft, not a
// tool/technique) are left with an empty list — they'll always score 0 from
// a resume, which is expected since a PDF can't demonstrate them.
export const skillKeywords = {
  dsa: ["data structures", "algorithms", "dsa", "leetcode", "dynamic programming", "competitive programming", "codeforces", "codechef", "graph algorithm", "binary search", "greedy algorithm"],
  "system-design": ["system design", "high level design", "hld", "distributed system design", "scalab", "load balanc", "microservice", "architecture design", "rate limit"],
  oop: ["object oriented", "oop", "oops", "inheritance", "polymorphism", "encapsulation", "design pattern"],
  aptitude: ["aptitude", "quantitative reasoning", "logical reasoning"],
  os: ["operating system", "process scheduling", "multithreading", "memory management", "deadlock", "virtual memory", "paging", "semaphore"],
  "systems-programming": ["c++", "systems programming", "pointer", "malloc", "smart pointer", "rust", "low-level", "memory leak"],
  coa: ["computer architecture", "computer organization", "cache hierarchy", "pipelining", "assembly language", "register allocation"],
  multithreading: ["multithreading", "concurrency", "thread pool", "mutex", "race condition", "parallel programming", "reentrantlock"],
  networks: ["computer networks", "tcp", "udp", "http", "dns", "networking protocol", "socket programming"],
  "cloud-infra": ["docker", "kubernetes", "k8s", "cloud", "aws", "gcp", "azure", "container", "devops", "ci/cd", "terraform"],
  "dbms-sql": ["sql", "database", "dbms", "postgresql", "mysql", "mongodb", "query optimization", "indexing", "normalization", "redis"],
  "ml-fundamentals": ["machine learning", "scikit-learn", "sklearn", "regression", "classification", "random forest", "svm", "decision tree", "classical ml"],
  "deep-learning": ["deep learning", "neural network", "pytorch", "tensorflow", "cnn", "transformer", "attention mechanism"],
  nlp: ["nlp", "natural language processing", "bert", "text classification", "tokeniz", "embedding", "language model", "llm"],
  "data-analysis": ["pandas", "numpy", "data analysis", "data visualization", "exploratory data analysis", "matplotlib", "statistical analysis"],
  java: ["java", "spring boot", "spring framework", "jvm"],
  cpp: ["c++", "cpp"],
  python: ["python", "django", "flask", "fastapi"],
  "react-frontend": ["react", "redux", "frontend", "typescript", "javascript", "html", "css", "vue", "angular", "next.js"],
  "backend-apis": ["rest api", "backend", "api design", "node.js", "express", "graphql", "jwt"],
  "distributed-systems": ["distributed systems", "kafka", "message queue", "consensus algorithm", "replication", "sharding", "fault toleran"],
  "resume-storytelling": [],
  "hr-behavioral": [],
};

function levelForMatchCount(count) {
  if (count === 0) return 0;
  if (count === 1) return 35;
  if (count === 2) return 55;
  if (count === 3) return 70;
  return 85;
}

// { skillId: 0-100 } — how many DISTINCT keywords (not raw occurrences, so
// one repeated buzzword doesn't dominate) appear in the given lowercased
// resume text, mapped onto a capped proficiency estimate.
export function detectSkillLevelsFromText(text, skillCatalog) {
  const lower = text.toLowerCase();
  const levels = {};
  for (const skill of skillCatalog) {
    const keywords = skillKeywords[skill.id] ?? [];
    const matchedCount = keywords.filter((kw) => lower.includes(kw)).length;
    levels[skill.id] = levelForMatchCount(matchedCount);
  }
  return levels;
}
