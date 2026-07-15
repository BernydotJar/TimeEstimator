import {
  PROCESS_PARSER_VERSION,
  type FormatDetectionResult,
  type ParsedStepCandidate,
  type RawProcessFormat,
  type RawProcessInput,
} from "./process-ingestion";
import type { ProcessStepType } from "./process";

const NUMBERED = /^\s*\d+[.)]\s+/;
const BULLET = /^\s*[-*+]\s+/;
const CHECKLIST = /^\s*(?:[-*+]\s*)?\[[ xX]\]\s+/;

export function normalizeProcessText(content: string): string {
  return content.replace(/\r\n?/g, "\n");
}

export function detectProcessFormat(content: string): FormatDetectionResult {
  const normalizedContent = normalizeProcessText(content);
  const lines = normalizedContent.split("\n").filter((line) => line.trim().length > 0);
  const warnings: string[] = [];

  if (lines.length === 0) {
    return {
      format: "plain_text",
      normalizedContent,
      meaningfulLineCount: 0,
      candidateCount: 0,
      warnings: ["Process input is empty."],
    };
  }

  let format: RawProcessFormat;
  if (lines.every((line) => CHECKLIST.test(line))) format = "checklist";
  else if (lines.every((line) => NUMBERED.test(line))) format = "numbered_list";
  else if (lines.every((line) => BULLET.test(line))) format = "bulleted_list";
  else if (lines.length === 1) format = "manual";
  else format = "plain_text";

  if (format === "plain_text") {
    warnings.push("Plain text is split conservatively; review every candidate before normalization.");
  }

  return {
    format,
    normalizedContent,
    meaningfulLineCount: lines.length,
    candidateCount: splitCandidateLines(normalizedContent, format).length,
    warnings,
  };
}

export function parseRawProcessInput(input: RawProcessInput): ParsedStepCandidate[] {
  const detection = detectProcessFormat(input.content);
  return splitCandidateLines(detection.normalizedContent, detection.format).map((entry, index) => {
    const rawText = entry.text.trim();
    const suggestedType = classifyStepType(rawText);
    const warnings: string[] = [];
    let decisionCondition: string | undefined;

    if (detection.format === "plain_text") {
      warnings.push("Candidate originated from plain text and requires human review.");
    }
    if (suggestedType === "decision") {
      decisionCondition = rawText;
      warnings.push("Decision classification is a deterministic suggestion; confirm condition and branches.");
    }

    return {
      id: stableCandidateId(input.id, index, rawText),
      order: index + 1,
      rawText,
      suggestedName: toSuggestedName(rawText),
      suggestedType,
      decisionCondition,
      provenance: {
        source: "deterministic",
        parserVersion: PROCESS_PARSER_VERSION,
        rawInputId: input.id,
        rawLine: entry.line,
      },
      warnings,
    };
  });
}

function splitCandidateLines(content: string, format: RawProcessFormat): Array<{ text: string; line: number }> {
  const rawLines = normalizeProcessText(content).split("\n");
  const nonEmpty = rawLines
    .map((text, index) => ({ text: text.trim(), line: index + 1 }))
    .filter((entry) => entry.text.length > 0);

  if (format !== "plain_text") {
    return nonEmpty.map((entry) => ({ ...entry, text: stripListPrefix(entry.text) }));
  }

  const result: Array<{ text: string; line: number }> = [];
  for (const entry of nonEmpty) {
    const sentences = entry.text
      .split(/(?<=[.!?])\s+(?=(?:Then\s+|If\s+|When\s+|The\s+|A\s+|An\s+|[A-Z]))/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    if (sentences.length <= 1) result.push(entry);
    else sentences.forEach((text) => result.push({ text, line: entry.line }));
  }
  return result;
}

export function stripListPrefix(value: string): string {
  return value.replace(CHECKLIST, "").replace(NUMBERED, "").replace(BULLET, "").trim();
}

export function classifyStepType(text: string): ProcessStepType {
  const value = text.trim().toLowerCase();
  if (/^(start|begin|trigger\b|request received\b)/.test(value)) return "start";
  if (/^(end|finish|complete\b|close case\b)/.test(value)) return "end";
  if (/\b(if|whether|check whether|determine if|approved\?|valid\?)\b/.test(value) || value.startsWith("if ")) return "decision";
  if (/\b(approve|review and approve|sign[- ]?off|authorize)\b/.test(value)) return "approval";
  if (/\b(call api|send request to|query system|synchroni[sz]e|integrate)\b/.test(value)) return "integration";
  if (/\b(read document|extract data|validate invoice|process pdf|classify form)\b/.test(value)) return "document_processing";
  if (/\b(wait|pause|delay)\b/.test(value)) return "wait";
  if (/\b(notify|notification|send email|send message)\b/.test(value)) return "notification";
  if (/\b(exception|error|failure|reject)\b/.test(value)) return "exception";
  return "task";
}

function toSuggestedName(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
  return compact.length <= 96 ? compact : `${compact.slice(0, 93).trim()}...`;
}

function stableCandidateId(rawInputId: string, index: number, text: string): string {
  let hash = 2166136261;
  const value = `${rawInputId}:${index}:${text}`;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `candidate:${rawInputId}:${index + 1}:${(hash >>> 0).toString(36)}`;
}
