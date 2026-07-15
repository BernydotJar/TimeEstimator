import { DISCOVERY_SCHEMA_VERSION } from "./types";
import type {
  ProcessActor,
  ProcessDefinition,
  ProcessEdge,
  ProcessStep,
  ProcessSystem,
} from "./process";
import type { ReviewedStepCandidate } from "./process-ingestion";
import { validateProcess } from "./process-validation";

export interface ProcessMutationResult {
  process: ProcessDefinition;
  warnings: string[];
  removedEdgeIds?: string[];
}

export function createCurrentStateProcess(
  projectId: string,
  processId: string,
  now: string,
  name = "Current-State Process",
): ProcessDefinition {
  return {
    id: processId,
    projectId,
    schemaVersion: DISCOVERY_SCHEMA_VERSION,
    version: 1,
    name,
    state: "current",
    status: "draft",
    actors: [],
    systems: [],
    steps: [],
    edges: [],
    validation: { valid: false, errors: [], warnings: [] },
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeReviewedCandidates(
  process: ProcessDefinition,
  candidates: ReviewedStepCandidate[],
  now: string,
): ProcessDefinition {
  const included = candidates.filter((candidate) => candidate.included);
  const steps: ProcessStep[] = included.map((candidate, index) => ({
    id: stableStepId(process.id, candidate.id),
    processId: process.id,
    orderHint: index + 1,
    name: candidate.suggestedName.trim(),
    description: candidate.suggestedDescription,
    type: candidate.suggestedType,
    actorIds: [],
    systemIds: [],
    inputs: [],
    outputs: [],
    decisionCondition: candidate.decisionCondition,
    decision: candidate.suggestedType === "decision"
      ? { question: candidate.decisionCondition ?? candidate.suggestedName, outcomes: [] }
      : undefined,
    complexity: "unknown",
    automationSuitability: "unknown",
    supervision: "human_execution",
    dependencyStepIds: [],
    assumptions: [],
    evidence: [],
    source: "deterministic",
    provenance: {
      source: "deterministic",
      rawInputId: candidate.provenance.rawInputId,
      candidateId: candidate.id,
      parserVersion: candidate.provenance.parserVersion,
      rawLine: candidate.provenance.rawLine,
    },
    confirmedByUser: candidate.confirmedByUser,
  }));

  return invalidateProcess({
    ...process,
    version: process.version + 1,
    status: "normalized",
    steps,
    edges: [],
    candidateReview: process.candidateReview
      ? { ...process.candidateReview, stale: false, candidates }
      : process.candidateReview,
    updatedAt: now,
  });
}

export function addProcessStep(process: ProcessDefinition, step: ProcessStep, now: string): ProcessDefinition {
  return invalidateProcess({
    ...process,
    status: process.steps.length === 0 ? "draft" : "normalized",
    steps: [...process.steps, { ...step, processId: process.id }],
    updatedAt: now,
  });
}

export function updateProcessStep(
  process: ProcessDefinition,
  stepId: string,
  updates: Partial<Omit<ProcessStep, "id" | "processId">>,
  now: string,
): ProcessDefinition {
  return invalidateProcess({
    ...process,
    status: "normalized",
    steps: process.steps.map((step) => step.id === stepId ? { ...step, ...updates } : step),
    updatedAt: now,
  });
}

export function reorderProcessSteps(process: ProcessDefinition, orderedIds: string[], now: string): ProcessDefinition {
  const order = new Map(orderedIds.map((id, index) => [id, index + 1]));
  const steps = process.steps
    .map((step) => ({ ...step, orderHint: order.get(step.id) ?? step.orderHint }))
    .sort((a, b) => a.orderHint - b.orderHint);
  return invalidateProcess({ ...process, status: "normalized", steps, updatedAt: now });
}

export function removeProcessStep(
  process: ProcessDefinition,
  stepId: string,
  now: string,
  removeDependentEdges = false,
): ProcessMutationResult {
  const dependentEdges = process.edges.filter((edge) => edge.sourceStepId === stepId || edge.targetStepId === stepId);
  if (dependentEdges.length > 0 && !removeDependentEdges) {
    return {
      process,
      warnings: ["The step is connected. Remove or explicitly cascade its dependent edges first."],
    };
  }
  const removedEdgeIds = dependentEdges.map((edge) => edge.id);
  return {
    process: invalidateProcess({
      ...process,
      status: "normalized",
      steps: process.steps.filter((step) => step.id !== stepId),
      edges: process.edges.filter((edge) => !removedEdgeIds.includes(edge.id)),
      updatedAt: now,
    }),
    warnings: removedEdgeIds.length > 0 ? [`Removed ${removedEdgeIds.length} dependent edge(s).`] : [],
    removedEdgeIds,
  };
}

export function addProcessEdge(process: ProcessDefinition, edge: ProcessEdge, now: string): ProcessMutationResult {
  const warnings = edgeWarnings(process, edge);
  if (warnings.some((warning) => warning.startsWith("Missing"))) return { process, warnings };
  if (process.edges.some((item) => sameEdge(item, edge))) {
    return { process, warnings: [...warnings, "Duplicate edge was not added."] };
  }
  return {
    process: invalidateProcess({
      ...process,
      status: "normalized",
      edges: [...process.edges, { ...edge, processId: process.id }],
      updatedAt: now,
    }),
    warnings,
  };
}

export function updateProcessEdge(
  process: ProcessDefinition,
  edgeId: string,
  updates: Partial<Omit<ProcessEdge, "id" | "processId">>,
  now: string,
): ProcessMutationResult {
  const current = process.edges.find((edge) => edge.id === edgeId);
  if (!current) return { process, warnings: ["Edge not found."] };
  const next = { ...current, ...updates };
  const warnings = edgeWarnings(process, next);
  if (warnings.some((warning) => warning.startsWith("Missing"))) return { process, warnings };
  return {
    process: invalidateProcess({
      ...process,
      status: "normalized",
      edges: process.edges.map((edge) => edge.id === edgeId ? next : edge),
      updatedAt: now,
    }),
    warnings,
  };
}

export function removeProcessEdge(process: ProcessDefinition, edgeId: string, now: string): ProcessDefinition {
  return invalidateProcess({
    ...process,
    status: "normalized",
    edges: process.edges.filter((edge) => edge.id !== edgeId),
    updatedAt: now,
  });
}

export function connectLinearSteps(process: ProcessDefinition, now: string): ProcessMutationResult {
  const ordered = [...process.steps].sort((a, b) => a.orderHint - b.orderHint);
  const additions: ProcessEdge[] = [];
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const source = ordered[index];
    const target = ordered[index + 1];
    const candidate: ProcessEdge = {
      id: `edge:${process.id}:${source.id}:${target.id}`,
      processId: process.id,
      sourceStepId: source.id,
      targetStepId: target.id,
      type: "sequence",
      order: index + 1,
    };
    if (!process.edges.some((edge) => sameEdge(edge, candidate))) additions.push(candidate);
  }
  if (additions.length === 0) return { process, warnings: ["No new linear edges were required."] };
  return {
    process: invalidateProcess({
      ...process,
      status: "normalized",
      edges: [...process.edges, ...additions],
      updatedAt: now,
    }),
    warnings: [`Added ${additions.length} linear edge(s) without changing existing branches.`],
  };
}

export function addProcessActor(process: ProcessDefinition, actor: ProcessActor, now: string): ProcessDefinition {
  return invalidateProcess({ ...process, actors: [...process.actors, actor], updatedAt: now });
}

export function updateProcessActor(process: ProcessDefinition, actorId: string, updates: Partial<Omit<ProcessActor, "id">>, now: string): ProcessDefinition {
  return invalidateProcess({ ...process, actors: process.actors.map((actor) => actor.id === actorId ? { ...actor, ...updates } : actor), updatedAt: now });
}

export function removeProcessActor(process: ProcessDefinition, actorId: string, now: string): ProcessMutationResult {
  const references = process.steps.filter((step) => step.actorIds.includes(actorId));
  if (references.length > 0) return { process, warnings: [`Actor is referenced by ${references.length} step(s).`] };
  return { process: invalidateProcess({ ...process, actors: process.actors.filter((actor) => actor.id !== actorId), updatedAt: now }), warnings: [] };
}

export function addProcessSystem(process: ProcessDefinition, system: ProcessSystem, now: string): ProcessDefinition {
  return invalidateProcess({ ...process, systems: [...process.systems, system], updatedAt: now });
}

export function updateProcessSystem(process: ProcessDefinition, systemId: string, updates: Partial<Omit<ProcessSystem, "id">>, now: string): ProcessDefinition {
  return invalidateProcess({ ...process, systems: process.systems.map((system) => system.id === systemId ? { ...system, ...updates } : system), updatedAt: now });
}

export function removeProcessSystem(process: ProcessDefinition, systemId: string, now: string): ProcessMutationResult {
  const references = process.steps.filter((step) => step.systemIds.includes(systemId));
  if (references.length > 0) return { process, warnings: [`System is referenced by ${references.length} step(s).`] };
  return { process: invalidateProcess({ ...process, systems: process.systems.filter((system) => system.id !== systemId), updatedAt: now }), warnings: [] };
}

export function setProcessStatus(process: ProcessDefinition, status: ProcessDefinition["status"], now: string): ProcessDefinition {
  if (status === "reviewed") return process;
  return { ...process, status, updatedAt: now };
}

export function validateAndMarkProcess(process: ProcessDefinition, now: string): ProcessDefinition {
  const validation = validateProcess(process, now);
  return {
    ...process,
    status: validation.valid ? "validated" : process.steps.length > 0 ? "normalized" : "draft",
    validation,
    updatedAt: now,
  };
}

function invalidateProcess(process: ProcessDefinition): ProcessDefinition {
  if (!process.validation.valid && !process.validation.validatedAt) return process;
  return {
    ...process,
    validation: {
      valid: false,
      errors: [],
      warnings: [],
      processUpdatedAt: process.updatedAt,
    },
  };
}

function edgeWarnings(process: ProcessDefinition, edge: ProcessEdge): string[] {
  const warnings: string[] = [];
  if (!process.steps.some((step) => step.id === edge.sourceStepId)) warnings.push("Missing edge source step.");
  if (!process.steps.some((step) => step.id === edge.targetStepId)) warnings.push("Missing edge target step.");
  if (edge.sourceStepId === edge.targetStepId) warnings.push("Self-loop requires explicit review.");
  return warnings;
}

function sameEdge(a: ProcessEdge, b: ProcessEdge): boolean {
  return a.sourceStepId === b.sourceStepId && a.targetStepId === b.targetStepId && a.type === b.type && (a.condition ?? "") === (b.condition ?? "");
}

function stableStepId(processId: string, candidateId: string): string {
  const safe = candidateId.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(-48);
  return `step:${processId}:${safe}`;
}
