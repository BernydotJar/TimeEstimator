import { fireEvent, render, screen } from "@testing-library/react";
import Dashboard from "../page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockClear();
  });

  it("renders the empty project state", () => {
    render(<Dashboard />);

    expect(
      screen.getByRole("heading", { name: "TimeEstimator" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No estimation projects yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create First Project" }),
    ).toBeEnabled();
  });

  it("creates, persists, and opens a project", () => {
    render(<Dashboard />);

    fireEvent.click(
      screen.getByRole("button", { name: "Create First Project" }),
    );
    fireEvent.change(screen.getByLabelText("Project Name *"), {
      target: { value: "Invoice Automation" },
    });
    fireEvent.change(screen.getByLabelText("Description (optional)"), {
      target: { value: "SAP invoice intake" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create & Open" }));

    const projects = JSON.parse(
      window.localStorage.getItem("te_projects") ?? "[]",
    );
    expect(projects).toEqual([
      expect.objectContaining({
        name: "Invoice Automation",
        description: "SAP invoice intake",
      }),
    ]);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/project\?id=.+/),
    );
  });
});
