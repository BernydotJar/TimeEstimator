# Estimation Model — 008 Project Discovery & Estimation Studio

## Status of this model

This document specifies the target model and decision boundaries. It does **not**
change the formulas currently used by TimeEstimator. Any numeric calibration,
multiplier, or default proposed here requires human approval and deterministic
regression tests before implementation.

## Principles

1. Evidence precedes estimation.
2. Unknowns remain explicit.
3. A deterministic baseline exists without AI or n8n.
4. Every calculation exposes rules, factors, assumptions, and adjustments.
5. Generated activities are proposals until explicitly applied.
6. Scenario ranges communicate uncertainty; they do not disguise precision.
7. Overheads are applied once and are never duplicated inside activity effort.
8. Manual adjustments are visible line items with rationale.
9. Existing project totals remain compatible until a separately approved formula
   migration is completed.
10. Confidence describes evidence quality, not probability of delivery success.

## Layered estimation architecture

```text
Layer 1  Observed inputs
Layer 2  Explicit assumptions and unknowns
Layer 3  Normalized process/complexity facts
Layer 4  Deterministic mapping rules
Layer 5  Activity proposals and base effort
Layer 6  Scenario parameters
Layer 7  Project overhead policy
Layer 8  Manual adjustments
Layer 9  Scenario outputs, confidence, drivers, risks, and audit trail
```

AI suggestions may assist Layers 3–5, but deterministic validation and user review
remain mandatory.

## Inputs

### Project and delivery inputs

- objective and expected outcome;
- scope boundaries;
- target date or delivery constraint;
- stakeholder and approval structure;
- security, privacy, compliance, audit, and support requirements;
- environments and deployment model;
- UAT, training, hypercare, and change-management needs.

### Process inputs

- step count and step types;
- actors and handoffs;
- systems and interfaces;
- decisions and branches;
- exceptions and escalation paths;
- retries and wait states;
- documents and data objects;
- frequency, volume, duration, and seasonality;
- automation suitability and human supervision.

### Technical inputs

- adapter/channel type;
- API availability and quality;
- authentication and access restrictions;
- data format and structure;
- environment parity;
- observability and auditability;
- AI model uncertainty and evaluation requirements.

### Evidence state

Each estimation input is `known`, `assumed`, or `unknown`. Assumed inputs require
an assumption record. Unknown high-impact inputs affect confidence and may widen
scenario parameters.

## Normalized complexity dimensions

Each dimension produces a normalized score from 0 to 4:

| Score | Meaning |
|---:|---|
| 0 | Not applicable or no meaningful complexity |
| 1 | Low / simple / confirmed |
| 2 | Moderate |
| 3 | High |
| 4 | Very high or materially unknown |

Dimensions:

- step count;
- decision count;
- exception count;
- actor/handoff count;
- system count;
- integration count;
- document/data complexity;
- volume and frequency;
- environment/access complexity;
- security/compliance complexity;
- AI behavior/evaluation uncertainty;
- testing/UAT/change complexity;
- dependency uncertainty.

A score is accompanied by:

- rule ID;
- observed values;
- threshold used;
- source references;
- rationale;
- warnings.

## Rule catalog

Rules are versioned and deterministic. Example IDs:

```text
STEP-TASK-001
STEP-DECISION-001
STEP-EXCEPTION-001
STEP-INTEGRATION-001
STEP-DOCUMENT-001
STEP-AI-HITL-001
DELIVERY-DISCOVERY-001
DELIVERY-TEST-001
DELIVERY-UAT-001
CONF-UNKNOWN-001
```

A rule returns a proposed work item or factor, not a silent total mutation.

Example rule output:

```json
{
  "ruleId": "STEP-INTEGRATION-001",
  "proposal": "Build and validate system integration",
  "baseEffortHours": 8,
  "factorIds": ["adapter.api", "auth.oauth", "env.nonprod_missing"],
  "rationale": "One external API integration with OAuth and incomplete test environment",
  "sourceRefs": ["step:ps-12", "answer:technical.api_access"]
}
```

Numeric values above are illustrative until calibration approval.

## Mapping steps to activity proposals

### Step-type mapping

| Step type | Typical proposal classes |
|---|---|
| `start` / `end` | orchestration entry/exit; usually grouped, not individual build activity |
| `task` | application or process implementation |
| `user_task` | human interaction, form, queue, or assisted workflow |
| `system_task` | automation action or service operation |
| `ai_task` | prompt/model behavior, evaluation, guardrail, fallback, human review |
| `decision` | rule design, branching, test cases |
| `approval` | human-in-the-loop state, notification, audit, timeout/escalation |
| `integration` | connector/API/file/database/email integration and resilience |
| `document_processing` | extraction, classification, validation, confidence handling |
| `wait` | scheduler, polling, timeout, resume/idempotency |
| `notification` | message template, channel integration, delivery/error handling |
| `exception` | exception path, retry, escalation, logging |

### Grouping policy

The engine shall avoid one activity per trivial click when steps represent a
single coherent screen transaction. It may group adjacent steps when:

- actor and system are the same;
- no decision/exception boundary is crossed;
- the same implementation pattern applies;
- traceability retains all origin step IDs.

The engine shall not group across:

- approval boundaries;
- system/integration boundaries;
- distinct exception behavior;
- AI vs deterministic behavior;
- materially different security or data controls.

### Core vs supervised

Recommended mapping:

- `core`: deterministic build work and unattended execution behavior;
- `supervised`: implementation/evaluation of human-review, approval, or monitored
  AI behavior.

This label remains compatible with the current activity schema. It describes the
solution operating model, not the role of the engineer performing the work.

## Base effort

Each proposal begins with a rule-derived base effort. Base effort represents the
implementation and direct unit verification of that proposal only.

It excludes project-level overhead categories such as:

- project management;
- solution architecture when governed as overhead;
- SDD/documentation when governed as overhead;
- release/configuration guide;
- user manual;
- contingency.

If an approved delivery activity is modeled explicitly in the base, the
corresponding overhead must be disabled or reduced. The proposal records
`overheadPolicy` to make this explicit.

## Factor model

Factors may be additive hours or bounded multipliers. Multipliers should be used
sparingly because compounding can create opaque totals.

Recommended order:

```text
calculated effort per proposal
  = max(minimum effort,
        base effort × bounded complexity multiplier
        + explicit additive effort)
```

Example factor classes:

- application/adapter complexity;
- decision and exception complexity;
- data/document complexity;
- authentication/access complexity;
- environment complexity;
- reuse credit;
- test/evaluation complexity;
- AI uncertainty;
- volume/performance requirement.

### Bounding policy

- Each multiplier has documented minimum and maximum.
- Combined multiplier has a hard cap requiring explicit manual review.
- Reuse never reduces effort below the minimum required to validate and integrate.
- Unknown values do not automatically take the maximum; they create a conservative
  factor and a visible uncertainty warning.

## Mapping activities to delivery phases

Every proposal maps to exactly one primary phase and may reference supporting
phases.

Primary phases:

- discovery;
- business analysis;
- process design;
- architecture;
- UX/UI;
- implementation;
- integration;
- data/AI;
- security;
- testing;
- UAT;
- deployment;
- documentation;
- training;
- stabilization.

For MVP, project-level delivery activities may be generated as explicit proposals
or represented through existing overhead percentages, but not both.

## Scenario calculation

### Scenario purpose

- **Optimistic:** evidence-confirmed path with limited exception/unknown realization.
- **Expected:** most defensible plan based on current evidence.
- **Conservative:** plausible high-effort outcome accounting for unresolved high-
  impact unknowns and difficult integration/test conditions.

### Scenario parameters

Each scenario stores a parameter snapshot. Candidate parameters include:

- per-factor severity selection;
- uncertainty allowance;
- rework allowance;
- test/evaluation breadth;
- environment/access allowance;
- manual adjustment set;
- overhead percentage snapshot.

### Compatibility calculation

Until formula hardening is approved, a scenario can be calculated as a draft from
selected proposal efforts and the existing overhead equations:

```text
scenario base = sum(selected proposal calculated effort)
scenario overhead item = scenario base × project overhead percentage
scenario total = scenario base + overhead items + explicit manual adjustments
```

This mirrors the current semantics. Scenario proposals do not become the current
project total until applied.

### Range

```text
range = [optimistic total, conservative total]
expected = expected scenario total
```

Do not calculate a probabilistic percentile unless an approved statistical model
and calibration dataset exist.

## Confidence calculation

### Dimensions and candidate weights

Weights are proposed and require approval:

| Dimension | Candidate weight |
|---|---:|
| Scope clarity | 15% |
| Process coverage | 15% |
| Decisions/exceptions | 10% |
| Systems/integrations | 15% |
| Data/documents | 10% |
| Volume/frequency | 5% |
| Security/access | 10% |
| Testing/UAT | 10% |
| Dependencies | 10% |

### Dimension scoring

Each dimension uses evidence coverage and unknown penalties:

```text
dimension score (0–100)
  = confirmed evidence score
  - high-impact unknown penalties
  - contradiction penalties
```

Overall score is the weighted mean, bounded 0–100.

Candidate bands:

- Low: 0–49.
- Medium: 50–79.
- High: 80–100.

These thresholds require product approval and later calibration.

### Confidence output

Show:

- score and band;
- dimension scores;
- strongest evidence;
- high-impact unknowns;
- contradictions;
- actions most likely to increase confidence.

Do not describe confidence as a guarantee.

## Overhead policy

### Existing overhead categories

- contingency;
- project management;
- solution architecture;
- solution design and documentation;
- release/configuration;
- user manual.

### Policy rules

1. Snapshot percentages for each scenario.
2. Apply percentages to scenario base exactly once.
3. If a project-level activity explicitly covers an overhead category, mark it
   `included_in_base` and prevent duplicate percentage application for the same
   scope.
4. Document exclusions and rationale.
5. Preserve existing defaults for legacy projects.
6. Any new overhead category requires a separate approved formula change.

## Double-counting prevention

The engine shall run deterministic checks before finalizing scenarios:

- explicit PM activity plus PM percentage;
- explicit architecture activity plus SA percentage;
- explicit SDD/documentation activity plus SDD percentage;
- explicit release guide plus release/config percentage;
- explicit user manual plus user-manual percentage;
- exception effort included in both a task factor and a separate exception
  proposal without scope distinction;
- integration effort included in both grouped task and integration proposal;
- AI evaluation effort included in both AI task and generic testing proposal.

Findings require resolution, exclusion, or explicit acknowledgment.

## Human adjustments

A manual adjustment must include:

- label;
- hours, positive or negative;
- scenarios affected;
- rationale;
- author context (`manual` in local-only MVP);
- timestamp.

Adjustments appear as separate lines and in the audit trail. They never mutate
rule defaults.

## Audit trail

Record:

- input snapshot hash;
- rule-catalog version;
- factor values;
- scenario parameter snapshot;
- project overhead snapshot;
- proposal edits and inclusion decisions;
- manual adjustments;
- applied proposal IDs and resulting activity IDs;
- calculation timestamp.

The same snapshot and rule version shall reproduce the same deterministic result.

## Major effort drivers

The engine identifies drivers by absolute contribution and uncertainty impact.
Examples:

- integrations with restricted access;
- high exception count;
- unstructured document processing;
- AI evaluation and human review;
- multiple environments;
- missing test data;
- complex approval/escalation paths;
- high-volume performance requirement.

Drivers link to source evidence and affected proposals.

## Example 1 — Simple deterministic automation

### Evidence

- 8 linear steps.
- One web application.
- No decisions.
- One simple business exception.
- Daily run, low volume.
- Credentials and test environment confirmed.
- No human approval.

### Structured flow

```text
Start -> Login -> Search -> Read -> Validate -> Write -> Notify -> End
```

### Proposed work

- Web session/login transaction.
- Search and data extraction.
- Validation rule.
- Target write/update.
- Notification.
- Basic exception/logging path.

### Scenario behavior

- Optimistic: confirmed happy path and basic exception.
- Expected: normal retry/logging and standard test coverage.
- Conservative: minor selector/environment variance.

### Confidence

High if inputs, selectors, test data, and access are confirmed. The estimate
retains the current overhead policy. No AI work is proposed.

## Example 2 — Documents, decisions, and integrations

### Evidence

- Invoices arrive by email as PDF.
- Two layouts are known; a third is possible.
- Extracted data is validated against an API and posted to SAP.
- Three decision branches.
- Rejected invoices require human review.
- OAuth/API access exists but SAP non-production access is pending.

### Proposed work

- Mailbox ingestion and idempotency.
- Document classification/extraction.
- Validation rules and three branch paths.
- External API integration.
- SAP transaction/integration.
- Human review queue and resolution.
- Exception/retry/escalation behavior.
- Evaluation dataset and extraction quality checks.

### Drivers

- document variability;
- SAP access uncertainty;
- human-review workflow;
- cross-system reconciliation;
- exception coverage.

### Scenario behavior

The conservative scenario increases environment/access, document variability,
and UAT/test factors. It does not add the same integration work twice.

### Confidence

Medium until SAP access and third-layout requirements are resolved.

## Example 3 — AI-assisted flow with human in the loop

### Evidence

- Customer messages are classified and summarized.
- Low-risk cases may be routed automatically.
- High-risk or low-confidence cases require approval.
- Model output must be explainable and auditable.
- Error tolerance and acceptance threshold are not yet approved.

### Proposed work

- Input normalization and privacy controls.
- Classification and summary behavior design.
- Prompt/model configuration.
- Evaluation dataset and rubric.
- Confidence threshold and routing.
- Human approval interface/state.
- Deterministic fallback.
- Audit logging and observability.
- Failure, timeout, retry, and escalation behavior.

### Drivers

- missing acceptance thresholds;
- evaluation breadth;
- privacy and explainability;
- human-review operational design;
- model/provider variability.

### Scenario behavior

The optimistic scenario assumes an approved existing model and representative
evaluation data. The conservative scenario accounts for rubric iteration,
threshold tuning, provider fallback, and extended UAT. It does not represent
model uncertainty as arbitrary hidden contingency.

### Confidence

Low until acceptance thresholds, evaluation dataset, and privacy controls are
confirmed. The model shall recommend discovery actions to raise confidence.

## Calibration plan

Before production use of new numeric rules:

1. Collect anonymized completed-project estimates and actuals.
2. Map actuals to proposal/work categories.
3. Compare rule outputs by project archetype.
4. Review systematic under/over-estimation.
5. Version coefficients.
6. Add regression fixtures.
7. Require human approval for coefficient changes.
8. Preserve prior rule versions for historical reproducibility.

## Acceptance gates for implementation

- Rule catalog and numeric defaults approved.
- Confidence dimensions, weights, and bands approved.
- Overhead/double-count policy approved.
- Three worked examples reproduced by deterministic tests.
- Existing project formula fixtures remain unchanged.
- No endpoint scenario produces complete, labeled results.
- Every scenario total is traceable and reproducible.
