import { useEffect } from "react";

// Slide-up panel showing the full "how this works" content for one page.
// Rendered unconditionally when `open` is true; closes on backdrop click,
// the close button, or Escape.
export default function MethodologyPanel({ open, onClose, content }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative system-panel w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-6 m-0 sm:m-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase">Methodology</p>
          <button
            onClick={onClose}
            aria-label="Close methodology panel"
            className="text-slate-500 hover:text-system-blue transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <h2 className="font-display text-lg font-bold text-white mb-4">{content.title}</h2>

        <div className="space-y-4">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <p className="text-xs font-display font-semibold text-system-blue/90 uppercase tracking-wide mb-1">
                {section.heading}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
