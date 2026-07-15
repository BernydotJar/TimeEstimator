import type { Project } from "@/app/types";
import { createAssessment, markAssessmentReadyForReview, type ProjectAssessment } from "@/domain/discovery";
import { migrateProjectDiscovery } from "./project-migrations";

export function createProjectAssessment(project: Project, assessmentId: string, now: string): { project: Project; assessment: ProjectAssessment } {
  const migrated = migrateProjectDiscovery(project);
  const existing = migrated.discovery?.assessments.find((item) => item.id === assessmentId);
  if (existing) return { project: migrated, assessment: existing };
  const assessment = createAssessment(project.id, assessmentId, now);
  return {
    assessment,
    project: {
      ...migrated,
      updatedAt: now,
      discovery: {
        ...migrated.discovery!,
        assessments: [...migrated.discovery!.assessments, assessment],
        activeAssessmentId: assessment.id,
        auditEntries: [
          ...migrated.discovery!.auditEntries,
          { id: `audit:${assessment.id}`, projectId: project.id, action: "assessment_created", entityType: "assessment", entityId: assessment.id, source: "manual", metadata: {}, createdAt: now },
        ],
      },
    },
  };
}

export function replaceProjectAssessment(project: Project, assessment: ProjectAssessment, now: string): Project {
  const migrated = migrateProjectDiscovery(project);
  return {
    ...migrated,
    updatedAt: now,
    discovery: {
      ...migrated.discovery!,
      activeAssessmentId: assessment.id,
      assessments: migrated.discovery!.assessments.map((item) => item.id === assessment.id ? assessment : item),
    },
  };
}

export function setProjectAssessmentActive(project: Project, assessmentId: string, now: string): Project {
  const migrated = migrateProjectDiscovery(project);
  if (!migrated.discovery?.assessments.some((item) => item.id === assessmentId)) return migrated;
  return { ...migrated, updatedAt: now, discovery: { ...migrated.discovery, activeAssessmentId: assessmentId } };
}

export function readyProjectAssessment(project: Project, assessmentId: string, now: string): Project {
  const migrated = migrateProjectDiscovery(project);
  const current = migrated.discovery?.assessments.find((item) => item.id === assessmentId);
  if (!current) return migrated;
  const ready = markAssessmentReadyForReview(current, now);
  return replaceProjectAssessment(migrated, ready, now);
}

export function getActiveProjectAssessment(project: Project): ProjectAssessment | undefined {
  const discovery = project.discovery;
  if (!discovery) return undefined;
  return discovery.assessments.find((item) => item.id === discovery.activeAssessmentId) ?? discovery.assessments.at(-1);
}
