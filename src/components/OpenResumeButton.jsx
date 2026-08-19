import { useState } from "react";
import { getAppResumeSignedUrl } from "../lib/appResumes";

export default function OpenResumeButton({ file, className, children = "Open PDF" }) {
  const [state, setState] = useState("idle"); // idle | loading | error

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    setState("loading");
    try {
      const url = await getAppResumeSignedUrl(file);
      window.open(url, "_blank", "noopener,noreferrer");
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <button onClick={handleClick} className={className} disabled={state === "loading"}>
      {state === "loading" ? "Loading..." : state === "error" ? "Failed — retry" : children}
    </button>
  );
}
