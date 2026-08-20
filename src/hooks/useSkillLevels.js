import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";
import { skillCatalog } from "../data/skills";

const defaultSkillLevels = Object.fromEntries(skillCatalog.map((s) => [s.id, s.level]));

function localStorageKey(userId) {
  return `ts-skill-levels-${userId}`;
}

// Reads any pre-existing per-browser progress from the localStorage era (see
// docs/CONTEXT.md) so upgrading to account-backed storage doesn't silently
// discard someone's actual progress the first time they load the app after
// this migration.
function readLegacyLocalStorage(userId) {
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// The manually-set 0-100 proficiency slider per skill, one row per user per
// skill in `user_skill_levels`. Skills with no row yet fall back to the
// catalog's default seed (10, E-Rank) — same behavior as the old localStorage
// version, just sourced from the account instead of the browser.
export function useSkillLevels() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["skill-levels", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_skill_levels").select("skill_id, level").eq("user_id", user.id);
      if (error) throw error;

      const levels = { ...defaultSkillLevels };
      for (const row of data) levels[row.skill_id] = row.level;

      // One-time migration: if this account has never had any skill-level
      // rows but the browser has leftover localStorage progress from before
      // this migration, push it up once so it isn't silently lost.
      if (data.length === 0) {
        const legacy = readLegacyLocalStorage(user.id);
        if (legacy && Object.keys(legacy).length > 0) {
          const rows = Object.entries(legacy).map(([skill_id, level]) => ({ user_id: user.id, skill_id, level }));
          await supabase.from("user_skill_levels").upsert(rows, { onConflict: "user_id,skill_id" });
          return { ...defaultSkillLevels, ...legacy };
        }
      }

      return levels;
    },
  });

  const setLevel = useMutation({
    mutationFn: async ({ id, level }) => {
      const { error } = await supabase
        .from("user_skill_levels")
        .upsert({ user_id: user.id, skill_id: id, level, updated_at: new Date().toISOString() }, { onConflict: "user_id,skill_id" });
      if (error) throw error;
    },
    onMutate: async ({ id, level }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => ({ ...(old ?? defaultSkillLevels), [id]: level }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  // Batched version used by Resume Raid's "Start Tracking" — bumps several
  // skills to at least `atLevel` in one round trip instead of N separate ones.
  const claim = useMutation({
    mutationFn: async ({ ids, atLevel }) => {
      const current = queryClient.getQueryData(queryKey) ?? defaultSkillLevels;
      const rows = ids.map((id) => ({ user_id: user.id, skill_id: id, level: Math.max(current[id] ?? 0, atLevel) }));
      const { error } = await supabase.from("user_skill_levels").upsert(rows, { onConflict: "user_id,skill_id" });
      if (error) throw error;
    },
    onMutate: async ({ ids, atLevel }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        const next = { ...(old ?? defaultSkillLevels) };
        for (const id of ids) next[id] = Math.max(next[id] ?? 0, atLevel);
        return next;
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    skillLevels: query.data ?? defaultSkillLevels,
    isLoading: query.isLoading,
    setSkillLevel: (id, level) => setLevel.mutate({ id, level }),
    claimSkills: (ids, atLevel = 35) => claim.mutate({ ids, atLevel }),
  };
}
