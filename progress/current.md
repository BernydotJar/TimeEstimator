# Current Progress

## Active feature

`003-cinematic-n8n-integration`

Status: `review`

Mode: `SHIP`

## Current state

Integration implementation is complete on branch:

`feature/cinematic-n8n-integration`

Consolidated review: PR #4

Feature 002 remains blocked because feature 003 now consolidates its cinematic
experience with the verified n8n/Pages runtime from PR #3. Feature 003 remains
in review and is not marked `done`.

## Approved integration scope

- Preserve the cinematic Command Center and harness from PR #2.
- Integrate the n8n runtime, deterministic fallbacks, persistence, tests,
  security controls, and static Pages workflow from PR #3.
- Resolve shared UI files manually rather than accepting either branch wholesale.
- Preserve current estimation formulas and activity data semantics.
- Validate the local-storage hydration lifecycle before closing the feature.

## Preserved behavior

The effort formulas are preserved:

- total effort = sum of activity effort;
- core effort = sum of activities marked `core`;
- supervised effort = sum of activities marked `supervised`;
- overheads = total effort multiplied by configured percentages;
- grand total = total effort + contingency + delivery support overheads.

## Hydration correction

The first hydration correction commit (`97dc283`) accidentally truncated
`src/app/project/ProjectPageClient.tsx` and caused TypeScript error `TS1128`.
The page was restored and the final behavior now:

- renders the same loading tree before browser storage hydration;
- reads projects only after `hydrated` is true;
- opens a persisted `/project?id=...` workspace after hydration;
- redirects a missing or unknown project only after hydration;
- handles corrupt `localStorage` by falling back safely.

Automated tests cover persisted loading, deferred invalid-ID redirect, corrupt
storage fallback, activity entry, recalculation, and persistence.

## Verification evidence

Current PR #4 head is `b0d791e`.

- pull-request workflow `29280890782`: passed;
- dependency installation: passed;
- `npm run typecheck`: passed;
- `npm run lint`: passed;
- `npm test`: passed;
- `npm audit --omit=dev`: passed;
- static GitHub Pages build: passed;
- deployment: intentionally skipped for the pull-request branch.

## Manual browser findings

The direct project URL `/project?id=<id>` works correctly after hydration.

Two reproducible export defects remain and block Feature 003 closure:

- **RPT-001 — Print/PDF:** the current Print / PDF flow does not produce a
  usable, correctly paginated report.
- **RPT-002 — Save PNG:** the current export captures the full report as one
  excessively tall image rather than a bounded report surface.

These findings supersede the earlier code-level expectation that the print
stylesheet alone was sufficient. Code inspection is not a substitute for
artifact inspection.

## Remaining Feature 003 review gate

PR #4 must remain Draft. Feature 003 must remain `review` until the required
browser checks and both export defects are resolved and re-verified. Do not
merge, close PR #2/#3, delete branches, or mark Feature 003 `done` before that
gate.

## Queued specification

Feature `008-project-assessment-estimation-documentation` is now `spec_ready` on
branch:

`spec/008-project-assessment-estimation-documentation`

Working title: **Project Discovery & Estimation Studio**.

The specification defines:

- a structured consulting assessment;
- a persistent process graph with stable steps and edges;
- review-before-apply activity proposals;
- explainable optimistic, expected, and conservative estimates;
- traceability from evidence to calculations and generated documentation;
- current-state and future-state flow documentation;
- a bounded executive-summary PNG;
- a dedicated multipage Print/PDF surface.

Feature 008 is documentation only and requires explicit human approval before
implementation. Feature 003 remains the only active lifecycle item.