//#region lib/types/index.js
/** Host loader entry for the recent-sessions plugin. */
import z from "@deepseek-ai/schemastery";
/** Default number of recent sessions listed above the workspace browser. */
const DEFAULT_LIMIT = 5;
/** Hide subagent sessions unless the user opts in. */
const DEFAULT_SHOW_SUBAGENTS = false;
/**
 * User-facing configuration. Both fields are `volatile`, so the settings page
 * edits them through the profile patch and the browser half reads the accepted
 * values back from the same namespace. `apply` stays a no-op: the list itself
 * lives entirely in the browser.
 */
const Config = z.object({
	limit: z.number().step(1).min(1).max(50).default(DEFAULT_LIMIT).volatile(),
	showSubagents: z.boolean().default(DEFAULT_SHOW_SUBAGENTS).volatile()
});
/** Provides no host-side behavior beyond its configuration schema. */
function apply() {}
//#endregion
export { Config, DEFAULT_LIMIT, DEFAULT_SHOW_SUBAGENTS, apply };
