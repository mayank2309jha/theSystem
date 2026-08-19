export default function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="system-panel p-6 max-w-md text-center">
        <p className="text-xs tracking-[0.4em] text-danger uppercase mb-2">System Error</p>
        <h1 className="font-display text-xl font-bold text-white mb-4">Supabase Not Configured</h1>
        <p className="text-sm text-slate-400 mb-4">
          <code className="text-system-blue">VITE_SUPABASE_URL</code> and{" "}
          <code className="text-system-blue">VITE_SUPABASE_ANON_KEY</code> are missing.
        </p>
        <p className="text-xs text-slate-500">
          Copy <code className="text-slate-300">.env.example</code> to{" "}
          <code className="text-slate-300">.env.local</code>, fill in your Supabase project's
          Project URL and anon key (Project Settings → API), and restart the dev server.
        </p>
      </div>
    </div>
  );
}
