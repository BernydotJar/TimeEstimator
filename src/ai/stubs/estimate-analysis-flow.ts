export interface AnalyzeEstimateInput {
  activityDescription: string;
}

export interface AnalyzeEstimateOutput {
  suggestedEffort: number;
  reasoning: string;
}

export async function analyzeEstimate(
  input: AnalyzeEstimateInput,
): Promise<AnalyzeEstimateOutput> {
  const description = input.activityDescription.toLowerCase();
  const base = description.includes("complex") ? 6 : description.includes("api") ? 4 : 2;

  return {
    suggestedEffort: base,
    reasoning:
      "AI flows are disabled on GitHub Pages static builds. This fallback applies a simple heuristic by activity complexity.",
  };
}
