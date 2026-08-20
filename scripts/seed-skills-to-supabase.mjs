// One-time (but safe-to-re-run) migration: pushes the static skill catalog
// (src/data/skills/) into Supabase's `skills`/`subskills` tables, which are
// now the app's runtime source of truth (see the note at the top of
// supabase/schema.sql). The static files stay in the repo as this script's
// input — not deleted — and as the one deliberate exception `/try` still
// reads directly (see docs/CONTEXT.md for why).
//
// Idempotent: every row is upserted on its primary key (id), so re-running
// this after editing the static catalog just syncs the changes — it never
// duplicates rows or wipes anything not present in the static files (existing
// Supabase-only custom skills, once that feature exists, are untouched since
// this script only ever touches skill ids it knows about).
//
// Requires the SERVICE ROLE key (bypasses RLS — the anon key has no write
// access to these tables by design, see schema.sql). Never commit that key;
// it lives in .env.local as SUPABASE_SERVICE_ROLE_KEY (not VITE_-prefixed,
// so Vite never bundles it into client code).
//
// Run:  node --env-file=.env.local scripts/seed-skills-to-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import { skillCatalog } from "../src/data/skills/index.js";

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Run with: node --env-file=.env.local scripts/seed-skills-to-supabase.mjs");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const skillRows = skillCatalog.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  why: s.why ?? null,
  default_self_assessment: s.level ?? 10,
  preparedness_target: s.preparednessTarget ?? null,
  owner_id: null, // global/system skill
}));

const subskillRows = skillCatalog.flatMap((s) =>
  (s.subskills ?? []).map((sub) => ({
    id: sub.id,
    skill_id: s.id,
    name: sub.name,
    importance_weight: sub.weight ?? 1,
    todos: sub.todos ?? [],
    knowledge_points: sub.knowledgePoints ?? [],
  }))
);

console.log(`Seeding ${skillRows.length} skills and ${subskillRows.length} subskills...`);

// Skills first (subskills FK-reference skill_id).
const { error: skillsError } = await supabase.from("skills").upsert(skillRows, { onConflict: "id" });
if (skillsError) {
  console.error("Failed to seed skills:", skillsError.message);
  process.exit(1);
}

const { error: subskillsError } = await supabase.from("subskills").upsert(subskillRows, { onConflict: "id" });
if (subskillsError) {
  console.error("Failed to seed subskills:", subskillsError.message);
  process.exit(1);
}

// Verify: every row we intended to write is actually readable back.
const { count: skillCount, error: skillCountError } = await supabase
  .from("skills")
  .select("id", { count: "exact", head: true });
const { count: subCount, error: subCountError } = await supabase
  .from("subskills")
  .select("id", { count: "exact", head: true });

if (skillCountError || subCountError) {
  console.error("Seed completed but post-seed verification query failed:", skillCountError?.message ?? subCountError?.message);
  process.exit(1);
}

console.log(`Done. Supabase now has ${skillCount} skills and ${subCount} subskills.`);
if (skillCount < skillRows.length || subCount < subskillRows.length) {
  console.warn(
    `Warning: expected at least ${skillRows.length} skills / ${subskillRows.length} subskills — fewer were found. ` +
      `If this is a fresh table those numbers should match exactly; investigate before trusting the migration.`
  );
}
