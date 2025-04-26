'use client';
import React, { useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
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

    const handleSaveEstimate = async () => {
        if (!componentRef.current) {
            toast({
                title: 'Error',
                description: 'Could not find estimate report to save.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const canvas = await html2canvas(componentRef.current, {
                scale: 2, // Increase scale for better resolution
                useCORS: true, // Enable cross-origin resource sharing
            });
            const dataURL = canvas.toDataURL('image/png');
            saveAs(dataURL, 'estimate_report.png');
            toast({
                title: 'Estimate Report Saved',
                description: 'Estimate report saved as an image.',
            });
        } catch (error: any) {
            console.error('Error saving estimate:', error);
            toast({
                title: 'Error',
                description: `Failed to save estimate report: ${error.message}`,
                variant: 'destructive',
            });
        }
    };

  return (
    <div className="container mx-auto p-4">
        <div ref={componentRef}>
            <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={handleSaveEstimate}>
                    Save Estimate Report
                </Button>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Effort Estimate Summary</h2>
            <Table className="min-w-full border border-blue-200 shadow-md rounded-lg">
                <TableHeader className="bg-blue-500 text-white">
                    <TableRow>
                        <TableHead className="text-left font-semibold text-sm uppercase tracking-wider p-3 border-b border-blue-300">
                            Category
                        </TableHead>
                        <TableHead className="text-right font-semibold text-sm uppercase tracking-wider p-3 border-b border-blue-300">
                            Effort (Hours)
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="p-3 border-b">Total Effort</TableCell>
                        <TableCell className="p-3 border-b text-right">{totalEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">Core Effort</TableCell>
                        <TableCell className="p-3 border-b text-right">{coreEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">Supervised Effort</TableCell>
                        <TableCell className="p-3 border-b text-right">{supervisedEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">Contingency ({contingencyPercentage * 100}%)</TableCell>
                        <TableCell className="p-3 border-b text-right">{contingencyEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">Project Management (5%)</TableCell>
                        <TableCell className="p-3 border-b text-right">{pmEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">Solution Architect (5%)</TableCell>
                        <TableCell className="p-3 border-b text-right">{saEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">SDD (5%)</TableCell>
                        <TableCell className="p-3 border-b text-right">{sddEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">Release and Configuration Guide (2.5%)</TableCell>
                        <TableCell className="p-3 border-b text-right">{releaseConfigEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 border-b">User Manual (2.5%)</TableCell>
                        <TableCell className="p-3 border-b text-right">{userManualEffort.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="p-3 font-bold text-blue-700">Grand Total Effort</TableCell>
                        <TableCell className="p-3 font-bold text-blue-700 text-right">{grandTotalEffort.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
  );
};

export default EstimateReport;
