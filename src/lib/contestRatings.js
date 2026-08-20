// DSA readiness, expressed as a competitive-programming rating instead of
// (or alongside) the E-S rank ladder every other skill uses. None of the
// source placement data (Company_Placement_Profiles.xlsx, the interview
// report responses sheet) contains contest-rating requirements per company —
// so these thresholds are NOT sourced from real per-company survey data.
// They're derived from each company's EXISTING, real `dsaLevel` (E-S rank,
// already in src/data/companies.js) mapped onto each platform's own
// publicly-documented rating tiers (Codeforces's Newbie/Pupil/Specialist/...
// titles, CodeChef's star system, LeetCode's contest-rating bands). This is
// an explicit estimate, disclosed as such everywhere it's shown — not a
// fabricated per-company number. See docs/CONTEXT.md for why this exists.
export const CONTEST_PLATFORMS = {
  codeforces: { label: "Codeforces", thresholds: { E: 0, D: 1200, C: 1400, B: 1600, A: 1900, S: 2300 } },
  codechef: { label: "CodeChef", thresholds: { E: 0, D: 1400, C: 1600, B: 1800, A: 2000, S: 2200 } },
  leetcode: { label: "LeetCode", thresholds: { E: 0, D: 1400, C: 1600, B: 1800, A: 2000, S: 2200 } },
};

export function requiredRatingForRank(platform, rank) {
  return CONTEST_PLATFORMS[platform]?.thresholds[rank] ?? null;
}

// How far short of (or above) a company's derived rating threshold the
// user's own self-reported rating is. null if either side is unknown.
export function ratingGap(userRating, platform, requiredRank) {
  const required = requiredRatingForRank(platform, requiredRank);
  if (userRating == null || required == null) return null;
  return userRating - required; // positive = already clears it
}
