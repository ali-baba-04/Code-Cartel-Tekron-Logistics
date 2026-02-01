import { buildPrompt } from "./agentPromptBuilder.js";
import { callLLM } from "./llm.js";
import { mapsTool, trafficTool, weatherTool } from "./tools.js";

export async function logisticsAgent(inputData) {
  const maps = await mapsTool(inputData);
  const traffic = await trafficTool();
  const weather = await weatherTool();

  const enrichedInput = {
    ...inputData,
    maps,
    traffic,
    weather
  };

  const prompt = buildPrompt(enrichedInput);
  const rawOutput = await callLLM(prompt);

  return JSON.parse(rawOutput);
}