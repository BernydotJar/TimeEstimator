import type {
  DeliveryBaseline,
  DeliveryComparisonResult,
  DeliveryMeasurementInput,
  DeliveryMeasurementSummary,
  DeliveryTimeObservation,
  GateEventSummary,
  ImportedHarnessEvent,
  NodeLifecycle,
  TimeInterval,
} from "./types";

type MutableLifecycle = NodeLifecycle & {
  currentBlockedStart?: string;
  currentRepairStart?: string;
};

function hoursBetween(startedAt: string, endedAt: string): number {
  return Math.max(0, (Date.parse(endedAt) - Date.parse(startedAt)) / 3_600_000);
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function closeInterval(
  intervals: TimeInterval[],
  startedAt: string | undefined,
  endedAt: string,
): void {
  if (!startedAt) return;
  intervals.push({ startedAt, endedAt });
}

function lifecycleKey(nodeId: string, revision: number): string {
  return `${nodeId}::${revision}`;
}

function getLifecycle(
  map: Map<string, MutableLifecycle>,
  nodeId: string,
  revision: number,
): MutableLifecycle {
  const key = lifecycleKey(nodeId, revision);
  const existing = map.get(key);
  if (existing) return existing;
  const created: MutableLifecycle = {
    nodeId,
    revision,
    blockedIntervals: [],
    repairIntervals: [],
    gateEvents: [],
    evidenceEventIds: [],
    failureEventIds: [],
    invalidatedEventIds: [],
    repairTransitionEventIds: [],
    runningIntervals: [],
  };
  map.set(key, created);
  return created;
}

function normalizeGateResult(value: unknown): GateEventSummary["result"] {
  if (typeof value !== "string") return "UNKNOWN";
  const normalized = value.toUpperCase();
  if (normalized === "PASS" || normalized === "SUCCESS") return "PASS";
  if (normalized === "FAIL" || normalized === "FAILED" || normalized === "ERROR") return "FAIL";
  return "UNKNOWN";
}

export function reconstructNodeLifecycles(
  events: ImportedHarnessEvent[],
): NodeLifecycle[] {
  const lifecycles = new Map<string, MutableLifecycle>();
  const currentRevision = new Map<string, number>();
  let lastOccurredAt: string | undefined;

  for (const imported of events) {
    const event = imported.normalized;
    lastOccurredAt = event.occurred_at;
    if (!event.node_id) continue;

    const revision = event.node_revision ?? currentRevision.get(event.node_id) ?? 0;
    const lifecycle = getLifecycle(lifecycles, event.node_id, revision);
    currentRevision.set(event.node_id, revision);

    switch (event.event_type) {
      case "approval.recorded":
        lifecycle.approvedAt ??= event.occurred_at;
        break;
      case "evidence.recorded":
        lifecycle.evidenceEventIds.push(event.event_id);
        break;
      case "gate.evaluated":
        lifecycle.gateEvents.push({
          eventId: event.event_id,
          gateId: typeof event.payload.gate_id === "string" ? event.payload.gate_id : "unknown-gate",
          result: normalizeGateResult(event.payload.result),
          occurredAt: event.occurred_at,
        });
        break;
      case "failure.recorded":
        lifecycle.failureEventIds.push(event.event_id);
        break;
      case "node.invalidated": {
        lifecycle.invalidatedEventIds.push(event.event_id);
        lifecycle.currentRepairStart ??= event.occurred_at;
        const nextRevision = revision + 1;
        currentRevision.set(event.node_id, nextRevision);
        const nextLifecycle = getLifecycle(lifecycles, event.node_id, nextRevision);
        nextLifecycle.currentRepairStart ??= event.occurred_at;
        break;
      }
      case "node.transitioned": {
        const from = typeof event.payload.from === "string" ? event.payload.from : "";
        const to = typeof event.payload.to === "string" ? event.payload.to : "";

        if (to === "spec_ready") lifecycle.specReadyAt ??= event.occurred_at;
        if (to === "approved") lifecycle.approvedAt ??= event.occurred_at;
        if (to === "ready") lifecycle.readyAt ??= event.occurred_at;
        if (to === "running") {
          lifecycle.runningAt ??= event.occurred_at;
          lifecycle.runningIntervals.push({ startedAt: event.occurred_at });
          if (from === "repair_required") {
            lifecycle.repairTransitionEventIds.push(event.event_id);
            closeInterval(lifecycle.repairIntervals, lifecycle.currentRepairStart, event.occurred_at);
            lifecycle.currentRepairStart = undefined;
          }
        }
        if (to === "review") {
          lifecycle.reviewAt = event.occurred_at;
          const openRunning = [...lifecycle.runningIntervals].reverse().find((interval) => !interval.endedAt);
          if (openRunning) openRunning.endedAt = event.occurred_at;
        }
        if (to === "done") lifecycle.doneAt = event.occurred_at;

        if (to === "blocked" && !lifecycle.currentBlockedStart) {
          lifecycle.currentBlockedStart = event.occurred_at;
        }
        if (from === "blocked") {
          closeInterval(lifecycle.blockedIntervals, lifecycle.currentBlockedStart, event.occurred_at);
          lifecycle.currentBlockedStart = undefined;
        }

        if (to === "repair_required" && !lifecycle.currentRepairStart) {
          lifecycle.currentRepairStart = event.occurred_at;
          lifecycle.repairTransitionEventIds.push(event.event_id);
        }
        if (from === "repair_required" && to !== "running") {
          closeInterval(lifecycle.repairIntervals, lifecycle.currentRepairStart, event.occurred_at);
          lifecycle.currentRepairStart = undefined;
          lifecycle.repairTransitionEventIds.push(event.event_id);
        }
        break;
      }
      default:
        break;
    }
  }

  if (lastOccurredAt) {
    for (const lifecycle of lifecycles.values()) {
      closeInterval(lifecycle.blockedIntervals, lifecycle.currentBlockedStart, lastOccurredAt);
      closeInterval(lifecycle.repairIntervals, lifecycle.currentRepairStart, lastOccurredAt);
    }
  }

  return [...lifecycles.values()]
    .sort((a, b) => a.nodeId.localeCompare(b.nodeId) || a.revision - b.revision)
    .map(({ currentBlockedStart: _blocked, currentRepairStart: _repair, ...lifecycle }) => lifecycle);
}

function observationHours(observation: DeliveryTimeObservation): number | undefined {
  if (typeof observation.durationHours === "number" && Number.isFinite(observation.durationHours)) {
    return Math.max(0, observation.durationHours);
  }
  if (observation.startedAt && observation.endedAt) {
    return hoursBetween(observation.startedAt, observation.endedAt);
  }
  return undefined;
}

function sumObservationHours(
  observations: DeliveryTimeObservation[],
  category: DeliveryTimeObservation["category"],
  includeInferred = true,
): number {
  return observations
    .filter(
      (observation) =>
        observation.category === category &&
        (includeInferred || observation.provenance !== "INFERRED"),
    )
    .reduce((sum, observation) => sum + (observationHours(observation) ?? 0), 0);
}

function variance(actual: number | undefined, planned: number | undefined): number | undefined {
  if (actual === undefined || planned === undefined || planned <= 0) return undefined;
  return round(((actual - planned) / planned) * 100);
}

function intervalHours(intervals: TimeInterval[]): number {
  return intervals.reduce(
    (sum, interval) => sum + (interval.endedAt ? hoursBetween(interval.startedAt, interval.endedAt) : 0),
    0,
  );
}

function comparisonResult(
  baseline: DeliveryBaseline | undefined,
  actualHumanTouchHours: number | undefined,
): DeliveryComparisonResult {
  if (!baseline) {
    return {
      baselineAvailable: false,
      validComparableBaseline: false,
      causalAiAccelerationEstablished: false,
      reason: "No comparable historical or benchmark baseline is recorded.",
    };
  }

  const observedHumanEffortLeverage =
    baseline.baselineHumanHours && baseline.baselineHumanHours > 0 &&
    actualHumanTouchHours && actualHumanTouchHours > 0
      ? round(baseline.baselineHumanHours / actualHumanTouchHours)
      : undefined;

  const validComparableBaseline =
    ["MATCHED_BASELINE", "PAIRED_BENCHMARK", "CONTROLLED_COMPARISON"].includes(baseline.comparisonClass) &&
    baseline.taskComparability !== "LOW" &&
    baseline.qualityEquivalence === "PASS" &&
    baseline.scopeVariance !== "HIGH" &&
    baseline.scopeVariance !== "UNKNOWN" &&
    baseline.confidence !== "LOW";

  const causalAiAccelerationEstablished =
    validComparableBaseline &&
    baseline.comparisonClass === "CONTROLLED_COMPARISON" &&
    baseline.taskComparability === "HIGH" &&
    baseline.scopeVariance === "LOW" &&
    baseline.confidence === "HIGH" &&
    observedHumanEffortLeverage !== undefined;

  return {
    baselineAvailable: true,
    validComparableBaseline,
    observedHumanEffortLeverage,
    causalAiAccelerationEstablished,
    causalAiAccelerationFactor: causalAiAccelerationEstablished ? observedHumanEffortLeverage : undefined,
    reason: causalAiAccelerationEstablished
      ? "A controlled, high-comparability baseline with equivalent quality supports a causal acceleration claim."
      : validComparableBaseline
        ? "A comparable baseline supports observed leverage, but causal AI acceleration is not established."
        : "The recorded baseline is not sufficiently comparable for an AI acceleration claim.",
  };
}

export function measureDelivery(input: DeliveryMeasurementInput): DeliveryMeasurementSummary {
  const events = input.events;
  const lifecycles = reconstructNodeLifecycles(events);
  const observations = input.timeObservations ?? [];

  const eventTimes = events.map(({ normalized }) => Date.parse(normalized.occurred_at));
  const doneTimes = lifecycles
    .map((lifecycle) => lifecycle.doneAt && Date.parse(lifecycle.doneAt))
    .filter((value): value is number => typeof value === "number");
  const leadStarts = lifecycles
    .map((lifecycle) => lifecycle.readyAt ?? lifecycle.approvedAt ?? lifecycle.specReadyAt ?? lifecycle.runningAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => Date.parse(value));

  const elapsedCalendarHours =
    leadStarts.length > 0 && (doneTimes.length > 0 || eventTimes.length > 0)
      ? round((Math.max(...(doneTimes.length > 0 ? doneTimes : eventTimes)) - Math.min(...leadStarts)) / 3_600_000)
      : undefined;

  const activeCycleHours = round(
    lifecycles.reduce(
      (sum, lifecycle) => sum + intervalHours(lifecycle.runningIntervals),
      0,
    ),
  );
  const blockedCalendarHours = round(
    lifecycles.reduce((sum, lifecycle) => sum + intervalHours(lifecycle.blockedIntervals), 0),
  );
  const repairCalendarHours = round(
    lifecycles.reduce((sum, lifecycle) => sum + intervalHours(lifecycle.repairIntervals), 0),
  );

  const explicitHumanTouchHours = sumObservationHours(observations, "HUMAN_TOUCH", false);
  const inferredHumanTouchHours = round(
    observations
      .filter((observation) => observation.category === "HUMAN_TOUCH" && observation.provenance === "INFERRED")
      .reduce((sum, observation) => sum + (observationHours(observation) ?? 0), 0),
  );
  const actualHumanTouchHours = observations.some(
    (observation) =>
      observation.category === "HUMAN_TOUCH" &&
      observation.provenance !== "INFERRED" &&
      observationHours(observation) !== undefined,
  )
    ? round(explicitHumanTouchHours)
    : undefined;

  const gateEvents = lifecycles.flatMap((lifecycle) => lifecycle.gateEvents);
  const firstByGate = new Map<string, GateEventSummary>();
  for (const lifecycle of lifecycles) {
    for (const gate of lifecycle.gateEvents) {
      const key = `${lifecycle.nodeId}::${lifecycle.revision}::${gate.gateId}`;
      if (!firstByGate.has(key)) firstByGate.set(key, gate);
    }
  }
  const firstPassGateYield = firstByGate.size > 0
    ? round([...firstByGate.values()].filter((gate) => gate.result === "PASS").length / firstByGate.size)
    : undefined;

  const verifiedNodes = lifecycles.filter(
    (lifecycle) =>
      Boolean(lifecycle.doneAt) &&
      lifecycle.evidenceEventIds.length > 0 &&
      lifecycle.gateEvents.some((gate) => gate.result === "PASS"),
  );

  const repairPlanCount = events.filter(
    ({ normalized }) => normalized.event_type === "repair.plan_created",
  ).length;
  const repairTransitionCount = lifecycles.filter(
    (lifecycle) => lifecycle.repairTransitionEventIds.length > 0,
  ).length;
  const repairLoopCount = Math.max(repairPlanCount, repairTransitionCount);

  const agentRuntimeHours = round(sumObservationHours(observations, "AGENT_RUNTIME"));
  const verificationHours = round(sumObservationHours(observations, "VERIFICATION"));
  const repairTouchHours = round(sumObservationHours(observations, "REPAIR"));
  const waitHours = round(sumObservationHours(observations, "WAIT"));
  const observedBlockedHours = round(sumObservationHours(observations, "BLOCKED"));
  const baseline = input.baseline;
  const comparison = comparisonResult(baseline, actualHumanTouchHours);

  return {
    harnessProjectId: events[0]?.normalized.project_id,
    importedEventCount: events.length,
    nodeLifecycles: lifecycles,
    elapsedCalendarHours,
    activeCycleHours,
    blockedCalendarHours,
    repairCalendarHours,
    actualHumanTouchHours,
    inferredHumanTouchHours,
    agentRuntimeHours,
    verificationHours,
    repairTouchHours,
    waitHours,
    observedBlockedHours,
    plannedHours: baseline?.plannedHours,
    plannedCalendarHours: baseline?.plannedCalendarHours,
    effortVariancePct: variance(actualHumanTouchHours, baseline?.plannedHours),
    scheduleVariancePct: variance(elapsedCalendarHours, baseline?.plannedCalendarHours),
    gateFailureCount: gateEvents.filter((gate) => gate.result === "FAIL").length,
    firstPassGateYield,
    repairLoopCount,
    verifiedNodesCompleted: verifiedNodes.length,
    verifiedDeliveryUnits: verifiedNodes.length,
    verifiedDeliveryUnitsPerHumanHour:
      actualHumanTouchHours && actualHumanTouchHours > 0
        ? round(verifiedNodes.length / actualHumanTouchHours)
        : undefined,
    deliveryThroughputPerCalendarDay:
      elapsedCalendarHours && elapsedCalendarHours > 0
        ? round(verifiedNodes.length / (elapsedCalendarHours / 24))
        : undefined,
    comparison,
  };
}
