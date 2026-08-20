import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import CTABanner from "../components/CTABanner";

export default function Signup() {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Sign up failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.4em] text-system-blue/60 uppercase mb-2">The System</p>
          <h1 className="font-display text-2xl font-black text-white system-glow-text">Awaken a Hunter</h1>
        </div>

        <CTABanner
          to="/try"
          className="mb-6 py-4! text-base! border-system-gold text-system-gold! bg-system-gold/10 hover:bg-system-gold hover:text-system-void!"
        >
          Not ready to sign up? Try the free Resume Checker — no account needed →
        </CTABanner>
        <p className="text-center text-[11px] text-slate-600 -mt-4 mb-6">or create an account below for the full app</p>

        <form onSubmit={handleSubmit} className="system-panel p-6 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What The System should call you"
              className="w-full bg-system-void/60 border border-system-border rounded px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
            />
          </div>
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
              minLength={6}
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
            {submitting ? "Awakening..." : "Begin"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already a hunter?{" "}
          <Link to="/login" className="text-system-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
