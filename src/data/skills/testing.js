// Testing & quality engineering.
export const testingSkills = [
  {
    id: "unit-testing",
    name: "Unit Testing",
    category: "Testing & Quality",
    level: 10,
    why: "Demonstrated at real depth: 127 backend tests at 89% coverage (NETRA), 432 automated tests with independent reference-implementation cross-checks (Genome Indexing Engine).",
    subskills: [
      { id: "unit-test-design", name: "Writing Effective Test Cases", weight: 2, todos: ["Write tests covering happy path, edge cases, and error cases for a real function", "Explain what makes a test brittle versus robust"] },
      { id: "unit-test-mocking", name: "Mocking & Test Doubles", weight: 2, todos: ["Mock an external dependency (API/DB) correctly in a unit test", "Explain the risk of over-mocking (tests pass but production breaks)"] },
      { id: "unit-test-coverage", name: "Coverage Analysis", weight: 1, todos: ["Push a real project's coverage toward a stated target and document what the remaining gap was", "Explain why 100% coverage doesn't guarantee bug-free code"] },
    ],
  },
  {
    id: "integration-testing",
    name: "Integration Testing",
    category: "Testing & Quality",
    level: 10,
    why: "Distinct from unit testing — verifying that components work together, not just in isolation.",
    subskills: [
      { id: "integration-test-design", name: "Designing Integration Tests", weight: 2, todos: ["Write a test exercising a real multi-component flow (API -> DB -> response)", "Explain the trade-off between integration tests' realism and their speed/flakiness"] },
      { id: "integration-test-fixtures", name: "Test Fixtures & Data Setup", weight: 1, todos: ["Set up and tear down real test data correctly to avoid test pollution", "Explain why shared mutable test state causes flaky test suites"] },
    ],
  },
  {
    id: "e2e-testing",
    name: "End-to-End (E2E) Testing",
    category: "Testing & Quality",
    level: 10,
    why: "Verifies the full user-facing flow — the highest-confidence, slowest-running layer of the testing pyramid.",
    subskills: [
      { id: "e2e-critical-paths", name: "Identifying Critical Paths to Test", weight: 2, todos: ["Identify the 3 most critical user flows in a real project and write E2E tests for them", "Explain why you shouldn't E2E-test everything unit tests already cover"] },
      { id: "e2e-flakiness", name: "Avoiding Flaky Tests", weight: 2, todos: ["Fix a real flaky test by replacing a sleep() with a proper wait condition", "Explain common causes of E2E flakiness (timing, shared state, network)"] },
    ],
  },
  {
    id: "tdd",
    name: "Test-Driven Development (TDD)",
    category: "Testing & Quality",
    level: 10,
    why: "A discipline, not just a testing type — worth being able to demonstrate the red-green-refactor cycle concretely.",
    subskills: [
      { id: "tdd-red-green-refactor", name: "Red-Green-Refactor Cycle", weight: 2, todos: ["Build one small feature strictly TDD-first (failing test, minimal code, refactor)", "Explain TDD's claimed design benefit beyond just \"catching bugs early\""] },
    ],
  },
  {
    id: "performance-testing",
    name: "Performance & Load Testing",
    category: "Testing & Quality",
    level: 10,
    why: "Demonstrated via the Order Matching Engine's p50/p99 latency benchmarking and the Distributed KV Cache's 6-load-scenario testing.",
    subskills: [
      { id: "perf-benchmarking", name: "Benchmark Methodology", weight: 3, todos: ["Standardize a benchmarking approach (median-of-N, warm-up discard) and reuse it across 2+ projects", "Explain why measuring a single run's latency is misleading versus p50/p99"] },
      { id: "perf-load-testing", name: "Load Testing at Scale", weight: 2, todos: ["Run a load test against a real service and identify the first bottleneck that appears", "Explain the difference between load testing and stress testing"] },
    ],
  },
];
