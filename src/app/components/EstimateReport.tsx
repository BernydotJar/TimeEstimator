"use client";

import React, { useRef, useState } from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface EstimateReportProps {
  totalEffort: number;
  coreEffort: number;
  supervisedEffort: number;
  contingencyEffort: number;
  contingencyPercentage: number;
  pmEffort: number;
  saEffort: number;
  sddEffort: number;
  releaseConfigEffort: number;
  userManualEffort: number;
  grandTotalEffort: number;
}

const formatHours = (value: number) => `${value.toFixed(2)} h`;

const EstimateReport: React.FC<EstimateReportProps> = ({
  totalEffort,
  coreEffort,
  supervisedEffort,
  contingencyEffort,
  contingencyPercentage,
  pmEffort,
  saEffort,
  sddEffort,
  releaseConfigEffort,
  userManualEffort,
  grandTotalEffort,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [ariaMessage, setAriaMessage] = useState("");

  const handleSaveEstimate = async () => {
    setAriaMessage("Saving estimate report.");

    if (!componentRef.current) {
      toast({
        title: "Error",
        description: "Could not find estimate report to save.",
        variant: "destructive",
      });
      setAriaMessage("Failed to save estimate report.");
      return;
    }

    componentRef.current.setAttribute("aria-busy", "true");

    try {
      const metadataEl = document.createElement("div");
      const timestamp = new Date().toISOString();
      metadataEl.setAttribute("data-qa-metadata", "true");
      metadataEl.style.fontSize = "10px";
      metadataEl.style.color = "#334155";
      metadataEl.style.opacity = "0.8";
      metadataEl.style.marginTop = "8px";
      metadataEl.innerText = `Generated: ${timestamp} — Source: TimeEstimator`;
      componentRef.current.appendChild(metadataEl);

      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      saveAs(canvas.toDataURL("image/png"), "estimate_report.png");

      const meta = { generatedAt: timestamp, source: "TimeEstimator", prototype: false };
      saveAs(new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" }), "estimate_report_metadata.json");
      componentRef.current.querySelector("[data-qa-metadata]")?.remove();

      toast({
        title: "Estimate report saved",
        description: "Estimate report saved as an image with metadata.",
      });
      setAriaMessage("Estimate report saved successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown export error";
      toast({
        title: "Error",
        description: `Failed to save estimate report: ${message}`,
        variant: "destructive",
      });
      setAriaMessage("Failed to save estimate report.");
    } finally {
      componentRef.current?.removeAttribute("aria-busy");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div aria-live="polite" className="sr-only" role="status">{ariaMessage}</div>
      <div ref={componentRef} className="export-sheet">
        <div className="mb-4 flex justify-end">
          <Button className="cinematic-button" onClick={handleSaveEstimate} type="button">
            Save Estimate Report
          </Button>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-slate-950">Effort Estimate Summary</h2>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead className="text-slate-700">Category</TableHead>
              <TableHead className="text-right text-slate-700">Effort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Total Effort</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(totalEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Core Effort</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(coreEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Supervised Effort</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(supervisedEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Contingency ({(contingencyPercentage * 100).toFixed(1)}%)</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(contingencyEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Project Management</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(pmEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Solution Architect</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(saEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">SDD</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(sddEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">Release and Configuration Guide</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(releaseConfigEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200">
              <TableCell className="text-slate-700">User Manual</TableCell>
              <TableCell className="text-right font-semibold text-slate-950">{formatHours(userManualEffort)}</TableCell>
            </TableRow>
            <TableRow className="border-slate-200 bg-cyan-50">
              <TableCell className="font-bold text-cyan-950">Grand Total Effort</TableCell>
              <TableCell className="text-right font-bold text-cyan-950">{formatHours(grandTotalEffort)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EstimateReport;
