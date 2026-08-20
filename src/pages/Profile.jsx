import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useProfile } from "../hooks/useProfile";
import { CONTEST_PLATFORMS } from "../lib/contestRatings";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading, updateName, updateContestRating } = useProfile();

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
        <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">DSA Track</p>
        <h3 className="font-display text-lg font-bold text-white mb-1">Contest Rating</h3>
        <p className="text-sm text-slate-400 mb-4">
          Optional — pick the one competitive-programming platform you actually compete on and enter your current
          rating. Self-reported; update it yourself whenever it changes. Company DSA requirements shown against
          this are an <em>estimate</em> derived from each company's existing rank requirement, not a real
          per-company survey number.
        </p>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <ContestRatingForm key={profile.id} profile={profile} updateContestRating={updateContestRating} />
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

function ContestRatingForm({ profile, updateContestRating }) {
  const [platform, setPlatform] = useState(profile.contest_platform ?? "");
  const [rating, setRating] = useState(profile.contest_rating ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    if (!platform) {
      setError("Pick a platform first.");
      return;
    }
    const parsed = Number(rating);
    if (!rating || Number.isNaN(parsed) || parsed < 0) {
      setError("Enter a valid rating.");
      return;
    }
    try {
      await updateContestRating({ platform, rating: parsed });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Couldn't save — the profiles table may need the contest_platform/contest_rating columns added (re-run supabase/schema.sql).");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 max-w-sm">
      <div className="flex gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="flex-1 bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
        >
          <option value="">Select platform...</option>
          {Object.entries(CONTEST_PLATFORMS).map(([id, p]) => (
            <option key={id} value={id}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          max={4000}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="Rating"
          className="w-28 bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
        />
      </div>
      <button
        type="submit"
        className="px-3 py-2 text-xs font-display uppercase tracking-wider rounded border border-system-blue text-system-blue hover:bg-system-blue hover:text-system-void transition-colors"
      >
        Save Rating
      </button>
      {saved && <p className="text-[11px] text-rank-d">Saved.</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </form>
  );
}
