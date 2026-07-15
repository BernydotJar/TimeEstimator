"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { buildReportViewModel } from "@/domain/reporting";
import { PrintReport } from "@/app/components/report/PrintReport";

export default function ReportPageClient() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") ?? "";
  const { hydrated, getProject } = useProjects();
  const project = hydrated ? getProject(projectId) : undefined;
  const generatedAt = useMemo(() => new Date().toISOString(), []);
  const model = useMemo(() => project ? buildReportViewModel(project, generatedAt) : undefined, [project, generatedAt]);

  if (!hydrated) {
    return <main className="report-route-state" role="status">Loading report data…</main>;
  }

  if (!projectId || !project || !model) {
    return (
      <main className="report-route-state">
        <h1>Report unavailable</h1>
        <p>The project could not be resolved from browser storage. Return to TimeEstimator and open the report from an existing project.</p>
        <Button type="button" onClick={() => window.history.back()}>Go back</Button>
      </main>
    );
  }

  if (model.activities.length === 0) {
    return (
      <main className="report-route-state">
        <h1>No reportable activities</h1>
        <p>Add or apply at least one activity before opening Print / PDF.</p>
        <Button type="button" onClick={() => window.history.back()}>Go back</Button>
      </main>
    );
  }

  return (
    <main className="report-route-shell">
      <div className="report-toolbar" aria-label="Report controls">
        <div>
          <p className="text-sm font-semibold text-slate-950">Print-ready report</p>
          <p className="text-xs text-slate-600">Use the browser dialog to select A4 or US Letter and save as PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Back</Button>
          <Button type="button" onClick={() => window.print()}>Print / Save PDF</Button>
        </div>
      </div>
      <PrintReport model={model} />
      <p className="sr-only" role="status">Report is ready to print.</p>
    </main>
  );
}
