// Confidence — how much THE SYSTEM should trust its OWN Resume Alignment
// number for a specific resume+company pair. Not a claim about the
// candidate; a claim about the assessment itself. A high Alignment score
// must never be read as automatically high-confidence — they're independent
// axes (see docs/CONTEXT.md and the Methodology panel for the reasoning).
//
// Three factors, averaged:
// 1. Extraction quality — how much resume text pdf.js actually recovered.
//    Very little text usually means a scanned/image-based PDF that keyword
//    matching can't read at all, not that the resume is thin.
// 2. Requirement coverage — of the skills THIS company requires, how many
//    got any detection signal at all (0 or more keyword hits)? A company
//    with 5 required skills and zero signal on 4 of them is a much bigger
//    unknown than one where every requirement was at least touched on.
// 3. Data verification — whether this company's requirements/rounds come
//    from an actual placed senior's report (`verified: true`) or are a
//    best-practice guess for the role archetype (`verified: false`). The
//    requirement data itself can be uncertain, independent of the resume.
export function scoreConfidence({ text, skillLevels, company }) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const extractionConfidence = words < 50 ? 0.2 : words < 150 ? 0.6 : 1;

  const required = company?.skills ?? [];
  const coveredCount = required.filter((r) => (skillLevels[r.id] ?? 0) > 0).length;
  const coverageConfidence = required.length === 0 ? 0.5 : coveredCount / required.length;

  const dataConfidence = company?.verified ? 1 : 0.6;

  const overall = Math.round(((extractionConfidence + coverageConfidence + dataConfidence) / 3) * 100);

  return {
    overall: Math.max(0, Math.min(100, overall)),
    factors: {
      extractionQuality: Math.round(extractionConfidence * 100),
      requirementCoverage: Math.round(coverageConfidence * 100),
      dataVerification: Math.round(dataConfidence * 100),
    },
  };
}
