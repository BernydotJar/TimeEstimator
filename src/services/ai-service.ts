/**
 * AI Service — n8n Webhook Client
 *
 * All AI features go through a single n8n webhook endpoint.
 * n8n routes requests by `action` field to the appropriate AI chain.
 *
 * Required environment variables (baked in at build time for static export):
 *   NEXT_PUBLIC_N8N_WEBHOOK_URL  — your n8n webhook trigger URL
 *   NEXT_PUBLIC_N8N_AUTH_TOKEN   — Bearer token validated by n8n (protects the webhook)
 *
 * Real AI provider keys (Gemini, OpenAI, etc.) stay exclusively in n8n — never in this repo.
 *
 * n8n Workflow structure expected:
 *   Webhook (POST /your-path) →
 *     IF headers.authorization === "Bearer <token>" →
 *       Switch on body.action:
 *         "analyzeEstimate"    → AI chain → Respond to Webhook
 *         "getEstimateDefaults" → AI chain → Respond to Webhook
 *         "summarizeActivities" → AI chain → Respond to Webhook
 *         "parseSteps"         → AI chain → Respond to Webhook
 *         "flagRisks"          → AI chain → Respond to Webhook
 *       default → Respond with 400
 *     ELSE → Respond with 401
 */

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
const AUTH_TOKEN = process.env.NEXT_PUBLIC_N8N_AUTH_TOKEN;

/** Returns true when the webhook URL is configured in the environment. */
export function isAiConfigured(): boolean {
  return Boolean(WEBHOOK_URL);
}

async function callWebhook<T>(action: string, payload: unknown): Promise<T> {
  if (!WEBHOOK_URL) {
    throw new Error(
      "AI not configured. Set NEXT_PUBLIC_N8N_WEBHOOK_URL in your .env.local file.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `n8n webhook returned ${response.status}: ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "AI request timed out after 30s. Check that your n8n instance is reachable.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ── analyzeEstimate ─────────────────────────────────────────────────────────
// Suggests effort (hours) and reasoning for a single RPA activity.

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
  return callWebhook("analyzeEstimate", input);
}

// ── getEstimateDefaults ────────────────────────────────────────────────────
// Suggests overhead percentages based on project type/name.

export interface EstimateDefaultsInput {
  projectType: string;
}

export interface EstimateDefaultsOutput {
  contingency: number;
  pm: number;
  sa: number;
  sdd: number;
  releaseConfig: number;
  userManual: number;
}

export async function getEstimateDefaults(
  input: EstimateDefaultsInput,
): Promise<EstimateDefaultsOutput> {
  return callWebhook("getEstimateDefaults", input);
}

// ── summarizeActivities ────────────────────────────────────────────────────
// Generates an executive summary of all activities for stakeholder reports.

export interface SummarizeActivitiesInput {
  activities: string; // JSON-serialised array of activity objects
}

export interface SummarizeActivitiesOutput {
  summary: string;
}

export async function summarizeActivities(
  input: SummarizeActivitiesInput,
): Promise<SummarizeActivitiesOutput> {
  return callWebhook("summarizeActivities", input);
}

// ── parseSteps ─────────────────────────────────────────────────────────────
// Converts a free-text process step list into structured RPA activity objects.

export interface ParseStepsInput {
  steps: string;
  rpaTool: string;
  applicationContext: string;
}

export interface ActivitySuggestion {
  applicationName: string;
  activityName: string;
  activityType: string;
  coreSupervised: string;
  effort: number;
  adapter: string;
  applicationType: string;
  detailedActivityType: string;
  exceptionHandlingComplexity: string;
  assumption: string;
}

export interface ParseStepsOutput {
  activities: ActivitySuggestion[];
  summary: string;
}

export async function parseSteps(
  input: ParseStepsInput,
): Promise<ParseStepsOutput> {
  return callWebhook("parseSteps", input);
}

// ── flagRisks ──────────────────────────────────────────────────────────────
// Analyses the activity list for estimation risks, complexity hotspots,
// missing assumptions, and scope concerns.

export interface FlagRisksInput {
  activities: string; // JSON-serialised array
  projectName: string;
  grandTotalEffort: number;
}

export interface RiskFlag {
  severity: "low" | "medium" | "high";
  category: string;
  message: string;
}

export interface FlagRisksOutput {
  risks: RiskFlag[];
  overallRisk: "low" | "medium" | "high";
}

export async function flagRisks(
  input: FlagRisksInput,
): Promise<FlagRisksOutput> {
  return callWebhook("flagRisks", input);
}
