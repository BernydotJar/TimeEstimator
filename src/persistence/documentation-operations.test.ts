import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import { createEmptyDiscoveryState } from "./project-migrations";
import {
  generateProjectDocumentation,
  regenerateProjectDocumentationArtifact,
  replaceProjectDocumentationArtifact,
} from "./documentation-operations";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function project(): Project {
  return {
    id: "project-1",
    name: "Documentation Test",
    description: "",
    createdAt: NOW,
    updatedAt: NOW,
    activities: [],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
    discovery: createEmptyDiscoveryState(),
  };
}

describe("documentation persistence", () => {
  it("persists eight artifacts and audit records without changing activities", () => {
    const result = generateProjectDocumentation(project(), NOW);
    expect(result.discovery?.artifacts).toHaveLength(8);
    expect(result.discovery?.auditEntries.filter((entry) => entry.action === "artifact_generated")).toHaveLength(8);
    expect(result.activities).toHaveLength(0);
  });

  it("preserves manual sections during regeneration", () => {
    let result = generateProjectDocumentation(project(), NOW);
    const artifact = result.discovery!.artifacts[0];
    result = replaceProjectDocumentationArtifact(result, {
      ...artifact,
      sections: [{
        id: artifact.sections[0].id,
        title: "Manual overview",
        order: 1,
        origin: "manual",
        blocks: [{ id: "manual-block", type: "paragraph", content: "Reviewed context", origin: "manual" }],
        sourceRefs: [],
        lockedFromRegeneration: true,
      }],
    }, LATER);

    result = regenerateProjectDocumentationArtifact(result, artifact.id, "preserve_manual", LATER);
    const regenerated = result.discovery!.artifacts.find((item) => item.id === artifact.id)!;
    expect(regenerated.version).toBe(2);
    expect(regenerated.sections[0].blocks[0].content).toBe("Reviewed context");
    expect(regenerated.reconciliationHistory).toHaveLength(1);
    expect(result.discovery?.auditEntries.at(-1)?.action).toBe("artifact_regenerated");
  });

  it("requires an explicit replacement decision to discard manual sections", () => {
    let result = generateProjectDocumentation(project(), NOW);
    const artifact = result.discovery!.artifacts[0];
    result = replaceProjectDocumentationArtifact(result, {
      ...artifact,
      sections: [{
        ...artifact.sections[0],
        origin: "manual",
        lockedFromRegeneration: true,
        blocks: [{ id: "manual-block", type: "paragraph", content: "Manual", origin: "manual" }],
      }],
    }, LATER);
    result = regenerateProjectDocumentationArtifact(result, artifact.id, "explicit_replace", LATER);
    expect(result.discovery!.artifacts[0].sections[0].origin).toBe("generated");
  });
});
