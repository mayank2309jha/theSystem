import { Link } from "react-router-dom";

export default function CTABanner({ className = "" }) {
  return (
    <Link
      to="/login"
      className={`block text-center font-display text-sm font-semibold py-3 px-4 rounded border border-system-blue text-system-blue bg-system-blue/10 hover:bg-system-blue hover:text-system-void transition-colors ${className}`}
    >
      Enjoying this? Try the full app with multiple cool features like this. →
    </Link>
  );
}
