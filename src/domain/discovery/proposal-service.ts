import type { Activity, Project } from "@/app/types";
import type { ProjectAssessment } from "./assessment";
import type { EstimationDraft, GeneratedActivityProposal, ProposalApplyReceipt, ProposalActivityMapping } from "./estimation";
import type { ProcessDefinition, ProcessStep } from "./process";
import { DISCOVERY_SCHEMA_VERSION, type TraceabilityReference } from "./types";

export const PROPOSAL_RULE