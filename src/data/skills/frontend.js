// Frontend & web — React ecosystem plus industry-standard additions.
export const frontendSkills = [
  {
    id: "react",
    name: "React",
    category: "Frontend",
    level: 10,
    why: "Used in 3+ resume projects (trading dashboard, NETRA, this tracker) — a solid baseline, useful for full-stack roles (SAP, Media.net, Juspay).",
    subskills: [
      { id: "react-hooks", name: "React Hooks", weight: 3, todos: ["Explain useState/useEffect/useMemo/useCallback with a real example each", "Write a custom hook that encapsulates non-trivial reusable logic"] },
      { id: "react-component-design", name: "Component Composition", weight: 2, todos: ["Refactor a large component into smaller composable pieces", "Explain when to lift state up vs use context"] },
      { id: "react-state-management", name: "State Management (Context/Redux)", weight: 2, todos: ["Build a feature using Context API and explain when it's not enough", "Explain Redux's unidirectional data flow with a diagram"] },
      { id: "react-router", name: "React Router", weight: 2, todos: ["Implement nested routes with protected-route guards", "Explain the difference between client-side and server-side routing"] },
      { id: "react-performance", name: "Performance Optimization", weight: 2, todos: ["Use React.memo/useMemo to fix a real unnecessary re-render", "Profile a component with React DevTools Profiler and report a finding"] },
      { id: "react-forms", name: "Controlled Forms & Validation", weight: 1, todos: ["Build a controlled multi-field form with validation from scratch", "Explain controlled vs uncontrolled inputs with an example"] },
      { id: "react-testing", name: "Testing React Components", weight: 1, todos: ["Write a Playwright or Testing Library test for a real component's critical path", "Explain the difference between unit-testing a component and E2E-testing a flow"] },
    ],
  },
  {
    id: "redux",
    name: "Redux",
    category: "Frontend",
    level: 10,
    why: "Explicitly listed on the resume skill lists — state-management depth beyond basic React state.",
    subskills: [
      { id: "redux-store-design", name: "Store & Slice Design", weight: 2, todos: ["Design a normalized Redux store for a real feature", "Explain why you'd normalize nested API data before storing it"] },
      { id: "redux-async-thunks", name: "Async Actions (Thunks/RTK Query)", weight: 2, todos: ["Implement an async data-fetch flow with loading/error/success states", "Explain the middleware chain's role in handling async actions"] },
      { id: "redux-selectors", name: "Selectors & Memoization", weight: 1, todos: ["Write a memoized selector with reselect or RTK's createSelector", "Explain why unmemoized selectors can cause performance issues"] },
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "Frontend",
    level: 10,
    why: "A leading 2026 frontend framework per industry trend data — worth tracking for full-stack/frontend-heavy roles even though not yet on the resumes.",
    subskills: [
      { id: "nextjs-routing", name: "App Router & File-based Routing", weight: 2, todos: ["Build a small app using nested layouts and dynamic routes", "Explain the difference between the App Router and Pages Router"] },
      { id: "nextjs-rendering", name: "SSR/SSG/ISR Rendering Modes", weight: 2, todos: ["Explain when to choose SSR vs SSG vs client-side rendering for a given page", "Build one page using static generation and one using server rendering"] },
      { id: "nextjs-api-routes", name: "API Routes / Server Actions", weight: 1, todos: ["Build a server action or API route that talks to a database", "Explain the security implications of exposing a server action"] },
    ],
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    category: "Frontend",
    level: 10,
    why: "The baseline every frontend claim rests on — layout, accessibility, and responsive design fundamentals.",
    subskills: [
      { id: "css-flexbox-grid", name: "Flexbox & Grid Layout", weight: 2, todos: ["Build a responsive layout using Grid and one using Flexbox, explaining when each fits", "Recreate a real UI pattern (card grid, sidebar layout) from scratch"] },
      { id: "css-responsive", name: "Responsive Design", weight: 2, todos: ["Build a mobile-first layout with breakpoints from scratch", "Explain the difference between mobile-first and desktop-first CSS strategy"] },
      { id: "html-semantics-a11y", name: "Semantic HTML & Accessibility", weight: 2, todos: ["Audit a real page for accessibility issues using a checker tool and fix 3", "Explain ARIA roles' purpose with one concrete example"] },
    ],
  },
  {
    id: "build-tooling",
    name: "Vite / Build Tooling",
    category: "Frontend",
    level: 10,
    why: "Used across the resume projects and this tracker's own Tailwind v4 CSS-variable palette mechanism — a genuinely interesting build-config decision worth being able to explain.",
    subskills: [
      { id: "build-bundling", name: "Bundling & Code Splitting", weight: 2, todos: ["Add dynamic import()-based code splitting to a real route and measure the bundle-size difference", "Explain tree-shaking's requirements (ESM, side-effect-free code)"] },
      { id: "build-config", name: "Build Config Customization", weight: 1, todos: ["Configure a custom Vite plugin or alias for a real project need", "Explain the difference between dev-server and production build behavior"] },
      { id: "build-env-vars", name: "Environment Variable Handling", weight: 1, todos: ["Set up and correctly scope client-safe vs server-only env vars in a project", "Explain the security implications of a VITE_-prefixed variable"] },
    ],
  },
  {
    id: "e2e-testing-frontend",
    name: "Playwright / E2E Testing",
    category: "Frontend",
    level: 10,
    why: "Listed as a resume skill — worth having a real, visible test suite as proof, not just a claim.",
    subskills: [
      { id: "playwright-selectors", name: "Robust Selectors", weight: 2, todos: ["Write tests using role/text-based selectors instead of brittle CSS selectors", "Explain why data-testid is sometimes preferable to semantic selectors"] },
      { id: "playwright-flows", name: "Multi-step User Flow Testing", weight: 2, todos: ["Write an E2E test covering a full signup-to-first-action flow", "Handle a flaky async wait correctly using proper wait conditions, not sleep()"] },
      { id: "playwright-ci", name: "Running E2E Tests in CI", weight: 1, todos: ["Wire a Playwright suite into a GitHub Actions workflow", "Configure it to fail the build on a real regression"] },
    ],
  },
];
