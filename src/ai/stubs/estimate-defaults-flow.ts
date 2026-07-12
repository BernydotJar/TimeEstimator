import { invokeN8n } from "@/lib/n8n-client";

export interface EstimateDefaultsInput {
  projectType: string;
}

export interface EstimateDefaultsOutput {
  contingency: number;
  pm: number;
  sa: number;
  sdd: number;
  releaseConfig: number;
  userManual: number;
  source: "n8n" | "heuristic";
}

const FALLBACK_DEFAULTS: Omit<EstimateDefaultsOutput, "source"> = {
  contingency: 0.15,
  pm: 0.05,
  sa: 0.05,
  sdd: 0.05,
  releaseConfig: 0.025,
  userManual: 0.025,
};

function normalizePercentage(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  if (parsed > 1) return Math.min(parsed, 100) / 100;
  return Math.min(parsed, 1);
}

export async function getEstimateDefaults(
  input: EstimateDefaultsInput,
): Promise<EstimateDefaultsOutput> {
  try {
    const result = await invokeN8n<Partial<EstimateDefaultsOutput>>(
      "estimateDefaults",
      input,
    );

    return {
      contingency: normalizePercentage(
        result.contingency,
        FALLBACK_DEFAULTS.contingency,
      ),
      pm: normalizePercentage(result.pm, FALLBACK_DEFAULTS.pm),
      sa: normalizePercentage(result.sa, FALLBACK_DEFAULTS.sa),
      sdd: normalizePercentage(result.sdd, FALLBACK_DEFAULTS.sdd),
      releaseConfig: normalizePercentage(
        result.releaseConfig,
        FALLBACK_DEFAULTS.releaseConfig,
      ),
      userManual: normalizePercentage(
        result.userManual,
        FALLBACK_DEFAULTS.userManual,
      ),
      source: "n8n",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("getEstimateDefaults fallback activated:", error);
    }
    return { ...FALLBACK_DEFAULTS, source: "heuristic" };
  }
}
