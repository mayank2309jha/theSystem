import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
  });

  const updateName = useMutation({
    mutationFn: async (name) => {
      const { error } = await supabase.from("profiles").update({ name, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
      return name;
    },
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["profile", user?.id] });
      const previous = queryClient.getQueryData(["profile", user?.id]);
      queryClient.setQueryData(["profile", user?.id], (old) => ({ ...old, name }));
      return { previous };
    },
    onError: (_err, _name, context) => {
      if (context?.previous) queryClient.setQueryData(["profile", user?.id], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });

  return { ...query, updateName: updateName.mutateAsync, updateNameStatus: updateName.status };
}
