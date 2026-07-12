import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { StepsImportTab } from "@/app/components/StepsImportTab";

describe("StepsImportTab", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("imports process steps with the local parser", async () => {
    const onAddAll = jest.fn();
    render(<StepsImportTab onAddAll={onAddAll} />);

    fireEvent.change(screen.getByLabelText("Process Steps"), {
      target: {
        value: "1. Login to SAP\n2. Extract pending invoices",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Parse Steps" }));

    await waitFor(() =>
      expect(screen.getByText("Local parser:")).toBeInTheDocument(),
    );
    expect(screen.getByText("Login to SAP")).toBeInTheDocument();
    expect(screen.getByText("Extract pending invoices")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add 2 Activities to Estimate",
      }),
    );

    expect(onAddAll).toHaveBeenCalledTimes(1);
    expect(onAddAll).toHaveBeenCalledWith([
      expect.objectContaining({ activityName: "Login to SAP" }),
      expect.objectContaining({ activityName: "Extract pending invoices" }),
    ]);
  });
});
