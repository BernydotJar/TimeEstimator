export const DELIVERY_INTELLIGENCE_SCHEMA_VERSION =
  "time-estimator.delivery-intelligence.v1" as const;

export const GRAPH_HARNESS_EVENT_SCHEMA_VERSION =
  "graph-harness.event.v1" as const;

export const GRAPH_HARNESS_EVENT_TYPES = [
  "approval.recorded",
  "evidence.recorded",
  "gate.evaluated",
  "node.transitioned",
  "failure.recorded",
  "node.invalidated",
  "repair.plan_created",
  "checkpoint.recorded",
] as const;

export type GraphHarnessEventType =
  (typeof GRAPH_HARNESS_EVENT_TYPES)[number];

export type ObservationProvenance =
  | "MEASURED"
  | "MANUAL"
  | "IMPORTED"
  | "INFERRED"
  | "UNKNOWN";

export type DeliveryTimeCategory =
  | "HUMAN_TOUCH"
  | "AGENT_RUNTIME"
  | "VERIFICATION"
  | "REPAIR"
  | "WAIT"
  | "BLOCKED";

export type DeliveryComparisonClass =
  | "MEASURED_CURRENT"
  | "HISTORICAL_COMPARISON"
  | "MATCHED_BASELINE"
  | "PAIRED_BENCHMARK"
  | "CONTROLLED_COMPARISON"
  | "CAUSAL_NOT_ESTABLISHED";

export type ComparisonLevel = "LOW" | "MEDIUM" | "HIGH";
export type QualityEquivalence = "PASS" | "FAIL" | "UNKNOWN";
export type ScopeVariance = ComparisonLevel | "UNKNOWN";

export interface GraphHarnessEventV1 {
  schema_version: typeof GRAPH_HARNESS_EVENT_SCHEMA_VERSION;
  event_id: string;
  sequence: number;
  occurred_at: string;
  project_id: string;
  event_type: GraphHarnessEventType;
  node_id: string | null;
  node_revision: number | null;
  actor: string;
  payload: Record<string, unknown>;
  previous_event_hash: string;
  event_hash: string;
}

export interface ImportedHarnessEvent {
  raw: string;
  normalized: GraphHarnessEventV1;
}

export interface HarnessImportSnapshot {
  id: string;
  harnessProjectId: string;
  importedAt: string;
  sourceHash: string;
  eventCount: number;
  events: ImportedHarnessEvent[];
}

export interface HarnessImportResult {
  projectId: string;
  sourceHash: string;
  events: ImportedHarnessEvent[];
}

export interface DeliveryTimeObservation {
  id: string;
  category: DeliveryTimeCategory;
  projectId: string;
  nodeId?: string;
  nodeRevision?: number;
  startedAt?: string;
  endedAt?: string;
  durationHours?: number;
  provenance: ObservationProvenance;
  sourceRef?: string;
  note?: string;
}

export interface DeliveryBaseline {
  id: string;
  projectId: string;
  nodeId?: string;
  plannedHours?: number;
  plannedCalendarHours?: number;
  baselineHumanHours?: number;
  comparisonClass: DeliveryComparisonClass;
  baselineSource: string;
  sampleSize: number;
  taskComparability: ComparisonLevel;
  qualityEquivalence: QualityEquivalence;
  scopeVariance: ScopeVariance;
  confidence: ComparisonLevel;
}

export interface ProjectDeliveryIntelligenceState {
  schemaVersion: typeof DELIVERY_INTELLIGENCE_SCHEMA_VERSION;
  harnessImports: HarnessImportSnapshot[];
  baselines: DeliveryBaseline[];
  timeObservations: DeliveryTimeObservation[];
}

export interface TimeInterval {
  startedAt: string;
  endedAt?: string;
}

export interface GateEventSummary {
  eventId: string;
  gateId: string;
  result: "PASS" | "FAIL" | "UNKNOWN";
  occurredAt: string;
}

export interface NodeLifecycle {
  nodeId: string;
  revision: number;
  specReadyAt?: string;
  approvedAt?: string;
  readyAt?: string;
  runningAt?: string;
  reviewAt?: string;
  doneAt?: string;
  blockedIntervals: TimeInterval[];
  repairIntervals: TimeInterval[];
  gateEvents: GateEventSummary[];
  evidenceEventIds: string[];
  failureEventIds: string[];
  invalidatedEventIds: string[];
  repairTransitionEventIds: string[];
  runningIntervals: TimeInterval[];
}

export interface DeliveryComparisonResult {
  baselineAvailable: boolean;
  validComparableBaseline: boolean;
  observedHumanEffortLeverage?: number;
  causalAiAccelerationEstablished: boolean;
  causalAiAccelerationFactor?: number;
  reason: string;
}

export interface DeliveryMeasurementSummary {
  harnessProjectId?: string;
  importedEventCount: number;
  nodeLifecycles: NodeLifecycle[];
  elapsedCalendarHours?: number;
  activeCycleHours?: number;
  blockedCalendarHours: number;
  repairCalendarHours: number;
  actualHumanTouchHours?: number;
  inferredHumanTouchHours: number;
  agentRuntimeHours: number;
  verificationHours: number;
  repairTouchHours: number;
  waitHours: number;
  observedBlockedHours: number;
  plannedHours?: number;
  plannedCalendarHours?: number;
  effortVariancePct?: number;
  scheduleVariancePct?: number;
  gateFailureCount: number;
  firstPassGateYield?: number;
  repairLoopCount: number;
  verifiedNodesCompleted: number;
  verifiedDeliveryUnits: number;
  verifiedDeliveryUnitsPerHumanHour?: number;
  deliveryThroughputPerCalendarDay?: number;
  comparison: DeliveryComparisonResult;
}

export interface DeliveryMeasurementInput {
  events: ImportedHarnessEvent[];
  baseline?: DeliveryBaseline;
  timeObservations?: DeliveryTimeObservation[];
}

export interface DeliveryIntelligenceViewModel {
  stages: Array<{
    id: "plan" | "build" | "verify" | "learn";
    label: string;
    complete: boolean;
    detail: string;
  }>;
  baseline: {
    plannedHours?: number;
    plannedCalendarHours?: number;
  };
  actual: {
    humanTouchHours?: number;
    agentRuntimeHours: number;
    elapsedCalendarHours?: number;
    blockedCalendarHours: number;
    repairCalendarHours: number;
    repairTouchHours: number;
    verificationHours: number;
    waitHours: number;
  };
  quality: {
    verifiedDeliveryUnits: number;
    firstPassGateYield?: number;
    repairLoopCount: number;
    gateFailureCount: number;
  };
  variance: {
    effortVariancePct?: number;
    scheduleVariancePct?: number;
  };
  comparison: DeliveryComparisonResult;
  evidence: {
    harnessProjectId?: string;
    eventCount: number;
  };
}
