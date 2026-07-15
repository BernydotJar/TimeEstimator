import type { Activity, OverheadKey, Project } from "@/app/types";
import { OVERHEAD_LABELS } from "@/app/types";
import type { DocumentationArtifact, EstimationDraft, TraceabilityReference } from "@/domain/discovery";

export const REPORT_VIEW_MODEL_VERSION = "1.0.0";

export interface ReportMetric {
  id: string;
  label: string;
  value: number;
  unit: "hours" | "count" | "percentage";
}

export interface ReportBreakdownItem {
  id: string;
  label: string;
  hours: number;
}

export interface ReportActivityRow {
  id: string;
  activity: string;
  application: string;
  phase: string;
  mode: string;
  hours: number;
  rationale: string;
}

export interface ReportViewModel {
  schemaVersion: number;
  reportVersion: string;
  generatedAt: string;
  project: { id: string; name: string; description: string };
  estimate: {
    draftId?: string;
    baseHours: number;
    overheadHours: number;
    grandTotalHours: number;
    coreHours: number;
    supervisedHours: number;
    scenarioTotals: Array<{ kind: string; hours: number }>;
    confidenceLabel: string;
    confidenceScore?: number;
  };
  metrics: ReportMetric[];
  overheads: Array<{ key: OverheadKey; label: string; percentage: number; hours: number }>;
  effortByType: ReportBreakdownItem[];
  majorDrivers: ReportBreakdownItem[];
  risksAndUnknowns: string[];
  assumptions: string[];
  exclusions: string[];
  activities: ReportActivityRow[];
  integrations: Array<{ id: string; name: string; kind: string; access: string }>;
  artifacts: Array<{ id: string; type: string; title: string; status: string; version: number }>;
  sourceRefs: TraceabilityReference[];
  warnings: string[];
}

export function buildReportViewModel(project: Project, generatedAt: string): ReportViewModel {
  const activities = project.activities.map(toActivityRow);
  const baseHours = sum(project.activities.map((activity) => safeNumber(activity.effort)));
  const coreHours = sum(project.activities.filter((activity) => activity.coreSupervised === "core").map((activity) => safeNumber(activity.effort)));
  const supervisedHours = sum(project.activities.filter((activity) => activity.coreSupervised === "supervised").map((activity) => safeNumber(activity.effort)));
  const overheads = (Object.keys(project.overheadPercentages) as OverheadKey[]).map((key) => ({
    key,
    label: OVERHEAD_LABELS[key],
    percentage: safeNumber(project.overheadPercentages[key]),
    hours: baseHours * safeNumber(project.overheadPercentages[key]),
  }));
  const overheadHours = sum(overheads.map((item) => item.hours));
  const draft = activeDraft(project);
  const effortByType = aggregate(project.activities, (activity) => activity.activityType || "Unclassified");
  const process = project.discovery?.processes.find((item) => item.id === project.discovery?.activeProcessId) ?? project.discovery?.processes.at(-1);
  const integrations = process?.systems.map((system) => ({
    id: system.id,
    name: system.name,
    kind: system.kind,
    access: system.accessStatus ?? "unknown",
  })) ?? [];
  const assumptions = unique(project.activities.map((activity) => activity.assumption?.trim()).filter(Boolean) as string[]);
  const risksAndUnknowns = unique([
    ...(draft?.proposals.flatMap((proposal) => proposal.unknowns ?? []) ?? []),
    ...(draft?.warnings ?? []),
    ...project.activities.map((activity) => activity.businessException?.trim()).filter(Boolean) as string[],
  ]);
  const exclusions = unique(draft?.proposals.flatMap((proposal) => proposal.exclusions ?? []) ?? []);
  const scenarioTotals = (draft?.scenarios ?? []).map((scenario) => ({ kind: scenario.kind, hours: scenario.totalHours }));
  const confidenceScore = Number.isFinite(draft?.confidence.score) && draft?.confidence.score !== 0 ? draft?.confidence.score : undefined;
  const confidenceLabel = draft?.scenarios.length ? draft.confidence.band : "Policy pending approval";
  const sourceRefs = uniqueRefs([
    ...(draft?.proposals.flatMap((proposal) => proposal.sourceRefs) ?? []),
    ...(project.discovery?.artifacts.flatMap((artifact) => artifact.sections.flatMap((section) => section.sourceRefs)) ?? []),
  ]);
  const warnings = unique([
    ...(activities.length ? [] : ["No approved activities are available for reporting."]),
    ...(draft?.scenarios.length ? [] : ["Scenario totals are unavailable; no range is asserted."]),
  ]);

  return {
    schemaVersion: 1,
    reportVersion: `${REPORT_VIEW_MODEL_VERSION}:${project.updatedAt}`,
    generatedAt,
    project: { id: project.id, name: project.name, description: project.description },
    estimate: {
      draftId: draft?.id,
      baseHours,
      overheadHours,
      grandTotalHours: baseHours + overheadHours,
      coreHours,
      supervisedHours,
      scenarioTotals,
      confidenceLabel,
      confidenceScore,
    },
    metrics: [
      { id: "activities", label: "Activities", value: activities.length, unit: "count" },
      { id: "base", label: "Base effort", value: baseHours, unit: "hours" },
      { id: "overhead", label: "Overhead", value: overheadHours, unit: "hours" },
      { id: "total", label: "Grand total", value: baseHours + overheadHours, unit: "hours" },
    ],
    overheads,
    effortByType,
    majorDrivers: [...effortByType].sort((a, b) => b.hours - a.hours).slice(0, 5),
    risksAndUnknowns,
    assumptions,
    exclusions,
    activities,
    integrations,
    artifacts: summarizeArtifacts(project.discovery?.artifacts ?? []),
    sourceRefs,
    warnings,
  };
}

export function executiveSummaryFilename(model: ReportViewModel): string {
  const safeName = sanitizeFilename(model.project.name || "project");
  const date = model.generatedAt.slice(0, 10).replaceAll("-", "");
  const version = sanitizeFilename(model.reportVersion).slice(0, 24);
  return `${safeName}_executive-estimate_${date}_v${version}.png`.slice(0, 120);
}

export function printReportPath(projectId: string, basePath = ""): string {
  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return `${normalizedBase}/report/?id=${encodeURIComponent(projectId)}`;
}

function activeDraft(project: Project): EstimationDraft | undefined {
  return project.discovery?.estimationDrafts.find((item) => item.id === project.discovery?.activeEstimationDraftId) ?? project.discovery?.estimationDrafts.at(-1);
}

function toActivityRow(activity: Activity): ReportActivityRow {
  return {
    id: activity.id,
    activity: activity.activityName || "Unnamed activity",
    application: activity.applicationName || "Unknown",
    phase: activity.detailedActivityType || activity.activityType || "Unknown",
    mode: activity.coreSupervised || "Unknown",
    hours: safeNumber(activity.effort),
    rationale: activity.assumption || activity.businessException || "No rationale recorded.",
  };
}

function aggregate(activities: Activity[], key: (activity: Activity) => string): ReportBreakdownItem[] {
  const totals = new Map<string, number>();
  for (const activity of activities) totals.set(key(activity), (totals.get(key(activity)) ?? 0) + safeNumber(activity.effort));
  return [...totals.entries()].map(([label, hours]) => ({ id: `breakdown:${slug(label)}`, label, hours }));
}

function summarizeArtifacts(artifacts: DocumentationArtifact[]) {
  return artifacts.map((artifact) => ({ id: artifact.id, type: artifact.type, title: artifact.title, status: artifact.status, version: artifact.version }));
}

function sanitizeFilename(value: string): string {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || "project";
}
function slug(value: string): string { return sanitizeFilename(value).toLowerCase(); }
function safeNumber(value: number): number { return Number.isFinite(value) ? value : 0; }
function sum(values: number[]): number { return values.reduce((total, value) => total + value, 0); }
function unique(values: string[]): string[] { return [...new Set(values.filter(Boolean))]; }
function uniqueRefs(refs: TraceabilityReference[]): TraceabilityReference[] {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.targetType}:${ref.targetId}:${ref.relation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
