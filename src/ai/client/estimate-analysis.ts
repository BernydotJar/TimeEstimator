import {
  analyzeEstimate as analyzeEstimateServer,
  AnalyzeEstimateInput,
  AnalyzeEstimateOutput,
} from "@/ai/flows/estimate-analysis-flow";
import { analyzeEstimate as analyzeEstimateN8n } from "@/ai/stubs/estimate-analysis-flow";
import { resolveN8nWebhookUrl } from "@/lib/n8n-config";

export async function analyzeEstimate(
  input: AnalyzeEstimateInput,
): Promise<AnalyzeEstimateOutput> {
  if (resolveN8nWebhookUrl("analyzeEstimate")) {
    return analyzeEstimateN8n(input);
  }

  return analyzeEstimateServer(input);
}
