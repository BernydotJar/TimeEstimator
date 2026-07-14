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

interface N8nRequestEnvelope {
  version: "1.0";
  operation: N8nOperation;
  requestId: string;
  input: unknown;
  meta: {
    source: "time-estimator";
    timestamp: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readErrorMessage(payload: Record<string, unknown>): string {
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;

  if (isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message;
  }

  return "n8n returned an explicit failure response.";
}

function unwrapN8nPayload<T>(payload: unknown): T {
  if (Array.isArray(payload) && payload.length === 1) {
    return unwrapN8nPayload<T>(payload[0]);
  }

  if (isRecord(payload)) {
    if (payload.ok === false || payload.success === false) {
      throw new N8nClientError(readErrorMessage(payload), "INVALID_RESPONSE");
    }

    if (payload.ok === true && payload.data !== undefined) {
      return unwrapN8nPayload<T>(payload.data);
    }

    for (const key of ["data", "result", "output"]) {
      const candidate = payload[key];
      if (candidate !== undefined) return unwrapN8nPayload<T>(candidate);
    }
  }

  return payload as T;
}

function createRequestEnvelope(
  operation: N8nOperation,
  input: unknown,
): N8nRequestEnvelope {
  return {
    version: "1.0",
    operation,
    requestId: crypto.randomUUID(),
    input,
    meta: {
      source: "time-estimator",
      timestamp: new Date().toISOString(),
    },
  };
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-time-estimator-operation": operation,
      },
      body: JSON.stringify(createRequestEnvelope(operation, input)),
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
