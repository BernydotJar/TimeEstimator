import type { Activity, Project } from "@/app/types";
import type { ProjectAssessment } from "./assessment";
import type {
  EstimationDraft,
  GeneratedActivityProposal,
  ProposalActivityMapping,
  ProposalApplyReceipt,
} from "./estimation";
import type { ProcessDefinition, ProcessStep, ProcessStepType } from "./process";
import {
  DISCOVERY_SCHEMA_VERSION,
  type TraceabilityReference,
} from "./types";

export const PROPOSAL_RULE_CATALOG_VERSION = "1.0.0";

interface RuleDefinition {
  ruleId: string;
  phase: string;
  category: string;
  coreSupervised: "core" | "supervised";
}

const RULES: Record<ProcessStepType, RuleDefinition> = {
  start: { ruleId: "STEP-BOUNDARY-001", phase: "process_design", category: "orchestration", coreSupervised: "core" },
  end: { ruleId: "STEP-BOUNDARY-001", phase: "process_design", category: "orchestration", coreSupervised: "core" },
  task: { ruleId: "STEP-TASK-001", phase: "implementation", category: "process_implementation", coreSupervised: "core" },
  user_task: { ruleId: "STEP-USER-001", phase: "implementation", category: "human_interaction", coreSupervised: "supervised" },
  system_task: { ruleId: "STEP-SYSTEM-001", phase: "implementation", category: "system_automation", coreSupervised: "core" },
  ai_task: { ruleId: "STEP-AI-HITL-001", phase: "data_ai", category: "ai_behavior", coreSupervised: "supervised" },
  decision: { ruleId: "STEP-DECISION-001", phase: "process_design", category: "business_rules", coreSupervised: "core" },
  approval: { ruleId: "STEP-APPROVAL-001", phase: "implementation", category: "human_approval", coreSupervised: "supervised" },
  integration: { ruleId: "STEP-INTEGRATION-001", phase: "integration", category: "integration", coreSupervised: "core" },
  document_processing: { ruleId: "STEP-DOCUMENT-001", phase: "data_ai", category: "document_processing", coreSupervised: "supervised" },
  wait: { ruleId: "STEP-WAIT-001", phase: "implementation", category: "scheduling", coreSupervised: "core" },
  notification: { ruleId: "STEP-NOTIFICATION-001", phase: "integration", category: "notification", coreSupervised: "core" },
  exception: { ruleId: "STEP-EXCEPTION-001", phase: "testing", category: "exception_handling", coreSupervised: "core" },
};

export interface ProposalGenerationInput {
  project: Project;
  process: ProcessDefinition;
  assessment?: ProjectAssessment;
  draftId: string;
  now: string;
}

export interface ProposalPreview {
  selectedCount: number;
  addedEffort: number;
  currentBase: number;
  proposedBase: number;
  currentGrandTotal: number;
  proposedGrandTotal: number;
}

export interface ApplyProposalResult {
  project: Project;
  draft: EstimationDraft;
  receipt?: ProposalApplyReceipt;
  warnings: string[];
}

export function generateActivityProposalSet(input: ProposalGenerationInput): EstimationDraft {
  const ordered = [...input.process.steps].sort((a, b) => a.orderHint - b.orderHint);
  const snapshot = {
    processId: input.process.id,
    processVersion: input.process.version,
    steps: ordered.map((step) => ({
      id: step.id,
      type: step.type,
      name: step.name,
      actorIds: step.actorIds,
      systemIds: step.systemIds,
      supervision: step.supervision,
      source: step.source,
    })),
    assessment: assessmentSnapshot(input.assessment),
    ruleCatalogVersion: PROPOSAL_RULE_CATALOG_VERSION,
  };
  const proposals = groupSteps(ordered).map((steps) => proposalFromSteps(input, steps));
  return {
    id: input.draftId,
    projectId: input.project.id,
    assessmentId: input.assessment?.id,
    processId: input.process.id,
    schemaVersion: DISCOVERY_SCHEMA_VERSION,
    version: 1,
    status: "draft",
    inputSnapshotHash: stableHash(JSON.stringify(snapshot)),
    ruleCatalogVersion: PROPOSAL_RULE_CATALOG_VERSION,
    inputs: assessmentInputs(input.project.id, input.assessment),
    factors: [],
    proposals,
    scenarios: [],
    adjustments: [],
    confidence: input.assessment?.confidenceSnapshot ?? {
      score: 0,
      band: "low",
      dimensions: [],
      highImpactUnknownIds: [],
      rationale: ["Confidence policy is outside Phase 4A."],
      calculatedAt: input.now,
    },
    mappings: [],
    applyReceipts: [],
    warnings: proposals.length === 0 ? ["No structured steps are available for proposal generation."] : [],
    source: "deterministic",
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function updateActivityProposal(
  draft: EstimationDraft,
  proposalId: string,
  updates: Partial<GeneratedActivityProposal>,
  now: string,
): EstimationDraft {
  return {
    ...draft,
    proposals: draft.proposals.map((proposal) =>
      proposal.id === proposalId
        ? { ...proposal, ...updates, status: "edited", updatedAt: now }
        : proposal,
    ),
    updatedAt: now,
  };
}

export function previewProposalImpact(project: Project, draft: EstimationDraft): ProposalPreview {
  const selected = draft.proposals.filter(
    (proposal) => proposal.included && proposal.selected && proposal.status !== "applied",
  );
  const currentBase = project.activities.reduce((sum, activity) => sum + finite(activity.effort), 0);
  const addedEffort = selected.reduce(
    (sum, proposal) => sum + finite(proposal.calculatedEffortHours),
    0,
  );
  const overheadRate = Object.values(project.overheadPercentages).reduce(
    (sum, value) => sum + finite(value),
    0,
  );
  return {
    selectedCount: selected.length,
    addedEffort,
    currentBase,
    proposedBase: currentBase + addedEffort,
    currentGrandTotal: currentBase * (1 + overheadRate),
    proposedGrandTotal: (currentBase + addedEffort) * (1 + overheadRate),
  };
}

export function applySelectedProposals(
  project: Project,
  draft: EstimationDraft,
  confirmed: boolean,
  now: string,
): ApplyProposalResult {
  if (!confirmed) {
    return { project, draft, warnings: ["Explicit confirmation is required before applying proposals."] };
  }
  if (
    draft.applyReceipts?.some(
      (receipt) =>
        receipt.proposalSetVersion === draft.version &&
        receipt.inputSnapshotHash === draft.inputSnapshotHash,
    )
  ) {
    return { project, draft, warnings: ["This proposal set version was already applied."] };
  }
  const selected = draft.proposals.filter(
    (proposal) => proposal.included && proposal.selected && proposal.status !== "applied",
  );
  if (selected.length === 0) {
    return { project, draft, warnings: ["Select at least one unapplied proposal."] };
  }

  const mappings: ProposalActivityMapping[] = [];
  const additions: Activity[] = selected.map((proposal) => {
    const activityId = `activity:${stableHash(`${draft.id}:${draft.version}:${proposal.id}`)}`;
    mappings.push({
      id: `mapping:${proposal.id}:${activityId}`,
      proposalId: proposal.id,
      activityId,
      appliedAt: now,
      sourceRefs: proposal.sourceRefs,
    });
    return {
      id: activityId,
      ...proposal.activity,
      effort: finite(proposal.calculatedEffortHours),
    };
  });
  const receipt: ProposalApplyReceipt = {
    id: `receipt:${draft.id}:${draft.version}:${stableHash(now)}`,
    projectId: project.id,
    draftId: draft.id,
    proposalSetVersion: draft.version,
    inputSnapshotHash: draft.inputSnapshotHash,
    proposalIds: selected.map((proposal) => proposal.id),
    activityIds: additions.map((activity) => activity.id),
    confirmed: true,
    appliedAt: now,
  };

  return {
    project: {
      ...project,
      activities: [...project.activities, ...additions],
      updatedAt: now,
    },
    draft: {
      ...draft,
      status: "applied",
      proposals: draft.proposals.map((proposal) => {
        const mapping = mappings.find((item) => item.proposalId === proposal.id);
        return mapping
          ? { ...proposal, status: "applied", appliedActivityId: mapping.activityId, updatedAt: now }
          : proposal;
      }),
      mappings: [...(draft.mappings ?? []), ...mappings],
      applyReceipts: [...(draft.applyReceipts ?? []), receipt],
      updatedAt: now,
    },
    receipt,
    warnings: [],
  };
}

function proposalFromSteps(
  input: ProposalGenerationInput,
  steps: ProcessStep[],
): GeneratedActivityProposal {
  const primary = steps[0];
  const rule = RULES[primary.type];
  const originStepIds = steps.map((step) => step.id);
  const proposalId = `proposal:${stableHash(
    `${input.process.id}:${rule.ruleId}:${originStepIds.join("|")}`,
  )}`;
  const unknowns: string[] = [];
  if (steps.every((step) => step.actorIds.length === 0)) unknowns.push("actor");
  if (steps.every((step) => step.systemIds.length === 0)) unknowns.push("system");
  const sourceRefs: TraceabilityReference[] = originStepIds.map((stepId) => ({
    id: `ref:${proposalId}:${stepId}`,
    projectId: input.project.id,
    targetType: "process_step",
    targetId: stepId,
    relation: "derived_from",
  }));

  return {
    id: proposalId,
    draftId: input.draftId,
    version: 1,
    status: "proposed",
    originStepIds,
    activity: {
      applicationName: "",
      adapter: "",
      activityName:
        steps.length === 1
          ? primary.name
          : `${primary.name} + ${steps.length - 1} related step(s)`,
      activityType: rule.category,
      coreSupervised: rule.coreSupervised,
      reused: false,
      effort: 0,
      businessException: "",
      assumption: "",
      rpaTool: "",
      applicationType: "",
      detailedActivityType: rule.phase,
      exceptionHandlingComplexity: "",
    },
    baseEffortHours: 0,
    factorIds: [],
    calculatedEffortHours: 0,
    overheadPolicy: "project_overhead",
    rationale: `Rule ${rule.ruleId} mapped ${steps.length} traceable process step(s) without inventing effort.`,
    confidence: "low",
    assumptions: [],
    unknowns,
    exclusions: [],
    warnings: ["Effort requires explicit user review."],
    deliveryPhase: rule.phase,
    category: rule.category,
    ruleIds: [rule.ruleId],
    observedInputs: originStepIds,
    included: true,
    selected: false,
    reviewed: false,
    source: "deterministic",
    sourceRefs,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

function groupSteps(steps: ProcessStep[]): ProcessStep[][] {
  const groups: ProcessStep[][] = [];
  for (const step of steps) {
    if (step.type === "start" || step.type === "end") continue;
    const current = groups.at(-1);
    if (current && canGroup(current.at(-1)!, step)) current.push(step);
    else groups.push([step]);
  }
  return groups;
}

function canGroup(a: ProcessStep, b: ProcessStep): boolean {
  const hardBoundary = new Set<ProcessStepType>([
    "decision",
    "exception",
    "approval",
    "integration",
    "ai_task",
  ]);
  return (
    !hardBoundary.has(a.type) &&
    !hardBoundary.has(b.type) &&
    a.type === b.type &&
    same(a.actorIds, b.actorIds) &&
    same(a.systemIds, b.systemIds) &&
    a.supervision === b.supervision
  );
}

function same(a: string[], b: string[]): boolean {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function finite(value: number): number {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function assessmentSnapshot(assessment?: ProjectAssessment) {
  return (
    assessment?.sections.flatMap((section) =>
      section.questions.map((question) => ({
        id: question.id,
        state: question.answer?.state ?? "unanswered",
        value: question.answer?.value ?? null,
      })),
    ) ?? []
  );
}

function assessmentInputs(projectId: string, assessment?: ProjectAssessment) {
  return (
    assessment?.sections.flatMap((section) =>
      section.questions.map((question) => ({
        id: `input:${question.id}`,
        key: question.key,
        value: question.answer?.value,
        state:
          question.answer?.state === "unknown" || question.answer?.state === "unanswered"
            ? ("unknown" as const)
            : ("known" as const),
        source:
          question.answer?.source === "observed"
            ? ("observed" as const)
            : ("manual" as const),
        sourceRefs: [
          {
            id: `ref:input:${question.id}`,
            projectId,
            targetType: "assessment_answer" as const,
            targetId: question.answer?.id ?? question.id,
            relation: "derived_from" as const,
            label: question.prompt,
          },
        ],
      })),
    ) ?? []
  );
}
