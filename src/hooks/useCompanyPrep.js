import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

function localStorageKey(userId) {
  return `ts-company-prep-${userId}`;
}

function readLegacyLocalStorage(userId) {
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Per-company prep-checklist completions — { companyId: [bool, bool, ...] }
// indexed by that company's prepTips array. Backed by user_company_prep,
// where todo_id is the checklist item's index as a string; row existence
// means checked (unchecking deletes the row).
export function useCompanyPrep() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["company-prep", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_company_prep").select("company_id, todo_id").eq("user_id", user.id);
      if (error) throw error;

      function rowsToChecklist(rows) {
        const checked = {};
        for (const row of rows) {
          checked[row.company_id] ??= [];
          checked[row.company_id][Number(row.todo_id)] = true;
        }
        return checked;
      }

      if (data.length === 0) {
        const legacy = readLegacyLocalStorage(user.id);
        if (legacy && Object.keys(legacy).length > 0) {
          const rows = [];
          for (const [companyId, arr] of Object.entries(legacy)) {
            arr.forEach((checked, i) => {
              if (checked) rows.push({ user_id: user.id, company_id: companyId, todo_id: String(i) });
            });
          }
          if (rows.length > 0) await supabase.from("user_company_prep").upsert(rows, { onConflict: "user_id,company_id,todo_id" });
          return legacy;
        }
      }

      return rowsToChecklist(data);
    },
  });

  // `wasChecked` captured once at click time and threaded through — see the
  // comment in useSkillTodos.js's toggle mutation for why mutationFn must
  // NOT re-derive this from the query cache (it would race onMutate's
  // optimistic write and silently invert every operation).
  const toggle = useMutation({
    mutationFn: async ({ companyId, index, wasChecked }) => {
      if (wasChecked) {
        const { error } = await supabase
          .from("user_company_prep")
          .delete()
          .eq("user_id", user.id)
          .eq("company_id", companyId)
          .eq("todo_id", String(index));
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_company_prep")
          .upsert({ user_id: user.id, company_id: companyId, todo_id: String(index) }, { onConflict: "user_id,company_id,todo_id" });
        if (error) throw error;
      }
    },
    onMutate: async ({ companyId, index }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        const next = { ...(old ?? {}) };
        const arr = [...(next[companyId] ?? [])];
        arr[index] = !arr[index];
        next[companyId] = arr;
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
    companyPrepChecked: query.data ?? {},
    isLoading: query.isLoading,
    toggleCompanyPrepItem: (companyId, index) => {
      const current = queryClient.getQueryData(queryKey) ?? {};
      const wasChecked = !!current[companyId]?.[index];
      toggle.mutate({ companyId, index, wasChecked });
    },
  };
}
