"use client";

import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { buildReportFilename, type ReportViewModel } from "@/domain/reporting";

export type ExportStage = "preparing" | "capturing" | "saving";

export async function exportExecutiveSummaryPng(
  node: HTMLElement,
  model: ReportViewModel,
  onStage?: (stage: ExportStage) => void,
): Promise<string> {
  onStage?.("preparing");
  await document.fonts?.ready;
  onStage?.("capturing");
  const canvas = await html2canvas(node, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: node.scrollWidth,
    height: Math.min(node.scrollHeight, 1200),
    windowWidth: node.scrollWidth,
    windowHeight: Math.min(node.scrollHeight, 1200),
  });
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("The browser could not encode the executive summary PNG.")), "image/png");
  });
  onStage?.("saving");
  const filename = buildReportFilename(model.metadata.projectName, model.metadata.generatedAt, model.metadata.reportVersion, "png");
  saveAs(blob, filename);
  return filename;
}

export function buildPrintReportUrl(projectId: string): string {
  const url = new URL("../report/", window.location.href);
  url.searchParams.set("id", projectId);
  return url.toString();
}
