// Databases & data storage.
export const databaseSkills = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Databases",
    level: 10,
    why: "The database behind the PostgreSQL Index Advisor project — genuine, demonstrated depth here, named explicitly as an example skill to track.",
    subskills: [
      { id: "postgres-query-planning", name: "Query Planning (EXPLAIN ANALYZE)", weight: 3, todos: ["Run EXPLAIN ANALYZE on 3 real slow queries and fix each", "Explain the difference between a seq scan, index scan, and bitmap heap scan"] },
      { id: "postgres-indexing", name: "Index Design (B-tree, GIN, etc.)", weight: 3, todos: ["Explain B-tree prefix-domination pruning from your own Index Advisor project, unscripted", "Design a composite index for a real multi-column filter query"] },
      { id: "postgres-hypopg", name: "Hypothetical Index Screening (HypoPG)", weight: 2, todos: ["Explain how HypoPG lets you test an index's benefit without building it", "Re-derive the greedy marginal-utility index-selection algorithm on a whiteboard"] },
      { id: "postgres-connection-pooling", name: "Connection Pooling (HikariCP etc.)", weight: 2, todos: ["Write a postmortem-style explanation of the HikariCP concurrency race you diagnosed", "Explain how connection pool sizing affects throughput under load"] },
      { id: "postgres-vector-pgvector", name: "pgvector / Vector Search", weight: 2, todos: ["Benchmark pgvector's IVFFlat/HNSW index recall vs latency on real data", "Explain when a vector index beats brute-force cosine similarity"] },
    ],
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "Databases",
    level: 10,
    why: "Listed across every resume's Databases section alongside PostgreSQL — worth being able to speak to the differences.",
    subskills: [
      { id: "mysql-storage-engines", name: "Storage Engines (InnoDB)", weight: 2, todos: ["Explain InnoDB's row-level locking vs MyISAM's table-level locking", "Explain why InnoDB is the default engine for transactional workloads"] },
      { id: "mysql-replication", name: "Replication", weight: 1, todos: ["Explain MySQL's binlog-based replication at a high level", "Explain read-replica lag and its application-level implications"] },
    ],
  },
  {
    id: "redis",
    name: "Redis",
    category: "Databases",
    level: 10,
    why: "Listed across every resume — the natural production-grade counterpart to the from-scratch Distributed Key-Value Cache project.",
    subskills: [
      { id: "redis-data-structures", name: "Data Structures (strings, hashes, sorted sets)", weight: 2, todos: ["Pick the right Redis data structure for 3 different real caching problems", "Implement a leaderboard using a sorted set"] },
      { id: "redis-expiry-eviction", name: "TTL & Eviction Policies", weight: 2, todos: ["Explain LRU vs LFU eviction and when each is appropriate", "Swap Redis in as the backing store for a project that currently uses in-process caching"] },
      { id: "redis-pubsub", name: "Pub/Sub & Streams", weight: 1, todos: ["Build a small pub/sub notification flow using Redis", "Explain when Redis Streams is a better fit than Pub/Sub"] },
    ],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Databases",
    level: 10,
    why: "A standard NoSQL option worth understanding relative to the relational databases already on the resumes — likely relevant for other hunters' stacks.",
    subskills: [
      { id: "mongo-schema-design", name: "Document Schema Design", weight: 2, todos: ["Design a denormalized document schema for a real read-heavy use case", "Explain embedding vs referencing trade-offs with a concrete example"] },
      { id: "mongo-aggregation", name: "Aggregation Pipeline", weight: 2, todos: ["Write a multi-stage aggregation pipeline solving a real grouping/filtering problem", "Explain $lookup's performance implications versus a SQL join"] },
    ],
  },
  {
    id: "query-optimization",
    name: "Query Optimization & Indexing",
    category: "Databases",
    level: 10,
    why: "A cross-database skill, most deeply demonstrated in the Index Advisor project's B-tree domination pruning and HypoPG screening.",
    subskills: [
      { id: "query-opt-index-selection", name: "Index Selection Strategy", weight: 3, todos: ["Given a real workload, pick which columns to index and justify the choice", "Explain the cost of over-indexing (write amplification)"] },
      { id: "query-opt-covering-indexes", name: "Covering Indexes", weight: 1, todos: ["Design a covering index that eliminates a table lookup for a real query", "Explain what makes an index \"covering\" for a given query"] },
      { id: "query-opt-explain-plans", name: "Reading Query Plans", weight: 2, todos: ["Read an EXPLAIN plan and identify the most expensive operation", "Fix a query by rewriting it (not just indexing) based on a plan finding"] },
    ],
  },
  {
    id: "schema-design",
    name: "Database Normalization & Schema Design",
    category: "Databases",
    level: 10,
    why: "The structural skill underneath every database project — knowing when to normalize vs denormalize.",
    subskills: [
      { id: "schema-normal-forms", name: "Normal Forms (1NF-3NF)", weight: 2, todos: ["Normalize a real denormalized table to 3NF step by step", "Explain a case where you'd deliberately stop before 3NF"] },
      { id: "schema-relationships", name: "Modeling Relationships", weight: 2, todos: ["Design a schema with one-to-many and many-to-many relationships correctly", "Explain foreign key constraints' role in relational integrity"] },
      { id: "schema-migrations", name: "Schema Migrations", weight: 1, todos: ["Write a migration that adds a NOT NULL column to an existing table with data", "Explain the risk of a long-locking migration on a large production table"] },
    ],
  },
];
