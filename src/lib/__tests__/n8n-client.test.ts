import { invokeN8n } from "@/lib/n8n-client";
import { N8N_CONFIG_STORAGE_KEY } from "@/lib/n8n-config";

describe("n8n client", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("sends the versioned public webhook envelope", async () => {
    window.localStorage.setItem(
      N8N_CONFIG_STORAGE_KEY,
      JSON.stringify({
        webhookBaseUrl: "https://automation.example.com/webhook/time-estimator",
      }),
    );

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { suggestedEffort: 3.5 } }),
    } as Response);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    await expect(
      invokeN8n<{ suggestedEffort: number }>("analyzeEstimate", {
        activityDescription: "Validate invoices",
      }),
    ).resolves.toEqual({ suggestedEffort: 3.5 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://automation.example.com/webhook/time-estimator/analyze-estimate",
    );
    expect(request?.method).toBe("POST");

    const body = JSON.parse(String(request?.body));
    expect(body).toMatchObject({
      version: "1.0",
      operation: "analyzeEstimate",
      input: { activityDescription: "Validate invoices" },
      meta: { source: "time-estimator" },
    });
    expect(body.requestId).toEqual(expect.any(String));
    expect(body.meta.timestamp).toEqual(expect.any(String));
  });
});
