import type { Project } from "@/app/types";
import type {
  EstimationDraft,
  GeneratedActivityProposal,
} from "@/domain/discovery";
import {
  applySelectedProposals,
  generateActivityProposalSet,
  previewProposalImpact,
  updateActivityProposal,
} from "@/domain/discovery";
import { migrateProjectDiscovery } from "./project-migrations";

export function generateProjectProposalSet(
  project: Project,
  draftId: string,
  now: string,
): Project {
  const migrated = migrateProjectDiscovery(project);
  const process =
    migrated.discovery?.processes.find(
      (item) => item.id === migrated.discovery?.activeProcessId,
    ) ?? migrated.discovery?.processes.filter((item) => item.state === "current").at(-1);
  if (!process) return migrated;
  const assessment =
    migrated.discovery?.assessments.find(
      (item) => item.id === migrated.discovery?.activeAssessmentId,
    ) ?? migrated.discovery?.assessments.at(-1);
  const draft = generateActivityProposalSet({
    project: migrated,
    process,
    assessment,
    draftId,
    now,
  });
  return {
    ...migrated,
    updatedAt: now,
    discovery: {
      ...migrated.discovery!,
      estimationDrafts: [
        ...migrated.discovery!.estimationDrafts.filter((item) => item.id !== draft.id),
        draft,
      ],
      activeEstimationDraftId: draft.id,
      auditEntries: [
        ...migrated.discovery!.auditEntries,
        {
          id: `audit:proposals_generated:${draft.id}:${draft.version}`,
          projectId: project.id,
          action: "proposals_generated",
          entityType: "estimation_draft",
          entityId: draft.id,
          source: "deterministic",
          metadata: {
            inputSnapshotHash: draft.inputSnapshotHash,
            ruleCatalogVersion: draft.ruleCatalogVersion ?? "unknown",
            proposalCount: draft.proposals.length,
          },
          createdAt: now,
        },
      ],
    },
  };
}

export function replaceProjectEstimationDraft(
  project: Project,
  draft: EstimationDraft,
  now: string,
): Project {
  const migrated = migrateProjectDiscovery(project);
  const drafts = migrated.discovery!.estimationDrafts;
  return {
    ...migrated,
    updatedAt: now,
    discovery: {
      ...migrated.discovery!,
      activeEstimationDraftId: draft.id,
      estimationDrafts: drafts.some((item) => item.id === draft.id)
        ? drafts.map((item) => (item.id === draft.id ? draft : item))
        : [...drafts, draft],
    },
  };
}

export function updateProjectProposal(
  project: Project,
  draftId: string,
  proposalId: string,
  updates: Partial<GeneratedActivityProposal>,
  now: string,
): Project {
  const draft = migrateProjectDiscovery(project).discovery?.estimationDrafts.find(
    (item) => item.id === draftId,
  );
  return draft
    ? replaceProjectEstimationDraft(
        project,
        updateActivityProposal(draft, proposalId, updates, now),
        now,
      )
    : project;
}

export function previewProjectProposalImpact(project: Project, draftId: string) {
  const migrated = migrateProjectDiscovery(project);
  const draft = migrated.discovery?.estimationDrafts.find((item) => item.id === draftId);
  return draft ? previewProposalImpact(migrated, draft) : undefined;
}

export function applyProjectProposals(
  project: Project,
  draftId: string,
  confirmed: boolean,
  now: string,
): { project: Project; warnings: string[] } {
  const migrated = migrateProjectDiscovery(project);
  const draft = migrated.discovery?.estimationDrafts.find((item) => item.id === draftId);
  if (!draft) return { project: migrated, warnings: ["Proposal set not found."] };
  const result = applySelectedProposals(migrated, draft, confirmed, now);
  if (!result.receipt) return { project: result.project, warnings: result.warnings };
  const withDraft = replaceProjectEstimationDraft(result.project, result.draft, now);
  return {
    project: {
      ...withDraft,
      discovery: {
        ...withDraft.discovery!,
        auditEntries: [
          ...withDraft.discovery!.auditEntries,
          {
            id: `audit:proposals_applied:${result.receipt.id}`,
            projectId: project.id,
            action: "proposals_applied",
            entityType: "estimation_draft",
            entityId: draft.id,
            source: "manual",
            metadata: {
              proposalCount: result.receipt.proposalIds.length,
              activityCount: result.receipt.activityIds.length,
              inputSnapshotHash: result.receipt.inputSnapshotHash,
            },
            createdAt: now,
          },
        ],
      },
    },
    warnings: result.warnings,
  };
}
