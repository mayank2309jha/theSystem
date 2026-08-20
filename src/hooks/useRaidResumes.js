import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

// Multiple resumes per user, for Resume Raid — distinct from useResume.js's
// single "My Resume" slot. Same private "resumes" bucket, different path
// prefix ({user_id}/raid/{id}.pdf), separate DB table (user_raid_resumes,
// no unique-per-user constraint).
export function useRaidResumes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["raid-resumes", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_raid_resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upload = useMutation({
    mutationFn: async (file) => {
      const id = crypto.randomUUID();
      const path = `${user.id}/raid/${id}.pdf`;
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .upload(path, file, { contentType: "application/pdf" });
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from("user_raid_resumes").insert({
        id,
        user_id: user.id,
        storage_path: path,
        original_filename: file.name,
        mime_type: file.type || "application/pdf",
        file_size: file.size,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async (resume) => {
      await supabase.storage.from("resumes").remove([resume.storage_path]);
      const { error } = await supabase.from("user_raid_resumes").delete().eq("id", resume.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function getSignedUrl(resume) {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(resume.storage_path, 60);
    if (error) throw error;
    return data.signedUrl;
  }

  return {
    ...query,
    upload: upload.mutateAsync,
    uploadStatus: upload.status,
    remove: remove.mutateAsync,
    getSignedUrl,
  };
}
