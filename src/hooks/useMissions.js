import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

function localStorageKey(userId) {
  return `ts-missions-${userId}`;
}

function readLegacyLocalStorage(userId) {
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Maps a DB row (snake_case) to the shape the rest of the app already uses
// (camelCase, matching src/data/seed.js's Mission shape).
function fromRow(row) {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    type: row.type,
    difficulty: row.difficulty,
    status: row.status,
    deadline: row.deadline,
    notes: row.notes,
    xpAwarded: row.xp_awarded,
  };
}

// Personal job-application tracker, backed by `missions` (one row per
// mission, RLS-scoped to the owning user). Seeded once from any leftover
// localStorage missions the first time an account has zero rows in the DB —
// see docs/CONTEXT.md for why this migration step exists.
export function useMissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["missions", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").eq("user_id", user.id).order("created_at");
      if (error) throw error;

      if (data.length === 0) {
        const legacy = readLegacyLocalStorage(user.id);
        if (Array.isArray(legacy) && legacy.length > 0) {
          const rows = legacy.map((m) => ({
            user_id: user.id,
            company: m.company,
            role: m.role,
            type: m.type,
            difficulty: m.difficulty,
            status: m.status,
            deadline: m.deadline || null,
            notes: m.notes || null,
            xp_awarded: !!m.xpAwarded,
          }));
          const { data: inserted, error: insertError } = await supabase.from("missions").insert(rows).select("*");
          if (insertError) throw insertError;
          return inserted.map(fromRow);
        }
      }

      return data.map(fromRow);
    },
  });

  const add = useMutation({
    mutationFn: async (mission) => {
      const { error } = await supabase.from("missions").insert({
        user_id: user.id,
        company: mission.company,
        role: mission.role,
        type: mission.type,
        difficulty: mission.difficulty,
        status: "Queued",
        deadline: mission.deadline || null,
        notes: mission.notes || null,
        xp_awarded: false,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const current = (queryClient.getQueryData(queryKey) ?? []).find((m) => m.id === id);
      const { error } = await supabase
        .from("missions")
        .update({ status, xp_awarded: status === "Cleared" ? true : current?.xpAwarded, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        (old ?? []).map((m) => (m.id === id ? { ...m, status, xpAwarded: status === "Cleared" ? true : m.xpAwarded } : m))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("missions").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => (old ?? []).filter((m) => m.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    missions: query.data ?? [],
    isLoading: query.isLoading,
    addMission: (mission) => add.mutate(mission),
    setMissionStatus: (id, status) => setStatus.mutate({ id, status }),
    removeMission: (id) => remove.mutate(id),
  };
}
