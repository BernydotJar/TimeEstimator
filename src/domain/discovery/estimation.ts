import type { Activity, OverheadKey } from "@/app/types";
import type { ConfidenceSnapshot } from "./assessment";
import type {
  Assumption,
  SourceKind,
  TraceabilityReference,
} from "./types";

export type ScenarioKind = "optimistic" | "expected" | "conservative";

export interface EstimationInput {
  id: string;
  key: string;
  value: unknown;
  state: "known" | "unknown" | "assumed";
  source: SourceKind;
  sourceRefs: TraceabilityReference[];
}

export interface EstimationFactor {
  id: string;
  ruleId: string;
  dimension: string;
  value: number;
  unit: "multiplier" | "hours" | "percentage" | "score";
  appliesToProposalIds: string[];
  rationale: string;
  sourceRefs: TraceabilityReference[];
}

export interface GeneratedActivityProposal {
  id: string;
  draftId: string;
  version: number;
  status:
    | "proposed"
    | "edited"
    | "included"
    | "excluded"
    | "applied"
    | "superseded";
  originStepIds: string[];
  activity: Omit<Activity, "id">;
  baseEffortHours: number;
  factorIds: string[];
  calculatedEffortHours: number;
  overheadPolicy: "included_in_base" | "project_overhead" | "excluded";
  rationale: string;
  confidence: "low" | "medium" | "high";
  assumptions: Assumption[];
  source: SourceKind;
  sourceRefs: TraceabilityReference[];
  appliedActivityId?: string;
}

export interface ManualAdjustment {
  id: string;
  label: string;
  hours: number;
  scenarioKinds: ScenarioKind[];
  rationale: string;
  createdAt: string;
}

export interface EstimateScenario {
  id: string;
  draftId: string;
  kind: ScenarioKind;
  proposalEffortHours: number;
  overheadHours: Record<OverheadKey, number>;
  adjustmentHours: number;
  totalHours: number;
  parameterSnapshot: Record<string, number>;
  breakdownByPhase: Record<string, number>;
  breakdownByWorkType: Record<string, number>;
  coreHours: number;
  supervisedHours: number;
  rationale: string[];
  sourceRefs: TraceabilityReference[];
}

export interface EstimationDraft {
  id: string;
  projectId: string;
  assessmentId?: string;
  processId?: string;
  schemaVersion: number;
  version: number;
  status: "draft" | "reviewed" | "applied" | "superseded";
  inputSnapshotHash: string;
  inputs: EstimationInput[];
  factors: EstimationFactor[];
  proposals: GeneratedActivityProposal[];
  scenarios: EstimateScenario[];
  adjustments: ManualAdjustment[];
  confidence: ConfidenceSnapshot;
  createdAt: string;
  updatedAt: string;
}
