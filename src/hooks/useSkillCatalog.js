import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";

// The skill catalog, fetched from Supabase's `skills`/`subskills` tables
// (migrated 2026-08-20 — see the note at the top of supabase/schema.sql).
// Reshapes DB rows back into EXACTLY the shape every existing consumer
// already expects — { id, name, category, why, level, subskills: [{ id,
// name, weight, todos }] } — the same shape the old static
// src/data/skills/index.js export had. This shape compatibility is the
// "data-access layer": lib/prep.js's functions (now parameterized to accept
// a catalog instead of importing one) don't know or care that the data came
// from a network request instead of a bundled JS array.
//
// NOT used by Try.jsx (the public, no-auth resume checker) — that page
// deliberately keeps importing the static bundle directly, to preserve its
// zero-Supabase-calls guarantee. See docs/CONTEXT.md.
export function useSkillCatalog() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["skill-catalog"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [{ data: skills, error: skillsError }, { data: subskills, error: subskillsError }] = await Promise.all([
        supabase.from("skills").select("*").eq("is_archived", false),
        supabase.from("subskills").select("*").eq("is_archived", false),
      ]);
      if (skillsError) throw skillsError;
      if (subskillsError) throw subskillsError;

      const bySkillId = {};
      for (const sub of subskills) {
        (bySkillId[sub.skill_id] ??= []).push({
          id: sub.id,
          name: sub.name,
          weight: sub.importance_weight,
          interviewFrequencyWeight: sub.interview_frequency_weight,
          difficultyWeight: sub.difficulty_weight,
          todos: sub.todos ?? [],
        });
      }

      return skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        why: s.why,
        level: s.default_self_assessment,
        preparednessTarget: s.preparedness_target,
        subskills: bySkillId[s.id] ?? [],
      }));
    },
  });

  return { skillCatalog: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
