import { fireEvent, render, screen } from "@testing-library/react";
import { createCurrentStateProcess } from "@/domain/discovery";
import { ProcessWorkspace } from "./ProcessWorkspace";

const operations = {
  saveRawProcessInput: jest.fn(),
  parseRawProcessInput: jest.fn(),
  saveCandidateReview: jest.fn(),
  normalizeProcess: jest.fn(),
  validateProcess: jest.fn(),
  connectLinearSteps: jest.fn(),
};

jest.mock("@/hooks/use-projects", () => ({ useProjects: () => operations }));

describe("ProcessWorkspace", () => {
  beforeEach(() => jest.clearAllMocks());

  it("captures raw text and requests an explicit deterministic parse", () => {
    const process = createCurrentStateProcess("project-1", "process-1", "2026-07-15T00:00:00.000Z");
    render(<ProcessWorkspace projectId="project-1" process={process} onClose={jest.fn()} />);
    expect(screen.getByRole("heading", { name: "Current-State Process" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Raw process description"), { target: { value: "1. Start\n2. End" } });
    fireEvent.click(screen.getByRole("button", { name: "Parse candidates" }));
    expect(operations.saveRawProcessInput).toHaveBeenCalledTimes(1);
    expect(operations.parseRawProcessInput).toHaveBeenCalledTimes(1);
  });

  it("renders an honest empty structured-flow state", () => {
    const process = createCurrentStateProcess("project-1", "process-1", "2026-07-15T00:00:00.000Z");
    render(<ProcessWorkspace projectId="project-1" process={process} onClose={jest.fn()} />);
    expect(screen.getByText("No structured process steps yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Validate process" })).not.toBeInTheDocument();
  });
});
