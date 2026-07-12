import { analyzeEstimate } from "@/ai/client/estimate-analysis";
import { getEstimateDefaults } from "@/ai/client/estimate-defaults";
import { summarizeActivities } from "@/ai/client/estimate-summary";
import { parseSteps } from "@/ai/client/parse-steps";
import { N8N_CONFIG_STORAGE_KEY } from "@/lib/n8n-config";

describe("local estimation fallbacks", () => {
  beforeEach(() => {
    window.localStorage.removeItem(N8N_CONFIG_STORAGE_KEY);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("estimates effort without an n8n endpoint", async () => {
    await expect(
      analyzeEstimate({ activityDescription: "Integrate an API connector" }),
    ).resolves.toMatchObject({
      suggestedEffort: 4,
      source: "heuristic",
    });
  });

  it("returns safe overhead defaults without an n8n endpoint", async () => {
    await expect(
      getEstimateDefaults({ projectType: "RPA automation" }),
    ).resolves.toEqual({
      contingency: 0.15,
      pm: 0.05,
      sa: 0.05,
      sdd: 0.05,
      releaseConfig: 0.025,
      userManual: 0.025,
      source: "heuristic",
    });
  });

  it("summarizes and parses activities locally", async () => {
    await expect(
      summarizeActivities({ activities: JSON.stringify([{ id: "one" }]) }),
    ).resolves.toMatchObject({
      source: "heuristic",
      summary: expect.stringContaining("1 activities"),
    });

    await expect(
      parseSteps({
        steps: "1. Login to SAP\n2. Extract pending invoices",
        rpaTool: "UiPath",
        applicationContext: "SAP ERP",
      }),
    ).resolves.toMatchObject({
      source: "heuristic",
      activities: [
        expect.objectContaining({ activityName: "Login to SAP" }),
        expect.objectContaining({ activityName: "Extract pending invoices" }),
      ],
    });
  });
});
