import type {
  ConfidenceBand,
  ConfidenceDimension,
  EvidenceReference,
} from "./types";

export type AssessmentAnswerState =
  | "unanswered"
  | "answered"
  | "unknown"
  | "not_applicable";

export interface AssessmentAnswer {
  id: string;
  questionId: string;
  state: AssessmentAnswerState;
  value?: unknown;
  notes?: string;
  evidence: EvidenceReference[];
  source: "observed" | "manual" | "imported" | "suggested";
  confirmedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  key: string;
  prompt: string;
  helpText?: string;
  answerType:
    | "text"
    | "long_text"
    | "number"
    | "boolean"
    | "single_select"
    | "multi_select"
    | "date"
    | "entity_list";
  requiredForCompletion: boolean;
  highImpact: boolean;
  confidenceDimension?: ConfidenceDimension;
  options?: string[];
  answer?: AssessmentAnswer;
}

export type AssessmentSectionKey =
  | "project_overview"
  | "current_state"
  | "process_complexity"
  | "technical_landscape"
  | "ai_automation_suitability"
  | "delivery_governance"
  | "risks_assumptions";

export interface AssessmentSection {
  id: string;
  assessmentId: string;
  key: AssessmentSectionKey;
  title: string;
  order: number;
  status: "not_started" | "in_progress" | "complete";
  questions: AssessmentQuestion[];
}

export interface AssessmentCompleteness {
  answeredRequired: number;
  totalRequired: number;
  answeredOptional: number;
  totalOptional: number;
  percent: number;
  highImpactUnknownQuestionIds: string[];
}

export interface ConfidenceDimensionScore {
  dimension: ConfidenceDimension;
  score: number;
  weight: number;
  evidenceCount: number;
  unknownCount: number;
  rationale: string;
}

export interface ConfidenceSnapshot {
  score: number;
  band: ConfidenceBand;
  dimensions: ConfidenceDimensionScore[];
  highImpactUnknownIds: string[];
  rationale: string[];
  calculatedAt: string;
}

export interface ProjectAssessment {
  id: string;
  projectId: string;
  schemaVersion: number;
  version: number;
  title: string;
  status:
    | "not_started"
    | "in_progress"
    | "ready_for_review"
    | "reviewed"
    | "superseded";
  sections: AssessmentSection[];
  completeness: AssessmentCompleteness;
  confidenceSnapshot?: ConfidenceSnapshot;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}
