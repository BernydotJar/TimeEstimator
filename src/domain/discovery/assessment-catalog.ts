import type {
  AssessmentQuestion,
  AssessmentSection,
  AssessmentSectionKey,
} from "./assessment";

export const ASSESSMENT_CATALOG_VERSION = 1;

export type AssessmentQuestionDefinition = Omit<AssessmentQuestion, "answer">;

export interface AssessmentSectionDefinition {
  key: AssessmentSectionKey;
  title: string;
  order: number;
  questions: AssessmentQuestionDefinition[];
}

const question = (
  id: string,
  key: string,
  prompt: string,
  answerType: AssessmentQuestionDefinition["answerType"],
  requiredForCompletion: boolean,
  highImpact: boolean,
  confidenceDimension: AssessmentQuestionDefinition["confidenceDimension"],
  helpText?: string,
  options?: string[],
): AssessmentQuestionDefinition => ({
  id,
  key,
  prompt,
  answerType,
  requiredForCompletion,
  highImpact,
  confidenceDimension,
  helpText,
  options,
});

export const ASSESSMENT_CATALOG: readonly AssessmentSectionDefinition[] = [
  {
    key: "project_overview",
    title: "Project Overview",
    order: 1,
    questions: [
      question("q-project-objective", "project.objective", "What is the primary objective of this initiative?", "long_text", true, true, "scope_clarity", "Describe the business problem and the change the project should create."),
      question("q-business-outcome", "project.outcome", "What measurable business outcome is expected?", "long_text", true, true, "scope_clarity"),
      question("q-scope-boundaries", "project.scope", "What is explicitly in scope and out of scope?", "long_text", true, true, "scope_clarity"),
      question("q-target-date", "project.target_date", "Is there a target date or delivery constraint?", "date", false, false, "dependencies"),
    ],
  },
  {
    key: "current_state",
    title: "Current-State Process",
    order: 2,
    questions: [
      question("q-process-trigger", "process.trigger", "What triggers the current process?", "text", true, true, "process_coverage"),
      question("q-process-completion", "process.completion", "What defines successful completion?", "text", true, true, "process_coverage"),
      question("q-current-pain-points", "process.pain_points", "What are the main pain points, delays, or failure modes?", "long_text", true, true, "process_coverage"),
      question("q-process-frequency", "process.frequency", "How frequently does the process run?", "single_select", false, false, "volume_frequency", undefined, ["Ad hoc", "Daily", "Weekly", "Monthly", "Seasonal", "Continuous"]),
    ],
  },
  {
    key: "process_complexity",
    title: "Process Complexity",
    order: 3,
    questions: [
      question("q-step-count", "complexity.step_count", "Approximately how many meaningful process steps exist?", "number", true, true, "process_coverage"),
      question("q-decision-count", "complexity.decision_count", "How many decision points or business-rule branches exist?", "number", true, true, "decisions_exceptions"),
      question("q-handoff-count", "complexity.handoff_count", "How many actor or team handoffs occur?", "number", false, false, "process_coverage"),
      question("q-exception-paths", "complexity.exceptions", "Describe the important business and technical exception paths.", "long_text", false, true, "decisions_exceptions"),
    ],
  },
  {
    key: "technical_landscape",
    title: "Technical Landscape",
    order: 4,
    questions: [
      question("q-systems", "technical.systems", "Which systems or applications participate in the process?", "entity_list", true, true, "systems_integrations"),
      question("q-integration-access", "technical.integration_access", "What level of integration or API access is confirmed?", "single_select", true, true, "systems_integrations", undefined, ["Confirmed", "Partial", "Unknown", "No integration available"]),
      question("q-auth-constraints", "technical.authentication", "What authentication, network, or environment restrictions apply?", "long_text", false, true, "security_access"),
      question("q-sensitive-data", "technical.sensitive_data", "Does the process handle sensitive or regulated data?", "boolean", true, true, "security_access"),
    ],
  },
  {
    key: "ai_automation_suitability",
    title: "AI and Automation Suitability",
    order: 5,
    questions: [
      question("q-interpretation-needed", "suitability.interpretation", "Does the process require interpretation or judgment beyond deterministic rules?", "boolean", true, true, "data_documents"),
      question("q-unstructured-inputs", "suitability.unstructured_inputs", "Are unstructured documents, messages, images, or free text involved?", "boolean", false, true, "data_documents"),
      question("q-human-review", "suitability.human_review", "What level of human review is required?", "single_select", true, true, "testing_uat", undefined, ["None", "Exception review", "Approval before action", "Human execution required"]),
      question("q-acceptance-criteria", "suitability.acceptance_criteria", "What acceptance criteria or error tolerance must be met?", "long_text", false, true, "testing_uat"),
    ],
  },
  {
    key: "delivery_governance",
    title: "Delivery and Governance",
    order: 6,
    questions: [
      question("q-process-owner", "delivery.process_owner", "Who owns the business process?", "text", true, true, "scope_clarity"),
      question("q-approver", "delivery.approver", "Who approves requirements and acceptance?", "text", true, true, "testing_uat"),
      question("q-environments", "delivery.environments", "Which environments are required?", "multi_select", true, false, "security_access", undefined, ["Development", "Test", "UAT", "Production"]),
      question("q-uat-owner", "delivery.uat_owner", "Who will coordinate UAT and sign-off?", "text", false, false, "testing_uat"),
    ],
  },
  {
    key: "risks_assumptions",
    title: "Risks and Assumptions",
    order: 7,
    questions: [
      question("q-top-risks", "risk.top_risks", "What are the highest-impact delivery or operational risks?", "long_text", true, true, "dependencies"),
      question("q-assumptions", "risk.assumptions", "Which assumptions currently support the assessment?", "long_text", true, false, "dependencies"),
      question("q-dependencies", "risk.dependencies", "Which external decisions, teams, vendors, or access dependencies remain?", "long_text", false, true, "dependencies"),
      question("q-exclusions", "risk.exclusions", "Which exclusions should remain visible to reviewers?", "long_text", false, false, "scope_clarity"),
    ],
  },
] as const;

export function cloneAssessmentCatalog(assessmentId: string): AssessmentSection[] {
  return ASSESSMENT_CATALOG.map((section) => ({
    id: `${assessmentId}:${section.key}`,
    assessmentId,
    key: section.key,
    title: section.title,
    order: section.order,
    status: "not_started",
    questions: section.questions.map((item) => ({
      ...item,
      options: item.options ? [...item.options] : undefined,
    })),
  }));
}

export function validateAssessmentCatalog(): string[] {
  const errors: string[] = [];
  const sectionKeys = new Set<string>();
  const questionIds = new Set<string>();
  const questionKeys = new Set<string>();

  for (const section of ASSESSMENT_CATALOG) {
    if (sectionKeys.has(section.key)) errors.push(`Duplicate section key: ${section.key}`);
    sectionKeys.add(section.key);
    if (section.questions.length === 0) errors.push(`Section has no questions: ${section.key}`);

    for (const item of section.questions) {
      if (questionIds.has(item.id)) errors.push(`Duplicate question id: ${item.id}`);
      if (questionKeys.has(item.key)) errors.push(`Duplicate question key: ${item.key}`);
      questionIds.add(item.id);
      questionKeys.add(item.key);
      if (!item.prompt.trim()) errors.push(`Question has no prompt: ${item.id}`);
      if ((item.answerType === "single_select" || item.answerType === "multi_select") && !item.options?.length) {
        errors.push(`Question requires options: ${item.id}`);
      }
    }
  }

  return errors;
}
