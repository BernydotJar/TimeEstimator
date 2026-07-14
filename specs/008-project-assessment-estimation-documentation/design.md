# Design — 008 Project Discovery & Estimation Studio

## Design intent

Feature 008 adds a structured discovery and documentation layer around the
existing project workspace. It must preserve the current project route,
activity schema, overhead percentages, and calculation results while introducing
versioned assessment, process, traceability, scenario, artifact, and export
models.

The architecture is browser-local, static-hosting compatible, deterministic by
default, optionally AI-assisted, and review-before-apply.

## Current architecture baseline

The current application provides:

- `/` as the project dashboard;
- `/project?id=<id>` as a hydrated browser-local workspace;
- `useProjects` and `useLocalStorage` for persistence under `te_projects`;
- `Project` with activities and overhead percentages;
- metrics calculated in `ProjectPageClient`;
- free-text process-step parsing into activity suggestions;
- n8n calls behind `src/ai/client/*` with local heuristic fallback;
- report rendering inside a Radix dialog;
- PNG via `html2canvas(reportRef.current)`;
- Print/PDF via `window.print()` from the dialog.

Feature 008 shall extend these boundaries rather than replace them wholesale.

## Architectural principles

1. **Structured data is source of truth.** Markdown, Mermaid, HTML, PNG, and PDF
   are projections.
2. **Observed data and generated suggestions are separate.** AI or heuristics
   cannot rewrite evidence.
3. **Review before apply.** Generated activity proposals remain drafts until a
   user explicitly applies them.
4. **Deterministic baseline first.** Every required workflow works without an
   endpoint.
5. **Traceability by construction.** IDs and source references are created at the
   same time as generated outputs.
6. **Additive migration.** Existing projects load without destructive conversion.
7. **One report model, multiple renderers.** Screen, PNG summary, and Print/PDF use
   shared normalized report data but distinct layouts.
8. **No hidden calculation.** Scenario results expose inputs, rules, factors, and
   adjustments.

## Proposed module boundaries

```text
src/domain/discovery/
  assessment-schema.ts
  assessment-completeness.ts
  assessment-confidence.ts

src/domain/process/
  process-model.ts
  process-normalization.ts
  process-validation.ts
  process-to-mermaid.ts

src/domain/estimation/
  estimation-inputs.ts
  activity-proposal-engine.ts
  scenario-engine.ts
  traceability.ts
  current-formula-adapter.ts

src/domain/documentation/
  artifact-model.ts
  artifact-generators.ts
  artifact-regeneration.ts

src/domain/reporting/
  report-view-model.ts
  executive-summary-model.ts
  print-report-model.ts

src/persistence/
  project-envelope.ts
  project-migrations.ts

src/app/project/discovery/
  assessment and process surfaces

src/app/report/
  dedicated print route
```

Exact paths may be adapted during implementation, but domain logic shall not be
embedded in page components.

## Component architecture

### Project Discovery entry

The existing project header gains a `Discovery` entry point. It opens a dedicated
workspace region or route, not a large modal.

Recommended route shape:

```text
/project?id=<project-id>&view=discovery
```

This preserves the existing static `/project` artifact and query-parameter
navigation. A separate physical route may be introduced only if static-export
behavior remains verified.

### Assessment shell

Recommended UX: hybrid stepper plus section index.

- Desktop: left section navigation, central form, right evidence/completeness rail.
- Tablet: collapsible section navigation.
- Phone: linear stepper with save state and review summary.
- Sections may be completed in any order.
- Required high-impact questions are visually distinct from optional enrichment.

### Process modeler

MVP is form/table-first, not a freeform canvas.

- Raw input panel.
- Normalized step list.
- Step editor.
- Edge/condition editor.
- Validation panel.
- Mermaid preview.
- Activity proposal preview.

A visual node editor is deferred. Structured editing must remain accessible and
usable without drag-and-drop.

### Proposal review

Proposal review uses a stable table/card model with:

- include/exclude selection;
- source step links;
- editable category/model/base effort;
- visible factors and rationale;
- confidence and assumption warnings;
- comparison against existing project activities;
- explicit `Apply selected` action;
- apply receipt and audit entry.

### Estimate scenarios

Scenario view displays:

- optimistic, expected, conservative totals;
- deterministic base values;
- scenario factors;
- overheads;
- manual adjustments;
- confidence and unknowns;
- top drivers;
- change history.

The current total remains available as a legacy/current-formula view until the
estimation engine is approved and implemented.

### Documentation studio

The studio lists generated artifacts, freshness, source coverage, and manual
edits. Each artifact has:

- structured source snapshot/version;
- generated sections;
- manual sections;
- status (`draft`, `reviewed`, `stale`, `superseded`);
- preview;
- regenerate action with diff/replace decision;
- export inclusion toggle.

## Data flow

```text
Project
  ├─ ProjectAssessment
  │    └─ AssessmentAnswer + evidence
  ├─ ProcessDefinition
  │    ├─ ProcessStep
  │    └─ ProcessEdge
  ├─ EstimationDraft
  │    ├─ EstimationInput
  │    ├─ EstimationFactor
  │    ├─ GeneratedActivityProposal
  │    └─ EstimateScenario
  ├─ Project.activities (existing, approved/applied only)
  ├─ DocumentationArtifact
  └─ AuditEntry / TraceabilityReference
```

Flow:

1. User records assessment evidence.
2. User imports or creates process steps.
3. Normalization creates structured steps and edges.
4. Validation reports gaps; it does not fabricate missing paths.
5. Proposal engine maps answers and steps to activity proposals.
6. Scenario engine calculates ranges from proposals, factors, unknowns, and the
   current formula adapter.
7. User reviews and applies selected proposals.
8. Documentation generators create artifact drafts.
9. Report view-model combines reviewed data for screen/PNG/PDF renderers.

## State transitions

### Assessment

```text
not_started -> in_progress -> ready_for_review -> reviewed
                                  |                  |
                                  v                  v
                             in_progress         superseded
```

### Process definition

```text
draft -> normalized -> validated -> reviewed -> superseded
```

Validation may produce errors/warnings without changing the status automatically.

### Activity proposal

```text
proposed -> edited -> included/excluded -> applied
                                      \-> superseded
```

Applied proposals are immutable receipts. Subsequent edits create new proposal
versions.

### Documentation artifact

```text
draft -> reviewed -> stale -> regenerated/reviewed
                    \-> superseded
```

## Local persistence

### Recommended storage model

Move toward a versioned envelope while retaining compatibility:

```ts
interface PersistedProjectEnvelope {
  schemaVersion: number;
  project: Project;
  discovery?: ProjectDiscoveryState;
}
```

Implementation may initially add optional fields directly to `Project` if a full
envelope migration would exceed the approved scope. Either approach must:

- read existing `Project[]` values from `te_projects`;
- create defaults lazily;
- avoid data loss;
- preserve project IDs and timestamps;
- write only after successful migration;
- retain a recoverable backup value during migration where practical.

### Persistence granularity

Persist on controlled field updates with debounce for text-heavy forms. Do not
serialize on every keystroke without rate control. Critical state transitions and
apply actions persist immediately.

## Deterministic fallback architecture

Required local engines:

- question completeness evaluator;
- process-line parser;
- step type classifier using explicit rules;
- process graph validator;
- step-to-activity mapping rules;
- scenario calculation;
- confidence calculation;
- documentation templates;
- Mermaid generator;
- report view-model generation.

Each result returns:

```ts
{
  value,
  source: "deterministic" | "heuristic" | "n8n" | "manual",
  ruleIds: string[],
  warnings: string[],
  traceability: TraceabilityReference[]
}
```

## Optional AI enhancement

AI/n8n may:

- normalize free text into candidate steps;
- suggest actors, systems, inputs, outputs, and exception classifications;
- propose activity mappings;
- summarize evidence;
- draft documentation text;
- suggest missing discovery questions.

AI/n8n may not:

- overwrite raw input or reviewed structured data;
- apply activities;
- change scenario parameters silently;
- mark unknowns as known;
- change formulas;
- claim high confidence without evidence;
- transmit data without an explicit configured endpoint and user action.

All AI outputs must be reviewable and retain source label plus response metadata.

## Review-before-apply workflow

1. Generate proposals into a draft set with version and input snapshot hash.
2. Show all proposals unambiguously as suggestions.
3. Allow edit/include/exclude.
4. Validate effort values and required fields.
5. Show impact preview on current metrics.
6. Require explicit confirmation.
7. Add activities through the existing project mutation boundary.
8. Store proposal-to-activity mappings and an apply receipt.
9. Never reapply the same proposal version without warning.

## Current formula adapter

Feature 008 shall define an adapter around the existing equations:

```text
base = sum(activity effort)
core = sum(core activity effort)
supervised = sum(supervised activity effort)
overhead item = base × configured percentage
grand total = base + all overhead items
```

The scenario engine may calculate draft ranges around proposal inputs, but the
persisted project metric shown as the current estimate must remain exactly
compatible until a separately approved formula change is implemented.

The adapter provides:

- input normalization;
- call into extracted/current calculation logic;
- scenario wrappers;
- traceability records;
- no duplicated formulas in UI components.

## Confidence design

Confidence is not completion. It is derived from evidence quality and uncertainty.
Recommended dimensions:

- scope clarity;
- process coverage;
- decision/exception coverage;
- system/interface certainty;
- data/document certainty;
- volume/frequency certainty;
- security/access certainty;
- acceptance/UAT certainty;
- dependency certainty.

Each dimension uses documented scoring, evidence coverage, and unknown penalties.
AI may explain confidence but may not set the numeric score independently.

## Documentation generation

Artifact generators consume structured domain models and return structured
sections, not a single opaque Markdown blob.

Example:

```ts
interface GeneratedSection {
  id: string;
  title: string;
  kind: "generated" | "manual";
  blocks: DocumentationBlock[];
  sourceRefs: TraceabilityReference[];
  generatedAt?: string;
}
```

A Markdown/Mermaid projection may be produced for copying or export.

## Flow rendering

### Source of truth

`ProcessDefinition.steps` plus `ProcessDefinition.edges`.

### Mermaid projection

Generate `flowchart TD` for MVP. Node IDs derive from stable step IDs through a
safe normalization function. Labels are escaped. Edge labels represent decisions,
exceptions, and retry conditions.

### Actor/system representation

MVP may use subgraphs by actor or system when the graph remains readable. Formal
swimlane semantics and BPMN interchange are deferred.

### Failure behavior

If Mermaid rendering fails:

- preserve structured data;
- show the textual step/edge representation;
- identify the invalid projection;
- allow copy of Mermaid source;
- do not block estimation or documentation generation.

## Report rendering architecture

### Shared report view-model

Create one normalized `ReportViewModel` containing content and provenance. Do not
reuse the live interactive workspace DOM as the export source.

### Screen report

Interactive preview may remain in a dialog or dedicated view, but controls and
content have separate DOM roots.

### PNG renderer

Render `ExecutiveSummaryCard` in an off-screen or dedicated fixed-size container.
Capture only that node. Recommended logical size is bounded at approximately
1440 × 1800 px, with one compact chart and no detailed activity table.

### Print/PDF renderer

Recommended MVP: dedicated `/report?id=<id>&mode=print` route or equivalent
isolated static-compatible page state. It renders only `PrintReport` and calls
`window.print()` after data hydration and chart readiness.

A dialog shall link to/open the print view rather than printing the modal tree.

### Why a dedicated print surface

It avoids:

- `position: fixed` and transform behavior from Radix dialogs;
- viewport-bound `max-height` and overflow;
- application shell leakage;
- print selectors coupled to utility-class combinations;
- hidden content caused by modal portals;
- action controls appearing in output.

## Print policy

- Support `@page` for A4 and US Letter margins.
- Set print color adjustment explicitly.
- Use semantic section wrappers with `break-before`, `break-after`, and
  `break-inside` rules.
- Repeat table headers with `thead { display: table-header-group; }`.
- Avoid horizontal scrolling; use a print-specific subset or stacked rows.
- Render charts at deterministic dimensions before print.
- Show page-friendly URLs/IDs only when useful.
- Include generated date, project/version, assumptions, exclusions, and provenance.

## PNG policy

- Summary-only.
- Fixed width and maximum height.
- No detailed activity ledger.
- Truncate/limit top risks and drivers with an explicit `+N more` indicator.
- White or explicit theme-independent background.
- Deterministic filename.
- Use `toBlob` where possible rather than large data URLs.
- Show progress and actionable failure state.

## Direct URL compatibility

- Continue to read `id` from query parameters.
- Do not resolve a project until `hydrated` is true.
- Discovery and report views must reuse the same hydration gate.
- A missing/unknown ID redirects only after hydration.
- Print view must not initiate printing for missing or unresolved data.

## Error handling

Domain operations return typed errors/warnings rather than relying on toast-only
behavior. UI may surface them as inline summary plus toast for transient actions.

Error classes:

- validation error;
- migration error;
- persistence error;
- endpoint error;
- generation error;
- traceability error;
- export render error;
- print readiness error.

User-entered data remains available after recoverable errors.

## Migration and backward compatibility

1. Detect legacy project shape.
2. Add optional discovery state defaults in memory.
3. Validate activities and overhead values without changing valid values.
4. Persist upgraded shape only after a user mutation or explicit safe migration.
5. Preserve IDs and dates.
6. Record schema version.
7. Test repeated migration.
8. Provide corrupt-data fallback without silently deleting the original value.

## Local observability

Store or expose a bounded local event log for significant actions:

- assessment created/reviewed;
- process imported/validated;
- proposals generated/applied;
- scenario recalculated;
- artifact generated/regenerated;
- migration completed/failed;
- export started/completed/failed.

No sensitive answer text is required in the event payload. Event records include
operation, timestamp, version, source, duration, counts, and error code.

## Testing strategy

### Unit

- schema defaults and migrations;
- completeness and confidence;
- parser normalization;
- process graph validation;
- step-to-activity rules;
- scenario calculations;
- traceability linking;
- Mermaid escaping/projection;
- artifact generators;
- report view-model;
- filename and export constraints.

### Component

- partial assessment persistence;
- unknown answer state;
- proposal review and explicit apply;
- stale artifact indication;
- responsive form/step editor;
- export progress and error states.

### Integration

- direct route after hydration;
- legacy project migration;
- process input through applied activities;
- no-endpoint deterministic workflow;
- n8n response normalization;
- report route hydration;
- PNG capture target isolation.

### Browser/visual

- desktop/tablet/phone;
- keyboard/focus/reduced motion;
- executive PNG inspection;
- multipage Print/PDF inspection;
- charts and long tables;
- light/dark input with theme-independent exports.

## Tradeoffs

### Hybrid assessment vs single long form

Hybrid stepper improves progress and mobile usability while retaining random access
for workshops. It adds state/navigation complexity but is recommended.

### Structured editor vs visual canvas

A table/form editor is less visually impressive but more accessible, testable, and
reliable for MVP. Visual canvas is deferred.

### Mermaid vs BPMN

Mermaid is lightweight and static-compatible but not a full process standard.
Use it as a projection; retain a future BPMN adapter boundary.

### Browser Print/PDF vs PDF library

Browser print preserves static/offline operation and avoids a dependency. It
requires disciplined layout and real browser QA. Adopt dedicated print route for
MVP; reassess library/server generation only after measured limitations.

### Summary PNG vs full report image

A bounded summary is readable and useful for sharing. A full report image is not.
Detailed content belongs in PDF.
