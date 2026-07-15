"use client";

import { useMemo, useRef, useState } from "react";
import { FileDown, FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/app/types";
import { buildReportViewModel } from "@/domain/reporting";
import { ExecutiveSummaryCard } from "@/app/components/report/ExecutiveSummaryCard";
import { PrintReport } from "@/app/components/report/PrintReport";
import { buildPrintReportUrl, exportExecutiveSummaryPng, type ExportStage } from "@/app/components/report/export-service";

export function ReportDialog({ project }: { project: Project }) {
  const { toast } = useToast();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [generatedAt] = useState(() => new Date().toISOString());
  const [stage, setStage] = useState<ExportStage | "idle" | "success" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const model = useMemo(() => buildReportViewModel(project, generatedAt), [project, generatedAt]);
  const busy = stage === "preparing" || stage === "capturing" || stage === "saving";

  const savePng = async () => {
    if (!summaryRef.current) {
      setStage("failed");
      setStatusMessage("Executive summary is not ready. Reopen the report and try again.");
      return;
    }
    try {
      const filename = await exportExecutiveSummaryPng(summaryRef.current, model, (next) => {
        setStage(next);
        setStatusMessage(exportStageLabel(next));
      });
      setStage("success");
      setStatusMessage(`Executive summary saved as ${filename}.`);
      toast({ title: "Executive summary saved", description: filename });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown export error.";
      setStage("failed");
      setStatusMessage(`PNG export failed: ${message}`);
      toast({ title: "PNG export failed", description: message, variant: "destructive" });
    }
  };

  const openPrint = () => {
    const reportWindow = window.open(buildPrintReportUrl(project.id), "_blank", "noopener,noreferrer");
    if (!reportWindow) {
      setStatusMessage("The print report was blocked by the browser. Allow pop-ups and retry.");
      toast({ title: "Print report blocked", description: "Allow pop-ups for this site and retry.", variant: "destructive" });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="cinematic-button-secondary"
          size="sm"
          disabled={project.activities.length === 0}
          aria-label="Generate report"
          title={project.activities.length === 0 ? "Add activities to generate a report" : undefined}
        >
          <FileText className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Generate Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border-white/10 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle>Estimate Report</DialogTitle>
          <DialogDescription>One normalized report model drives preview, bounded PNG, and Print / PDF.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2" aria-label="Report export actions">
          <Button type="button" variant="outline" size="sm" onClick={savePng} disabled={busy}>
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileDown className="mr-1.5 h-3.5 w-3.5" />}
            {busy ? exportStageLabel(stage as ExportStage) : "Save bounded PNG"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={openPrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Open Print / PDF
          </Button>
        </div>

        <p role="status" aria-live="polite" className="min-h-5 text-sm text-slate-300">{statusMessage}</p>

        <section aria-labelledby="interactive-preview-title" className="rounded-xl border border-slate-800 bg-white p-4 text-slate-950">
          <h2 id="interactive-preview-title" className="sr-only">Interactive report preview</h2>
          <PrintReport model={model} />
        </section>

        <div className="pointer-events-none fixed left-[-20000px] top-0" aria-hidden="true">
          <div ref={summaryRef}><ExecutiveSummaryCard model={model} /></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function exportStageLabel(stage: ExportStage) {
  if (stage === "preparing") return "Preparing…";
  if (stage === "capturing") return "Capturing…";
  return "Saving…";
}
