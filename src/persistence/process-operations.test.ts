import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import type { RawProcessInput } from "@/domain/discovery";
import {
  createProjectCurrentStateProcess,
  getActiveProjectProcess,
  normalizeProjectProcess,
  parseProjectRawProcessInput,
  replaceProjectProcess,
  saveProjectRawProcessInput,
  setProjectActiveProcess,
  updateProjectCandidateReview,
  validateProjectProcess,
} from "./process-operations";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function legacyProject(): Project {
  return {
    id: "project-1",
    name: "Legacy",
    description: "",
    createdAt: NOW,
    updatedAt: NOW,
    activities: [{ id: "activity-1", applicationName: "ERP", adapter: "", activityName: "Existing", activityType: "Build", coreSupervised: "core", reused: false, effort: 8, businessException: "", assumption: "", rpaTool: "", applicationType: "", detailedActivityType: "", exceptionHandlingComplexity: "" }],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
  };
}

const raw: RawProcessInput = {
  id: "raw-1",
  projectId: "project-1",
  processId: "process-1",
  content: "1. Start\n2. End",
  format: "numbered_list",
  source: "manual",
  capturedAt: NOW,
  updatedAt: NOW,
};

describe("process persistence operations", () => {
  it("migrates legacy projects without changing estimation data", () => {
    const original = legacyProject();
    const created = createProjectCurrentStateProcess(original, "process-1", NOW).project;
    expect(created.discovery?.processes).toHaveLength(1);
    expect(created.activities).toEqual(original.activities);
    expect(created.overheadPercentages).toEqual(original.overheadPercentages);
  });

  it("preserves raw input through parse, review, and normalization", () => {
    const created = createProjectCurrentStateProcess(legacyProject(), "process-1", NOW).project;
    const parsed = parseProjectRawProcessInput(saveProjectRawProcessInput(created, "process-1", raw, LATER), "process-1", "raw-1", LATER);
    const process = getActiveProjectProcess(parsed)!;
    const reviewed = updateProjectCandidateReview(parsed, "process-1", {
      ...process.candidateReview!,
      candidates: process.candidateReview!.candidates.map((candidate) => ({ ...candidate, confirmedByUser: true })),
    }, LATER);
    const normalized = normalizeProjectProcess(reviewed, "process-1", LATER);
    expect(getActiveProjectProcess(normalized)?.rawInputs?.[0].content).toBe(raw.content);
    expect(getActiveProjectProcess(normalized)?.steps).toHaveLength(2);
    expect(normalized.discovery?.auditEntries.at(-1)?.action).toBe("process_imported");
  });

  it("supports additive versions, active selection, and validation audit", () => {
    const first = createProjectCurrentStateProcess(legacyProject(), "process-1", NOW).project;
    const process = getActiveProjectProcess(first)!;
    const second = replaceProjectProcess(first, { ...process, id: "process-2", state: "future", name: "Future-State Process", createdAt: LATER, updatedAt: LATER }, LATER);
    const refreshed = JSON.parse(JSON.stringify(setProjectActiveProcess(second, "process-1", LATER))) as Project;
    const validated = validateProjectProcess(refreshed, "process-1", LATER);
    expect(validated.discovery?.processes).toHaveLength(2);
    expect(getActiveProjectProcess(validated)?.id).toBe("process-1");
    expect(validated.discovery?.auditEntries.at(-1)?.action).toBe("process_validated");
  });
});
