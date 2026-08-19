import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Deliberately does not throw at module load: an unconfigured deployment
// (or a fresh dev checkout before .env.local exists) should render a clear
// in-app error screen (see main.jsx), not a blank white/void screen with
// nothing but a console error.
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
