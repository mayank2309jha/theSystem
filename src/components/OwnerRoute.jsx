import { Navigate, Outlet } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { isOwner } from "../lib/owner";

// Extra defense in depth on top of NavBar hiding the tab and the Storage
// RLS policy blocking the actual files — a non-owner typing /resumes
// directly into the URL bar gets redirected home instead of an empty/broken
// page.
export default function OwnerRoute() {
  const { data: profile, isLoading } = useProfile();

  // Don't redirect while the profile is still loading — isOwner(undefined)
  // would be false, which would bounce the real owner home for a flash
  // before their own data arrives.
  if (isLoading) return null;
  if (!isOwner(profile)) return <Navigate to="/" replace />;
  return <Outlet />;
}
