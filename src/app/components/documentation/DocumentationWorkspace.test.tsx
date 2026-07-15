import { fireEvent, render, screen } from "@testing-library/react";
import type { DocumentationArtifact } from "@/domain/discovery";
import { DocumentationWorkspace } from "./DocumentationWorkspace";

const operations = {
  saveDocumentationArtifact: jest.fn(),
  regenerateDocumentation: jest.fn(),
};

jest.mock("@/hooks/use-projects", () => ({ useProjects: () => operations }));

const artifacts: DocumentationArtifact[] = [
  {
    id: "artifact:project-1:current_state_flow",
    projectId: "project-1",
    schemaVersion: 1,
    version: 1,
    type: "current_state_flow",
    title: "Current-State Flow",
    status: "draft",
    sourceSnapshotHash: "snapshot-1",
    generatedBy: "deterministic",
    generatorVersion: "1.0.0",
    sections: [{
      id: "section:flow",
      title: "Structured Flow",
      order: 1,
      origin: "generated",
      lockedFromRegeneration: false,
      sourceRefs: [{ id: "ref-1", projectId: "project-1", targetType: "process_step", targetId: "step-1", relation: "derived_from" }],
      blocks: [{ id: "block-flow", type: "flow_reference", content: { mermaid: "flowchart TD\n  a --> b", text: "1. Start\n   - sequence -> End" }, origin: "generated" }],
    }],
    reconciliationHistory: [],
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
  },
  {
    id: "artifact:project-1:process_overview",
    projectId: "project-1",
    schemaVersion: 1,
    version: 1,
    type: "process_overview",
    title: "Process Overview",
    status: "draft",
    sourceSnapshotHash: "snapshot-1",
    generatedBy: "deterministic",
    sections: [{
      id: "section:overview",
      title: "Overview",
      order: 1,
      origin: "generated",
      lockedFromRegeneration: false,
      sourceRefs: [],
      blocks: [{ id: "block-overview", type: "paragraph", content: "Overview text", origin: "generated" }],
    }],
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
  },
];

describe("DocumentationWorkspace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: jest.fn() } });
  });

  it("renders Mermaid, textual fallback and source references", () => {
    render(<DocumentationWorkspace projectId="project-1" artifacts={artifacts} onClose={jest.fn()} />);
    expect(screen.getByRole("heading", { name: "Documentation and flow" })).toBeInTheDocument();
    expect(screen.getByText(/flowchart TD/)).toBeInTheDocument();
    expect(screen.getByText(/sequence -> End/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Source references/));
    expect(screen.getByText(/process_step: step-1/)).toBeInTheDocument();
  });

  it("adds a locked manual note and exposes explicit regeneration choices", () => {
    render(<DocumentationWorkspace projectId="project-1" artifacts={artifacts} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add manual note" }));
    expect(operations.saveDocumentationArtifact).toHaveBeenCalledWith(
      "project-1",
      expect.objectContaining({
        sections: expect.arrayContaining([expect.objectContaining({ origin: "manual", lockedFromRegeneration: true })]),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Regenerate and preserve manual" }));
    expect(operations.regenerateDocumentation).toHaveBeenCalledWith("project-1", artifacts[0].id, "preserve_manual");
    fireEvent.click(screen.getByRole("button", { name: "Explicitly replace generated draft" }));
    expect(operations.regenerateDocumentation).toHaveBeenCalledWith("project-1", artifacts[0].id, "explicit_replace");
  });

  it("copies Mermaid and switches artifacts", () => {
    render(<DocumentationWorkspace projectId="project-1" artifacts={artifacts} onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Copy" })[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("flowchart TD\n  a --> b");
    fireEvent.click(screen.getByRole("button", { name: /Process Overview/ }));
    expect(screen.getByText("Overview text")).toBeInTheDocument();
  });
});
