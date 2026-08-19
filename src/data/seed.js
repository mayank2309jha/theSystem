export const MISSION_TYPES = [
  "Application",
  "Online Assessment",
  "Technical Interview",
  "HR Interview",
  "Offer",
];

export const MISSION_STATUSES = ["Queued", "In Progress", "Cleared", "Failed"];

export const DIFFICULTY_XP = {
  E: 80,
  D: 150,
  C: 250,
  B: 400,
  A: 650,
  S: 1000,
};

// Empty by design — this board tracks YOUR real applications, not the reference
// company database (see Company Specific Prep). Add missions as you actually apply.
export const seedMissions = [];
