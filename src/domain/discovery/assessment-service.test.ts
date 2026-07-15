import {
  addAssessmentEvidence,
  calculateAssessmentCompleteness,
  createAssessment,
  getAssessmentReadiness,
  markAssessmentReadyForReview,
  removeAssessmentEvidence,
  updateAssessmentAnswer,
  updateAssessmentNotes,
} from "./assessment-service";
import { ASSESSMENT_CATALOG, validateAssessmentCatalog } from "./assessment-catalog";

const NOW = "2026-07-14T12:00:00.000Z";

describe("assessment catalog", () => {
  it("contains seven ordered sections with unique valid definitions", () => {
    expect(ASSESSMENT_CATALOG).toHaveLength(7);
    expect(ASSESSMENT_CATALOG.map((section) => section.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(validateAssessmentCatalog()).toEqual([]);
  });
});

describe("assessment service", () => {
  it("creates a deterministic empty assessment", () => {
    const assessment = createAssessment("project-1", "assessment-1", NOW);
    expect(assessment.id).toBe("assessment-1");
    expect(assessment.sections).toHaveLength(7);
    expect(assessment.completeness.percent).toBe(0);
    expect(assessment.status).toBe("not_started");
  });

  it("normalizes empty answered values to unanswered and clears values for unknown", () => {
    const assessment = createAssessment("project-1", "assessment-1", NOW);
    const empty = updateAssessmentAnswer(assessment, "q-project-objective", { state: "answered", value: "  " }, NOW);
    expect(empty.sections[0].questions[0].answer?.state).toBe("unanswered");

    const answered = updateAssessmentAnswer(assessment, "q-project-objective", { state: "answered", value: "Reduce cycle time" }, NOW);
    const unknown = updateAssessmentAnswer(answered, "q-project-objective", { state: "unknown", value: "must be cleared" }, NOW);
    expect(unknown.sections[0].questions[0].answer).toMatchObject({ state: "unknown", value: undefined });
  });

  it("counts explicit not applicable but not unknown as required completion", () => {
    let assessment = createAssessment("project-1", "assessment-1", NOW);
    const requiredQuestion = assessment.sections[0].questions[0];
    assessment = updateAssessmentAnswer(assessment, requiredQuestion.id, { state: "not_applicable" }, NOW);
    expect(assessment.completeness.answeredRequired).toBe(1);

    assessment = updateAssessmentAnswer(assessment, requiredQuestion.id, { state: "unknown" }, NOW);
    expect(assessment.completeness.answeredRequired).toBe(0);
    expect(assessment.completeness.highImpactUnknownQuestionIds).toContain(requiredQuestion.id);
  });

  it("preserves notes and manages evidence idempotently", () => {
    let assessment = createAssessment("project-1", "assessment-1", NOW);
    assessment = updateAssessmentNotes(assessment, "q-project-objective", "Workshop follow-up", NOW);
    const evidence = { id: "evidence-1", kind: "workshop_statement" as const, label: "Owner statement", capturedAt: NOW };
    assessment = addAssessmentEvidence(assessment, "q-project-objective", evidence, NOW);
    assessment = addAssessmentEvidence(assessment, "q-project-objective", evidence, NOW);
    expect(assessment.sections[0].questions[0].answer?.notes).toBe("Workshop follow-up");
    expect(assessment.sections[0].questions[0].answer?.evidence).toHaveLength(1);

    assessment = removeAssessmentEvidence(assessment, "q-project-objective", evidence.id, NOW);
    expect(assessment.sections[0].questions[0].answer?.evidence).toEqual([]);
  });

  it("only marks an assessment ready when every required answer is resolved", () => {
    let assessment = createAssessment("project-1", "assessment-1", NOW);
    for (const question of assessment.sections.flatMap((section) => section.questions).filter((item) => item.requiredForCompletion)) {
      assessment = updateAssessmentAnswer(assessment, question.id, { state: "not_applicable" }, NOW);
    }
    expect(calculateAssessmentCompleteness(assessment.sections).percent).toBe(100);
    expect(getAssessmentReadiness(assessment)).toEqual({ ready: true, missingQuestionIds: [], unknownQuestionIds: [] });
    expect(markAssessmentReadyForReview(assessment, NOW).status).toBe("ready_for_review");
  });
});
