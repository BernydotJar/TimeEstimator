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
- Phase 4A: `REVIEW`; implementation is published in Draft PR #12 and automated gates pass.

## Phase 4A objective

Completed for review:

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
- Existing assessment, process, report, direct-route, static-export, and local-storage behavior remains protected by regression validation.
- No dependency, backend, auth, database, workflow, or external transmission change was introduced.

## Automated verification

GitHub Actions run `29394527214` completed successfully against implementation HEAD `2096ac9d8177a2a9256bc8de694a55a16c3c7819` before this documentation reconciliation:

- checkout and Node setup — PASS;
- dependency installation — PASS;
- typecheck — PASS;
- lint — PASS;
- tests — PASS;
- production dependency audit — PASS;
- static build — PASS.

Remote diff and file-integrity inspection found no dependency, workflow, formula, secret, PII, or personal-path changes in scope.

## Runtime clarification

This execution runtime does not mount the user's macOS checkout at `/Users/eduardosacahui/Github-Repos/TimeEstimator`. A direct `git ls-remote` attempt from this specific container also returned a DNS resolution error for `github.com`. This is an environment-specific limitation, not a general limitation of ChatGPT, Codex, GitHub access, or other execution environments. Repository implementation and verification continued through the connected GitHub app and GitHub Actions.

## Remaining review debt

- Direct browser QA at 320px, 390px, 768px, and desktop.
- Keyboard navigation, focus visibility, confirmation behavior, screen-reader labeling, and responsive overflow confirmation in a real browser.
- Final GitHub Actions recheck after this documentation reconciliation commit.

## Next gate

Confirm the final reconciliation HEAD remains green, complete or explicitly accept browser QA debt, review Draft PR #12, and stop before merge. Phase 4B must not begin until Phase 4A is merged into `main`.