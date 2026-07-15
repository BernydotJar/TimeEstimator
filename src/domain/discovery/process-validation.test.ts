import {
  connectLinearSteps,
  createCurrentStateProcess,
  normalizeReviewedCandidates,
  validateProcess,
  type ReviewedStepCandidate,
} from "@/domain/discovery";

const NOW = "2026-07-15T00:00:00.000Z";

function candidate(id: string, order: number, name: string, type: ReviewedStepCandidate["suggestedType"]): ReviewedStepCandidate {
  return {
    id,
    order,
    rawText: name,
    suggestedName: name,
    suggestedType: type,
    included: true,
    confirmedByUser: true,
    provenance: { source: "deterministic", parserVersion: "1.0.0", rawInputId: "raw-1", rawLine: order },
    warnings: [],
  };
}

describe("process validation engine", () => {
  it("marks an empty process invalid", () => {
    const result = validateProcess(createCurrentStateProcess("project-1", "process-1", NOW), NOW);
    expect(result.valid).toBe(false);
    expect(result.errors.map((finding) => finding.code)).toContain("PROCESS_EMPTY");
  });

  it("accepts a connected start-to-end process", () => {
    const normalized = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "Start", "start"), candidate("b", 2, "Work", "task"), candidate("c", 3, "End", "end")],
      NOW,
    );
    const result = validateProcess(connectLinearSteps(normalized, NOW).process, NOW);
    expect(result.valid).toBe(true);
    expect(result.warnings.map((finding) => finding.code)).not.toEqual(expect.arrayContaining(["START_MISSING", "END_MISSING", "UNREACHABLE_STEP"]));
  });

  it("reports structural graph and reference gaps", () => {
    const process = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "Start", "start"), candidate("b", 2, "Decide", "decision"), candidate("c", 3, "Exception", "exception"), candidate("d", 4, "End", "end")],
      NOW,
    );
    const [start, decision, , end] = process.steps;
    const result = validateProcess({
      ...process,
      steps: process.steps.map((step) => step.id === decision.id ? { ...step, actorIds: ["missing-actor"], systemIds: ["missing-system"] } : step),
      edges: [
        { id: "missing", processId: process.id, sourceStepId: "missing-source", targetStepId: "missing-target", type: "sequence" },
        { id: "self", processId: process.id, sourceStepId: start.id, targetStepId: start.id, type: "retry" },
        { id: "conditional-1", processId: process.id, sourceStepId: decision.id, targetStepId: end.id, type: "conditional" },
        { id: "conditional-2", processId: process.id, sourceStepId: decision.id, targetStepId: end.id, type: "conditional" },
      ],
    }, NOW);
    const errors = result.errors.map((finding) => finding.code);
    const warnings = result.warnings.map((finding) => finding.code);
    expect(errors).toEqual(expect.arrayContaining(["EDGE_SOURCE_MISSING", "EDGE_TARGET_MISSING", "ACTOR_REFERENCE_MISSING", "SYSTEM_REFERENCE_MISSING"]));
    expect(warnings).toEqual(expect.arrayContaining(["EDGE_SELF_LOOP", "EDGE_DUPLICATE", "CONDITIONAL_EDGE_WITHOUT_CONDITION", "DECISION_WITHOUT_BRANCH", "EXCEPTION_WITHOUT_RECOVERY"]));
  });
});
