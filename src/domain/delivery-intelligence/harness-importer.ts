import {
  GRAPH_HARNESS_EVENT_SCHEMA_VERSION,
  GRAPH_HARNESS_EVENT_TYPES,
  type GraphHarnessEventV1,
  type HarnessImportResult,
  type ImportedHarnessEvent,
} from "./types";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export class HarnessImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HarnessImportError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  lineNumber: number,
): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new HarnessImportError(`Line ${lineNumber}: ${key} must be a non-empty string.`);
  }
  return value;
}

function requireNullableString(
  record: Record<string, unknown>,
  key: string,
  lineNumber: number,
): string | null {
  const value = record[key];
  if (value === null) return null;
  if (typeof value !== "string" || value.length === 0) {
    throw new HarnessImportError(`Line ${lineNumber}: ${key} must be a string or null.`);
  }
  return value;
}

function requireNullableRevision(
  record: Record<string, unknown>,
  lineNumber: number,
): number | null {
  const value = record.node_revision;
  if (value === null) return null;
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new HarnessImportError(
      `Line ${lineNumber}: node_revision must be a non-negative integer or null.`,
    );
  }
  return Number(value);
}

function parseEvent(rawLine: string, lineNumber: number): GraphHarnessEventV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawLine);
  } catch {
    throw new HarnessImportError(`Line ${lineNumber}: invalid JSON.`);
  }
  if (!isRecord(parsed)) {
    throw new HarnessImportError(`Line ${lineNumber}: event root must be an object.`);
  }

  const schemaVersion = requireString(parsed, "schema_version", lineNumber);
  if (schemaVersion !== GRAPH_HARNESS_EVENT_SCHEMA_VERSION) {
    throw new HarnessImportError(
      `Line ${lineNumber}: unsupported schema_version ${schemaVersion}.`,
    );
  }

  const eventType = requireString(parsed, "event_type", lineNumber);
  if (!GRAPH_HARNESS_EVENT_TYPES.includes(eventType as never)) {
    throw new HarnessImportError(`Line ${lineNumber}: unsupported event_type ${eventType}.`);
  }

  const sequence = parsed.sequence;
  if (!Number.isInteger(sequence) || Number(sequence) < 1) {
    throw new HarnessImportError(`Line ${lineNumber}: sequence must be a positive integer.`);
  }

  const payload = parsed.payload;
  if (!isRecord(payload)) {
    throw new HarnessImportError(`Line ${lineNumber}: payload must be an object.`);
  }

  const previousEventHash = requireString(parsed, "previous_event_hash", lineNumber);
  const eventHash = requireString(parsed, "event_hash", lineNumber);
  if (!SHA256_PATTERN.test(previousEventHash) || !SHA256_PATTERN.test(eventHash)) {
    throw new HarnessImportError(
      `Line ${lineNumber}: event hashes must be lowercase SHA-256 values.`,
    );
  }

  const occurredAt = requireString(parsed, "occurred_at", lineNumber);
  if (!Number.isFinite(Date.parse(occurredAt))) {
    throw new HarnessImportError(`Line ${lineNumber}: occurred_at must be a valid date-time.`);
  }

  return {
    schema_version: GRAPH_HARNESS_EVENT_SCHEMA_VERSION,
    event_id: requireString(parsed, "event_id", lineNumber),
    sequence: Number(sequence),
    occurred_at: occurredAt,
    project_id: requireString(parsed, "project_id", lineNumber),
    event_type: eventType as GraphHarnessEventV1["event_type"],
    node_id: requireNullableString(parsed, "node_id", lineNumber),
    node_revision: requireNullableRevision(parsed, lineNumber),
    actor: requireString(parsed, "actor", lineNumber),
    payload,
    previous_event_hash: previousEventHash,
    event_hash: eventHash,
  };
}

export function importGraphHarnessJsonl(jsonl: string): HarnessImportResult {
  const rawLines = jsonl.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (rawLines.length === 0) {
    throw new HarnessImportError("The Graph Harness ledger is empty.");
  }

  const events: ImportedHarnessEvent[] = rawLines.map((raw, index) => ({
    raw,
    normalized: parseEvent(raw, index + 1),
  }));

  const projectId = events[0].normalized.project_id;
  let previousHash = "0".repeat(64);
  const seenIds = new Set<string>();

  events.forEach(({ normalized }, index) => {
    const expectedSequence = index + 1;
    if (normalized.sequence !== expectedSequence) {
      throw new HarnessImportError(
        `Sequence ${normalized.sequence} is not contiguous; expected ${expectedSequence}.`,
      );
    }
    if (normalized.project_id !== projectId) {
      throw new HarnessImportError(
        `Sequence ${normalized.sequence} belongs to ${normalized.project_id}, expected ${projectId}.`,
      );
    }
    if (normalized.previous_event_hash !== previousHash) {
      throw new HarnessImportError(
        `Sequence ${normalized.sequence} breaks the Graph Harness hash chain.`,
      );
    }
    if (seenIds.has(normalized.event_id)) {
      throw new HarnessImportError(`Duplicate event_id ${normalized.event_id}.`);
    }
    seenIds.add(normalized.event_id);
    previousHash = normalized.event_hash;
  });

  return {
    projectId,
    sourceHash: events[events.length - 1].normalized.event_hash,
    events,
  };
}
