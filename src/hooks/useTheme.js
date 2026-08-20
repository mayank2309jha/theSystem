import { useEffect, useState } from "react";

// A display preference, not user data — kept in localStorage (unnamespaced,
// device-level) rather than synced to the account, same as most apps treat
// light/dark mode. index.html has a blocking inline script that applies the
// stored/system-preferred theme before first paint (avoids a flash of the
// wrong theme); this hook just keeps React and that DOM attribute in sync
// after mount.
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") ?? "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("ts-theme", theme);
    } catch {
      // localStorage unavailable (private browsing, etc.) — theme still
      // applies for this session via the DOM attribute, just won't persist.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return { theme, toggleTheme };
}
