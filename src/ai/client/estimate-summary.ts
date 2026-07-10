import {
  summarizeActivities as summarizeActivitiesServer,
  SummarizeActivitiesInput,
  SummarizeActivitiesOutput,
} from "@/ai/flows/estimate-summary-flow";
import { summarizeActivities as summarizeActivitiesN8n } from "@/ai/stubs/estimate-summary-flow";
import { resolveN8nWebhookUrl } from "@/lib/n8n-config";

export async function summarizeActivities(
  input: SummarizeActivitiesInput,
): Promise<SummarizeActivitiesOutput> {
  if (resolveN8nWebhookUrl("summarizeActivities")) {
    return summarizeActivitiesN8n(input);
  }

  return summarizeActivitiesServer(input);
}
