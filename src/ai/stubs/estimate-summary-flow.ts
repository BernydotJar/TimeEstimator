import { invokeN8n } from "@/lib/n8n-client";

export interface SummarizeActivitiesInput {
  activities: string;
}

export interface SummarizeActivitiesOutput {
  summary: string;
  source: "n8n" | "heuristic";
}

function summarizeFromCount(activities: string): string {
  let count = 0;
  try {
    const parsed = JSON.parse(activities);
    if (Array.isArray(parsed)) count = parsed.length;
  } catch {
    count = 0;
  }

  if (count > 0) {
    return `This estimate includes ${count} activities. Review the effort breakdown by type and validate overhead assumptions before sign-off.`;
  }

  return "No activities available yet. Add items to generate a meaningful estimate summary.";
}

export async function summarizeActivities(
  input: SummarizeActivitiesInput,
): Promise<SummarizeActivitiesOutput> {
  try {
    const result = await invokeN8n<Partial<SummarizeActivitiesOutput>>(
      "summarizeActivities",
      input,
    );

    if (typeof result.summary === "string" && result.summary.trim().length > 0) {
      return { summary: result.summary.trim(), source: "n8n" };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("summarizeActivities fallback activated:", error);
    }
  }

  return {
    summary: summarizeFromCount(input.activities),
    source: "heuristic",
  };
}
