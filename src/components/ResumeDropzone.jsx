import { useRef, useState } from "react";
import { validateResumeFile } from "../lib/extractResumeSkills";

export default function ResumeDropzone({ onFile, disabled = false, label = "Drop your resume here, or click to browse" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    const validationError = validateResumeFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled ? "border-system-border/50 cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${dragOver ? "border-system-blue bg-system-blue/5" : "border-system-border hover:border-system-blue/60"}`}
      >
        <p className="text-sm text-slate-300 mb-1">{label}</p>
        <p className="text-[11px] text-slate-500">PDF only, 5MB max</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  );
}
