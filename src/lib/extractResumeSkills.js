import { skillCatalog } from "../data/skills";
import { detectSkillLevelsFromText } from "../data/skillKeywords";

// pdf.js (1MB+) is dynamically imported here rather than at module top-level
// so it's only ever downloaded by someone who actually opens a resume
// checker — not bundled into every page load for users who never touch this
// feature (which is most of the app, including the public /try landing
// before anyone's even chosen to upload anything).
async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjsLib;
}

async function extractTextFromSource(source) {
  const pdfjsLib = await getPdfjs();
  const pdf = await pdfjsLib.getDocument(source).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

// Entirely client-side — the File never leaves the browser for this path.
export async function detectSkillLevelsFromPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const text = await extractTextFromSource({ data: arrayBuffer });
  return detectSkillLevelsFromText(text, skillCatalog);
}

// For an already-stored resume (the authenticated My Resume page) — pdf.js
// fetches the signed URL directly instead of us downloading a Blob first.
export async function detectSkillLevelsFromPdfUrl(url) {
  const text = await extractTextFromSource({ url });
  return detectSkillLevelsFromText(text, skillCatalog);
}

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

export function validateResumeFile(file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are accepted.";
  }
  if (file.size > MAX_RESUME_BYTES) {
    return "File is too large — 5MB max.";
  }
  return null;
}
