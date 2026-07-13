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

Final branch-head gate, GitHub Actions run `29258666907` on head
`218765f`:

- dependency installation: passed;
- `npm run typecheck`: passed;
- `npm run lint`: passed;
- `npm test`: passed;
- `npm audit --omit=dev`: passed;
- static GitHub Pages build: passed;
- deployment: intentionally skipped for the pull-request branch.

A print-only stylesheet was also added and loaded so `Print / PDF` isolates the
report content. The final branch-head CI completed successfully after the print
and review-document updates.

## Verification debt

The current execution environment has no interactive browser and cannot perform
an honest visual/export observation. The following human checks remain:

- dashboard at desktop, tablet, and phone widths;
- project workspace at desktop, tablet, and phone widths;
- create/open/refresh persistence in a real browser;
- theme toggle and contrast;
- dialogs, keyboard focus, Escape behavior, and scrolling;
- PNG file generation and visual inspection;
- print preview/PDF pagination and content isolation.

A public n8n endpoint is not required to validate deterministic fallback behavior.
Validation against a real public n8n workflow remains optional integration debt
until an approved endpoint is available.

## Remaining review gate

PR #4 must remain Draft until the browser QA checklist above passes. Do not merge,
close PR #2/#3, delete branches, or mark Feature 003 `done` before that gate.
