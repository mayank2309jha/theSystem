// Advanced/applied algorithms — the specialized techniques actually demonstrated
// in the Search & Retrieval Engine and Genome Indexing projects, distinct from
// generic interview DSA (which lives under Core CS -> Data Structures & Algorithms).
export const appliedAlgorithmsSkills = [
  {
    id: "ranking-algorithms",
    name: "BM25 & Ranking Algorithms",
    category: "Applied Algorithms",
    level: 10,
    why: "Implemented from scratch in the Search & Retrieval Engine — multi-term BM25 scoring across 8M+ postings.",
    subskills: [
      { id: "bm25-formula", name: "BM25 Formula Derivation", weight: 3, todos: ["Derive the BM25 formula term-by-term and explain what k1 and b each control", "Implement multi-term BM25 scoring from scratch on a small corpus"] },
      { id: "ranking-score-fusion", name: "Score Fusion (hybrid ranking)", weight: 2, todos: ["Re-derive the min-max normalized weighted fusion of BM25 + PageRank + embeddings from the Search Engine project", "Explain why naive score addition fails when scores are on different scales"] },
      { id: "ranking-evaluation", name: "IR Evaluation Metrics (nDCG)", weight: 2, todos: ["Compute nDCG@k by hand for a small ranked list with known relevance labels", "Explain why nDCG@10 improving doesn't guarantee every individual query improved"] },
    ],
  },
  {
    id: "pagerank",
    name: "PageRank",
    category: "Applied Algorithms",
    level: 10,
    why: "Used in the Search & Retrieval Engine's hybrid retrieval pipeline — including quantifying a ~58x PageRank selection bias in relevance judgments.",
    subskills: [
      { id: "pagerank-algorithm", name: "PageRank Algorithm & Damping Factor", weight: 3, todos: ["Implement PageRank's power-iteration method from scratch on a small graph", "Explain the damping factor's role and what happens without it (rank sinks)"] },
      { id: "pagerank-bias", name: "Bias Detection in Ranking Systems", weight: 2, todos: ["Re-derive how the ~58x PageRank selection bias was identified and quantified", "Design a check that would catch a similar bias in a new ranking system"] },
    ],
  },
  {
    id: "probabilistic-structures",
    name: "Bloom Filters & Probabilistic Data Structures",
    category: "Applied Algorithms",
    level: 10,
    why: "Used in the Distributed Genomic Streaming Pipeline (Bloom filters + MinHash), including diagnosing and fixing a real correctness flaw.",
    subskills: [
      { id: "bloom-filter-math", name: "Bloom Filter False-Positive Math", weight: 2, todos: ["Compute and document the false-positive-rate math for a real Bloom filter's parameters", "Implement a Bloom filter from scratch with configurable hash functions"] },
      { id: "minhash-similarity", name: "MinHash & Similarity Estimation", weight: 2, todos: ["Explain how MinHash estimates Jaccard similarity without full set comparison", "Explain why MinHash broke down comparing a short fragment against a whole genome, and what fixed it"] },
    ],
  },
  {
    id: "suffix-structures",
    name: "Suffix Arrays & String Indexing",
    category: "Applied Algorithms",
    level: 10,
    why: "Built entirely from scratch in the Genome Indexing Engine — SA-IS algorithm, Burrows-Wheeler Transform, FM-index.",
    subskills: [
      { id: "suffix-array-construction", name: "Suffix Array Construction (SA-IS)", weight: 3, todos: ["Write up how SA-IS achieves linear-time construction, in your own words", "Implement a naive O(n^2 log n) suffix array and compare its performance to SA-IS on the same input"] },
      { id: "bwt-fm-index", name: "Burrows-Wheeler Transform & FM-Index", weight: 3, todos: ["Implement BWT and its inverse by hand on a short string", "Explain how the FM-index enables substring search without scanning the full text"] },
    ],
  },
  {
    id: "hashing-techniques",
    name: "Hashing Techniques",
    category: "Applied Algorithms",
    level: 10,
    why: "Underlies hashmap internals (asked directly in a real Samsung interview), consistent hashing, and Bloom filters alike.",
    subskills: [
      { id: "hashing-hashmap-internals", name: "Hashmap Internal Implementation", weight: 3, todos: ["Implement a hashmap from scratch including collision handling", "Explain hashmap resizing and its amortized cost"] },
      { id: "hashing-consistent", name: "Consistent Hashing", weight: 2, todos: ["Explain consistent hashing's role in minimizing data movement when nodes are added/removed", "Implement a small consistent-hashing ring simulation"] },
    ],
  },
];
