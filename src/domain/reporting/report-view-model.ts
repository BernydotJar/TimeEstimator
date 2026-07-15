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

export interface ReportDistributionItem {
  label: string;
  hours: number;
}

export interface ReportActivityRow {
  id: string;
  activityName: string;
  applicationName: string;
  activityType: string;
  coreSupervised: string;
  effortHours: number;
  assumption: string;
  rationale: string;
}

export interface ReportViewModel {
  schemaVersion: number;
  metadata: {
    projectId: string;
    projectName: string;
    generatedAt: string;
    generatedDateLabel: string;
    reportVersion: string;
    viewModelVersion: string;
    estimateDraftId?: string;
    artifactVersion?: number;
  };
  projectOverview: {
    description: string;
  };
  summary: {
    activityCount: number;
    baseEffortHours: number;
    overheadHours: number;
    grandTotalHours: number;
    coreHours: number;
    supervisedHours: number;
  };
  scenarios: {
    available: boolean;
    optimistic?: number;
    expected?: number;
    conservative?: number;
  };
  confidence: {
    policyApproved: boolean;
    score?: number;
    band?: string;
    rationale: string[];
  };
  metrics: ReportMetric[];
  overheads: Array<{ key: OverheadKey; label: string; percentage: number; hours: number }>;
  effortDistribution: ReportDistributionItem[];
  majorDrivers: string[];
  risks: string[];
  assumptions: string[];
  exclusions: string[];
  activities: ReportActivityRow[];
  integrations: Array<{ id: string; name: string; kind: string; access: string }>;
  artifacts: Array<{ id: string; type: string; title: string; status: string; version: number }>;
  traceability: TraceabilityReference[];
  warnings: string[];
}

export function buildReportViewModel(project: Project, generatedAt: string): ReportViewModel {
  const draft = activeDraft(project);
  const activities = project.activities.map(toActivityRow);
  const baseEffortHours = sum(activities.map((activity) => activity.effortHours));
  const coreHours = sum(activities.filter((activity) => activity.coreSupervised === "core").map((activity) => activity.effortHours));
  const supervisedHours = sum(activities.filter((activity) => activity.coreSupervised === "supervised").map((activity) => activity.effortHours));
  const overheads = (Object.keys(project.overheadPercentages) as OverheadKey[]).map((key) => ({
    key,
    label: OVERHEAD_LABELS[key],
    percentage: safeNumber(project.overheadPercentages[key]),
    hours: baseEffortHours * safeNumber(project.overheadPercentages[key]),
  }));
  const overheadHours = sum(overheads.map((item) => item.hours));
  const effortDistribution = aggregate(project.activities, (activity) => activity.activityType || "Unclassified")
    .sort((a, b) => b.hours - a.hours || a.label.localeCompare(b.label));
  const process = project.discovery?.processes.find((item) => item.id === project.discovery?.activeProcessId) ?? project.discovery?.processes.at(-1);
  const integrations = process?.systems.map((system) => ({
    id: system.id,
    name: system.name,
    kind: system.kind,
    access: system.accessStatus ?? "unknown",
  })) ?? [];
  const assumptions = unique(project.activities.map((activity) => activity.assumption?.trim()).filter(Boolean) as string[]);
  const risks = unique([
    ...(draft?.proposals.flatMap((proposal) => proposal.unknowns ?? []) ?? []),
    ...(draft?.warnings ?? []),
    ...(project.activities.map((activity) => activity.businessException?.trim()).filter(Boolean) as string[]),
  ]);
  const exclusions = unique(draft?.proposals.flatMap((proposal) => proposal.exclusions ?? []) ?? []);
  const scenarioMap = new Map((draft?.scenarios ?? []).map((scenario) => [scenario.kind, safeNumber(scenario.totalHours)]));
  const scenariosAvailable = scenarioMap.size > 0;
  const confidenceScore = scenariosAvailable && Number.isFinite(draft?.confidence.score) ? draft?.confidence.score : undefined;
  const confidenceBand = scenariosAvailable ? draft?.confidence.band : undefined;
  const latestArtifact = [...(project.discovery?.artifacts ?? [])].sort((a, b) => b.version - a.version)[0];
  const traceability = uniqueRefs([
    ...(draft?.proposals.flatMap((proposal) => proposal.sourceRefs) ?? []),
    ...(project.discovery?.artifacts.flatMap((artifact) => artifact.sections.flatMap((section) => section.sourceRefs)) ?? []),
  ]);
  const reportVersion = String(draft?.version ?? latestArtifact?.version ?? 1);
  const warnings = unique([
    ...(activities.length ? [] : ["No approved activities are available for reporting."]),
    ...(scenariosAvailable ? [] : ["Scenario totals are unavailable; no range is asserted."]),
  ]);

  return {
    schemaVersion: 1,
    metadata: {
      projectId: project.id,
      projectName: project.name,
      generatedAt,
      generatedDateLabel: formatDate(generatedAt),
      reportVersion,
      viewModelVersion: REPORT_VIEW_MODEL_VERSION,
      estimateDraftId: draft?.id,
      artifactVersion: latestArtifact?.version,
    },
    projectOverview: { description: project.description },
    summary: {
      activityCount: activities.length,
      baseEffortHours,
      overheadHours,
      grandTotalHours: baseEffortHours + overheadHours,
      coreHours,
      supervisedHours,
    },
    scenarios: {
      available: scenariosAvailable,
      optimistic: scenarioMap.get("optimistic"),
      expected: scenarioMap.get("expected"),
      conservative: scenarioMap.get("conservative"),
    },
    confidence: {
      policyApproved: scenariosAvailable && confidenceScore != null,
      score: confidenceScore,
      band: confidenceBand,
      rationale: scenariosAvailable ? draft?.confidence.rationale ?? [] : ["Confidence policy pending approval."],
    },
    metrics: [
      { id: "activities", label: "Activities", value: activities.length, unit: "count" },
      { id: "base", label: "Base effort", value: baseEffortHours, unit: "hours" },
      { id: "overhead", label: "Overhead", value: overheadHours, unit: "hours" },
      { id: "total", label: "Grand total", value: baseEffortHours + overheadHours, unit: "hours" },
    ],
    overheads,
    effortDistribution,
    majorDrivers: [...activities]
      .sort((a, b) => b.effortHours - a.effortHours || a.activityName.localeCompare(b.activityName))
      .map((activity) => `${activity.activityName} — ${activity.effortHours.toFixed(1)}h`),
    risks,
    assumptions,
    exclusions,
    activities,
    integrations,
    artifacts: summarizeArtifacts(project.discovery?.artifacts ?? []),
    traceability,
    warnings,
  };
}

export function buildReportFilename(
  projectName: string,
  generatedAt: string,
  version: string,
  extension: "png" | "pdf",
): string {
  const safeName = sanitizeFilename(projectName || "project").toLowerCase();
  const date = generatedAt.slice(0, 10).replaceAll("-", "");
  const cleanVersion = sanitizeFilename(version).replace(/^v+/i, "").slice(0, 20) || "1";
  const descriptor = extension === "png" ? "executive-estimate" : "estimate-report";
  const suffix = `_${descriptor}_${date}_v${cleanVersion}.${extension}`;
  return `${safeName.slice(0, Math.max(1, 96 - suffix.length))}${suffix}`;
}

export function executiveSummaryFilename(model: ReportViewModel): string {
  return buildReportFilename(model.metadata.projectName, model.metadata.generatedAt, model.metadata.reportVersion, "png");
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
    activityName: activity.activityName || "Unnamed activity",
    applicationName: activity.applicationName || "Unknown",
    activityType: activity.activityType || "Unknown",
    coreSupervised: activity.coreSupervised || "Unknown",
    effortHours: safeNumber(activity.effort),
    assumption: activity.assumption || "",
    rationale: activity.assumption || activity.businessException || "No rationale recorded.",
  };
}

function aggregate(activities: Activity[], key: (activity: Activity) => string): ReportDistributionItem[] {
  const totals = new Map<string, number>();
  for (const activity of activities) totals.set(key(activity), (totals.get(key(activity)) ?? 0) + safeNumber(activity.effort));
  return [...totals.entries()].map(([label, hours]) => ({ label, hours }));
}

function summarizeArtifacts(artifacts: DocumentationArtifact[]) {
  return artifacts.map((artifact) => ({ id: artifact.id, type: artifact.type, title: artifact.title, status: artifact.status, version: artifact.version }));
}

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "project";
}
function formatDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(parsed);
}
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
