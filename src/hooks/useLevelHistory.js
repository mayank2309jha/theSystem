import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

function localStorageKey(userId) {
  return `ts-level-history-${userId}`;
}

function readLegacyLocalStorage(userId) {
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// One Level snapshot per calendar day (user_level_history), what drives the
// Progress Over Time graph on Home/Skill Detail. Writes are skipped until
// `ready` is true — `level` is computed from subskill-todo data that loads
// asynchronously, and briefly reads as the empty-state default (Level 1)
// before that resolves; writing during that window would record a spurious
// low snapshot that the very next render immediately corrects.
export function useLevelHistory(level, today, ready) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["level-history", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_level_history").select("date, level").eq("user_id", user.id).order("date");
      if (error) throw error;

      if (data.length === 0) {
        const legacy = readLegacyLocalStorage(user.id);
        if (Array.isArray(legacy) && legacy.length > 0) {
          const rows = legacy.map((h) => ({ user_id: user.id, date: h.date, level: h.level }));
          await supabase.from("user_level_history").upsert(rows, { onConflict: "user_id,date" });
          return legacy;
        }
      }

      return data;
    },
  });

  const record = useMutation({
    mutationFn: async ({ date, level: lvl }) => {
      const { error } = await supabase
        .from("user_level_history")
        .upsert({ user_id: user.id, date, level: lvl, updated_at: new Date().toISOString() }, { onConflict: "user_id,date" });
      if (error) throw error;
    },
    onMutate: async ({ date, level: lvl }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        const rest = (old ?? []).filter((h) => h.date !== date);
        return [...rest, { date, level: lvl }];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const history = query.data ?? [];
  const todaysRow = history.find((h) => h.date === today);

  // Auto-record: whenever the live-computed `level` diverges from what's
  // stored for today, write it once. Mirrors the old useEffect that lived
  // directly in App.jsx before this became account-backed.
  useEffect(() => {
    if (!user || !ready || query.isLoading) return;
    if (todaysRow?.level === level) return;
    record.mutate({ date: today, level });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready, query.isLoading, level, today, todaysRow?.level]);

  return { levelHistory: history, isLoading: query.isLoading };
}
