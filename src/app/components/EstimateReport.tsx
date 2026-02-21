"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

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
import { cn } from "@/lib/utils";

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

  const rows = [
    { label: "Total Effort", value: totalEffort },
    { label: "Core Effort", value: coreEffort },
    { label: "Supervised Effort", value: supervisedEffort },
    { label: `Contingency (${(contingencyPercentage * 100).toFixed(1)}%)`, value: contingencyEffort },
    { label: "Project Management (5%)", value: pmEffort },
    { label: "Solution Architect (5%)", value: saEffort },
    { label: "SDD (5%)", value: sddEffort },
    { label: "Config & Release (2.5%)", value: releaseConfigEffort },
    { label: "User Manual (2.5%)", value: userManualEffort },
    { label: "Grand Total Effort", value: grandTotalEffort },
  ];

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

    try {
      componentRef.current.setAttribute("aria-busy", "true");
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      saveAs(canvas.toDataURL("image/png"), "estimate_report.png");
      toast({
        title: "Estimate report saved",
        description: "Estimate report saved as an image.",
      });
      setAriaMessage("Estimate report saved successfully.");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save estimate report: ${error.message}`,
        variant: "destructive",
      });
      setAriaMessage("Failed to save estimate report.");
    } finally {
      componentRef.current.removeAttribute("aria-busy");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div aria-live="polite" className="sr-only" role="status">
        {ariaMessage}
      </div>
      <div ref={componentRef} className="rounded-md border bg-background p-4">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleSaveEstimate}>
            Save Estimate Report
          </Button>
        </div>

        <h2 className="mb-3 text-xl font-semibold">Effort Estimate Summary</h2>
        <Table className="rounded-md border">
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Effort (hours)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={`${row.label}-${index}`}
                className={cn(
                  "odd:bg-background even:bg-muted/20",
                  row.label === "Grand Total Effort" && "bg-muted/40 font-semibold",
                )}
              >
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-right">{row.value.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EstimateReport;
