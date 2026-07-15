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
  severity