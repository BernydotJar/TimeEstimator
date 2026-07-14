# Review — 003 Cinematic n8n integration

## Status

`review`

## Pull request

PR #4: `feature/cinematic-n8n-integration` → `main`

The PR remains Draft. No merge, deployment, superseded-PR closure, or branch
deletion is included in this review cycle.

## Summary

Feature 003 consolidates the cinematic Command Center from PR #2 with the
static n8n runtime, browser persistence, security controls, test infrastructure,
and GitHub Pages build workflow from PR #3.

The root route is a cinematic project command deck. Each project opens a
cinematic `/project?id=...` workspace with executive metrics, guided activity
entry, process-step import, n8n configuration, deterministic fallbacks,
assumption/risk surfacing, overhead defaults, activity ledger, and reports.

## Hydration incident and correction

The attempted hydration fix at commit `97dc283` truncated
`src/app/project/ProjectPageClient.tsx` to an incomplete import and caused:

```text
TS1128: Declaration or statement expected
```

The corrected implementation restores the workspace and uses the explicit
`hydrated` state from `useLocalStorage`:

1. server render and first client render show the same loading surface;
2. no `window` or `localStorage` read occurs during render;
3. the persisted project is resolved only after hydration;
4. unknown or missing IDs redirect only after hydration;
5. corrupt stored JSON falls back safely and then redirects.

Added test coverage verifies persisted project loading, activity recalculation,
persistence, delayed invalid-ID redirect, and corrupt-storage fallback.

## Functional invariants

The formulas remain unchanged:

```text
base = sum(activity effort)
core = sum(core activity effort)
supervised = sum(supervised activity effort)
each overhead = base × configured percentage
grand total = base + all overhead components
```

Genkit and Firebase remain absent from the static runtime. Missing or
unreachable n8n endpoints use deterministic local behavior and do not erase
browser-local project data.

## Automated verification

GitHub Actions pull-request run `29280890782` completed successfully on branch
head `b0d791e`:

```text
dependency installation       PASS
npm run typecheck             PASS
npm run lint                  PASS
npm test                      PASS
npm audit --omit=dev          PASS
GitHub Pages static build     PASS
deploy                        SKIPPED — pull-request branch
```

## Code-level QA preflight

Observed in code:

- responsive dashboard and project grids use phone-first breakpoints;
- project action controls remain visible on phone widths;
- Radix dialogs provide focus trapping, Escape close, and focus restoration;
- report dialog has a viewport-height limit and vertical scrolling;
- focus rings are defined for dialog close and form controls;
- `prefers-reduced-motion` disables meaningful animation and smooth scrolling;
- PNG export uses `html2canvas` against the full report container;
- Print/PDF invokes `window.print()` while the report is hosted inside a dialog.

This inspection explains likely failure modes but is not a substitute for visual
observation.

## Manual browser evidence

### Passed

- [x] Open a valid `/project?id=<id>` URL directly after browser-storage hydration.

### Reproducible defects

#### RPT-001 — Print/PDF unusable

Observed behavior: Print / PDF does not produce a usable, correctly paginated
stakeholder report.

Required behavior: use an isolated printable surface, exclude application and
dialog chrome, support A4/Letter, apply semantic page breaks, and preserve
readable tables and charts across multiple pages.

#### RPT-002 — Save PNG excessively tall

Observed behavior: Save PNG captures the complete report as one long vertical
image. The result is not a bounded executive report and becomes difficult to
read or share.

Required behavior: export a purpose-built, bounded executive-summary surface.
The full report belongs in multipage PDF, not one infinitely tall PNG.

These observed defects supersede the earlier expectation that print-only CSS and
capture-background settings were sufficient.

## Remaining manual QA checklist

Required before changing PR #4 from Draft to Ready for review:

- [ ] Dashboard at desktop width.
- [ ] Dashboard at tablet width.
- [ ] Dashboard at phone width.
- [ ] Project workspace at desktop width.
- [ ] Project workspace at tablet width.
- [ ] Project workspace at phone width.
- [ ] Create project, open it, refresh, and confirm persistence.
- [x] Open a valid `/project?id=...` URL directly.
- [ ] Confirm an unknown ID redirects only after the loading state.
- [ ] Theme toggle and contrast in both themes.
- [ ] Create, rename, delete, AI integration, overhead, and report dialogs.
- [ ] Keyboard Tab/Shift+Tab, visible focus, Escape close, and focus restoration.
- [ ] Long dialog content scrolls without trapping inaccessible controls.
- [ ] Deterministic AI fallback copy and process-step import.
- [ ] Replace and verify Save PNG behavior against RPT-002.
- [ ] Replace and verify Print/PDF behavior against RPT-001.

## Relationship to Feature 008

Feature `008-project-assessment-estimation-documentation` specifies the broader
Project Discovery & Estimation Studio and includes the target export architecture.
Feature 003 remains blocked from completion by the current defects. Creating
Feature 008 specs does not mark Feature 003 done and does not authorize code
changes.

## Decision

`REVIEW`

Keep Feature 003 in `review` and PR #4 in Draft until the remaining browser QA
and both export defects pass. PR #2 and PR #3 remain open for traceability until
PR #4 is approved.