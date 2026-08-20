import { useTheme } from "../hooks/useTheme";

// `fixed` (default) is for pages with no shared header to attach to
// (Login/Signup/Try). `inline` renders as a plain button meant to sit next
// to something else in a flex row — Layout.jsx puts it beside Log Out,
// where a second fixed-position element would otherwise overlap it.
export default function ThemeToggle({ variant = "fixed" }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const icon = isLight ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );

  if (variant === "inline") {
    return (
      <button
        onClick={toggleTheme}
        title={isLight ? "Switch to dark mode" : "Switch to light mode"}
        aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
        className="w-7 h-7 flex items-center justify-center rounded-full border border-system-border text-system-blue hover:border-system-blue transition-colors"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="fixed top-3 right-3 z-50 w-9 h-9 flex items-center justify-center rounded-full border border-system-border bg-system-panel text-system-blue hover:border-system-blue transition-colors shadow-sm"
    >
      {icon}
    </button>
  );
}
