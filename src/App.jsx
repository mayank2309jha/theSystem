import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { useProfile } from "./hooks/useProfile";
import { useSkillCatalog } from "./hooks/useSkillCatalog";
import { useSkillLevels } from "./hooks/useSkillLevels";
import { useSkillTodos } from "./hooks/useSkillTodos";
import { useCompanyPrep } from "./hooks/useCompanyPrep";
import { useMissions } from "./hooks/useMissions";
import { useLevelHistory } from "./hooks/useLevelHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerRoute from "./components/OwnerRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import CompanyPrep from "./pages/CompanyPrep";
import CompanyDetail from "./pages/CompanyDetail";
import SkillMaxing from "./pages/SkillMaxing";
import SkillDetail from "./pages/SkillDetail";
import ResumeMaxing from "./pages/ResumeMaxing";
import ResumeDetail from "./pages/ResumeDetail";
import Resume from "./pages/Resume";
import ResumeRaid from "./pages/ResumeRaid";
import Try from "./pages/Try";
import { DIFFICULTY_XP } from "./data/seed";
import { hunterLevel, provenSkillLevels } from "./lib/prep";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const { data: profile } = useProfile();

  // The skill catalog itself — fetched once from Supabase (skills/subskills
  // tables, migrated 2026-08-20; see supabase/schema.sql) and threaded
  // through outletContext as `catalog`. This is the "data-access layer": the
  // functions in lib/prep.js that need it now take it as a parameter instead
  // of importing a static bundle, so this is the ONE place in the
  // authenticated app that knows the catalog comes from a network request.
  // Try.jsx is the deliberate exception — see docs/CONTEXT.md.
  const { skillCatalog: catalog, isLoading: catalogLoading, error: catalogError } = useSkillCatalog();

  // All of this is account-backed (Supabase, RLS-scoped to the caller) —
  // progress follows you across devices/browsers, not just this one
  // browser's localStorage. See docs/CONTEXT.md for the migration history:
  // this used to be localStorage-only, namespaced per user id as an interim
  // measure; each hook below does a one-time pull of any leftover
  // localStorage data into the account the first time it finds zero rows,
  // so upgrading doesn't discard existing progress.
  const { skillLevels, setSkillLevel, claimSkills, isLoading: skillLevelsLoading } = useSkillLevels(catalog);
  const { subskillTodos, toggleSubskillTodo, isLoading: todosLoading } = useSkillTodos();
  const { companyPrepChecked, toggleCompanyPrepItem } = useCompanyPrep();
  const { missions, addMission, setMissionStatus, removeMission } = useMissions();

  const xp = useMemo(
    () =>
      missions
        .filter((m) => m.status === "Cleared" && m.xpAwarded)
        .reduce((sum, m) => sum + DIFFICULTY_XP[m.difficulty], 0),
    [missions]
  );

  const missionStats = useMemo(
    () => ({
      cleared: missions.filter((m) => m.status === "Cleared").length,
      active: missions.filter((m) => m.status === "Queued" || m.status === "In Progress").length,
    }),
    [missions]
  );

  const level = useMemo(() => hunterLevel(catalog, subskillTodos), [catalog, subskillTodos]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { levelHistory } = useLevelHistory(level, today, !catalogLoading && !skillLevelsLoading && !todosLoading);

  // PROVEN — derived purely from subskill-todo evidence (see lib/prep.js).
  // This is what Company Prep readiness, "Where to Focus Next", and Resume
  // Alignment-adjacent scoring read from now. `skillLevels` (the manual
  // slider) is passed down separately as "Self-Assessment" — a personal
  // reflection input on SkillDetail only, deliberately not read by any of
  // the above anymore. See docs/CONTEXT.md for why this changed.
  const provenLevels = useMemo(() => provenSkillLevels(catalog, subskillTodos), [catalog, subskillTodos]);

  const outletContext = {
    playerName: profile?.name ?? "Hunter",
    catalog,
    catalogLoading,
    catalogError,
    xp,
    level,
    levelHistory,
    today,
    missionStats,
    skillLevels,
    setSkillLevel,
    claimSkills,
    provenLevels,
    subskillTodos,
    toggleSubskillTodo,
    companyPrepChecked,
    toggleCompanyPrepItem,
    missions,
    addMission,
    setMissionStatus,
    removeMission,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/try" element={<Try />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout {...outletContext} />}>
            <Route path="/" element={<Home />} />
            <Route path="/companies" element={<CompanyPrep />} />
            <Route path="/company/:id" element={<CompanyDetail />} />
            <Route path="/skills" element={<SkillMaxing />} />
            <Route path="/skill/:id" element={<SkillDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/resume-raid" element={<ResumeRaid />} />

            <Route element={<OwnerRoute />}>
              <Route path="/resumes" element={<ResumeMaxing />} />
              <Route path="/resume/:slug" element={<ResumeDetail />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
