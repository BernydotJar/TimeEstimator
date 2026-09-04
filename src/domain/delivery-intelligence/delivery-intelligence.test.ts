import { importGraphHarnessJsonl, HarnessImportError } from "./harness-importer";
import { measureDelivery, reconstructNodeLifecycles } from "./measurement-engine";
import type { DeliveryBaseline, GraphHarnessEventV1, ImportedHarnessEvent } from "./types";

const ZERO = "0".repeat(64);

function event(
  sequence: number,
  eventType: GraphHarnessEventV1["event_type"],
  occurredAt: string,
  payload: Record<string, unknown>,
  options: { nodeId?: string | null; revision?: number | null; previous?: string; hash?: string } = {},
): GraphHarnessEventV1 {
  return {
    schema_version: "graph-harness.event.v1",
    event_id: `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    sequence,
    occurred_at: occurredAt,
    project_id: "delivery-demo",
    event_type: eventType,
    node_id: options.nodeId === undefined ? "N1" : options.nodeId,
    node_revision: options.revision === undefined ? 0 : options.revision,
    actor: "fixture",
    payload,
    previous_event_hash: options.previous ?? (sequence === 1 ? ZERO : String(sequence - 1).repeat(64).slice(0, 64)),
    event_hash: options.hash ?? String(sequence).repeat(64).slice(0, 64),
  };
}

function imported(...events: GraphHarnessEventV1[]): ImportedHarnessEvent[] {
  return events.map((normalized) => ({ raw: JSON.stringify(normalized), normalized }));
}

function successfulLifecycle(): ImportedHarnessEvent[] {
  return imported(
    event(1, "approval.recorded", "2026-09-01T08:00:00.000Z", { note: "approved" }, { hash: "1".repeat(64) }),
    event(2, "node.transitioned", "2026-09-01T09:00:00.000Z", { from: "approved", to: "ready" }, { previous: "1".repeat(64), hash: "2".repeat(64) }),
    event(3, "node.transitioned", "2026-09-01T10:00:00.000Z", { from: "ready", to: "running" }, { previous: "2".repeat(64), hash: "3".repeat(64) }),
    event(4, "evidence.recorded", "2026-09-01T12:00:00.000Z", { kind: "test", result: "PASS" }, { previous: "3".repeat(64), hash: "4".repeat(64) }),
    event(5, "gate.evaluated", "2026-09-01T13:00:00.000Z", { gate_id: "verification", result: "PASS", evidence_ids: [] }, { previous: "4".repeat(64), hash: "5".repeat(64) }),
    event(6, "node.transitioned", "2026-09-01T14:00:00.000Z", { from: "running", to: "review" }, { previous: "5".repeat(64), hash: "6".repeat(64) }),
    event(7, "node.transitioned", "2026-09-01T16:00:00.000Z", { from: "review", to: "done" }, { previous: "6".repeat(64), hash: "7".repeat(64) }),
  );
}

describe("Graph Harness importer", () => {
  it("preserves raw JSONL and normalizes a contiguous ledger", () => {
    const source = successfulLifecycle().map((item) => item.raw).join("\n");
    const result = importGraphHarnessJsonl(source);

    expect(result.projectId).toBe("delivery-demo");
    expect(result.events).toHaveLength(7);
    expect(result.events[0].raw).toContain('"schema_version":"graph-harness.event.v1"');
    expect(result.sourceHash).toBe("7".repeat(64));
  });

  it("rejects broken chain continuity", () => {
    const events = successfulLifecycle();
    events[2] = {
      ...events[2],
      raw: JSON.stringify({ ...events[2].normalized, previous_event_hash: "f".repeat(64) }),
    };

    expect(() => importGraphHarnessJsonl(events.map((item) => item.raw).join("\n"))).toThrow(HarnessImportError);
  });
});

describe("delivery measurement", () => {
  it("reconstructs lifecycle and never treats running time as human touch", () => {
    const events = successfulLifecycle();
    const lifecycle = reconstructNodeLifecycles(events)[0];
    const measurement = measureDelivery({ events });

    expect(lifecycle.readyAt).toBe("2026-09-01T09:00:00.000Z");
    expect(lifecycle.runningAt).toBe("2026-09-01T10:00:00.000Z");
    expect(lifecycle.reviewAt).toBe("2026-09-01T14:00:00.000Z");
    expect(lifecycle.doneAt).toBe("2026-09-01T16:00:00.000Z");
    expect(measurement.activeCycleHours).toBe(4);
    expect(measurement.actualHumanTouchHours).toBeUndefined();
    expect(measurement.verifiedDeliveryUnits).toBe(1);
  });

  it("derives effort and schedule variance from explicit observations", () => {
    const events = successfulLifecycle();
    const baseline: DeliveryBaseline = {
      id: "b1",
      projectId: "p1",
      plannedHours: 10,
      plannedCalendarHours: 10,
      baselineHumanHours: 20,
      comparisonClass: "MATCHED_BASELINE",
      baselineSource: "historical matched work",
      sampleSize: 4,
      taskComparability: "MEDIUM",
      qualityEquivalence: "PASS",
      scopeVariance: "LOW",
      confidence: "MEDIUM",
    };

    const measurement = measureDelivery({
      events,
      baseline,
      timeObservations: [
        { id: "h1", projectId: "p1", category: "HUMAN_TOUCH", durationHours: 5, provenance: "MANUAL" },
        { id: "a1", projectId: "p1", category: "AGENT_RUNTIME", durationHours: 2, provenance: "MEASURED" },
      ],
    });

    expect(measurement.actualHumanTouchHours).toBe(5);
    expect(measurement.agentRuntimeHours).toBe(2);
    expect(measurement.effortVariancePct).toBe(-50);
    expect(measurement.scheduleVariancePct).toBe(-30);
    expect(measurement.comparison.observedHumanEffortLeverage).toBe(4);
    expect(measurement.comparison.causalAiAccelerationEstablished).toBe(false);
    expect(measurement.comparison.causalAiAccelerationFactor).toBeUndefined();
  });

  it("requires a controlled high-confidence comparison before exposing causal acceleration", () => {
    const baseline: DeliveryBaseline = {
      id: "b2",
      projectId: "p1",
      plannedHours: 10,
      plannedCalendarHours: 10,
      baselineHumanHours: 20,
      comparisonClass: "CONTROLLED_COMPARISON",
      baselineSource: "paired controlled benchmark",
      sampleSize: 20,
      taskComparability: "HIGH",
      qualityEquivalence: "PASS",
      scopeVariance: "LOW",
      confidence: "HIGH",
    };

    const measurement = measureDelivery({
      events: successfulLifecycle(),
      baseline,
      timeObservations: [
        { id: "h2", projectId: "p1", category: "HUMAN_TOUCH", durationHours: 5, provenance: "MEASURED" },
      ],
    });

    expect(measurement.comparison.causalAiAccelerationEstablished).toBe(true);
    expect(measurement.comparison.causalAiAccelerationFactor).toBe(4);
  });
});
