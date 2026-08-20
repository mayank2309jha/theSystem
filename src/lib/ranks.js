export const RANK_ORDER = ["E", "D", "C", "B", "A", "S"];

export const RANK_THRESHOLDS = {
  E: 0,
  D: 300,
  C: 800,
  B: 1800,
  A: 3500,
  S: 6000,
};

// `glow` classes are defined in index.css (.rank-glow-E ... .rank-glow-S) so
// their colors come from the same CSS-variable palette as everything else.
export const RANK_STYLES = {
  E: { text: "text-rank-e", border: "border-rank-e", bg: "bg-rank-e", glow: "rank-glow-E" },
  D: { text: "text-rank-d", border: "border-rank-d", bg: "bg-rank-d", glow: "rank-glow-D" },
  C: { text: "text-rank-c", border: "border-rank-c", bg: "bg-rank-c", glow: "rank-glow-C" },
  B: { text: "text-rank-b", border: "border-rank-b", bg: "bg-rank-b", glow: "rank-glow-B" },
  A: { text: "text-rank-a", border: "border-rank-a", bg: "bg-rank-a", glow: "rank-glow-A" },
  S: { text: "text-rank-s", border: "border-rank-s", bg: "bg-rank-s", glow: "rank-glow-S" },
};

export function getRankForXP(xp) {
  let current = RANK_ORDER[0];
  for (const rank of RANK_ORDER) {
    if (xp >= RANK_THRESHOLDS[rank]) current = rank;
  }
  return current;
}

export function getRankProgress(xp) {
  const current = getRankForXP(xp);
  const currentIndex = RANK_ORDER.indexOf(current);
  const isMaxRank = currentIndex === RANK_ORDER.length - 1;
  const next = isMaxRank ? null : RANK_ORDER[currentIndex + 1];

  const floor = RANK_THRESHOLDS[current];
  const ceiling = isMaxRank ? floor : RANK_THRESHOLDS[next];
  const span = ceiling - floor;
  const progress = isMaxRank ? 1 : Math.min(1, (xp - floor) / span);

  return {
    current,
    next,
    isMaxRank,
    xp,
    xpIntoRank: xp - floor,
    xpForNext: isMaxRank ? 0 : ceiling - floor,
    progress,
  };
}

export function proficiencyLabel(level) {
  if (level >= 80) return "Master";
  if (level >= 60) return "Advanced";
  if (level >= 40) return "Intermediate";
  if (level >= 20) return "Beginner";
  return "Novice";
}

// Skill proficiency (0-100) mapped onto the same E-S rank vocabulary as the hunter rank,
// so "level 12 in System Design" reads as "E-Rank System Design" everywhere in the app.
const SKILL_BAND = 100 / RANK_ORDER.length;

export function skillRankForLevel(level) {
  const idx = Math.min(RANK_ORDER.length - 1, Math.floor(level / SKILL_BAND));
  return RANK_ORDER[Math.max(0, idx)];
}

export function rankIndex(rank) {
  return RANK_ORDER.indexOf(rank);
}

// Same shape as getRankProgress (used by the XP-driven RankTrack display),
// but driven by the 0-100 Level scale's even 6-way bands instead of the
// uneven XP thresholds — so RankTrack can render either progress type.
export function getLevelProgress(level) {
  const current = skillRankForLevel(level);
  const currentIndex = RANK_ORDER.indexOf(current);
  const isMaxRank = currentIndex === RANK_ORDER.length - 1;
  const next = isMaxRank ? null : RANK_ORDER[currentIndex + 1];

  const floor = currentIndex * SKILL_BAND;
  const ceiling = isMaxRank ? floor : (currentIndex + 1) * SKILL_BAND;
  const span = ceiling - floor;
  const progress = isMaxRank ? 1 : Math.min(1, (level - floor) / span);

  return {
    current,
    next,
    isMaxRank,
    level,
    levelIntoRank: Math.round(level - floor),
    levelForNext: isMaxRank ? 0 : Math.round(ceiling - floor),
    progress,
  };
}
