import type {
  Assumption,
  EvidenceReference,
  SourceKind,
} from "./types";

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

export interface ProcessActor {
  id: string;
  name: string;
  kind: "person" | "role" | "team" | "external_party" | "automation";
  description?: string;
}

export interface ProcessSystem {
  id: string;
  name: string;
  kind:
    | "desktop"
    | "web"
    | "sap"
    | "terminal"
    | "database"
    | "api"
    | "file_store"
    | "email"
    | "other";
  environment?: string;
  authentication?: string;
  accessStatus?: "confirmed" | "unknown" | "restricted";
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
  exception?: ExceptionDefinition;
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
  confirmedByUser: boolean;
}

export interface ProcessEdge {
  id: string;
  processId: string;
  sourceStepId: string;
  targetStepId: string;
  type: "sequence" | "conditional" | "exception" | "retry" | "escalation";
  label?: string;
  condition?: string;
  order?: number;
}

export interface ValidationFinding {
  id: string;
  code: string;
  message: string;
  entityId?: string;
}

export interface ProcessValidationResult {
  valid: boolean;
  errors: ValidationFinding[];
  warnings: ValidationFinding[];
  validatedAt?: string;
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
  actors: ProcessActor[];
  systems: ProcessSystem[];
  steps: ProcessStep[];
  edges: ProcessEdge[];
  validation: ProcessValidationResult;
  createdAt: string;
  updatedAt: string;
}
