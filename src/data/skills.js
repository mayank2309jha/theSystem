// Thin re-export so existing `from "../data/skills"` imports across the app
// keep working unchanged. The actual catalog (101 skills as of this writing,
// organized by category) lives in ./skills/*.js — see ./skills/index.js.
export { skillCatalog } from "./skills/index.js";
