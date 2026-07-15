import { fireEvent, render, screen } from "@testing-library/react";
import { createAssessment } from "@/domain/discovery";
import { AssessmentWorkspace } from "./AssessmentWorkspace";

const NOW = "2026-07-15T00:00:00.000Z";

describe("AssessmentWorkspace", () => {
  it("shows deterministic progress and emits explicit unknown answers", () => {
    const assessment = createAssessment("project-1", "assessment-1", NOW);
    const onChange = jest.fn();
    render(<AssessmentWorkspace assessment={assessment} onChange={onChange} onReady={jest.fn()} onClose={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Project Assessment" })).toBeInTheDocument();
    expect(screen.getByText("0%" )).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "unknown" })[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].sections[0].questions[0].answer.state).toBe("unknown");
  });

  it("provides previous and next controls for the linear phone flow", () => {
    render(<AssessmentWorkspace assessment={createAssessment("project-1", "assessment-1", NOW)} onChange={jest.fn()} onReady={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "Current-State Process" })).toBeInTheDocument();
  });
});
