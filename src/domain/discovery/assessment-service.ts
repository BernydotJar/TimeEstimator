import {
  ASSESSMENT_CATALOG_VERSION,
  cloneAssessmentCatalog,
} from "./assessment-catalog";
import type {
  AssessmentAnswer,
  AssessmentAnswerState,
  AssessmentCompleteness,
  AssessmentQuestion,
  AssessmentSection,
  ProjectAssessment,
} from "./assessment";
import type { EvidenceReference } from "./types";

export interface AssessmentAnswerUpdate {
  state: AssessmentAnswerState;
  value?: unknown;
  notes?: string;
  confirmedByUser?: boolean;
}

const isNonEmptyValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
};

export function createAssessment(
  projectId: string,
  assessmentId: string,
  now: string,
): ProjectAssessment {
  return {
    id: assessmentId,
    projectId,
    schemaVersion: ASSESSMENT_CATALOG_VERSION,
    version: 1,
    title: "Project Assessment",
    status: "not_started",
    sections: cloneAssessmentCatalog(assessmentId),
    completeness: {
      answeredRequired: 0,
      totalRequired: 0,
      answeredOptional: 0,
      totalOptional: 0,
      percent: 0,
      highImpactUnknownQuestionIds: [],
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function findAssessmentQuestion(
  assessment: ProjectAssessment,
  questionId: string,
): AssessmentQuestion | undefined {
  return assessment.sections
    .flatMap((section) => section.questions)
    .find((question) => question.id === questionId);
}

export function findAssessmentSection(
  assessment: ProjectAssessment,
  questionId: string,
): AssessmentSection | undefined {
  return assessment.sections.find((section) =>
    section.questions.some((question) => question.id === questionId),
  );
}

function normalizeAnswer(
  question: AssessmentQuestion,
  previous: AssessmentAnswer | undefined,
  update: AssessmentAnswerUpdate,
  now: string,
): AssessmentAnswer {
  const state =
    update.state === "answered" && !isNonEmptyValue(update.value)
      ? "unanswered"
      : update.state;

  return {
    id: previous?.id ?? `answer:${question.id}`,
    questionId: question.id,
    state,
    value: state === "answered" ? update.value : undefined,
    notes: update.notes ?? previous?.notes,
    evidence: previous?.evidence ? [...previous.evidence] : [],
    source: "manual",
    confirmedByUser: update.confirmedByUser ?? state !== "unanswered",
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
}

function isResolved(question: AssessmentQuestion): boolean {
  return Boolean(
    question.answer &&
      (question.answer.state === "answered" ||
        question.answer.state === "not_applicable"),
  );
}

export function calculateAssessmentCompleteness(
  sections: AssessmentSection[],
): AssessmentCompleteness {
  const questions = sections.flatMap((section) => section.questions);
  const required = questions.filter((question) => question.requiredForCompletion);
  const optional = questions.filter((question) => !question.requiredForCompletion);
  const answeredRequired = required.filter(isResolved).length;
  const answeredOptional = optional.filter(isResolved).length;
  const percent =
    required.length === 0
      ? 100
      : Math.round((answeredRequired / required.length) * 100);

  return {
    answeredRequired,
    totalRequired: required.length,
    answeredOptional,
    totalOptional: optional.length,
    percent,
    highImpactUnknownQuestionIds: questions
      .filter(
        (question) =>
          question.highImpact && question.answer?.state === "unknown",
      )
      .map((question) => question.id),
  };
}

export function calculateSectionStatus(
  section: AssessmentSection,
): AssessmentSection["status"] {
  if (section.questions.every(isResolved)) return "complete";
  if (section.questions.some((question) => question.answer)) return "in_progress";
  return "not_started";
}

function refreshAssessment(
  assessment: ProjectAssessment,
  sections: AssessmentSection[],
  now: string,
): ProjectAssessment {
  const refreshedSections = sections.map((section) => ({
    ...section,
    status: calculateSectionStatus(section),
  }));
  const completeness = calculateAssessmentCompleteness(refreshedSections);
  const status =
    assessment.status === "reviewed" || assessment.status === "superseded"
      ? assessment.status
      : completeness.answeredRequired > 0 || completeness.answeredOptional > 0
        ? "in_progress"
        : "not_started";

  return {
    ...assessment,
    status,
    sections: refreshedSections,
    completeness,
    updatedAt: now,
  };
}

export function updateAssessmentAnswer(
  assessment: ProjectAssessment,
  questionId: string,
  update: AssessmentAnswerUpdate,
  now: string,
): ProjectAssessment {
  const sections = assessment.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            answer: normalizeAnswer(question, question.answer, update, now),
          }
        : question,
    ),
  }));
  return refreshAssessment(assessment, sections, now);
}

export function updateAssessmentNotes(
  assessment: ProjectAssessment,
  questionId: string,
  notes: string,
  now: string,
): ProjectAssessment {
  const question = findAssessmentQuestion(assessment, questionId);
  if (!question) return assessment;
  return updateAssessmentAnswer(
    assessment,
    questionId,
    {
      state: question.answer?.state ?? "unanswered",
      value: question.answer?.value,
      notes,
      confirmedByUser: question.answer?.confirmedByUser ?? false,
    },
    now,
  );
}

export function addAssessmentEvidence(
  assessment: ProjectAssessment,
  questionId: string,
  evidence: EvidenceReference,
  now: string,
): ProjectAssessment {
  const sections = assessment.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) => {
      if (question.id !== questionId) return question;
      const previous = question.answer ?? normalizeAnswer(
        question,
        undefined,
        { state: "unanswered" },
        now,
      );
      const exists = previous.evidence.some((item) => item.id === evidence.id);
      return {
        ...question,
        answer: {
          ...previous,
          evidence: exists ? previous.evidence : [...previous.evidence, evidence],
          updatedAt: now,
        },
      };
    }),
  }));
  return refreshAssessment(assessment, sections, now);
}

export function removeAssessmentEvidence(
  assessment: ProjectAssessment,
  questionId: string,
  evidenceId: string,
  now: string,
): ProjectAssessment {
  const sections = assessment.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) =>
      question.id === questionId && question.answer
        ? {
            ...question,
            answer: {
              ...question.answer,
              evidence: question.answer.evidence.filter(
                (item) => item.id !== evidenceId,
              ),
              updatedAt: now,
            },
          }
        : question,
    ),
  }));
  return refreshAssessment(assessment, sections, now);
}

export function getAssessmentReadiness(assessment: ProjectAssessment): {
  ready: boolean;
  missingQuestionIds: string[];
  unknownQuestionIds: string[];
} {
  const required = assessment.sections
    .flatMap((section) => section.questions)
    .filter((question) => question.requiredForCompletion);
  const missingQuestionIds = required
    .filter((question) => !question.answer || question.answer.state === "unanswered")
    .map((question) => question.id);
  const unknownQuestionIds = required
    .filter((question) => question.answer?.state === "unknown")
    .map((question) => question.id);
  return {
    ready: missingQuestionIds.length === 0 && unknownQuestionIds.length === 0,
    missingQuestionIds,
    unknownQuestionIds,
  };
}

export function markAssessmentReadyForReview(
  assessment: ProjectAssessment,
  now: string,
): ProjectAssessment {
  if (!getAssessmentReadiness(assessment).ready) return assessment;
  return { ...assessment, status: "ready_for_review", updatedAt: now };
}
