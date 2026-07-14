import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EstimateMetrics,
  OverheadPercentages,
  formatHours,
  overheadLabels,
} from "./estimate-types";

interface ReportPanelProps {
  metrics: EstimateMetrics;
  overheadPercentages: OverheadPercentages;
  reportRef: React.RefObject<HTMLDivElement>;
  onSave: () => void;
}

const ReportPanel = ({ metrics, overheadPercentages, reportRef, onSave }: ReportPanelProps) => {
  const overheadRows: Array<[keyof OverheadPercentages, number]> = [
    ["contingency", metrics.contingencyEffort],
    ["pm", metrics.pmEffort],
    ["sa", metrics.saEffort],
    ["sdd", metrics.sddEffort],
    ["releaseConfig", metrics.releaseConfigEffort],
    ["userManual", metrics.userManualEffort],
  ];

  return (
    <section className="cinematic-panel" aria-labelledby="report-panel-title">
      <div className="panel-kicker">Stakeholder artifact</div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 id="report-panel-title" className="panel-title">Executive report</h2>
          <p className="panel-copy">
            Export a clean estimate summary with generated metadata for delivery handoff and review packs.
          </p>
        </div>
        <Button className="cinematic-button" onClick={onSave} type="button">
          <Download className="h-4 w-4" />
          Save estimate report
        </Button>
      </div>

      <div ref={reportRef} className="export-sheet">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">TimeEstimator</p>
          <h3 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950">
            RPA Effort Estimate Summary
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Executive sizing summary generated from captured activity inputs and configured delivery overheads.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total effort</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{formatHours(metrics.totalEffort)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delivery support</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{formatHours(metrics.supportEffort)}</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Grand total</p>
            <p className="mt-2 text-2xl font-bold text-cyan-950">{formatHours(metrics.grandTotalEffort)}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700">Category</TableHead>
              <TableHead className="text-right text-slate-700">Effort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Core Effort</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(metrics.coreEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Supervised Effort</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(metrics.supervisedEffort)}</TableCell>
            </TableRow>
            {Object.entries(metrics.effortByActivityType).map(([type, effort]) => (
              <TableRow className="border-slate-200" key={type}>
                <TableCell className="text-slate-700">Effort - {type}</TableCell>
                <TableCell className="text-right font-semibold text-slate-950">{formatHours(Number(effort))}</TableCell>
              </TableRow>
            ))}
            {overheadRows.map(([key, value]) => (
              <TableRow className="border-slate-200" key={key}>
                <TableCell className="text-slate-700">
                  {overheadLabels[key]} ({(overheadPercentages[key] * 100).toFixed(1)}%)
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-950">{formatHours(value)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-slate-200 bg-cyan-50">
              <TableCell className="font-bold text-cyan-950">Grand Total Effort</TableCell>
              <TableCell className="text-right font-bold text-cyan-950">{formatHours(metrics.grandTotalEffort)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default ReportPanel;
