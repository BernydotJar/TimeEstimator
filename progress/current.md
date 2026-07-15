# Current Progress

## Selected feature

`008-project-assessment-estimation-documentation`

Status: `in_progress`

Mode: `SHIP`

Implementation branch: `feature/008-documentation-flow`

Base: `main` after Phase 4A merge commit `cf18f21f7c531091a7d014132ef34b0f1fd3ab2d`

Tracking issue: `#13 Feature 008 Phases 5–6 — Documentation and flow projections`

Draft PR: `#14 feat: add structured documentation and flow projections`

## Lifecycle

- Feature 003: `blocked`; merged implementation remains in `main`, with RPT-001, RPT-002, and browser QA unresolved.
- Feature 008: `in_progress`.
- Phase 1: `PASS`.
- Phase 2: `PASS`.
- Phase 3: `PASS`.
- Phase 4A: `PASS`; PR #12 merged into `main` at `cf18f21f7c531091a7d014132ef34b0f1fd3ab2d`.
- Phase 4B: not implemented in this branch.
- Phases 5–6: `in_progress` in Draft PR #14.

## Phases 5–6 scope

- `008-0501` generate process overview and inventories.
- `008-0502` generate risks, delivery plan, and estimation summary.
- `008-0503` preserve manual overrides during regeneration.
- `008-0601` generate deterministic Mermaid from the structured graph.
- `008-0602` provide an accessible textual flow alternative.
- `008-0603` define a BPMN-compatible export boundary without implementing a full exporter.

## Implemented increments

- Extended the documentation domain additively with generator metadata, warnings, unknowns, assumptions, manual override metadata, and reconciliation history.
- Added deterministic generation for eight structured artifact drafts.
- Added input snapshot hashing and generator versioning.
- Added Markdown projection from structured blocks.
- Added explicit regeneration decisions that preserve locked/manual sections by default and record conflicts.
- Added deterministic Mermaid `flowchart TD` projection with safe node IDs, escaped labels, branch labels, source references, and missing-endpoint warnings.
- Reused the existing textual flow serializer as the accessible fallback.
- Added a BPMN-compatible contract boundary for events, tasks, gateways, sequence flows, lanes, extensions, source references, and warnings; no exporter or dependency was added.
- Added browser-local artifact persistence and audit entries within the existing discovery envelope.
- Added a Documentation Studio entry and review workspace with artifact navigation, structured preview, source inspection, manual notes, regeneration controls, Markdown copy, Mermaid source copy, textual flow copy, warnings, unknowns, and reconciliation history.
- Integrated the workspace into `/project?id=<id>` without changing formulas or report calculations.
- Added domain, persistence, and component tests.
- Added execution prompt `prompts/goal-008-phases-5-6-documentation-flow.md`.

## Protected invariants

- Structured assessment, process, proposal, activity, and estimation models remain source of truth.
- Mermaid, Markdown, textual flow, and BPMN boundary are derived projections only.
- Missing values remain unknown and scenario ranges are not asserted when unavailable.
- Generated claims are not promoted to observed evidence.
- Manual sections are not removed without an explicit replacement decision.
- Existing formulas, `DEFAULT_OVERHEAD`, activities, reports, routes, dependencies, workflows, static export, and `te_projects` compatibility remain unchanged.
- No backend, database, authentication, external transmission, BPMN library, or full BPMN exporter was added.

## Verification status

Pending GitHub Actions against the final branch HEAD:

- dependency installation;
- typecheck;
- lint;
- tests;
- production dependency audit;
- static build.

`git diff --check`, real-browser responsive checks, keyboard navigation, focus visibility, copy controls, dialogs, screen-reader structure, and responsive overflow remain required or must be documented as explicit debt.

## Next gate

Resolve every automated failure, update issue #13 and Draft PR #14 with final evidence, mark Phases 5–6 as `REVIEW` only when automated gates pass, and stop before merge.
