import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import ProjectPageClient from "@/app/project/ProjectPageClient";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("id=project-1"),
}));

describe("ProjectPageClient", () => {
  beforeEach(() => {
    mockPush.mockClear();
    const project: Project = {
      id: "project-1",
      name: "Invoice Automation",
      description: "SAP invoice intake",
      createdAt: "2026-07-11T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z",
      activities: [],
      overheadPercentages: { ...DEFAULT_OVERHEAD },
    };
    window.localStorage.setItem("te_projects", JSON.stringify([project]));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("loads a persisted project and recalculates after activity entry", async () => {
    render(<ProjectPageClient />);

    expect(
      screen.getByRole("heading", { name: "Invoice Automation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("SAP invoice intake")).toBeInTheDocument();
    expect(screen.getAllByText("0.0h").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Application Name"), {
      target: { value: "SAP ERP" },
    });
    fireEvent.change(screen.getByLabelText("Activity Name"), {
      target: { value: "Extract pending invoices" },
    });
    fireEvent.change(screen.getByLabelText("Estimated Effort (hours)"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));

    await waitFor(() =>
      expect(screen.getAllByText("Extract pending invoices").length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText("4.0h").length).toBeGreaterThan(0);

    const stored = JSON.parse(
      window.localStorage.getItem("te_projects") ?? "[]",
    ) as Project[];
    expect(stored[0].activities).toEqual([
      expect.objectContaining({
        applicationName: "SAP ERP",
        activityName: "Extract pending invoices",
        effort: 4,
      }),
    ]);
  });
});
