import type {
  Assumption,
  EvidenceReference,
  SourceKind,
} from "./types";
import type {
  ParsedCandidateReviewState,
  RawProcessInput,
} from "./process-ingestion";

export type ProcessStepType =
  | "start"
  | "task"
  | "user_task"
  | "system_task"
  | "ai_task"
  | "decision"
  | "approval"
  | "integration"
  | "document_processing"
  | "wait"
  | "notification"
  | "exception"
  | "end";

export type ProcessEdgeType =
  | "sequence"
  | "conditional"
  | "exception"
  | "retry"
  | "approval"
  | "rejection"
  | "escalation";

export interface ProcessActor {
  id: string;
  name: string;
  kind: "person" | "role" | "team" | "external_party" | "automation";
  role?: string;
  description?: string;
  notes?: string;
}

export interface ProcessSystem {
  id: string;
  name: string;
  kind:
    | "desktop"
    | "web"
    | "sap"
    | "erp"
    | "crm"
    | "terminal"
    | "database"
    | "api"
    | "file_store"
    | "file_system"
    | "email"
    | "document_repository"
    | "unknown"
    | "other";
  environment?: string;
  authentication?: string;
  accessStatus?: "confirmed" | "partial" | "unknown" | "restricted" | "unavailable";
  notes?: string;
}

export interface DataObjectRef {
  id: string;
  name: string;
  format?: string;
  structured?: boolean;
  containsSensitiveData?: boolean;
}

export interface Quantity {
  value?: number;
  unit: string;
  period?: string;
  state: "known" | "unknown";
}

export interface DecisionDefinition {
  question: string;
  outcomes: Array<{
    id: string;
    label: string;
    condition?: string;
    targetStepId?: string;
  }>;
}

export interface ExceptionDefinition {
  trigger: string;
  handling: string;
  escalation?: string;
  recoverable: boolean;
}

export interface ProcessStepProvenance {
  source: SourceKind;
  rawInputId?: string;
  candidateId?: string;
  parserVersion?: string;
  rawLine?: number;
}

export interface ProcessStep {
  id: string;
  processId: string;
  orderHint: number;
  name: string;
  description?: string;
  type: ProcessStepType;
  actorIds: string[];
  systemIds: string[];
  inputs: DataObjectRef[];
  outputs: DataObjectRef[];
  decision?: DecisionDefinition;
  decisionCondition?: string;
  exception?: ExceptionDefinition;
  exceptionBehavior?: string;
  frequency?: Quantity;
  volume?: Quantity;
  durationMinutes?: number;
  complexity: "unknown" | "basic" | "medium" | "complex";
  automationSuitability:
    | "unknown"
    | "manual"
    | "deterministic"
    | "ai_assisted";
  supervision: "none" | "review" | "approval" | "human_execution";
  dependencyStepIds: string[];
  assumptions: Assumption[];
  evidence: EvidenceReference[];
  notes?: string;
  source: SourceKind;
  provenance?: ProcessStepProvenance;
  confirmedByUser: boolean;
}

export interface ProcessEdge {
  id: string;
  processId: string;
  sourceStepId: string;
  targetStepId: string;
  type: ProcessEdgeType;
  label?: string;
  condition?: string;
  order?: number;
}

export type ProcessValidationCode =
  | "PROCESS_EMPTY"
  | "STEP_NAME_MISSING"
  | "EDGE_SOURCE_MISSING"
  | "EDGE_TARGET_MISSING"
  | "EDGE_DUPLICATE"
  | "EDGE_SELF_LOOP"
  | "START_MISSING"
  | "START_MULTIPLE"
  | "END_MISSING"
  | "ORPHAN_STEP"
  | "UNREACHABLE_STEP"
  | "DECISION_WITHOUT_BRANCH"
  | "CONDITIONAL_EDGE_WITHOUT_CONDITION"
  | "EXCEPTION_WITHOUT_RECOVERY"
  | "ACTOR_REFERENCE_MISSING"
  | "SYSTEM_REFERENCE_MISSING";

export interface ValidationFinding {
  id: string;
  code: ProcessValidationCode | string;
  severity?: "error" | "warning";
  message: string;
  entityId?: string;
  stepIds?: string[];
  edgeIds?: string[];
  suggestedRemediation?: string;
}

export interface ProcessValidationResult {
  valid: boolean;
  errors: ValidationFinding[];
  warnings: ValidationFinding[];
  validatedAt?: string;
  processUpdatedAt?: string;
}

export interface ProcessDefinition {
  id: string;
  projectId: string;
  assessmentId?: string;
  schemaVersion: number;
  version: number;
  name: string;
  description?: string;
  state: "current" | "future";
  status: "draft" | "normalized" | "validated" | "reviewed" | "superseded";
  rawInput?: string;
  rawInputs?: RawProcessInput[];
  candidateReview?: ParsedCandidateReviewState;
  actors: ProcessActor[];
  systems: ProcessSystem[];
  steps: ProcessStep[];
  edges: ProcessEdge[];
  validation: ProcessValidationResult;
  source?: SourceKind;
  createdAt: string;
  updatedAt: string;
}
