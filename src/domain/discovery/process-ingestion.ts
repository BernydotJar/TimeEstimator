import type { ProcessStepType } from "./process";

export const PROCESS_PARSER_VERSION = "1.0.0";

export type RawProcessFormat =
  | "numbered_list"
  | "bulleted_list"
  | "checklist"
  | "plain_text"
  | "manual";

export type ProcessIngestionSource =
  | "manual"
  | "deterministic"
  | "heuristic"
  | "n8n";

export interface RawProcessInput {
  id: string;
  projectId: string;
  processId: string;
  content: string;
  format: RawProcessFormat;
  source: ProcessIngestionSource;
  capturedAt: string;
  updatedAt: string;
}

export interface ParsedStepCandidate {
  id: string;
  order: number;
  rawText: string;
  suggestedName: string;
  suggestedDescription?: string;
  suggestedType: ProcessStepType;
  actor?: string;
  system?: string;
  decisionCondition?: string;
  provenance: {
    source: "deterministic";
    parserVersion: string;
    rawInputId: string;
    rawLine?: number;
  };
  warnings: string[];
}

export interface ReviewedStepCandidate extends ParsedStepCandidate {
  included: boolean;
  confirmedByUser: boolean;
}

export interface ParsedCandidateReviewState {
  rawInputId: string;
  parserVersion: string;
  parsedAt: string;
  stale: boolean;
  candidates: ReviewedStepCandidate[];
}

export interface FormatDetectionResult {
  format: RawProcessFormat;
  normalizedContent: string;
  meaningfulLineCount: number;
  candidateCount: number;
  warnings: string[];
}
