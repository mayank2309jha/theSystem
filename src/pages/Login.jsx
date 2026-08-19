import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.4em] text-system-blue/60 uppercase mb-2">The System</p>
          <h1 className="font-display text-2xl font-black text-white system-glow-text">Hunter Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="system-panel p-6 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
            />
          </div>

          {error && (
            <p className="text-xs text-danger border border-danger/40 bg-danger/10 rounded px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 font-display font-semibold text-sm rounded border border-system-blue text-system-blue hover:bg-system-blue hover:text-system-void transition-colors disabled:opacity-50"
          >
            {submitting ? "Authenticating..." : "Enter"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          New hunter?{" "}
          <Link to="/signup" className="text-system-blue hover:underline">
            Awaken your account
          </Link>
        </p>
      </div>
    </div>
  );
}
