import { fireEvent, render, screen } from "@testing-library/react";
import type { EstimationDraft } from "@/domain/discovery";
import { ProposalWorkspace } from "./ProposalWorkspace";

const operations = {
  updateProposal: jest.fn(),
  getProposalPreview: jest.fn(() => ({
    selectedCount: 1,
    addedEffort: 4,
    currentBase: 2,
    proposedBase: 6,
    currentGrandTotal: 2.7,
    proposedGrandTotal: 8.1,
  })),
  applyProposals: jest.fn(() => []),
};

jest.mock("@/hooks/use-projects", () => ({ useProjects: () => operations }));

const draft: EstimationDraft = {
  id: "draft-1",
  projectId: "project-1",
  processId: "process-1",
  schemaVersion: 1,
  version: 1,
  status: "draft",
  inputSnapshotHash: "snapshot-1",
  ruleCatalogVersion: "1.0.0",
  inputs: [],
  factors: [],
  proposals: [
    {
      id: "proposal-1",
      draftId: "draft-1",
      version: 1,
      status: "proposed",
      originStepIds: ["step-1"],
      activity: {
        applicationName: "",
        adapter: "",
        activityName: "Validate invoice",
        activityType: "business_rules",
        coreSupervised: "core",
        reused: false,
        effort: 4,
        businessException: "",
        assumption: "",
        rpaTool: "",
        applicationType: "",
        detailedActivityType: "process_design",
        exceptionHandlingComplexity: "",
      },
      baseEffortHours: 4,
      factorIds: [],
      calculatedEffortHours: 4,
      overheadPolicy: "project_overhead",
      rationale: "Mapped from the reviewed process step.",
      confidence: "low",
      assumptions: [],
      source: "deterministic",
      sourceRefs: [],
      deliveryPhase: "process_design",
      category: "business_rules",
      unknowns: ["system"],
      warnings: ["Effort requires explicit user review."],
      included: true,
      selected: true,
      reviewed: true,
    },
  ],
  scenarios: [],
  adjustments: [],
  confidence: {
    score: 0,
    band: "low",
    dimensions: [],
    highImpactUnknownIds: [],
    rationale: [],
    calculatedAt: "2026-07-15T00:00:00.000Z",
  },
  createdAt: "2026-07-15T00:00:00.000Z",
  updatedAt: "2026-07-15T00:00:00.000Z",
};

describe("ProposalWorkspace", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows traceability and never applies before explicit confirmation", () => {
    render(<ProposalWorkspace projectId="project-1" draft={draft} onClose={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Activity proposals" })).toBeInTheDocument();
    expect(screen.getByText(/snapshot snapshot-1/i)).toBeInTheDocument();
    expect(screen.getByText(/steps step-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview only/i)).toBeInTheDocument();

    const apply = screen.getByRole("button", { name: "Apply selected" });
    expect(apply).toBeDisabled();
    expect(operations.applyProposals).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText(/I confirm applying only the selected proposals/i));
    expect(apply).toBeEnabled();
    fireEvent.click(apply);

    expect(operations.applyProposals).toHaveBeenCalledWith("project-1", "draft-1", true);
    expect(screen.getByRole("status")).toHaveTextContent("Selected proposals applied.");
  });

  it("persists include, select, effort, and name review decisions", () => {
    render(<ProposalWorkspace projectId="project-1" draft={draft} onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Proposal proposal-1 name"), {
      target: { value: "Review invoice" },
    });
    fireEvent.change(screen.getByLabelText("Proposal proposal-1 effort"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByLabelText("Include"));

    expect(operations.updateProposal).toHaveBeenCalledWith(
      "project-1",
      "draft-1",
      "proposal-1",
      expect.objectContaining({ reviewed: true }),
    );
    expect(operations.updateProposal).toHaveBeenCalledWith(
      "project-1",
      "draft-1",
      "proposal-1",
      expect.objectContaining({ calculatedEffortHours: 6, baseEffortHours: 6 }),
    );
    expect(operations.updateProposal).toHaveBeenCalledWith(
      "project-1",
      "draft-1",
      "proposal-1",
      expect.objectContaining({ included: false, selected: false }),
    );
  });
});
