# Current Progress

## Selected feature

`008-project-assessment-estimation-documentation`

Status: `in_progress`

Mode: `SHIP`

Implementation branch: `feature/008-estimation-proposals`

Base: `main` after PR #10 merge commit `44ba4b12fda9fef8913d13115f9d6750cc57e40b`

Tracking issue: `#11 Feature 008 Phase 4A — Traceable activity proposals`

Draft PR: `#12 feat: add traceable activity proposal workflow`

## Lifecycle

- Feature 003: `blocked`; merged implementation remains in `main`, with RPT-001, RPT-002, and browser QA unresolved.
- Feature 008: `in_progress`.
- Phase 1: `PASS`.
- Phase 2: `PASS`.
- Phase 3: `PASS`; PR #10 is merged and closed.
- Phase 4A: `in_progress`; implementation is published in Draft PR #12.

## Phase 4A objective

Complete:

- `008-0401` deterministic traceable activity proposals;
- `008-0402` review-before-apply workspace.

The cycle preserves current formulas and overhead semantics. Phase 4B scenario calibration and confidence policy remain outside this branch.

## Implemented increments

- Created issue #11, branch `feature/008-estimation-proposals`, and Draft PR #12.
- Added execution prompt `prompts/goal-008-phase-4a-estimation-proposals.md`.
- Extended the existing `EstimationDraft` boundary with optional rule catalog, mappings, receipts, warnings, provenance, review fields, and unknown/exclusion metadata.
- Added a versioned local deterministic proposal rule catalog covering all current process step types.
- Added stable proposal IDs and input snapshot hashing.
- Added safe grouping that does not cross decision, exception, approval, integration, or AI boundaries.
- Added proposal generation with zero effort by default so missing effort is not invented.
- Added preview using existing project overhead percentages without mutating current activities.
- Added explicit-confirmation apply, selected-only mutation, stable proposal-to-activity mappings, apply receipt, and duplicate-apply guard.
- Added browser-local proposal persistence and audit entries.
- Added Project Studio proposal entry and review workspace.
- Added domain, persistence, and component tests for deterministic generation, traceability, review controls, preview, apply, receipts, duplicate protection, and legacy compatibility.

## Protected invariants

- `DEFAULT_OVERHEAD` is unchanged.
- Existing estimation equations are unchanged.
- Proposal generation never mutates activities.
- Unknown actor, system, and effort values remain explicit.
- Existing assessment, process, report, direct-route, static-export, and local-storage behavior remains in scope for regression validation.
- No dependency, backend, auth, database, workflow, or external transmission change is authorized.

## Verification status

- Remote diff and file-integrity inspection: completed.
- GitHub Actions: running against the published branch; final HEAD must be rechecked after documentation/test commits.
- Local complete gate: pending because this runtime cannot mount the macOS checkout or clone through outbound DNS.
- Browser QA: pending or must be recorded as explicit debt.

Required local commands:

- `npm ci`;
- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm audit --omit=dev --audit-level=high`;
- `npm run build`;
- `git diff --check`.

## Next gate

Resolve all CI and local validation findings, update issue #11 and Draft PR #12 with evidence, complete or explicitly accept browser debt, and stop before merge.
