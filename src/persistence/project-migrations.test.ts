import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import { DISCOVERY_SCHEMA_VERSION } from "@/domain/discovery";
import {
  createEmptyDiscoveryState,
  migrateProjectDiscovery,
} from "./project-migrations";

function legacyProject(): Project {
  return {
    id: "legacy-1",
    name: "Legacy Project",
    description: "Existing browser-local project",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
    activities: [
      {
        id: "activity-1",
        applicationName: "SAP",
        adapter: "SAP",
        activityName: "Read invoice",
        activityType: "Application",
        coreSupervised: "core",
        reused: false,
        effort: 4,
        businessException: "",
        assumption: "Access exists",
        rpaTool: "UiPath",
        applicationType: "SAP",
        detailedActivityType: "Read",
        exceptionHandlingComplexity: "Basic",
      },
    ],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
  };
}

describe("project discovery migration", () => {
  it("creates an empty versioned discovery state", () => {
    expect(createEmptyDiscoveryState()).toEqual({
      schemaVersion: DISCOVERY_SCHEMA_VERSION,
      assessments: [],
      processes: [],
      estimationDrafts: [],
      artifacts: [],
      auditEntries: [],
    });
  });

  it("adds discovery without changing legacy project semantics", () => {
    const original = legacyProject();
    const migrated = migrateProjectDiscovery(original);

    expect(migrated).not.toBe(original);
    expect(migrated.id).toBe(original.id);
    expect(migrated.createdAt).toBe(original.createdAt);
    expect(migrated.updatedAt).toBe(original.updatedAt);
    expect(migrated.activities).toBe(original.activities);
    expect(migrated.overheadPercentages).toBe(original.overheadPercentages);
    expect(migrated.discovery).toEqual(createEmptyDiscoveryState());
    expect(original.discovery).toBeUndefined();
  });

  it("is idempotent for a valid current discovery state", () => {
    const migrated = migrateProjectDiscovery(legacyProject());
    expect(migrateProjectDiscovery(migrated)).toBe(migrated);
  });

  it("repairs incomplete discovery collections without discarding valid data", () => {
    const project = legacyProject();
    project.discovery = {
      ...createEmptyDiscoveryState(),
      assessments: undefined as never,
      activeProcessId: "process-1",
    };

    const migrated = migrateProjectDiscovery(project);
    expect(migrated.discovery?.assessments).toEqual([]);
    expect(migrated.discovery?.activeProcessId).toBe("process-1");
  });
});
