import type {
  DeliveryIntelligenceViewModel,
  ProjectDeliveryIntelligenceState,
} from "./types";
import { measureDelivery } from "./measurement-engine";

export function buildDeliveryIntelligenceViewModel(
  state: ProjectDeliveryIntelligenceState | undefined,
): DeliveryIntelligenceViewModel {
  const latestImport = state?.harnessImports.at(-1);
  const latestBaseline = state?.baselines.at(-1);
  const measurement = measureDelivery({
    events: latestImport?.events ?? [],
    baseline: latestBaseline,
    timeObservations: state?.timeObservations ?? [],
  });

  return {
    stages: [
      {
        id: "plan",
        label: "Plan",
        complete: Boolean(latestBaseline),
        detail: latestBaseline
          ? "A versioned delivery baseline is recorded."
          : "Record the expected effort and calendar baseline.",
      },
      {
        id: "build",
        label: "Build",
        complete: Boolean(latestImport),
        detail: latestImport
          ? `${latestImport.eventCount} execution events imported with raw evidence preserved.`
          : "Import Graph Harness execution evidence.",
      },
      {
        id: "verify",
        label: "Verify",
        complete: measurement.verifiedDeliveryUnits > 0,
        detail:
          measurement.verifiedDeliveryUnits > 0
            ? `${measurement.verifiedDeliveryUnits} verified delivery unit(s) passed evidence-backed gates.`
            : "Verified work appears only after evidence-backed gates pass.",
      },
      {
        id: "learn",
        label: "Learn",
        complete:
          latestBaseline !== undefined &&
          measurement.actualHumanTouchHours !== undefined,
        detail:
          latestBaseline && measurement.actualHumanTouchHours !== undefined
            ? "Estimate-versus-actual variance is available for calibration."
            : "Add actual human touch observations to calibrate future estimates.",
      },
    ],
    baseline: {
      plannedHours: measurement.plannedHours,
      plannedCalendarHours: measurement.plannedCalendarHours,
    },
    actual: {
      humanTouchHours: measurement.actualHumanTouchHours,
      agentRuntimeHours: measurement.agentRuntimeHours,
      elapsedCalendarHours: measurement.elapsedCalendarHours,
      blockedCalendarHours: measurement.blockedCalendarHours,
      repairCalendarHours: measurement.repairCalendarHours,
      repairTouchHours: measurement.repairTouchHours,
      verificationHours: measurement.verificationHours,
      waitHours: measurement.waitHours,
    },
    quality: {
      verifiedDeliveryUnits: measurement.verifiedDeliveryUnits,
      firstPassGateYield: measurement.firstPassGateYield,
      repairLoopCount: measurement.repairLoopCount,
      gateFailureCount: measurement.gateFailureCount,
    },
    variance: {
      effortVariancePct: measurement.effortVariancePct,
      scheduleVariancePct: measurement.scheduleVariancePct,
    },
    comparison: measurement.comparison,
    evidence: {
      harnessProjectId: measurement.harnessProjectId,
      eventCount: measurement.importedEventCount,
    },
  };
}
