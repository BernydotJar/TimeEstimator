import type { ProcessDefinition, ProcessEdgeType, ProcessStepType } from "./process";
import type { TraceabilityReference } from "./types";
import { renderProcessTextFlow } from "./process-text-flow";

export interface MermaidProjection {
  source: string;
  warnings: string[];
  textualFallback: string;
  sourceRefs: TraceabilityReference[];
}

export interface BpmnBoundaryNode {
  id: string;
  name: string;
  kind: "event" | "task" | "gateway";
  processStepType: ProcessStepType;
  actorIds: string[];
  systemIds: string[];
  sourceRefs: TraceabilityReference[];
}

export interface BpmnBoundaryFlow {
  id: string;
  sourceId: string;
  targetId: string;
  type: ProcessEdgeType;
  label?: string;
  condition?: string;
  sourceRefs: TraceabilityReference[];
}

export interface BpmnExportBoundary {
  schemaVersion: 1;
  processId: string;
  processName: string;
  nodes: BpmnBoundaryNode[];
  sequenceFlows: BpmnBoundaryFlow[];
  lanes: Array<{ id: string; name: string; actorId: string }>;
  extensions: Record<string, unknown>;
  warnings: string[];
}

export function projectProcessToMermaid(process: ProcessDefinition): MermaidProjection {
  const warnings: string[] = [];
  const stepIds = new Set(process.steps.map((step) => step.id));
  const refs: TraceabilityReference[] = [];
  const lines = ["flowchart TD"];

  for (const step of [...process.steps].sort((a, b) => a.orderHint - b.orderHint)) {
    const nodeId = safeNodeId(step.id);
    lines.push(`  ${nodeId}["${escapeMermaid(step.name || "Unnamed step")}"]`);
    refs.push(ref(process.projectId, "process_step", step.id));
  }

  for (const edge of [...process.edges].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id))) {
    const sourceExists = stepIds.has(edge.sourceStepId);
    const targetExists = stepIds.has(edge.targetStepId);
    if (!sourceExists || !targetExists) {
      warnings.push(`Edge ${edge.id} references ${!sourceExists ? "a missing source" : "a missing target"}.`);
      continue;
    }
    const label = edge.label || edge.condition || edge.type;
    lines.push(`  ${safeNodeId(edge.sourceStepId)} -->|"${escapeMermaid(label)}"| ${safeNodeId(edge.targetStepId)}`);
    refs.push(ref(process.projectId, "process_edge", edge.id));
  }

  if (process.steps.length === 0) warnings.push("Process has no structured steps.");
  return {
    source: lines.join("\n"),
    warnings,
    textualFallback: renderProcessTextFlow(process),
    sourceRefs: refs,
  };
}

export function projectProcessToBpmnBoundary(process: ProcessDefinition): BpmnExportBoundary {
  const stepIds = new Set(process.steps.map((step) => step.id));
  const warnings: string[] = [];
  const nodes = process.steps.map((step) => ({
    id: step.id,
    name: step.name,
    kind: bpmnKind(step.type),
    processStepType: step.type,
    actorIds: [...step.actorIds],
    systemIds: [...step.systemIds],
    sourceRefs: [ref(process.projectId, "process_step", step.id)],
  }));
  const sequenceFlows = process.edges.flatMap((edge) => {
    if (!stepIds.has(edge.sourceStepId) || !stepIds.has(edge.targetStepId)) {
      warnings.push(`Flow ${edge.id} omitted because one or more endpoints are missing.`);
      return [];
    }
    return [{
      id: edge.id,
      sourceId: edge.sourceStepId,
      targetId: edge.targetStepId,
      type: edge.type,
      label: edge.label,
      condition: edge.condition,
      sourceRefs: [ref(process.projectId, "process_edge", edge.id)],
    }];
  });

  return {
    schemaVersion: 1,
    processId: process.id,
    processName: process.name,
    nodes,
    sequenceFlows,
    lanes: process.actors.map((actor) => ({ id: `lane:${actor.id}`, name: actor.name, actorId: actor.id })),
    extensions: { systems: process.systems, source: process.source ?? "manual" },
    warnings,
  };
}

function safeNodeId(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9_]/g, "_");
  return `n_${normalized || "unknown"}`;
}

function escapeMermaid(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "&quot;").replace(/\n/g, " ");
}

function bpmnKind(type: ProcessStepType): BpmnBoundaryNode["kind"] {
  if (type === "start" || type === "end") return "event";
  if (type === "decision" || type === "approval") return "gateway";
  return "task";
}

function ref(
  projectId: string,
  targetType: "process_step" | "process_edge",
  targetId: string,
): TraceabilityReference {
  return {
    id: `ref:flow:${targetType}:${targetId}`,
    projectId,
    targetType,
    targetId,
    relation: "derived_from",
  };
}
