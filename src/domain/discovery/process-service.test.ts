import {
  addProcessActor,
  addProcessEdge,
  addProcessStep,
  connectLinearSteps,
  createCurrentStateProcess,
  normalizeReviewedCandidates,
  removeProcessActor,
  removeProcessStep,
  reorderProcessSteps,
  updateProcessStep,
  type ProcessStep,
  type ReviewedStepCandidate,
} from "@/domain/discovery";

const NOW = "2026-07-15T00:00:00.000Z";
const LATER = "2026-07-15T01:00:00.000Z";

function candidate(
  id: string,
  order: number,
  name: string,
  type: ReviewedStepCandidate["suggestedType"] = "task",
): ReviewedStepCandidate {
  return {
    id,
    order