// Keyword/synonym lists per skill, used by the resume checkers (public /try,
// the authenticated My Resume page, and Resume Raid) to build a rough
// proficiency estimate from an arbitrary uploaded PDF's text. This is
// deliberately a simple, transparent, client-side keyword match — not an LLM
// call — so the public checker needs no backend, no API key, and no
// per-request cost. It's a heuristic and is labeled as one everywhere it's
// shown; it will miss paraphrased skills ("built REST services" won't match
// as cleanly as "REST APIs" would) and that's an accepted, disclosed
// trade-off.
//
// Skills with no real resume-detectable signature (interview craft, not a
// tool/technique) are left with an empty list — they'll always score 0 from
// a resume, which is expected since a PDF can't demonstrate them.
//
// Coverage note: the first 21 non-empty entries below were hand-curated
// against the original 23-skill catalog (keys renamed in place when that
// catalog was split/expanded to 101 skills — e.g. the old flat "cloud-infra"
// became "docker", narrowed since kubernetes/aws/gcp/terraform/cicd each now
// have their own dedicated entry below; same pattern for "sql" vs.
// postgresql/mysql/mongodb, "eda" vs. pandas/numpy/data-visualization,
// "microservices" vs. kafka/message-queues/sharding, "rest-api-design" vs.
// nodejs/graphql/jwt-auth, "deep-learning"/"ml-fundamentals"/"nlp" vs.
// pytorch/tensorflow/sklearn/bert). Everything else was auto-derived from
// each skill's name + its subskill names — a first pass, not hand-tuned like
// the original 21, so it's more likely to miss real phrasing or occasionally
// over/under-match. Improving these is the single highest-leverage way to
// make Resume Raid and the resume checkers more accurate — see
// docs/ResumetoCompany.md.
export const skillKeywords = {
  // --- Hand-curated (renamed from the original 23-skill catalog) ---
  dsa: ["data structures", "algorithms", "dsa", "leetcode", "dynamic programming", "competitive programming", "codeforces", "codechef", "graph algorithm", "binary search", "greedy algorithm"],
  hld: ["system design", "high level design", "hld", "distributed system design", "scalab", "load balanc", "architecture design", "rate limit", "capacity estimation"],
  oop: ["object oriented", "oop", "oops", "inheritance", "polymorphism", "encapsulation", "design pattern"],
  aptitude: ["aptitude", "quantitative reasoning", "logical reasoning"],
  "os-fundamentals": ["operating system", "process scheduling", "memory management", "deadlock", "virtual memory", "paging", "semaphore", "cpu scheduling"],
  "systems-programming": ["c++", "systems programming", "pointer", "malloc", "smart pointer", "low-level", "memory leak"],
  coa: ["computer architecture", "computer organization", "cache hierarchy", "pipelining", "assembly language", "register allocation"],
  multithreading: ["multithreading", "concurrency", "thread pool", "mutex", "race condition", "parallel programming", "reentrantlock"],
  "computer-networks": ["computer networks", "tcp", "udp", "http", "dns", "networking protocol", "socket programming"],
  docker: ["docker", "dockerfile", "docker compose", "containeriz"],
  sql: ["sql", "joins", "subquer", "window function", "database transaction", "acid"],
  "ml-fundamentals": ["machine learning", "regression", "classification", "random forest", "svm", "decision tree", "classical ml", "bias-variance"],
  "deep-learning": ["deep learning", "neural network", "cnn", "transformer", "attention mechanism", "backpropagation", "batch norm"],
  nlp: ["nlp", "natural language processing", "text classification", "tokeniz", "embedding", "language model", "named entity recognition"],
  eda: ["exploratory data analysis", "eda", "outlier detection", "data exploration"],
  java: ["java", "spring boot", "spring framework", "jvm"],
  cpp: ["c++", "cpp"],
  python: ["python", "django", "flask", "fastapi"],
  react: ["react", "redux", "frontend", "typescript", "javascript", "html", "css", "vue", "angular", "next.js"],
  "rest-api-design": ["rest api", "api design", "resource modeling", "http status code", "pagination"],
  microservices: ["microservice", "service-oriented architecture", "service boundary", "circuit breaker", "api gateway"],
  "resume-storytelling": [],
  "hr-behavioral": [],

  // --- Auto-derived from skill/subskill names (first pass, see note above) ---
  lld: ["low-level design", "solid principles", "factory pattern", "builder pattern", "singleton pattern", "adapter pattern", "decorator pattern", "observer pattern", "strategy pattern", "class diagram"],
  "competitive-programming": ["competitive programming", "codeforces", "codechef", "number theory"],
  javascript: ["javascript", "event loop", "closures", "prototypes", "promises", "async/await"],
  typescript: ["typescript", "generics", "type system"],
  rust: ["rust", "ownership", "borrow checker", "tokio", "cargo"],
  go: ["golang", "goroutine", "go programming language", "channels"],
  "c-lang": ["c programming", "embedded c", "c language"],
  redux: ["redux", "redux toolkit", "rtk query", "reducer", "selectors"],
  nextjs: ["next.js", "nextjs", "ssr", "ssg", "server-side rendering", "app router"],
  "html-css": ["html", "css", "flexbox", "css grid", "responsive design", "semantic html", "accessibility", "a11y"],
  "build-tooling": ["vite", "webpack", "build tooling", "bundling", "code splitting"],
  "e2e-testing-frontend": ["playwright", "cypress", "e2e testing", "end-to-end testing"],
  nodejs: ["node.js", "nodejs", "express.js", "npm", "non-blocking i/o"],
  "spring-boot": ["spring boot", "dependency injection", "spring data jpa", "rest controller"],
  fastapi: ["fastapi", "pydantic", "async route"],
  flask: ["flask", "blueprints", "sqlalchemy"],
  graphql: ["graphql", "resolver", "schema design", "n+1 problem"],
  grpc: ["grpc", "protobuf", "streaming rpc"],
  "jwt-auth": ["jwt", "json web token", "refresh token", "oauth2", "oidc"],
  postgresql: ["postgresql", "postgres", "explain analyze", "b-tree index", "hypopg", "hikaricp", "pgvector"],
  mysql: ["mysql", "innodb", "mysql replication"],
  redis: ["redis", "ttl eviction", "pub/sub", "redis streams"],
  mongodb: ["mongodb", "document schema", "aggregation pipeline"],
  "query-optimization": ["query optimization", "indexing", "covering index", "query plan", "explain analyze"],
  "schema-design": ["schema design", "database normalization", "normal form", "schema migration"],
  kafka: ["kafka", "apache kafka", "partitioning strategy", "consumer group", "exactly-once"],
  "message-queues": ["message queue", "rabbitmq", "sqs", "pub/sub messaging"],
  "consensus-replication": ["consensus algorithm", "cap theorem", "leader election", "replication strategy"],
  sharding: ["sharding", "partitioning", "shard key", "resharding"],
  observability: ["observability", "distributed tracing", "metrics dashboard", "structured logging", "prometheus", "grafana"],
  "tcp-sockets": ["tcp socket", "socket programming", "netstat", "port exhaustion"],
  "linux-shell": ["linux", "shell scripting", "bash script", "strace", "lsof"],
  kubernetes: ["kubernetes", "k8s", "pods", "deployments", "kubernetes networking"],
  cicd: ["ci/cd", "continuous integration", "continuous deployment", "jenkins", "github actions", "blue-green deployment", "canary deployment"],
  aws: ["aws", "amazon web services", "ec2", "s3", "iam"],
  gcp: ["gcp", "google cloud platform", "compute engine", "cloud run"],
  terraform: ["terraform", "infrastructure as code", "iac"],
  git: ["git", "version control", "pull request", "code review", "git rebase"],
  pytorch: ["pytorch", "autograd", "nn.module", "dataloader"],
  tensorflow: ["tensorflow", "keras", "gradienttape"],
  sklearn: ["scikit-learn", "sklearn", "columntransformer", "grid search", "cross-validation"],
  "model-evaluation": ["model evaluation", "classification metric", "f1 score", "shap", "lime", "explainability"],
  transformers: ["transformer", "self-attention", "encoder-decoder", "positional encoding"],
  bert: ["bert", "pretrained language model", "fine-tuning", "model distillation"],
  "llms-prompting": ["llm", "large language model", "prompt engineering", "agentic", "tool-use", "gpt"],
  embeddings: ["embedding", "vector search", "semantic similarity", "hybrid retrieval", "approximate nearest neighbor", "ann index"],
  rag: ["retrieval-augmented generation", "rag pipeline", "rag"],
  pandas: ["pandas", "dataframe", "groupby", "pivot table"],
  numpy: ["numpy", "broadcasting", "array manipulation"],
  "data-visualization": ["data visualization", "matplotlib", "seaborn", "plotly", "tableau", "power bi"],
  "statistical-analysis": ["statistical analysis", "hypothesis testing", "probability distribution", "correlation"],
  "etl-pipelines": ["etl", "data pipeline", "airflow", "orchestration dag"],
  "big-data-processing": ["spark", "apache spark", "big data", "dataframe api", "shuffling"],
  "ranking-algorithms": ["bm25", "ranking algorithm", "ndcg", "score fusion", "hybrid ranking"],
  pagerank: ["pagerank", "damping factor"],
  "probabilistic-structures": ["bloom filter", "minhash", "probabilistic data structure", "false-positive rate"],
  "suffix-structures": ["suffix array", "burrows-wheeler transform", "fm-index", "sa-is"],
  "hashing-techniques": ["hashmap", "consistent hashing", "hash table"],
  "unit-testing": ["unit testing", "unit test", "mocking", "test doubles", "code coverage"],
  "integration-testing": ["integration testing", "integration test", "test fixtures"],
  "e2e-testing": ["end-to-end testing", "e2e testing", "critical path testing"],
  tdd: ["test-driven development", "tdd", "red-green-refactor"],
  "performance-testing": ["performance testing", "load testing", "benchmark", "stress testing"],
  "appsec-fundamentals": ["application security", "owasp", "input validation", "sanitization"],
  "auth-authz-patterns": ["authentication", "authorization", "rbac", "role-based access control", "row-level security"],
  "cryptography-basics": ["cryptography", "encryption", "symmetric encryption", "asymmetric encryption", "password hashing"],
  "android-dev": ["android development", "android", "jetpack compose", "kotlin"],
  "ios-dev": ["ios development", "swiftui", "swift", "arc memory management"],
  "react-native": ["react native", "cross-platform mobile", "native module"],
  blockchain: ["blockchain", "smart contract", "consensus mechanism", "proof of stake", "proof of work"],
  "game-theory": ["game theory", "mechanism design", "nash equilibrium", "minimax", "regret minimization"],
  "optimization-lp": ["linear programming", "lp formulation", "lp duality", "column generation", "optimization"],
  "mock-interview-practice": ["mock interview", "problem-solving communication"],
  "technical-communication": ["technical writing", "technical documentation", "technical communication"],
  "agile-scrum": ["agile", "scrum", "sprint planning", "story estimation"],
  compilers: ["compiler", "compilers", "register allocation", "dominator tree", "compiler optimization"],
  sre: ["site reliability engineering", "sre", "sli", "slo", "sla", "incident response", "on-call", "postmortem"],
  "bi-tools": ["business intelligence", "excel", "pivot table", "power bi", "tableau"],
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
