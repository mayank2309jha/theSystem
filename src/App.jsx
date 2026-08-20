import { useEffect, useMemo } from "react";
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
import ResumeRaid from "./pages/ResumeRaid";
import Try from "./pages/Try";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { seedMissions, DIFFICULTY_XP } from "./data/seed";
import { skillCatalog } from "./data/skills";
import { hunterLevel } from "./lib/prep";

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

  // NOTE: missions/skill-levels/subskill-todos/company-prep-checklists are
  // still localStorage-backed here, namespaced per user id so different
  // accounts on the same browser stay isolated (see docs/CONTEXT.md — a real
  // cross-account leak was found and fixed once already for skillLevels/
  // missions; companyPrepChecked was found to have the SAME bug — namespaced
  // only, never left ungated — and subskillTodos is new and namespaced from
  // the start). A proper Supabase migration for all of this is still pending.
  const storageNamespace = user?.id ?? "anon";
  const [skillLevels, setSkillLevels] = useLocalStorage(`ts-skill-levels-${storageNamespace}`, defaultSkillLevels);
  const [missions, setMissions] = useLocalStorage(`ts-missions-${storageNamespace}`, seedMissions);
  const [subskillTodos, setSubskillTodos] = useLocalStorage(`ts-subskill-todos-${storageNamespace}`, {});
  const [companyPrepChecked, setCompanyPrepChecked] = useLocalStorage(`ts-company-prep-${storageNamespace}`, {});
  const [levelHistory, setLevelHistory] = useLocalStorage(`ts-level-history-${storageNamespace}`, []);

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

  const level = useMemo(() => hunterLevel(subskillTodos), [subskillTodos]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // One snapshot per real calendar day, updated live if level changes again
  // the same day — this is what lets the Home/Skill progress graphs show a
  // genuine trajectory instead of a synthetic one. Namespaced with
  // everything else above, so it's per-account from the start.
  useEffect(() => {
    setLevelHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last?.date === today) {
        return last.level === level ? prev : [...prev.slice(0, -1), { date: today, level }];
      }
      return [...prev, { date: today, level }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, today]);

  function setSkillLevel(id, val) {
    setSkillLevels((prev) => ({ ...prev, [id]: val }));
  }

  function claimSkills(skillIds, atLevel = 35) {
    setSkillLevels((prev) => {
      const next = { ...prev };
      for (const id of skillIds) {
        next[id] = Math.max(next[id] ?? 0, atLevel);
      }
      return next;
    });
  }

  function toggleSubskillTodo(todoId) {
    setSubskillTodos((prev) => {
      const next = { ...prev };
      if (next[todoId]) delete next[todoId];
      else next[todoId] = true;
      return next;
    });
  }

  function toggleCompanyPrepItem(companyId, index) {
    setCompanyPrepChecked((prev) => {
      const current = prev[companyId] ?? [];
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [companyId]: next };
    });
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
    level,
    levelHistory,
    today,
    missionStats,
    skillLevels,
    setSkillLevel,
    claimSkills,
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
