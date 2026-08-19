// Whether the given profile row belongs to the app owner (the only account
// allowed to see the 5 app-owned resume PDFs). Deliberately driven by a
// database column (profiles.is_owner) rather than a hardcoded email/id here
// — that would ship a piece of personal identity into the public JS bundle
// for zero security benefit, since the real enforcement is the RLS policies
// in supabase/schema.sql, which check this same column server-side. This
// function is UX convenience (hide the tab cleanly); it grants nothing by
// itself.
export function isOwner(profile) {
  return profile?.is_owner === true;
}
