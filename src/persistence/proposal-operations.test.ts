import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import {
  createCurrentStateProcess,
  normalizeReviewedCandidates,
  type ReviewedStepCandidate,
} from "@/domain/discovery";
import {
  applyProjectProposals,
  generateProjectProposalSet,
  updateProjectProposal,
} from "./proposal-operations";
import { createEmptyDiscoveryState, migrateProjectDiscovery } from "./project-migrations";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function candidate(id: string, order: number, name: string): ReviewedStepCandidate {
  return {
    id,
    order,
    rawText: name,
    suggestedName: name,
    suggestedType: "task",
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

function baseProject(): Project {
  const process = normalizeReviewedCandidates(
    createCurrentStateProcess("project-1", "process-1", NOW),
    [candidate("a", 1, "Read"), candidate("b", 2, "Write")],
    NOW,
  );
  return {
    id: "project-1",
    name: "Test",
    description: "",
    createdAt: NOW,
    updatedAt: NOW,
    activities: [],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
    discovery: {
      ...createEmptyDiscoveryState(),
      processes: [process],
      activeProcessId: process.id,
    },
  };
}

describe("proposal persistence", () => {
  it("creates a draft without changing activities and persists audit evidence", () => {
    const project = generateProjectProposalSet(baseProject(), "draft-1", NOW);
    expect(project.activities).toHaveLength(0);
    expect(project.discovery?.activeEstimationDraftId).toBe("draft-1");
    expect(project.discovery?.estimationDrafts[0].proposals.length).toBeGreaterThan(0);
    expect(project.discovery?.auditEntries.at(-1)?.action).toBe("proposals_generated");
    expect(project.discovery?.processes).toHaveLength(1);
  });

  it("applies selected proposals once and preserves discovery data", () => {
    let project = generateProjectProposalSet(baseProject(), "draft-1", NOW);
    const draft = project.discovery!.estimationDrafts[0];
    const proposal = draft.proposals[0];
    project = updateProjectProposal(project, draft.id, proposal.id, {
      included: true,
      selected: true,
      reviewed: true,
      calculatedEffortHours: 4,
      activity: { ...proposal.activity, effort: 4 },
    }, LATER);

    const first = applyProjectProposals(project, draft.id, true, LATER);
    expect(first.warnings).toEqual([]);
    expect(first.project.activities).toHaveLength(1);
    expect(first.project.discovery?.estimationDrafts[0].applyReceipts).toHaveLength(1);
    expect(first.project.discovery?.auditEntries.at(-1)?.action).toBe("proposals_applied");
    expect(first.project.discovery?.processes).toHaveLength(1);

    const second = applyProjectProposals(
      first.project,
      draft.id,
      true,
      "2026-07-15T02:00:00.000Z",
    );
    expect(second.warnings[0]).toMatch(/already applied/i);
    expect(second.project.activities).toHaveLength(1);
  });

  it("keeps legacy projects readable", () => {
    const legacy: Project = {
      id: "legacy",
      name: "Legacy",
      description: "",
      createdAt: NOW,
      updatedAt: NOW,
      activities: [],
      overheadPercentages: { ...DEFAULT_OVERHEAD },
    };
    expect(migrateProjectDiscovery(legacy).discovery?.estimationDrafts).toEqual([]);
  });
});
