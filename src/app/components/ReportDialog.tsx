"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { FileDown, Loader2, Printer, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Activity, EstimateMetrics, OverheadKey } from "@/app/types";
import { summarizeActivities } from "@/ai/client/estimate-summary";

const CHART_COLORS = [
  "#00b7b7",
  "#d0457a",
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

interface ReportDialogProps {
  projectName: string;
  activities: Activity[];
  overheadPercentages: Record<OverheadKey, number>;
  metrics: EstimateMetrics;
}

export function ReportDialog({
  projectName,
  activities,
  overheadPercentages,
  metrics,
}: ReportDialogProps) {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const {
    totalEffort,
    coreEffort,
    supervisedEffort,
    effortByType,
    contingencyEffort,
    pmEffort,
    saEffort,
    sddEffort,
    releaseConfigEffort,
    userManualEffort,
    grandTotalEffort,
  } = metrics;

  /* ── Chart data ── */
  const effortByTypeData = Object.entries(effortByType).map(([name, val]) => ({
    name,
    hours: Number(val),
  }));

  const distributionData = [
    { name: "Base Effort", value: totalEffort },
    { name: "Contingency", value: contingencyEffort },
    { name: "PM", value: pmEffort },
    { name: "SA", value: saEffort },
    { name: "SDD", value: sddEffort },
    { name: "Config & Release", value: releaseConfigEffort },
    { name: "User Manual", value: userManualEffort },
  ].filter((d) => d.value > 0);

  /* ── Table rows ── */
  const estimateRows = [
    { label: "Total Base Effort", value: totalEffort },
    { label: "↳ Core", value: coreEffort },
    { label: "↳ Supervised", value: supervisedEffort },
    ...Object.entries(effortByType).map(([t, v]) => ({
      label: `↳ ${t}`,
      value: Number(v),
    })),
    {
      label: `Contingency (${(overheadPercentages.contingency * 100).toFixed(1)}%)`,
      value: contingencyEffort,
    },
    {
      label: `Project Management (${(overheadPercentages.pm * 100).toFixed(1)}%)`,
      value: pmEffort,
    },
    {
      label: `Solution Architect (${(overheadPercentages.sa * 100).toFixed(1)}%)`,
      value: saEffort,
    },
    {
      label: `SDD (${(overheadPercentages.sdd * 100).toFixed(1)}%)`,
      value: sddEffort,
    },
    {
      label: `Config & Release (${(overheadPercentages.releaseConfig * 100).toFixed(1)}%)`,
      value: releaseConfigEffort,
    },
    {
      label: `User Manual (${(overheadPercentages.userManual * 100).toFixed(1)}%)`,
      value: userManualEffort,
    },
    { label: "Grand Total Effort", value: grandTotalEffort, grand: true },
  ];

  const assumptions = activities
    .filter((a) => a.assumption?.trim())
    .map((a) => a.assumption);

  /* ── AI Summary ── */
  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const result = await summarizeActivities({
        activities: JSON.stringify(
          activities.map((a) => ({
            name: a.activityName,
            application: a.applicationName,
            type: a.activityType,
            tool: a.rpaTool,
            effort: a.effort,
            model: a.coreSupervised,
            complexity: a.exceptionHandlingComplexity,
          })),
        ),
      });
      setAiSummary(result.summary);
    } catch {
      toast({
        title: "AI summary unavailable",
        description: "Configure n8n webhooks in AI Integrations or set GOOGLE_GENAI_API_KEY for local Genkit mode.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  /* ── PNG export ── */
  const handleSavePng = async () => {
    if (!reportRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      saveAs(
        canvas.toDataURL("image/png"),
        `${projectName.replace(/\s+/g, "_")}_estimate_${format(new Date(), "yyyyMMdd")}.png`,
      );
      toast({ title: "Report saved as PNG" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={activities.length === 0}
          title={
            activities.length === 0 ? "Add activities to generate a report" : undefined
          }
        >
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estimate Report</DialogTitle>
          <DialogDescription>
            Professional effort breakdown — ready for stakeholder review.
          </DialogDescription>
        </DialogHeader>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSavePng}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print / PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accessible-cyan" />
            )}
            AI Executive Summary
          </Button>
        </div>

        {/* ─── Printable report content ─── */}
        <div
          ref={reportRef}
          className="space-y-6 rounded-lg bg-background p-4"
        >
          {/* Header */}
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-accessible-cyan">
              {projectName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              RPA Effort Estimate · Generated{" "}
              {format(new Date(), "MMMM d, yyyy")}
            </p>
          </div>

          {/* AI Executive Summary */}
          {aiSummary && (
            <div className="rounded-lg border border-accessible-cyan/30 bg-accessible-cyan/5 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-accessible-cyan" />
                Executive Summary
              </h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {aiSummary}
              </p>
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Activities</p>
              <p className="text-2xl font-bold text-accessible-cyan">
                {activities.length}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Base Hours</p>
              <p className="text-2xl font-bold">{totalEffort.toFixed(0)}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold text-accessible-magenta">
                {grandTotalEffort.toFixed(0)}h
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Overhead</p>
              <p className="text-2xl font-bold">
                {totalEffort > 0
                  ? (
                      ((grandTotalEffort - totalEffort) / totalEffort) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Charts */}
          {(effortByTypeData.length > 0 || distributionData.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bar: effort by type */}
              {effortByTypeData.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Effort by Activity Type
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={effortByTypeData}
                      layout="vertical"
                      margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                      />
                      <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip
                        formatter={(v: number) => [`${v.toFixed(1)}h`, "Effort"]}
                      />
                      <Bar
                        dataKey="hours"
                        fill="#00b7b7"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie: grand total distribution */}
              {distributionData.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Effort Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {distributionData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [`${v.toFixed(1)}h`]}
                      />
                      <Legend
                        iconSize={10}
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Detailed effort table */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Detailed Effort Breakdown
            </h3>
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimateRows.map((row, i) => (
                    <TableRow
                      key={i}
                      className={cn(
                        (row as { grand?: boolean }).grand &&
                          "bg-accessible-cyan/10",
                      )}
                    >
                      <TableCell
                        className={cn(
                          (row as { grand?: boolean }).grand &&
                            "font-semibold text-accessible-cyan",
                        )}
                      >
                        {row.label}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          (row as { grand?: boolean }).grand &&
                            "font-semibold text-accessible-cyan",
                        )}
                      >
                        {row.value.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Activity breakdown table */}
          {activities.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Activity Breakdown
              </h3>
              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tool</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm">
                          {a.applicationName || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.activityName || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.activityType || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.rpaTool || "—"}
                        </TableCell>
                        <TableCell>
                          {a.coreSupervised ? (
                            <Badge
                              variant={
                                a.coreSupervised === "core"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {a.coreSupervised}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(a.effort).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">Assumptions</h3>
              <ol className="list-inside list-decimal space-y-1.5">
                {assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {a}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            Generated by TimeEstimator ·{" "}
            {format(new Date(), "yyyy-MM-dd HH:mm")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
