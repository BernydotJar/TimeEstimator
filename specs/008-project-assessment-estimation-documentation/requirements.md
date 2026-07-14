# Requirements — 008 Project Discovery & Estimation Studio

## Feature

Turn TimeEstimator from a manual activity calculator into a guided discovery,
process-modeling, effort-estimation, and initial documentation workspace while
preserving the existing deterministic formulas and browser-local operating
model.

## Mode

SHIP

## Status

`spec_ready`

Implementation requires explicit human approval.

## Problem statement

The current product can store projects, accept activities, calculate base and
overhead effort, import free-text steps into heuristic activity suggestions, and
render a report. It does not yet provide a structured consulting assessment,
retain a process model, explain how evidence becomes effort, generate reusable
process documentation, or produce reliable stakeholder-ready exports.

Two verified reporting defects are part of this feature scope:

- **RPT-001:** Print / PDF does not produce a usable, correctly paginated report.
- **RPT-002:** Save PNG captures the complete report as one excessively tall image.

The direct route `/project?id=<id>` is confirmed functional after browser-storage
hydration and is a protected regression requirement.

## Goals

1. Guide an automation architect through a structured project assessment.
2. Persist partial, complete, and explicitly unknown answers.
3. Model a current-state process as structured steps and directed edges.
4. Convert evidence-backed process steps into reviewable activity proposals.
5. Produce optimistic, expected, and conservative estimates with visible logic.
6. Trace every estimate output to answers, steps, assumptions, rules, adjustments,
   overheads, and user decisions.
7. Generate initial process and delivery documentation from structured data.
8. Generate Mermaid flow representations without using Mermaid as source of truth.
9. Export a bounded executive-summary PNG and a complete multipage Print/PDF report.
10. Preserve compatibility with existing browser-local projects and formulas.

## Personas

### Automation architect

Runs discovery workshops, documents process evidence, reviews generated
activities, calibrates estimates, and prepares stakeholder outputs.

### Delivery lead / project manager

Reviews scope, phases, dependencies, risk, confidence, and delivery scenarios.

### Business process owner

Supplies current-state knowledge, validates assumptions, decisions, exceptions,
and expected outcomes.

### Technical reviewer

Validates systems, interfaces, security constraints, data handling, and estimate
rationale.

### Executive stakeholder

Consumes an executive summary, confidence range, major drivers, exclusions, and
recommended next decisions.

## Jobs to be done

- When assessing a potential automation, capture enough business and technical
  evidence to create a defensible first estimate.
- When process steps are available, transform them into a structured flow and
  proposed delivery activities without silently modifying the project.
- When evidence is incomplete, represent unknowns honestly and show their impact
  on confidence.
- When reviewing an estimate, inspect why each activity and overhead exists.
- When preparing a proposal or handoff, generate consistent process, integration,
  risk, delivery, and estimation documentation.
- When sharing results, export a readable one-page visual summary and a complete
  multipage document.

## User journeys

### Journey A — Guided assessment

1. Open an existing project through `/project?id=<id>`.
2. Start or resume an assessment.
3. Complete sections in any order or mark answers as unknown.
4. Add evidence, notes, assumptions, and open questions.
5. Review completeness and unresolved high-impact unknowns.
6. Generate an initial deterministic estimate proposal.
7. Review, edit, include, or exclude every proposed activity.
8. Apply approved activities to the project with an audit record.

### Journey B — Step-by-step process ingestion

1. Paste numbered steps, bullets, a checklist, or free text.
2. Parse content locally when no n8n endpoint is configured.
3. Review normalized steps, actors, systems, decisions, exceptions, and edges.
4. Correct the process model before estimating.
5. Generate traceable activity proposals.
6. Apply only explicitly selected proposals.
7. Generate current-state and proposed future-state flows.

### Journey C — Documentation and export

1. Select documentation artifacts to generate.
2. Preview source evidence and unresolved assumptions.
3. Generate process overview, flows, activity breakdown, integration inventory,
   delivery plan, risks, and estimation summary.
4. Export a bounded executive-summary PNG.
5. Open a dedicated print report and save a complete multipage PDF.

## Functional requirements

### FR-001 Assessment lifecycle

The product shall create one versioned `ProjectAssessment` per project and support
`not_started`, `in_progress`, `ready_for_review`, `reviewed`, and `superseded`
states.

### FR-002 Assessment sections

The assessment shall include:

1. Project Overview.
2. Current-State Process.
3. Process Complexity.
4. Technical Landscape.
5. AI and Automation Suitability.
6. Delivery and Governance.
7. Risks and Assumptions.

### FR-003 Answer states

Each answer shall support `answered`, `unknown`, `not_applicable`, and
`unanswered`. Unknown values shall not be replaced with generated facts.

### FR-004 Progressive persistence

Assessment answers, notes, evidence references, process steps, documentation
artifacts, and estimate drafts shall save progressively in browser-local storage.

### FR-005 Completeness

The product shall show section completion and distinguish completion percentage
from estimate confidence.

### FR-006 Process ingestion

The product shall accept numbered lists, bullets, checklists, plain descriptions,
and manually entered steps.

### FR-007 Structured process model

Each step shall support stable ID, name, description, actor, system, inputs,
outputs, type, decision condition, exception behavior, frequency, volume,
complexity, automation suitability, supervision, dependencies, evidence, and
notes.

Supported MVP step types:

- `start`
- `task`
- `user_task`
- `system_task`
- `ai_task`
- `decision`
- `approval`
- `integration`
- `document_processing`
- `wait`
- `notification`
- `exception`
- `end`

### FR-008 Directed flow

The process model shall store explicit edges with source, target, optional label,
condition, edge type, and order. Linear order alone is insufficient for decisions,
exceptions, approvals, and retries.

### FR-009 Review before apply

Generated activity proposals shall never modify project activities until the user
reviews and explicitly applies selected proposals.

### FR-010 Activity proposal rationale

Each proposal shall expose origin step(s), phase/category, core or supervised
model, base effort, factors, overhead treatment, rationale, confidence,
assumptions, exclusions, and source (`deterministic`, `heuristic`, `n8n`, or
`manual`).

### FR-011 Scenario estimates

The estimation output shall contain optimistic, expected, and conservative
scenarios; total range; confidence; unknowns; assumptions; exclusions; effort
drivers; risks; phase breakdown; work-type breakdown; core/supervised breakdown;
overheads; and rationale.

### FR-012 Deterministic baseline

Without an n8n endpoint, all required assessment, normalization, mapping,
scenario, documentation-template, and export functions shall remain available
through deterministic or clearly labeled heuristic behavior.

### FR-013 AI boundary

Optional AI may parse, classify, summarize, or suggest. It shall not silently
change observed inputs, approved activities, formulas, scenario parameters, or
manual edits.

### FR-014 Documentation artifacts

The product shall generate drafts for:

- Process Overview.
- Current-State Flow.
- Proposed Future-State Flow.
- Activity Breakdown.
- Assumptions and Risks.
- Integration Inventory.
- Initial Delivery Plan.
- Estimation Summary.

### FR-015 Flow representation

The structured process model shall be source of truth. Mermaid shall be a derived
representation with stable step IDs embedded where practical.

### FR-016 Regeneration

Regenerating an artifact shall preserve user-authored overrides by separating
generated blocks from manual blocks or by requiring an explicit replacement
choice.

### FR-017 Traceability

The user shall be able to navigate from estimate scenario or activity proposal to
its source answers, steps, assumptions, rules, and adjustments.

### FR-018 Export summary PNG

Save PNG shall export a bounded executive summary only. It shall not capture the
entire multipage report or surrounding application/dialog chrome.

### FR-019 Full Print/PDF

Print / PDF shall use a dedicated printable surface that produces a complete,
multipage report with controlled page breaks and no application chrome.

### FR-020 Direct-route regression

A valid `/project?id=<id>` URL shall continue loading the persisted project only
after storage hydration. Unknown IDs shall redirect only after hydration.

## Non-functional requirements

### NFR-001 Explainability

No estimate total may appear without accessible inputs, formula/rule identifiers,
and user adjustments.

### NFR-002 Data integrity

Every persisted object shall have stable ID, schema version, created/updated
timestamps, and project ownership reference.

### NFR-003 Performance

For a project with 250 steps and 500 activity proposals:

- initial local load target: under 2 seconds on a current desktop browser;
- local calculation target: under 250 ms;
- interaction target: no blocking task over 100 ms without progress feedback;
- print preview generation target: under 5 seconds excluding the browser dialog.

### NFR-004 Static compatibility

The feature shall remain compatible with Next.js static export, GitHub Pages,
browser-local persistence, and no backend.

### NFR-005 Resilience

Corrupt or older local data shall not crash the application. The system shall
retain recoverable data, report migration/fallback status, and avoid destructive
overwrite.

### NFR-006 Security and privacy

No credentials, assessment evidence, or project data shall be sent externally
unless the user has configured an approved endpoint and initiated the operation.

### NFR-007 Accessibility

Forms, steppers, process editors, proposal review, artifact previews, and exports
shall meet WCAG 2.2 AA intent for keyboard operation, focus visibility, labels,
contrast, reduced motion, error association, and screen-reader structure.

### NFR-008 Responsive behavior

The complete workflow shall be usable at approximately 320, 390, 768, and desktop
widths. Desktop may provide denser visualization, but mobile shall not hide
required decisions or actions.

## Persistence requirements

- Keep the existing `te_projects` key readable.
- Prefer a versioned project envelope or additive optional fields rather than a
  destructive key replacement.
- Existing projects without assessment/process/documentation fields shall load
  with empty defaults.
- Store generated artifacts as structured content plus generation metadata, not
  only pre-rendered HTML or Mermaid strings.
- Manual overrides shall have distinct provenance.
- Migration shall be idempotent and covered by tests.

## Traceability requirements

Every generated or calculated item shall carry references using a common
`TraceabilityReference` shape supporting at least:

- assessment answer;
- process step;
- process edge;
- assumption;
- rule;
- estimation factor;
- generated activity proposal;
- approved activity;
- manual adjustment;
- overhead;
- documentation artifact.

References shall remain stable across artifact regeneration and activity review.

## Reporting requirements

- Executive report starts with outcome, range, confidence, drivers, exclusions,
  and required decisions.
- Detailed report includes evidence-backed breakdowns, flow diagrams, integrations,
  assumptions, risks, activities, overheads, and audit trail.
- Generated and manual content shall be visually distinguishable in editor/review
  surfaces, but exports may present a clean unified document with provenance notes.
- Long tables shall repeat headers where browser print support permits and shall
  not rely on horizontal scrolling in PDF.

## Export requirements

### PNG

- Export target: executive summary, not full report.
- Recommended logical canvas: 1440 × 1800 px maximum at 1×, or equivalent bounded
  ratio at device scale.
- Include project name, date, estimate range, confidence, KPI summary, principal
  drivers, top risks, and one compact chart.
- Exclude action controls, dialog chrome, hidden overflow, and detailed tables.
- Fail with actionable feedback when rendering cannot complete.

### Print/PDF

- Use a dedicated route or isolated render root.
- Support A4 and US Letter through print CSS.
- Remove fixed positioning, transforms, viewport-bound heights, and modal overflow.
- Apply page-break policy by semantic section.
- Keep charts and key-value blocks together where practical.
- Render detailed tables in printable column sets.
- Do not require a server or PDF-generation dependency for MVP.

## Error states

The UI shall explicitly handle:

- incomplete assessment;
- missing high-impact answers;
- invalid or disconnected process edges;
- process with no start or end;
- circular flow without declared retry/loop semantics;
- zero selected activity proposals;
- unsupported imported content;
- invalid scenario parameters;
- missing traceability references;
- stale generated artifact;
- corrupt local storage;
- unavailable n8n endpoint;
- Mermaid rendering failure;
- PNG rendering failure;
- print route with missing project data.

## Acceptance criteria

1. A partial assessment survives refresh with answer states and evidence intact.
2. Unknown answers lower confidence or create explicit uncertainty without invented
   values.
3. A process with decisions, exceptions, approval, AI supervision, integration,
   retry, and end can be represented structurally.
4. Process steps generate reviewable proposals without changing project activities.
5. Applying selected proposals creates traceable activities and an audit record.
6. Three scenarios are generated using documented parameters and visible rationale.
7. Existing formulas remain unchanged until Feature 004 or an explicitly approved
   formula change is implemented.
8. Documentation artifacts are generated from structured data and can be
   regenerated without silently deleting manual content.
9. Mermaid output is derived from the structured process model.
10. A valid direct project URL remains functional after hydration.
11. Existing projects load without destructive migration.
12. PNG output is a bounded executive summary and is visually inspected.
13. Print preview/PDF contains only report content, paginates, and is visually
    inspected with long tables and charts.
14. Desktop, tablet, phone, keyboard, reduced-motion, corrupt-storage, and missing
    endpoint scenarios pass the approved QA plan.
15. Required automated tests, typecheck, lint, build, production audit, and diff
    checks pass before review.

## Out of scope

- Backend, database, accounts, authentication, or collaboration.
- Public credential storage.
- Automatic customer-facing proposal generation without human review.
- Server-side PDF generation in the MVP.
- Full BPMN 2.0 interchange or execution semantics.
- OCR or direct ingestion of arbitrary binary documents in the MVP.
- Silent changes to current estimation formulas.
- Automatic deployment or merge.

## Dependencies

- Feature 003 runtime, persistence, direct route, deterministic fallbacks, and UI
  integration.
- Feature 004 for future extraction/hardening of formula logic; Feature 008 must
  specify an adapter boundary and cannot assume Feature 004 is complete.
- Feature 005 overlaps export hardening; its scope should be superseded or narrowed
  during approval to avoid two active implementations.
- Feature 007 overlaps AI-assisted parsing; Feature 008 defines the product and
  data architecture that Feature 007 should follow or be superseded by.

## Lifecycle gates

### `spec_ready` → `approved`

Requires human approval of MVP scope, assessment UX, confidence model, report
architecture, PNG summary policy, print route, and relationship to Features 004,
005, and 007.

### `approved` → `in_progress`

Requires file boundaries, migration strategy, test plan, and implementation order.

### `in_progress` → `review`

Requires all selected tasks implemented, automated gates passing, and review
artifacts written.

### `review` → `done`

Requires observed browser QA, visual inspection of PNG and PDF, traceability
verification, migration/regression evidence, human approval, and a review-ready PR.
