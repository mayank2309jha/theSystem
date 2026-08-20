import { RESUME } from "./resumes.js";

// How strongly each resume variant "speaks to" a given skill, 0-1. Derived by
// actually reading each resume's TECHNICAL SKILLS section: a skill entirely
// absent from a resume (e.g. Machine Learning is dropped completely from
// SDE+Algo and Backend) scores 0 for that resume, not just "low."
//
// Keys are skill ids from the 101-skill catalog (src/data/skills/). Originally
// authored against a smaller 23-skill catalog whose flat ids (system-design,
// distributed-systems, os, data-analysis, backend-apis, dbms-sql, networks,
// cloud-infra, react-frontend) no longer exist after the catalog expansion —
// remapped 1:1 to their closest current equivalent (hld, microservices,
// os-fundamentals, eda, rest-api-design, sql, computer-networks, docker,
// react) rather than re-authored, since the underlying resume content these
// weights encode hasn't changed. See docs/CONTEXT.md for the mapping.
export const resumeSkillWeights = {
  [RESUME.SDE]: {
    dsa: 0.7, hld: 0.6, oop: 0.6, "os-fundamentals": 0.5, "systems-programming": 0.5, coa: 0.1,
    multithreading: 0.8, "computer-networks": 0.5, docker: 0.5, sql: 0.8,
    "ml-fundamentals": 0.4, "deep-learning": 0.2, nlp: 0.2, eda: 0.2,
    java: 0.8, cpp: 0.7, python: 0.8, react: 0.7, "rest-api-design": 0.9, microservices: 0.8,
  },
  [RESUME.ALGO]: {
    dsa: 1.0, hld: 0.6, oop: 0.7, "os-fundamentals": 0.5, "systems-programming": 0.6, coa: 0.15,
    multithreading: 0.7, "computer-networks": 0.5, docker: 0.4, sql: 0.7,
    "ml-fundamentals": 0, "deep-learning": 0, nlp: 0, eda: 0,
    java: 0.8, cpp: 0.8, python: 0.7, react: 0.6, "rest-api-design": 0.8, microservices: 0.8,
  },
  [RESUME.BACKEND]: {
    dsa: 0.6, hld: 0.6, oop: 0.5, "os-fundamentals": 0.4, "systems-programming": 0.4, coa: 0.05,
    multithreading: 0.8, "computer-networks": 0.5, docker: 0.7, sql: 0.9,
    "ml-fundamentals": 0, "deep-learning": 0, nlp: 0, eda: 0,
    java: 0.7, cpp: 0.6, python: 0.7, react: 0.5, "rest-api-design": 1.0, microservices: 1.0,
  },
  [RESUME.ML]: {
    dsa: 0.5, hld: 0.4, oop: 0.3, "os-fundamentals": 0.2, "systems-programming": 0.1, coa: 0,
    multithreading: 0.3, "computer-networks": 0.2, docker: 0.3, sql: 0.6,
    "ml-fundamentals": 1.0, "deep-learning": 1.0, nlp: 1.0, eda: 0.9,
    java: 0.5, cpp: 0.5, python: 0.9, react: 0.2, "rest-api-design": 0.6, microservices: 0.3,
  },
  [RESUME.NONCORE]: {
    dsa: 0.4, hld: 0.3, oop: 0.2, "os-fundamentals": 0.15, "systems-programming": 0.05, coa: 0,
    multithreading: 0.2, "computer-networks": 0.15, docker: 0.25, sql: 0.55,
    "ml-fundamentals": 0.5, "deep-learning": 0.3, nlp: 0.35, eda: 1.0,
    java: 0.4, cpp: 0.4, python: 0.8, react: 0.15, "rest-api-design": 0.5, microservices: 0.2,
  },
};

// Skills every resume variant covers at roughly the same baseline (interview
// craft isn't a function of which PDF you send), so they're excluded from
// the differentiating weight tables above and given a flat weight here.
export const FLAT_WEIGHT_SKILLS = { "resume-storytelling": 0.6, "hr-behavioral": 0.6, aptitude: 0.5 };

// Extra multiplier applied when a resume's real-world target domain matches
// the company's domain tag — captures things a pure skill-list can't (the
// Non-Core resume's condensed, business-readable tone; the ML resume's
// framing as a research/DS candidate rather than a systems engineer).
export const domainBonus = {
  [RESUME.NONCORE]: { pattern: /Non-Core|Consulting|Trainee|Generalist|Fintech|Finance|Insurance/i, multiplier: 1.3 },
  [RESUME.ML]: { pattern: /ML|AI|Data Science/i, multiplier: 1.15 },
  [RESUME.BACKEND]: { pattern: /DevOps|Infra|Cloud-infra/i, multiplier: 1.15 },
  [RESUME.ALGO]: { pattern: /Systems|Low-level|Embedded/i, multiplier: 1.1 },
};
