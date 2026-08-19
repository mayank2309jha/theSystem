import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useAuth } from "../context/useAuth";

export default function Layout(props) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 max-w-6xl mx-auto">
      <div className="flex justify-end mb-2">
        <button
          onClick={signOut}
          className="text-[10px] font-display uppercase tracking-widest text-slate-500 hover:text-danger transition-colors"
        >
          Log Out
        </button>
      </div>

      <header className="text-center mb-6">
        <p className="text-xs tracking-[0.4em] text-system-blue/60 uppercase mb-2">A New Quest Has Arrived</p>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white system-glow-text tracking-wide">THE SYSTEM</h1>
        <p className="text-sm text-slate-400 mt-2">Placement Mission Tracker — Rise from E-Rank to S-Rank</p>
      </header>

      <NavBar />

      <main>
        <Outlet context={props} />
      </main>

      <footer className="text-center text-[11px] text-slate-600 mt-10 tracking-widest uppercase">Arise. Only I Level Up.</footer>
    </div>
  );
}
