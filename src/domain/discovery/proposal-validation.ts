import type { EstimationDraft, GeneratedActivityProposal } from "./estimation";

export type ProposalValidationSeverity = "error" | "warning";

export interface ProposalValidationFinding {
  id: string;
  proposalId?: string;
  code:
    | "NO_PROPOSAL_SELECTED"
    | "PROPOSAL_NAME_MISSING"
    | "PROPOSAL_EFFORT_INVALID"
    | "PROPOSAL_NOT_REVIEWED"
    | "PROPOSAL_EXCLUDED_SELECTED";
  severity: ProposalValidationSeverity;
  message: string;
}

export interface ProposalValidationResult {
  valid: boolean;
  errors: ProposalValidationFinding[];
  warnings: ProposalValidationFinding[];
}

export function validateProposalDraft(draft: EstimationDraft): ProposalValidationResult {
  const findings: ProposalValidationFinding[] = [];
  const selected = draft.proposals.filter(
    (proposal) => proposal.selected && proposal.included !== false && proposal.status !== "applied",
  );

  if (selected.length === 0) {
    findings.push({
      id: `finding:${draft.id}:NO_PROPOSAL_SELECTED`,
      code: "NO_PROPOSAL_SELECTED",
      severity: "error",
      message: "Select at least one included, unapplied proposal.",
    });
  }

  for (const proposal of draft.proposals) {
    findings.push(...validateProposal(proposal));
  }

  return {
    valid: findings.every((finding) => finding.severity !== "error"),
    errors: findings.filter((finding) => finding.severity === "error"),
    warnings: findings.filter((finding) => finding.severity === "warning"),
  };
}

function validateProposal(proposal: GeneratedActivityProposal): ProposalValidationFinding[] {
  const findings: ProposalValidationFinding[] = [];
  const selected = proposal.selected === true;
  const included = proposal.included !== false;

  if (selected && !included) {
    findings.push(finding(proposal, "PROPOSAL_EXCLUDED_SELECTED", "error", "An excluded proposal cannot remain selected."));
  }

  if (!selected || !included || proposal.status === "applied") return findings;

  if (!proposal.activity.activityName.trim()) {
    findings.push(finding(proposal, "PROPOSAL_NAME_MISSING", "error", "Selected proposals require an activity name."));
  }

  if (!Number.isFinite(proposal.calculatedEffortHours) || proposal.calculatedEffortHours < 0) {
    findings.push(finding(proposal, "PROPOSAL_EFFORT_INVALID", "error", "Selected proposal effort must be a finite value greater than or equal to zero."));
  }

  if (!proposal.reviewed) {
    findings.push(finding(proposal, "PROPOSAL_NOT_REVIEWED", "warning", "Selected proposal has not been explicitly reviewed."));
  }

  return findings;
}

function finding(
  proposal: GeneratedActivityProposal,
  code: ProposalValidationFinding["code"],
  severity: ProposalValidationSeverity,
  message: string,
): ProposalValidationFinding {
  return {
    id: `finding:${proposal.id}:${code}`,
    proposalId: proposal.id,
    code,
    severity,
    message,
  };
}
