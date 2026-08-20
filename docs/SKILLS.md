# Skills Inventory & Proof-of-Skill Roadmap

This is a ground-truth skill audit built by reading all 5 resumes (`Resumes/SDE.pdf`,
`SDE + Algo.pdf`, `Backend.pdf`, `ML.pdf`, `Non-Core Companies.pdf`) and every
project bullet inside them — both the skills explicitly named in each
TECHNICAL SKILLS section, and the skills/subskills actually *demonstrated* by
what was built (e.g. a resume line just says "Databases," but the PostgreSQL
Index Advisor project demonstrates hypothetical-index screening, connection-pool
race debugging, and greedy index-set selection specifically).

Structure: **Skill → Subskills → proof-of-skill todos.** Every subskill lists
where it's already demonstrated (if anywhere), then a small checklist of
concrete things to do to prove or deepen it. This is a portfolio/interview
checklist, not the app's Skill Maxing prep roadmap (see `SKILLS.md` vs the
live app's `/skills` tab — the app tracks interview-readiness rank; this
tracks *evidence*).

## Source projects (referenced by name throughout)

| Project | Advisor / Type | Dates | Appears on |
|---|---|---|---|
| M.Tech Project — Game Theoretic Approaches for Security Planning | Prof. Swaprava Nath | Jul 2026–Present | All 5 resumes |
| Real-Time Order Matching Engine | Prof. G Sivakumar | Jan–May 2026 | All 5 resumes |
| Search & Retrieval Engine | Prof. Soumen Chakrabarti | Jul 2026–Present | SDE, SDE+Algo, Backend, ML |
| PostgreSQL Index Advisor (a.k.a. Database Optimization Decision-Support Tool) | Prof. S. Sudarshan | Jul 2026–Present | All 5 resumes |
| NETRA: Full-Stack News Aggregation & Personalization Platform | Prof. Om Damani | Jul–Nov 2025 | SDE, SDE+Algo, Backend, ML |
| Genome Indexing & Search Engine | Self Project | Jul–Nov 2023 | SDE, SDE+Algo, Backend |
| Distributed Key-Value Cache | Self Project | Jan–Jul 2024 | All 5 resumes |
| Distributed Genomic Streaming Pipeline | Self Project | Jan–Jul 2024 | SDE, SDE+Algo, Backend, ML |
| Multi-Model Content Moderation & NLP Platform | Self Project | Jul–Nov 2023 | Backend, ML, Non-Core |
| Impact of Label Noise on ML Generalization | Prof. Abir De | Jul–Nov 2025 | ML |

---

## 1. Programming Languages

### Java
- **Core language & collections** — *Demonstrated in:* PostgreSQL Index Advisor (Java 21/Spring Boot), Genome Indexing Engine (built from scratch), Distributed Key-Value Cache.
  - [ ] Write a short note on 2 Java 21 features actually used (records, virtual threads?) and why.
  - [ ] Publish the Genome Indexing Engine's suffix-array code with a README explaining the algorithm — currently a private/self project.
- **Concurrency primitives (ReentrantLock, ExecutorService)** — *Demonstrated in:* Distributed Key-Value Cache (`ReentrantLock` protecting `LinkedHashMap`'s mutating-on-read order; fixed-thread-pool server).
  - [ ] Be ready to draw the exact race condition (capacity check / TTL update / LRU state) from memory on a whiteboard.
  - [ ] Add a `synchronized` vs `ReentrantLock` comparison note — when did you choose one over the other and why.
- **JVM internals (GC, memory model)** — *Not yet demonstrated.*
  - [ ] Profile one project's JVM heap under load (VisualVM/JFR) and write up one finding.
  - [ ] Read up on G1 vs ZGC and be able to explain the trade-off in one paragraph.

### C++
- **STL & manual memory management** — *Demonstrated in:* Order Matching Engine context (though matching core is Rust — see gap below), general coursework.
  - [ ] Implement one project's hot path in C++ instead of the current language, and benchmark the difference.
  - [ ] Implement `memcpy`/`strcpy` from scratch and explain the aliasing/overlap edge cases — directly asked at Nvidia.
- **Smart pointers / RAII** — *Not yet demonstrated in any project bullet.*
  - [ ] Build a tiny RAII wrapper (e.g. a file handle or lock guard) and write 3 sentences on why RAII prevents leaks.

### Python
- **Idiomatic Python (async, generators, typing)** — *Demonstrated in:* Search & Retrieval Engine (concurrent Python crawler), Multi-Model NLP Platform (FastAPI serving layer), Distributed Genomic Streaming Pipeline.
  - [ ] Add type hints + mypy/pyright clean run to one existing Python project.
  - [ ] Convert one synchronous script into `asyncio`-based and measure the throughput change.
- **Packaging & performance profiling** — *Not yet demonstrated.*
  - [ ] Profile one Python project with `cProfile`/`py-spy` and fix the top bottleneck; note the before/after numbers.

### JavaScript / TypeScript
- **React component architecture** — *Demonstrated in:* Real-Time Order Matching Engine (React trading dashboard), NETRA (React frontend), this very "The System" tracker app.
  - [ ] Add TypeScript to one currently-JS React project (this tracker app is a live candidate).
  - [ ] Write one custom hook that encapsulates non-trivial logic (you already have `useLocalStorage` in The System — document it).
- **Async/event-loop internals** — *Not yet demonstrated on resume, but asked directly at MathWorks (call stack/microtask/callback queue).*
  - [ ] Write a short explainer (even just personal notes) walking through a `setTimeout` + `Promise` ordering example.

### SQL
- **Query writing (joins, subqueries, window functions)** — *Demonstrated implicitly via* PostgreSQL Index Advisor, NETRA (bulk aggregation reducing 80→2 queries per page).
  - [ ] Solve LeetCode's Top SQL 50 study plan and keep the trickiest 5 solutions as reference.
  - [ ] Write the "second-highest salary" and "running total" query patterns from memory — both reported as real interview questions (TIAA, Oracle-adjacent).

---

## 2. Algorithms & Data Structures

### Core Data Structures (heaps, tries, hashmaps, trees)
- *Demonstrated in:* Real-Time Order Matching Engine (heap-based order books), Genome Indexing Engine (suffix arrays, FM-index), Distributed Key-Value Cache (`LinkedHashMap`-based LRU), Search & Retrieval Engine (flat-array positional inverted index).
  - [ ] Re-derive the heap-based order book's insert/cancel/match complexity on paper (target: state it without hesitation in an interview).
  - [ ] Implement a trie from scratch in an unfamiliar language as a warm-up drill (ties directly to a real Samsung interview question).

### Dynamic Programming & Greedy Algorithms
- *Demonstrated in:* NETRA (O(nk) greedy story-clustering, implemented from scratch), PostgreSQL Index Advisor (greedy marginal-utility index selection with domination pruning).
  - [ ] Solve 15 DP problems spanning knapsack, LIS, interval DP, and DP-on-trees; keep a personal pattern-recognition cheat sheet.
  - [ ] Write a one-page proof sketch for why the story-clustering greedy is optimal (or isn't) — practice defending greedy choices under pushback, a documented Apple interview pattern.

### Graph Algorithms
- *Demonstrated in:* Search & Retrieval Engine (PageRank), M.Tech Project (patrol-coverage graph modeling).
  - [ ] Implement Dijkstra and Union-Find from scratch without referencing notes.
  - [ ] Solve a "friends-of-friends" / graph-recommendation problem end to end — this exact pattern was asked at Apple.

### String Algorithms & Suffix Structures
- *Demonstrated in:* Genome Indexing Engine (SA-IS suffix array algorithm, Burrows-Wheeler Transform, FM-index — all built from scratch in Java).
  - [ ] Write a blog-style writeup of how SA-IS achieves linear-time construction — forces genuine understanding, not memorization.
  - [ ] Re-implement BWT + FM-index in a second language as a portability/understanding check.

### Bloom Filters & Probabilistic Data Structures
- *Demonstrated in:* Distributed Genomic Streaming Pipeline (Bloom filters + MinHash for similarity matching, including diagnosing and fixing a correctness flaw in the similarity check).
  - [ ] Compute and document the false-positive-rate math for the exact Bloom filter parameters you used.
  - [ ] Explain, in writing, why the short-fragment-vs-whole-genome comparison broke MinHash — this is a genuinely good "tell me about a bug you found" story; make sure it's polished.

### Ranking / IR Algorithms (BM25, PageRank, nDCG)
- *Demonstrated in:* Search & Retrieval Engine (multi-term BM25 from scratch, PageRank, hybrid fusion, nDCG@10 evaluation, quantified an ~58× PageRank selection bias), NETRA (nDCG@5).
  - [ ] Derive the BM25 formula term-by-term from memory (k1, b, IDF) and be ready to explain what each constant controls.
  - [ ] Write up the selection-bias finding as a standalone artifact (a chart + 3 sentences) — it's your strongest "found a subtle bug in an evaluation methodology" story.

---

## 3. Backend & API Engineering

### REST API Design
- *Demonstrated in:* NETRA (Flask REST API + JWT), Search & Retrieval Engine (FastAPI query service), Multi-Model NLP Platform (multi-model FastAPI serving layer with health/discovery endpoints), Real-Time Order Matching Engine (Express REST→gRPC gateway).
  - [ ] Write an OpenAPI/Swagger spec for one existing API — you likely don't have one yet.
  - [ ] Add rate limiting to one existing API and document the algorithm chosen (token bucket vs sliding window) — also doubles as System Design proof.

### Authentication & Authorization
- *Demonstrated in:* NETRA (JWT auth), Real-Time Order Matching Engine (Keycloak OIDC).
  - [ ] Implement refresh-token rotation on top of the existing JWT setup in NETRA (currently likely access-token-only).
  - [ ] Write a short comparison note: JWT vs OIDC/session-based auth, and when you'd choose each.

### Framework Depth (Spring Boot, FastAPI, Flask, Node.js)
- *Demonstrated in:* PostgreSQL Index Advisor (Spring Boot), Search & Retrieval Engine + Multi-Model NLP Platform (FastAPI), NETRA (Flask), Real-Time Order Matching Engine (Express/Node.js).
  - [ ] Pick your weakest of the four and build one small service in it from scratch (not adapted from an existing project).
  - [ ] Document dependency-injection patterns used in the Spring Boot project — a common SAP/Oracle-style follow-up question.

### Multi-Service / Gateway Architecture
- *Demonstrated in:* Real-Time Order Matching Engine (Rust/Tokio matching service + Express REST→gRPC gateway + React dashboard, unified via shared Protobuf contracts).
  - [ ] Diagram the full request path (browser → gateway → matching engine → storage) and rehearse explaining it in under 90 seconds.
  - [ ] Write down 2 alternative gateway designs you *didn't* choose and why — "the road not taken" is a recurring interview probe.

### Caching (LRU, TTL)
- *Demonstrated in:* Distributed Key-Value Cache (LRU eviction + TTL expiration, implemented from scratch with `ReentrantLock`-protected state).
  - [ ] Benchmark cache hit-rate under 2 different eviction policies (LRU vs LFU) on the same workload and compare.
  - [ ] Add cache-stampede protection (e.g. request coalescing) as a follow-on feature and document it.

---

## 4. Databases & Data Storage

### Query Optimization & Indexing
- *Demonstrated in:* PostgreSQL Index Advisor (HypoPG hypothetical-index screening, real `CREATE INDEX` + `EXPLAIN ANALYZE` validation, B-tree prefix-aware domination pruning, up to 96.5% measured improvement).
  - [ ] Run `EXPLAIN ANALYZE` on 3 real slow queries from any of your projects and document the fix.
  - [ ] Explain B-tree prefix domination pruning out loud, unscripted, to a friend/rubber duck — this is your single deepest DB story, protect it.

### Connection Pooling & Concurrency Bugs
- *Demonstrated in:* PostgreSQL Index Advisor (diagnosed a HikariCP concurrency race + cache-warming measurement bias via concurrent-load testing and symmetric median-of-3 benchmarking).
  - [ ] Write a postmortem-style doc of the HikariCP bug: symptom → hypothesis → diagnosis → fix. Great structure for a "tell me about a hard bug" answer.

### SQL Injection / Dynamic DDL Security
- *Demonstrated in:* PostgreSQL Index Advisor (schema allowlisting + quoted identifiers for dynamic DDL).
  - [ ] Write a short note on why dynamic DDL is a different injection surface than dynamic DML, and how allowlisting closes it.

### Vector / Semantic Storage (pgvector)
- *Demonstrated in:* NETRA (PostgreSQL/pgvector for the recommendation pipeline).
  - [ ] Benchmark pgvector's ANN index (IVFFlat/HNSW) recall vs latency trade-off on your own NETRA data.

### NoSQL / Key-Value & Caching Stores (Redis, custom KV)
- *Demonstrated in:* Distributed Key-Value Cache (built the actual server from scratch — TCP protocol, thread pool, eviction), general Redis usage across multiple projects' skill lists.
  - [ ] Swap Redis in as the backing store for one existing project that currently uses in-process caching, and measure the difference.

### Columnar / Analytical Storage (ClickHouse)
- *Demonstrated in:* Real-Time Order Matching Engine (decoupled matching from ClickHouse I/O via an async `mpsc` storage worker).
  - [ ] Write 3 sentences on why a columnar store fits a trade/order log better than a row store — be ready to justify this design choice.

---

## 5. Distributed Systems

### Stream Processing (Kafka)
- *Demonstrated in:* Distributed Genomic Streaming Pipeline (8 parallel Kafka partitions, crash-safe PostgreSQL persistence, proved 12s recovery with zero message loss under container-kill tests).
  - [ ] Explain consumer-group rebalancing behavior from memory — a classic distributed-systems follow-up.
  - [ ] Add exactly-once semantics (idempotent producer + transactional writes) to the pipeline if not already present, and document the change.

### Fault Tolerance & Chaos Testing
- *Demonstrated in:* Distributed Genomic Streaming Pipeline (Docker container-kill recovery tests), Distributed Key-Value Cache (3-node vs 1-node load testing).
  - [ ] Run a chaos test on one more project (kill a dependency mid-request) and document what broke and what you fixed.

### Consistency, Replication & Partition Tolerance
- *Demonstrated in:* Real-Time Order Matching Engine (100% traffic mirroring to a shadow engine for consistency verification), Apple interview deep-dive on the KV Cache's partition/consistency behavior (per placement survey).
  - [ ] Write out, from memory, the KV Cache's answers to: node failure, network partition, consistency guarantee, recovery steps. This exact question set was asked in a real Apple interview.

### Network Diagnostics
- *Demonstrated in:* Distributed Key-Value Cache (diagnosed TCP ephemeral-port exhaustion via `netstat`, identifying 16,340 `TIME_WAIT` sockets as the load-collapse root cause).
  - [ ] Reproduce the TIME_WAIT exhaustion locally and screen-record fixing it (`SO_REUSEADDR`, connection pooling, etc.) as a portfolio artifact.

### Observability (Tracing, Metrics)
- *Demonstrated in:* Real-Time Order Matching Engine (OpenTelemetry tracing and metrics instrumentation across the pipeline).
  - [ ] Stand up a Grafana/Prometheus dashboard against one project's OpenTelemetry metrics and screenshot it for your portfolio.

---

## 6. Systems Programming, OS & Networking

### Multithreading & Concurrency Primitives
- *Demonstrated in:* Distributed Key-Value Cache (fixed thread pool, closed 3 race conditions), Real-Time Order Matching Engine (async `mpsc` worker in Rust/Tokio).
  - [ ] Solve 5 problems from LeetCode's concurrency list (producer-consumer, rate limiter, etc.).
  - [ ] Write a short compare/contrast: Java's `ReentrantLock` vs Rust's ownership-based concurrency safety, grounded in your two projects that use each.

### TCP/Socket Programming
- *Demonstrated in:* Distributed Key-Value Cache (TCP protocol implemented from scratch, fixed-thread-pool server).
  - [ ] Implement a second, tiny TCP protocol (even something trivial like a chat relay) to confirm the skill generalizes beyond the one project.

### Low-Level C/C++ & Memory (malloc, pointers, endianness)
- *Not yet demonstrated on any resume project* — this is a known gap flagged repeatedly against Nvidia/NXP-tier companies.
  - [ ] Implement a toy `malloc`/`free` with alignment support.
  - [ ] Implement endianness conversion + detection from scratch.
  - [ ] Implement `memcpy`, `memmove`, `strcpy` and explain the overlap/aliasing difference between them.
  - [ ] Write a memory-leak-detection exercise: intentionally leak, then find it with Valgrind/ASan.

### Operating Systems Internals
- *Partially demonstrated via* project-level concurrency/caching work; not explicitly via an OS-focused project.
  - [ ] Write short notes (not full essays) on: process vs thread, paging vs segmentation, deadlock conditions, COW. Use them as flash-card prep, not just passive reading.
  - [ ] Tie each OS concept back to a real project decision where possible (e.g. thread pool sizing in the KV Cache → scheduling trade-offs).

### Computer Architecture (cache hierarchy, pipelining)
- *Not yet demonstrated on any resume project.*
  - [ ] Only invest here if targeting NVIDIA/Qualcomm-tier roles (per placement survey). If so: write notes on L1/L2/L3 cache behavior and why locality matters, grounded in a concrete example from one of your performance-benchmarked projects (Order Matching Engine's p50/p99 numbers are a good anchor).

---

## 7. Frontend & Web Engineering

### React Application Architecture
- *Demonstrated in:* Real-Time Order Matching Engine (trading dashboard), NETRA (full frontend), this tracker app ("The System").
  - [ ] Add automated component tests (you already list Playwright as a skill — actually wire it into one project's CI).
  - [ ] Write a short doc on the state-management approach used in NETRA/the trading dashboard (local state vs Redux vs context) and why.

### Build Tooling (Vite, Tailwind)
- *Demonstrated in:* This tracker app and others per resume skill lists.
  - [ ] Document one non-trivial Vite config decision (e.g. the Tailwind v4 CSS-variable palette mechanism you just built in The System) as a short writeup — it's a genuinely interesting technical decision.

### End-to-End & Browser Testing (Playwright)
- *Listed as a skill but not tied to a specific bullet in any project.*
  - [ ] Write one real Playwright test suite (even a handful of tests) for an existing project's critical path, and keep it in the repo — right now this is a claimed skill without a visible artifact.

---

## 8. Machine Learning & Data Science

### Classical ML (regression, SVM, decision trees, ensembles)
- *Demonstrated in:* Impact of Label Noise on ML Generalization (SVM regularization sensitivity, Random Forest tree-count sensitivity analysis across noise levels).
  - [ ] Re-run the Random Forest 10-vs-200-tree experiment on a new dataset to check the finding generalizes — strengthens the story with a second data point.

### Deep Learning & Transformers
- *Demonstrated in:* Search & Retrieval Engine (384-dim sentence-transformer embeddings), Multi-Model NLP Platform (DistilBERT fine-tuning), Distributed Genomic Streaming Pipeline (19-feature PyTorch classifier).
  - [ ] Fine-tune a transformer on a *new* task end to end (even a small one) to have a second, fresher DL story beyond the 2023 NLP project.
  - [ ] Write out the attention mechanism's softmax role from memory — a real Qualcomm interview question that has previously tripped up a candidate.

### NLP
- *Demonstrated in:* Multi-Model Content Moderation Platform (7.7M messages, 8 classical models + RNN + DistilBERT comparison, 13-class fallacy analysis engine), Search & Retrieval Engine (BM25 + semantic hybrid retrieval).
  - [ ] Compute and report a confusion matrix / per-class breakdown for the 13-class fallacy engine if not already documented — strengthens "how do you evaluate a multi-class classifier" answers.

### Model Evaluation & Statistical Rigor
- *Demonstrated in:* Multi-Model NLP Platform (LIME explainability, multi-seed evaluation, 1,000-resample bootstrap testing, paraphrase-robustness metric), Impact of Label Noise (750 experiment runs across 6 classifiers × 4 noise mechanisms × 5 levels × 5 seeds, reported a *non-replicating* cross-domain result).
  - [ ] Write a one-page "how I evaluate a model" checklist drawn from these two projects — bootstrap CIs, multi-seed runs, explicit negative-result reporting. This is a genuinely senior-level habit; make it visible.

### Noise-Robust Training & Data Quality
- *Demonstrated in:* Impact of Label Noise on ML Generalization (Generalized Cross-Entropy loss, confident-learning label cleaning, recovered up to 16.3pp/13.9pp of noise-induced accuracy loss).
  - [ ] Apply confident learning to a second, different dataset to confirm the technique transfers.

### Data Analysis (Pandas/NumPy/EDA)
- *Listed explicitly on the ML and Non-Core resumes; demonstrated implicitly across all data-heavy projects.*
  - [ ] Publish one standalone EDA notebook (even for an existing project's dataset) as a visible artifact — right now this skill has no dedicated deliverable of its own.

### Explainability & Robustness
- *Demonstrated in:* Multi-Model NLP Platform (LIME, paraphrase-robustness testing: 13.7%→2.3% prediction flips).
  - [ ] Try one more explainability technique (e.g. SHAP) on an existing model and compare what it surfaces vs LIME.

---

## 9. Testing & Quality Engineering

### Unit / Integration / E2E Testing
- *Demonstrated in:* NETRA (127 backend tests, 89% coverage), Distributed Key-Value Cache (26 unit/protocol/integration tests), Genome Indexing Engine (432 automated tests with independent reference-implementation cross-checks), Impact of Label Noise (pytest-based reproducible pipeline).
  - [ ] Push NETRA's coverage from 89% toward a stated target (e.g. 95%) and document what the remaining 11% was.
  - [ ] Add a CI badge / coverage badge to one repo's README — makes the testing claim independently verifiable.

### Property-Based & Regression Testing
- *Listed as a skill (SDE resume) but not tied to a specific documented bullet.*
  - [ ] Write one property-based test (e.g. with Hypothesis for Python or jqwik for Java) for an existing function, and keep it as a visible example.

### Benchmark & Load Testing Methodology
- *Demonstrated in:* Real-Time Order Matching Engine (p50/p99 latency benchmarking against a 500K-order book), Distributed Key-Value Cache (6 load scenarios, 20-concurrent-client tests), PostgreSQL Index Advisor (symmetric median-of-3 benchmarking to remove cache-warming bias).
  - [ ] Standardize your benchmarking methodology (median-of-N, warm-up discard) into a reusable script and reuse it across 2+ projects — turns a one-off practice into a demonstrable habit.

### CI/CD for Testing
- *Demonstrated in:* Impact of Label Noise (GitHub Actions CI running the full experiment suite).
  - [ ] Add a GitHub Actions workflow (lint + test) to any project that doesn't have one yet — this tracker app is a good candidate.

---

## 10. DevOps, Tooling & Infrastructure

### Containerization (Docker)
- *Demonstrated in:* Search & Retrieval Engine (containerized pipeline, calibrated 2–5GB memory limits), Multi-Model NLP Platform (Docker), Distributed Genomic Streaming Pipeline (Docker container-kill fault testing), Impact of Label Noise (Docker in the CI pipeline).
  - [ ] Write a multi-stage Dockerfile for one project that currently uses a single-stage build, and document the image-size reduction.

### CI/CD Pipelines
- *Demonstrated in:* Impact of Label Noise (GitHub Actions CI).
  - [ ] Extend CI to one more project (build + test + lint on every push) — right now this is a single-project proof point.

### Orchestration & Cloud Infra (Kubernetes, cloud deploys)
- *Not demonstrated in any project bullet* — flagged as a real gap against DevOps-flavored companies (Navi, Nexus, Neysa).
  - [ ] Containerize and deploy one existing project to a local Kubernetes cluster (minikube/kind) with a basic Deployment + Service.
  - [ ] Write a one-page comparison of your project's current deploy story (Supabase/Render/Vercel for NETRA) vs what a Kubernetes-based deploy would look like.

### Version Control & Collaboration (Git)
- *Demonstrated implicitly across every project; explicitly via the 3-person team collaboration on the Search & Retrieval Engine's bias-detection checks.*
  - [ ] Write a short note on your branching/PR workflow for the one project that had a team (Search & Retrieval Engine) — team-collaboration evidence is currently thin.

### Linux & Shell
- *Listed across multiple resumes' skill lists; demonstrated implicitly via `netstat`-based debugging in the KV Cache project.*
  - [ ] Write up one more Linux-diagnostics story (e.g. using `strace`/`lsof`/`top` to chase a real issue) to have a second concrete example beyond the TIME_WAIT one.

---

## 11. Software Architecture & System Design

### End-to-End System Architecture
- *Demonstrated in:* Real-Time Order Matching Engine (full Rust/Tokio + gateway + dashboard + auth + observability stack), NETRA (full-stack platform across 3 deploy targets), Search & Retrieval Engine (crawler → indexer → query-service pipeline).
  - [ ] Draw all 3 of these systems' architecture diagrams from memory and compare them side by side — reveals whether you actually internalized the trade-offs or just built to a spec.

### High-Level Design (rate limiters, recommendation systems, search)
- *Not explicitly named as a resume skill, but your own projects ARE real HLD case studies* — Order Matching Engine and Search & Retrieval Engine are close analogues to "design a matching engine" / "design a search engine" interview questions.
  - [ ] Practice designing a client-side rate limiter from a blank page (asked verbatim at Apple) — don't just study the concept, produce a diagram.
  - [ ] Practice designing a Swiggy/Uber-style dispatch system and a notification service — the two other most-repeated HLD prompts in the placement survey.

### API Contract & Cross-Language Interop Design
- *Demonstrated in:* Real-Time Order Matching Engine (shared Protobuf contracts across Rust/Node.js/test tooling), Search & Retrieval Engine (byte-exact cross-language binary index format with versioned sections, preserving compatibility across an 81× corpus expansion).
  - [ ] Write a short note on why you chose Protobuf over JSON for the Rust↔Node boundary, with the actual trade-off (schema evolution, binary size, codegen).

### Graceful Degradation & Failure Isolation
- *Demonstrated in:* Multi-Model NLP Platform (per-model failure isolation, graceful fallback, model discovery, health endpoints across a multi-model serving layer).
  - [ ] Chaos-test the multi-model serving layer by killing one model's process and confirming the others keep serving — turn the design claim into a recorded proof.

---

## 12. Applied Math, Optimization & Research Methodology

### Game Theory & Adversarial Modeling
- *Demonstrated in:* M.Tech Project (minimax, Counterfactual Regret Minimization, Online Learning for adversarial patrol planning).
  - [ ] Write a plain-English summary (no equations) of what CFR does and why it fits an adaptive-adversary setting — being able to explain it non-technically is what "translating technical models into actionable insights" (per your own resume bullet) actually requires.

### Linear Programming & Optimization
- *Demonstrated in:* M.Tech Project (3-stage LP and mixed-strategy formulation, LP duality, column generation for schedule construction).
  - [ ] Solve one LP by hand (simplex, 2-3 variables) as a sanity check that the tooling isn't doing all the thinking for you.
  - [ ] Explain LP duality's economic interpretation (shadow prices) in your own words.

### Algorithmic Proof & Correctness
- *Demonstrated in:* M.Tech Project (proved ≤K+1 iteration termination and worst-case optimality).
  - [ ] Re-derive the termination proof from memory without notes.

### Literature Review & Synthesis
- *Demonstrated in:* M.Tech Project (28-paper review synthesized into 3 frameworks).
  - [ ] Write a one-page "framework comparison table" (minimax vs CFR vs Online Learning) as a portable artifact — currently this synthesis only exists inside your head/report.

### Controlled Experimentation & Statistical Reporting
- *Demonstrated in:* Impact of Label Noise on ML Generalization (same-architecture controlled experiments, explicit non-replicating cross-domain result reported honestly rather than omitted).
  - [ ] Keep doing this — it's a genuinely rare, senior-signaling habit. For your next project, decide up front what would count as a "negative result" and commit to reporting it either way.

---

## Biggest visible gaps (cross-referenced against the placement survey)

These subskills have **no supporting project evidence at all** today, and were flagged as real interview content in `2025 Placement Stats (Responses).xlsx`:

- [ ] Low-level C/C++ memory management (malloc internals, endianness, memcpy variants) — Nvidia, NXP
- [ ] Kubernetes / container orchestration beyond Docker — Navi, Nexus, Neysa
- [ ] Computer architecture (cache hierarchy, register allocation, pipelining) — Qualcomm compiler track
- [ ] A dedicated, visible System Design portfolio artifact (diagrams, not just verbal prep) — Apple, Media.net, Stripe-tier companies
- [ ] A standalone Playwright/E2E test suite — claimed as a skill on 1 resume, no project ties to it yet

Tackling these five closes the largest gap between what's on the resumes and what real interviews at these companies actually probed.
