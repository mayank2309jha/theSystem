import { useState } from "react";
import { getMethodology } from "../data/methodology";
import MethodologyPanel from "./MethodologyPanel";

// Fixed bottom-CENTER floating pill — wide/rounded like a search bar rather
// than a small circle, specifically so the "?" has room to be legible. The
// previous small circular version used font-display (Orbitron, a stylized
// display font) at text-sm, which rendered the "?" glyph thin and small
// enough to read as effectively invisible against the button's outline-only
// fill — fixed here by using the body font, a solid filled background
// (instead of a translucent outline blending into the page), and a larger,
// bold glyph. Bottom-center keeps it clear of ThemeToggle's fixed variant
// (top-right on the 3 pages that use it) and of Layout's top-right Log Out
// link, so neither of the overlap bugs found earlier this session (see
// docs/CONTEXT.md) can recur here. Self-contained: owns its own open/close
// state and looks up content by `pageKey`, so each page just drops in
// <MethodologyButton pageKey="..." />.
export default function MethodologyButton({ pageKey }) {
  const [open, setOpen] = useState(false);
  const content = getMethodology(pageKey);
  if (!content) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="How this works"
        aria-label="Open methodology panel"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 h-11 min-w-[6.5rem] px-5 flex items-center justify-center rounded-full border border-system-blue bg-system-blue text-system-void hover:bg-system-blue-dim hover:text-system-blue transition-colors shadow-lg"
      >
        <span className="text-xl font-bold leading-none">?</span>
      </button>
      <MethodologyPanel open={open} onClose={() => setOpen(false)} content={content} />
    </>
  );
}
