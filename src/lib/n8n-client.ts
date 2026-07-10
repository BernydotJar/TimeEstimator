import {
  getMergedN8nConfig,
  N8nOperation,
  resolveN8nWebhookUrl,
} from "@/lib/n8n-config";

type N8nErrorCode =
  | "NOT_CONFIGURED"
  | "NETWORK"
  | "HTTP"
  | "INVALID_RESPONSE";

export class N8nClientError extends Error {
  code: N8nErrorCode;
  status?: number;

  constructor(message: string, code: N8nErrorCode, status?: number) {
    super(message);
    this.name = "N8nClientError";
    this.code = code;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapN8nPayload<T>(payload: unknown): T {
  if (Array.isArray(payload) && payload.length === 1) {
    return unwrapN8nPayload<T>(payload[0]);
  }

  if (isRecord(payload)) {
    if (payload.success === false) {
      const detail =
        typeof payload.error === "string"
          ? payload.error
          : typeof payload.message === "string"
            ? payload.message
            : "n8n returned an explicit failure response.";
      throw new N8nClientError(detail, "INVALID_RESPONSE");
    }

    for (const key of ["data", "result", "output"]) {
      const candidate = payload[key];
      if (candidate !== undefined) return unwrapN8nPayload<T>(candidate);
    }
  }

  return payload as T;
}

export async function invokeN8n<T>(
  operation: N8nOperation,
  input: unknown,
  timeoutMs = 30000,
): Promise<T> {
  const config = getMergedN8nConfig();
  const endpoint = resolveN8nWebhookUrl(operation, config);

  if (!endpoint) {
    throw new N8nClientError(
      `No n8n webhook configured for operation "${operation}".`,
      "NOT_CONFIGURED",
    );
  }

  const payload = isRecord(input) ? input : { input };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-time-estimator-operation": operation,
    };

    if (config.bearerToken) {
      headers.Authorization = `Bearer ${config.bearerToken}`;
    }

    if (config.apiKey) {
      headers["x-api-key"] = config.apiKey;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        operation,
        input,
        ...payload,
        _source: "time-estimator",
        _timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new N8nClientError(
        `n8n webhook failed with status ${response.status}.`,
        "HTTP",
        response.status,
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new N8nClientError(
        "n8n webhook response is not valid JSON.",
        "INVALID_RESPONSE",
      );
    }

    return unwrapN8nPayload<T>(json);
  } catch (error) {
    if (error instanceof N8nClientError) throw error;

    const aborted = error instanceof Error && error.name === "AbortError";
    throw new N8nClientError(
      aborted ? "n8n webhook request timed out." : "n8n webhook is unreachable.",
      "NETWORK",
    );
  } finally {
    clearTimeout(timeout);
  }
}
