import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import ReportPageClient from "./ReportPageClient";

let projectId = "project-1";
let hydrated = true;
let activeProject: Project | undefined;

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: (key: string) => key === "id" ? projectId : null }),
}));

jest.mock("@/hooks/use-projects", () => ({
  useProjects: () => ({
    hydrated,
    getProject: (id: string) => id === activeProject?.id ? activeProject : undefined,
  }),
}));

function project(): Project {
  return {
    id: "project-1",
    name: "Printable project",
    description: "Report route fixture.",
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    overheadPercentages: { ...DEFAULT_OVERHEAD },
    activities: [{
      id: "activity-1",
      applicationName: "SAP",
      adapter: "",
      activityName: "Build workflow",
      activityType: "Development",
      coreSupervised: "core",
      reused: false,
      effort: 8,
      businessException: "",
      assumption: "",
      rpaTool: "",
      applicationType: "",
      detailedActivityType: "development",
      exceptionHandlingComplexity: "low",
    }],
  };
}

describe("ReportPageClient", () => {
  beforeEach(() => {
    projectId = "project-1";
    hydrated = true;
    activeProject = project();
    jest.spyOn(window, "print").mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it("waits for browser storage hydration", () => {
    hydrated = false;
    render(<ReportPageClient />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading report data");
  });

  it("does not print when the project is missing", () => {
    activeProject = undefined;
    render(<ReportPageClient />);
    expect(screen.getByRole("heading", { name: "Report unavailable" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Print/i })).not.toBeInTheDocument();
  });

  it("renders only the print surface and prints through explicit action", () => {
    render(<ReportPageClient />);
    expect(screen.getByRole("heading", { name: "Printable project" })).toBeInTheDocument();
    expect(screen.getByText("Print-ready report")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Print / Save PDF" }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
