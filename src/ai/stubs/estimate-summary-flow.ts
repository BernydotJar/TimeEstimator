export interface SummarizeActivitiesInput {
  activities: string;
}

export interface SummarizeActivitiesOutput {
  summary: string;
}

export async function summarizeActivities(
  input: SummarizeActivitiesInput,
): Promise<SummarizeActivitiesOutput> {
  let count = 0;
  try {
    const parsed = JSON.parse(input.activities);
    if (Array.isArray(parsed)) count = parsed.length;
  } catch {
    count = 0;
  }

  return {
    summary:
      count > 0
        ? `This estimate includes ${count} activities. Review the effort breakdown by type and validate overhead assumptions before sign-off.`
        : "AI summary is unavailable in static GitHub Pages mode. Add activities to generate a report summary.",
  };
}
