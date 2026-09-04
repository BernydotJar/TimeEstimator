import type { Project } from "@/app/types";
import {
  DELIVERY_INTELLIGENCE_SCHEMA_VERSION,
  type DeliveryBaseline,
  type DeliveryTimeObservation,
  type ProjectDeliveryIntelligenceState,
} from "@/domain/delivery-intelligence/types";
import { importGraphHarnessJsonl } from "@/domain/delivery-intelligence/harness-importer";

export function createEmptyDeliveryIntelligenceState(): ProjectDeliveryIntelligenceState {
  return {
    schemaVersion: DELIVERY_INTELLIGENCE_SCHEMA_VERSION,
    harnessImports: [],
    baselines: [],
    timeObservations: [],
  };
}

export function migrateProjectDeliveryIntelligence(project: Project): Project {
  const current = project.deliveryIntelligence;
  if (
    current?.schemaVersion === DELIVERY_INTELLIGENCE_SCHEMA_VERSION &&
    Array.isArray(current.harnessImports) &&
    Array.isArray(current.baselines) &&
    Array.isArray(current.timeObservations)
  ) {
    return project;
  }

  return {
    ...project,
    deliveryIntelligence: {
      ...createEmptyDeliveryIntelligenceState(),
      ...current,
      schemaVersion: DELIVERY_INTELLIGENCE_SCHEMA_VERSION,
      harnessImports: Array.isArray(current?.harnessImports) ? current.harnessImports : [],
      baselines: Array.isArray(current?.baselines) ? current.baselines : [],
      timeObservations: Array.isArray(current?.timeObservations) ? current.timeObservations : [],
    },
  };
}

export function importProjectHarnessLedger(
  project: Project,
  jsonl: string,
  importedAt: string,
  importId: string,
): Project {
  const migrated = migrateProjectDeliveryIntelligence(project);
  const result = importGraphHarnessJsonl(jsonl);
  const state = migrated.deliveryIntelligence ?? createEmptyDeliveryIntelligenceState();

  return {
    ...migrated,
    updatedAt: importedAt,
    deliveryIntelligence: {
      ...state,
      harnessImports: [
        ...state.harnessImports,
        {
          id: importId,
          harnessProjectId: result.projectId,
          importedAt,
          sourceHash: result.sourceHash,
          eventCount: result.events.length,
          events: result.events,
        },
      ],
    },
  };
}

export function addProjectDeliveryBaseline(
  project: Project,
  baseline: DeliveryBaseline,
  updatedAt: string,
): Project {
  const migrated = migrateProjectDeliveryIntelligence(project);
  const state = migrated.deliveryIntelligence ?? createEmptyDeliveryIntelligenceState();
  return {
    ...migrated,
    updatedAt,
    deliveryIntelligence: {
      ...state,
      baselines: [...state.baselines, baseline],
    },
  };
}

export function addProjectTimeObservation(
  project: Project,
  observation: DeliveryTimeObservation,
  updatedAt: string,
): Project {
  const migrated = migrateProjectDeliveryIntelligence(project);
  const state = migrated.deliveryIntelligence ?? createEmptyDeliveryIntelligenceState();
  return {
    ...migrated,
    updatedAt,
    deliveryIntelligence: {
      ...state,
      timeObservations: [...state.timeObservations, observation],
    },
  };
}
