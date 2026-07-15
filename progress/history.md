# Progress History

## 2026-07-09

- Connected TimeEstimator to harness-sdlc operating model on branch `feature/harness-cinematic-frontend`.
- Added `AGENTS.md`, `RTK.md`, `CLAUDE.md`, `feature_list.json`, progress files, and specs.
- Implemented the cinematic command-center frontend while preserving estimation formulas.
- Feature 002 remained subject to review and verification.

## 2026-07-11

- Consolidated cinematic UI, n8n boundaries, browser-local projects, deterministic fallbacks, reports, static export, linting, tests, and audit gates under Feature 003.
- Published and later merged PR #4.
- Feature 003 remains `blocked` by RPT-001 Print/PDF, RPT-002 unbounded PNG, and remaining browser QA; merged code remains intact.

## 2026-07-14 — Feature 008 specification

- Confirmed direct `/project?id=<id>` hydration behavior.
- Authored the SHIP specification for Project Discovery & Estimation Studio.
- Defined structured assessment, process graph, traceability, scenarios, documentation, Mermaid projection, bounded PNG, and a dedicated Print/PDF surface.
- Registered Feature 008 and received explicit approval for the recommended MVP decisions.

## 2026-07-14 — Feature 008 Phase 1

- Transitioned Feature 008 to `in_progress` and reconciled Feature 003 to `blocked`.
- Added the optional versioned discovery domain, process/estimation/documentation types, and lazy idempotent migration.
- Preserved `te_projects`, project IDs, activities, overhead percentages, direct-route behavior, and all existing formulas.
- Published PR #8 and validated dependency installation, typecheck, lint, tests, production audit, and static build through GitHub Actions.
- PR #8 merged into `main` at `c343ac324989d140f711ef7ea424aefe81fbb419`.

## 2026-07-14 — Feature 008 Phase 2

- Created `feature/008-assessment-ui` from the validated Phase 1 merge commit.
- Added a fixed catalog version with seven sections and 28 stable questions.
- Added pure assessment services for answer states, evidence, completeness, high-impact unknowns, and review readiness.
- Added progressive browser-local persistence and retained lazy legacy compatibility.
- Added desktop and phone assessment navigation, all MVP field types, notes, evidence references, progress metrics, and an honest review gate.
- Added domain, persistence, and component tests.
- Preserved activities, overheads, formulas, reports, and `/project?id=<id>` integration.
- PR #9 merged into `main`.

## 2026-07-15 — Feature 008 Phase 3

- Added deterministic process ingestion, candidate review, structured actors/systems/steps/edges, graph validation, provenance, local persistence, Project Studio integration, and dedicated tests.
- Local validation passed typecheck, lint, 17 suites / 57 tests, production audit with 0 vulnerabilities, static build, and `git diff --check`.
- PR #10 merged into `main` at `44ba4b12fda9fef8913d13115f9d6750cc57e40b`.
- Phase 3 transitioned to `PASS`; Feature 008 remained `in_progress`.

## 2026-07-15 — Feature 008 Phase 4A

- Created issue #11 and branch `feature/008-estimation-proposals` from the Phase 3 merge.
- Opened PR #12: `feat: add traceable activity proposal workflow`.
- Added deterministic proposal generation, stable IDs and snapshot hashing, safe grouping, review-before-apply, preview without mutation, mappings, receipts, audit entries, and duplicate protection.
- Added domain, persistence, and component tests while preserving formulas and overhead defaults.
- GitHub Actions run `29394527214` passed installation, typecheck, lint, tests, production audit, and static build.
- PR #12 merged into `main` at `cf18f21f7c531091a7d014132ef34b0f1fd3ab2d`.
- Phase 4A transitioned to `PASS`; browser accessibility and responsive QA remain recorded debt.

## 2026-07-15 — Feature 008 Phases 5–6

- Created issue #13 and branch `feature/008-documentation-flow` from the Phase 4A merge.
- Opened Draft PR #14: `feat: add structured documentation and flow projections`.
- Extended documentation artifacts additively with generator metadata, warnings, unknowns, assumptions, manual override state, and reconciliation history.
- Added deterministic generation for eight structured artifact drafts and Markdown projection.
- Added regeneration that preserves locked/manual sections by default, records conflicts, and requires explicit replacement to discard them.
- Added deterministic Mermaid `flowchart TD`, safe node identifiers, escaped labels, edge conditions, missing-endpoint warnings, and source references.
- Reused the existing textual process serializer as an accessible fallback.
- Added a BPMN-compatible boundary for events, tasks, gateways, flows, lanes, extensions, source references, and warnings without adding a library or full exporter.
- Added browser-local persistence, audit entries, Project Studio integration, artifact navigation, structured previews, manual notes, copy controls, and source inspection.
- Added domain, persistence, and component tests.
- Preserved formulas, overhead defaults, existing activities, reports, routes, dependencies, workflows, static export, and `te_projects` compatibility.
- PR #14 merged into `main` at `537b4aef9e00facedd45923ea6e7da1eae9d2cdb`.
- Phases 5–6 transitioned to `PASS`; browser visual and responsive debt remains recorded.

## 2026-07-15 — Feature 008 Phases 7–8

- Created issue #15 and branch `feature/008-report-export-architecture` from the Phases 5–6 merge.
- Opened Draft PR #16: `feat: add bounded report and print export architecture`.
- Added one normalized report view-model for interactive preview, bounded PNG, and Print/PDF.
- Preserved current formulas while treating unavailable scenarios and confidence policy as explicit pending states.
- Added a fixed executive-summary root with bounded content and a 1440×1800 maximum rendered target.
- Replaced full-report PNG capture with summary-only `toBlob()` export and deterministic safe filenames.
- Added an isolated static-compatible `/report?id=<project-id>` route with hydration, missing-project, empty-report, readiness, and explicit print states.
- Added controlled light print styling, hidden print toolbar, page-break boundaries, repeating table headers, reduced columns, and text wrapping.
- Added tests for report totals, no hidden scenarios, filenames, bounded content, semantic print output, and route behavior.
- Initial CI passed installation, typecheck, and lint, then exposed an obsolete filename expectation; the contract and test were corrected.
- Full automated verification and real PNG/PDF artifact inspection remain gates before transition to `REVIEW`.
