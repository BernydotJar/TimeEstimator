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
- Added a fixed catalog version with seven ordered sections and 28 stable questions.
- Added pure assessment services for explicit answer states, notes, evidence, completeness, section status, high-impact unknowns, and deterministic review readiness.
- Added progressive assessment persistence within each existing `Project.discovery` record and retained lazy legacy compatibility.
- Added a Project Assessment entry, desktop section index, phone Previous/Next navigation, all MVP field types, notes, evidence references, progress metrics, and an honest review gate.
- Added domain, persistence, and component tests.
- Preserved activities, overheads, formulas, reports, and `/project?id=<id>` integration.
- Opened Draft PR #9: `feat: add structured project assessment workflow`.
- GitHub Actions run `29389971404` was the automated verification gate for installation, typecheck, lint, tests, production audit, and static build.
- Real browser QA at 320px, 390px, 768px, and desktop remained required before visual, responsive, or accessibility PASS could be claimed.
- Feature 008 remained `in_progress`.

## 2026-07-15 — Feature 008 Phase 3

- Added deterministic process ingestion, candidate review, structured actors/systems/steps/edges, graph validation, provenance, local persistence, Project Studio integration, and dedicated tests.
- Local validation passed typecheck, lint, 17 suites / 57 tests, production audit with 0 vulnerabilities, static build, and `git diff --check`.
- PR #10 merged into `main` at `44ba4b12fda9fef8913d13115f9d6750cc57e40b`.
- Phase 3 transitioned to `PASS`; Feature 008 remained `in_progress`.

## 2026-07-15 — Feature 008 Phase 4A

- Created issue #11 and branch `feature/008-estimation-proposals` from the Phase 3 merge.
- Opened Draft PR #12: `feat: add traceable activity proposal workflow`.
- Added a versioned deterministic rule catalog and reproducible proposal generation from structured process and assessment inputs.
- Added stable proposal IDs, input snapshot hash, source references, rationale, warnings, unknown preservation, and safe grouping boundaries.
- Added browser-local proposal lifecycle persistence, edit/include/exclude/select review operations, preview without mutation, explicit-confirmation selected-only apply, mappings, receipts, audit entries, and duplicate-apply protection.
- Integrated the proposal review workspace into Project Discovery & Estimation Studio.
- Added domain, persistence, and component tests.
- Preserved current formulas, `DEFAULT_OVERHEAD`, dependencies, workflows, and external-data boundaries.
- GitHub Actions and complete local validation remain gates before Phase 4A can transition to review.
