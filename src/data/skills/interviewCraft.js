// Interview craft & professional practice — not tools/technologies, but the
// meta-skills that determine whether the technical skills above actually land.
export const interviewCraftSkills = [
  {
    id: "resume-storytelling",
    name: "Resume & Project Storytelling",
    category: "Interview Craft",
    level: 10,
    why: "By far the most repeated piece of advice across every response in the placement survey — nearly every round is resume-driven.",
    subskills: [
      { id: "resume-bullet-mastery", name: "Explaining Every Resume Bullet Cold", weight: 3, todos: ["Explain every single bullet on every resume variant without hesitation, including the numbers", "Anticipate a \"why this design choice\" follow-up for each project and prepare the answer"] },
      { id: "resume-project-abstract", name: "1-2 Minute Project Abstracts", weight: 2, todos: ["Prepare a 1-2 minute high-level abstract for each major project before going deep only if asked", "Practice the breadcrumb technique: reference an earlier round's detail when relevant in a later one"] },
      { id: "resume-intro-pitch", name: "The 1-Minute Introduction", weight: 2, todos: ["Prepare a ~1-minute intro: background, 2-3 relevant projects, one MTP/thesis line, favourite subjects", "Rehearse it out loud until it doesn't sound memorized"] },
    ],
  },
  {
    id: "hr-behavioral",
    name: "HR & Behavioral Rounds",
    category: "Interview Craft",
    level: 10,
    why: "Every single placed company ran an HR round — Apple's included 10 distinct behavioral prompts alone.",
    subskills: [
      { id: "behavioral-star-stories", name: "STAR-Method Stories", weight: 3, todos: ["Prepare 2-3 STAR stories: a failure and recovery, a conflict resolved, a time you learned something fast", "Practice keeping each story under 90 seconds without losing the key details"] },
      { id: "behavioral-standard-questions", name: "Standard HR Questions", weight: 2, todos: ["Prepare honest (not rehearsed-sounding) answers for strengths/weaknesses/why-this-company", "Practice giving company-specific \"why us\" answers grounded in the actual JD, not generic praise"] },
      { id: "behavioral-questions-to-ask", name: "Questions to Ask the Interviewer", weight: 1, todos: ["Prepare 1-2 sharp questions referencing something a prior round revealed", "Avoid generic questions with no signal (e.g. \"what's the culture like\")"] },
    ],
  },
  {
    id: "mock-interview-practice",
    name: "Live Problem-Solving Communication",
    category: "Interview Craft",
    level: 10,
    why: "Interviewers repeatedly report valuing how you think out loud over whether you reach the answer.",
    subskills: [
      { id: "communication-thinking-aloud", name: "Narrating Your Thought Process", weight: 3, todos: ["Do a mock interview and get feedback specifically on whether you narrated your reasoning, not just the code", "Practice explaining a counterexample when an interviewer pushes back on your approach"] },
      { id: "communication-asking-for-hints", name: "Asking for Hints Gracefully", weight: 2, todos: ["Practice saying \"I don't know, can I get a hint\" instead of freezing or guessing silently", "Practice proposing a partial/verbal approach even when you can't fully solve a problem"] },
    ],
  },
  {
    id: "technical-communication",
    name: "Technical Communication & Documentation",
    category: "Interview Craft",
    level: 10,
    why: "The skill behind writing docs like this one — increasingly valued as codebases and teams grow.",
    subskills: [
      { id: "tech-writing-clarity", name: "Writing Clear Technical Docs", weight: 2, todos: ["Write a README or design doc for a real project that a stranger could follow", "Get feedback from someone unfamiliar with the project on where your doc confused them"] },
      { id: "tech-communication-nontechnical", name: "Explaining to a Non-Technical Audience", weight: 2, todos: ["Explain a real ML result to a non-technical stakeholder without jargon", "Practice the same explanation in under 60 seconds"] },
    ],
  },
  {
    id: "agile-scrum",
    name: "Agile & Scrum Methodology",
    category: "Interview Craft",
    level: 10,
    why: "The default team-process framework at most companies — worth fluency even without formal Scrum-master experience.",
    subskills: [
      { id: "agile-ceremonies", name: "Scrum Ceremonies", weight: 1, todos: ["Explain the purpose of standup/retro/planning/review distinctly, not as interchangeable meetings", "Participate in or simulate running one ceremony for a real small project"] },
      { id: "agile-estimation", name: "Story Estimation", weight: 1, todos: ["Practice relative estimation (story points) on a real backlog", "Explain why story points measure complexity, not time"] },
    ],
  },
];
