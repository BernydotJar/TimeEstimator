import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import { buildReportFilename, buildReportViewModel } from "./report-view-model";

const NOW = "2026-07-15T07:30:00.000Z";

function project(): Project {
  return {
    id: "project-1",
    name: "Finance / AP: Modernization",
    description: "Invoice automation discovery.",
    createdAt: NOW,
    updatedAt: NOW,
    overheadPercentages: { ...DEFAULT_OVERHEAD },
    activities: [
      {
        id: "activity-1",
        applicationName: "SAP",
        adapter: "",
        activityName: "Validate invoice",
        activityType: "business_rules",
        coreSupervised: "core",
        reused: false,
        effort: 10,
        businessException: "Missing PO",
        assumption: "Invoice format remains stable.",
        rpaTool: "",
        applicationType: "",
        detailedActivityType: "process_design",
        exceptionHandlingComplexity: "medium",
      },
      {
        id: "activity-2",
        applicationName: "Email",
        adapter: "",
        activityName: "Notify reviewer",
        activityType: "notification",
        coreSupervised: "supervised",
        reused: false,
        effort: 2,
        businessException: "",
        assumption: "",
        rpaTool: "",
        applicationType: "",
        detailedActivityType: "development",
        exceptionHandlingComplexity: "low",
      },
    ],
  };
}

describe("report view model", () => {
  it("centralizes existing totals without hidden scenario values", () => {
    const source = project();
    const model = buildReportViewModel(source, NOW);

    expect(model.summary.baseEffortHours).toBe(12);
    expect(model.summary.coreHours).toBe(10);
    expect(model.summary.supervisedHours).toBe(2);
    expect(model.summary.overheadHours).toBeCloseTo(4.2);
    expect(model.summary.grandTotalHours).toBeCloseTo(16.2);
    expect(model.scenarios.available).toBe(false);
    expect(model.scenarios.expected).toBeUndefined();
    expect(model.confidence.policyApproved).toBe(false);
    expect(source.activities).toHaveLength(2);
  });

  it("normalizes drivers, risks, assumptions and distribution deterministically", () => {
    const first = buildReportViewModel(project(), NOW);
    const second = buildReportViewModel(project(), NOW);

    expect(first).toEqual(second);
    expect(first.majorDrivers[0]).toMatch(/Validate invoice/);
    expect(first.risks).toContain("Missing PO");
    expect(first.assumptions).toContain("Invoice format remains stable.");
    expect(first.effortDistribution).toEqual([
      { label: "business_rules", hours: 10 },
      { label: "notification", hours: 2 },
    ]);
  });

  it("builds bounded safe deterministic filenames", () => {
    expect(buildReportFilename("Finance / AP: Modernization", NOW, "v1", "png"))
      .toBe("finance_ap_modernization_executive-estimate_20260715_v1.png");
    expect(buildReportFilename("***", NOW, "1", "pdf")).toBe("project_estimate-report_20260715_v1.pdf");
    expect(buildReportFilename("x".repeat(200), NOW, "1", "png").length).toBeLessThanOrEqual(96);
  });
});
