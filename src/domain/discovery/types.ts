import type { Activity, OverheadKey } from "@/app/types";

export const DISCOVERY_SCHEMA_VERSION = 1;

export type SourceKind =
  | "observed"
  | "manual"
  | "deterministic"
  | "heuristic"
  | "n8n";

export type ConfidenceBand = "low" | "medium" | "high";

export type ConfidenceDimension =
  | "scope_clarity"
  | "process_coverage"
  | "dec