import {
  createCurrentStateProcess,
  normalizeReviewedCandidates,
  projectProcessToBpmnBoundary,
  projectProcessToMermaid,
  type ProcessDefinition,
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

function process(): ProcessDefinition {
  const normalized = normalizeReviewedCandidates(
    createCurrentStateProcess("project-1", "process-1", NOW),
    [
      candidate("start", 1, "Start", "start"),
      candidate("decision", 2, "Approved?", "decision"),
      candidate("end", 3, "End \"done\"", "end"),
    ],
    NOW,
  );
  return {
    ...normalized,
    actors: [{ id: "actor-1", name: "Reviewer", kind: "role" }],
    steps: normalized.steps.map((step, index) => index === 1 ? { ...step, actorIds: ["actor-1"] } : step),
    edges: [
      { id: "edge-1", processId: normalized.id, sourceStepId: normalized.steps[0].id, targetStepId: normalized.steps[1].id, type: "sequence", order: 1 },
      { id: "edge-2", processId: normalized.id, sourceStepId: normalized.steps[1].id, targetStepId: normalized.steps[2].id, type: "approval", label: "Yes", condition: "approved", order: 2 },
      { id: "edge-missing", processId: normalized.id, sourceStepId: normalized.steps[1].id, targetStepId: "missing", type: "rejection", label: "No", order: 3 },
    ],
  };
}

describe("flow projections", () => {
  it("generates deterministic Mermaid with escaped labels and branch semantics", () => {
    const first = projectProcessToMermaid(process());
    const second = projectProcessToMermaid(process());
    expect(first.source).toBe(second.source);
    expect(first.source).toContain("flowchart TD");
    expect(first.source).toContain("End &quot;done&quot;");
    expect(first.source).toContain("|\"Yes\"|");
    expect(first.warnings[0]).toMatch(/missing target/i);
    expect(first.textualFallback).toContain("Yes -> End");
    expect(first.textualFallback).toContain("No -> [Missing target: missing]");
  });

  it("creates a BPMN-compatible boundary without mutating the graph", () => {
    const source = process();
    const before = JSON.stringify(source);
    const boundary = projectProcessToBpmnBoundary(source);
    expect(boundary.nodes.map((node) => node.kind)).toEqual(["event", "gateway", "event"]);
    expect(boundary.sequenceFlows).toHaveLength(2);
    expect(boundary.lanes[0]).toEqual(expect.objectContaining({ actorId: "actor-1" }));
    expect(boundary.warnings[0]).toMatch(/omitted/i);
    expect(JSON.stringify(source)).toBe(before);
  });
});
