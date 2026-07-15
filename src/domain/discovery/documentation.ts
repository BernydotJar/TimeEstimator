import type { SourceKind, TraceabilityReference } from "./types";

export type DocumentationArtifactType =
  | "process_overview"
  | "current_state_flow"
  | "future_state_flow"
  | "activity_breakdown"
  | "assumptions_risks"
  | "integration_inventory"
  | "delivery_plan"
  | "estimation_summary";

export interface DocumentationBlock {
  id: string;
  type:
    | "paragraph"
    | "bullet_list"
    | "key_value"
    | "data_table"
    | "metric_group"
    | "flow_reference"
    | "callout"
    | "page_break_hint";
  content: unknown;
  origin?: "generated" | "manual";
  sourceRefs?: TraceabilityReference[];
  generatedAt?: string;
  updatedAt?: string;
  warnings?: string[];
  unknowns?: string[];
  assumptions?: string[];
  manualOverride?: boolean;
}

export interface DocumentationSection {
  id: string;
  title: string;
  order: number;
  origin: "generated" | "manual";
  blocks: DocumentationBlock[];
  sourceRefs: TraceabilityReference[];
  lockedFromRegeneration: boolean;
  generatedAt?: string;
  updatedAt?: string;
  generatorVersion?: string;
  sourceSnapshotHash?: string;
  warnings?: string[];
  unknowns?: string[];
  assumptions?: string[];
}

export interface DocumentationReconciliation {
  id: string;
  artifactId: string;
  previousVersion: number;
  nextVersion: number;
  decision: "preserve_manual" | "accept_generated" | "explicit_replace" | "compare";
  preservedSectionIds: string[];
  replacedSectionIds: string[];
  conflicts: string[];
  decidedAt: string;
}

export interface DocumentationArtifact {
  id: string;
  projectId: string;
  schemaVersion: number;
  version: number;
  type: DocumentationArtifactType;
  title: string;
  status: "draft" | "reviewed" | "stale" | "superseded";
  sourceSnapshotHash: string;
  sections: DocumentationSection[];
  generatedBy: SourceKind;
  generatorVersion?: string;
  warnings?: string[];
  unknowns?: string[];
  assumptions?: string[];
  reconciliationHistory?: DocumentationReconciliation[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportJob {
  id: string;
  projectId: string;
  type: "png_summary" | "print_pdf";
  status: "queued" | "rendering" | "ready" | "failed";
  reportVersion: string;
  startedAt: string;
  completedAt?: string;
  filename?: string;
  errorCode?: string;
}
