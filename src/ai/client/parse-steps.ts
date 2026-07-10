import {
  parseSteps as parseStepsServer,
  ParseStepsInput,
  ParseStepsOutput,
} from "@/ai/flows/parse-steps-flow";
import { parseSteps as parseStepsN8n } from "@/ai/stubs/parse-steps-flow";
import { resolveN8nWebhookUrl } from "@/lib/n8n-config";

export async function parseSteps(input: ParseStepsInput): Promise<ParseStepsOutput> {
  if (resolveN8nWebhookUrl("parseSteps")) {
    return parseStepsN8n(input);
  }

  return parseStepsServer(input);
}
