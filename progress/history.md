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
- GitHub Actions run `29389971404` is the automated verification gate for installation, typecheck, lint, tests, production audit, and static build.
- Real browser QA at 320px, 390px, 768px, and desktop remains required before visual, responsive, or accessibility PASS can be claimed.
- Feature 008 remains `in_progress`; Phase 2 stops at human review and does not mark the full feature done.
