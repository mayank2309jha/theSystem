// Resume Quality — how good the resume ITSELF is, independent of which
// company it's compared against (that's Resume Alignment, a different
// number, in lib/prep.js). Deliberately client-side heuristics, not an AI
// call — same zero-backend, zero-cost, entirely-in-the-browser philosophy
// as the rest of the resume-checking pipeline (see docs/ResumetoCompany.md).
//
// IMPORTANT LIMITATION, disclosed here and in the Methodology panel: pdf.js
// text extraction (extractResumeSkills.js) does not preserve bullet/line
// boundaries — a page's text items are joined into one flat string. So
// these signals are DENSITY-based (per 100 words across the whole resume),
// not "fraction of bullets that do X" — a real, honest constraint, not a
// simplification for its own sake. If bullet-level analysis is ever wanted,
// it needs a change to how extractTextFromSource joins text items first.
const ACTION_VERBS = [
  "built", "designed", "implemented", "developed", "optimized", "reduced", "improved", "led",
  "architected", "launched", "automated", "migrated", "scaled", "deployed", "refactored",
  "debugged", "diagnosed", "engineered", "created", "integrated", "streamlined", "benchmarked",
  "profiled", "authored", "shipped",
];

const QUANT_PATTERN = /\b\d+(\.\d+)?\s?(%|x|k|m|ms|s|gb|mb|rps|qps)\b|\b\d{2,}\b/gi;

const SECTION_PATTERNS = {
  education: /education/i,
  experienceOrProjects: /\b(experience|projects?)\b/i,
  skills: /\b(technical skills|skills)\b/i,
};

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Fraction of the text made of repeated 5-word sequences — a rough proxy
// for copy-pasted or templated bullets reused verbatim across sections.
function redundancyRatio(lowerText) {
  const words = lowerText.split(/\s+/).filter(Boolean);
  if (words.length < 25) return 0;
  const grams = new Map();
  for (let i = 0; i <= words.length - 5; i++) {
    const gram = words.slice(i, i + 5).join(" ");
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }
  const repeated = [...grams.values()].filter((count) => count > 1).length;
  return grams.size === 0 ? 0 : Math.min(1, repeated / grams.size);
}

// Healthy band for a 1-2 page resume's EXTRACTED text (not the visual page
// count — extraction strips a lot of whitespace/layout, so the effective
// word count reads lower than "words on the page").
function lengthScore(words) {
  if (words < 150) return words / 150;
  if (words > 1400) return Math.max(0, 1 - (words - 1400) / 1400);
  return 1;
}

export function scoreResumeQuality(text) {
  const words = wordCount(text);
  const lower = text.toLowerCase();

  const quantMatches = (text.match(QUANT_PATTERN) ?? []).length;
  const quantDensityPer100 = words === 0 ? 0 : (quantMatches / words) * 100;

  const verbHits = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  const verbCoverage = verbHits / ACTION_VERBS.length;

  const sectionsFound = Object.values(SECTION_PATTERNS).filter((re) => re.test(text)).length;
  const sectionCoverage = sectionsFound / Object.keys(SECTION_PATTERNS).length;

  const redundancy = redundancyRatio(lower);

  const dimensions = {
    quantifiedImpact: Math.min(1, quantDensityPer100 / 6) * 100,
    actionVerbUsage: verbCoverage * 100,
    sectionCoverage: sectionCoverage * 100,
    length: lengthScore(words) * 100,
    lowRedundancy: (1 - redundancy) * 100,
  };

  const overall = Math.round(
    dimensions.quantifiedImpact * 0.3 +
      dimensions.actionVerbUsage * 0.25 +
      dimensions.sectionCoverage * 0.2 +
      dimensions.length * 0.15 +
      dimensions.lowRedundancy * 0.1
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    words,
    dimensions: Object.fromEntries(Object.entries(dimensions).map(([k, v]) => [k, Math.round(Math.max(0, Math.min(100, v)))])),
  };
}
