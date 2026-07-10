import {
  getEstimateDefaults as getEstimateDefaultsServer,
  EstimateDefaultsInput,
  EstimateDefaultsOutput,
} from "@/ai/flows/estimate-defaults-flow";
import { getEstimateDefaults as getEstimateDefaultsN8n } from "@/ai/stubs/estimate-defaults-flow";
import { resolveN8nWebhookUrl } from "@/lib/n8n-config";

export async function getEstimateDefaults(
  input: EstimateDefaultsInput,
): Promise<EstimateDefaultsOutput> {
  if (resolveN8nWebhookUrl("estimateDefaults")) {
    return getEstimateDefaultsN8n(input);
  }

  return getEstimateDefaultsServer(input);
}
