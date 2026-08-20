// The full skill catalog — aggregated from category files. Sourced by first
// reading all 5 resumes (Resumes/*.pdf) in full for real technologies/tools/
// techniques actually used, then cross-referenced against every company's
// required skills (src/data/companies.js), then supplemented via research
// into standard 2026 CS/software-engineering skill domains to reach broad,
// genuinely useful coverage beyond just this one person's resume set — since
// other hunters using this app have different tracks (mobile, security,
// data engineering, etc.) that Mayank's own resumes never needed to cover.
//
// 101 top-level skills as of this writing, ~10 subskills each on average,
// each subskill with 2-3 concrete "prove you know this" todos — see
// docs/System.md and docs/SKILLS.md for how this feeds into the app's
// proficiency/readiness calculations.
import { coreCSSkills } from "./coreCS.js";
import { languagesSkills } from "./languages.js";
import { frontendSkills } from "./frontend.js";
import { backendSkills } from "./backend.js";
import { databaseSkills } from "./databases.js";
import { distributedSystemsSkills } from "./distributedSystems.js";
import { systemsOSSkills } from "./systemsOS.js";
import { cloudDevopsSkills } from "./cloudDevops.js";
import { machineLearningSkills } from "./machineLearning.js";
import { nlpLLMSkills } from "./nlpLLM.js";
import { dataEngineeringSkills } from "./dataEngineering.js";
import { appliedAlgorithmsSkills } from "./appliedAlgorithms.js";
import { testingSkills } from "./testing.js";
import { securitySkills } from "./security.js";
import { specializedSkills } from "./specialized.js";
import { interviewCraftSkills } from "./interviewCraft.js";
import { additionalDomainsSkills } from "./additionalDomains.js";

export const skillCatalog = [
  ...coreCSSkills,
  ...languagesSkills,
  ...frontendSkills,
  ...backendSkills,
  ...databaseSkills,
  ...distributedSystemsSkills,
  ...systemsOSSkills,
  ...cloudDevopsSkills,
  ...machineLearningSkills,
  ...nlpLLMSkills,
  ...dataEngineeringSkills,
  ...appliedAlgorithmsSkills,
  ...testingSkills,
  ...securitySkills,
  ...specializedSkills,
  ...interviewCraftSkills,
  ...additionalDomainsSkills,
];
