import type { Project } from "@/app/types";
import type { ProjectAssessment } from "./assessment";
import type {
  DocumentationArtifact,
  DocumentationArtifactType,
  DocumentationBlock,
  DocumentationReconciliation,
  DocumentationSection,
} from "./documentation";
import type { EstimationDraft } from "./estimation";
import { projectProcessToMermaid } from "./flow-projection";
import type { ProcessDefinition } from "./process";
import type { TraceabilityReference } from "./types";

export const DOCUMENTATION_GENERATOR_VERSION = "1.0.0";

export interface DocumentationGenerationInput {
  project: Project;
  process?: ProcessDefinition;
  assessment?: ProjectAssessment;
  estimationDraft?: EstimationDraft;
  now: string;
}

export interface DocumentationRegenerationResult {
  artifact: DocumentationArtifact;
  reconciliation: DocumentationReconciliation;
}

const TITLES: Record<DocumentationArtifactType, string> = {
  process_overview: "Process Overview",
  current_state_flow: "Current-State Flow",
  future_state_flow: "Proposed Future-State Flow",
  activity_breakdown: "Activity Breakdown",
  assumptions_risks: "Assumptions and Risks",
  integration_inventory: "Integration Inventory",
  delivery_plan: "Initial Delivery Plan",
  estimation_summary: "Estimation Summary",
};

export function generateDocumentationArtifacts(input: DocumentationGenerationInput): DocumentationArtifact[] {
  const snapshotHash = documentationSnapshotHash(input);
  return (Object.keys(TITLES) as DocumentationArtifactType[]).map((type) =>
    createArtifact(type, input, snapshotHash),
  );
}

export function regenerateDocumentationArtifact(
  existing: DocumentationArtifact,
  input: DocumentationGenerationInput,
  decision: DocumentationReconciliation["decision"] = "preserve_manual",
): DocumentationRegenerationResult {
  const generated = createArtifact(existing.type, input, documentationSnapshotHash(input));
  const manual = existing.sections.filter(
    (section) => section.origin === "manual" || section.lockedFromRegeneration,
  );
  const conflicts = manual
    .filter((section) => generated.sections.some((candidate) => candidate.id === section.id))
    .map((section) => `Generated section ${section.id} conflicts with a preserved manual section.`);
  const preserve = decision !== "explicit_replace";
  const sections = preserve
    ? [
        ...generated.sections.filter((section) => !manual.some((item) => item.id === section.id)),
        ...manual,
      ].sort((a, b) => a.order - b.order)
    : generated.sections;
  const reconciliation: DocumentationReconciliation = {
    id: `reconciliation:${existing.id}:${existing.version + 1}`,
    artifactId: existing.id,
    previousVersion: existing.version,
    nextVersion: existing.version + 1,
    decision,
    preservedSectionIds: preserve ? manual.map((section) => section.id) : [],
    replacedSectionIds: generated.sections.map((section) => section.id),
    conflicts,
    decidedAt: input.now,
  };
  return {
    artifact: {
      ...generated,
      id: existing.id,
      version: existing.version + 1,
      createdAt: existing.createdAt,
      sections,
      warnings: [...(generated.warnings ?? []), ...conflicts],
      reconciliationHistory: [...(existing.reconciliationHistory ?? []), reconciliation],
    },
    reconciliation,
  };
}

export function projectArtifactToMarkdown(artifact: DocumentationArtifact): string {
  const lines = [`# ${artifact.title}`, ""];
  for (const section of [...artifact.sections].sort((a, b) => a.order - b.order)) {
    lines.push(`## ${section.title}`, "");
    for (const block of section.blocks) lines.push(blockToMarkdown(block), "");
  }
  return lines.join("\n").trim();
}

export function documentationSnapshotHash(input: DocumentationGenerationInput): string {
  return stableHash(JSON.stringify({
    project: { id: input.project.id, name: input.project.name, description: input.project.description },
    process: input.process ? {
      id: input.process.id,
      version: input.process.version,
      steps: input.process.steps,
      edges: input.process.edges,
      actors: input.process.actors,
      systems: input.process.systems,
    } : null,
    assessment: input.assessment ? { id: input.assessment.id, version: input.assessment.version, sections: input.assessment.sections } : null,
    estimation: input.estimationDraft ? {
      id: input.estimationDraft.id,
      version: input.estimationDraft.version,
      proposals: input.estimationDraft.proposals,
      scenarios: input.estimationDraft.scenarios,
      adjustments: input.estimationDraft.adjustments,
    } : null,
    generatorVersion: DOCUMENTATION_GENERATOR_VERSION,
  }));
}

function createArtifact(
  type: DocumentationArtifactType,
  input: DocumentationGenerationInput,
  snapshotHash: string,
): DocumentationArtifact {
  const sections = buildSections(type, input, snapshotHash);
  const unknowns = collectUnknowns(input);
  return {
    id: `artifact:${input.project.id}:${type}`,
    projectId: input.project.id,
    schemaVersion: 1,
    version: 1,
    type,
    title: TITLES[type],
    status: "draft",
    sourceSnapshotHash: snapshotHash,
    sections,
    generatedBy: "deterministic",
    generatorVersion: DOCUMENTATION_GENERATOR_VERSION,
    warnings: sections.flatMap((section) => section.warnings ?? []),
    unknowns,
    assumptions: collectAssumptions(input),
    reconciliationHistory: [],
    createdAt: input.now,
    updatedAt: input.now,
  };
}

function buildSections(
  type: DocumentationArtifactType,
  input: DocumentationGenerationInput,
  snapshotHash: string,
): DocumentationSection[] {
  const process = input.process;
  const draft = input.estimationDraft;
  const flow = process ? projectProcessToMermaid(process) : undefined;
  const processRefs = process?.steps.map((step) => ref(input.project.id, "process_step", step.id)) ?? [];
  const proposalRefs = draft?.proposals.map((proposal) => ref(input.project.id, "activity_proposal", proposal.id)) ?? [];
  const base = (id: string, title: string, order: number, blocks: DocumentationBlock[], refs: TraceabilityReference[] = []): DocumentationSection => ({
    id: `section:${type}:${id}`,
    title,
    order,
    origin: "generated",
    blocks,
    sourceRefs: refs,
    lockedFromRegeneration: false,
    generatedAt: input.now,
    updatedAt: input.now,
    generatorVersion: DOCUMENTATION_GENERATOR_VERSION,
    sourceSnapshotHash: snapshotHash,
  });

  switch (type) {
    case "process_overview":
      return [base("summary", "Overview", 1, [paragraph(`Project: ${input.project.name}. ${input.project.description || "Objective is unknown."}`), bullets([
        `Process: ${process?.name ?? "Unknown"}`,
        `Steps: ${process?.steps.length ?? 0}`,
        `Actors: ${process?.actors.length ?? 0}`,
        `Systems: ${process?.systems.length ?? 0}`,
      ])], processRefs)];
    case "current_state_flow":
      return [base("flow", "Structured Flow", 1, [flowBlock(flow?.source ?? "flowchart TD", flow?.textualFallback ?? "No current-state process is available.")], flow?.sourceRefs ?? [])];
    case "future_state_flow":
      return [base("future", "Proposed Flow", 1, [paragraph("Future-state flow remains a draft derived from reviewed activity proposals. No unreviewed optimization is asserted."), bullets(draft?.proposals.filter((item) => item.included !== false).map((item) => item.activity.activityName) ?? ["No reviewed proposals available."])], proposalRefs)];
    case "activity_breakdown":
      return [base("activities", "Activities", 1, [table(["Activity", "Effort", "Mode", "Status"], (draft?.proposals ?? []).map((item) => [item.activity.activityName, item.calculatedEffortHours, item.activity.coreSupervised, item.status]))], proposalRefs)];
    case "assumptions_risks":
      return [base("assumptions", "Assumptions and Unknowns", 1, [bullets([...collectAssumptions(input).map((item) => `Assumption: ${item}`), ...collectUnknowns(input).map((item) => `Unknown: ${item}`)])], [...processRefs, ...proposalRefs])];
    case "integration_inventory":
      return [base("integrations", "Systems and Integrations", 1, [table(["System", "Kind", "Access"], (process?.systems ?? []).map((system) => [system.name, system.kind, system.accessStatus ?? "unknown"]))], processRefs)];
    case "delivery_plan":
      return [base("plan", "Initial Plan", 1, [bullets(unique((draft?.proposals ?? []).map((proposal) => proposal.deliveryPhase ?? "phase unknown")))], proposalRefs)];
    case "estimation_summary":
      return [base("estimate", "Draft Estimate", 1, [metrics({
        "Proposal effort": sum((draft?.proposals ?? []).filter((item) => item.included !== false).map((item) => item.calculatedEffortHours)),
        "Approved activities": sum(input.project.activities.map((activity) => Number(activity.effort))),
        "Scenarios": draft?.scenarios.length ?? 0,
      }), paragraph(draft?.scenarios.length ? "Scenario drafts are available for review." : "Scenario calculation is not yet available; no range is asserted.")], proposalRefs)];
  }
}

function collectUnknowns(input: DocumentationGenerationInput): string[] {
  const unknowns = input.estimationDraft?.proposals.flatMap((proposal) => proposal.unknowns ?? []) ?? [];
  if (!input.process) unknowns.push("current-state process");
  if (!input.assessment) unknowns.push("assessment");
  return unique(unknowns);
}

function collectAssumptions(input: DocumentationGenerationInput): string[] {
  return unique([
    ...(input.process?.steps.flatMap((step) => step.assumptions.map((item) => item.text)) ?? []),
    ...(input.estimationDraft?.proposals.flatMap((proposal) => proposal.assumptions.map((item) => item.text)) ?? []),
  ]);
}

function paragraph(content: string): DocumentationBlock {
  return { id: `block:${stableHash(content)}`, type: "paragraph", content, origin: "generated" };
}
function bullets(content: string[]): DocumentationBlock {
  const values = content.length ? content : ["Unknown"];
  return { id: `block:${stableHash(JSON.stringify(values))}`, type: "bullet_list", content: values, origin: "generated" };
}
function table(headers: string[], rows: unknown[][]): DocumentationBlock {
  return { id: `block:${stableHash(JSON.stringify({ headers, rows }))}`, type: "data_table", content: { headers, rows }, origin: "generated" };
}
function metrics(content: Record<string, number>): DocumentationBlock {
  return { id: `block:${stableHash(JSON.stringify(content))}`, type: "metric_group", content, origin: "generated" };
}
function flowBlock(mermaid: string, text: string): DocumentationBlock {
  return { id: `block:${stableHash(mermaid)}`, type: "flow_reference", content: { mermaid, text }, origin: "generated" };
}
function blockToMarkdown(block: DocumentationBlock): string {
  if (block.type === "paragraph" || block.type === "callout") return String(block.content);
  if (block.type === "bullet_list") return (block.content as string[]).map((item) => `- ${item}`).join("\n");
  if (block.type === "metric_group") return Object.entries(block.content as Record<string, number>).map(([key, value]) => `- **${key}:** ${value}`).join("\n");
  if (block.type === "data_table") {
    const { headers, rows } = block.content as { headers: string[]; rows: unknown[][] };
    return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
  }
  if (block.type === "flow_reference") {
    const value = block.content as { mermaid: string; text: string };
    return `\`\`\`mermaid\n${value.mermaid}\n\`\`\`\n\n${value.text}`;
  }
  return "";
}
function ref(projectId: string, targetType: TraceabilityReference["targetType"], targetId: string): TraceabilityReference {
  return { id: `ref:doc:${targetType}:${targetId}`, projectId, targetType, targetId, relation: "derived_from" };
}
function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
function unique(values: string[]): string[] { return [...new Set(values.filter(Boolean))]; }
function sum(values: number[]): number { return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0); }
