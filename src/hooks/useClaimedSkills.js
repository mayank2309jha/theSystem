import { useEffect, useState } from "react";
import { useRaidResumes } from "./useRaidResumes";
import { detectSkillLevelsFromPdfUrl } from "../lib/extractResumeSkills";

// CLAIMED skills — keyword-detected, unioned via Math.max across every
// resume the user has uploaded to Resume Raid (not just the single "My
// Resume" slot). Extracted out of ResumeRaid.jsx so CompanyDetail's Company
// Skill Matrix can use the exact same signal instead of a second,
// potentially-diverging implementation. Re-scans automatically whenever the
// raid resume list changes (upload/delete).
//
// `catalog` should be the Supabase-fetched catalog (from outletContext) for
// every caller of this hook — there is no /try-style zero-backend constraint
// here (Resume Raid is authenticated-only), so there's no reason to fall
// back to the static bundle the way extractResumeSkills.js's functions do.
export function useClaimedSkills(catalog) {
  const { data: resumes, isLoading: resumesLoading, upload, uploadStatus, remove, getSignedUrl } = useRaidResumes();
  const [claimed, setClaimed] = useState(null); // { skillId: level }, null until first scan resolves
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  async function scanAll() {
    if (!resumes || resumes.length === 0) {
      setClaimed({});
      return;
    }
    setScanning(true);
    setScanError(null);
    try {
      const perResume = await Promise.all(
        resumes.map(async (r) => {
          const url = await getSignedUrl(r);
          return detectSkillLevelsFromPdfUrl(url, catalog);
        })
      );
      const union = {};
      for (const levels of perResume) {
        for (const [skillId, level] of Object.entries(levels)) {
          union[skillId] = Math.max(union[skillId] ?? 0, level);
        }
      }
      setClaimed(union);
    } catch {
      setScanError("Couldn't scan one or more resumes — try re-uploading it.");
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    // Also re-scans once `catalog` finishes loading (length flips from 0 to
    // populated) — scanning against an empty catalog would detect nothing.
    if (resumes && resumes.length > 0 && catalog.length > 0) scanAll();
    if (resumes && resumes.length === 0) setClaimed({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumes?.length, catalog.length]);

  return {
    resumes,
    resumesLoading,
    upload,
    uploadStatus,
    remove,
    claimed, // null until first scan resolves; {} once resolved with zero resumes/skills
    scanning,
    scanError,
  };
}
