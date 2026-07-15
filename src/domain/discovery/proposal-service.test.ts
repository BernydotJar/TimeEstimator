import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import {
  applySelectedProposals,
  createCurrentStateProcess,
  generateActivityProposalSet,
  normalizeReviewedCandidates,
  previewProposalImpact,
  updateActivityProposal,
  type ReviewedStepCandidate,
} from "@/domain/discovery";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function project(): Project {
  return {
    id: "project-1",
    name: "Test",
    description: "",
    createdAt: NOW,
    updatedAt: NOW,
    activities: [],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
  };
}

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

function draft() {
  const process = normalizeReviewedCandidates(
    createCurrentStateProcess("project-1", "process-1", NOW),
    [
      candidate("start", 1, "Start", "start"),
      candidate("a", 2, "Read invoice"),
      candidate("b", 3, "Validate invoice"),
      candidate("decision", 4, "Approved?", "decision"),
      candidate("end", 5, "End", "end"),
    ],
    NOW,
  );
  return generateActivityProposalSet({
    project: project(),
    process,
    draftId: "draft-1",
    now: NOW,
  });
}

describe("proposal service", () => {
  it("generates deterministic IDs, snapshot hash, source refs and safe grouping", () => {
    const first = draft();
    const second = draft();

    expect(first.inputSnapshotHash).toBe(second.inputSnapshotHash);
    expect(first.proposals.map((proposal) => proposal.id)).toEqual(
      second.proposals.map((proposal) => proposal.id),
    );
    expect(first.proposals).toHaveLength(2);
    expect(first.proposals[0].originStepIds).toHaveLength(2);
    expect(first.proposals[1].ruleIds).toEqual(["STEP-DECISION-001"]);
    expect(first.proposals[0].sourceRefs.every((ref) => ref.targetType === "process_step")).toBe(true);
    expect(first.proposals[0].unknowns).toEqual(expect.arrayContaining(["actor", "system"]));
    expect(first.proposals[0].calculatedEffortHours).toBe(0);
  });

  it("previews selected effort without mutating current activities", () => {
    const sourceProject = project();
    const sourceDraft = draft();
    const proposal = sourceDraft.proposals[0];
    const reviewed = updateActivityProposal(sourceDraft, proposal.id, {
      selected: true,
      included: true,
      reviewed: true,
      calculatedEffortHours: 8,
      activity: { ...proposal.activity, effort: 8 },
    }, LATER);

    const preview = previewProposalImpact(sourceProject, reviewed);
    expect(preview.selectedCount).toBe(1);
    expect(preview.addedEffort).toBe(8);
    expect(sourceProject.activities).toHaveLength(0);
  });

  it("requires explicit confirmation and applies selected proposals only", () => {
    const sourceProject = project();
    const sourceDraft = draft();
    const selected = sourceDraft.proposals[0];
    const reviewed = {
      ...sourceDraft,
      proposals: sourceDraft.proposals.map((proposal) => ({
        ...proposal,
        selected: proposal.id === selected.id,
        included: true,
        calculatedEffortHours: proposal.id === selected.id ? 5 : 3,
        activity: { ...proposal.activity, effort: proposal.id === selected.id ? 5 : 3 },
      })),
    };

    expect(applySelectedProposals(sourceProject, reviewed, false, LATER).project.activities).toHaveLength(0);
    const applied = applySelectedProposals(sourceProject, reviewed, true, LATER);
    expect(applied.project.activities).toHaveLength(1);
    expect(applied.project.activities[0].effort).toBe(5);
    expect(applied.draft.mappings).toHaveLength(1);
    expect(applied.receipt?.proposalIds).toEqual([selected.id]);
  });

  it("blocks reapplying the same proposal set version", () => {
    const sourceDraft = draft();
    const selected = {
      ...sourceDraft,
      proposals: sourceDraft.proposals.map((proposal, index) => ({
        ...proposal,
        selected: index === 0,
        included: true,
        calculatedEffortHours: index === 0 ? 2 : 0,
        activity: { ...proposal.activity, effort: index === 0 ? 2 : 0 },
      })),
    };
    const first = applySelectedProposals(project(), selected, true, LATER);
    const second = applySelectedProposals(first.project, first.draft, true, "2026-07-15T02:00:00.000Z");
    expect(second.warnings[0]).toMatch(/already applied/i);
    expect(second.project.activities).toHaveLength(1);
  });
});
