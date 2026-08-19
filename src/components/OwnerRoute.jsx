import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { isOwner } from "../lib/owner";

// Extra defense in depth on top of NavBar hiding the tab and the Storage
// RLS policy blocking the actual files — a non-owner typing /resumes
// directly into the URL bar gets redirected home instead of an empty/broken
// page.
export default function OwnerRoute() {
  const { user } = useAuth();
  if (!isOwner(user)) return <Navigate to="/" replace />;
  return <Outlet />;
}
