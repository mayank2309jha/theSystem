// Specialized/emerging domains — mobile (industry breadth for other hunters),
// blockchain, and the applied-math domains genuinely demonstrated in the M.Tech project.
export const specializedSkills = [
  {
    id: "android-dev",
    name: "Android Development",
    category: "Specialized",
    level: 10,
    why: "A major mobile track relevant to other hunters even though not on this resume set — Kotlin-first Android is a standard SDE specialization.",
    subskills: [
      { id: "android-lifecycle", name: "Activity/Fragment Lifecycle", weight: 2, todos: ["Explain the Activity lifecycle and a real bug caused by mishandling it", "Build a small app correctly handling configuration changes (rotation)"] },
      { id: "android-jetpack-compose", name: "Jetpack Compose", weight: 2, todos: ["Build a screen using Compose's declarative UI model", "Explain recomposition and how to avoid unnecessary recompositions"] },
    ],
  },
  {
    id: "ios-dev",
    name: "iOS Development",
    category: "Specialized",
    level: 10,
    why: "The other major mobile platform — Swift/SwiftUI fluency for iOS-focused roles.",
    subskills: [
      { id: "ios-swiftui", name: "SwiftUI Basics", weight: 2, todos: ["Build a small app using SwiftUI's declarative view model", "Explain State/Binding's role in SwiftUI data flow"] },
      { id: "ios-memory-arc", name: "Memory Management (ARC)", weight: 1, todos: ["Explain Automatic Reference Counting and a real retain-cycle bug", "Fix a retain cycle using weak/unowned references"] },
    ],
  },
  {
    id: "react-native",
    name: "React Native / Cross-Platform Mobile",
    category: "Specialized",
    level: 10,
    why: "A natural extension for React-fluent developers targeting mobile without learning two native stacks.",
    subskills: [
      { id: "rn-native-modules", name: "Bridging Native Modules", weight: 2, todos: ["Explain when a native module is needed versus pure JS/RN suffices", "Integrate one native capability (camera, location) into a small RN app"] },
      { id: "rn-performance", name: "Performance on Mobile", weight: 1, todos: ["Profile a real RN app for a jank/performance issue and fix it", "Explain the bridge's performance implications versus fully native"] },
    ],
  },
  {
    id: "blockchain",
    name: "Blockchain Fundamentals",
    category: "Specialized",
    level: 10,
    why: "A named growth area in 2026 industry hiring trend data — worth basic conceptual literacy.",
    subskills: [
      { id: "blockchain-consensus", name: "Consensus Mechanisms (PoW/PoS)", weight: 2, todos: ["Explain Proof of Work vs Proof of Stake's security/energy trade-off", "Explain what makes a blockchain resistant to retroactive tampering"] },
      { id: "blockchain-smart-contracts", name: "Smart Contracts Basics", weight: 1, todos: ["Write and deploy a minimal smart contract to a testnet", "Explain gas fees' purpose in preventing infinite-loop abuse"] },
    ],
  },
  {
    id: "game-theory",
    name: "Game Theory & Mechanism Design",
    category: "Specialized",
    level: 10,
    why: "Directly demonstrated in the M.Tech project — minimax, Counterfactual Regret Minimization, and Online Learning for adversarial security planning.",
    subskills: [
      { id: "game-theory-nash-equilibrium", name: "Nash Equilibrium & Minimax", weight: 2, todos: ["Explain minimax with a 2-player zero-sum example, solved by hand", "Explain why minimax fits an adaptive-adversary setting (as in the M.Tech project)"] },
      { id: "game-theory-regret-minimization", name: "Regret Minimization (CFR)", weight: 3, todos: ["Write a plain-English summary of what Counterfactual Regret Minimization does, no equations", "Explain why CFR converges to equilibrium in repeated games"] },
      { id: "game-theory-mechanism-design", name: "Mechanism Design Basics", weight: 1, todos: ["Explain incentive-compatibility with one real mechanism-design example (e.g. an auction)", "Explain the difference between game theory (given rules, find strategy) and mechanism design (design rules for a desired outcome)"] },
    ],
  },
  {
    id: "optimization-lp",
    name: "Linear Programming & Optimization",
    category: "Specialized",
    level: 10,
    why: "Demonstrated via the M.Tech project's 3-stage LP formulation, LP duality, and column generation for patrol scheduling.",
    subskills: [
      { id: "lp-formulation", name: "LP Formulation", weight: 2, todos: ["Formulate a real resource-allocation problem as an LP (objective + constraints)", "Solve a small LP by hand using the simplex method as a sanity check"] },
      { id: "lp-duality", name: "LP Duality", weight: 3, todos: ["Explain LP duality's economic interpretation (shadow prices) in your own words", "Derive the dual of a small LP by hand"] },
      { id: "lp-column-generation", name: "Column Generation", weight: 2, todos: ["Re-derive how column generation was used to construct the integer mixed strategy in the M.Tech project", "Explain why column generation is needed when the full LP is too large to solve directly"] },
    ],
  },
];
