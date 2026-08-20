import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

function localStorageKey(userId) {
  return `ts-subskill-todos-${userId}`;
}

function readLegacyLocalStorage(userId) {
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Proof-of-skill todo completions — { "skillId:subskillId:todoIndex": true }.
// Row existence in user_skill_todos IS "checked" (same semantics the old
// localStorage sparse map used); unchecking deletes the row rather than
// setting completed=false, so `Object.keys(subskillTodos).length` (what
// hunterLevel counts) means the same thing either way.
export function useSkillTodos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["skill-todos", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_skill_todos").select("todo_id").eq("user_id", user.id);
      if (error) throw error;

      if (data.length === 0) {
        const legacy = readLegacyLocalStorage(user.id);
        const legacyIds = legacy ? Object.keys(legacy) : [];
        if (legacyIds.length > 0) {
          const rows = legacyIds.map((todo_id) => ({ user_id: user.id, todo_id }));
          await supabase.from("user_skill_todos").upsert(rows, { onConflict: "user_id,todo_id" });
          return Object.fromEntries(legacyIds.map((id) => [id, true]));
        }
      }

      return Object.fromEntries(data.map((row) => [row.todo_id, true]));
    },
  });

  // `wasChecked` is captured once, at click time, and threaded through to
  // both onMutate and mutationFn — NOT re-derived from the query cache
  // inside mutationFn, which would race against onMutate's optimistic write
  // (mutations run onMutate BEFORE mutationFn, so by the time mutationFn's
  // own cache read would happen, the optimistic flip has already landed and
  // the read would see the NEW state, silently doing the opposite DB
  // operation of what was intended — this bit us once, don't reintroduce it).
  const toggle = useMutation({
    mutationFn: async ({ todoId, wasChecked }) => {
      if (wasChecked) {
        const { error } = await supabase.from("user_skill_todos").delete().eq("user_id", user.id).eq("todo_id", todoId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_skill_todos").upsert(
          { user_id: user.id, todo_id: todoId, completed_at: new Date().toISOString() },
          { onConflict: "user_id,todo_id" }
        );
        if (error) throw error;
      }
    },
    onMutate: async ({ todoId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        const next = { ...(old ?? {}) };
        if (next[todoId]) delete next[todoId];
        else next[todoId] = true;
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
    subskillTodos: query.data ?? {},
    isLoading: query.isLoading,
    toggleSubskillTodo: (todoId) => {
      const wasChecked = !!(queryClient.getQueryData(queryKey) ?? {})[todoId];
      toggle.mutate({ todoId, wasChecked });
    },
  };
}
