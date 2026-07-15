import type { EstimationDraft, GeneratedActivityProposal } from "./estimation";
import { validateProposalDraft } from "./proposal-validation";

const NOW = "2026-07-15T00:00:00.000Z";

function proposal(overrides: Partial<GeneratedActivityProposal> = {}): GeneratedActivityProposal {
  return {
    id: "proposal-1",
    draftId: "draft-1",
    version: 1,
    status: "proposed",
    originStepIds: ["step-1"],
    activity: {
      applicationName: "",
      adapter: "",
      activityName: "Review invoice",
      activityType: "task",
      coreSupervised: "core",
      reused: false,
      effort: 4,
      businessException: "",
      assumption: "",
      rpaTool: "",
      applicationType: "",
      detailedActivityType: "implementation",
      exceptionHandlingComplexity: "",
    },
    baseEffortHours: 4,
    factorIds: [],
    calculatedEffortHours: 4,
    overheadPolicy: "project_overhead",
    rationale: "Mapped from step-1.",
    confidence: "low",
    assumptions: [],
    source: "deterministic",
    sourceRefs: [],
    included: true,
    selected: true,
    reviewed: true,
    ...overrides,
  };
}

function draft(item: GeneratedActivityProposal): EstimationDraft {
  return {
    id: "draft-1",
    projectId: "project-1",
    schemaVersion: 1,
    version: 1,
    status: "draft",
    inputSnapshotHash: "snapshot-1",
    inputs: [],
    factors: [],
    proposals: [item],
    scenarios: [],
    adjustments: [],
    confidence: {
      score: 0,
      band: "low",
      dimensions: [],
      highImpactUnknownIds: [],
      rationale: [],
      calculatedAt: NOW,
    },
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("proposal validation", () => {
  it("accepts a reviewed selected proposal with a finite non-negative effort", () => {
    expect(validateProposalDraft(draft(proposal())).valid).toBe(true);
  });

  it("rejects an empty name and negative effort", () => {
    const result = validateProposalDraft(draft(proposal({
      activity: { ...proposal().activity, activityName: "" },
      calculatedEffortHours: -1,
    })));

    expect(result.valid).toBe(false);
    expect(result.errors.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["PROPOSAL_NAME_MISSING", "PROPOSAL_EFFORT_INVALID"]),
    );
  });

  it("rejects a draft without an included selection", () => {
    const result = validateProposalDraft(draft(proposal({ selected: false })));
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("NO_PROPOSAL_SELECTED");
  });

  it("warns when a selected proposal was not explicitly reviewed", () => {
    const result = validateProposalDraft(draft(proposal({ reviewed: false })));
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe("PROPOSAL_NOT_REVIEWED");
  });
});
