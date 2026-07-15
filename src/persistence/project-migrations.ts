import type { Project } from "@/app/types";
import {
  DISCOVERY_SCHEMA_VERSION,
  type ProjectDiscoveryState,
} from "@/domain/discovery";

export function createEmptyDiscoveryState(): ProjectDiscoveryState {
  return {
    schemaVersion: DISCOVERY_SCHEMA_VERSION,
    assessments: [],
    processes: [],
    estimationDrafts: [],
    artifacts: [],
    auditEntries: [],
  };
}

export function migrateProjectDiscovery(project: Project): Project {
  if (
    project.discovery?.schemaVersion === DISCOVERY_SCHEMA_VERSION &&
    Array.isArray(project.discovery.assessments) &&
    Array.isArray(project.discovery.processes) &&
    Array.isArray(project.discovery.estimationDrafts) &&
    Array.isArray(project.discovery.artifacts) &&
    Array.isArray(project.discovery.auditEntries)
  ) {
    return project;
  }

  const existing = project.discovery;
  return {
    ...project,
    discovery: {
      ...createEmptyDiscoveryState(),
      ...existing,
      schemaVersion: DISCOVERY_SCHEMA_VERSION,
      assessments: Array.isArray(existing?.assessments)
        ? existing.assessments
        : [],
      processes: Array.isArray(existing?.processes) ? existing.processes : [],
      estimationDrafts: Array.isArray(existing?.estimationDrafts)
        ? existing.estimationDrafts
        : [],
      artifacts: Array.isArray(existing?.artifacts) ? existing.artifacts : [],
      auditEntries: Array.isArray(existing?.auditEntries)
        ? existing.auditEntries
        : [],
    },
  };
}

export function ensureProjectDiscovery(project: Project): Project {
  return project.discovery ? migrateProjectDiscovery(project) : project;
}
