export const DISCOVERY_SCHEMA_VERSION = 1;

export type SourceKind =
  | "observed"
  | "manual"
  | "deterministic"
  | "heuristic"
  | "n8n";

export type ConfidenceBand = "low" | "medium" | "high";

export type ConfidenceDimension =
  | "scope_clarity"
  | "process_coverage"
  | "decisions_exceptions"
  | "systems_integrations"
  | "data_documents"
  | "volume_frequency"
  | "security_access"
  | "testing_uat"
  | "dependencies";

export interface TraceabilityReference {
  id: string;
  projectId: string;
  targetType:
    | "assessment_answer"
    | "process_step"
    | "process_edge"
    | "assumption"
    | "rule"
    | "estimation_factor"
    | "activity_proposal"
    | "project_activity"
    | "manual_adjustment"
    | "overhead"
    | "documentation_artifact";
  targetId: string;
  relation:
    | "derived_from"
    | "supports"
    | "contradicts"
    | "depends_on"
    | "applied_as"
    | "summarizes";
  label?: string;
}

export interface EvidenceReference {
  id: string;
  kind:
    | "note"
    | "url"
    | "document_name"
    | "workshop_statement"
    | "system_observation";
  label: string;
  locator?: string;
  capturedAt: string;
}

export interface Assumption {
  id: string;
  text: string;
  impact: "low" | "medium" | "high";
  status: "open" | "validated" | "invalidated";
  sourceRefs: TraceabilityReference[];
}

export interface AuditEntry {
  id: string;
  projectId: string;
  action:
    | "assessment_created"
    | "assessment_reviewed"
    | "process_imported"
    | "process_validated"
    | "proposals_generated"
    | "proposals_applied"
    | "scenario_calculated"
    | "artifact_generated"
    | "artifact_regenerated"
    | "migration_completed"
    | "migration_failed"
    | "export_completed"
    | "export_failed";
  entityType: string;
  entityId: string;
  source: SourceKind;
  metadata: Record<string, string | number | boolean>;
  createdAt: string;
}
