import type { Project } from "@/app/types";
import {
  PROCESS_PARSER_VERSION,
  createCurrentStateProcess,
  detectProcessFormat,
  normalizeReviewedCandidates,
  parseRawProcessInput,
  validateAndMarkProcess,
  type ParsedCandidateReviewState,
  type ProcessDefinition,
  type RawProcessInput,
} from "@/domain/discovery";
import { migrateProjectDiscovery } from "./project-migrations";

export function createProjectCurrentStateProcess(
  project: Project,
  processId: string,
  now: string,
): { project: Project; process: ProcessDefinition } {
  const migrated = migrateProjectDiscovery(project);
  const existingCurrent = migrated.discovery?.processes.find((item) => item.state === "current" && item.status !== "superseded");
  if (existingCurrent) {
    return {
      process: existingCurrent,
      project: {
        ...migrated,
        discovery: { ...migrated.discovery!, activeProcessId: existingCurrent.id },
      },
    };
  }

  const process = createCurrentStateProcess(project.id, processId, now);
  return {
    process,
    project: {
      ...migrated,
      updatedAt: now,
      discovery: {
        ...migrated.discovery!,
        processes: [...migrated.discovery!.processes, process],
        activeProcessId: process.id,
      },
    },
  };
}

export function getActiveProjectProcess(project: Project): ProcessDefinition | undefined {
  const discovery = project.discovery;
  if (!discovery) return undefined;
  return discovery.processes.find((item) => item.id === discovery.activeProcessId)
    ?? discovery.processes.filter((item) => item.state === "current").at(-1);
}

export function setProjectActiveProcess(project: Project, processId: string, now: string): Project {
  const migrated = migrateProjectDiscovery(project);
  if (!migrated.discovery?.processes.some((item) => item.id === processId)) return migrated;
  return { ...migrated, updatedAt: now, discovery: { ...migrated.discovery, activeProcessId: processId } };
}

export function replaceProjectProcess(project: Project, process: ProcessDefinition, now: string): Project {
  const migrated = migrateProjectDiscovery(project);
  const exists = migrated.discovery!.processes.some((item) => item.id === process.id);
  return {
    ...migrated,
    updatedAt: now,
    discovery: {
      ...migrated.discovery!,
      activeProcessId: process.id,
      processes: exists
        ? migrated.discovery!.processes.map((item) => item.id === process.id ? process : item)
        : [...migrated.discovery!.processes, process],
    },
  };
}

export function saveProjectRawProcessInput(
  project: Project,
  processId: string,
  input: RawProcessInput,
  now: string,
): Project {
  const migrated = migrateProjectDiscovery(project);
  const process = migrated.discovery!.processes.find((item) => item.id === processId);
  if (!process) return migrated;
  const rawInputs = process.rawInputs ?? [];
  const exists = rawInputs.some((item) => item.id === input.id);
  const nextInput = { ...input, updatedAt: now };
  const nextProcess: ProcessDefinition = {
    ...process,
    rawInput: input.content,
    rawInputs: exists ? rawInputs.map((item) => item.id === input.id ? nextInput : item) : [...rawInputs, nextInput],
    candidateReview: process.candidateReview ? { ...process.candidateReview, stale: true } : process.candidateReview,
    updatedAt: now,
  };
  return replaceProjectProcess(migrated, nextProcess, now);
}

export function parseProjectRawProcessInput(
  project: Project,
  processId: string,
  rawInputId: string,
  now: string,
): Project {
  const migrated = migrateProjectDiscovery(project);
  const process = migrated.discovery!.processes.find((item) => item.id === processId);
  const input = process?.rawInputs?.find((item) => item.id === rawInputId);
  if (!process || !input) return migrated;
  const detection = detectProcessFormat(input.content);
  const review: ParsedCandidateReviewState = {
    rawInputId,
    parserVersion: PROCESS_PARSER_VERSION,
    parsedAt: now,
    stale: false,
    candidates: parseRawProcessInput({ ...input, format: detection.format }).map((candidate) => ({
      ...candidate,
      included: true,
      confirmedByUser: false,
    })),
  };
  const nextProcess: ProcessDefinition = {
    ...process,
    rawInputs: process.rawInputs!.map((item) => item.id === input.id ? { ...item, format: detection.format, source: "deterministic", updatedAt: now } : item),
    candidateReview: review,
    updatedAt: now,
  };
  const withAudit = replaceProjectProcess(migrated, nextProcess, now);
  return appendAuditOnce(withAudit, {
    id: `audit:process_imported:${process.id}:${rawInputId}:${now}`,
    projectId: project.id,
    action: "process_imported",
    entityType: "process",
    entityId: process.id,
    source: "deterministic",
    metadata: { rawInputId, parserVersion: PROCESS_PARSER_VERSION, candidateCount: review.candidates.length },
    createdAt: now,
  });
}

export function updateProjectCandidateReview(
  project: Project,
  processId: string,
  review: ParsedCandidateReviewState,
  now: string,
): Project {
  const process = getProcess(project, processId);
  if (!process) return migrateProjectDiscovery(project);
  return replaceProjectProcess(project, { ...process, candidateReview: review, updatedAt: now }, now);
}

export function normalizeProjectProcess(project: Project, processId: string, now: string): Project {
  const process = getProcess(project, processId);
  if (!process?.candidateReview) return migrateProjectDiscovery(project);
  const normalized = normalizeReviewedCandidates(process, process.candidateReview.candidates, now);
  return replaceProjectProcess(project, normalized, now);
}

export function validateProjectProcess(project: Project, processId: string, now: string): Project {
  const process = getProcess(project, processId);
  if (!process) return migrateProjectDiscovery(project);
  const validated = validateAndMarkProcess(process, now);
  const replaced = replaceProjectProcess(project, validated, now);
  return appendAuditOnce(replaced, {
    id: `audit:process_validated:${process.id}:${process.updatedAt}`,
    projectId: project.id,
    action: "process_validated",
    entityType: "process",
    entityId: process.id,
    source: "deterministic",
    metadata: {
      valid: validated.validation.valid,
      errors: validated.validation.errors.length,
      warnings: validated.validation.warnings.length,
    },
    createdAt: now,
  });
}

function getProcess(project: Project, processId: string): ProcessDefinition | undefined {
  return migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
}

function appendAuditOnce(project: Project, entry: NonNullable<Project["discovery"]>["auditEntries"][number]): Project {
  const migrated = migrateProjectDiscovery(project);
  if (migrated.discovery!.auditEntries.some((item) => item.id === entry.id)) return migrated;
  return {
    ...migrated,
    discovery: {
      ...migrated.discovery!,
      auditEntries: [...migrated.discovery!.auditEntries, entry],
    },
  };
}
