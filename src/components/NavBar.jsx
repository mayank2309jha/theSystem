import { NavLink } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { isOwner } from "../lib/owner";

const baseTabs = [
  { to: "/", label: "Home", end: true },
  { to: "/companies", label: "Company Specific Prep" },
  { to: "/skills", label: "Skill Maxing" },
];

const ownerOnlyTabs = [{ to: "/resumes", label: "Resume Maxing" }];

const trailingTabs = [
  { to: "/resume", label: "My Resume" },
  { to: "/resume-raid", label: "Resume Raid" },
  { to: "/profile", label: "Profile" },
];

export default function NavBar() {
  const { data: profile } = useProfile();
  const tabs = [...baseTabs, ...(isOwner(profile) ? ownerOnlyTabs : []), ...trailingTabs];

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 mb-8">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-4 py-2 rounded font-display text-xs uppercase tracking-widest border transition-colors ${
              isActive
                ? "border-system-blue text-system-blue bg-system-blue/10 system-glow-text"
                : "border-system-border text-slate-400 hover:text-system-blue hover:border-system-blue/60"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
