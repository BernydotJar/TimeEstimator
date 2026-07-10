import { invokeN8n } from "@/lib/n8n-client";

export interface ParseStepsInput {
  steps: string;
  rpaTool: string;
  applicationContext: string;
}

interface ActivitySuggestion {
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
  source: "n8n" | "heuristic";
}

const VALID_ACTIVITY_TYPES = ["Application", "Process", "Infrastructure"];
const VALID_ADAPTERS = [
  "API",
  "Database",
  "Email",
  "File System",
  "Web",
  "SAP",
  "Mainframe",
  "Terminal",
  "Citrix",
  "Desktop",
];
const VALID_APP_TYPES = ["Desktop", "Web", "Terminal", "SAP", "Power bi related"];
const VALID_DETAILED_TYPES = [
  "Launch",
  "Click",
  "Read",
  "Write",
  "Send",
  "Forms",
  "Connector",
];
const VALID_COMPLEXITIES = ["Basic", "Medium", "Complex"];

const EFFORT_KEYWORDS: [RegExp, number][] = [
  [/connect|integrat|api|connector/i, 3],
  [/extract|parse|table|grid|list|multi|batch/i, 2.5],
  [/form|fill|input|enter|submit/i, 2],
  [/read|get|fetch|retriev|download/i, 1.5],
  [/click|press|select|choos/i, 0.5],
  [/launch|open|start|login|log.?in|navigate/i, 0.5],
  [/export|report|output|generat|creat/i, 2],
  [/email|send|notify|alert/i, 1],
  [/validat|check|verify|confirm/i, 1],
  [/save|write|update|upload/i, 1],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitize(value: unknown, valids: string[], fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (valids.includes(value)) return value;
  const normalized = value.toLowerCase();
  const match = valids.find((v) => v.toLowerCase() === normalized);
  return match ?? fallback;
}

function estimateEffort(text: string): number {
  for (const [pattern, effort] of EFFORT_KEYWORDS) {
    if (pattern.test(text)) return effort;
  }
  return 1;
}

function normalizeEffort(value: unknown, fallbackText: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return estimateEffort(fallbackText);
  }
  return Math.max(0.5, Math.round(parsed * 2) / 2);
}

function guessAdapter(text: string): string {
  if (/sap/i.test(text)) return "SAP";
  if (/email|outlook|mail/i.test(text)) return "Email";
  if (/api|rest|soap|http/i.test(text)) return "API";
  if (/file|excel|csv|pdf|folder/i.test(text)) return "File System";
  if (/web|browser|url|chrome|portal/i.test(text)) return "Web";
  if (/mainframe|terminal|as400/i.test(text)) return "Terminal";
  if (/citrix/i.test(text)) return "Citrix";
  if (/database|sql|db/i.test(text)) return "Database";
  return "Desktop";
}

function guessAppType(adapter: string): string {
  const map: Record<string, string> = {
    SAP: "SAP",
    Web: "Web",
    Terminal: "Terminal",
    Mainframe: "Terminal",
  };
  return map[adapter] ?? "Desktop";
}

function guessDetailedType(text: string): string {
  if (/launch|open|start|login/i.test(text)) return "Launch";
  if (/click|press|button/i.test(text)) return "Click";
  if (/read|get|extract|fetch/i.test(text)) return "Read";
  if (/write|save|update|fill|input/i.test(text)) return "Write";
  if (/send|email|notify/i.test(text)) return "Send";
  if (/form|submit/i.test(text)) return "Forms";
  if (/connect|api|integrat/i.test(text)) return "Connector";
  return "Click";
}

function guessComplexity(text: string): string {
  if (/complex|multipl|excep|error|fallback|escalat|rule/i.test(text)) {
    return "Complex";
  }
  if (/retry|timeout|altern|condition/i.test(text)) return "Medium";
  return "Basic";
}

function normalizeActivity(
  raw: unknown,
  appFallback: string,
): ActivitySuggestion | null {
  if (!isRecord(raw)) return null;

  const activityName =
    typeof raw.activityName === "string"
      ? raw.activityName.trim().slice(0, 80)
      : "";

  const sourceText = [
    activityName,
    typeof raw.applicationName === "string" ? raw.applicationName : "",
    typeof raw.adapter === "string" ? raw.adapter : "",
    appFallback,
  ]
    .filter(Boolean)
    .join(" ");

  if (!activityName && sourceText.length < 3) return null;

  const adapterGuess = guessAdapter(sourceText);
  const adapter = sanitize(raw.adapter, VALID_ADAPTERS, adapterGuess);
  const appType = sanitize(
    raw.applicationType,
    VALID_APP_TYPES,
    guessAppType(adapter),
  );

  const inferredType = /api|file|email|database/i.test(sourceText)
    ? "Infrastructure"
    : /decision|logic|orchestrat|route/i.test(sourceText)
      ? "Process"
      : "Application";

  const coreSupervised =
    typeof raw.coreSupervised === "string" &&
    raw.coreSupervised.toLowerCase() === "supervised"
      ? "supervised"
      : "core";

  return {
    applicationName:
      typeof raw.applicationName === "string" && raw.applicationName.trim()
        ? raw.applicationName.trim()
        : appFallback,
    activityName: activityName || "Imported step",
    activityType: sanitize(raw.activityType, VALID_ACTIVITY_TYPES, inferredType),
    coreSupervised,
    effort: normalizeEffort(raw.effort, sourceText),
    adapter,
    applicationType: appType,
    detailedActivityType: sanitize(
      raw.detailedActivityType,
      VALID_DETAILED_TYPES,
      guessDetailedType(sourceText),
    ),
    exceptionHandlingComplexity: sanitize(
      raw.exceptionHandlingComplexity,
      VALID_COMPLEXITIES,
      guessComplexity(sourceText),
    ),
    assumption:
      typeof raw.assumption === "string"
        ? raw.assumption.trim()
        : "Review and validate imported assumptions before sign-off.",
  };
}

async function parseWithN8n(
  input: ParseStepsInput,
): Promise<ParseStepsOutput | null> {
  try {
    const result = await invokeN8n<Partial<ParseStepsOutput>>("parseSteps", input);

    const appFallback = input.applicationContext || "Target System";
    const rawActivities = Array.isArray(result.activities)
      ? result.activities
      : [];
    const activities = rawActivities
      .map((raw) => normalizeActivity(raw, appFallback))
      .filter((activity): activity is ActivitySuggestion => Boolean(activity));

    if (activities.length === 0) return null;

    const summary =
      typeof result.summary === "string" && result.summary.trim().length > 0
        ? result.summary.trim()
        : `Parsed ${activities.length} steps using n8n AI workflow.`;

    return { activities, summary, source: "n8n" };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("parseSteps fallback activated:", error);
    }
    return null;
  }
}

function parseWithHeuristics(input: ParseStepsInput): ParseStepsOutput {
  const lines = input.steps
    .split(/\n/)
    .map((line) => line.replace(/^[\s\d.\-*•]+/, "").trim())
    .filter((line) => line.length > 4);

  const app = input.applicationContext || "Target System";

  const activities: ActivitySuggestion[] = lines.map((line) => {
    const adapter = guessAdapter(`${line} ${input.applicationContext}`);

    return {
      applicationName: app,
      activityName: line.slice(0, 80),
      activityType: /api|file|email|database/i.test(line)
        ? "Infrastructure"
        : /decision|logic|orchestrat|route/i.test(line)
          ? "Process"
          : "Application",
      coreSupervised: /review|approv|human|manual|check/i.test(line)
        ? "supervised"
        : "core",
      effort: estimateEffort(line),
      adapter,
      applicationType: guessAppType(adapter),
      detailedActivityType: guessDetailedType(line),
      exceptionHandlingComplexity: guessComplexity(line),
      assumption:
        "n8n AI is not configured. Effort is heuristic-based and should be reviewed.",
    };
  });

  return {
    activities,
    summary:
      activities.length > 0
        ? `Parsed ${activities.length} step${activities.length !== 1 ? "s" : ""} in local heuristic mode. Total estimated effort: ${activities
            .reduce((sum, activity) => sum + activity.effort, 0)
            .toFixed(1)}h.`
        : "No steps could be parsed. Paste a numbered list or process description.",
    source: "heuristic",
  };
}

export async function parseSteps(
  input: ParseStepsInput,
): Promise<ParseStepsOutput> {
  const fromN8n = await parseWithN8n(input);
  if (fromN8n) return fromN8n;
  return parseWithHeuristics(input);
}
