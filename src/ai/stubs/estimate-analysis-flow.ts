import { invokeN8n } from "@/lib/n8n-client";

export interface AnalyzeEstimateInput {
  activityDescription: string;
}

export interface AnalyzeEstimateOutput {
  suggestedEffort: number;
  reasoning: string;
}

function heuristicEffort(activityDescription: string): number {
  const description = activityDescription.toLowerCase();
  if (description.includes("complex") || description.includes("integration")) {
    return 6;
  }
  if (description.includes("api") || description.includes("connector")) {
    return 4;
  }
  if (description.includes("form") || description.includes("extract")) {
    return 3;
  }
  return 2;
}

export async function analyzeEstimate(
  input: AnalyzeEstimateInput,
): Promise<AnalyzeEstimateOutput> {
  try {
    const result = await invokeN8n<Partial<AnalyzeEstimateOutput>>(
      "analyzeEstimate",
      input,
    );

    const suggestedEffort = Number(result.suggestedEffort);
    const reasoning =
      typeof result.reasoning === "string" && result.reasoning.trim().length > 0
        ? result.reasoning.trim()
        : "AI estimate provided by n8n workflow.";

    if (Number.isFinite(suggestedEffort) && suggestedEffort > 0) {
      return {
        suggestedEffort: Math.max(0.5, Math.round(suggestedEffort * 2) / 2),
        reasoning,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("analyzeEstimate fallback activated:", error);
    }
  }

  const base = heuristicEffort(input.activityDescription);
  return {
    suggestedEffort: base,
    reasoning:
      "Using local heuristic estimate because no n8n AI response was available.",
  };
}
