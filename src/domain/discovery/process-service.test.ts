import {
  addProcessActor,
  addProcessEdge,
  connectLinearSteps,
  createCurrentStateProcess,
  normalizeReviewedCandidates,
  removeProcessActor,
  removeProcessStep,
  reorderProcessSteps,
  updateProcessStep,
  type ReviewedStepCandidate,
} from "@/domain/discovery";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function candidate(
  id: string,
  order: number,
  name: string,
  type: ReviewedStepCandidate["suggestedType"] = "task",
): ReviewedStepCandidate {
  return {
    id,
    order,
    rawText: name,
    suggestedName: name,
    suggestedType: type,
    included: true,
    confirmedByUser: true,
    provenance: {
      source: "deterministic",
      parserVersion: "1.0.0",
      rawInputId: "raw-1",
      rawLine: order,
    },
    warnings: [],
  };
}

describe("process service", () => {
  it("normalizes reviewed candidates with stable provenance", () => {
    const process = createCurrentStateProcess("project-1", "process-1", NOW);
    const normalized = normalizeReviewedCandidates(
      process,
      [candidate("a", 1, "Start", "start"), candidate("b", 2, "Work")],
      LATER,
    );

    expect(normalized.steps).toHaveLength(2);
    expect(normalized.steps[0].provenance?.candidateId).toBe("a");
    expect(normalized.version).toBe(2);
  });

  it("updates and reorders steps immutably", () => {
    const normalized = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "One"), candidate("b", 2, "Two")],
      NOW,
    );
    const updated = updateProcessStep(normalized, normalized.steps[0].id, { name: "Updated" }, LATER);
    const reordered = reorderProcessSteps(updated, [updated.steps[1].id, updated.steps[0].id], LATER);

    expect(normalized.steps[0].name).toBe("One");
    expect(updated.steps[0].name).toBe("Updated");
    expect(reordered.steps[0].name).toBe("Two");
  });

  it("connects linearly without duplicating edges", () => {
    const normalized = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "One"), candidate("b", 2, "Two"), candidate("c", 3, "Three")],
      NOW,
    );
    const first = connectLinearSteps(normalized, LATER).process;
    const second = connectLinearSteps(first, LATER).process;

    expect(first.edges).toHaveLength(2);
    expect(second.edges).toHaveLength(2);
  });

  it("guards destructive removals when dependencies exist", () => {
    let process = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "One"), candidate("b", 2, "Two")],
      NOW,
    );
    process = connectLinearSteps(process, LATER).process;
    const guarded = removeProcessStep(process, process.steps[0].id, LATER);
    const cascaded = removeProcessStep(process, process.steps[0].id, LATER, true);

    expect(guarded.process.steps).toHaveLength(2);
    expect(guarded.warnings[0]).toMatch(/connected/i);
    expect(cascaded.process.steps).toHaveLength(1);
    expect(cascaded.process.edges).toHaveLength(0);
  });

  it("guards actors referenced by steps and validates edge endpoints", () => {
    let process = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "One"), candidate("b", 2, "Two")],
      NOW,
    );
    process = addProcessActor(process, { id: "actor-1", name: "Analyst", kind: "role" }, LATER);
    process = updateProcessStep(process, process.steps[0].id, { actorIds: ["actor-1"] }, LATER);

    expect(removeProcessActor(process, "actor-1", LATER).warnings[0]).toMatch(/referenced/i);
    expect(addProcessEdge(process, {
      id: "bad-edge",
      processId: process.id,
      sourceStepId: "missing",
      targetStepId: process.steps[0].id,
      type: "sequence",
    }, LATER).warnings[0]).toMatch(/Missing edge source/);
  });
});
