// Distributed systems.
export const distributedSystemsSkills = [
  {
    id: "kafka",
    name: "Apache Kafka",
    category: "Distributed Systems",
    level: 10,
    why: "Demonstrated in the Distributed Genomic Streaming Pipeline — 8 parallel partitions, crash-safe persistence, 12s recovery with zero message loss.",
    subskills: [
      { id: "kafka-partitioning", name: "Partitioning Strategy", weight: 3, todos: ["Design a partition key for a real topic and justify it for even load distribution", "Explain how partition count affects consumer parallelism"] },
      { id: "kafka-consumer-groups", name: "Consumer Groups & Rebalancing", weight: 2, todos: ["Explain consumer-group rebalancing behavior from memory", "Reproduce a rebalance in a local Kafka setup and observe the effect"] },
      { id: "kafka-delivery-semantics", name: "Delivery Semantics (at-least-once/exactly-once)", weight: 3, todos: ["Add idempotent producer + transactional writes to a pipeline and document the change", "Explain the trade-off between at-most-once, at-least-once, and exactly-once"] },
      { id: "kafka-fault-tolerance", name: "Fault Tolerance & Replication", weight: 2, todos: ["Run a chaos test (kill a broker) and document what broke and what recovered", "Explain the role of the replication factor and ISR (in-sync replicas)"] },
    ],
  },
  {
    id: "message-queues",
    name: "Message Queues (RabbitMQ/SQS)",
    category: "Distributed Systems",
    level: 10,
    why: "The broader message-queue category beyond Kafka specifically — relevant for companies using different queueing tech.",
    subskills: [
      { id: "mq-patterns", name: "Queue vs Topic Patterns", weight: 2, todos: ["Explain point-to-point vs pub/sub messaging with a real use case for each", "Design a dead-letter-queue strategy for a failing consumer"] },
      { id: "mq-decoupling", name: "Decoupling Services with Queues", weight: 2, todos: ["Design a system using a queue to decouple a slow downstream service", "Explain the trade-off a queue introduces (eventual consistency, complexity) vs a direct call"] },
    ],
  },
  {
    id: "microservices",
    name: "Microservices Architecture",
    category: "Distributed Systems",
    level: 10,
    why: "The macro-architecture pattern behind multi-service systems like the Order Matching Engine's matching service + gateway + dashboard.",
    subskills: [
      { id: "microservices-boundaries", name: "Service Boundary Design", weight: 3, todos: ["Decompose a monolithic feature into 2-3 services and justify the boundaries", "Explain a case where a shared database between services caused a real problem"] },
      { id: "microservices-communication", name: "Inter-service Communication", weight: 2, todos: ["Compare sync (REST/gRPC) vs async (queue-based) inter-service communication for a real scenario", "Design an API gateway pattern for routing to multiple backend services"] },
      { id: "microservices-resilience", name: "Resilience Patterns (circuit breaker, retry)", weight: 2, todos: ["Implement a circuit breaker or retry-with-backoff for a flaky downstream call", "Explain cascading failure and one pattern that prevents it"] },
    ],
  },
  {
    id: "consensus-replication",
    name: "Consensus & Replication",
    category: "Distributed Systems",
    level: 10,
    why: "The theoretical backbone of distributed data consistency — directly probed in Apple's deep-dive on the Distributed KV Cache's partition/consistency behavior.",
    subskills: [
      { id: "consensus-cap-theorem", name: "CAP Theorem in Practice", weight: 2, todos: ["Classify 3 real systems by which 2 of CAP they prioritize", "Explain a network-partition scenario and what your system should do"] },
      { id: "consensus-leader-election", name: "Leader Election Basics", weight: 2, todos: ["Explain the intuition behind Raft/Paxos leader election without deep math", "Explain what happens to writes during a leader failover"] },
      { id: "consensus-replication-strategies", name: "Replication Strategies", weight: 2, todos: ["Explain synchronous vs asynchronous replication trade-offs", "Design a replication strategy for a system prioritizing read availability"] },
    ],
  },
  {
    id: "sharding",
    name: "Sharding & Partitioning",
    category: "Distributed Systems",
    level: 10,
    why: "A recurring HLD requirement — how to split data across nodes as scale grows.",
    subskills: [
      { id: "sharding-key-design", name: "Shard Key Design", weight: 3, todos: ["Design a shard key for a real dataset avoiding hot-spotting", "Explain the trade-off between range-based and hash-based sharding"] },
      { id: "sharding-resharding", name: "Resharding Strategy", weight: 2, todos: ["Explain consistent hashing's role in minimizing data movement during resharding", "Design a plan for migrating from 4 shards to 8 with minimal downtime"] },
    ],
  },
  {
    id: "observability",
    name: "Observability (Tracing/Metrics/Logging)",
    category: "Distributed Systems",
    level: 10,
    why: "Demonstrated via OpenTelemetry instrumentation in the Order Matching Engine's pipeline.",
    subskills: [
      { id: "observability-tracing", name: "Distributed Tracing", weight: 2, todos: ["Instrument a multi-service call path with OpenTelemetry and view the trace", "Explain how trace context propagation works across service boundaries"] },
      { id: "observability-metrics", name: "Metrics & Dashboards", weight: 2, todos: ["Stand up a Grafana/Prometheus dashboard against a real service's metrics", "Explain the difference between a counter, gauge, and histogram metric"] },
      { id: "observability-logging", name: "Structured Logging", weight: 1, todos: ["Convert a project's ad-hoc print/console logs into structured JSON logs", "Explain why correlation IDs matter across distributed logs"] },
    ],
  },
];
