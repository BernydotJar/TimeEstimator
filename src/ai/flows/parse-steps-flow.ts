// Static build stub — replaces the Genkit server action on GitHub Pages.
// No AI calls are made; a simple heuristic produces a usable output.

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
}

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

function estimateEffort(text: string): number {
  for (const [pattern, effort] of EFFORT_KEYWORDS) {
    if (pattern.test(text)) return effort;
  }
  return 1;
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
  if (/complex|multipl|excep|error|fallback|escalat|rule/i.test(text))
    return "Complex";
  if (/retry|timeout|altern|condition/i.test(text)) return "Medium";
  return "Basic";
}

export async function parseSteps(
  input: ParseStepsInput,
): Promise<ParseStepsOutput> {
  const lines = input.steps
    .split(/\n/)
    .map((l) => l.replace(/^[\s\d.\-*•]+/, "").trim())
    .filter((l) => l.length > 4);

  const app = input.applicationContext || "Target System";

  const activities: ActivitySuggestion[] = lines.map((line) => {
    const adapter = guessAdapter(line + " " + input.applicationContext);
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
        "AI flows are disabled in static mode. Effort is heuristic-based — review before sign-off.",
    };
  });

  return {
    activities,
    summary:
      activities.length > 0
        ? `Parsed ${activities.length} step${activities.length !== 1 ? "s" : ""} using heuristic mode (AI unavailable in static build). Total estimated effort: ${activities.reduce((s, a) => s + a.effort, 0).toFixed(1)}h. Review all values before adding to the estimate.`
        : "No steps could be parsed. Paste a numbered list or description of process steps.",
  };
}
