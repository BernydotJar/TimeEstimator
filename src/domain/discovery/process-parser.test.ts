import {
  detectProcessFormat,
  parseRawProcessInput,
  type RawProcessInput,
} from "@/domain/discovery";

const NOW = "2026-07-15T00:00:00.000Z";

function rawInput(content: string): RawProcessInput {
  return {
    id: "raw-1",
    projectId: "project-1",
    processId: "process-1",
    content,
    format: "plain_text",
    source: "manual",
    capturedAt: NOW,
    updatedAt: NOW,
  };
}

describe("deterministic process parser", () => {
  it.each([
    ["1. Receive\n2. Validate", "numbered_list"],
    ["- Receive\n- Validate", "bulleted_list"],
    ["* Receive\n* Validate", "bulleted_list"],
    ["[ ] Receive\n[x] Validate", "checklist"],
    ["Receive request", "manual"],
    ["Receive request\nValidate request", "plain_text"],
  ])("detects the format for %s", (content, expected) => {
    expect(detectProcessFormat(content).format).toBe(expected);
  });

  it("handles empty and mixed line endings explicitly", () => {
    expect(detectProcessFormat("\r\n \r\n").warnings).toContain("Process input is empty.");
    expect(detectProcessFormat("1. A\r\n2. B\r3. C").candidateCount).toBe(3);
  });

  it("preserves order, raw text, provenance, and stable candidate identifiers", () => {
    const first = parseRawProcessInput(rawInput("1. Receive request\n2. Validate customer"));
    const second = parseRawProcessInput(rawInput("1. Receive request\n2. Validate customer"));

    expect(first.map((candidate) => candidate.rawText)).toEqual([
      "Receive request",
      "Validate customer",
    ]);
    expect(first.map((candidate) => candidate.order)).toEqual([1, 2]);
    expect(first.map((candidate) => candidate.id)).toEqual(second.map((candidate) => candidate.id));
    expect(first.every((candidate) => candidate.provenance.source === "deterministic")).toBe(true);
    expect(first.every((candidate) => candidate.provenance.rawInputId === "raw-1")).toBe(true);
  });

  it("suggests step types without inventing actors or systems", () => {
    const candidates = parseRawProcessInput(rawInput(
      "- If data is valid?\n- Review and approve\n- Call API\n- Process PDF",
    ));

    expect(candidates.map((candidate) => candidate.suggestedType)).toEqual([
      "decision",
      "approval",
      "integration",
      "document_processing",
    ]);
    expect(candidates[0].decisionCondition).toBe("If data is valid?");
    expect(candidates.every((candidate) => candidate.actor === undefined)).toBe(true);
    expect(candidates.every((candidate) => candidate.system === undefined)).toBe(true);
  });

  it("marks plain-text candidates for human review", () => {
    const candidates = parseRawProcessInput(rawInput(
      "The analyst receives an email.\nThen the analyst validates the form.",
    ));

    expect(candidates).toHaveLength(2);
    expect(candidates.every((candidate) => candidate.warnings.includes(
      "Candidate originated from plain text and requires human review.",
    ))).toBe(true);
  });
});
