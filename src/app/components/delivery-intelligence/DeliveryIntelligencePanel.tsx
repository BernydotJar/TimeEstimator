"use client";

import { useMemo, useState } from "react";

import type { Project } from "@/app/types";
import type {
  DeliveryBaseline,
  DeliveryTimeObservation,
} from "@/domain/delivery-intelligence/types";
import { buildDeliveryIntelligenceViewModel } from "@/domain/delivery-intelligence/view-model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  project: Project;
  onImportLedger: (jsonl: string) => void;
  onAddBaseline: (baseline: DeliveryBaseline) => void;
  onAddObservation: (observation: DeliveryTimeObservation) => void;
}

function hours(value: number | undefined): string {
  return value === undefined ? "Not measured" : `${value.toFixed(1)} h`;
}

function percent(value: number | undefined): string {
  return value === undefined ? "Not available" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function DeliveryIntelligencePanel({
  project,
  onImportLedger,
  onAddBaseline,
  onAddObservation,
}: Props) {
  const view = useMemo(
    () => buildDeliveryIntelligenceViewModel(project.deliveryIntelligence),
    [project.deliveryIntelligence],
  );
  const [ledger, setLedger] = useState("");
  const [plannedHours, setPlannedHours] = useState("");
  const [plannedCalendarHours, setPlannedCalendarHours] = useState("");
  const [humanHours, setHumanHours] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const importLedger = () => {
    try {
      onImportLedger(ledger);
      setLedger("");
      setMessage("Execution evidence imported. Raw Graph Harness events were preserved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The ledger could not be imported.");
    }
  };

  const saveBaseline = () => {
    const effort = Number(plannedHours);
    const calendar = Number(plannedCalendarHours);
    if (!Number.isFinite(effort) || effort <= 0 || !Number.isFinite(calendar) || calendar <= 0) {
      setMessage("Baseline effort and calendar hours must both be greater than zero.");
      return;
    }
    onAddBaseline({
      id: crypto.randomUUID(),
      projectId: project.id,
      plannedHours: effort,
      plannedCalendarHours: calendar,
      comparisonClass: "MEASURED_CURRENT",
      baselineSource: "TimeEstimator project baseline",
      sampleSize: 1,
      taskComparability: "LOW",
      qualityEquivalence: "UNKNOWN",
      scopeVariance: "UNKNOWN",
      confidence: "LOW",
    });
    setMessage("Baseline saved. It is not treated as proof of AI acceleration.");
  };

  const saveHumanTouch = () => {
    const durationHours = Number(humanHours);
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      setMessage("Human touch hours must be greater than zero.");
      return;
    }
    onAddObservation({
      id: crypto.randomUUID(),
      projectId: project.id,
      category: "HUMAN_TOUCH",
      durationHours,
      provenance: "MANUAL",
      note: "Manual project-level human touch observation",
    });
    setHumanHours("");
    setMessage("Human touch observation recorded as MANUAL provenance.");
  };

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white">
      <CardHeader>
        <div className="panel-kicker">Delivery Intelligence</div>
        <CardTitle>Build with Proof</CardTitle>
        <CardDescription>
          Plan → Build → Verify → Learn. Graph Harness stays underneath as execution evidence; this view shows what it proves.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-4">
          {view.stages.map((stage) => (
            <div key={stage.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-2">
                <strong>{stage.label}</strong>
                <span className={stage.complete ? "text-emerald-300" : "text-slate-500"}>
                  {stage.complete ? "Ready" : "Pending"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{stage.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <Metric label="Planned effort" value={hours(view.baseline.plannedHours)} />
          <Metric label="Human touch" value={hours(view.actual.humanTouchHours)} />
          <Metric label="Calendar lead time" value={hours(view.actual.elapsedCalendarHours)} />
          <Metric label="Verified delivery units" value={String(view.quality.verifiedDeliveryUnits)} />
          <Metric label="Effort variance" value={percent(view.variance.effortVariancePct)} />
          <Metric label="Schedule variance" value={percent(view.variance.scheduleVariancePct)} />
          <Metric
            label="First-pass gate yield"
            value={view.quality.firstPassGateYield === undefined ? "Not available" : `${(view.quality.firstPassGateYield * 100).toFixed(0)}%`}
          />
          <Metric label="Repair loops" value={String(view.quality.repairLoopCount)} />
        </div>

        <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.04] p-4">
          <div className="text-sm font-medium text-amber-100">AI comparison</div>
          <p className="mt-1 text-sm text-slate-300">
            Observed leverage: {view.comparison.observedHumanEffortLeverage ? `${view.comparison.observedHumanEffortLeverage.toFixed(2)}× human-effort ratio` : "not available"}.
          </p>
          <p className="mt-1 text-sm font-medium text-amber-200">
            Causal AI acceleration: {view.comparison.causalAiAccelerationEstablished ? "ESTABLISHED" : "NOT ESTABLISHED"}
          </p>
          <p className="mt-1 text-xs text-slate-400">{view.comparison.reason}</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <section className="space-y-3 rounded-lg border border-white/10 p-4">
            <h3 className="font-medium">1. Record the plan</h3>
            <Input aria-label="Planned effort hours" type="number" min="0" step="0.1" placeholder="Planned human hours" value={plannedHours} onChange={(event) => setPlannedHours(event.target.value)} />
            <Input aria-label="Planned calendar hours" type="number" min="0" step="0.1" placeholder="Planned calendar hours" value={plannedCalendarHours} onChange={(event) => setPlannedCalendarHours(event.target.value)} />
            <Button type="button" variant="outline" onClick={saveBaseline}>Save baseline</Button>
          </section>

          <section className="space-y-3 rounded-lg border border-white/10 p-4">
            <h3 className="font-medium">2. Bring execution evidence</h3>
            <Textarea aria-label="Graph Harness JSONL" rows={5} placeholder="Paste graph-harness.event.v1 JSONL" value={ledger} onChange={(event) => setLedger(event.target.value)} />
            <Button type="button" variant="outline" disabled={!ledger.trim()} onClick={importLedger}>Import Graph evidence</Button>
            <p className="text-xs text-slate-500">{view.evidence.eventCount} imported event(s)</p>
          </section>

          <section className="space-y-3 rounded-lg border border-white/10 p-4">
            <h3 className="font-medium">3. Record human touch</h3>
            <Input aria-label="Human touch hours" type="number" min="0" step="0.1" placeholder="Measured/manual hours" value={humanHours} onChange={(event) => setHumanHours(event.target.value)} />
            <Button type="button" variant="outline" onClick={saveHumanTouch}>Add observation</Button>
            <p className="text-xs text-slate-500">Running → review is not counted automatically as human touch.</p>
          </section>
        </div>

        {message && <p role="status" className="text-sm text-cyan-100">{message}</p>}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
