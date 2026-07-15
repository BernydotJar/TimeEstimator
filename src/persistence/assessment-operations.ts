import type { Project } from "@/app/types";
import { createAssessment, markAssessmentReadyForReview, type ProjectAssessment } from "@/domain/discovery";
import { migrateProjectDiscovery } from "./project-migrations";

export function createProjectAssessment(
  project: Project,
  assessmentId: string,
  now: string,
): { project: Project; assessment: ProjectAssessment } {
  const migrated = migrateProject