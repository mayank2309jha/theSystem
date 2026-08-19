import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useProfile } from "../hooks/useProfile";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading, updateName } = useProfile();

  return (
    <div className="space-y-6">
      <div className="system-panel p-6">
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Hunter Profile</p>
        <h2 className="font-display text-xl font-bold text-white mb-6">Status Registry</h2>

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading profile...</p>
        ) : (
          // Keyed on profile.id so local edit state initializes fresh from the
          // loaded profile exactly once, without needing a sync-on-load effect.
          <ProfileForm key={profile.id} profile={profile} email={user?.email} updateName={updateName} />
        )}
      </div>

      <div className="system-panel p-6">
        <button
          onClick={signOut}
          className="px-4 py-2 text-xs font-display uppercase tracking-wider rounded border border-danger text-danger hover:bg-danger hover:text-system-void transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

function ProfileForm({ profile, email, updateName }) {
  const [name, setName] = useState(profile.name);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || name === profile.name) return;
    await updateName(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Display Name</label>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
          />
          <button
            type="submit"
            disabled={!name.trim() || name === profile.name}
            className="px-3 py-2 text-xs font-display uppercase tracking-wider rounded border border-system-blue text-system-blue hover:bg-system-blue hover:text-system-void transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-system-blue"
          >
            Save
          </button>
        </div>
        {saved && <p className="text-[11px] text-rank-d mt-1.5">Saved.</p>}
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Email</label>
        <p className="text-sm text-slate-400">{email}</p>
      </div>
    </form>
  );
}
