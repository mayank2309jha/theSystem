import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

export function useResume() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["resume", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_resumes").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data; // null if nothing uploaded yet
    },
  });

  const upload = useMutation({
    mutationFn: async (file) => {
      const path = `${user.id}/resume.pdf`;
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .upload(path, file, { upsert: true, contentType: "application/pdf" });
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from("user_resumes").upsert(
        {
          user_id: user.id,
          storage_path: path,
          original_filename: file.name,
          mime_type: file.type || "application/pdf",
          file_size: file.size,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (dbError) throw dbError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const path = `${user.id}/resume.pdf`;
      await supabase.storage.from("resumes").remove([path]);
      const { error } = await supabase.from("user_resumes").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function getSignedUrl() {
    if (!query.data) return null;
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(query.data.storage_path, 60);
    if (error) throw error;
    return data.signedUrl;
  }

  return {
    ...query,
    upload: upload.mutateAsync,
    uploadStatus: upload.status,
    remove: remove.mutateAsync,
    removeStatus: remove.status,
    getSignedUrl,
  };
}
