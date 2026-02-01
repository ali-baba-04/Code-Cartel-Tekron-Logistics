import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { TASK_PROMPT } from "./taskPrompt.js";
import { OUTPUT_SCHEMA } from "./outputSchema.js";
import { ERROR_SCHEMA } from "./errorSchema.js";

export function buildPrompt(inputData) {
  return `
${SYSTEM_PROMPT}

${TASK_PROMPT}

INPUT DATA:
${JSON.stringify(inputData, null, 2)}

${OUTPUT_SCHEMA}

${ERROR_SCHEMA}

Return ONLY valid JSON.
`;
}