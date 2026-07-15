# Current Progress

## Selected feature

`008-project-assessment-estimation-documentation`

Status: `in_progress`

Mode: `SHIP`

Implementation branch: `feature/008-report-export-architecture`

Base: `main` after Phases 5–6 merge commit `537b4aef9e00facedd45923ea6e7da1eae9d2cdb`

Tracking issue: `#15 Feature 008 Phases 7–8 — Report architecture and bounded exports`

Draft PR: `#16 feat: add bounded report and print export architecture`

## Lifecycle

- Feature 003: `blocked`; historical RPT-001/RPT-002 closure still requires real artifact inspection.
- Feature 008: `in_progress`.
- Phases 1–3: `PASS`.
- Phase 4A: `PASS`.
- Phase 4B: not implemented in this branch.
- Phases 5–6: `PASS`; PR #14 merged into `main` at `537b4aef9e00facedd45923ea6e7da1eae9d2cdb`.
- Phases 7–8: `REVIEW` in Draft PR #16; automated gates pass.

## Completed scope for review

- `008-0701` one normalized report model drives all report outputs.
- `008-0702` dedicated static-compatible print route/root.
- `008-0703` page-break, table, and print policies.
- `008-0801` fixed executive-summary template.
- `008-0802` PNG captures only the summary root.
- `008-0803` loading, progress, failure, and deterministic filename handling.

## Implemented increments

- Added a deterministic `ReportViewModel` that centralizes existing base, overhead, grand-total, core, supervised, distribution, activity, risk, assumption, integration, artifact, and traceability values.
- Preserved unavailable scenarios and unapproved confidence as explicit pending states; no range or score is invented.
- Added a bounded `ExecutiveSummaryCard` with a 960×1200 logical box, top-N content, and `+N more` indicators.
- Added PNG export using only the executive-summary node, `html2canvas` at 1.5 scale, `canvas.toBlob()`, and a deterministic sanitized filename capped at 96 characters.
- Added accessible PNG stages: preparing, capturing, saving, success, and actionable failure.
- Added an isolated `/report?id=<project-id>` route that waits for browser-storage hydration and rejects missing projects or empty activity sets before printing.
- Added explicit Print / Save PDF action; no print is triggered before readiness.
- Added a controlled light print surface, toolbar hidden under print media, A4/Letter-compatible margins, page-break boundaries, repeated table headers, reduced print columns, and long-text wrapping.
- Refactored `ReportDialog` so preview, PNG, and Print/PDF consume the same report model instead of capturing the modal report body.
- Added domain and component tests for formulas, filenames, bounded content, semantic print output, hydration, invalid route states, and explicit print behavior.
- Added execution prompt `prompts/goal-008-phases-7-8-report-export.md`.

## Protected invariants

- Current formulas and `DEFAULT_OVERHEAD` are unchanged.
- Components consume normalized values and do not independently recalculate business totals.
- No scenario multipliers, confidence weights, or hidden values were introduced.
- PNG excludes the full activity table, process list, shell, dialog controls, overlay, and navigation.
- Print/PDF renders outside the dialog portal and app shell.
- No dependency, workflow, backend, database, authentication, or external data-transfer change was introduced.
- Browser-local `te_projects` remains the report data source.

## Automated verification

GitHub Actions run `29397785995` passed against implementation and tracking HEAD `83d226b49be0a2393ecd220c31dda5ee64c8afb0`:

- dependency installation — PASS;
- typecheck — PASS;
- lint — PASS;
- tests — PASS;
- production dependency audit — PASS;
- static export build — PASS.

A final Actions recheck is required for this review-status documentation-only commit.

## Remaining review debt

- `git diff --check` in a synchronized checkout.
- Real-browser generation and inspection of representative 1440×1800-or-smaller PNG files.
- Chromium Print Preview and opened saved PDF inspection for A4 and Letter.
- Long-table pagination with 50 and 250 activities.
- Firefox or Safari second-engine print check where available.
- Mobile/keyboard/focus/live-region verification.

## Next gate

Confirm the final documentation-only HEAD remains green, complete or explicitly accept artifact/browser debt, review Draft PR #16, and stop before merge.
