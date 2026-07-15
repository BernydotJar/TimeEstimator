import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import {
  createCurrentStateProcess,
  generateDocumentationArtifacts,
  normalizeReviewedCandidates,
  projectArtifactToMarkdown,
  regenerateDocumentationArtifact,
  type DocumentationSection,
  type ReviewedStepCandidate,
} from "@/domain/discovery";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function candidate(id: string, order: number, name: string): ReviewedStepCandidate {
  return {
    id,
    order,
    rawText: name,
    suggestedName: name,
    suggestedType: "integration",
    included: true,
    confirmedByUser: true,
    provenance: { source: "deterministic", parserVersion: "1.0.0", rawInputId: "raw-1", rawLine: order },
    warnings: [],
  };
}

function project(): Project {
  return {
    id: "project-1",
    name: "Invoice Automation",
    description: "Process invoices",
    createdAt: NOW,
    updatedAt: NOW,
    activities: [],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
  };
}

describe("documentation service", () => {
  it("generates all eight structured artifacts deterministically", () => {
    const process = normalizeReviewedCandidates(
      createCurrentStateProcess("project-1", "process-1", NOW),
      [candidate("a", 1, "Post to ERP")],
      NOW,
    );
    const first = generateDocumentationArtifacts({ project: project(), process, now: NOW });
    const second = generateDocumentationArtifacts({ project: project(), process, now: NOW });
    expect(first).toHaveLength(8);
    expect(first.map((artifact) => artifact.type)).toEqual(second.map((artifact) => artifact.type));
    expect(first[0].sourceSnapshotHash).toBe(second[0].sourceSnapshotHash);
    expect(first.every((artifact) => artifact.sections.length > 0)).toBe(true);
    expect(first.find((artifact) => artifact.type === "estimation_summary")?.unknowns).toContain("assessment");
  });

  it("preserves locked manual sections and records conflicts on regeneration", () => {
    const [artifact] = generateDocumentationArtifacts({ project: project(), now: NOW });
    const manual: DocumentationSection = {
      id: artifact.sections[0].id,
      title: "Reviewed overview",
      order: 1,
      origin: "manual",
      blocks: [{ id: "manual-block", type: "paragraph", content: "Approved manual context", origin: "manual", manualOverride: true }],
      sourceRefs: [],
      lockedFromRegeneration: true,
      updatedAt: NOW,
    };
    const existing = { ...artifact, sections: [manual] };
    const result = regenerateDocumentationArtifact(existing, { project: project(), now: LATER }, "preserve_manual");
    expect(result.artifact.version).toBe(2);
    expect(result.artifact.sections[0].blocks[0].content).toBe("Approved manual context");
    expect(result.reconciliation.conflicts).toHaveLength(1);
    expect(result.artifact.reconciliationHistory).toHaveLength(1);
  });

  it("requires explicit replacement to remove a manual override", () => {
    const [artifact] = generateDocumentationArtifacts({ project: project(), now: NOW });
    const manual: DocumentationSection = {
      ...artifact.sections[0],
      origin: "manual",
      lockedFromRegeneration: true,
      blocks: [{ id: "manual-block", type: "paragraph", content: "Manual", origin: "manual" }],
    };
    const result = regenerateDocumentationArtifact({ ...artifact, sections: [manual] }, { project: project(), now: LATER }, "explicit_replace");
    expect(result.artifact.sections[0].origin).toBe("generated");
    expect(result.reconciliation.preservedSectionIds).toEqual([]);
  });

  it("projects structured blocks to Markdown", () => {
    const artifact = generateDocumentationArtifacts({ project: project(), now: NOW })[0];
    expect(projectArtifactToMarkdown(artifact)).toContain("# Process Overview");
    expect(projectArtifactToMarkdown(artifact)).toContain("## Overview");
  });
});
