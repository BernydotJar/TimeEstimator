# Goal — Feature 008 Phase 4A

Implement deterministic, traceable activity proposals and a review-before-apply workflow for TimeEstimator.

## Scope

- Complete tasks `008-0401` and `008-0402`.
- Generate versioned proposal drafts from the active structured process and assessment.
- Preserve stable IDs, input snapshot hash, rule catalog version, provenance, source references, assumptions, unknowns, exclusions, and warnings.
- Allow edit, include, exclude, select, preview, explicit confirmation, and apply selected proposals only.
- Persist proposal-to-activity mappings and apply receipts.
- Detect duplicate application of the same proposal-set version.

## Formula freeze

- Preserve `DEFAULT_OVERHEAD` and all current equations.
- Do not introduce multipliers, confidence weights, scenario calibration, or formula migration.
- Proposal effort starts unknown/zero until explicitly reviewed.
- Impact preview must reuse current project overhead semantics and must not mutate activities.

## Compatibility

- Keep `te_projects` readable.
- Use additive optional fields and existing `Project.discovery.estimationDrafts`.
- Preserve current activities, assessments, processes, reports, direct project route, static export, and deterministic AI fallbacks.
- No backend, external transmission, new dependency, or workflow change.

## Required gates

Run `npm ci`, typecheck, lint, Jest, production audit, build, and `git diff --check`. Inspect the diff for formulas, dependencies, secrets, PII, personal paths, and unreviewed mutations. Complete browser QA when available or record concrete debt.

## Git discipline

Work on `feature/008-estimation-proposals`, update issue #11, maintain a Draft PR, create focused commits, and never merge automatically.
