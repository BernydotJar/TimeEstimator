import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DEFAULT_OVERHEAD, type Project } from "@/app/types";
import ProjectPageClient from "@/app/project/ProjectPageClient";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let searchParams = new URLSearchParams("id=project-1");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => searchParams,
}));

function createPersistedProject(): Project {
  return {
    id: "project-1",
    name: "Invoice Automation",
    description: "SAP invoice intake",
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
    activities: [],
    overheadPercentages: { ...DEFAULT_OVERHEAD },
  };
}

describe("ProjectPageClient", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    searchParams = new URLSearchParams("id=project-1");
    window.localStorage.setItem(
      "te_projects",
      JSON.stringify([createPersistedProject()]),
    );
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("loads a persisted project after hydration and recalculates after activity entry", async () => {
    render(<ProjectPageClient />);

    expect(
      await screen.findByRole("heading", { name: "Invoice Automation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("SAP invoice intake")).toBeInTheDocument();
    expect(screen.getAllByText("0.0h").length).toBeGreaterThan(0);
    expect(mockReplace).not.toHaveBeenCalled();

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

  it("redirects an unknown project only after local storage hydration", async () => {
    searchParams = new URLSearchParams("id=missing-project");

    render(<ProjectPageClient />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("fails safely and redirects when local storage contains corrupt JSON", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    window.localStorage.setItem("te_projects", "{not-valid-json");

    render(<ProjectPageClient />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
    expect(console.error).toHaveBeenCalledWith(
      "useLocalStorage read error:",
      expect.any(SyntaxError),
    );
  });
});
