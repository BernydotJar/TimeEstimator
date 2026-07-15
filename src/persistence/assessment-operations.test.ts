import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import { getAssessmentReadiness, updateAssessmentAnswer } from "@/domain/discovery";
import { createProjectAssessment, getActiveProjectAssessment, readyProjectAssessment, replaceProjectAssessment } from "./assessment-operations";

const legacy = (): Project => ({ id: "project-1", name: "Legacy", description: "", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", activities: [], overheadPercentages: { ...DEFAULT_OVERHEAD } });

describe("assessment persistence operations", () => {
  it("creates an active assessment without losing legacy project fields", () => {
    const result = createProjectAssessment(legacy(), "assessment-1", "2026-07-15T00:00:00.000Z");
    expect(result.project.id).toBe("project-1");
    expect(result.project.overheadPercentages).toEqual(DEFAULT_OVERHEAD);
    expect(result.project.discovery?.activeAssessmentId).toBe("assessment-1");
    expect(getActiveProjectAssessment(result.project)?.id).toBe("assessment-1");
    expect(result.project.discovery?.auditEntries[0].action).toBe("assessment_created");
  });

  it("replaces the assessment progressively and preserves project activities", () => {
    const created = createProjectAssessment(legacy(), "assessment-1", "2026-07-15T00:00:00.000Z");
    const firstQuestion = created.assessment.sections[0].questions[0];
    const updated = updateAssessmentAnswer(created.assessment, firstQuestion.id, { state: "answered", value: "Reduce cycle time" }, "2026-07-15T00:01:00.000Z");
    const project = replaceProjectAssessment(created.project, updated, "2026-07-15T00:01:00.000Z");
    expect(getActiveProjectAssessment(project)?.sections[0].questions[0].answer?.value).toBe("Reduce cycle time");
    expect(project.activities).toEqual([]);
  });

  it("does not mark an incomplete assessment ready", () => {
    const created = createProjectAssessment(legacy(), "assessment-1", "2026-07-15T00:00:00.000Z");
    expect(getAssessmentReadiness(created.assessment).ready).toBe(false);
    expect(getActiveProjectAssessment(readyProjectAssessment(created.project, created.assessment.id, "2026-07-15T00:02:00.000Z"))?.status).toBe("not_started");
  });
});
