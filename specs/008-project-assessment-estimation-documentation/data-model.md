# Data Model — 008 Project Discovery & Estimation Studio

## Modeling rules

- Every persisted entity has a stable ID, schema version, project ID, createdAt,
  and updatedAt unless it is an immutable value object.
- Generated data carries provenance and traceability references.
- Manual edits never overwrite source evidence.
- Existing `Project.activities` and `Project.overheadPercentages` remain readable
  and semantically unchanged.
- Optional fields are preferred for backward compatibility.
- All date values are ISO-8601 strings.

## Root extension

```ts
interface ProjectDiscoveryState {
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
```

Recommended initial integration:

```ts
interface Project {
  // existing fields remain unchanged
  discovery?: ProjectDiscoveryState;
}
```

A future envelope may move discovery state outside `Project`, but Feature 008
shall not require destructive conversion.

## Shared types

```ts
type EntityStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "reviewed"
  | "stale"
  | "superseded";

type SourceKind = "observed" | "manual" | "deterministic" | "heuristic" | "n8n";

type ConfidenceBand = "low" | "medium" | "high";
```

## TraceabilityReference

Purpose: common link from a generated/calculated object to its evidence.

```ts
interface TraceabilityReference {
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
```

Required: `id`, `projectId`, `targetType`, `targetId`, `relation`.

Persistence: embedded in owning entities or normalized under discovery state.
Stable across regeneration.

## ProjectAssessment

Purpose: versioned guided discovery record.

```ts
interface ProjectAssessment {
  id: string;
  projectId: string;
  schemaVersion: number;
  version: number;
  title: string;
  status:
    | "not_started"
    | "in_progress"
    | "ready_for_review"
    | "reviewed"
    | "superseded";
  sections: AssessmentSection[];
  completeness: AssessmentCompleteness;
  confidenceSnapshot?: ConfidenceSnapshot;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}
```

Relationships: owns sections; referenced by estimation drafts and artifacts.

## AssessmentSection

Purpose: ordered assessment category.

```ts
interface AssessmentSection {
  id: string;
  assessmentId: string;
  key:
    | "project_overview"
    | "current_state"
    | "process_complexity"
    | "technical_landscape"
    | "ai_automation_suitability"
    | "delivery_governance"
    | "risks_assumptions";
  title: string;
  order: number;
  status: "not_started" | "in_progress" | "complete";
  questions: AssessmentQuestion[];
}
```

## AssessmentQuestion

Purpose: versioned question definition and scoring metadata.

```ts
interface AssessmentQuestion {
  id: string;
  key: string;
  prompt: string;
  helpText?: string;
  answerType:
    | "text"
    | "long_text"
    | "number"
    | "boolean"
    | "single_select"
    | "multi_select"
    | "date"
    | "entity_list";
  requiredForCompletion: boolean;
  highImpact: boolean;
  confidenceDimension?: ConfidenceDimension;
  options?: string[];
  answer?: AssessmentAnswer;
}
```

Question definitions may be shipped in code/config; answers are persisted.
Custom questions, if approved later, use a `custom:` key prefix.

## AssessmentAnswer

Purpose: store explicit value state, evidence, and provenance.

```ts
interface AssessmentAnswer {
  id: string;
  questionId: string;
  state: "unanswered" | "answered" | "unknown" | "not_applicable";
  value?: unknown;
  notes?: string;
  evidence: EvidenceReference[];
  source: "observed" | "manual" | "imported" | "suggested";
  confirmedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}
```

`value` must be absent for `unknown` and `unanswered`.

## EvidenceReference

Purpose: retain the origin of an answer without requiring binary uploads.

```ts
interface EvidenceReference {
  id: string;
  kind: "note" | "url" | "document_name" | "workshop_statement" | "system_observation";
  label: string;
  locator?: string;
  capturedAt: string;
}
```

Binary document ingestion is out of scope for MVP.

## AssessmentCompleteness

```ts
interface AssessmentCompleteness {
  answeredRequired: number;
  totalRequired: number;
  answeredOptional: number;
  totalOptional: number;
  percent: number;
  highImpactUnknownQuestionIds: string[];
}
```

Completion is not confidence.

## ProcessDefinition

Purpose: structured current-state or future-state process source of truth.

```ts
interface ProcessDefinition {
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
```

## ProcessActor

```ts
interface ProcessActor {
  id: string;
  name: string;
  kind: "person" | "role" | "team" | "external_party" | "automation";
  description?: string;
}
```

## ProcessSystem

```ts
interface ProcessSystem {
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
```

## ProcessStep

```ts
interface ProcessStep {
  id: string;
  processId: string;
  orderHint: number;
  name: string;
  description?: string;
  type:
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
  automationSuitability: "unknown" | "manual" | "deterministic" | "ai_assisted";
  supervision: "none" | "review" | "approval" | "human_execution";
  dependencyStepIds: string[];
  assumptions: Assumption[];
  evidence: EvidenceReference[];
  notes?: string;
  source: SourceKind;
  confirmedByUser: boolean;
}
```

## ProcessEdge

```ts
interface ProcessEdge {
  id: string;
  processId: string;
  sourceStepId: string;
  targetStepId: string;
  type: "sequence" | "conditional" | "exception" | "retry" | "escalation";
  label?: string;
  condition?: string;
  order?: number;
}
```

An edge must reference existing steps and may not self-reference unless type is
`retry` and the loop is explicitly documented.

## DecisionDefinition

```ts
interface DecisionDefinition {
  question: string;
  outcomes: Array<{
    id: string;
    label: string;
    condition?: string;
    targetStepId?: string;
  }>;
}
```

## ExceptionDefinition

```ts
interface ExceptionDefinition {
  trigger: string;
  handling: string;
  escalation?: string;
  recoverable: boolean;
}
```

## DataObjectRef

```ts
interface DataObjectRef {
  id: string;
  name: string;
  format?: string;
  structured?: boolean;
  containsSensitiveData?: boolean;
}
```

## Quantity

```ts
interface Quantity {
  value?: number;
  unit: string;
  period?: string;
  state: "known" | "unknown";
}
```

## Assumption

```ts
interface Assumption {
  id: string;
  text: string;
  impact: "low" | "medium" | "high";
  status: "open" | "validated" | "invalidated";
  sourceRefs: TraceabilityReference[];
}
```

## ProcessValidationResult

```ts
interface ProcessValidationResult {
  valid: boolean;
  errors: ValidationFinding[];
  warnings: ValidationFinding[];
  validatedAt?: string;
}
```

Findings cover missing start/end, disconnected nodes, unresolved decisions,
undeclared cycles, missing actors/systems, and duplicate IDs.

## EstimationDraft

Purpose: immutable-input version for proposals and scenarios.

```ts
interface EstimationDraft {
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
```

## EstimationInput

```ts
interface EstimationInput {
  id: string;
  key: string;
  value: unknown;
  state: "known" | "unknown" | "assumed";
  source: SourceKind;
  sourceRefs: TraceabilityReference[];
}
```

## EstimationFactor

```ts
interface EstimationFactor {
  id: string;
  ruleId: string;
  dimension: ComplexityDimension;
  value: number;
  unit: "multiplier" | "hours" | "percentage" | "score";
  appliesToProposalIds: string[];
  rationale: string;
  sourceRefs: TraceabilityReference[];
}
```

## GeneratedActivityProposal

```ts
interface GeneratedActivityProposal {
  id: string;
  draftId: string;
  version: number;
  status: "proposed" | "edited" | "included" | "excluded" | "applied" | "superseded";
  originStepIds: string[];
  activity: Omit<Activity, "id">;
  phase: DeliveryPhase;
  workType: WorkType;
  baseEffortHours: number;
  factorIds: string[];
  calculatedEffortHours: number;
  overheadPolicy: "included_in_base" | "project_overhead" | "excluded";
  rationale: string;
  confidence: ConfidenceBand;
  assumptions: Assumption[];
  source: SourceKind;
  sourceRefs: TraceabilityReference[];
  appliedActivityId?: string;
}
```

The nested activity uses the existing shape for compatibility.

## EstimateScenario

```ts
interface EstimateScenario {
  id: string;
  draftId: string;
  kind: "optimistic" | "expected" | "conservative";
  proposalEffortHours: number;
  overheadHours: Record<OverheadKey, number>;
  adjustmentHours: number;
  totalHours: number;
  parameterSnapshot: Record<string, number>;
  breakdownByPhase: Record<DeliveryPhase, number>;
  breakdownByWorkType: Record<WorkType, number>;
  coreHours: number;
  supervisedHours: number;
  rationale: string[];
  sourceRefs: TraceabilityReference[];
}
```

## ManualAdjustment

```ts
interface ManualAdjustment {
  id: string;
  label: string;
  hours: number;
  scenarioKinds: Array<"optimistic" | "expected" | "conservative">;
  rationale: string;
  createdAt: string;
}
```

Manual adjustments are explicit and never folded invisibly into factors.

## ConfidenceSnapshot

```ts
interface ConfidenceSnapshot {
  score: number;
  band: ConfidenceBand;
  dimensions: ConfidenceDimensionScore[];
  highImpactUnknownIds: string[];
  rationale: string[];
  calculatedAt: string;
}
```

## ConfidenceDimensionScore

```ts
interface ConfidenceDimensionScore {
  dimension: ConfidenceDimension;
  score: number;
  weight: number;
  evidenceCount: number;
  unknownCount: number;
  rationale: string;
}
```

## ComplexityDimension

```ts
type ComplexityDimension =
  | "step_count"
  | "decision_count"
  | "exception_count"
  | "system_count"
  | "integration_count"
  | "document_complexity"
  | "data_complexity"
  | "volume"
  | "frequency"
  | "security"
  | "environment"
  | "ai_uncertainty"
  | "uat_change";
```

## DeliveryPhase

```ts
type DeliveryPhase =
  | "discovery"
  | "business_analysis"
  | "process_design"
  | "architecture"
  | "ux_ui"
  | "implementation"
  | "integration"
  | "data_ai"
  | "security"
  | "testing"
  | "uat"
  | "deployment"
  | "documentation"
  | "training"
  | "stabilization";
```

## WorkType

```ts
type WorkType =
  | "analysis"
  | "design"
  | "development"
  | "configuration"
  | "integration"
  | "data"
  | "ai"
  | "quality"
  | "delivery"
  | "documentation";
```

## DocumentationArtifact

Purpose: structured generated/manual document draft.

```ts
interface DocumentationArtifact {
  id: string;
  projectId: string;
  schemaVersion: number;
  version: number;
  type:
    | "process_overview"
    | "current_state_flow"
    | "future_state_flow"
    | "activity_breakdown"
    | "assumptions_risks"
    | "integration_inventory"
    | "delivery_plan"
    | "estimation_summary";
  title: string;
  status: "draft" | "reviewed" | "stale" | "superseded";
  sourceSnapshotHash: string;
  sections: DocumentationSection[];
  generatedBy: SourceKind;
  createdAt: string;
  updatedAt: string;
}
```

## DocumentationSection

```ts
interface DocumentationSection {
  id: string;
  title: string;
  order: number;
  origin: "generated" | "manual";
  blocks: DocumentationBlock[];
  sourceRefs: TraceabilityReference[];
  lockedFromRegeneration: boolean;
}
```

Blocks may be paragraph, bullet list, key-value table, data table, flow reference,
callout, metric group, or page break hint.

## ExportJob

Purpose: local transient export state; persistence is optional and bounded.

```ts
interface ExportJob {
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
```

Do not persist generated binary content in localStorage.

## AuditEntry

```ts
interface AuditEntry {
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
```

## Versioning policy

- Root `schemaVersion` changes when persisted shape changes incompatibly.
- Entity `version` increments for meaningful content regeneration/review.
- Applied proposals and reviewed artifacts are not mutated in place; create a new
  version and supersede the previous record.
- Stable entity IDs identify conceptual objects; version IDs or version numbers
  identify snapshots.
- Migration functions are ordered, pure where possible, and idempotent.

## Backward compatibility

Legacy project:

```ts
{
  id,
  name,
  description,
  createdAt,
  updatedAt,
  activities,
  overheadPercentages
}
```

shall be interpreted as:

```ts
{
  ...legacyProject,
  discovery: undefined
}
```

Opening discovery initializes defaults in memory. Existing activities are treated
as manual/legacy activities. They are not assigned fabricated process origins.
A documentation artifact may state that traceability is unavailable for legacy
activities until manually linked.
