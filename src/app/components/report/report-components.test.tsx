import { render, screen } from "@testing-library/react";
import type { ReportViewModel } from "@/domain/reporting";
import { ExecutiveSummaryCard, EXECUTIVE_SUMMARY_LOGICAL_WIDTH, EXECUTIVE_SUMMARY_MAX_HEIGHT } from "./ExecutiveSummaryCard";
import { PrintReport } from "./PrintReport";

const model: ReportViewModel = {
  schemaVersion: 1,
  metadata: {
    projectId: "project-1",
    projectName: "Large automation program",
    generatedAt: "2026-07-15T07:30:00.000Z",
    generatedDateLabel: "July 15, 2026",
    reportVersion: "1",
    viewModelVersion: "1.0.0",
  },
  projectOverview: { description: "A representative report." },
  summary: {
    activityCount: 12,
    baseEffortHours: 100,
    overheadHours: 35,
    grandTotalHours: 135,
    coreHours: 70,
    supervisedHours: 30,
  },
  scenarios: { available: false },
  confidence: { policyApproved: false, rationale: ["Pending approval."] },
  metrics: [],
  overheads: [{ key: "contingency", label: "Contingency", percentage: 0.15, hours: 15 }],
  effortDistribution: [{ label: "Development", hours: 70 }, { label: "Testing", hours: 30 }],
  majorDrivers: ["Driver 1", "Driver 2", "Driver 3", "Driver 4", "Driver 5", "Driver 6"],
  risks: ["Risk 1", "Risk 2", "Risk 3", "Risk 4", "Risk 5", "Risk 6"],
  assumptions: ["Stable inputs"],
  exclusions: ["Production support"],
  activities: [{
    id: "activity-1",
    activityName: "Build workflow",
    applicationName: "SAP",
    activityType: "Development",
    coreSupervised: "core",
    effortHours: 70,
    assumption: "Stable inputs",
    rationale: "Primary implementation activity.",
  }],
  integrations: [{ id: "system-1", name: "SAP", kind: "application", access: "known" }],
  artifacts: [],
  traceability: [],
  warnings: ["Scenario totals unavailable."],
};

describe("report surfaces", () => {
  it("keeps the executive summary bounded and truncates long lists", () => {
    render(<ExecutiveSummaryCard model={model} />);
    const summary = screen.getByLabelText(/Executive estimate summary/i);
    expect(summary).toHaveStyle({ width: `${EXECUTIVE_SUMMARY_LOGICAL_WIDTH}px`, maxHeight: `${EXECUTIVE_SUMMARY_MAX_HEIGHT}px` });
    expect(screen.getAllByText("+1 more")).toHaveLength(2);
    expect(screen.getByText(/Scenario policy is not yet available/i)).toBeInTheDocument();
    expect(screen.queryByText("Driver 6")).not.toBeInTheDocument();
  });

  it("renders a complete semantic print report with honest scenario fallback", () => {
    render(<PrintReport model={model} />);
    expect(screen.getByRole("heading", { name: "Large automation program" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity breakdown" })).toBeInTheDocument();
    expect(screen.getByText(/no range is asserted/i)).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "" })).toBeInTheDocument();
    expect(screen.getByText("Build workflow")).toBeInTheDocument();
  });
});
