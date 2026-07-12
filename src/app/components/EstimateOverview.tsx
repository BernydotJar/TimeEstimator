"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EstimateMetrics, OverheadKey } from "@/app/types";

interface EstimateOverviewProps {
  metrics: EstimateMetrics;
  overheadPercentages: Record<OverheadKey, number>;
}

export function EstimateOverview({
  metrics,
  overheadPercentages,
}: EstimateOverviewProps) {
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

  const rows: Array<{
    label: string;
    value: number;
    grand?: boolean;
    indent?: boolean;
  }> = [
    { label: "Total Base Effort", value: totalEffort },
    { label: "↳ Core", value: coreEffort, indent: true },
    { label: "↳ Supervised", value: supervisedEffort, indent: true },
    ...Object.entries(effortByType).map(([type, effort]) => ({
      label: `↳ ${type}`,
      value: Number(effort),
      indent: true,
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
    { label: "Grand Total", value: grandTotalEffort, grand: true },
  ];

  return (
    <Card className="cinematic-panel border-white/10 bg-transparent shadow-none">
      <CardHeader className="pb-4 pt-6">
        <div className="panel-kicker">Executive telemetry</div>
        <CardTitle className="panel-title">Estimate Overview</CardTitle>
        <CardDescription className="panel-copy">
          Updates automatically as activities are added or overhead is adjusted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stat cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Base Effort
            </p>
            <p className="mt-1 text-2xl font-bold text-accessible-cyan">
              {totalEffort.toFixed(1)}h
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              With Overhead
            </p>
            <p className="mt-1 text-2xl font-bold text-accessible-magenta">
              {grandTotalEffort.toFixed(1)}h
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Overhead Added
            </p>
            <p className="mt-1 text-2xl font-bold">
              {(grandTotalEffort - totalEffort).toFixed(1)}h
            </p>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={i}
                  className={cn(row.grand && "bg-accessible-cyan/10")}
                >
                  <TableCell
                    className={cn(
                      row.grand && "text-base font-semibold text-accessible-cyan",
                      row.indent &&
                        "pl-8 text-xs text-muted-foreground",
                    )}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      row.grand &&
                        "text-base font-semibold text-accessible-cyan",
                    )}
                  >
                    {row.value.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
