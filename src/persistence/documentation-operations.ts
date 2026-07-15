import type { Project } from "@/app/types";
import type {
  DocumentationArtifact,
  DocumentationReconciliation,
} from "@/domain/discovery";
import {
  generateDocumentationArtifacts,
  regenerateDocumentationArtifact,
} from "@/domain/discovery";
import { migrateProjectDiscovery } from "./project-migrations";

export function generateProjectDocumentation(project: Project, now: string): Project {
  const migrated = migrateProjectDiscovery(project);
  const discovery = migrated.discovery!;
  const process =
    discovery.processes.find((item) => item.id === discovery.activeProcessId) ??
    discovery.processes.filter((item) => item.state === "current").at(-1);
  const assessment =
    discovery.assessments.find((item) => item.id === discovery.activeAssessmentId) ??
    discovery.assessments.at(-1);
  const estimationDraft =
    discovery.estimationDrafts.find((item) => item.id === discovery.activeEstimationDraftId) ??
    discovery.estimationDrafts.at(-1);
  const generated = generateDocumentationArtifacts({
    project: migrated,
    process,
    assessment,
    estimationDraft,
    now,
  });
  const existingById = new Map(discovery.artifacts.map((artifact) => [artifact.id, artifact]));
  const artifacts = generated.map((artifact) => {
    const existing = existingById.get(artifact.id);
    return existing
      ? regenerateDocumentationArtifact(existing, { project: migrated, process, assessment, estimationDraft, now }).artifact
      : artifact;
  });

  return {
    ...migrated,
    updatedAt: now,
    discovery: {
      ...discovery,
      artifacts,
      auditEntries: [
        ...discovery.auditEntries,
        ...artifacts.map((artifact) => ({
          id: `audit:artifact_generated:${artifact.id}:${artifact.version}`,
          projectId: migrated.id,
          action: "artifact_generated" as const,
          entityType: "documentation_artifact",
          entityId: artifact.id,
          source: "deterministic" as const,
          metadata: {
            artifactType: artifact.type,
            artifactVersion: artifact.version,
            sourceSnapshotHash: artifact.sourceSnapshotHash,
          },
          createdAt: now,
        })),
      ],
    },
  };
}

export function replaceProjectDocumentationArtifact(
  project: Project,
  artifact: DocumentationArtifact,
  now: string,
): Project {
  const migrated = migrateProjectDiscovery(project);
  const artifacts = migrated.discovery!.artifacts;
  return {
    ...migrated,
    updatedAt: now,
    discovery: {
      ...migrated.discovery!,
      artifacts: artifacts.some((item) => item.id === artifact.id)
        ? artifacts.map((item) => (item.id === artifact.id ? artifact : item))
        : [...artifacts, artifact],
    },
  };
}

export function regenerateProjectDocumentationArtifact(
  project: Project,
  artifactId: string,
  decision: DocumentationReconciliation["decision"],
  now: string,
): Project {
  const migrated = migrateProjectDiscovery(project);
  const discovery = migrated.discovery!;
  const existing = discovery.artifacts.find((item) => item.id === artifactId);
  if (!existing) return migrated;
  const process = discovery.processes.find((item) => item.id === discovery.activeProcessId) ?? discovery.processes.at(-1);
  const assessment = discovery.assessments.find((item) => item.id === discovery.activeAssessmentId) ?? discovery.assessments.at(-1);
  const estimationDraft = discovery.estimationDrafts.find((item) => item.id === discovery.activeEstimationDraftId) ?? discovery.estimationDrafts.at(-1);
  const result = regenerateDocumentationArtifact(existing, {
    project: migrated,
    process,
    assessment,
    estimationDraft,
    now,
  }, decision);
  const replaced = replaceProjectDocumentationArtifact(migrated, result.artifact, now);
  return {
    ...replaced,
    discovery: {
      ...replaced.discovery!,
      auditEntries: [
        ...replaced.discovery!.auditEntries,
        {
          id: `audit:artifact_regenerated:${result.reconciliation.id}`,
          projectId: migrated.id,
          action: "artifact_regenerated",
          entityType: "documentation_artifact",
          entityId: artifactId,
          source: "manual",
          metadata: {
            decision,
            previousVersion: result.reconciliation.previousVersion,
            nextVersion: result.reconciliation.nextVersion,
            conflictCount: result.reconciliation.conflicts.length,
          },
          createdAt: now,
        },
      ],
    },
  };
}
