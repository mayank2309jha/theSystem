import { RESUME } from "./resumes.js";

// How strongly each resume variant "speaks to" a given skill, 0-1. Derived by
// actually reading each resume's TECHNICAL SKILLS section: a skill entirely
// absent from a resume (e.g. Machine Learning is dropped completely from
// SDE+Algo and Backend) scores 0 for that resume, not just "low."
export const resumeSkillWeights = {
  [RESUME.SDE]: {
    dsa: 0.7, "system-design": 0.6, oop: 0.6, os: 0.5, "systems-programming": 0.5, coa: 0.1,
    multithreading: 0.8, networks: 0.5, "cloud-infra": 0.5, "dbms-sql": 0.8,
    "ml-fundamentals": 0.4, "deep-learning": 0.2, nlp: 0.2, "data-analysis": 0.2,
    java: 0.8, cpp: 0.7, python: 0.8, "react-frontend": 0.7, "backend-apis": 0.9, "distributed-systems": 0.8,
  },
  [RESUME.ALGO]: {
    dsa: 1.0, "system-design": 0.6, oop: 0.7, os: 0.5, "systems-programming": 0.6, coa: 0.15,
    multithreading: 0.7, networks: 0.5, "cloud-infra": 0.4, "dbms-sql": 0.7,
    "ml-fundamentals": 0, "deep-learning": 0, nlp: 0, "data-analysis": 0,
    java: 0.8, cpp: 0.8, python: 0.7, "react-frontend": 0.6, "backend-apis": 0.8, "distributed-systems": 0.8,
  },
  [RESUME.BACKEND]: {
    dsa: 0.6, "system-design": 0.6, oop: 0.5, os: 0.4, "systems-programming": 0.4, coa: 0.05,
    multithreading: 0.8, networks: 0.5, "cloud-infra": 0.7, "dbms-sql": 0.9,
    "ml-fundamentals": 0, "deep-learning": 0, nlp: 0, "data-analysis": 0,
    java: 0.7, cpp: 0.6, python: 0.7, "react-frontend": 0.5, "backend-apis": 1.0, "distributed-systems": 1.0,
  },
  [RESUME.ML]: {
    dsa: 0.5, "system-design": 0.4, oop: 0.3, os: 0.2, "systems-programming": 0.1, coa: 0,
    multithreading: 0.3, networks: 0.2, "cloud-infra": 0.3, "dbms-sql": 0.6,
    "ml-fundamentals": 1.0, "deep-learning": 1.0, nlp: 1.0, "data-analysis": 0.9,
    java: 0.5, cpp: 0.5, python: 0.9, "react-frontend": 0.2, "backend-apis": 0.6, "distributed-systems": 0.3,
  },
  [RESUME.NONCORE]: {
    dsa: 0.4, "system-design": 0.3, oop: 0.2, os: 0.15, "systems-programming": 0.05, coa: 0,
    multithreading: 0.2, networks: 0.15, "cloud-infra": 0.25, "dbms-sql": 0.55,
    "ml-fundamentals": 0.5, "deep-learning": 0.3, nlp: 0.35, "data-analysis": 1.0,
    java: 0.4, cpp: 0.4, python: 0.8, "react-frontend": 0.15, "backend-apis": 0.5, "distributed-systems": 0.2,
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
