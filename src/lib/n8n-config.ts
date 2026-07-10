export type N8nOperation =
  | "analyzeEstimate"
  | "estimateDefaults"
  | "summarizeActivities"
  | "parseSteps";

export interface N8nConfig {
  webhookBaseUrl?: string;
  analyzeEstimateUrl?: string;
  estimateDefaultsUrl?: string;
  summarizeActivitiesUrl?: string;
  parseStepsUrl?: string;
}

export const N8N_CONFIG_STORAGE_KEY = "te_n8n_config";

const OPERATION_PATHS: Record<N8nOperation, string> = {
  analyzeEstimate: "analyze-estimate",
  estimateDefaults: "estimate-defaults",
  summarizeActivities: "summarize-activities",
  parseSteps: "parse-steps",
};

const DIRECT_URL_KEYS: Record<N8nOperation, keyof N8nConfig> = {
  analyzeEstimate: "analyzeEstimateUrl",
  estimateDefaults: "estimateDefaultsUrl",
  summarizeActivities: "summarizeActivitiesUrl",
  parseSteps: "parseStepsUrl",
};

const CONFIG_KEYS: Array<keyof N8nConfig> = [
  "webhookBaseUrl",
  "analyzeEstimateUrl",
  "estimateDefaultsUrl",
  "summarizeActivitiesUrl",
  "parseStepsUrl",
];

const ENV_CONFIG: N8nConfig = {
  webhookBaseUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL,
  analyzeEstimateUrl: process.env.NEXT_PUBLIC_N8N_ANALYZE_ESTIMATE_URL,
  estimateDefaultsUrl: process.env.NEXT_PUBLIC_N8N_ESTIMATE_DEFAULTS_URL,
  summarizeActivitiesUrl: process.env.NEXT_PUBLIC_N8N_SUMMARIZE_ACTIVITIES_URL,
  parseStepsUrl: process.env.NEXT_PUBLIC_N8N_PARSE_STEPS_URL,
};

function cleanValue(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function normalizeN8nConfig(config: N8nConfig): N8nConfig {
  const normalized: N8nConfig = {};

  for (const key of CONFIG_KEYS) {
    const value = cleanValue(config[key]);
    if (!value) continue;
    normalized[key] = trimTrailingSlash(value);
  }

  return normalized;
}

export function mergeN8nConfig(base: N8nConfig, overrides: N8nConfig): N8nConfig {
  const merged: N8nConfig = { ...base };

  for (const key of CONFIG_KEYS) {
    const overrideValue = cleanValue(overrides[key]);
    if (overrideValue !== undefined) {
      merged[key] = overrideValue;
    }
  }

  return normalizeN8nConfig(merged);
}

export function readEnvN8nConfig(): N8nConfig {
  return normalizeN8nConfig(ENV_CONFIG);
}

export function readStoredN8nConfig(): N8nConfig {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(N8N_CONFIG_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as N8nConfig;
    return normalizeN8nConfig(parsed);
  } catch {
    return {};
  }
}

export function getMergedN8nConfig(): N8nConfig {
  return mergeN8nConfig(readEnvN8nConfig(), readStoredN8nConfig());
}

export function resolveN8nWebhookUrl(
  operation: N8nOperation,
  config: N8nConfig = getMergedN8nConfig(),
): string | null {
  const directKey = DIRECT_URL_KEYS[operation];
  const directUrl = cleanValue(config[directKey]);
  if (directUrl) return trimTrailingSlash(directUrl);

  const baseUrl = cleanValue(config.webhookBaseUrl);
  if (!baseUrl) return null;

  return `${trimTrailingSlash(baseUrl)}/${OPERATION_PATHS[operation]}`;
}

export function isN8nConfigured(config: N8nConfig = getMergedN8nConfig()): boolean {
  return (Object.keys(OPERATION_PATHS) as N8nOperation[]).some(
    (operation) => Boolean(resolveN8nWebhookUrl(operation, config)),
  );
}
