import { supabase } from "./supabaseClient";

// Fetches a short-lived signed URL for one of the 5 app-owned resume PDFs
// from the private "app-resumes" Storage bucket. Will fail for anyone who
// isn't the owner — the bucket's RLS policy (see supabase/schema.sql)
// enforces that server-side regardless of what the UI does.
export async function getAppResumeSignedUrl(filename) {
  const { data, error } = await supabase.storage.from("app-resumes").createSignedUrl(filename, 60);
  if (error) throw error;
  return data.signedUrl;
}
