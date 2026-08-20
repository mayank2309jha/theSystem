import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

// Per-subskill Mastery tracking (user_subskill_mastery) — the 0-6 scale
// (Not Started..Advanced), separate from Proven (see docs/System.md for why
// these are two different, deliberately independent signals). Shape:
// { [subskillId]: { mastery_level, confidence_level, learning_status, notes,
// interview_notes, mistakes, last_reviewed, next_review, revision_count } }.
export function useSubskillMastery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["subskill-mastery", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_subskill_mastery").select("*").eq("user_id", user.id);
      if (error) throw error;
      return Object.fromEntries(data.map((row) => [row.subskill_id, row]));
    },
  });

  const update = useMutation({
    mutationFn: async ({ subskillId, patch }) => {
      const { error } = await supabase.from("user_subskill_mastery").upsert(
        { user_id: user.id, subskill_id: subskillId, ...patch, updated_at: new Date().toISOString() },
        { onConflict: "user_id,subskill_id" }
      );
      if (error) throw error;
    },
    onMutate: async ({ subskillId, patch }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => ({
        ...(old ?? {}),
        [subskillId]: { ...(old?.[subskillId] ?? { subskill_id: subskillId }), ...patch },
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    masteryBySubskillId: query.data ?? {},
    isLoading: query.isLoading,
    updateMastery: (subskillId, patch) => update.mutate({ subskillId, patch }),
  };
}
