export * from "./types";
export * from "./assessment";
export * from "./assessment-catalog";
export * from "./assessment-service";
export * from "./process";
export * from "./process-ingestion";
export * from "./process-parser";
export * from "./process-service";
export * from "./process-validation";
export * from "./process-text-flow";
export * from "./estimation";
export * from "./proposal-service";
export * from "./documentation";

import type { ProjectAssessment } from "./assessment";
import type { DocumentationArtifact } from "./documentation";
import type { EstimationDraft } from "./estimation";
import type { ProcessDefinition } from "./process";
import type { AuditEntry } from "./types";

export interface ProjectDiscoveryState {
  schemaVersion: number;
  assessments: ProjectAssessment[];
  processes: ProcessDefinition[];
  estimationDrafts: EstimationDraft[];
  artifacts: DocumentationArtifact[];
  auditEntries: AuditEntry[];
  activeAssessmentId?: string;
  activeProcessId?: string;
  activeEstimationDraftId?: string;
}
