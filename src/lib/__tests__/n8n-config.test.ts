import {
  normalizeN8nConfig,
  resolveN8nWebhookUrl,
} from "@/lib/n8n-config";

describe("n8n configuration", () => {
  it("accepts HTTPS endpoints and removes trailing slashes", () => {
    expect(
      normalizeN8nConfig({
        webhookBaseUrl: " https://automation.example.com/webhook/time/ ",
      }),
    ).toEqual({
      webhookBaseUrl: "https://automation.example.com/webhook/time",
    });
  });

  it("rejects insecure remote and malformed endpoints", () => {
    expect(
      normalizeN8nConfig({
        webhookBaseUrl: "http://automation.example.com/webhook",
        parseStepsUrl: "not-a-url",
      }),
    ).toEqual({});
  });

  it("allows HTTP for localhost development", () => {
    expect(
      resolveN8nWebhookUrl("parseSteps", {
        webhookBaseUrl: "http://localhost:5678/webhook/time-estimator",
      }),
    ).toBe("http://localhost:5678/webhook/time-estimator/parse-steps");
  });

  it("prefers an operation-specific endpoint", () => {
    expect(
      resolveN8nWebhookUrl("analyzeEstimate", {
        webhookBaseUrl: "https://automation.example.com/base",
        analyzeEstimateUrl: "https://automation.example.com/custom/analyze",
      }),
    ).toBe("https://automation.example.com/custom/analyze");
  });
});
