import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { useProfile } from "./hooks/useProfile";
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
import Try from "./pages/Try";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { seedMissions, DIFFICULTY_XP } from "./data/seed";
import { skillCatalog } from "./data/skills";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const defaultSkillLevels = Object.fromEntries(skillCatalog.map((s) => [s.id, s.level]));

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
  const { user } = useAuth();
  const { data: profile } = useProfile();

  // NOTE: missions/skill-levels are still localStorage-backed here, namespaced
  // per user id so two accounts on the same browser stay isolated during
  // Phase A/B. Phase B moves Mission Board to Supabase; Phase C replaces
  // skillLevels entirely with the todo-driven proficiency model.
  const storageNamespace = user?.id ?? "anon";
  const [skillLevels, setSkillLevels] = useLocalStorage(`ts-skill-levels-${storageNamespace}`, defaultSkillLevels);
  const [missions, setMissions] = useLocalStorage(`ts-missions-${storageNamespace}`, seedMissions);

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

  function setSkillLevel(id, level) {
    setSkillLevels((prev) => ({ ...prev, [id]: level }));
  }

  function addMission(mission) {
    setMissions((prev) => [...prev, { ...mission, id: uid(), status: "Queued", xpAwarded: false }]);
  }

  function setMissionStatus(id, status) {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status, xpAwarded: status === "Cleared" ? true : m.xpAwarded } : m))
    );
  }

  function removeMission(id) {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  }

  const outletContext = {
    playerName: profile?.name ?? "Hunter",
    xp,
    missionStats,
    skillLevels,
    setSkillLevel,
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
