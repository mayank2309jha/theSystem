// Data engineering & analytics.
export const dataEngineeringSkills = [
  {
    id: "pandas",
    name: "Pandas",
    category: "Data Engineering",
    level: 10,
    why: "The core toolkit for Data Scientist/Analyst-flavored roles (Accenture, Coupa) — cleaning and exploring data fast.",
    subskills: [
      { id: "pandas-groupby-merge", name: "GroupBy, Merge & Pivot", weight: 2, todos: ["Solve a real multi-table merge + groupby aggregation without documentation lookups", "Explain the difference between merge, join, and concat"] },
      { id: "pandas-vectorization", name: "Vectorized Operations", weight: 2, todos: ["Rewrite a row-by-row loop using vectorized Pandas operations and measure the speedup", "Explain why .apply() is slower than a vectorized equivalent"] },
      { id: "pandas-missing-data", name: "Handling Missing Data", weight: 1, todos: ["Handle missing data with 3 different strategies (drop, impute, flag) and justify each choice", "Explain when imputation can silently bias a downstream model"] },
    ],
  },
  {
    id: "numpy",
    name: "NumPy",
    category: "Data Engineering",
    level: 10,
    why: "The numerical foundation beneath Pandas and most ML preprocessing code.",
    subskills: [
      { id: "numpy-broadcasting", name: "Broadcasting", weight: 2, todos: ["Explain broadcasting rules with a worked shape-mismatch example", "Vectorize a nested-loop numeric computation using broadcasting"] },
      { id: "numpy-array-ops", name: "Array Manipulation", weight: 1, todos: ["Use reshape/transpose/stack correctly on a real multi-dimensional array problem", "Explain the difference between a view and a copy in NumPy"] },
    ],
  },
  {
    id: "data-visualization",
    name: "Data Visualization",
    category: "Data Engineering",
    level: 10,
    why: "Communicating findings is as important as producing them, especially for Data Scientist/Analyst roles.",
    subskills: [
      { id: "dataviz-chart-selection", name: "Choosing the Right Chart", weight: 2, todos: ["Pick the correct chart type for 5 different real data-story scenarios and justify each", "Critique a real bad chart (misleading axis, wrong chart type) and redesign it"] },
      { id: "dataviz-tools", name: "Matplotlib/Seaborn/Plotly", weight: 2, todos: ["Build a publication-quality chart with proper labels/legend from scratch", "Build one interactive chart (Plotly) for a real dataset"] },
    ],
  },
  {
    id: "statistical-analysis",
    name: "Statistical Analysis",
    category: "Data Engineering",
    level: 10,
    why: "Directly tested in a real interview (\"SQL and statistical analysis in a McKinsey-style data scientist interview\" per placement survey notes).",
    subskills: [
      { id: "stats-hypothesis-testing", name: "Hypothesis Testing", weight: 2, todos: ["Run a t-test or chi-square test on real data and interpret the p-value correctly", "Explain the difference between statistical significance and practical significance"] },
      { id: "stats-distributions", name: "Probability Distributions", weight: 1, todos: ["Identify which distribution fits a real dataset's shape and justify it", "Explain the Central Limit Theorem in your own words with an example"] },
      { id: "stats-correlation-causation", name: "Correlation vs Causation", weight: 2, todos: ["Give a real example where correlation was mistaken for causation and explain the confound", "Design a simple experiment (A/B test) to establish causation for a real question"] },
    ],
  },
  {
    id: "eda",
    name: "Exploratory Data Analysis (EDA)",
    category: "Data Engineering",
    level: 10,
    why: "The bridge from raw data to a modeling-ready dataset — its own distinct skill from either Pandas mechanics or statistics theory.",
    subskills: [
      { id: "eda-workflow", name: "EDA Workflow", weight: 2, todos: ["Go from a raw CSV to a clean, documented EDA notebook in under 30 minutes", "Publish one standalone EDA notebook as a visible portfolio artifact"] },
      { id: "eda-outlier-detection", name: "Outlier Detection", weight: 1, todos: ["Detect outliers using both a statistical method (IQR/z-score) and a visual method (boxplot)", "Explain when an outlier should be removed versus investigated further"] },
    ],
  },
  {
    id: "etl-pipelines",
    name: "ETL / Data Pipelines",
    category: "Data Engineering",
    level: 10,
    why: "The production-scale counterpart to ad-hoc EDA — moving and transforming data reliably at scale.",
    subskills: [
      { id: "etl-design", name: "Pipeline Design (Extract/Transform/Load)", weight: 2, todos: ["Design an ETL pipeline for a real recurring data-refresh scenario", "Explain idempotency's importance in a re-runnable pipeline"] },
      { id: "etl-orchestration", name: "Orchestration (Airflow-style DAGs)", weight: 1, todos: ["Explain what a DAG-based orchestrator adds over a cron job for complex pipelines", "Design a DAG with explicit task dependencies for a multi-step pipeline"] },
    ],
  },
  {
    id: "big-data-processing",
    name: "Spark / Big Data Processing",
    category: "Data Engineering",
    level: 10,
    why: "The standard tool once data outgrows single-machine Pandas processing — relevant for data-engineering-leaning roles.",
    subskills: [
      { id: "spark-rdd-dataframe", name: "DataFrame API & Lazy Evaluation", weight: 2, todos: ["Explain lazy evaluation and why Spark builds a DAG before executing", "Write a Spark job performing a real aggregation over a large dataset"] },
      { id: "spark-partitioning", name: "Partitioning & Shuffling", weight: 2, todos: ["Explain what causes an expensive shuffle and one way to reduce it", "Explain how partition count affects parallelism in a Spark job"] },
    ],
  },
];
